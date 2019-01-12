function main() {
    // Skybox
    let skybox = new SkyBox(gl,"resources/hw_alps/alps");

    let objlist = [];
    objlist.push(new Sphere(gl,48,24,new Vector3([1,0,1]),new Vector3([1,0,1]),new Vector3([1,0,1]),32));
    objlist.push(new Cube(gl,new Vector3([1,0,1]),new Vector3([1,0,1]),new Vector3([1,0,1]),32));
    // Light
    let dirlight = new DirLight();
    dirlight.direction = new Vector3([1,-1,1]);

    for(let obj of objlist){
        dirlight.use(gl,obj.program);
    }

    // console.log(objlist)
    // Model

    gl.enable(gl.DEPTH_TEST);
    render();

    let i=0;
    for(let obj of objlist){
        obj.modelMatrix.translate(2*i,0,0);
        i++;
    }

    function render() {
        updateElapsed();
        ProcessInput(camera);

        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 计算模型视图投影矩阵
        projectionMatrix = new Matrix4();
        projectionMatrix.setPerspective(camera.Zoom, canvas.width / canvas.height, 0.01, 1000.0);
        viewMatrix = camera.getViewMatrix();

        // Scene
        let i=0;
        for(let obj of objlist){
            obj.draw(gl);
            i++;
        }

        // Sky box
        skybox.draw(gl);

        requestAnimationFrame(render);
    }

}
var projectionMatrix;
var viewMatrix;
main();