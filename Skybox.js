const BOXDIRNAMES = ["rt","lf","up","dn","bk","ft"];

function SkyBox(gl,boxpath) {
    this.program = loadShaders(gl, "skyBoxVshader.glsl", "skyBoxFshader.glsl");
    this.program.aPosition = gl.getAttribLocation(this.program, "aPosition");
    this.program.uView = gl.getUniformLocation(this.program, "uView");
    this.program.uProjection = gl.getUniformLocation(this.program, "uProjection");
    this.program.skybox = gl.getUniformLocation(this.program, "skybox");

    useProgram(gl, this.program);

    this.VAO = gl.createVertexArray();
    gl.bindVertexArray(this.VAO);

    this.VBO = createEmptyArrayBuffer(gl, this.program.aPosition, 3, gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skyBoxCube), gl.STATIC_DRAW);

    gl.activeTexture(gl.TEXTURE0);
    this.texture = gl.createTexture();
    gl.uniform1i(this.program.skybox, this.texture);

    let images = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
    for (let i = 0; i < 6; i++) {
        images[i].onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };
        images[i].src = boxpath + "_" + BOXDIRNAMES[i] + ".png";
    }
}

SkyBox.prototype.draw=function (gl) {

    viewMatrix.removeTranslate();
    useProgram(gl,this.program);
    gl.uniformMatrix4fv(gl.program.uView, false, viewMatrix.elements);
    gl.uniformMatrix4fv(gl.program.uProjection, false, projectionMatrix.elements);

    gl.depthFunc(gl.LEQUAL);
    gl.bindVertexArray(this.VAO);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.depthFunc(gl.LESS);
};