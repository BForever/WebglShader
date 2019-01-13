
function main() {
    // Skybox
    let skybox = new SkyBox(gl, "resources/hw_alps/alps");

    // RayTracing Box
    rtBox =new RTBox(gl, skybox.texture);
    rtBox.translate=[0, 0, -20];
    rtBox.scale=[5, 5, 5];

    // Model
    let model = new Model(gl);
    model.readOBJFile("resources/file.obj", gl, true);
    model.translate=[-5, -0.5, 10];
    model.rotate=[180, 0, 1, 0];
    model.scale=[0.1, 0.1, 0.1];

    // let table = new Model(gl);
    // table.readOBJFile("resources/table/file.obj", gl, true);
    // table.translate=[0, -15, 0];
    // // table.rotate=[180, 0, 1, 0];
    // table.scale=[0.1, 0.1, 0.1];

    // Model with texture
    let texturemodel = new Model(gl);
    texturemodel.readOBJFile("resources/moon.obj", gl, true);
    texturemodel.translate=[5, 3, 10];
    texturemodel.scale=[0.07, 0.07, 0.07];

    editable = new Frustum(gl, 0.7, 7,new Vector3(),new Vector3(),new Vector3(),32);
    let objlist = [];

    // Basic shapes
    let o3 = new Sphere(gl, 48, 24, new Vector3([0.0215, 0.1745, 0.0215]), new Vector3([0.07568, 0.61424, 0.07568]), new Vector3([0.633, 0.727811, 0.633]), 0.6,TYPES.reflect);
    let o2 = new Cube(gl, new Vector3([0.19225,	0.19225,	0.19225]), new Vector3([0.50754,	0.50754	,0.50754]), new Vector3([0.508273,	0.508273	,0.508273]), 0.4);
    let o1 = new Cylinder(gl, 20, new Vector3([0.24725, 0.1995, 0.0745]), new Vector3([0.75164, 0.60648, 0.22648]), new Vector3([0.628281, 0.555802, 0.366065]), 0.4)
    let o6 = new Cone(gl, 70, new Vector3([0.0, 0.1, 0.06]), new Vector3([0.0, 0.50980392, 0.50980392]), new Vector3([0.50196078, 0.50196078, 0.50196078]), 0.25);
    let o5 = new Prism(gl, 7, new Vector3([0.1745	,0.01175,	0.01175]), new Vector3([0.61424,	0.04136	,0.04136]), new Vector3([0.727811	,0.626959	,0.626959]), 0.6);
    let o4 = new Frustum(gl, 0.5, 7, new Vector3([0.19225, 0.19225, 0.19225]), new Vector3([0.50754, 0.50754, 0.50754]), new Vector3([0.508273, 0.508273, 0.508273]), 0.4,TYPES.refract);
    o1.translate=[-6,0,0];
    o2.translate=[-4,0,0];
    o3.translate=[-2,0,0];
    o4.translate=[2,0,0];
    o5.translate=[4,0,0];
    o6.translate=[6,0,0];
    objlist.push(o1);
    objlist.push(o2);
    objlist.push(o3);
    objlist.push(o4);
    objlist.push(o5);
    objlist.push(o6);
    objlist.push(editable);
    objlist.push(model);
    // objlist.push(table);
    objlist.push(texturemodel);
    objlist.push(rtBox);
    objlist.push(skybox);


    gl.enable(gl.DEPTH_TEST);
    render();


    function render() {
        updateElapsed();
        ProcessInput(camera);

        texturemodel.rotate=[new Date()/10,1,1,0];

        if(setupChanged){
            setupChanged = false;
            // dirLight
            for (let obj of objlist) {
                dirlight.use(gl, obj.program);
            }
            // pointLight
            for (let obj of objlist) {
                pointLight.use(gl, obj.program);
            }

            editable.applyMaterial(gl);
        }
        // spotLight
        for (let obj of objlist) {
            spotLight.use(gl, obj.program);
        }

        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        projectionMatrix = new Matrix4();
        projectionMatrix.setPerspective(camera.Zoom, canvas.width / canvas.height, 0.01, 1000.0);
        viewMatrix = camera.getViewMatrix();

        // Scene
        for (let obj of objlist) {
            obj.draw(gl);
        }

        requestAnimationFrame(render);
    }

}




main();