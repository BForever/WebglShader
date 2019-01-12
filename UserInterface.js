initGL();
var gl;
var canvas;
var camera = new Camera();

// Keyboard
var last = +new Date();
var elapsed = 0;
function updateElapsed() {
    var now = +new Date();
    elapsed = now - last;
    last = now;
}
//添加键盘监听事件
document.addEventListener('keydown',onDocumentKeyDown,false);
document.addEventListener('keyup',onDocumentKeyUp,false);
document.addEventListener('mousewheel',onDocumentMouseWheel,false);
var PRESSINGKEY = new Map();
function onDocumentMouseWheel(event) {
    camera.ProcessMouseScroll(event.deltaY/100)
}
function onDocumentKeyDown(event) {
    var code;
    if (event.key !== undefined) {
        code = event.key;
    } else if (event.keyCode !== undefined) {
        code = event.keyCode;
    }
    PRESSINGKEY.set(code,true);
}
function onDocumentKeyUp(){
    var code;
    if (event.key !== undefined) {
        code = event.key;
    } else if (event.keyCode !== undefined) {
        code = event.keyCode;
    }
    PRESSINGKEY.delete(code);
}



function ProcessInput(camera) {
    if(PRESSINGKEY.get(DIRECTION.FORWARD)!==undefined){
        camera.ProcessPosition(DIRECTION.FORWARD,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.BACKWARD)!==undefined){
        camera.ProcessPosition(DIRECTION.BACKWARD,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.LEFT)!==undefined){
        camera.ProcessPosition(DIRECTION.LEFT,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.RIGHT)!==undefined){
        camera.ProcessPosition(DIRECTION.RIGHT,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.ARROWUP)!==undefined){
        camera.ProcessRotation(0,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.ARROWDOWN)!==undefined){
        camera.ProcessRotation(0,-elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.ARROWLEFT)!==undefined){
        camera.ProcessRotation(-elapsed,0);
    }
    if(PRESSINGKEY.get(DIRECTION.ARROWRIGHT)!==undefined){
        camera.ProcessRotation(elapsed,0);
    }
}

// Canvas set up
function viewport() {
    let winSize;

    if (canvas.width > canvas.height) {
        winSize = canvas.height;
    } else {
        winSize = canvas.width;
    }

    gl.viewport((canvas.width - winSize) / 2, (canvas.height - winSize) / 2, winSize, winSize);
}

function initGL() {
    canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl2');
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);


}