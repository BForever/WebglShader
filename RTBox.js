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

    this.program.sampleRate = gl.getUniformLocation(this.program, "SampleRate");
    this.program.maxDepth = gl.getUniformLocation(this.program, "MaxDepth");
    this.program.refract = gl.getUniformLocation(this.program, "editMaterial.refract");
    this.program.reflect = gl.getUniformLocation(this.program, "editMaterial.reflect");
    this.program.diffuse = gl.getUniformLocation(this.program, "editMaterial.diffuse");
    this.program.albedo = gl.getUniformLocation(this.program, "editMaterial.albedo");
    this.program.fuzz = gl.getUniformLocation(this.program, "editMaterial.fuzz");
    this.program.refidx = gl.getUniformLocation(this.program, "editMaterial.refidx");

    this.sampleRate = 10;
    this.maxDepth = 20;
    this.refract = 0;
    this.reflect = 0;
    this.diffuse = 0;
    this.albedo = new Vector3([0,0,0]);
    this.fuzz = 0.1;
    this.refidx = 1.5;

    this.modelMatrix = new Matrix4();
    this.translate=null;
    this.rotate=null;
    this.scale=null;

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
    gl.uniform1f(this.program.randomSeed,new Date().getMilliseconds());

    gl.uniform1i(this.program.sampleRate,this.sampleRate);
    gl.uniform1i(this.program.maxDepth,this.maxDepth);
    gl.uniform1i(this.program.refract,this.refract);
    gl.uniform1i(this.program.reflect,this.reflect);
    gl.uniform1i(this.program.diffuse,this.diffuse);
    gl.uniform3fv(this.program.albedo,this.albedo.elements);
    gl.uniform1f(this.program.fuzz,this.fuzz);
    gl.uniform1f(this.program.refidx,this.refidx);

    this.modelMatrix.setIdentity();
    if(this.translate!=null) this.modelMatrix.translate(this.translate[0],this.translate[1],this.translate[2]);
    if(this.rotate!=null)this.modelMatrix.rotate(this.rotate[0],this.rotate[1],this.rotate[2],this.rotate[3]);
    if(this.scale!=null)this.modelMatrix.scale(this.scale[0],this.scale[1],this.scale[2]);

    gl.uniformMatrix4fv(this.program.uModel, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(this.program.uView, false, viewMatrix.elements);
    gl.uniformMatrix4fv(this.program.uProjection, false, projectionMatrix.elements);

    gl.bindVertexArray(this.VAO);
    gl.drawArrays(gl.TRIANGLES,0,36);
}