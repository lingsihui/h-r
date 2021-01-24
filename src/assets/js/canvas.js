class StickerCanvas {
    constructor(id, width, height, border, db) {
        this.offsetX, this.offsetY;
        this.width = width;
        this.height = height;
        this.stickers = []; // save relevant information about stickers drawn on the canvas
        this.canvasElement = document.createElement("canvas");
        this.setCanvasAttributes(id, border);
        this.ctx = this.canvasElement.getContext("2d");
        // drag related vars
        this.isDragging=false;
        this.startX, this.startY;
        this.selectedSticker; // hold the sticker being dragged (if any)
        
        this.db = db;
    }

    setCanvasAttributes(id, border) {
        this.canvasElement.setAttribute("id", id)
        this.canvasElement.width = this.width;
        this.canvasElement.height = this.height;
        this.canvasElement.style.border = border;
        this.canvasElement.onresize=this.reOffset;

        // listen for mouse events
        this.canvasElement.onmousedown=this.handleMouseDown.bind(this);
        this.canvasElement.onmousemove=this.handleMouseMove.bind(this);
        this.canvasElement.onmouseup=this.handleMouseUp.bind(this);
        this.canvasElement.onmouseout=this.handleMouseOut.bind(this);
        this.canvasElement.onwheel=this.handleMouseWheel.bind(this);
    }

    // used to calc canvas position relative to window
    reOffset() {
        let BB = this.canvasElement.getBoundingClientRect();
        this.offsetX = BB.left;
        this.offsetY = BB.top;        
    }

    handleEvent(e) {
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleMouseDown(e){
        this.handleEvent(e)
        // calculate the current mouse position
        this.startX=parseInt(e.clientX-this.offsetX);
        this.startY=parseInt(e.clientY-this.offsetY);
        // test mouse position against all stickers
        // post result if mouse is in a sticker
        for(let i=0;i<this.stickers.length;i++){
            if(this.stickers[i].isMouseInSticker(this.startX,this.startY)){
                // the mouse is inside this sticker
                // select this sticker and bring it to the top
                this.selectedSticker = this.stickers.splice(i, 1)[0];
                this.stickers.push(this.selectedSticker);
                // set the isDragging flag
                this.isDragging=true;
                // and return (==stop looking for 
                //     further stickers under the mouse)
                return;
            }
        }
    }
    
    handleMouseUp(e){
        // return if we're not dragging
        if(!this.isDragging){return;}
        this.handleEvent(e)
        // the drag is over -- clear the isDragging flag
        this.isDragging=false;
    }
    
    handleMouseOut(e){
        // return if we're not dragging
        if(!this.isDragging){return;}
        this.handleEvent(e)
        // the drag is over -- clear the isDragging flag
        this.isDragging=false;
    }
    
    handleMouseMove(e){
        // return if we're not dragging
        if(!this.isDragging){return;}
        this.handleEvent(e)
        // calculate the current mouse position         
        let mouseX=parseInt(e.clientX-this.offsetX);
        let mouseY=parseInt(e.clientY-this.offsetY);
        // how far has the mouse dragged from its previous mousemove position?
        let dx=mouseX-this.startX;
        let dy=mouseY-this.startY;
        // move the selected sticker by the drag distance
        this.selectedSticker.x+=dx;
        this.selectedSticker.y+=dy;
        // clear the canvas and redraw all stickers
        this.drawAll();
        // update the starting drag position (== the current mouse position)
        this.startX=mouseX;
        this.startY=mouseY;
    }

    handleMouseWheel(e){
        // return if we're not dragging
        if(!this.isDragging){return;}
        this.handleEvent(e)
        this.selectedSticker.angle = (this.selectedSticker.angle + e.deltaY * 0.1) % 360;
        this.drawAll();
    }
    
    // clear the canvas and 
    // redraw all stickers in their current positions
    drawAll(){
        this.ctx.clearRect(0,0,this.canvasElement.width,this.canvasElement.height);
        this.stickers.forEach(sticker => sticker.drawOnCanvas(this.ctx));
    }
    
    loadStickers() {
        this.stickers = [];
    
        userId = $("#submitIdInput").val().trim();
        
        this.db.collection("users").doc(userId).collection("stickers").get().then(querySnapshot => {
            if (!querySnapshot.empty) {
                const total = querySnapshot.size;
                querySnapshot.forEach(stickerInfo => {
                    this.db.collection("stickers").doc(stickerInfo.data().stickerId.trim()).get().then(stickerDoc => {
                        let stickerImg = new Image(stickerDoc.data().width, stickerDoc.data().height);
                        stickerImg.onload = () => {
                            // define one image and save it in the stickers[] array
                            this.stickers.push( new Sticker(stickerInfo.data().x,
                                                            stickerInfo.data().y,
                                                            stickerInfo.data().z,
                                                            stickerInfo.data().angle,
                                                            stickerImg,
                                                            stickerInfo.id));
                            if (this.stickers.length == total) {
                                this.stickers.sort((a,b) => a.z - b.z);
                                // draw the stickers on the canvas
                                this.drawAll();
                                alert("Stickers loaded!");
                            }
                        };
                        // put your image src here!
                        stickerImg.src=stickerDoc.data().src;
                    });
                });
            } else {
                userId = "";
                alert("No such id");
            }
        }).catch(error => {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
    }
    
    addNewUser() {
        this.db.collection("users").add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(docRef => {
            userId = docRef.id;
            $("#submitIdInput").val(userId);
        });
    }
    
    addStickers() {
        //load new stickers
        const code = $("#submitCodeInput").val().trim();
        const initial = {x: this.width/2,
                        y: this.height/2,
                        z: this.stickers.length,
                        angle: 0};
    
        if (userId != "") {
            this.db.collection("codes").where("code", "==", code).limit(1).get().then(querySnapshot => {
                if (!querySnapshot.empty) {
                    let stickerIds = querySnapshot.docs[0].data().stickerIds;
                    stickerIds.forEach(stickerId => {
                        this.db.collection("users").doc(userId).collection("stickers").add({
                            stickerId: stickerId.trim(),
                            ...initial
                        }).then(docRef => {
                            this.db.collection("stickers").doc(stickerId.trim()).get().then(stickerDoc => {
                                let stickerImg = new Image(stickerDoc.data().width, stickerDoc.data().height);
                                stickerImg.onload = () => {
                                    // define one image and save it in the stickers[] array
                                    this.stickers.push( new Sticker(initial.x,
                                                                    initial.y,
                                                                    initial.z,
                                                                    Math.floor(Math.random() * 360),
                                                                    stickerImg,
                                                                    docRef.id));
                                    this.drawAll();
                                };
                                // put your image src here!
                                stickerImg.src=stickerDoc.data().src;
                            });
                            
                        });
                    })
                    alert("Stickers loaded!");
                } else {
                    alert("Invalid code");
                }
            }).catch(error => {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            });
        } else {
            alert("provide valid id first");
        }
    }
    
    saveStickers() {
        //lock position of stickers
        let saved = 0;
        const total = this.stickers.length
        for(let i=0;i<this.stickers.length;i++){
            const currSticker = this.stickers[i];
            this.db.collection("users").doc(userId).collection("stickers").doc(currSticker.id).update({
                x: currSticker.x,
                y: currSticker.y,
                z: i,
                angle: currSticker.angle
            })
            .then(function() {
                saved++;
                if (saved == total) {
                    alert("Stickers saved!")
                }
            })
            .catch(function(error) {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            });
        } 
        console.log("saved canvas");
    }
    
    downloadImage() {
        let image = this.canvasElement.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let link = document.createElement('a');
        link.download = "snowman-stickers.png";
        link.href = image;
        link.click();
    }
}

// Access the database at firestore
const db = firebase.firestore();

let userId = "";

stickerCanvas = new StickerCanvas("stickerCanvas", 800, 600, '4px solid black', db);

$("#canvasLoc").append(stickerCanvas.canvasElement);

stickerCanvas.reOffset();
window.onscroll=stickerCanvas.reOffset.bind(stickerCanvas);
window.onresize=stickerCanvas.reOffset.bind(stickerCanvas);

$("#disabledForm").submit(e => {
    stickerCanvas.handleEvent(e)
})