const BOXDIRNAMES = ["rt","lf","up","dn","ft","bk"];

function loadSkyBox(gl,boxpath) {
    let texture = gl.createTexture();

    let images = [new Image(),new Image(),new Image(),new Image(),new Image(),new Image()];
    for(let i=0;i<6;i++){
        images[i].onload = ()=>{
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };
        images[i].src = boxpath+"_"+BOXDIRNAMES[i]+".tga";
    }
}