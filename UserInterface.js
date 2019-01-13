initGL();
camera = new Camera();

// Keyboard
var last = +new Date();
var elapsed = 0;

function updateElapsed() {
    var now = +new Date();
    elapsed = now - last;
    last = now;
}

//添加键盘监听事件
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);
document.addEventListener('mousewheel', onDocumentMouseWheel, false);
var PRESSINGKEY = new Map();

function onDocumentMouseWheel(event) {
    camera.ProcessMouseScroll(event.deltaY / 100)
}

function onDocumentKeyDown(event) {
    var code;
    if (event.key !== undefined) {
        code = event.key;
    } else if (event.keyCode !== undefined) {
        code = event.keyCode;
    }
    PRESSINGKEY.set(code, true);
}

function onDocumentKeyUp() {
    var code;
    if (event.key !== undefined) {
        code = event.key;
    } else if (event.keyCode !== undefined) {
        code = event.keyCode;
    }
    PRESSINGKEY.delete(code);
}


function ProcessInput(camera) {
    if (PRESSINGKEY.get(DIRECTION.FORWARD) !== undefined) {
        camera.ProcessPosition(DIRECTION.FORWARD, elapsed);
    }
    if (PRESSINGKEY.get(DIRECTION.BACKWARD) !== undefined) {
        camera.ProcessPosition(DIRECTION.BACKWARD, elapsed);
    }
    if (PRESSINGKEY.get(DIRECTION.LEFT) !== undefined) {
        camera.ProcessPosition(DIRECTION.LEFT, elapsed);
    }
    if (PRESSINGKEY.get(DIRECTION.RIGHT) !== undefined) {
        camera.ProcessPosition(DIRECTION.RIGHT, elapsed);
    }
    if (PRESSINGKEY.get(DIRECTION.ARROWUP) !== undefined) {
        camera.ProcessRotation(0, elapsed);
    }
    if (PRESSINGKEY.get(DIRECTION.ARROWDOWN) !== undefined) {
        camera.ProcessRotation(0, -elapsed);
    }
    if (PRESSINGKEY.get(DIRECTION.ARROWLEFT) !== undefined) {
        camera.ProcessRotation(-elapsed, 0);
    }
    if (PRESSINGKEY.get(DIRECTION.ARROWRIGHT) !== undefined) {
        camera.ProcessRotation(elapsed, 0);
    }
}

var setupChanged = true;

var dirlight = new DirLight();
document.getElementById("dirLight_ambient").onchange =  (event) => {
    dirlight.ambient = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("dirLight_diffuse").onchange =  (event) => {
    dirlight.diffuse = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("dirLight_specular").onchange =  (event) => {
    dirlight.specular = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("dirLight_direction_x").onchange =  (event) => {
    dirlight.direction.elements[0] = parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("dirLight_direction_y").onchange =  (event) => {
    dirlight.direction.elements[1] = parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("dirLight_direction_z").onchange =  (event) => {
    dirlight.direction.elements[2] = parseFloat(event.target.value);
    setupChanged = true;
};

let pointLight = new PointLight();
document.getElementById("pointLight_ambient").onchange =  (event) => {
    pointLight.ambient = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("pointLight_diffuse").onchange =  (event) => {
    pointLight.diffuse = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("pointLight_specular").onchange =  (event) => {
    pointLight.specular = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("pointLight_position_x").onchange =  (event) => {
    pointLight.position.elements[0] = (event.target.value);
    setupChanged = true;
};
document.getElementById("pointLight_position_y").onchange =  (event) => {
    pointLight.position.elements[1] = (event.target.value);
    setupChanged = true;
};
document.getElementById("pointLight_position_z").onchange =  (event) => {
    pointLight.position.elements[2] = (event.target.value);
    setupChanged = true;
};
document.getElementById("pointLight_constant").onchange =  (event) => {
    pointLight.constant = parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("pointLight_linear").onchange =  (event) => {
    pointLight.linear =parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("pointLight_quadratic").onchange =  (event) => {
    pointLight.quadratic = parseFloat(event.target.value);
    setupChanged = true;
};

let spotLight = new SpotLight();
document.getElementById("spotLight_ambient").onchange =  (event) => {
    spotLight.ambient = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("spotLight_diffuse").onchange =  (event) => {
    spotLight.diffuse = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("spotLight_specular").onchange =  (event) => {
    spotLight.specular = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("spotLight_constant").onchange =  (event) => {
    spotLight.constant = parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("spotLight_linear").onchange =  (event) => {
    spotLight.linear =parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("spotLight_quadratic").onchange =  (event) => {
    spotLight.quadratic = parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("spotLight_innerCutoff").onchange =  (event) => {
    spotLight.innerCutoff =parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("spotLight_outerCutoff").onchange =  (event) => {
    spotLight.outerCutoff = parseFloat(event.target.value);
    setupChanged = true;
};
// Material
document.getElementById("material_ambient").onchange =  (event) => {
    editable.ambient = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("material_diffuse").onchange =  (event) => {
    editable.diffuse = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("material_specular").onchange =  (event) => {
    editable.specular = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("material_shininess").onchange =  (event) => {
    editable.shininess = parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("translate_x").onchange =  (event) => {
    if(editable.translate==null) {
        editable.translate = [parseFloat(event.target.value),0,0];
    }else {
        editable.translate[0] = parseFloat(event.target.value);
    }
    setupChanged = true;
};
document.getElementById("translate_y").onchange =  (event) => {
    if(editable.translate==null) {
        editable.translate = [0,parseFloat(event.target.value),0];
    }else {
        editable.translate[1] = parseFloat(event.target.value);
    }
    setupChanged = true;
};
document.getElementById("translate_z").onchange =  (event) => {
    if(editable.translate==null) {
        editable.translate = [0,0,parseFloat(event.target.value)];
    }else {
        editable.translate[2] = parseFloat(event.target.value);
    }
    setupChanged = true;
};
document.getElementById("rotate_x").onchange =  (event) => {
    if(editable.rotate==null) {
        editable.rotate = [0,parseFloat(event.target.value),0,0];
    }else {
        editable.rotate[1] = parseFloat(event.target.value);
    }
    setupChanged = true;
};
document.getElementById("rotate_y").onchange =  (event) => {
    if(editable.rotate==null) {
        editable.rotate = [0,0,parseFloat(event.target.value),0];
    }else {
        editable.rotate[2] = parseFloat(event.target.value);
    }
    setupChanged = true;
};
document.getElementById("rotate_z").onchange =  (event) => {
    if(editable.rotate==null) {
        editable.rotate = [0,0,0,parseFloat(event.target.value)];
    }else {
        editable.rotate[3] = parseFloat(event.target.value);
    }
    setupChanged = true;
};
document.getElementById("angle").onchange =  (event) => {
    if(editable.rotate==null) {
        editable.rotate = [parseFloat(event.target.value),0,0,0];
    }else {
        editable.rotate[0] = parseFloat(event.target.value);
    }
    setupChanged = true;
};

document.getElementById("scale_x").onchange =  (event) => {
    if(editable.scale==null) {
        editable.scale = [parseFloat(event.target.value),1,1];
    }else {
        editable.scale[0] = parseFloat(event.target.value);
    }
    setupChanged = true;
};
document.getElementById("scale_y").onchange =  (event) => {
    if(editable.scale==null) {
        editable.scale = [1,parseFloat(event.target.value),1];
    }else {
        editable.scale[1] = parseFloat(event.target.value);
    }
    setupChanged = true;
};
document.getElementById("scale_z").onchange =  (event) => {
    if(editable.scale==null) {
        editable.scale = [1,1,parseFloat(event.target.value)];
    }else {
        editable.scale[2] = parseFloat(event.target.value);
    }
    setupChanged = true;
};

document.getElementById("sampleRate").onchange =  (event) => {
    rtBox.sampleRate = Math.abs(parseInt(event.target.value));
    setupChanged = true;
};
document.getElementById("maxDepth").onchange =  (event) => {
    rtBox.maxDepth = Math.abs(parseInt(event.target.value));
    setupChanged = true;
};
document.getElementById("refract").onchange =  (event) => {
    rtBox.refract = event.target.checked? 1:0;
    setupChanged = true;
};
document.getElementById("reflect").onchange =  (event) => {
    rtBox.reflect = event.target.checked? 1:0;
    setupChanged = true;
};
document.getElementById("diffuse").onchange =  (event) => {
    rtBox.diffuse = event.target.checked? 1:0;
    setupChanged = true;
};
document.getElementById("albedo").onchange =  (event) => {
    rtBox.albedo = hexToRgba(event.target.value);
    setupChanged = true;
};
document.getElementById("fuzz").onchange =  (event) => {
    rtBox.fuzz = parseFloat(event.target.value);
    setupChanged = true;
};
document.getElementById("refidx").onchange =  (event) => {
    rtBox.refidx = parseFloat(event.target.value);
    setupChanged = true;
};
var hexToRgba = function (hex) {
    let hexColor = /^#/.test(hex) ? hex.slice(1) : hex, r, g, b;
    hexColor = /^[0-9a-f]{3}|[0-9a-f]{6}$/i.test(hexColor) ? hexColor : 'fffff';
    if (hexColor.length === 3) {
        hexColor = hexColor.replace(/(\w)(\w)(\w)/gi, '$1$1$2$2$3$3');
    }
    r = hexColor.slice(0, 2);
    g = hexColor.slice(2, 4);
    b = hexColor.slice(4, 6);
    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);

    return new Vector3([r/256,g/256,b/256]);
};

// Canvas set up
function viewport() {
    let winSize;

    if (canvas.width > canvas.height) {
        winSize = canvas.height;
    } else {
        winSize = canvas.width;
    }

    gl.viewport((canvas.width - winSize) / 2, (canvas.height - winSize) / 2, winSize, winSize);
}

function initGL() {
    canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl2');
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);


}