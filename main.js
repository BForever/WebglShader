initGL();
window.onresize = initGL;

var vsScript = `
attribute vec3 aPos;
varying vec3 vColor;
varying vec3 pos;
void main()
{
    gl_Position = vec4(aPos, 1.0);
    pos = aPos;
    vColor = aPos;
}
`;
var fsScript = `
precision highp float;
varying vec3 vColor;
varying vec3 pos;
void main() {
// gl_FragColor = vec4(vec3(0.2*length(pos)), 1.0);
    if(length(pos)<0.795){
        gl_FragColor = vec4(vec3(0), 1.0);
    }
    else{
        gl_FragColor = vec4(1.0,vec2(0), 1.0);
    }
}
`;

program = initShaders(gl,vsScript,fsScript);
gl.useProgram(program);

let num = 30;
let temp = Math.cos(Math.PI / 4);
let weights = [1, temp, 1, temp, 1, temp, 1, temp, 1,];
let ctlPs = [
    new Vector2(0, -0.8), new Vector2(0.8, -0.8), new Vector2(0.8, 0),
    new Vector2(0.8, 0.8), new Vector2(0, 0.8), new Vector2(-0.8, 0.8),
    new Vector2(-0.8, 0), new Vector2(-0.8, -0.8), new Vector2(0, -0.8),
];
let points = getRBC(3, weights.slice(0, 3), ctlPs.slice(0, 3), 0, 1, num);
points = points.concat(getRBC(3, weights.slice(2, 5), ctlPs.slice(2, 5), 0, 1, num));
points = points.concat(getRBC(3, weights.slice(4, 7), ctlPs.slice(4, 7), 0, 1, num));
points = points.concat(getRBC(3, weights.slice(6, 9), ctlPs.slice(6, 9), 0, 1, num));

let circle = [];
for (let i = 0; i <= 900; i++) {
    circle.push(Math.cos(2 * Math.PI * i / 900) * 0.79);
    circle.push(Math.sin(2 * Math.PI * i / 900) * 0.79);
    circle.push(0);
}

var ext = gl.getExtension("OES_vertex_array_object");
var VAO1 = ext.createVertexArrayOES();
ext.bindVertexArrayOES(VAO1);


var VBO1 = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, VBO1);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

var aPos1 = gl.getAttribLocation(program, 'aPos');
gl.vertexAttribPointer(aPos1, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPos1);

var VAO2 = ext.createVertexArrayOES();
ext.bindVertexArrayOES(VAO2);

var VBO2 = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, VBO2);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle), gl.STATIC_DRAW);

var aPos2 = gl.getAttribLocation(program, 'aPos');
gl.vertexAttribPointer(aPos2, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPos2);



render();
function render() {
    //render here
    // viewport();
    gl.clearColor(0,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    ext.bindVertexArrayOES(VAO1);
    gl.drawArrays(gl.LINE_STRIP, 0, num * 4);
    ext.bindVertexArrayOES(VAO2);
    gl.drawArrays(gl.LINE_STRIP, 0, 900);

    requestAnimationFrame(render);
}

function viewport() {
    let winSize;

    if(canvas.width>canvas.height) {
        winSize = canvas.height;
    }else {
        winSize = canvas.width;
    }

    gl.viewport((canvas.width-winSize)/2,(canvas.height-winSize)/2,winSize,winSize);
}

function initGL() {
    canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl2');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    viewport();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
}