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

export class ColorPicker {
	constructor(g) {
		this.g = g;
		let initColors = ["aqua", "aquamarine", "azure", "blueviolet", "chartreuse", "chocolate", "cornflowerblue", "darkgreen",
						"deeppink", "fuchsia", "gold", "indigo", "lightcoral", "lightseagreen", "lightsteelblue", "mediumpurple",
						"olive", "whitesmoke"];
		this.picker = this.g.createColorPicker(initColors[this.g.int(this.g.random(initColors.length))]);
		this.color = this.g.color(0, 0);
		this.show_text = false;
		this.setSize(100, 35);
		this.picker.style("opacity", "0");
		this.picker.style("transform-origin", "0% 0%");
		this.picker.style("z-index", "2");
		// this.picker.style( "background-color" , "red" ) ;
		this.mx = this.my = 0;
		this.a = 0;
		this.alpha_slider = new Slider(g, 20, 255, 255, this.h);
		this.alpha_slider.r = 5;
		this.alpha_slider.d = 10;
		this.size_slider = new Slider(g, 1, 10, 5, this.w);
		this.size_slider.r = 5;
		this.size_slider.d = 10;
		this.position(100, 100, -10);
	}
	setSize(w, h) {
		this.w = w;
		this.h = h;
		this.picker.size(w, h);
	}
	position(x, y, t) {
		this.x = x;
		this.y = y;
		this.theta = this.g.radians(t);
		this.picker.position(x, y);
		this.picker.style("transform", "rotate(" + this.theta + "rad)");
		this.size_slider.x = this.x - (3 + this.h) * this.g.sin(this.theta);
		this.size_slider.y = this.y + (3 + this.h) * this.g.cos(this.theta);
		this.size_slider.theta = this.theta;

		this.alpha_slider.x = this.x - (3 + this.h) * this.g.sin(this.theta) - 3;
		this.alpha_slider.y = this.y + (3 + this.h) * this.g.cos(this.theta);
		this.alpha_slider.theta = this.theta - this.g.PI / 2;
	}
	inside() {
		return this.mx > 0 && this.mx < this.w && this.my > 0 && this.my < this.h;
	}
	setm(args) {
		this.mx = args[0];
		this.my = args[1];
	}
	clicked() {
		this.size_slider.clicked();
		this.alpha_slider.clicked();
	}
	display() {
		this.g.push();
		this.g.translate(this.x, this.y);
		this.g.rotate(this.theta);
		if (this.show_text) {
			this.g.fill(200);
			this.g.textSize(10);
			this.g.textAlign(this.g.LEFT, this.g.BOTTOM);
			this.g.text("Color:", 0, 1);
			this.g.text("Size", 0, this.h + 15);
		}
		this.g.stroke(255, this.a);
		this.g.strokeWeight(2);

		this.g.fill(this.color);
		this.g.rect(0, 0, this.w, this.h);
		this.g.pop();
		this.size_slider.work();
		// this.alpha_slider.work();
	}
	work() {
		this.a = this.g.lerp(this.a, this.inside() ? 255 : 10, 0.08);
		this.setm(translatePoint(this.g.mouseX, this.g.mouseY, this.x, this.y, this.theta));

		this.color = this.g.lerpColor(this.color, this.picker.color(), 0.08);
		this.color.setAlpha(this.alpha_slider.value);

		this.size_slider.setm(translatePoint(this.g.mouseX, this.g.mouseY, this.size_slider.x, this.size_slider.y, this.size_slider.theta));
		this.size_slider.color_line = this.color;
		this.size_slider.color_button = this.g.lerpColor(
			this.g.color(255, 0, 69),
			this.color,
			0.6
		);
		this.alpha_slider.setm(translatePoint(this.g.mouseX, this.g.mouseY, this.alpha_slider.x, this.alpha_slider.y, this.alpha_slider.theta));
		this.alpha_slider.color_line = this.color;
		this.alpha_slider.color_button = this.g.lerpColor(
			this.g.color(255, 0, 69),
			this.color,
			0.6
		);
		this.display();
	}
}

class Slider {
	constructor(
		g,
		min_val = 0,
		max_val = 100,
		default_val = null,
		w = 150,
		x = 0,
		y = 0,
		theta = 0,
		show_value = 2,
		round_value = 0,
		f = emptyfunction,
	) {
		this.g = g;

		this.position(x, y);
		this.w = w;
		this.r = 10;
		this.d = 2 * this.r;
		this.on = false;
		this.color_button = this.g.color(0, 0);
		this.color_line = this.g.color(255, 0, 69);
		this.color_text = this.g.color(255, 0, 69);
		this.bx = this.xoff = this.yoff = this.mx = this.my = 0;
		this.theta = theta;
		this.show_value = show_value;
		this.round_value = round_value;
		this.minval = min_val;
		this.maxval = max_val;
		this.value = default_val || this.minval;
		this.bx = ((this.value - this.minval) * this.w) / (this.maxval - this.minval);
		this.f = f;
	}
	position(x, y) {
		this.x = x;
		this.y = y;
	}
	setm(args) {
		this.mx = args[0];
		this.my = args[1];
	}
	inside() {
		if (
			this.mx > this.bx - this.r &&
			this.mx < this.bx + this.r &&
			this.my > -this.r &&
			this.my < this.r
		)
			return this.g.dist(this.mx, this.my, this.bx, 0) < this.r;
		return false;
	}
	display() {
		this.g.push();
		this.g.translate(this.x, this.y);
		this.g.rotate(this.theta);
		this.g.stroke(80);
		this.g.strokeWeight(3);
		this.g.line(0, 0, this.w, 0);
		this.g.stroke(this.color_line);
		this.g.line(0, 0, this.bx, 0);
		this.g.noStroke();
		this.g.fill(this.color_button);
		this.g.circle(this.bx, 0, this.d);
		this.g.fill(this.color_text);
		if (this.show_value) {
			/// maybe even control it when on? too many things possible
			// inside seems to be best with x y passed, but you will fix that later, wont you?
			if (this.show_value === 1 || this.on || this.inside()) {
				this.g.textSize(this.r * 2.5);
				this.g.textAlign(this.g.LEFT, this.g.BOTTOM);
				this.g.text(this.g.round(this.value, this.round_value), this.w, 0);
			}
		}
		this.g.pop();
	}
	clicked() {
		if (this.inside()) {
			this.xoff = this.bx - this.mx;
			this.yoff = this.y - this.my;
			this.on = true;
		}
	}
	work() {
		this.display();
		// this.setm(translatePoint(mouseX, mouseY, this.x, this.y, this.theta));
		if (this.on) {
			this.bx = this.g.constrain(this.xoff + this.mx, 0, this.w);
			this.value = this.minval + (this.maxval - this.minval) * (this.bx / this.w);
			this.f();
			if (!this.g.mouseIsPressed) this.on = false;
		}
		if (this.inside(this.mx, this.my) || this.on)
			this.color_button = this.g.lerpColor(this.color_button, this.g.color(0, 0, 0), 0.1);
		else this.color_button = this.g.lerpColor(this.color_button, this.g.color(255, 0, 69), 0.1);
	}
}