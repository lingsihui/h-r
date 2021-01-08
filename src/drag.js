var db = firebase.firestore();

// canvas related vars
var canvas=document.createElement("canvas");
var ctx=canvas.getContext("2d");
canvas.width=500;
canvas.height=500;
var cw=canvas.width;
var ch=canvas.height;
$("#canvasLoc").append(canvas);
canvas.style.border='1px solid black';

// used to calc canvas position relative to window
function reOffset(){
    var BB=canvas.getBoundingClientRect();
    offsetX=BB.left;
    offsetY=BB.top;        
}
var offsetX,offsetY;
reOffset();
window.onscroll=function(e){ reOffset(); }
window.onresize=function(e){ reOffset(); }
canvas.onresize=function(e){ reOffset(); }

// save relevant information about shapes drawn on the canvas
var shapes=[];

// drag related vars
var isDragging=false;
var startX,startY;

// hold the index of the shape being dragged (if any)
var selectedShape;


// load the image
var srcArray=[{src: 'https://avatars3.githubusercontent.com/u/57402349?s=60&u=b414554476d8db793acfc90d924fce873be725f5&v=4',
              x: 30,
              y: 10,
              width: 100,
              height: 100,
              }, {
              src: 'https://avatars1.githubusercontent.com/u/35717847?s=60&v=4',
              x: 50,
              y: 10,
              width: 100,
              height: 100,
              }];

function loadStickers(srcArray){
    srcArray.forEach(e => {
        var card=new Image();
        card.onload=function(){
            // define one image and save it in the shapes[] array
            shapes.push( {x:e.x, y:e.y, width:e.width, height:e.height, image:card} );
            // draw the shapes on the canvas
            drawAll();
        };
        // put your image src here!
        card.src=e.src;
        })
}

// listen for mouse events
canvas.onmousedown=handleMouseDown;
canvas.onmousemove=handleMouseMove;
canvas.onmouseup=handleMouseUp;
canvas.onmouseout=handleMouseOut;

// given mouse X & Y (mx & my) and shape object
// return true/false whether mouse is inside the shape
function isMouseInShape(mx,my,shape){
    // is this shape an image?
    if(shape.image){
        // this is a rectangle
        var rLeft=shape.x;
        var rRight=shape.x+shape.width;
        var rTop=shape.y;
        var rBott=shape.y+shape.height;
        // math test to see if mouse is inside image
        if( mx>rLeft && mx<rRight && my>rTop && my<rBott){
            return(true);
        }
    }
    // the mouse isn't in any of this shapes
    return(false);
}

function handleMouseDown(e){
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position
    startX=parseInt(e.clientX-offsetX);
    startY=parseInt(e.clientY-offsetY);
    // test mouse position against all shapes
    // post result if mouse is in a shape
    for(var i=0;i<shapes.length;i++){
        if(isMouseInShape(startX,startY,shapes[i])){
            // the mouse is inside this shape
            // select this shape
            selectedShape = shapes.splice(i, 1)[0];
            shapes.push(selectedShape);
            // set the isDragging flag
            isDragging=true;
            // and return (==stop looking for 
            //     further shapes under the mouse)
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
    var dx=mouseX-startX;
    var dy=mouseY-startY;
    // move the selected shape by the drag distance
    selectedShape.x+=dx;
    selectedShape.y+=dy;
    // clear the canvas and redraw all shapes
    drawAll();
    // update the starting drag position (== the current mouse position)
    startX=mouseX;
    startY=mouseY;
}

// clear the canvas and 
// redraw all shapes in their current positions
function drawAll(){
    ctx.clearRect(0,0,cw,ch);
    for(var i=0;i<shapes.length;i++){
        var shape=shapes[i];
        if(shape.image){
            // it's an image
            ctx.drawImage(shape.image,shape.x,shape.y);
        }
    }
}

$("#submitIdForm").submit(function(e) {
    e.preventDefault();
    shapes = [];

    let userId = $("#submitIdInput").val();
    

    db.collection("users").doc(userId).collection("stickers").get().then((userStickersQuerySnapshot) => {
        userStickersQuerySnapshot.forEach(stickerInfo => {
            db.collection("stickers").doc(stickerInfo.data().stickerId).get().then(stickerDoc => {
                var card=new Image();
                card.onload=function(){
                    // define one image and save it in the shapes[] array
                    shapes.push( {x:stickerInfo.data().x, y:stickerInfo.data().y, width:stickerDoc.data().width, height:stickerDoc.data().height, image:card, id:stickerInfo.id} );
                    // draw the shapes on the canvas
                    drawAll();
                };
                // put your image src here!
                card.src=stickerDoc.data().src;
                console.log(shapes);
            });
        });
    });
});

function submitCodeButtonPressed(){
    console.log("The code was submitted");
}

function saveButtonPressed(){
    console.log("The stickers were saved");
}

