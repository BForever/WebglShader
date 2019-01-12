
function main() {
    // Skybox
    let skybox = new SkyBox(gl, "resources/hw_alps/alps");

    // Model
    let model = new Model(gl);
    model.readOBJFile("resources/file.obj", gl, true);
    model.modelMatrix.translate(-5, 0, 10);
    model.modelMatrix.rotate(180, 0, 1, 0);
    model.modelMatrix.scale(0.1, 0.1, 0.1);

    let texturemodel = new Model(gl);
    texturemodel.readOBJFile("resources/moon.obj", gl, true);
    texturemodel.modelMatrix.translate(5, 3, 10);
    texturemodel.modelMatrix.scale(0.07, 0.07, 0.07);

    let objlist = [];

    objlist.push(new Sphere(gl, 48, 24, new Vector3([0.0215, 0.1745, 0.0215]), new Vector3([0.07568, 0.61424, 0.07568]), new Vector3([0.633, 0.727811, 0.633]), 0.6));
    objlist.push(new Cube(gl, new Vector3([0.329412, 0.223529, 0.027451]), new Vector3([0.780392, 0.568627, 0.113725]), new Vector3([0.992157, 0.941176, 0.807843]), 0.21794872));
    objlist.push(new Cylinder(gl, 20, new Vector3([0.24725, 0.1995, 0.0745]), new Vector3([0.75164, 0.60648, 0.22648]), new Vector3([0.628281, 0.555802, 0.366065]), 0.4));
    objlist.push(new RTBox(gl, skybox.texture));
    objlist.push(new Cone(gl, 70, new Vector3([0.0, 0.1, 0.06]), new Vector3([0.0, 0.50980392, 0.50980392]), new Vector3([0.50196078, 0.50196078, 0.50196078]), 0.25));
    objlist.push(new Prism(gl, 7, new Vector3([0.1745	,0.01175,	0.01175]), new Vector3([0.61424,	0.04136	,0.04136]), new Vector3([0.727811	,0.626959	,0.626959]), 0.6));
    objlist.push(new Frustum(gl, 0.5, 7, new Vector3([0.19225, 0.19225, 0.19225]), new Vector3([0.50754, 0.50754, 0.50754]), new Vector3([0.508273, 0.508273, 0.508273]), 0.4));

    gl.enable(gl.DEPTH_TEST);
    render();

    let i = -3;
    for (let obj of objlist) {
        if (obj.modelMatrix != null)
            obj.modelMatrix.translate(2 * i, 0, 0);
        i++;
    }

    function render() {
        updateElapsed();
        ProcessInput(camera);

        if(setupChanged){
            setupChanged = false;

            // dirLight
            for (let obj of objlist) {
                dirlight.use(gl, obj.program);
            }
            dirlight.use(gl, model.program);
            dirlight.use(gl, texturemodel.program);

            // pointLight
            for (let obj of objlist) {
                pointLight.use(gl, obj.program);
            }
            pointLight.use(gl, model.program);
            pointLight.use(gl, texturemodel.program);

            // spotLight
            for (let obj of objlist) {
                spotLight.use(gl, obj.program);
            }
            spotLight.use(gl, model.program);
            spotLight.use(gl, texturemodel.program);
        }

        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 计算模型视图投影矩阵
        projectionMatrix = new Matrix4();
        projectionMatrix.setPerspective(camera.Zoom, canvas.width / canvas.height, 0.01, 1000.0);
        viewMatrix = camera.getViewMatrix();

        // Scene
        for (let obj of objlist) {
            obj.draw(gl);
        }
        model.draw(gl);
        texturemodel.draw(gl);

        // Sky box
        skybox.draw(gl);

        requestAnimationFrame(render);
    }

}




main();