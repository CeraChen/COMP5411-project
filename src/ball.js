import { GRAVITY_ACCELERATION } from "./constraints.js";

export class Ball {
    constructor(item, position, velocity, radius, density, color) {
      this.item = item;
      this.pos = position;
      this.v = velocity;
      this.a = GRAVITY_ACCELERATION;
      this.r = radius;
      this.m = density*radius**3;
      this.color = color;
    }

    // updateVelocity_wall() {
    //     if 
    // }    

    updateVelocity_alone() {
        // checkCurrentPos
        // if wall, velocity reflect + a
        // elif collide, merge + a
        // elif + a
        this.v += this.a*T;
    }

    updatePosition() {
        this.pos = this.v*T;
        this.item.position.set(this.pos.x, this.pos.y, this.pos.z);
    }
    

}