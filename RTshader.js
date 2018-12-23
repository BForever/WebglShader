
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
    let vbo = createEmptyArrayBuffer(gl,program.aPosition,3,gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(rec),gl.STATIC_DRAW);

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.uniform1f(program.randomSeed,new Date().getMilliseconds());
    gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,6);
    let animate = function () {

        requestAnimationFrame(animate);
    };
    // animate();
}
const rec = [-1,-1,0, -1,1,0, 1,1,0,
             -1,-1,0, 1,-1,0, 1,1,0 ];

main();