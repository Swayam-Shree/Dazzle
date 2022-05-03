import { emptyfunction, translatePoint } from "./util";
import { socket } from "./networking";

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

export class Chatbox {
	constructor(g, s, x, y, w = 500, h = 250) {
		this.g = g;
		this.position(x, y);
		this.s = s;
		this.w = w;
		this.hmax = this.h = h;
		this.hh = 45;
		this.hcolor = this.g.color(21, 22, 27);
		this.textsizetop = this.hh * 0.8;
		this.theta = this.g.radians(-2.3);
		this.bx = this.w - (this.hh * 3) / 4;
		this.by = -this.hh / 2;
		this.br = this.hh / 2;
		this.bcolor = this.g.color(0, 0);
		this.bd = this.br * 2;
		this.mx = this.my = 0;
		this.on = false;
		this.melta = this.on ? 1 : 0;
		this.textbox = this.g.createInput();
		// this.textbox.attribute("onkeypress", "chatboxSend();");
		this.textbox.attribute("maxlength", "100");
		this.textbox.style("transform-origin", "0% 0%");
		this.textbox.style("border", "none");
		this.textbox.style("margin", "none");
		this.textbox.style("outline", "none");
		this.textbox.style("padding", "none");
		this.textbox.style("color", this.g.color(10, 172, 197));
		this.textbox.style("background-color", this.g.color(30, 32, 46));
		this.textbox.style("font-size", "24px");
		this.textbox.style("font-family", "Lucida Console");
		this.textbox.size(this.w, this.hh);
		this.textbox.style("z-index", "2");

		this.messagebox = this.g.createElement("textarea");
		this.messagebox.attribute("readonly", true);
		this.messagebox.style("transform-origin", "0% 0%");
		this.messagebox.style("resize", "none");
		this.messagebox.style("border", "none");
		this.messagebox.style("margin", "none");
		this.messagebox.style("outline", "none");
		this.messagebox.style("padding", "none");
		this.messagebox.style("color", this.g.color(122, 162, 247));
		this.messagebox.style("background-color", this.g.color(26, 27, 38));
		this.messagebox.style("font-size", "20px");
		this.messagebox.size(this.w, this.h - this.hh);
		this.messagebox.style("z-index", "2");
		// this.messagebox.hide();
		// this.textbox.hide();
		this.work_between();
		this.notification_y = 0;
		this.notification_messages = [];
		this.notification_life = 0;
		this.notification_goingup = false;
		this.notification_count = 0;
		this.unread_counter = 0; // for them
	}
	add_notification(s) {
		if (!this.notification_messages.length) {
			this.notification_life = 0;
			this.notification_goingup = true;
		}
		this.notification_messages.push(s);
	}
	findmx() {
		[this.mx, this.my] = translatePoint(
			this.g.mouseX,
			this.g.mouseY,
			this.x,
			this.y,
			this.theta
		);
	}
	position(x, y) {
		this.x = x;
		this.yy = this.y = y;
	}
	inside() {
		return this.mx > 0 && this.mx < this.w && this.my < 0 && this.my > -this.h;
	}
	inside_button() {
		if (
			this.mx > this.bx - this.br &&
			this.mx < this.bx + this.br &&
			this.my > this.by - this.br &&
			this.my < this.by + this.br
		)
			return this.g.dist(this.mx, this.my, this.bx, this.by) <= this.br;
		return false;
	}
	display(onlineCount) {
		this.g.push();
		this.g.translate(this.x, this.y);
		this.g.rotate(this.theta);

		/// for background maybe
		//     if (this.inside()) fill(255, 0, 200);
		//     else
		this.g.noStroke();
		this.g.fill(25);
		this.g.rect(0, -this.h, this.w, this.h);
		this.g.rect(0, -this.h - this.hh - this.notification_y, this.w, this.hh);
		this.g.fill(255, 0, 69);
		this.g.textSize(15);
		this.g.textAlign(this.g.LEFT, this.g.BASELINE);
		this.g.text(onlineCount + " online", 0, -this.h - this.hh - this.notification_y);
		this.g.textSize(20);
		this.g.textAlign(this.g.LEFT, this.g.CENTER);
		this.g.fill(200);
		if (this.notification_messages.length)
			this.g.text(this.notification_messages[0], 10, -this.h - this.hh - this.notification_y + this.hh / 2);
		//  flash effect??
		//     if( cos( frameCount/10 ) > 0 ) this.hcolor = lerpColor( this.hcolor , color(50, 0, 169) , 0.05 ) ;
		//     else this.hcolor = lerpColor( this.hcolor , color(50, 0, 269) , 0.05 ) ;
		this.g.fill(this.hcolor);
		this.g.rect(0, -this.h - this.hh, this.w, this.hh);
		this.g.textAlign(this.g.LEFT, this.g.BOTTOM);
		this.g.textSize(this.textsizetop);
		this.g.noStroke();
		// fill (250 , 100* ( 1 + cos(frameCount/40) )/2 + 100)
		this.g.fill(200);
		this.g.text(this.s, 5, -this.h);
		if (!this.on && this.unread_counter) {
			this.g.fill(255, 0, 69);
			this.g.circle(this.w, -this.h - this.hh, this.hh / 2);
			this.g.fill(220);
			this.g.textSize(this.textsizetop * 0.4);
			this.g.textAlign(this.g.CENTER, this.g.CENTER);
			this.g.text(this.unread_counter, this.w, -this.h - this.hh);
		}
		this.g.translate(this.bx, this.by);
		this.bcolor = this.g.lerpColor(
			this.bcolor,
			this.inside_button() ? this.g.color(171, 29, 81) : this.g.color(44, 45, 56), 0.2);
		this.g.fill(this.bcolor);
		this.g.circle(0, 0, this.bd);

		this.g.strokeWeight(4);
		this.g.stroke(250); //stroke(this.inside_button() ?  0 : 250);
		let u = this.br / 6;
		let i = this.melta * 2 - 1; //map(this.h, 0, this.hmax, -1, 1);
		this.g.line(-u * 2, -i * u, 0, i * u);
		this.g.line(u * 2, -i * u, 0, i * u);
		this.g.pop();
	}
	work_dom() {
		this.textbox.position(
			this.x + (this.h - this.messagebox.height * this.melta) * this.g.sin(this.theta),
			this.y - (this.h - this.messagebox.height * this.melta) * this.g.cos(this.theta)
		);
		this.textbox.style(
			"transform",
			"rotate(" + this.theta + "rad) " + "scaleY(" + this.melta + ")"
		);
		this.messagebox.position(
			this.x + this.h * this.g.sin(this.theta),
			this.y - this.h * this.g.cos(this.theta)
		);
		this.messagebox.style(
			"transform",
			"rotate(" + this.theta + "rad) " + "scaleY(" + this.melta + ")"
		);
	}
	work_between() {
		this.work_dom();
		// this.y = this.yy - this.h + this.hmax; // cool fly away effect
		this.by = -this.h - this.hh / 2; //this.hmax ; // maybe make it like the X button?
	}
	work(onlineCount) {
		this.notification_life++;
		if (this.notification_life > 200) this.notification_goingup = false;
		if (this.notification_goingup) {
			this.notification_y = this.g.lerp(this.notification_y, this.hh * 1.3, 0.1);
			// if(this.notification_y < this.hh*1.3 )  this.notification_y += 2 ;
		} else {
			if (this.notification_y < 1) {
				this.notification_messages.splice(0, 1);
				if (this.notification_messages.length) {
					this.notification_goingup = true;
					this.notification_life = 0;
				}
			}
			this.notification_y = this.g.lerp(this.notification_y, 0, 0.1);
		}

		this.h = this.on ? this.g.lerp(this.h, this.hmax, 0.06) : this.g.lerp(this.h, 0, 0.08);
		this.findmx();
		this.melta = this.h / this.hmax;
		if (this.melta > 0.0001 && this.melta < 0.9999) this.work_between();
		this.display(onlineCount);
	}
	clicked() {
		if (this.inside_button()) {
			this.on = !this.on;
			if (this.on) this.unread_counter = 0;
		}
	}
	addChat(chat) {
		this.messagebox.value(this.messagebox.value() + chat + "\n");
		this.messagebox.elt.scrollTop = this.messagebox.elt.scrollHeight;
	}
	send(playerName){
		if (this.textbox.value() !== "") {
			let s = "< " + playerName + " >: " + this.textbox.value();
			this.addChat(s);
			socket.emit("chat", s);
			this.textbox.value("");
		}
	}
}