function PointLight() {
    this.ambient = new Vector3([1,1,1]);
    this.diffuse = new Vector3([1,1,1]);
    this.specular = new Vector3([1,1,1]);
    this.constant = 1;
    this.linear = 0.09;
    this.quadratic = 0.032;
    this.position = new Vector3([0,0,-1]);
}

PointLight.prototype.use = function (gl,program) {
    gl.useProgram(program);
    let location = gl.getUniformLocation(program,"pointLight[0].ambient");
    gl.uniform3fv(location,this.ambient.elements);
    location = gl.getUniformLocation(program,"pointLight[0].diffuse");
    gl.uniform3fv(location,this.diffuse.elements);
    location = gl.getUniformLocation(program,"pointLight[0].specular");
    gl.uniform3fv(location,this.specular.elements);

    location = gl.getUniformLocation(program,"pointLight[0].constant");
    gl.uniform1f(location,this.constant);
    location = gl.getUniformLocation(program,"pointLight[0].linear");
    gl.uniform1f(location,this.linear);
    location = gl.getUniformLocation(program,"pointLight[0].quadratic");
    gl.uniform1f(location,this.quadratic);

    location = gl.getUniformLocation(program,"pointLight[0].position");
    gl.uniform3fv(location,this.position.elements);
}