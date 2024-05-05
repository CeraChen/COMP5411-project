import * as constraints from "./constraints.js";

export class Ball {
    constructor(item, position, velocity, radius, density, color) {
      this.item = item;
      this.pos = position;
      this.v = velocity;
      this.a = constraints.GRAVITY_ACCELERATION;
      this.r = radius;
      this.m = density*radius**3;
      this.den = density;
      this.color = color;
      this.merged = false;
    }

    
    update_v_by_acceleration() {
        this.v.y += this.a*constraints.T;
    }
    
    update_pos() {
        this.pos.x += this.v.x*constraints.T;
        this.pos.y += this.v.y*constraints.T;
        this.pos.z += this.v.z*constraints.T;
        
        this.item.position.set(this.pos.x, this.pos.y, this.pos.z);
    }

    update_v_if_reflected() {
        // touch the wall
        const x_dis = constraints.CONTAINER_LENGTH/2 - Math.abs(this.pos.x);
        const y_dis = constraints.CONTAINER_WIDTH/2 - Math.abs(this.pos.y)
        const z_dis = constraints.CONTAINER_HEIGHT/2 - Math.abs(this.pos.z);

        if (x_dis < this.r) {
            this.v.x *= -1;
            // if (x_dis < 0) {
            this.pos.x -= Math.sign(this.pos.x)*Math.abs(this.r-x_dis);
            // }
            // else{
            //     this.pos.x = Math.sign(this.pos.x)*constraints.CONTAINER_LENGTH/2;
            // }
        }
        
        if (y_dis < this.r) {
            this.v.y *= -1;
            // if (y_dis < 0) {
            this.pos.y -= Math.sign(this.pos.y)*Math.abs(this.r-y_dis);
            // }
            // else{
            //     this.pos.y = Math.sign(this.pos.y)*constraints.CONTAINER_WIDTH/2;
            // }
        }
        
        if (z_dis < this.r) {
            this.v.z *= -1;
            // if (z_dis < 0) {
            this.pos.z -= Math.sign(this.pos.z)*Math.abs(this.r-z_dis);
            // }
            // else{
            //     this.pos.z = Math.sign(this.pos.z)*constraints.CONTAINER_HEIGHT/2;
            // }
        }
    }
    

    collision_check(pos, r) {
        const sqrtDist = (this.pos.x - pos.x)**2 + (this.pos.y - pos.y)**2 + (this.pos.z - pos.z)**2;
        return sqrtDist <= (this.r + r)**2;
    }

}