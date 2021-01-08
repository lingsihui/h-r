const db = firebase.firestore();
let userId;

// canvas related lets
let canvas=document.createElement("canvas");
let ctx=canvas.getContext("2d");
canvas.width=500;
canvas.height=500;
let cw=canvas.width;
let ch=canvas.height;
$("#canvasLoc").append(canvas);
canvas.style.border='1px solid black';

// used to calc canvas position relative to window
function reOffset(){
    let BB=canvas.getBoundingClientRect();
    offsetX=BB.left;
    offsetY=BB.top;        
}
let offsetX,offsetY;
reOffset();
window.onscroll=function(e){ reOffset(); }
window.onresize=function(e){ reOffset(); }
canvas.onresize=function(e){ reOffset(); }

// save relevant information about stickers drawn on the canvas
let stickers=[];

// drag related vars
let isDragging=false;
let startX,startY;

// hold the index of the sticker being dragged (if any)
let selectedSticker;

// listen for mouse events
canvas.onmousedown=handleMouseDown;
canvas.onmousemove=handleMouseMove;
canvas.onmouseup=handleMouseUp;
canvas.onmouseout=handleMouseOut;

// given mouse X & Y (mx & my) and sticker object
// return true/false whether mouse is inside the sticker
function isMouseInSticker(mx,my,sticker){
    // is this sticker an image?
    if(sticker.img){
        // this is a rectangle
        let rLeft=sticker.x;
        let rRight=sticker.x+sticker.img.width;
        let rTop=sticker.y;
        let rBott=sticker.y+sticker.img.height;
        // math test to see if mouse is inside img
        if( mx>rLeft && mx<rRight && my>rTop && my<rBott){
            return(true);
        }
    }
    // the mouse isn't in any of this stickers
    return(false);
}

function handleMouseDown(e){
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position
    startX=parseInt(e.clientX-offsetX);
    startY=parseInt(e.clientY-offsetY);
    // test mouse position against all stickers
    // post result if mouse is in a sticker
    for(let i=0;i<stickers.length;i++){
        if(isMouseInSticker(startX,startY,stickers[i])){
            // the mouse is inside this sticker
            // select this sticker
            selectedSticker = stickers.splice(i, 1)[0];
            stickers.push(selectedSticker);
            // set the isDragging flag
            isDragging=true;
            // and return (==stop looking for 
            //     further stickers under the mouse)
            return;
        }
    }
}

function handleMouseUp(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
}

function handleMouseOut(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
}

function handleMouseMove(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position         
    mouseX=parseInt(e.clientX-offsetX);
    mouseY=parseInt(e.clientY-offsetY);
    // how far has the mouse dragged from its previous mousemove position?
    let dx=mouseX-startX;
    let dy=mouseY-startY;
    // move the selected sticker by the drag distance
    selectedSticker.x+=dx;
    selectedSticker.y+=dy;
    // clear the canvas and redraw all stickers
    drawAll();
    // update the starting drag position (== the current mouse position)
    startX=mouseX;
    startY=mouseY;
}

// clear the canvas and 
// redraw all stickers in their current positions
function drawAll(){
    ctx.clearRect(0,0,cw,ch);
    stickers.forEach(sticker => {
        if (sticker.img) {
            // it's an img
            ctx.drawImage(sticker.img,sticker.x,sticker.y);
        }
    });
}

$("#submitIdForm").submit(loadUserStickers);

class Sticker {
    constructor(x, y, z, img, id) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.img = img;
        this.id = id;
    }
}

async function loadUserStickers(e) {
    e.preventDefault();
    stickers = [];

    userId = $("#submitIdInput").val();
    
    let querySnapshot = await db.collection("users").doc(userId).collection("stickers").get().catch(error => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
    
    if(!querySnapshot.empty) {
        querySnapshot.forEach(async stickerInfo => {
            stickerDoc = await db.collection("stickers").doc(stickerInfo.data().stickerId).get();
            let stickerImg = new Image(stickerDoc.data().width, stickerDoc.data().height);
            stickerImg.onload = () => {
                // define one image and save it in the stickers[] array
                stickers.push( new Sticker(stickerInfo.data().x, stickerInfo.data().y, stickerInfo.data().z, stickerImg, stickerInfo.id) );
                if (stickers.length == querySnapshot.size) {
                    stickers.sort((a,b) => a.z - b.z);
                    // draw the stickers on the canvas
                    console.log(stickers);
                    drawAll();
                }
            };
            // put your image src here!
            stickerImg.src=stickerDoc.data().src;
        });
        
    } else {
        alert("No such id");
    }
}

$("#submitCodeForm").submit(async function(e) {
    e.preventDefault();
    //load new stickers
    const code = $("#submitCodeInput").val();

    let querySnapshot = db.collection("codes").where("code", "==", code).limit(1).get();

    document.getElementById("submitCodeForm").reset();
});

$("#saveForm").submit(async function(e) {
    e.preventDefault();
    //lock position of stickers
    for(let i=0;i<stickers.length;i++){
        const sticker = stickers[i];
        db.collection("users").doc(userId).collection("stickers").doc(sticker.id).update({
            x: sticker.x,
            y: sticker.y,
            z: i
        })
        .then(function() {
            console.log("Document successfully updated!");
        })
        .catch(function(error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
    } 
    console.log("saved canvas");
});
