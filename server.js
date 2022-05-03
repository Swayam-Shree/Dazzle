const express = require("express");
const { Server } = require("socket.io");
const { performance } = require("perf_hooks");

const port = process.env.PORT || 127;

const app = express();

app.use(express.static(__dirname + "/dist"));

app.get("/:room/:name?", (req, res, next) => {
	res
		.cookie("room", req.params.room)
		.cookie("name", req.params.name ? req.params.name : "")
		.redirect("/");
});

const server = app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});

const io = new Server(server);

let roomData = {}; // {room: count}
let roomList = {}; // {room: [sids]}
let roomMap = {}; // {room: roomObject}
let globalRoomCount = 0;
let globalRoomMaxClients = 10;

io.on("connection", (socket) => {
	console.log(`${socket.id} connected`);
	broadcastRoomData();

	socket.on("requestLogin", (room, name, acceptLogin) => {
		if (!room) {
			room = "globalRoom" + globalRoomCount;
			if (roomData[room] && roomData[room] >= globalRoomMaxClients - 1) {
				++globalRoomCount;
			}
		}
		name = name ? name : "Guest" + Math.floor(Math.random() * 100);

		// alert players in room of new player join
		io.to(room).emit("enemyJoined", socket.id, name);

		socket.join(room);
		updateRoomData();

		socket.player = {
			roomname: room,
			username: name,
			position: {
				_dirty: true,
				value: [0, 0, 0]
			},
			color: {
				_dirty: true,
				value: [0, 0, 0, 0]
			}
		};

		acceptLogin(room, name);
	});

	socket.on("position", (position) => {
		if (socket.player) {
			socket.player.position._dirty = true;
			socket.player.position.value = position;
		}
	});
	socket.on("color" , (color) => {
		if (socket.player) {
			socket.player.color._dirty = true;
			socket.player.color.value = color;
		}
	});
	socket.on("textureCommand", (command) => {
		if (socket.player) {
			roomMap[socket.player.roomname].textureCommandBuffer += "\n" + command;
		}
	});
	socket.on("chat", (chat) => {
		if (socket.player) {
			socket.to(socket.player.roomname).emit("chat", chat);
		}
	});

	socket.on("requestEnemyInit", (sendEnemyData) => {
		let enemySockets = getSocketsOf(socket.player.roomname);
		let enemyData = [];
		for (let s of enemySockets) {
			enemyData.push([s.id, s.player.username, s.player.position.value, s.player.color.value]);
		}
		sendEnemyData(enemyData);
	});

	socket.on("disconnect", () => {
		console.log(`${socket.id} disconnected`);
		if (socket.player) {
			socket.to(socket.player.roomname).emit("enemyLeft", socket.id);
		}
		updateRoomData();
	});
});

io.of("/").adapter.on("create-room", (room) => {
	if (!io.of("/").adapter.sids.get(room)) {
		roomMap[room] = new Room(room);
	}
});
io.of("/").adapter.on("delete-room", (room) => {
	if (!io.of("/").adapter.sids.get(room)) {
		delete roomMap[room];
	}
});

function updateRoomData() {
	let _roomData = {};
	let _roomList = {};
	let sids = Array.from(io.of("/").adapter.sids.keys());
	for (let [room, ids] of io.of("/").adapter.rooms.entries()) {
		if (!sids.includes(room)) {
			_roomData[room] = ids.size;
			_roomList[room] = Array.from(ids);
		}
	}
	roomData = _roomData;
	roomList = _roomList;

	broadcastRoomData();
}
function broadcastRoomData() {
	io.emit("serverData", {
		onlineCount: io.engine.clientsCount,
		roomData,
	});
}
function getSocketsOf(room) {
	let ids = roomList[room];
	let sockets = [];
	if (ids) {
		for (let sid of ids) {
			sockets.push(io.of("/").sockets.get(sid));
		}
	}
	return sockets;
}
function updatePositionsAndColors() {
	for (let room of Object.keys(roomData)) {
		let sockets = getSocketsOf(room);
		let positions = [];
		let colors = [];
		for (let socket of sockets) {
			let position = socket.player ? socket.player.position : false;
			let color = socket.player ? socket.player.color : false;
			if (position && position._dirty) {
				positions.push({
					id: socket.id,
					value: position.value
				});
				position._dirty = false;
			}
			if (color && color._dirty) {
				colors.push({
					id: socket.id,
					value: color.value
				});
				color._dirty = false;
			}
		}
		io.to(room).emit("enemyPositionsAndColors", positions, colors);
	}
}
function clearTextureCommandBuffer() {
	for (let room of Object.keys(roomMap)) {
		let buffer = roomMap[room].textureCommandBuffer;
		if (buffer) {
			io.to(room).emit("textureCommandBuffer", buffer);
			roomMap[room].textureCommandBuffer = "";
		}
	}
}

class Room {
	constructor() {
		this.textureCommandBuffer = "";
	}
}

let fps = 60;
let lastFrameTime = performance.now();
setImmediate(update = () => {
	let currentFrameTime = performance.now();
	if (currentFrameTime - lastFrameTime > 1000 / fps) {
		lastFrameTime = currentFrameTime;

		updatePositionsAndColors();
		clearTextureCommandBuffer();
	}
	setImmediate(update);
});