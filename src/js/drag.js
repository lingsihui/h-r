const db = firebase.firestore();
let userId = "";

// canvas related lets
let canvas=document.createElement("canvas");
canvas.setAttribute("id", "stickerCanvas")
let ctx=canvas.getContext("2d");
canvas.width=1050;
canvas.height=500;
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
window.onscroll=reOffset;
window.onresize=reOffset();
canvas.onresize=reOffset();

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

function downloadImage() {
    var canvas = document.getElementById("stickerCanvas");
    image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = "my-image.png";
    link.href = image;
    link.click();
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
        if(stickers[i].isMouseInSticker(startX,startY)){
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
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stickers.forEach(sticker => sticker.drawOnCanvas(ctx));
}

$("#submitIdForm").submit(e => {
    e.preventDefault();
    stickers = [];

    userId = $("#submitIdInput").val().trim();
    
    db.collection("users").doc(userId).collection("stickers").get().then(querySnapshot => {
        if (!querySnapshot.empty) {
            querySnapshot.forEach(stickerInfo => {
                db.collection("stickers").doc(stickerInfo.data().stickerId.trim()).get().then(stickerDoc => {
                    console.log(stickerDoc.data());
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
            });
        } else {
            userId = "";
            alert("No such id");
        }
    }).catch(error => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
})

$("#submitCodeForm").submit(function(e) {
    e.preventDefault();
    //load new stickers
    const code = $("#submitCodeInput").val().trim();

    if (userId != "") {
        db.collection("codes").where("code", "==", code).limit(1).get().then(querySnapshot => {
            if (!querySnapshot.empty) {
                let stickerIds = querySnapshot.docs[0].data().stickerIds;
                stickerIds.forEach(stickerId => {
                    db.collection("users").doc(userId).collection("stickers").add({
                        stickerId: stickerId.trim(),
                        x: 0,
                        y: 0,
                        z: stickers.length
                    }).then(docRef => {
                        db.collection("stickers").doc(stickerId.trim()).get().then(stickerDoc => {
                            let stickerImg = new Image(stickerDoc.data().width, stickerDoc.data().height);
                            stickerImg.onload = () => {
                                // define one image and save it in the stickers[] array
                                stickers.push( new Sticker(0, 0, stickers.length, stickerImg, docRef.id) );
                                drawAll();
                            };
                            // put your image src here!
                            stickerImg.src=stickerDoc.data().src;
                        });
                        
                    });
                })
                document.getElementById("submitCodeForm").reset();
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
});

$("#saveForm").submit(function(e) {
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