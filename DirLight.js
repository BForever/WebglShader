function DirLight() {
    this.ambient = new Vector3([1,1,1]);
    this.diffuse = new Vector3([1,1,1]);
    this.specular = new Vector3([1,1,1]);
    this.direction = new Vector3([0,0,-1]);
}

DirLight.prototype.use = function (gl,program) {
    gl.useProgram(program);
    let location = gl.getUniformLocation(program,"dirLight.ambient");
    gl.uniform3fv(location,this.ambient.elements);
    location = gl.getUniformLocation(program,"dirLight.diffuse");
    gl.uniform3fv(location,this.diffuse.elements);
    location = gl.getUniformLocation(program,"dirLight.specular");
    gl.uniform3fv(location,this.specular.elements);
    location = gl.getUniformLocation(program,"dirLight.direction");
    gl.uniform3fv(location,this.direction.elements);
}