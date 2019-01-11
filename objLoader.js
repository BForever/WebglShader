//绘制当前的模型
Model.prototype.draw = function (gl) {
    //判断obj文件和mtl文件都已经解析完成
    if (this.loading === true && this.objDoc.isMTLComplete()) {
        this.onReadComplete(gl, this);
        this.loading = false;
        this.loaded = true;

    }

    if (!this.loaded) return;

    gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
    for (let i = 0; i < this.objDoc.nodes.length; i++) {
        let node = this.objDoc.nodes[i];
        node.material.apply(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,node.indexBuffer);
        gl.drawElements(gl.TRIANGLES, node.indices.length, gl.UNSIGNED_INT, 0);
    }

};

//创建一个缓冲区对象，将其分配给属性变量，并启用赋值
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log("无法创建缓冲区");
        return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return buffer;
}

Model.prototype.readOBJFile = function (filename, gl, reverse) {
    let pathstrs = filename.split("/");
    this.directory = pathstrs.slice(0, pathstrs.length - 1).join("/");
    var request = new XMLHttpRequest();
    request.open("GET", filename, true);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status == 200) {
            //获取到数据调用方法处理
            this.onReadOBJFile(request.responseText, filename, gl, reverse);
        }
    }.bind(this);
    request.send();
};

//obj文件读取成功后开始解析
Model.prototype.onReadOBJFile = function (fileString, fileName, gl, reverse) {
    var objDoc = new OBJDoc(fileName); // 创建一个OBJDoc 对象
    var result = objDoc.parse(gl, fileString, reverse); //解析文件
    if (!result) {
        console.log("obj文件解析错误");
    } else {
        //解析成功
        this.objDoc = objDoc;
        this.loading = true;
        console.log("解析成功");
    }
};

//obj文件已经成功读取解析后处理函数
Model.prototype.onReadComplete = function (gl) {
    //从OBJ文件获取顶点坐标和颜色
    this.objDoc.Translate();

    //将数据写入缓冲区

    console.log("数据开始");
    console.log("顶点坐标", this.objDoc.vertices);
    console.log("法向量", this.objDoc.normals);
    console.log("纹理坐标", this.objDoc.texcords);
    //顶点
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.objDoc.vertices, gl.STATIC_DRAW);

    //法向量
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.objDoc.normals, gl.STATIC_DRAW);

    //纹理坐标
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.objDoc.texcords, gl.STATIC_DRAW);


    //索引值
    for (let i = 0; i < this.objDoc.nodes.length; i++) {
        let node = this.objDoc.nodes[i];
        node.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,node.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,node.indices,gl.STATIC_DRAW);
    }
    console.log(this.objDoc.nodes)
};

function Model(gl, program) {
    this.loading = false;
    this.loaded = false;
    this.objDoc = null;

    this.vertexBuffer = createEmptyArrayBuffer(gl, program.aPosition, 3, gl.FLOAT);
    this.normalBuffer = createEmptyArrayBuffer(gl, program.aNormal, 3, gl.FLOAT);
    this.texcordBuffer = createEmptyArrayBuffer(gl, program.aTexCoords, 2, gl.FLOAT);

    if (!this.vertexBuffer || !this.normalBuffer || !this.texcordBuffer) {
        console.log("无法创建缓冲区")
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}


//------------------------------------------------------------------------------
// OBJParser
//------------------------------------------------------------------------------

// OBJDoc object
// Constructor
function OBJDoc(fileName) {
    this.fileName = fileName;

    this.mtls = new Array(0);      // Initialize the property for MTL
    this.nodes = new Array(0);
    this.vertices = new Array(0);  // Initialize the property for Vertex
    this.numVertices = 0;
    this.normals = new Array(0);   // Initialize the property for Normal
    this.texcords = new Array(0);   // Initialize the property for Texcord
}

// Parsing the OBJ file
OBJDoc.prototype.parse = function (gl, fileString, reverse) {
    var lines = fileString.split('\n');  // Break up into lines and store them as array
    lines.push(null); // Append null
    var index = 0;    // Initialize index of line

    var currentNode = null;
    var currentMaterialName = "";

    // Parse line by line
    var line;         // A string in the line to be parsed
    var sp = new StringParser();  // Create StringParser
    while ((line = lines[index++]) != null) {
        sp.init(line);                  // init StringParser
        var command = sp.getWord();     // Get command
        if (command == null) continue;  // check null command

        switch (command) {
            case '#':
                continue;  // Skip comments
            case 'mtllib':     // Read Material chunk
                var path = this.parseMtllib(sp, this.fileName);
                var mtl = new MTLDoc(path);   // Create MTL instance
                this.mtls.push(mtl);
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState == 4) {
                        if (request.status != 404) {
                            onReadMTLFile(gl, request.responseText, mtl);
                        } else {
                            mtl.complete = true;
                        }
                    }
                }
                request.open('GET', path, true);  // Create a request to acquire the file
                request.send();                   // Send the request
                continue; // Go to the next line
            // case 'o':
            // case 'g':   // Read Object name
            //     var object = this.parseObjectName(sp);
            //     this.meshes.push(object);
            //     currentObject = object;
            //     continue; // Go to the next line
            case 'v':   // Read vertex
                var vertex = this.parseVector3(sp);
                this.vertices.push(vertex);
                this.numVertices++;
                continue; // Go to the next line
            case 'vn':   // Read normal
                var normal = this.parseVector3(sp);
                this.normals.push(normal);
                continue; // Go to the next line
            case 'vt':   // Read TextureCord
                var texcord = this.parseVector3(sp);
                this.texcords.push(texcord);
                continue; // Go to the next line
            case 'usemtl': // Read Material name
                currentMaterialName = this.parseUsemtl(sp);
                currentNode = new Node(currentMaterialName);
                this.nodes.push(currentNode);
                continue; // Go to the next line
            case 'f': // Read face
                var face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
                currentNode.addFace(face);
                continue; // Go to the next line
        }
    }
    return true;
}

function Node(materialName) {
    this.materialName = materialName;
    this.material = null;
    this.faces = [];
    this.numIndices = 0;
    this.indices = new Array(0);
    this.indexBuffer = null;
}

Node.prototype.addFace = function (face) {
    this.faces.push(face);
    this.numIndices += face.numIndices;
};

function getDirectoryPath(filepath) {
    // Get directory path
    var i = filepath.lastIndexOf("/");
    var dirPath = "";
    if (i > 0) dirPath = filepath.substr(0, i + 1);

    return dirPath;
}

OBJDoc.prototype.parseMtllib = function (sp) {
    return getDirectoryPath(this.fileName) + sp.getWord();   // Get path
}

OBJDoc.prototype.parseObjectName = function (sp) {
    var name = sp.getWord();
    return (new OBJObject(name));
}

OBJDoc.prototype.parseVector3 = function (sp) {

    var x = sp.getFloat();
    var y = sp.getFloat();
    var z = sp.getFloat();
    var vec = [x, y, z];
    return new Vector3(vec);
}

OBJDoc.prototype.parseUsemtl = function (sp) {
    return sp.getWord();
}

OBJDoc.prototype.parseFace = function (sp, materialName, vertices, reverse) {
    var face = new Face(materialName);
    // get indices
    for (; ;) {
        var word = sp.getWord();
        if (word == null) break;
        var subWords = word.split('/');
        let valid = true;
        for (let i = 0; i < subWords.length; i++) {
            if (isNaN(subWords[i]) || subWords == 0) valid = false;
        }
        if (!valid) break;


        if (subWords.length >= 1) {
            var vi = parseInt(subWords[0]) - 1;
            face.vIndices.push(vi);
        }
        if (subWords.length >= 2) {
            var ti = parseInt(subWords[1]) - 1;
            face.tIndices.push(ti);
        } else {
            face.tIndices.push(-1);
        }
        if (subWords.length >= 3) {
            var ni = parseInt(subWords[2]) - 1;
            face.nIndices.push(ni);
        } else {
            face.nIndices.push(-1);
        }

    }

    // calc normal
    var v0 = [
        vertices[face.vIndices[0]].elements[0],
        vertices[face.vIndices[0]].elements[1],
        vertices[face.vIndices[0]].elements[2]];
    var v1 = [
        vertices[face.vIndices[1]].elements[0],
        vertices[face.vIndices[1]].elements[1],
        vertices[face.vIndices[1]].elements[2]];
    var v2 = [
        vertices[face.vIndices[2]].elements[0],
        vertices[face.vIndices[2]].elements[1],
        vertices[face.vIndices[2]].elements[2]];

    // 计算面的法线
    var normal = calcNormal(v0, v1, v2);
    if (normal == null) {
        normal = new Vector3([0.0, 1.0, 0.0]);
    }
    if (reverse) {
        normal = normal.scalarmultiply(-1);
    }
    face.normal = normal;


    // Devide to triangles if face contains over 3 points.
    if (face.vIndices.length > 3) {
        var n = face.vIndices.length - 2;
        var newVIndices = new Array(n * 3);
        var newNIndices = new Array(n * 3);
        var newTIndices = new Array(n * 3);
        for (var i = 0; i < n; i++) {
            newVIndices[i * 3 + 0] = face.vIndices[0];
            newVIndices[i * 3 + 1] = face.vIndices[i + 1];
            newVIndices[i * 3 + 2] = face.vIndices[i + 2];
            newNIndices[i * 3 + 0] = face.nIndices[0];
            newNIndices[i * 3 + 1] = face.nIndices[i + 1];
            newNIndices[i * 3 + 2] = face.nIndices[i + 2];
            newTIndices[i * 3 + 0] = face.tIndices[0];
            newTIndices[i * 3 + 1] = face.tIndices[i + 1];
            newTIndices[i * 3 + 2] = face.tIndices[i + 2];
        }
        face.vIndices = newVIndices;
        face.nIndices = newNIndices;
        face.tIndices = newTIndices;
    }
    face.numIndices = face.vIndices.length;

    // console.log(face)
    return face;
}

// Analyze the material file
function onReadMTLFile(gl, fileString, mtl) {
    var lines = fileString.split('\n');  // Break up into lines and store them as array
    lines.push(null);           // Append null
    var index = 0;              // Initialize index of line

    // Parse line by line
    var line;      // A string in the line to be parsed
    var name = ""; // Material name
    var material = new Material(name);
    var sp = new StringParser();  // Create StringParser
    let path = "";
    while ((line = lines[index++]) != null) {
        sp.init(line);                  // init StringParser
        var command = sp.getWord();     // Get command
        if (command == null) continue;  // check null command

        switch (command) {
            case '#':
                continue;    // Skip comments
            case 'newmtl': // Read Material chunk
                name = mtl.parseNewmtl(sp);    // Get name
                if (material.name !== "") {
                    material = new Material(name);
                    mtl.materials.set(name, material);
                } else {
                    material.name = name;
                    mtl.materials.set(name, material);
                }
                continue; // Go to the next line
            case 'Ka':   // Read ambient
                if (name === "") continue; // Go to the next line because of Error
                material.ambient = mtl.parseRGB(sp);
                continue; // Go to the next line
            case 'Kd':   // Read diffuse
                if (name === "") continue; // Go to the next line because of Error
                material.diffuse = mtl.parseRGB(sp);
                continue; // Go to the next line
            case 'Ks':   // Read diffuse
                if (name === "") continue; // Go to the next line because of Error
                material.specular = mtl.parseRGB(sp);
                continue; // Go to the next line
            case 'Ns':   // Read diffuse
                if (name === "") continue; // Go to the next line because of Error
                material.shininess = sp.getFloat();
                continue; // Go to the next line
            case 'map_Ka':   // Read ambient map{
                if (name === "") continue; // Go to the next line because of Error
                path = sp.getWord();
                if (material.ambientNr === 0) {
                    material.ambientTexture = new Texture(gl, getDirectoryPath(mtl.fileName) + path, "ambient");
                    material.ambientNr = 1;
                }
                continue; // Go to the next line
            case 'map_Kd':   // Read diffuse map
                if (name === "") continue; // Go to the next line because of Error
                path = sp.getWord();
                if (material.diffuseNr === 0) {
                    material.diffuseTexture = new Texture(gl, getDirectoryPath(mtl.fileName) + path, "diffuse");
                    material.diffuseNr = 1;
                }
                continue; // Go to the next line
            case 'map_Ks':   // Read specular map
                if (name === "") continue; // Go to the next line because of Error
                path = sp.getWord();
                if (material.specularNr === 0) {
                    material.specularTexture = new Texture(gl, getDirectoryPath(mtl.fileName) + path, "specular");
                    material.specularNr = 1;
                }
                continue; // Go to the next line
            case 'map_bump':   // Read height map
                if (name === "") continue; // Go to the next line because of Error
                path = sp.getWord();
                if (material.heightNr === 0) {
                    material.heightTexture = new Texture(gl, getDirectoryPath(mtl.fileName) + path, "height");
                    material.heightNr = 1;
                }
                continue; // Go to the next line

        }
    }
    mtl.complete = true;
}

// Check Materials
OBJDoc.prototype.isMTLComplete = function () {
    // console.log("is")
    if (this.mtls.length === 0) return true;
    for (let i = 0; i < this.mtls.length; i++) {
        if (!this.mtls[i].complete) {
            return false;
        } else {
            let mtl = this.mtls[i];
            mtl.materials.forEach(function (material, name, materials) {
                if (!material.iscomplete()) return false;
            })
        }
    }
    return true;
}

OBJDoc.prototype.Translate = function () {
    let numIndices = 0;
    for (let i = 0; i < this.nodes.length; i++) {
        numIndices += this.nodes[i].numIndices;
    }
    let numVertices = numIndices;
    let vertices = new Float32Array(numVertices * 3);
    let texcords = new Float32Array(numVertices * 2);
    let normals = new Float32Array(numVertices * 3);

    // Set vertex, normal and color
    let index_indices = 0;
    for (let i = 0; i < this.nodes.length; i++) {
        let node = this.nodes[i];
        node.indices = new Uint32Array(node.numIndices);
        let index_node_indices =0;
        let foundmaterial = false;
        for(let j=0;j<this.mtls.length;j++){
            let material = this.mtls[j].materials.get(node.materialName);
            if(material !=null){
                node.material = material;
                foundmaterial = true;
                console.log("Node found material");
                break;
            }
        }
        if(!foundmaterial)console.log("Node has no material");
        for (let j = 0; j < node.faces.length; j++) {
            let face = node.faces[j];
            let faceNormal = face.normal;
            for (let k = 0; k < face.vIndices.length; k++) {
                // Set index
                node.indices[index_node_indices] = index_indices;
                // Copy vertex
                let vIdx = face.vIndices[k];
                let vertex = this.vertices[vIdx];
                // console.log(vIdx,vertex);
                vertices[index_indices * 3 + 0] = vertex.elements[0];
                vertices[index_indices * 3 + 1] = vertex.elements[1];
                vertices[index_indices * 3 + 2] = vertex.elements[2];
                // Copy Texture coordinates
                let tIdx = face.tIndices[k];
                if (tIdx >= 0) {
                    let texcord = this.texcords[tIdx];
                    texcords[index_indices * 2 + 0] = texcord.elements[0];
                    texcords[index_indices * 2 + 1] = texcord.elements[1];
                }
                // Copy normal
                let nIdx = face.nIndices[k];
                if (nIdx >= 0) {
                    let normal = this.normals[nIdx];
                    normals[index_indices * 3 + 0] = normal.elements[0];
                    normals[index_indices * 3 + 1] = normal.elements[1];
                    normals[index_indices * 3 + 2] = normal.elements[2];
                } else {
                    normals[index_indices * 3 + 0] = faceNormal.elements[0];
                    normals[index_indices * 3 + 1] = faceNormal.elements[1];
                    normals[index_indices * 3 + 2] = faceNormal.elements[2];
                }
                index_node_indices++;
                index_indices++;
            }
        }
        node.faces = null;
    }

    this.vertices = vertices;
    this.texcords = texcords;
    this.normals = normals;
}

//------------------------------------------------------------------------------
// MTLDoc Object
//------------------------------------------------------------------------------
var MTLDoc = function (fileName) {
    this.fileName = fileName;
    this.complete = false; // MTL is configured correctly
    this.materials = new Map();
}

MTLDoc.prototype.parseNewmtl = function (sp) {
    return sp.getWord();         // Get name
}

MTLDoc.prototype.parseRGB = function (sp) {
    var r = sp.getFloat();
    var g = sp.getFloat();
    var b = sp.getFloat();
    return (new Vector3([r, g, b]));
}

//------------------------------------------------------------------------------
// Material Object
//------------------------------------------------------------------------------
var Material = function (name) {
    this.name = name;
    this.ambient = new Vector3([0, 0, 0]);
    this.diffuse = new Vector3([0, 0, 0]);
    this.specular = new Vector3([0, 0, 0]);
    this.shininess = 10;
    this.ambientTexture = null;
    this.diffuseTexture = null;
    this.specularTexture = null;
    this.heightTexture = null;
    this.normalTexture = null;
    this.ambientNr = 0;
    this.diffuseNr = 0;
    this.specularNr = 0;
    this.heightNr = 0;
    this.normalNr = 0;

    this.load = null;
}

Material.prototype.apply = function (gl) {

    var location = gl.getUniformLocation(gl.program, "material.ambient");
    gl.uniform3fv(location, this.ambient.elements);
    location = gl.getUniformLocation(gl.program, "material.diffuse");
    gl.uniform3fv(location, this.diffuse.elements);
    location = gl.getUniformLocation(gl.program, "material.specular");
    gl.uniform3fv(location, this.specular.elements);
    location = gl.getUniformLocation(gl.program, "material.shininess");
    gl.uniform1f(location, this.shininess);

    // Textures
    if (this.ambientTexture != null) {
        this.ambientTexture.load(gl);
    }
    if (this.diffuseTexture != null) {
        this.diffuseTexture.load(gl);
    }
    if (this.specularTexture != null) {
        this.specularTexture.load(gl);
    }
}

Material.prototype.iscomplete = function () {
    if (this.ambientNr > 0) {
        if (!this.ambientTexture.complete) return false;
    }
    if (this.diffuseNr > 0) {
        if (!this.diffuseTexture.complete) return false;
    }
    if (this.specularNr > 0) {
        if (!this.specularTexture.complete) return false;
    }
    if (this.heightNr > 0) {
        if (!this.heightTexture.complete) return false;
    }
    // if(this.normalNr>0){
    //     if(!this.normalTexture.complete)return false;
    // }
    return true;
}
var TextureNum = 0;
var Texture = function (gl, path, type) {
    console.log("load tex " + path)
    this.complete = false;
    this.id = TextureNum++;
    var image = new Image();
    image.onload = function () {
        console.log("texture ", path, "loaded:");
        this.uniformName = "material." + type + "Tex";
        this.NrName = "material." + type + "Nr";
        this.sampler = gl.getUniformLocation(gl.program, this.uniformName);
        this.Nr = gl.getUniformLocation(gl.program, this.NrName);
        this.texture = gl.createTexture();

        gl.activeTexture(gl.TEXTURE0 + this.id);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        this.complete = true;
        console.log(this)
    }.bind(this);
    image.src = path;

}
Texture.prototype.load = function (gl) {
    gl.uniform1i(this.sampler, this.id);
    gl.uniform1i(this.Nr, 1);
}

//------------------------------------------------------------------------------
// Face Object
//------------------------------------------------------------------------------
var Face = function (materialName) {
    this.materialName = materialName;
    if (materialName == null) this.materialName = "";
    this.vIndices = new Array(0);
    this.nIndices = new Array(0);
    this.tIndices = new Array(0);
}

//------------------------------------------------------------------------------
// Constructor
var StringParser = function (str) {
    this.str;   // Store the string specified by the argument
    this.index; // Position in the string to be processed
    this.init(str);
}
// Initialize StringParser object
StringParser.prototype.init = function (str) {
    this.str = str;
    this.index = 0;
}

// Skip delimiters
StringParser.prototype.skipDelimiters = function () {
    for (var i = this.index, len = this.str.length; i < len; i++) {
        var c = this.str.charAt(i);
        // Skip TAB, Space, '(', ')
        if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
        break;
    }
    this.index = i;
}

// Skip to the next word
StringParser.prototype.skipToNextWord = function () {
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    this.index += (n + 1);
}

// Get word
StringParser.prototype.getWord = function () {
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    if (n === 0) return null;
    var word = this.str.substr(this.index, n);
    this.index += (n + 1);

    return word;
}

// Get integer
StringParser.prototype.getInt = function () {
    return parseInt(this.getWord());
}

// Get floating number
StringParser.prototype.getFloat = function () {
    return parseFloat(this.getWord());
}

// Get the length of word
function getWordLength(str, start) {
    var n = 0;
    for (var i = start, len = str.length; i < len; i++) {
        var c = str.charAt(i);
        if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"')
            break;
    }
    return i - start;
}

//------------------------------------------------------------------------------
// Common function
//------------------------------------------------------------------------------
function calcNormal(p0, p1, p2) {
    // v0: a vector from p1 to p0, v1; a vector from p1 to p2
    var v0 = new Float32Array(3);
    var v1 = new Float32Array(3);
    for (var i = 0; i < 3; i++) {
        v0[i] = p0[i] - p1[i];
        v1[i] = p2[i] - p1[i];
    }
    // The cross product of v0 and v1
    var c = new Float32Array(3);
    c[0] = v0[1] * v1[2] - v0[2] * v1[1];
    c[1] = v0[2] * v1[0] - v0[0] * v1[2];
    c[2] = v0[0] * v1[1] - v0[1] * v1[0];

    // Normalize the result
    var v = new Vector3(c);
    v.normalize();
    return v;
}
