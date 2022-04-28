const express = require("express");
const Peer = require("simple-peer");
// const Peer = require("peerjs");
const wrtc = require("wrtc");
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
	socket.loggedIn = false;
	socket.emit("serverConnected", {
		onlineCount: io.engine.clientsCount,
		roomData,
	});

	socket.on("serverHostRequest", (name, room, remoteSdp, signalLocalSdp) => {
		if (!room){
			room = "globalRoom" + globalRoomCount;
			if (roomData[room] && roomData[room] >= globalRoomMaxClients - 1) {
				++globalRoomCount;
			}
		}
		name =  name ? name : "Guest" + Math.floor(Math.random() * 100);

		socket.join(room);
		updateRoomData();
		let sockets = getSocketsOf(room);
		for (let s of sockets){
			if (s.peer && s.peer.client && s.peer.client.loggedIn){
				s.emit("enemyJoined", socket.id, name);
			}
		}

		let peer = new Peer({ wrtc: wrtc });

		peer.signal(remoteSdp);
		peer.on("signal", (localSdp) => {
			signalLocalSdp(localSdp);
		});
		peer.on("connect", () => {
			peer.client = {
				socket,
				loggedIn: true,
				roomname: room, 
				username: name,
				position: {
					_dirty: true,
					value: [0, 0, 0]
				},
			};
		});
		peer.on("data", (data) => {
			data = JSON.parse(data.toString());

			switch(data.type) {
				case "position":
					let position = peer.client.position;
					position._dirty = true;
					position.value = data.position;
			}
		});
		peer.on("error", (err) => {
			console.log(err.code);
			peer.destroy();
			socket.disconnect();
		});

		socket.peer = peer;
	});

	socket.on("requestEnemyInit", (sendEnemyData) => {
		let enemySockets = getSocketsOf(socket.peer.client.roomname);
		let enemyData = [];
		for (let s of enemySockets){
			enemyData.push([s.id, s.peer.client.username]);
		}
		sendEnemyData(enemyData);
	});

	socket.on("disconnect", () => {
		console.log(`${socket.id} disconnected`);
		if (socket.peer) {
			socket.to(socket.peer.client.roomname).emit("enemyLeft", socket.id);
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
	for (let sid of ids) {
		sockets.push(io.of("/").sockets.get(sid));
	}
	return sockets;
}
function updatePositions() {
	for (let room of Object.keys(roomData)) {
		let sockets = getSocketsOf(room);
		let positions = [];
		for (let socket of sockets) {
			if (socket.peer && socket.peer.client && socket.peer.client.position._dirty) {
				positions.push({
					id: socket.id,
					value: socket.peer.client.position.value
				});
				socket.peer.client.position._dirty = false;
			}
		}
		for (let socket of sockets) {
			if (socket.peer && socket.peer.client && socket.peer.client.loggedIn) {
				socket.peer.send(JSON.stringify({
					type: "position",
					value: positions
				}));
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