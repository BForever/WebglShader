function RTBox(gl) {
    this.program = loadShaders(gl, "vshader.glsl", "RTF.glsl");
    if (!this.program) {
        console.log("无法初始化片元着色器");
    }
    gl.useProgram(this.program);

    this.program.aPosition = gl.getAttribLocation(this.program, "aPosition");
    this.program.aTexCoords = gl.getAttribLocation(this.program, "aTexCoords");
    this.program.aNormal = gl.getAttribLocation(this.program, "aNormal");
    this.program.uModel = gl.getUniformLocation(this.program, "uModel");
    this.program.uView = gl.getUniformLocation(this.program, "uView");
    this.program.uProjection = gl.getUniformLocation(this.program, "uProjection");
    this.program.randomSeed = gl.getUniformLocation(this.program, "randomSeed");
    this.program.cameraPosition = gl.getUniformLocation(this.program, "camera.Position");
    this.program.cameraFront = gl.getUniformLocation(this.program, "camera.Front");
    this.program.cameraRight = gl.getUniformLocation(this.program, "camera.Right");
    this.program.cameraUp = gl.getUniformLocation(this.program, "camera.Up");
    this.program.cameraZoom = gl.getUniformLocation(this.program, "camera.Zoom");
    this.program.cameraNear = gl.getUniformLocation(this.program, "camera.Near");
    this.program.cameraFar = gl.getUniformLocation(this.program, "camera.Far");

    this.modelMatrix = new Matrix4();

    gl.uniform1f(this.program.cameraNear,1);
    gl.uniform1f(this.program.cameraFar,2000);

    this.VAO = gl.createVertexArray();
    gl.bindVertexArray(this.VAO);

    let vbo = createEmptyArrayBuffer(gl,this.program.aPosition,3,gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(skyBoxCube),gl.STATIC_DRAW);

    gl.uniform1f(this.program.randomSeed,new Date().getMilliseconds());
}
RTBox.prototype.draw=function (gl) {
    gl.useProgram(this.program);
    gl.uniform3fv(this.program.cameraPosition,camera.Position.elements);
    gl.uniform3fv(this.program.cameraFront,camera.Front.elements);
    gl.uniform3fv(this.program.cameraRight,camera.Right.elements);
    gl.uniform3fv(this.program.cameraUp,camera.Up.elements);
    gl.uniform1f(this.program.cameraZoom,camera.Zoom);

    gl.uniformMatrix4fv(this.program.uModel, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(this.program.uView, false, viewMatrix.elements);
    gl.uniformMatrix4fv(this.program.uProjection, false, projectionMatrix.elements);

    gl.bindVertexArray(this.VAO);
    gl.drawArrays(gl.TRIANGLES,0,36);
}