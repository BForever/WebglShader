function SpotLight() {
    this.ambient = new Vector3([0,0,0]);
    this.diffuse = new Vector3([0,0,0]);
    this.specular = new Vector3([0,0,0]);

    this.constant = 1;
    this.linear = 0.09;
    this.quadratic = 0.032;

    this.direction = new Vector3([0,0,0]);

    this.innerCutoff = 10;
    this.outerCutoff = 15;

    this.position = new Vector3([0,0,0]);
}

SpotLight.prototype.use = function (gl,program) {
    gl.useProgram(program);
    let location = gl.getUniformLocation(program,"spotLights[0].ambient");
    gl.uniform3fv(location,this.ambient.elements);
    location = gl.getUniformLocation(program,"spotLights[0].diffuse");
    gl.uniform3fv(location,this.diffuse.elements);
    location = gl.getUniformLocation(program,"spotLights[0].specular");
    gl.uniform3fv(location,this.specular.elements);

    location = gl.getUniformLocation(program,"spotLights[0].position");
    gl.uniform3fv(location,camera.Position.elements);
    location = gl.getUniformLocation(program,"spotLights[0].direction");
    gl.uniform3fv(location,camera.Front.elements);

    location = gl.getUniformLocation(program,"spotLights[0].constant");
    gl.uniform1f(location,this.constant);
    location = gl.getUniformLocation(program,"spotLights[0].linear");
    gl.uniform1f(location,this.linear);
    location = gl.getUniformLocation(program,"spotLights[0].quadratic");
    gl.uniform1f(location,this.quadratic);

    location = gl.getUniformLocation(program,"spotLights[0].innerCutoff");
    gl.uniform1f(location,Math.cos(radians(this.innerCutoff)));
    location = gl.getUniformLocation(program,"spotLights[0].outerCutoff");
    gl.uniform1f(location,Math.cos(radians(this.outerCutoff)));
}