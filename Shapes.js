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
const TYPES={
    normal:0,
    reflect:1,
    refract:2,
}


function Shape(gl, ambient, diffuse, specular, shininess,type=0) {
    switch (type) {
        case TYPES.normal:{
            this.program = loadShaders(gl, "vshader.glsl", "fshader.glsl");
            break;
        }
        case TYPES.reflect:{
            this.program = loadShaders(gl, "vshader.glsl", "reflect.glsl");
            break;
        }
        case TYPES.refract:{
            this.program = loadShaders(gl, "vshader.glsl", "refract.glsl");
            break;
        }
        default:{
        }

    }
    this.program.aPosition = gl.getAttribLocation(this.program, "aPosition");
    this.program.aTexCoords = gl.getAttribLocation(this.program, "aTexCoords");
    this.program.aNormal = gl.getAttribLocation(this.program, "aNormal");
    this.program.uModel = gl.getUniformLocation(this.program, "uModel");
    this.program.uView = gl.getUniformLocation(this.program, "uView");
    this.program.uProjection = gl.getUniformLocation(this.program, "uProjection");
    this.program.viewPos = gl.getUniformLocation(this.program, "viewPos");

    this.VAO = gl.createVertexArray();

    // Material
    this.ambient = ambient;
    this.diffuse = diffuse;
    this.specular = specular;
    this.shininess = shininess;

    this.applyMaterial(gl);

    this.num = 0;
    this.modelMatrix = new Matrix4();
    this.translate=null;
    this.rotate=null;
    this.scale=null;
}

Shape.prototype.applyMaterial=function(gl){
    gl.useProgram(this.program);
    let location = gl.getUniformLocation(this.program, "material.ambient");
    gl.uniform3fv(location, this.ambient.elements);
    location = gl.getUniformLocation(this.program, "material.diffuse");
    gl.uniform3fv(location, this.diffuse.elements);
    location = gl.getUniformLocation(this.program, "material.specular");
    gl.uniform3fv(location, this.specular.elements);
    location = gl.getUniformLocation(this.program, "material.shininess");
    gl.uniform1f(location, this.shininess);
};

Shape.prototype.bufferData = function (gl, position, normal, texcords) {
    gl.bindVertexArray(this.VAO);
    this.positionBuffer = createEmptyArrayBuffer(gl, this.program.aPosition, 3, gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    this.normalBuffer = createEmptyArrayBuffer(gl, this.program.aNormal, 3, gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    this.texcordBuffer = createEmptyArrayBuffer(gl, this.program.aTexCoords, 2, gl.FLOAT);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcords), gl.STATIC_DRAW);
};

Shape.prototype.draw = function (gl) {
    this.modelMatrix.setIdentity();
    if(this.translate!=null) this.modelMatrix.translate(this.translate[0],this.translate[1],this.translate[2]);
    if(this.rotate!=null)this.modelMatrix.rotate(this.rotate[0],this.rotate[1],this.rotate[2],this.rotate[3]);
    if(this.scale!=null)this.modelMatrix.scale(this.scale[0],this.scale[1],this.scale[2]);
    // Normal scene
    useProgram(gl, this.program);
    gl.uniformMatrix4fv(this.program.uModel, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(this.program.uView, false, viewMatrix.elements);
    gl.uniformMatrix4fv(this.program.uProjection, false, projectionMatrix.elements);
    gl.uniform3fv(this.program.viewPos, camera.Position.elements);


    gl.bindVertexArray(this.VAO);
    gl.drawArrays(gl.TRIANGLES, 0, this.num);
};

function Cube(gl, ambient, diffuse, specular, shininess,type=0) {
    Shape.call(this, gl, ambient, diffuse, specular, shininess,type);
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
    this.bufferData(gl, this.position, this.normal, this.texcords);
}

Cube.prototype = Object.create(Shape.prototype);
Cube.prototype.constructor = Cube;

function Sphere(gl, xlevel, ylevel, ambient, diffuse, specular, shininess,type=0) {
    Shape.call(this, gl, ambient, diffuse, specular, shininess,type);
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
    this.bufferData(gl, this.position, this.normal, this.texcords);
}

Sphere.prototype = Object.create(Shape.prototype);
Sphere.prototype.constructor = Sphere;

function Cylinder(gl, level, ambient, diffuse, specular, shininess,type=0) {
    Shape.call(this, gl, ambient, diffuse, specular, shininess,type);
    this.position = [];
    this.normal = [];
    this.texcords = [];

    let delta_theta = 2 * Math.PI / level;
    let p_theta = 0;
    for (let theta = delta_theta; theta <= 2 * Math.PI; theta += delta_theta) {
        this.position.push(0);
        this.position.push(1);
        this.position.push(0);
        this.position.push(Math.cos(p_theta));
        this.position.push(1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(theta));
        this.position.push(1);
        this.position.push(Math.sin(theta));

        this.normal.push(0);
        this.normal.push(1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(1);
        this.normal.push(0);

        this.position.push(Math.cos(p_theta));
        this.position.push(1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(theta));
        this.position.push(1);
        this.position.push(Math.sin(theta));

        this.normal.push(Math.cos(p_theta));
        this.normal.push(0);
        this.normal.push(Math.sin(p_theta));
        this.normal.push(Math.cos(p_theta));
        this.normal.push(0);
        this.normal.push(Math.sin(p_theta));
        this.normal.push(Math.cos(theta));
        this.normal.push(0);
        this.normal.push(Math.sin(theta));

        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(theta));
        this.position.push(-1);
        this.position.push(Math.sin(theta));
        this.position.push(Math.cos(theta));
        this.position.push(1);
        this.position.push(Math.sin(theta));

        this.normal.push(Math.cos(p_theta));
        this.normal.push(0);
        this.normal.push(Math.sin(p_theta));
        this.normal.push(Math.cos(theta));
        this.normal.push(0);
        this.normal.push(Math.sin(theta));
        this.normal.push(Math.cos(theta));
        this.normal.push(0);
        this.normal.push(Math.sin(theta));

        this.position.push(0);
        this.position.push(-1);
        this.position.push(0);
        this.position.push(Math.cos(theta));
        this.position.push(-1);
        this.position.push(Math.sin(theta));
        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));

        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        p_theta = theta;
        this.num += 12;
    }
    this.texcords = Array(this.num * 2);
    this.bufferData(gl, this.position, this.normal, this.texcords);
}

Cylinder.prototype = Object.create(Shape.prototype);
Cylinder.prototype.constructor = Cylinder;

function Cone(gl, level, ambient, diffuse, specular, shininess,type=0) {
    Shape.call(this, gl, ambient, diffuse, specular, shininess,type);
    this.position = [];
    this.normal = [];
    this.texcords = [];

    let delta_theta = 2 * Math.PI / level;
    let p_theta = 0;
    for (let theta = delta_theta; theta <= 2 * Math.PI; theta += delta_theta) {
        this.position.push(0);
        this.position.push(1);
        this.position.push(0);
        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(theta));
        this.position.push(-1);
        this.position.push(Math.sin(theta));

        let mid = (p_theta+theta)/2;
        let t = 2/Math.sqrt(5);

        this.normal.push(Math.cos(mid)*2*t);
        this.normal.push(t);
        this.normal.push(Math.sin(mid)*2*t);
        this.normal.push(Math.cos(p_theta)*2*t);
        this.normal.push(t);
        this.normal.push(Math.sin(p_theta)*2*t);
        this.normal.push(Math.cos(theta)*2*t);
        this.normal.push(t);
        this.normal.push(Math.sin(theta)*2*t);


        this.position.push(0);
        this.position.push(-1);
        this.position.push(0);
        this.position.push(Math.cos(theta));
        this.position.push(-1);
        this.position.push(Math.sin(theta));
        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));

        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        p_theta = theta;
        this.num += 6;
    }
    this.texcords = Array(this.num * 2);
    this.bufferData(gl, this.position, this.normal, this.texcords);
}

Cone.prototype = Object.create(Shape.prototype);
Cone.prototype.constructor = Cone;

function Prism(gl, level, ambient, diffuse, specular, shininess,type=0) {
    Shape.call(this, gl, ambient, diffuse, specular, shininess,type);
    this.position = [];
    this.normal = [];
    this.texcords = [];

    let delta_theta = 2 * Math.PI / level;
    let p_theta = 0;
    for (let theta = delta_theta; theta <= 2 * Math.PI; theta += delta_theta) {
        this.position.push(0);
        this.position.push(1);
        this.position.push(0);
        this.position.push(Math.cos(p_theta));
        this.position.push(1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(theta));
        this.position.push(1);
        this.position.push(Math.sin(theta));

        this.normal.push(0);
        this.normal.push(1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(1);
        this.normal.push(0);

        this.position.push(Math.cos(p_theta));
        this.position.push(1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(theta));
        this.position.push(1);
        this.position.push(Math.sin(theta));

        let p1p2 = new Vector3([0,-2,0]);
        let p2p3 = new Vector3([Math.cos(theta)-Math.cos(p_theta),2,Math.sin(theta)-Math.sin(p_theta)]);
        let faceNormal = p2p3.cross(p1p2);


        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);
        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);
        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);

        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(theta));
        this.position.push(-1);
        this.position.push(Math.sin(theta));
        this.position.push(Math.cos(theta));
        this.position.push(1);
        this.position.push(Math.sin(theta));

        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);
        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);
        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);

        this.position.push(0);
        this.position.push(-1);
        this.position.push(0);
        this.position.push(Math.cos(theta));
        this.position.push(-1);
        this.position.push(Math.sin(theta));
        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));

        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        p_theta = theta;
        this.num += 12;
    }
    this.texcords = Array(this.num * 2);
    this.bufferData(gl, this.position, this.normal, this.texcords);
}

Prism.prototype = Object.create(Shape.prototype);
Prism.prototype.constructor = Prism;

function Frustum(gl, scale,level, ambient, diffuse, specular, shininess,type=0) {
    Shape.call(this, gl, ambient, diffuse, specular, shininess,type);
    this.position = [];
    this.normal = [];
    this.texcords = [];

    let delta_theta = 2 * Math.PI / level;
    let p_theta = 0;
    for (let theta = delta_theta; theta <= 2 * Math.PI; theta += delta_theta) {
        this.position.push(0);
        this.position.push(1);
        this.position.push(0);
        this.position.push(Math.cos(p_theta)*scale);
        this.position.push(1);
        this.position.push(Math.sin(p_theta)*scale);
        this.position.push(Math.cos(theta)*scale);
        this.position.push(1);
        this.position.push(Math.sin(theta)*scale);

        this.normal.push(0);
        this.normal.push(1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(1);
        this.normal.push(0);

        this.position.push(Math.cos(p_theta)*scale);
        this.position.push(1);
        this.position.push(Math.sin(p_theta)*scale);
        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(theta)*scale);
        this.position.push(1);
        this.position.push(Math.sin(theta)*scale);

        let p1p2 = new Vector3([Math.cos(p_theta)-Math.cos(p_theta)*scale,-2,Math.sin(p_theta)-Math.sin(p_theta)*scale]);
        let p2p3 = new Vector3([Math.cos(theta)*scale-Math.cos(p_theta),2,Math.sin(theta)*scale-Math.sin(p_theta)]);
        let faceNormal = p2p3.cross(p1p2);


        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);
        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);
        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);

        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));
        this.position.push(Math.cos(theta));
        this.position.push(-1);
        this.position.push(Math.sin(theta));
        this.position.push(Math.cos(theta)*scale);
        this.position.push(1);
        this.position.push(Math.sin(theta)*scale);

        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);
        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);
        this.normal.push(faceNormal.elements[0]);
        this.normal.push(faceNormal.elements[1]);
        this.normal.push(faceNormal.elements[2]);

        this.position.push(0);
        this.position.push(-1);
        this.position.push(0);
        this.position.push(Math.cos(theta));
        this.position.push(-1);
        this.position.push(Math.sin(theta));
        this.position.push(Math.cos(p_theta));
        this.position.push(-1);
        this.position.push(Math.sin(p_theta));

        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        this.normal.push(0);
        this.normal.push(-1);
        this.normal.push(0);
        p_theta = theta;
        this.num += 12;
    }
    this.texcords = Array(this.num * 2);
    this.bufferData(gl, this.position, this.normal, this.texcords);
}

Frustum.prototype = Object.create(Shape.prototype);
Frustum.prototype.constructor = Frustum;