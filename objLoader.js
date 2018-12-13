//声明变换矩阵（模型矩阵）
var g_modelMatrix = new Matrix4();
// g_modelMatrix.scale(2,1,1);

//绘制当前的模型
function draw(gl, program, angle, viewMatrix, projectionMatrix, model) {
    //判断obj文件和mtl文件都已经解析完成
    // console.log(model.objdoc)
    if (model.objdoc !== null && model.objdoc.isMTLComplete()) {
        model.drawingInfo = onReadComplete(gl, model);
        model.objdoc = null;
    }




    //判断模型数据是否解析完成
    if (!model.drawingInfo) return;

    // model.objdoc.mtls[0].materials[0].apply(gl);

    gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);

    //设置模型旋转

    g_modelMatrix.setRotate(angle, 1.0, 0.0, 0.0);
    g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
    g_modelMatrix.rotate(angle, 0.0, 0.0, 1.0);


    //计算模型视图投影矩阵
    gl.uniformMatrix4fv(program.uModel, false, g_modelMatrix.elements);
    gl.uniformMatrix4fv(program.uView, false, viewMatrix.elements);
    gl.uniformMatrix4fv(program.uProjection, false, projectionMatrix.elements);

    // console.log("model ok")
    //绘制
    gl.drawElements(gl.TRIANGLES, model.drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}

//创建缓冲区对象并初始化配置
function initVertexBuffer(gl, program) {
    var obj = {};
    obj.vertexBuffer = createEmptyArrayBuffer(gl, program.aPosition, 3, gl.FLOAT);
    obj.normalBuffer = createEmptyArrayBuffer(gl, program.aNormal, 3, gl.FLOAT);
    obj.texcordBuffer = createEmptyArrayBuffer(gl, program.aTexCoords, 2, gl.FLOAT);
    obj.indexBuffer = gl.createBuffer();
    if (!obj.vertexBuffer || !obj.normalBuffer || !obj.texcordBuffer || !obj.indexBuffer) {
        return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return obj;
}

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

function readOBJFile(filename, gl, model, scale, reverse) {
    model.objdoc = null;
    var request = new XMLHttpRequest();
    request.open("GET", filename, true);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status == 200) {
            //获取到数据调用方法处理
            onReadOBJFile(request.responseText, filename, gl, model, scale, reverse);
        }
    }
    request.send();
}

//obj文件读取成功后开始解析
function onReadOBJFile(fileString, fileName, gl, model, scale, reverse) {
    var objDoc = new OBJDoc(fileName); // 创建一个OBJDoc 对象
    var result = objDoc.parse(fileString, scale, reverse); //解析文件
    if (!result) {
        model.objdoc = null;
        model.drawingInfo = null;
        console.log("obj文件解析错误");
        return;
    } else {
        //解析成功赋值给g_objDoc
        model.objdoc = objDoc;
        console.log("解析成功");
    }
}

//obj文件已经成功读取解析后处理函数
function onReadComplete(gl, model) {
    //从OBJ文件获取顶点坐标和颜色
    var drawingInfo = model.objdoc.getDrawingInfo();

    //将数据写入缓冲区

    console.log("数据开始");
    console.log("顶点坐标", drawingInfo.vertices);
    console.log("法向量", drawingInfo.normals);
    console.log("纹理坐标", drawingInfo.texcords);
    console.log("索引值", drawingInfo.indices);
    //顶点
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    //法向量
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    //纹理坐标
    gl.bindBuffer(gl.ARRAY_BUFFER, model.texcordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.texcords, gl.STATIC_DRAW);

    //索引值
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);


    for (let i = 0;i<model.objdoc.mtls.length;i++) {
        let mtl = model.objdoc.mtls[i];
        console.log(mtl)
        for(let j = 0;j< mtl.materials.length;j++){
            let material = mtl.materials[j];
            console.log(material)
            material.apply(gl);
        }
    }


    return drawingInfo;
}


//------------------------------------------------------------------------------
// OBJParser
//------------------------------------------------------------------------------

// OBJDoc object
// Constructor
var OBJDoc = function (fileName) {
    this.fileName = fileName;
    this.mtls = new Array(0);      // Initialize the property for MTL
    this.objects = new Array(0);   // Initialize the property for Object
    this.vertices = new Array(0);  // Initialize the property for Vertex
    this.normals = new Array(0);   // Initialize the property for Normal
    this.texcords = new Array(0);   // Initialize the property for Texcord
}

// Parsing the OBJ file
OBJDoc.prototype.parse = function (fileString, scale, reverse) {
    var lines = fileString.split('\n');  // Break up into lines and store them as array
    lines.push(null); // Append null
    var index = 0;    // Initialize index of line

    var currentObject = null;
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
                var mtl = new MTLDoc();   // Create MTL instance
                this.mtls.push(mtl);
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState == 4) {
                        if (request.status != 404) {
                            onReadMTLFile(request.responseText, mtl);
                        } else {
                            mtl.complete = true;
                        }
                    }
                }
                request.open('GET', path, true);  // Create a request to acquire the file
                request.send();                   // Send the request
                continue; // Go to the next line
            case 'o':
            case 'g':   // Read Object name
                var object = this.parseObjectName(sp);
                this.objects.push(object);
                currentObject = object;
                continue; // Go to the next line
            case 'v':   // Read vertex
                var vertex = this.parseVector3(sp);
                this.vertices.push(vertex);
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
                continue; // Go to the next line
            case 'f': // Read face
                var face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
                currentObject.addFace(face);
                continue; // Go to the next line
        }
    }

    return true;
}

OBJDoc.prototype.parseMtllib = function (sp, fileName) {
    // Get directory path
    var i = fileName.lastIndexOf("/");
    var dirPath = "";
    if (i > 0) dirPath = fileName.substr(0, i + 1);

    return dirPath + sp.getWord();   // Get path
}

OBJDoc.prototype.parseObjectName = function (sp) {
    var name = sp.getWord();
    return (new OBJObject(name));
}

OBJDoc.prototype.parseVector3 = function (sp) {

    var x = sp.getFloat();
    var y = sp.getFloat();
    var z = sp.getFloat();
    var vec = [x,y,z];
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
        if (subWords.length >= 1) {
            var vi = parseInt(subWords[0]) - 1;
            face.vIndices.push(vi);
        }
        if (subWords.length >= 3) {
            var ni = parseInt(subWords[2]) - 1;
            face.nIndices.push(ni);
        } else {
            face.nIndices.push(-1);
        }
        if (subWords.length >= 5) {
            var ti = parseInt(subWords[4]) - 1;
            face.tIndices.push(ti);
        } else {
            face.tIndices.push(-1);
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
    console.log(normal)
    if (normal == null) {
        normal = [0.0, 1.0, 0.0];
    }
    if (reverse) {
        normal[0] = -normal[0];
        normal[1] = -normal[1];
        normal[2] = -normal[2];
    }
    face.normal = new Normal(normal[0], normal[1], normal[2]);

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

    return face;
}

// Analyze the material file
function onReadMTLFile(fileString, mtl) {
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
                    mtl.materials.push(material);
                    material = new Material(name);
                } else {
                    material.name = name;
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
            case 'map_Ka':   // Read ambient map{
                if (name === "") continue; // Go to the next line because of Error
                path = sp.getWord();
                if (material.ambientNr === 0) {
                    material.ambientTexture = new Texture(gl, path, "ambient");
                }
                continue; // Go to the next line
            case 'map_Kd':   // Read diffuse map
                if (name === "") continue; // Go to the next line because of Error
                path = sp.getWord();
                if (material.diffuseNr === 0) {
                    material.diffuseTexture = new Texture(gl, path, "diffuse");
                }
                continue; // Go to the next line
            case 'map_Ks':   // Read specular map
                if (name === "") continue; // Go to the next line because of Error
                path = sp.getWord();
                if (material.specularNr === 0) {
                    material.specularTexture = new Texture(gl, path, "specular");
                }
                continue; // Go to the next line
            case 'map_bump':   // Read height map
                if (name === "") continue; // Go to the next line because of Error
                path = sp.getWord();
                if (material.heightNr === 0) {
                    material.heightTexture = new Texture(gl, path, "height");
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
            console.log("mtl false")
            return false;
        } else {
            let mtl = this.mtls[i];
            for (let j = 0; j < mtl.materials.length; j++) {
                if (!mtl.materials[j].iscomplete()) {
                    console.log("materials false")
                    return false;
                }
            }
        }
    }
    console.log("mtl complete")
    return true;
}

//------------------------------------------------------------------------------
// Retrieve the information for drawing 3D model
OBJDoc.prototype.getDrawingInfo = function () {
    // Create an arrays for vertex coordinates, normals, colors, and indices
    var numIndices = 0;
    for (var i = 0; i < this.objects.length; i++) {
        numIndices += this.objects[i].numIndices;
    }
    var numVertices = numIndices;
    var vertices = new Float32Array(numVertices * 3);
    var normals = new Float32Array(numVertices * 3);
    var texcords = new Float32Array(numVertices * 2);
    var indices = new Uint16Array(numIndices);

    // console.log(this.vertices);
    // console.log(this.objects[0]);

    // Set vertex, normal and color
    var index_indices = 0;
    for (var i = 0; i < this.objects.length; i++) {
        var object = this.objects[i];
        for (var j = 0; j < object.faces.length; j++) {
            var face = object.faces[j];
            var faceNormal = face.normal;
            for (var k = 0; k < face.vIndices.length; k++) {
                // Set index
                indices[index_indices] = index_indices;
                // Copy vertex
                var vIdx = face.vIndices[k];
                var vertex = this.vertices[vIdx];
                vertices[index_indices * 3 + 0] = vertex.elements[0];
                vertices[index_indices * 3 + 1] = vertex.elements[1];
                vertices[index_indices * 3 + 2] = vertex.elements[2];
                // Copy Texture coordinates
                var tIdx = face.tIndices[k];
                if (tIdx >= 0) {
                    var texcord = this.texcords[vIdx];
                    texcords[index_indices * 2 + 0] = texcord.elements[0];
                    texcords[index_indices * 2 + 1] = texcord.elements[1];
                }
                // Copy normal
                var nIdx = face.nIndices[k];
                if (nIdx >= 0) {
                    var normal = this.normals[nIdx];
                    normals[index_indices * 3 + 0] = normal.elements[0];
                    normals[index_indices * 3 + 1] = normal.elements[1];
                    normals[index_indices * 3 + 2] = normal.elements[2];
                } else {
                    normals[index_indices * 3 + 0] = faceNormal.x;
                    normals[index_indices * 3 + 1] = faceNormal.y;
                    normals[index_indices * 3 + 2] = faceNormal.z;
                }
                index_indices++;
            }
        }
    }

    return new DrawingInfo(vertices, normals, texcords, indices);
}

//------------------------------------------------------------------------------
// MTLDoc Object
//------------------------------------------------------------------------------
var MTLDoc = function () {
    this.complete = false; // MTL is configured correctly
    this.materials = new Array(0);
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
    this.ambient = new Vector3([0,0,0]);
    this.diffuse = new Vector3([0,0,0]);
    this.specular = new Vector3([0,0,0]);
    this.ambientNr = 0;
    this.diffuseNr = 0;
    this.specularNr = 0;
    this.heightNr = 0;
    this.normalNr = 0;
}

Material.prototype.apply = function(gl){
    var location = gl.getUniformLocation(gl.program,"material.ambient");
    gl.uniform3fv(location,this.ambient.elements);
    location = gl.getUniformLocation(gl.program,"material.diffuse");
    gl.uniform3fv(location,this.diffuse.elements);
    location = gl.getUniformLocation(gl.program,"material.specular");
    gl.uniform3fv(location,this.specular.elements);
}

Material.prototype.iscomplete = function () {
    if(this.ambientNr>0){
        if(!this.ambientTexture.complete)return false;
    }
    if(this.diffuseNr>0){
        if(!this.diffuseTexture.complete)return false;
    }
    if(this.specularNr>0){
        if(!this.specularTexture.complete)return false;
    }
    if(this.heightNr>0){
        if(!this.heightTexture.complete)return false;
    }
    // if(this.normalNr>0){
    //     if(!this.normalTexture.complete)return false;
    // }
    return true;
}
var LoadedTextures;
var TextureNum = 0;
var Texture = function (gl, path, type) {
    console.log("load tex "+path)
    if (LoadedTextures.hasOwnProperty(path)) {
        return Textures[path];
    } else {
        this.complete = false;
        this.id = TextureNum++;
        LoadedTextures[path] = this;
        var image = new Image(path);
        image.onload = function () {
            this.uniformName = "material." + type + "Tex";
            this.NrName = "material." + type + "Nr";
            this.sampler = gl.getUniformLocation(gl.program, this.uniformName);
            this.Nr = gl.getUniformLocation(gl.program, this.NrName);
            this.texture = gl.createTexture();
            this.load = function () {
                gl.activeTexture(gl.TEXTURE0 + this.id);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.uniform1i(this.sampler, this.id);
                gl.uniform1i(this.Nr, 1);
            };
            this.complete = true;
        }.bind(this);
        image.src = path;
    }
}

//------------------------------------------------------------------------------
// Vertex Object
//------------------------------------------------------------------------------
var Vertex = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

//------------------------------------------------------------------------------
// Normal Object
//------------------------------------------------------------------------------
var Normal = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

//------------------------------------------------------------------------------
// Color Object
//------------------------------------------------------------------------------
var ColorRGBA = function (r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

var ColorRGB = function (r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
}

//------------------------------------------------------------------------------
// OBJObject Object
//------------------------------------------------------------------------------
var OBJObject = function (name) {
    this.name = name;
    this.faces = new Array(0);
    this.numIndices = 0;
}

OBJObject.prototype.addFace = function (face) {
    this.faces.push(face);
    this.numIndices += face.numIndices;
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
// DrawInfo Object
//------------------------------------------------------------------------------
var DrawingInfo = function (vertices, normals, texcords, indices) {
    this.vertices = vertices;
    this.normals = normals;
    this.texcords = texcords;
    this.indices = indices;
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
    if (n == 0) return null;
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
    return v.elements;
}
