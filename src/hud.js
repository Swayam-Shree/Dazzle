import p5 from "p5";
import { engine, player } from "./world";
import { roomname, roomData } from "./networking";
import { ColorPicker, Chatbox } from "./p5ui";

export let p5Hud;
export function hudInit() {
	p5Hud = new p5((hud) => {
		hud.setup = () => {
			hud.canvas = hud.createCanvas(window.innerWidth, window.innerHeight, hud.P2D);
			hud.canvas.position(0, 0);
			hud.canvas.style("z-index", "1");
	
			hud.aspectRatio = hud.width / hud.height;
			
			hud.frameRate(60);
			
			hud.playerHealthbar = new hud.Bar(player.maxHealth, 20, 50, hud.radians(-4), player.username);

			hud.colorPicker = new ColorPicker(hud);
			hud.colorPicker.show_text = true;

			hud.chatbox = new Chatbox(hud, roomname, hud.width - 510, hud.height);
		};
		hud.draw = () => {
			hud.clear();
	
			hud.noStroke();
			hud.fill(player.color[0], player.color[1], player.color[2], player.color[3]);
			hud.stroke(0);
			hud.circle(hud.width * 0.5, hud.height * 0.5, 5);
	
			hud.fill(255);
			hud.textSize(hud.aspectRatio * 15);
			hud.text("fps >> " + engine.getFps().toFixed(), hud.width * 0.8, hud.height * 0.05);
			hud.text("room >> " + roomname, hud.width * 0.8, hud.height * 0.1);

			hud.playerHealthbar.purevalue = player.health;
			hud.playerHealthbar.work();

			hud.colorPicker.work();

			hud.chatbox.work(roomData[roomname]);
		};
		hud.windowResized = () => {
			hud.resizeCanvas(window.innerWidth, window.innerHeight);
			hud.colorPicker.position(20, 70, -4);

			hud.chatbox.position(hud.width - 510, hud.height);
			hud.chatbox.work_between();
		}
		hud.keyPressed = () => {
			if (hud.keyCode === 13) {
				hud.chatbox.send(player.name);
			}
		}
		hud.mousePressed = () => {
			hud.colorPicker.clicked();
		}
		hud.Bar = class Bar {
			constructor(maxvalue, x, y, theta = 0, s = '') {
				this.x = x ; 
				this.y = y ; 
				this.theta = theta;
				this.s = s;
				this.purevalue = this.value = this.maxvalue = maxvalue;
			}
		}
		hud.Bar.prototype.position = function(x,y) {
			this.x = x;
			this.y = y;
		}
		hud.Bar.prototype.display = function () {
			hud.push();
			hud.strokeWeight(1);
			hud.translate(this.x, this.y);

			hud.rotate(this.theta);

			let a = hud.map(this.value, 0, this.maxvalue, 0, 255);
			hud.noStroke();
			hud.fill(255 - a, 0, a);
			hud.rect(0, 0, this.value, 10);
			hud.stroke(0);
			hud.noFill();
			hud.rect(0, 0, this.maxvalue, 10);

			hud.noStroke();
			// hud.textSize(40);
			// hud.textAlign(hud.LEFT, hud.TOP);
			// hud.fill(255 - a, 0, a, 200);
			//let ss = hud.str(hud.int(this.value)) // .replace(/0/gi, 'O');
			//hud.text(ss, 0, 10);

			hud.fill(255, 0, 69);
			hud.textAlign(hud.LEFT, hud.BASELINE);
			hud.textSize(hud.aspectRatio * 25);
			hud.text(this.s, 0, 0);
			hud.pop();
		}
		hud.Bar.prototype.work = function () {
			this.value = hud.lerp(this.value, this.purevalue, 0.14);
			this.display();
		}
	});
}
