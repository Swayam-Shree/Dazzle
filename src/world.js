import { Engine, Scene, Vector3, KeyboardEventTypes, Color3 } from "@babylonjs/core";
import { Player, Enemy } from "./player";
import { loadMap } from "./map";
import { hudInit, p5Hud } from "./hud";
import { socket, username } from "./networking";
import { coordsNearScreenCenter } from "./util";

export let worldCanvas, engine, scene, keybinds, mouseStatus, directions,
	player, worldMap, gravityAcceleration, frameCount;

export let enemies = [];
export let enemyIdMap = {};

export function worldInit() {
	worldCanvas = document.createElement("canvas");
	worldCanvas.id = "worldCanvas";
	worldCanvas.style.width = "100%";
	worldCanvas.style.height = "100%";
	worldCanvas.style.position = "absolute";
	worldCanvas.style.left = "0px";
	worldCanvas.style.top = "0px";
	document.body.appendChild(worldCanvas);

	engine = new Engine(worldCanvas);

	scene = new Scene(engine);
	scene.collisionsEnabled = true;
	scene.skipPointerMovePicking = true
	scene.gravity = new Vector3(0, 0, 0);
	scene.ambientColor = new Color3(1, 1, 1);

	keybinds = {
		moveForward: 87,
		moveBackward: 83,
		moveLeft: 65,
		moveRight: 68,
		jump: " ",
		sprint: "Shift",
		chatboxToggle: "v"
	};

	mouseStatus = {
		left: false,
		right: false
	};

	directions = {
		forward: new Vector3(0, 0, 1),
		backward: new Vector3(0, 0, -1),
		left: new Vector3(-1, 0, 0),
		right: new Vector3(1, 0, 0),
		up: new Vector3(0, 1, 0),
		down: new Vector3(0, -1, 0)
	};

	player = new Player(scene, socket.id, username);

	socket.emit("requestEnemyInit", (enemyData) => {
		let _enemies = [];
		for (let data of enemyData) {
			if (data[0] === socket.id) continue;
			let enemy = new Enemy(scene, data[0], data[1]);
			enemy.mesh.position.fromArray(data[2]);
			enemy.mesh.material.ambientColor.fromArray(data[3]);
			_enemies.push(enemy);
			enemyIdMap[data[0]] = enemy;
		}
		enemies = _enemies;
	});
	socket.on("enemyJoined", (id, name) => {
		let enemy = new Enemy(scene, id, name);
		enemies.push(enemy);
		enemyIdMap[id] = enemy;
		p5Hud.chatbox.add_notification(`${name} joined`);
	});
	socket.on("enemyLeft", (id) => {
		let enemy = enemyIdMap[id];
		enemy.mesh.dispose();
		enemies.splice(enemies.indexOf(enemy), 1);
		p5Hud.chatbox.add_notification(`${enemyIdMap[id].name} left`);
		delete enemyIdMap[id];
	});

	worldMap = loadMap(scene);

	gravityAcceleration = new Vector3(0, -0.04, 0);

	hudInit();

	scene.onBeforeRenderObservable.add(() => {
		player.update();
		worldMap.forEach(texturedMesh => { texturedMesh.update(); });
	});
	engine.runRenderLoop(() => {
		scene.render();
	});

	scene.onKeyboardObservable.add((kbInfo) => {
		switch (kbInfo.type) {
			case KeyboardEventTypes.KEYDOWN:
				switch (kbInfo.event.key) {
					case keybinds.jump:
						player.jump();
						break
					case keybinds.sprint:
						player.camera.speed = player.sprintSpeed;
						break;
					case keybinds.chatboxToggle:
						if (engine.isPointerLock) {
							p5Hud.chatbox.on = !p5Hud.chatbox.on;
							if (p5Hud.chatbox.on) {
								p5Hud.chatbox.unread_counter = 0;
							}
						}
				}
				break;
			case KeyboardEventTypes.KEYUP:
				switch (kbInfo.event.key) {
					case keybinds.sprint:
						player.camera.speed = player.walkSpeed;
						break;
				}
				break;
		}
	});

	window.addEventListener("resize", () => {
		engine.resize();
	});
	window.addEventListener("mousedown", (event) => {
		if (event.button === 0) {
			mouseStatus.left = true;
			if (coordsNearScreenCenter(event.clientX, event.clientY)) {
				engine.enterPointerlock();
			}
			p5Hud.chatbox.clicked();
		}
		if (event.button === 2) {
			mouseStatus.right = true;
		}
	});
	window.addEventListener("mouseup", (event) => {
		if (event.button === 0) {
			mouseStatus.left = false;
			if (coordsNearScreenCenter(event.clientX, event.clientY)) {
				worldCanvas.focus();
			}
		}
		if (event.button === 2) {
			mouseStatus.right = false;
		}
	});
}