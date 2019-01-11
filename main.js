function main() {
    // Programs
    let skyboxProgram = loadShaders(gl, "skyBoxVshader.glsl", "skyBoxFshader.glsl");
    skyboxProgram.aPosition = gl.getAttribLocation(skyboxProgram, "aPosition");
    skyboxProgram.uView = gl.getUniformLocation(skyboxProgram, "uView");
    skyboxProgram.uProjection = gl.getUniformLocation(skyboxProgram, "uProjection");
    skyboxProgram.skybox = gl.getUniformLocation(skyboxProgram, "skybox");

    // Skybox
    useProgram(gl, skyboxProgram);
    let skybox = loadSkyBox(gl, "resources/hw_alps/alps");
    gl.uniform1i(skyboxProgram.skybox, skybox);

    let skyboxVAO = gl.createVertexArray();
    gl.bindVertexArray(skyboxVAO);

    let skyboxVBO = createEmptyArrayBuffer(gl,skyboxProgram.aPosition,3,gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skyboxVertices), gl.STATIC_DRAW);

    // Camera

    // Model


    render();
    gl.enable(gl.DEPTH_TEST);
    function render() {
        updateElapsed();
        ProcessInput(camera);

        gl.clearColor(1, 1, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //计算模型视图投影矩阵
        let projectionMatrix = new Matrix4();
        projectionMatrix.setPerspective(camera.Zoom, canvas.width / canvas.height, 0.01, 1000.0);
        let viewMatrix = camera.getViewMatrix();
        viewMatrix.removeTranslate();
        //设置模型视图投影矩阵
        useProgram(gl,skyboxProgram);
        gl.uniformMatrix4fv(gl.program.uView, false, viewMatrix.elements);
        gl.uniformMatrix4fv(gl.program.uProjection, false, projectionMatrix.elements);

        gl.bindVertexArray(skyboxVAO);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        requestAnimationFrame(render);
    }

}

main();