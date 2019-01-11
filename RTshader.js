var camera = new Camera();
function main() {
    let canvas = document.getElementById("canvas");
    let gl = canvas.getContext('webgl2');

    let program = loadShaders(gl, "RTV.glsl", "RTF.glsl");
    if (!program) {
        console.log("无法初始化片元着色器");
        return;
    }
    useProgram(gl, program);

    program.aPosition = gl.getAttribLocation(program, "aPosition");
    program.randomSeed = gl.getUniformLocation(program, "randomSeed");

    program.cameraPosition = gl.getUniformLocation(program, "camera.Position");
    program.cameraFront = gl.getUniformLocation(program, "camera.Front");
    program.cameraRight = gl.getUniformLocation(program, "camera.Right");
    program.cameraUp = gl.getUniformLocation(program, "camera.Up");
    program.cameraZoom = gl.getUniformLocation(program, "camera.Zoom");
    program.cameraNear = gl.getUniformLocation(program, "camera.Near");
    program.cameraFar = gl.getUniformLocation(program, "camera.Far");

    gl.uniform1f(program.cameraNear,1);
    gl.uniform1f(program.cameraFar,2000);


    let vbo = createEmptyArrayBuffer(gl,program.aPosition,3,gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(rec),gl.STATIC_DRAW);

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.uniform1f(program.randomSeed,new Date().getMilliseconds());
    let animate = function () {
        updateElapsed();
        ProcessInput(camera);
        gl.uniform3fv(program.cameraPosition,camera.Position.elements);
        gl.uniform3fv(program.cameraFront,camera.Front.elements);
        gl.uniform3fv(program.cameraRight,camera.Right.elements);
        gl.uniform3fv(program.cameraUp,camera.Up.elements);
        gl.uniform1f(program.cameraZoom,camera.Zoom);


        gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES,0,6);
        requestAnimationFrame(animate);
    };
    animate();
}
const rec = [-1,-1,0, -1,1,0, 1,1,0,
             -1,-1,0, 1,-1,0, 1,1,0 ];


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
// document.addEventListener('mousemove',onDocumentMousewheel,false);


var PRESSINGKEY = new Map();

main();


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