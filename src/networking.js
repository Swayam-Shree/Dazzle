import Peer from "simple-peer";
// import Peer from "peerjs";
import Cookies from "js-cookie";
import { p5Login } from "./login";
import { worldInit, enemyIdMap } from "./world";

export let socket;
export let peer;

let host = false;
let roomData = {}; // {room: count}

export let username = "";
export let roomname = "";

export function networkInit() {
	socket = io();

	socket.on("serverConnected", (data) => {
		p5Login.online_counter = data.onlineCount - 1; // excluding self
		roomData = data.roomData;

		let room = Cookies.get("room");
		let name = Cookies.get("name");
		if (room) {
			login(room, name);
			Cookies.remove("room");
			Cookies.remove("name");
		}
	});
	socket.on("serverData", (data) => {
		p5Login.online_counter = data.onlineCount - 1; // excluding self
		roomData = data.roomData;
	});
	socket.on("disconnect", () => {
		if (peer) {
			peer.destroy();
		}
	});
}

export function login(room, name) {
	roomname = room;
	username = name;

	if (p5Login.serverHost) {
		peer = new Peer({
				initiator: true,
				trickle: false,
				reconnectTimer: 10000
			});
		peer.on("signal", (localSdp) => {
			socket.emit("serverHostRequest", name, room, localSdp, (remoteSdp) => {
				peer.signal(remoteSdp);
			});
		});
		peer.on("connect", () => {
			peer.loggedIn = true;
			p5Login.remove();
			worldInit();
		});
		peer.on("data", (data) => {
			data = JSON.parse(data.toString());
		
			switch(data.type) {
				case "position":
					for (let position of data.value){
						let enemy = enemyIdMap[position.id];
						if (enemy) {
							let value = position.value;
							enemy.mesh.position.set(value[0], value[1], value[2]);
						}
					}
			}
		});
	}
	else{
		host = true;
	}
}

function roomExists(room) {
	return roomData.hasOwnProperty(room);
}