import * as constraints from "./constraints.js";

export class Ball {
    constructor(item, position, velocity, radius, density, color) {
      this.item = item;
      this.pos = position;
      this.v = velocity;
      this.a = constraints.GRAVITY_ACCELERATION;
      this.r = radius;
      this.m = density*radius**3;
      this.color = color;
    }

    update_v_if_reflected() {
        const x_check = (Math.abs(this.pos.x) > constraints.CONTAINER_LENGTH - this.r)? -1:1;
        const y_check = (Math.abs(this.pos.y) > constraints.CONTAINER_WIDTH - this.r)? -1:1;
        const z_check = (Math.abs(this.pos.z) > constraints.CONTAINER_HEIGHT - this.r)? -1:1;

        this.v.x *= x_check;
        this.v.y *= y_check;
        this.v.z *= z_check;
    }    

    update_v_by_acceleration() {
        this.v.z += this.a*constraints.T;
    }

    update_pos() {
        this.pos.x += this.v.x*constraints.T;
        this.pos.y += this.v.y*constraints.T;
        this.pos.z += this.v.z*constraints.T;
        
        this.item.position.set(this.pos.x, this.pos.y, this.pos.z);
    }
}