import { Ray, UniversalCamera, Vector3, MeshBuilder, StandardMaterial,
		Color3 } from "@babylonjs/core";
import { scene, worldCanvas, keybinds, directions } from "./world";
import { socket } from "./networking";

export class Player {
	constructor(scene, id, username) {
		this.id = id;
		this.username = username;
		this.velocity = scene.gravity;
		this.acceleration = new Vector3(0, 0, 0);
		this.walkSpeed = 10;
		this.sprintSpeed = 30;
		this.jumpforce = 0.5;
		this.mouseSensitivity = 70;
		this.maxHealth = 100;
		this.health = 100;
		this.pickingRay = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0), 500);
		this.initCamera();
	}
	update() {
		this.velocity.addInPlace(this.acceleration);
		this.acceleration.scaleInPlace(0);

		this.pickingRay.origin = this.camera.position;
		let v = Vector3.TransformCoordinates(directions.forward, this.camera.getWorldMatrix());
		this.pickingRay.direction = v.subtract(this.camera.position);
		this.pPickingInfo = this.pickingInfo;
		this.pickingInfo = scene.pickWithRay(this.pickingRay);

		if (socket.loggedIn){
			socket.emit("position", this.camera.position.asArray());
			this.camera.pPosition = this.camera.position.clone();
		}
	}
	applyAcceleration(acceleration) {
		this.acceleration.addInPlace(acceleration);
	}
	initCamera() {
		let camera = new UniversalCamera("playerCamera", new Vector3(0, 300, 0), scene);
		camera.attachControl(worldCanvas, true);
		camera.minZ = 0.01;
		camera.inertia = 0.5;
		camera.applyGravity = true;
		camera.checkCollisions = true;
		camera._needMoveForGravity = true;
		camera.angularSensibility = (100 - this.mouseSensitivity) * 100;
		camera.speed = this.walkSpeed;

		let keyboardInput = camera.inputs.attached.keyboard;
		keyboardInput.keysUp = [keybinds.moveForward];
		keyboardInput.keysDown = [keybinds.moveBackward];
		keyboardInput.keysLeft = [keybinds.moveLeft];
		keyboardInput.keysRight = [keybinds.moveRight];

		camera.onCollide = (collidedMesh) => { //TODO: figure out better alternative
			this.velocity.y = 0;
		}

		camera.pPosition = camera.position.clone();

		this.camera = camera;
	}
}

export class Enemy {
	constructor(scene, id, name) {
		this.id = id;
		this.name = name;
		this.mesh = MeshBuilder.CreateCapsule(id, {
			height: 4,
			radius: 1,
		}, scene);
		let material = new StandardMaterial(id, scene);
		material.ambientColor = new Color3(Math.random(), Math.random(), Math.random());
		this.mesh.material = material;
		// this.mesh = MeshBuilder.CreateSphere(id, {
		// 	diameterX: 1.5,
		// 	diameterY: 3,
		// 	diameterZ: 1.5
		// }, scene);
	}
}