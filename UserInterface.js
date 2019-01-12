initGL();
var gl;
var canvas;
var camera = new Camera();

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
    console.log(event)
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
    dirlight.direction.elements[0] = event.target.value;
    setupChanged = true;
};
document.getElementById("dirLight_direction_y").onchange =  (event) => {
    dirlight.direction.elements[1] = event.target.value;
    setupChanged = true;
};
document.getElementById("dirLight_direction_z").onchange =  (event) => {
    dirlight.direction.elements[2] = event.target.value;
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