
function DirLight() {
    this.ambient = new Vector3([0,0,0]);
    this.diffuse = new Vector3([0,0,0]);
    this.specular = new Vector3([0,0,0]);
    this.direction = new Vector3([0,0,0]);
}

DirLight.prototype.use = function (gl) {
    var location = gl.getUniformLocation(gl.program,"dirLight.ambient");
    gl.uniform3fv(location,this.ambient.elements);
    location = gl.getUniformLocation(gl.program,"dirLight.diffuse");
    gl.uniform3fv(location,this.diffuse.elements);
    location = gl.getUniformLocation(gl.program,"dirLight.specular");
    gl.uniform3fv(location,this.specular.elements);
    location = gl.getUniformLocation(gl.program,"dirLight.direction");
    gl.uniform3fv(location,this.direction.elements);
}