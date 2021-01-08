class Sticker {
    constructor(x, y, z, img, id) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.img = img;
        this.id = id;
    }

    isMouseInSticker(mx,my) {
        // is this sticker an image?
        if(this.img){
            // this is a rectangle
            let rLeft=this.x;
            let rRight=this.x + this.img.width;
            let rTop=this.y;
            let rBott=this.y + this.img.height;
            // math test to see if mouse is inside img
            if( mx>rLeft && mx<rRight && my>rTop && my<rBott){
                return(true);
            }
        }
        // the mouse isn't in any of this stickers
        return(false);
    }
}