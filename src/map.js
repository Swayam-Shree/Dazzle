import { GLTFFileLoader } from "@babylonjs/loaders";
import { SceneLoader, Color3, StandardMaterial, DynamicTexture } from "@babylonjs/core";
import p5 from "p5";
import { mouseStatus, player } from "./world";

let mapSize = 1000;
let mapTextureResolutionMultipler = 2;

export function loadMap(scene) {
	let map = [];
	for (let j = 0; j < 1; j++) {
		for (let k = 0; k < 1; k++) {
			SceneLoader.ImportMesh("", "./models/", "map.gltf", scene, (meshes) => {
				for (let i = 1; i < meshes.length; i++) {
					let mesh = meshes[i];
					mesh.position.scaleInPlace(mapSize);
					mesh.scaling.scaleInPlace(mapSize);
					mesh.checkCollisions = true;

					mesh.position.x += j * 500;
					mesh.position.z += k * 500;

					map.push(new P5TexturedMesh(mesh));
				}
			});
		}
	}
	return map;
}

class P5TexturedMesh {
	static p5Ctx = new p5((tex) => { });

	constructor(mesh) {
		this.mesh = mesh;
		let pCtx = P5TexturedMesh.p5Ctx;
		let size = this.mesh.getBoundingInfo().boundingBox.extendSizeWorld.scaleInPlace(mapSize * mapTextureResolutionMultipler);

		let t = [];
		if (size.x > size.y || size.x > size.z) { t.push(size.x); }
		if (size.y > size.x || size.y > size.z) { t.push(size.y); }
		if (size.z > size.x || size.z > size.y) { t.push(size.z); }

		this.pGraphic = pCtx.createGraphics(t[0], t[1], pCtx.P2D);

		let material = new StandardMaterial(mesh.name + "Material", mesh.getScene());
		material.diffuseTexture = new DynamicTexture(mesh.name + "Texture", this.pGraphic.elt, mesh.getScene());
		material.ambientColor = new Color3(1, 1, 1);
		this.mesh.material = material;

		this.bgColor = pCtx.random(20, 100);
		this.pGraphic.background(this.bgColor);
		this.pGraphic.stroke(255);
		this.pGraphic.strokeWeight(1);
	}
}
P5TexturedMesh.prototype.updateTexture = function () {
	if (player.pickingInfo && player.pPickingInfo && player.pickingInfo.hit && player.pPickingInfo.hit &&
		player.pickingInfo.pickedMesh.name === this.mesh.name && player.pPickingInfo.pickedMesh.name === this.mesh.name) {
		if (mouseStatus.left) {
			let p = player.pickingInfo.getTextureCoordinates();
			let pp = player.pPickingInfo.getTextureCoordinates();
			if (!p.equals(pp)) {
				this.pGraphic.line(p.x * this.pGraphic.width, (1 - p.y) * this.pGraphic.height, pp.x * this.pGraphic.width, (1 - pp.y) * this.pGraphic.height);
			}
		}
		if (mouseStatus.right) {
			this.pGraphic.background(this.bgColor);
		}
	}

	this.mesh.material.diffuseTexture.update();
}