import p5 from "p5";
import { Button, translatePoint } from "./p5ui"
import { login } from "./networking";

export let p5Login;

export function loginInit(){
	p5Login = new p5((sketch) => {
		sketch.setup = () => {
			sketch.canvas = sketch.createCanvas(window.innerWidth, window.innerHeight, sketch.P2D);
			sketch.canvas.position(0, 0);
			sketch.canvas.style("z-index", "0");

			sketch.serverHost = true;
	
			sketch.play_button = new Button(sketch, "Play", 40,
				() => {
					login(sketch.roombox.value(), sketch.textbox.value());
				},
				false, sketch.width / 2, sketch.height / 2, -5);
			sketch.play_button.w = 130;
	
			sketch.particles = [];
			sketch.allow_custom_room = false;
	
			sketch.room_button = new Button(sketch, "Create/Join room", 20,
				() => {
					sketch.allow_custom_room = true;
					sketch.room_button.s = "If the room exists you will join it, otherwise it will be created";
					sketch.windowResized();
				},
				false, 0, sketch.height * 0.95, 0);
			sketch.room_button.displaylikelink = true;
			for (let i = 0; i < 270; i++) {
				sketch.particles.push(new sketch.Particle(sketch.random(sketch.width), sketch.random(sketch.height)));
			}
	
			sketch.textbox = sketch.createInput();
			sketch.textbox.attribute("maxlength", "16");
			sketch.textbox.style("transform-origin", "0% 0%");
			sketch.textbox.style("border", "none");
			sketch.textbox.style("margin", "none");
			sketch.textbox.style("outline", "none");
			sketch.textbox.style("padding", "none");
			sketch.textbox.style("color", sketch.color(255, 0, 255));
			sketch.textbox.style("background-color", sketch.color(30));
			sketch.textbox.style("font-size", "36px");
			sketch.textbox.style("transform", "rotate(-2.5deg)");
			sketch.textbox.style("opacity", "0.4");
			sketch.textbox.xx = sketch.width / 2 - sketch.width / 6;
			sketch.textbox.yy = sketch.height / 2 - 75;
			sketch.textbox.w = 0;
			sketch.textbox.position(sketch.textbox.xx, sketch.textbox.yy);
			sketch.textbox.value(window.localStorage.getItem("userName") || "");
	
			sketch.roombox = sketch.createInput();
			sketch.roombox.hide();
			sketch.roombox.attribute("maxlength", "16");
			sketch.roombox.style("transform-origin", "0% 0%");
			sketch.roombox.style("border", "none");
			sketch.roombox.style("margin", "none");
			sketch.roombox.style("outline", "none");
			sketch.roombox.style("padding", "none");
			sketch.roombox.style("color", sketch.color(255, 0, 255));
			sketch.roombox.style("background-color", sketch.color(30));
			sketch.roombox.style("font-size", "36px");
			sketch.roombox.size(sketch.width / 5, 60);
			sketch.roombox.style("transform", "rotate(-2.5deg)");
			sketch.roombox.style("opacity", "0.4");
			sketch.roombox.xx = sketch.width * 0.25;
			sketch.roombox.yy = sketch.height * 2;
			sketch.roombox.w = 0;
			sketch.roombox.position(sketch.roombox.xx, sketch.roombox.yy);
	
			sketch.online_counter = 0;
			sketch.roomList = {};
			sketch.roomListButtons = [];
			sketch.windowResized();
		}
		sketch.windowResized = function () {
			sketch.resizeCanvas(window.innerWidth, window.innerHeight);
		}
		sketch.draw = function () {
			// if (disconnected) { makeDisconnect(); sketch.remove(); return; }
			sketch.play_button.setm(translatePoint(sketch.mouseX, sketch.mouseY, sketch.play_button.x, sketch.play_button.y, sketch.play_button.theta));
			sketch.room_button.setm(translatePoint(sketch.mouseX, sketch.mouseY, sketch.room_button.x, sketch.room_button.y, sketch.room_button.theta));
			sketch.background(10, 10, 14);
			for (let i = 0; i < sketch.particles.length; ++i) {
				sketch.particles[i].work();
				if (sketch.particles[i].outside()) sketch.particles[i].setit();
			}
			sketch.noStroke();
			sketch.fill(255, 0, 69);
			sketch.textSize(40);
			sketch.textAlign(sketch.CENTER, sketch.BOTTOM);
			sketch.push();
			sketch.translate(sketch.textbox.xx, sketch.textbox.yy + 8);
			sketch.rotate(sketch.radians(-2));
			sketch.text("Player Name:", 0, 0);
			sketch.pop();
			sketch.push();
			sketch.translate(sketch.roombox.xx, sketch.roombox.yy + 8);
			sketch.rotate(sketch.radians(-2));
			sketch.text("Room:", 0, 0);
			sketch.pop();
			sketch.textSize(22);
			sketch.fill(255, 0, 69);
			sketch.textAlign(sketch.RIGHT, sketch.TOP);
			sketch.text("Online:" + sketch.online_counter, sketch.width - 2, 0);
			sketch.textAlign(sketch.LEFT, sketch.TOP);
			// if(sketch.rooms.length) sketch.text("Rooms (" + sketch.rooms.length + ")", 0, 0);
			let len = Object.keys(sketch.roomList).length;
			if (len) sketch.text("Rooms (" + len + ")", 2, 0);
			else sketch.text("Rooms - ", 2, 0);
			sketch.textSize(12);
			// for (let i = 0; i < sketch.rooms.length; i++) {
			// 	sketch.text(
			// 		sketch.rooms[i] + " - " , // PUT IN THE ROOM'S USER COUNT IN HERE TOO
			// 		0,
			// 		30 + (sketch.textAscent() + 5) * i
			// 	);
			// }
			// for (let roomName in sketch.roomList) {
			// 	sketch.text(roomName + " - " + sketch.roomList[roomName], 0, 30 + (sketch.textAscent() + 5) * n);
			// 	++n;
			// }
			if (len !== sketch.roomListButtons.length) {
				sketch.roomListButtons = [];
				let n = 0;
				for (let roomName in sketch.roomList) {
					let a = new Button(sketch,
						roomName,
						16,
						() => {
							sketch.roombox.value(roomName);
							sketch.allow_custom_room = true;
							sketch.room_button.s = "If the room exists you will join it, otherwise it will be created";
							sketch.windowResized();
						},
						false,
						0,
						30 + 25 * n,
						0
					);
					a.displaylikelink = true;
					a.c_outside = sketch.color(255, 0, 69);
					a.c_inside = sketch.color(255);
					++n;
					sketch.roomListButtons.push(a);
				}
			}
			for (let i = sketch.roomListButtons.length - 1; i > -1; --i) {
				sketch.roomListButtons[i].setm(translatePoint(mouseX, mouseY, sketch.roomListButtons[i].x, sketch.roomListButtons[i].y, sketch.roomListButtons[i].theta));
				sketch.roomListButtons[i].work();
				sketch.fill(sketch.roomListButtons[i].c);
				sketch.text(" - " + sketch.roomList[sketch.roomListButtons[i].s].userCount, sketch.roomListButtons[i].x + sketch.roomListButtons[i].w, sketch.roomListButtons[i].y + sketch.roomListButtons[i].h / 4);
				sketch.text(` - ${round(sketch.roomList[sketch.roomListButtons[i].s].historySize, 2)} mb`, sketch.roomListButtons[i].x + sketch.roomListButtons[i].w + 20, sketch.roomListButtons[i].y + sketch.roomListButtons[i].h / 4);
			}
			sketch.play_button.s = sketch.roomList[sketch.roombox.value()] ? "Join" : "Play";
			sketch.play_button.work();
			sketch.room_button.work();
			if (sketch.allow_custom_room) {
				sketch.textbox.xx = sketch.lerp(sketch.textbox.xx, sketch.width * 0.25, 0.1);
				sketch.textbox.yy = sketch.lerp(sketch.textbox.yy, sketch.height * 0.38, 0.1);
				sketch.roombox.xx = sketch.lerp(sketch.roombox.xx, sketch.width * 0.25, 0.1);
				sketch.roombox.yy = sketch.lerp(sketch.roombox.yy, sketch.height * 0.48, 0.1);
				sketch.play_button.x = sketch.lerp(sketch.play_button.x, sketch.width * 2 / 3, 0.1);
				sketch.play_button.y = sketch.lerp(sketch.play_button.y, sketch.height * 0.55, 0.1);
				sketch.room_button.x = sketch.lerp(sketch.room_button.x, sketch.width / 2 - sketch.room_button.w / 2, 0.1);
				sketch.room_button.y = sketch.lerp(sketch.room_button.y, sketch.height * 0.95, 0.1);
				sketch.room_button.w = sketch.lerp(sketch.room_button.w, sketch.width / 3, 0.01);
			} else {
				sketch.play_button.x = sketch.lerp(sketch.play_button.x, sketch.width / 2, 0.1);
				sketch.play_button.y = sketch.lerp(sketch.play_button.y, sketch.height / 2, 0.1);
				sketch.room_button.x = sketch.lerp(sketch.room_button.x, 0, 0.1);
				sketch.room_button.y = sketch.lerp(sketch.room_button.y, sketch.height * 0.95, 0.1);
				sketch.textbox.xx = sketch.lerp(sketch.textbox.xx, sketch.width / 2 - sketch.width / 6, 0.1);
				sketch.textbox.yy = sketch.lerp(sketch.textbox.yy, sketch.height / 2 - 75, 0.1);
			}
			sketch.textbox.position(sketch.textbox.xx, sketch.textbox.yy);
			sketch.roombox.position(sketch.roombox.xx, sketch.roombox.yy);
			if (sketch.roombox.yy < sketch.height * 0.9) sketch.roombox.show();
			let x = sketch.allow_custom_room ? sketch.width / 3 : sketch.width / 5;
			sketch.textbox.w = sketch.lerp(sketch.textbox.w, x, 0.1);
			sketch.roombox.w = sketch.lerp(sketch.roombox.w, x * 0.8, 0.1);
	
			sketch.textbox.size(sketch.textbox.w, 60);
			sketch.roombox.size(sketch.roombox.w, 60);
		}
		sketch.mousePressed = function () {
			sketch.play_button.clicked();
			sketch.room_button.clicked();
			for (let i = sketch.roomListButtons.length - 1; i > -1; --i) {
				sketch.roomListButtons[i].clicked();
			}
		}
		sketch.keyPressed = function () {
			if (sketch.keyCode === 13) {
				login(sketch.roombox.value(), sketch.textbox.value());
			}
		}
		sketch.Particle = class {
			constructor(x = 0, y = 0) {
				this.setit();
				this.x = x;
				this.y = y;
			}
		}
		sketch.Particle.prototype.setit = function () {
			this.s = sketch.random(7.5);
			this.x = sketch.random(sketch.width);
			this.y = sketch.height + this.s / 2;
			this.dx = sketch.random(-2, 2);
			this.dy = sketch.random(-4, -2);
			this.r = sketch.random(100, 255);
			this.g = 0;
			this.b = sketch.random(110, 255);
			this.a = sketch.random(255);
			this.da = 0; //-random(3, 8);
			this.c = sketch.color(this.r, this.g, this.b, this.a);
		}
		sketch.Particle.prototype.display = function () {
			sketch.noStroke();
			sketch.fill(this.c);
			sketch.circle(this.x, this.y, this.s);
		}
		sketch.Particle.prototype.work = function () {
			this.display();
			this.x += this.dx;
			this.y += this.dy;
			this.a += this.da;
			this.c = sketch.color(this.r, this.g, this.b, this.a);
		}
		sketch.Particle.prototype.outside = function () {
			return (this.x > sketch.width + this.s || this.x < -this.s || this.y > sketch.height + this.s || this.y < this.s);
		}
	});
}