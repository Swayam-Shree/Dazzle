import Cookies from "js-cookie";
import { p5Login } from "./login";
import { worldInit, enemyIdMap } from "./world";
import { P5TexturedMesh } from "./map";

export let socket;
export let username = "";
export let roomname = "";

let roomData = {}; // {room: count}

export function networkInit() {
	socket = io();

	socket.on("connect", () => {
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
	socket.on("enemyPositionsAndColors", (positions, colors) => {
		for (let position of positions){
			let enemy = enemyIdMap[position.id];
			if (enemy) {
				let value = position.value;
				enemy.mesh.position.set(value[0], value[1], value[2]);
			}
		}
		for (let color of colors){
			let enemy = enemyIdMap[color.id];
			if (enemy) {
				enemy.setColor(color.value.slice(0, 3));
			}
		}
	});
	socket.on("textureCommandBuffer", (buffer) => {
		let commands = buffer.split("\n");
		for (let command of commands){
			if (command){
				P5TexturedMesh.execute(command);
			}
		}
	});
	socket.on("disconnect", () => {
		// disconnect page
	});
}

export function login(room, name) {
	socket.emit("requestLogin", room, name, (room, name) => {
		roomname = room;
		username = name;
		socket.loggedIn = true;
		p5Login.remove();
		worldInit();
	});
}

function roomExists(room) {
	return roomData.hasOwnProperty(room);
}