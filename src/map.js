import { GLTFFileLoader } from "@babylonjs/loaders";
import { SceneLoader, Color3, StandardMaterial, DynamicTexture,
		AbstractMesh } from "@babylonjs/core";
import p5 from "p5";
import { mouseStatus, player } from "./world";
import { socket } from "./networking";
import { p5Hud } from "./hud";

let mapSize = 1000;
let mapTextureResolutionMultipler = 5;

export function loadMap(scene) {
	let map = [];
	SceneLoader.ImportMesh("", "./models/", "map.gltf", scene, (meshes) => {
		for (let i = 1; i < meshes.length; ++i) {
			let mesh = meshes[i];
			mesh.position.scaleInPlace(mapSize);
			mesh.scaling.scaleInPlace(mapSize);
			mesh.checkCollisions = true;

			map.push(new P5TexturedMesh(mesh));
		}
	});
	return map;
}

export class P5TexturedMesh {
	static p5Ctx = new p5((tex) => { });
	static textureIndexMap = {};
	static _index = 0;

	constructor(mesh) {
		this.mesh = mesh;
		this.index = P5TexturedMesh._index;
		++P5TexturedMesh._index;

		P5TexturedMesh.textureIndexMap[this.index] = this;

		let pCtx = P5TexturedMesh.p5Ctx;

		let size = this.mesh.getBoundingInfo().boundingBox.extendSizeWorld.clone().scaleInPlace(mapSize * mapTextureResolutionMultipler);
		// texture alignment
		let t;
		switch (Math.min(size.x, size.y, size.z)) {
			case size.x:
				if (size.y > size.z) { t = [size.z, size.y]; }
				else { t = [size.y, size.z]; }
				break;
			case size.y:
				this.mesh.floor = true;
				t = [size.x, size.z];
				break;
			case size.z:
				if (size.x > size.y) { t = [size.x, size.y]; }
				else { t = [size.y, size.x]; }
				break;
		}
		this.pGraphic = pCtx.createGraphics(t[0], t[1], pCtx.P2D);

		let material = new StandardMaterial(mesh.name + "Material", mesh.getScene());
		material.diffuseTexture = new DynamicTexture(mesh.name + "Texture", this.pGraphic.elt, mesh.getScene());
		material.ambientColor = new Color3(1, 1, 1);
		material.freeze();
		this.mesh.material = material;

		this.bgColor = pCtx.random(50, 120);
		this.pGraphic.background(this.bgColor);
		this.updateTexture();

		this.mesh.cullingStrategy = AbstractMesh.CULLINGSTRATEGY_STANDARD;
		this.mesh.freezeWorldMatrix();
	}

	static execute(command){
		// format 
		// "type index position color size"
		// type: 0 - line

		command = command.split(" ");
		// command.forEach((value, i) => {command[i] = parseFloat(value)});
		let type = command[0];
		let index = command[1];
		let texturedMesh = P5TexturedMesh.textureIndexMap[index];
		let texture = texturedMesh.pGraphic;

		switch (type) {
			case "0":
				let px = command[2];
				let py = command[3];
				let x = command[4];
				let y = command[5];
				let r = command[6];
				let g = command[7];
				let b = command[8];
				let a = command[9];
				let size = command[10];

				texture.strokeWeight(size);
				texture.stroke(r, g, b, a);
				texture.line(px, py, x, y);
				break;
		}

		texturedMesh.updateTexture();
	}
}
P5TexturedMesh.prototype.updateTexture = function () {
	this.mesh.material.diffuseTexture.update();
}
P5TexturedMesh.prototype.update = function () {
	if (player.pickingInfo && player.pPickingInfo && player.pickingInfo.hit && player.pPickingInfo.hit &&
		player.pickingInfo.pickedMesh.name === this.mesh.name && player.pPickingInfo.pickedMesh.name === this.mesh.name) {
		if (mouseStatus.left) {
			let p = player.pickingInfo.getTextureCoordinates();
			let pp = player.pPickingInfo.getTextureCoordinates();
			if (!p.equals(pp)) {
				let type = 0;
				let px = p.x * this.pGraphic.width;
				let py = (1 - p.y) * this.pGraphic.height;
				let x = pp.x * this.pGraphic.width;
				let y = (1 - pp.y) * this.pGraphic.height;
				let r = player.color[0];
				let g = player.color[1];
				let b = player.color[2];
				let a = player.color[3];
				let size = p5Hud.colorPicker.size_slider.value;
				let command = `${type} ${this.index} ${px} ${py} ${x} ${y} ${r} ${g} ${b} ${a} ${size}`;
				P5TexturedMesh.execute(command);
				socket.emit("textureCommand", command);
			}
		}
		if (mouseStatus.right) { // temp
			this.pGraphic.background(this.bgColor);
			this.updateTexture();
		}
	}
}