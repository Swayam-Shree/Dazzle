export function emptyfunction(){}
export function translatePoint(absPointX, absPointY, centerX, centerY, theta) {
    absPointX -= centerX;
    absPointY -= centerY;
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    return [(absPointX * c) + (absPointY * s), (-absPointX * s) + (absPointY * c)];
}

export class Button {
	constructor(g, s, size = 20, f = emptyfunction, toggleable = false, x = 0, y = 0, t = -10) {
		this.g = g;
		this.s = s;
		this.textSize = size;
		this.toggleable = toggleable;
		this.f = f;
		this.position(x, y);
		this.on = false;
		this.theta = this.g.radians(t);
		this.g.textSize(this.textSize);
		this.w = this.g.textWidth(this.s) + this.textSize;
		this.h = this.g.textAscent() + this.textSize / 2;
		this.c = this.c_text = this.c_stroke = this.c_lines = this.g.color(0, 0);
		this.c_inside = this.g.color(255, 0, 69);
		this.c_outside = this.g.color(40);
		this.mx = this.my = 0;
		this.lines_theta = this.g.radians(80);
		this.lines_d = this.h / this.g.tan(this.lines_theta);
		this.lines_dis = 20;
		this.lines_speed = 0.5;
		this.lines_weight = 2;
		this.displaylikelink = false;
	}
	position(x, y) {
		this.x = x;
		this.y = y;
	}
	inside() {
		return this.mx > 0 && this.mx < this.w && this.my > 0 && this.my < this.h;
	}
	display_lines() {
		this.g.stroke(this.c_lines);
		this.g.strokeWeight(this.lines_weight);
		let x1, y1, x2, y2;
		for (
			let i = ((frameCount * this.lines_speed) % this.lines_dis) - this.lines_d;
			i < this.w;
			i += this.lines_dis) {
			x1 = i;
			y1 = this.h;
			x2 = x1 + this.lines_d;
			y2 = 0;
			if (x2 > this.w) {
				y2 = this.g.map(x2 - this.w, 0, this.lines_d, 0, this.h);
				x2 = this.w;
			}
			if (x1 < 0) {
				y1 = this.g.map(x1, -this.lines_d, 0, 0, this.h);
				x1 = 0;
			}
			this.g.line(x1, y1, x2, y2);
		}
	}
	display() {
		this.g.push();
		this.g.translate(this.x, this.y);
		this.g.rotate(this.theta);
		this.g.fill(this.c);
		this.g.rect(0, 0, this.w, this.h);
		//if( this.inside() )
		//this.display_lines() ;
		this.g.textSize(this.textSize);
		this.g.textAlign(this.g.CENTER, this.g.CENTER);
		this.g.fill(250);
		this.g.text(this.s, this.w / 2, this.h / 2);
		this.g.pop();
	}
	display_aslink() {
		this.g.push();
		this.g.translate(this.x, this.y);
		this.g.rotate(this.theta);
		// fill(this.c);
		// rect(0, 0, this.w, this.h);
		//if( this.inside() )
		//this.display_lines() ;
		this.g.textSize(this.textSize);
		this.g.textAlign(this.g.CENTER, this.g.CENTER);
		this.g.stroke(this.c);
		this.g.strokeWeight(2);
		this.g.line(this.w * 0.04, this.h * 0.9, this.w * 0.96, this.h * 0.9);
		this.g.noStroke();
		this.g.fill(this.c);
		this.g.text(this.s, this.w / 2, this.h / 2);
		this.g.pop();
	}
	clicked() {
		if (!this.inside()) return;
		if (this.toggleable) this.on = !this.on;
		else this.f();
	}
	setm(args) {
		this.mx = args[0];
		this.my = args[1];
	}
	work() {
		// [this.mx, this.my] = translatePoint(
		//   	mouseX,
		//   	mouseY,
		//   	this.x,
		//   	this.y,
		//   	this.theta
		// );
		this.c = this.g.lerpColor(
			this.c,
			this.inside() ? this.c_inside : this.c_outside,
			0.1
		);
		// lerpColor(this.c, this.c_outside, 0.1);
		// this.c_lines = lerpColor(this.c_lines,this.inside()? this.c_outside:this.c_inside, 0.05) ;
		if (this.displaylikelink) this.display_aslink();
		else this.display();
		if (this.on) this.f();
	}
}