const skyBoxCube = [
    -1.0, 1.0, -1.0,
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0,

    -1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0,

    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,

    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0
];

function Shape(gl,ambient,diffuse,specular,shininess) {
    this.program = loadShaders(gl, "vshader.glsl", "fshader.glsl");
    this.program.aPosition = gl.getAttribLocation(this.program, "aPosition");
    this.program.aTexCoords = gl.getAttribLocation(this.program, "aTexCoords");
    this.program.aNormal = gl.getAttribLocation(this.program, "aNormal");
    this.program.uModel = gl.getUniformLocation(this.program, "uModel");
    this.program.uView = gl.getUniformLocation(this.program, "uView");
    this.program.uProjection = gl.getUniformLocation(this.program, "uProjection");
    this.program.viewPos=gl.getUniformLocation(this.program,"viewPos");

    this.VAO = gl.createVertexArray();

    // Material
    gl.useProgram(this.program);
    let location = gl.getUniformLocation(this.program, "material.ambient");
    gl.uniform3fv(location, ambient.elements);
    location = gl.getUniformLocation(this.program, "material.diffuse");
    gl.uniform3fv(location, diffuse.elements);
    location = gl.getUniformLocation(this.program, "material.specular");
    gl.uniform3fv(location, specular.elements);
    location = gl.getUniformLocation(this.program, "material.shininess");
    gl.uniform1f(location, shininess);

    this.num=0;
    this.modelMatrix = new Matrix4();
}

Shape.prototype.bufferData = function(gl,position,normal,texcords){
    gl.bindVertexArray(this.VAO);
    this.positionBuffer = createEmptyArrayBuffer(gl,this.program.aPosition,3,gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    this.normalBuffer = createEmptyArrayBuffer(gl,this.program.aNormal,3,gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    this.texcordBuffer = createEmptyArrayBuffer(gl,this.program.aTexCoords,2,gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcords), gl.STATIC_DRAW);
};

Shape.prototype.draw = function (gl) {
    // Normal scene
    useProgram(gl,this.program);
    gl.uniformMatrix4fv(this.program.uModel, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(this.program.uView, false, viewMatrix.elements);
    gl.uniformMatrix4fv(this.program.uProjection, false, projectionMatrix.elements);
    gl.uniform3fv(this.program.viewPos,camera.Position.elements);

    gl.bindVertexArray(this.VAO);
    gl.drawArrays(gl.TRIANGLES,0,this.num);
};

function Cube(gl,ambient,diffuse,specular,shininess) {
    Shape.call(this,gl,ambient,diffuse,specular,shininess);
    this.num = 36;
    this.position = [
        -1, 1, -1,
        -1, -1, -1,
        1, -1, -1,
        1, -1, -1,
        1, 1, -1,
        -1, 1, -1,

        -1, -1, 1,
        -1, -1, -1,
        -1, 1, -1,
        -1, 1, -1,
        -1, 1, 1,
        -1, -1, 1,

        1, -1, -1,
        1, -1, 1,
        1, 1, 1,
        1, 1, 1,
        1, 1, -1,
        1, -1, -1,

        -1, -1, 1,
        -1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        1, -1, 1,
        -1, -1, 1,

        -1, 1, -1,
        1, 1, -1,
        1, 1, 1,
        1, 1, 1,
        -1, 1, 1,
        -1, 1, -1,

        -1, -1, -1,
        -1, -1, 1,
        1, -1, -1,
        1, -1, -1,
        -1, -1, 1,
        1, -1, 1
    ];
    this.normal = [
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
    ];
    this.texcords = Array(72);
    this.bufferData(gl,this.position,this.normal,this.texcords);
}
Cube.prototype = Object.create(Shape.prototype);
Cube.prototype.constructor = Cube;

function Sphere(gl,xlevel, ylevel,ambient,diffuse,specular,shininess) {
    Shape.call(this,gl,ambient,diffuse,specular,shininess);
    this.position = [];
    this.normal = [];
    this.texcords = [];
    let delta_phi = Math.PI / ylevel;
    let p_phi = 0;
    for (let phi = delta_phi; phi <= Math.PI; phi += delta_phi) {
        if (phi > Math.PI) phi = Math.PI;

        let delta_theta = 2 * Math.PI / xlevel;
        let p_theta = 0;
        for (let theta = delta_theta; theta <= 2 * Math.PI; theta += delta_theta) {
            this.position.push(Math.sin(p_phi) * Math.cos(p_theta));
            this.position.push(Math.cos(p_phi));
            this.position.push(Math.sin(p_phi) * Math.sin(p_theta));
            this.position.push(Math.sin(phi) * Math.cos(p_theta));
            this.position.push(Math.cos(phi));
            this.position.push(Math.sin(phi) * Math.sin(p_theta));
            this.position.push(Math.sin(p_phi) * Math.cos(theta));
            this.position.push(Math.cos(p_phi));
            this.position.push(Math.sin(p_phi) * Math.sin(theta));

            this.normal.push(Math.sin(p_phi) * Math.cos(p_theta));
            this.normal.push(Math.cos(p_phi));
            this.normal.push(Math.sin(p_phi) * Math.sin(p_theta));
            this.normal.push(Math.sin(phi) * Math.cos(p_theta));
            this.normal.push(Math.cos(phi));
            this.normal.push(Math.sin(phi) * Math.sin(p_theta));
            this.normal.push(Math.sin(p_phi) * Math.cos(theta));
            this.normal.push(Math.cos(p_phi));
            this.normal.push(Math.sin(p_phi) * Math.sin(theta));

            this.texcords.push(p_theta / (2 * Math.PI));
            this.texcords.push(p_phi / Math.PI);
            this.texcords.push(p_theta / (2 * Math.PI));
            this.texcords.push(phi / Math.PI);
            this.texcords.push(theta / (2 * Math.PI));
            this.texcords.push(p_phi / Math.PI);

            this.position.push(Math.sin(p_phi) * Math.cos(theta));
            this.position.push(Math.cos(p_phi));
            this.position.push(Math.sin(p_phi) * Math.sin(theta));
            this.position.push(Math.sin(phi) * Math.cos(p_theta));
            this.position.push(Math.cos(phi));
            this.position.push(Math.sin(phi) * Math.sin(p_theta));
            this.position.push(Math.sin(phi) * Math.cos(theta));
            this.position.push(Math.cos(phi));
            this.position.push(Math.sin(phi) * Math.sin(theta));

            this.normal.push(Math.sin(p_phi) * Math.cos(theta));
            this.normal.push(Math.cos(p_phi));
            this.normal.push(Math.sin(p_phi) * Math.sin(theta));
            this.normal.push(Math.sin(phi) * Math.cos(p_theta));
            this.normal.push(Math.cos(phi));
            this.normal.push(Math.sin(phi) * Math.sin(p_theta));
            this.normal.push(Math.sin(phi) * Math.cos(theta));
            this.normal.push(Math.cos(phi));
            this.normal.push(Math.sin(phi) * Math.sin(theta));

            this.texcords.push(theta / (2 * Math.PI));
            this.texcords.push(p_phi / Math.PI);
            this.texcords.push(p_theta / (2 * Math.PI));
            this.texcords.push(phi / Math.PI);
            this.texcords.push(theta / (2 * Math.PI));
            this.texcords.push(phi / Math.PI);
            p_theta = theta;
            this.num += 6;
        }
        p_phi = phi;
    }
    this.bufferData(gl,this.position,this.normal,this.texcords);
}
Sphere.prototype = Object.create(Shape.prototype);
Sphere.prototype.constructor = Sphere;