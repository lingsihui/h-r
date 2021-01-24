class Sticker {
    constructor(x, y, z, img, id) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.angle = 0;
        this.img = img;
        this.id = id;
    }

    toRadians(angle) {
        return angle * Math.PI/180;
    }

    isMouseInSticker(mx,my) {
        // is this sticker an image?
        if (this.img){
            // this is a rectangle
            let rLeft=this.x - (this.img.width/2);
            let rRight=this.x + (this.img.width/2);
            let rTop=this.y - (this.img.height/2);
            let rBott=this.y + (this.img.height/2);
            // math test to see if mouse is inside img
            if (mx>rLeft && mx<rRight && my>rTop && my<rBott){
                return true;
            }
        }
        // the mouse isn't in any of this stickers
        return false;
    }

    drawOnCanvas(ctx) {
        if (this.img) {
            // save the current co-ordinate system 
            // before we screw with it
            ctx.save(); 

            // move to the middle of where we want to draw our image
            ctx.translate(this.x, this.y);

            // rotate around that point, converting our 
            // angle from degrees to radians 
            ctx.rotate(this.toRadians(this.angle));

            // draw it up and to the left by half the width
            // and height of the image 
            ctx.drawImage(this.img, -(this.img.width/2), -(this.img.height/2));

            // and restore the co-ords to how they were when we began
            ctx.restore(); 

            // it's an img
            // ctx.drawImage(this.img, this.x, this.y);
        }
    }
}