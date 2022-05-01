import { Ray, UniversalCamera, Vector3, MeshBuilder, StandardMaterial,
		Color3 } from "@babylonjs/core";
import { scene, worldCanvas, keybinds, directions, gravityAcceleration } from "./world";
import { socket } from "./networking";
import { p5Hud } from "./hud";

export class Player {
	constructor(scene, id, username) {
		this.id = id;
		this.username = username;
		this.velocity = scene.gravity;
		this.acceleration = new Vector3(0, 0, 0);
		this.walkSpeed = 10;
		this.sprintSpeed = 30;
		this.jumpforce = 2;
		this.mouseSensitivity = 90;
		this.maxHealth = 300;
		this.health = 150;
		this.color = [0, 0, 0, 0];
		this.pColor = this.color.slice();
		this.pickingRay = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0), 1000);
		this.initCamera();
	}
	update() {
		this.applyAcceleration(gravityAcceleration);
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

		this.color = p5Hud.colorPicker.picker.color().levels;
		this.color[3] = p5Hud.colorPicker.alpha_slider.value;
		if (this.pColor[0] !== this.color[0] || this.pColor[1] !== this.color[1] || this.pColor[2] !== this.color[2] || this.pColor[3] !== this.color[3]) {
			socket.emit("color", this.color);
			this.pColor = this.color.slice();
		}
	}
	applyAcceleration(acceleration) {
		this.acceleration.addInPlace(acceleration);
	}
	jump() {
		this.velocity.y = 0;
		this.applyAcceleration(new Vector3(0, this.jumpforce, 0));
	}
	initCamera() {
		let camera = new UniversalCamera("playerCamera", new Vector3(0, 200, 0), scene);
		camera.attachControl(worldCanvas, true);
		camera.minZ = 0.01;
		camera.inertia = 0;
		camera.applyGravity = true;
		camera.checkCollisions = true;
		camera._needMoveForGravity = true;
		camera.angularSensibility = (101 - this.mouseSensitivity) * 100;
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
		material.ambientColor = new Color3(0, 0, 0);
		this.mesh.material = material;
	}
}
Enemy.prototype.setColor = function(array) {
	array.forEach( (value, i) => { array[i] = value / 255 } );
	this.mesh.material.ambientColor.fromArray(array);
}