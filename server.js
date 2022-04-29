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
let globalRoomCount = 0;
let globalRoomMaxClients = 10;

io.on("connection", (socket) => {
	console.log(`${socket.id} connected`);
	socket.emit("serverConnected", {
		onlineCount: io.engine.clientsCount,
		roomData,
	});

	socket.on("requestLogin", (room, name, acceptLogin) => {
		if (!room){
			room = "globalRoom" + globalRoomCount;
			if (roomData[room] && roomData[room] >= globalRoomMaxClients - 1) {
				++globalRoomCount;
			}
		}
		name =  name ? name : "Guest" + Math.floor(Math.random() * 100);
		
		// alert players in room of new player join
		for (let s of getSocketsOf(room)){
			s.emit("enemyJoined", socket.id, name);
		}

		socket.join(room);
		updateRoomData();
		
		socket.player = {
			roomname: room, 
			username: name,
			position: {
				_dirty: true,
				value: [0, 0, 0]
			},
		};

		acceptLogin(room, name);
	});

	socket.on("position", (position) => {
		if (socket.player){
			socket.player.position._dirty = true;
			socket.player.position.value = position;
		}
	});

	socket.on("requestEnemyInit", (sendEnemyData) => {
		let enemySockets = getSocketsOf(socket.player.roomname);
		let enemyData = [];
		for (let s of enemySockets){
			enemyData.push([s.id, s.player.username]);
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

	io.emit("serverData", {
		onlineCount: io.engine.clientsCount,
		roomData,
	});
}
function getSocketsOf(room){
	let ids = roomList[room];
	let sockets = [];
	if (ids){
		for (let sid of ids) {
			sockets.push(io.of("/").sockets.get(sid));
		}
	}
	return sockets;
}
function updatePositions() {
	for (let room of Object.keys(roomData)) {
		let sockets = getSocketsOf(room);
		let positions = [];
		for (let socket of sockets) {
			let position = socket.player ? socket.player.position : false;
			if (position && position._dirty) {
				positions.push({
					id: socket.id,
					value: position.value
				});
				position._dirty = false;
			}
		}
		for (let socket of sockets) {
			if (socket.player) {
				socket.emit("enemyPositions", positions);
			}
		}
	}
}

let fps = 60;
let lastFrameTime = performance.now();
setImmediate(update = () => {
	let currentFrameTime = performance.now();
	if (currentFrameTime - lastFrameTime > 1000/fps) {
		lastFrameTime = currentFrameTime;

		updatePositions();
	}
	setImmediate(update);
});