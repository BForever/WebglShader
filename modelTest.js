var objv =`#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoords;

out vec3 Normal;
out vec3 FragPos;
out vec2 TexCoords;

uniform mat4 uModel,uView,uProjection;

void main()
{
    gl_Position = uProjection* uView * uModel * vec4(aPosition, 1.0);
    FragPos = vec3(uModel * vec4(aPosition, 1.0));
    Normal = mat3(transpose(inverse(uModel))) * aNormal;
    TexCoords = aTexCoords;
}`;

var objf =`#version 300 es
#ifdef GL_ES
precision mediump float;
#endif
out vec4 FragColor;

in vec3 Normal;
in vec3 FragPos;
in vec2 TexCoords;

uniform vec3 viewPos;

struct Material{
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    sampler2D   ambientTex;
    int ambientNr;
    sampler2D   diffuseTex;
    int diffuseNr;
    sampler2D   specularTex;
    int specularNr;
    sampler2D   normalTex;
    int normalNr;
    sampler2D   heightTex;
    int heightNr;
    float       shininess;
};

uniform Material material;

struct PointLight {
    vec3 position;

    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
#define NR_POINT_LIGHTS 4
uniform PointLight pointLights[NR_POINT_LIGHTS];
struct DirLight {
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
uniform DirLight dirLight;
struct SpotLight {
    vec3 position;
    vec3 direction;

    float innerCutoff;
    float outerCutoff;

    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
#define NR_SPOT_LIGHTS 1
uniform SpotLight spotLights[NR_SPOT_LIGHTS];

vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);


void main()
{

    // 属性
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);

    // 第一阶段：定向光照
    vec3 result = CalcDirLight(dirLight, norm, viewDir);
    // 第二阶段：点光源
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], norm, FragPos, viewDir);
    // 第三阶段：聚光
    for(int i = 0; i < NR_SPOT_LIGHTS; i++)
        result += CalcSpotLight(spotLights[i], norm, FragPos, viewDir);

    // if(material.ambientNr>0)
        FragColor = vec4(result, 1.0);
    // else
        // FragColor = vec4(1,0,0, 1.0);
//    FragColor = vec4(texture(material.diffuse[0], TexCoords));
}
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir)
{
    vec3 lightDir = normalize(-light.direction);
    // 漫反射着色
    float diff = max(dot(normal, lightDir), 0.0);
    // 镜面光着色
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    // 合并结果
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    if(material.ambientNr>0){
        ambient  = light.ambient  * vec3(texture(material.diffuseTex, TexCoords));
    }else{
        ambient  = light.ambient  * material.ambient;
    }
    if(material.diffuseNr>0){
        diffuse  = light.diffuse  * diff * vec3(texture(material.diffuseTex, TexCoords));
    }else{
        diffuse  = light.diffuse  * diff * material.diffuse;
    }
    if(material.specularNr>0){
        specular  = light.specular  * spec * vec3(texture(material.specularTex, TexCoords));
    }else{
        specular  = light.specular  * spec * material.specular;
    }

    return (ambient + diffuse + specular);
}
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);
    // 漫反射着色
    float diff = max(dot(normal, lightDir), 0.0);
    // 镜面光着色
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    // 衰减
    float distance    = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance +
                 light.quadratic * (distance * distance));

    // 合并结果
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    if(material.ambientNr>0){
        ambient  = light.ambient  * vec3(texture(material.diffuseTex, TexCoords));
    }else{
        ambient  = light.ambient  * material.ambient;
    }
    if(material.diffuseNr>0){
        diffuse  = light.diffuse  * diff * vec3(texture(material.diffuseTex, TexCoords));
    }else{
        diffuse  = light.diffuse  * diff * material.diffuse;
    }
    if(material.specularNr>0){
        specular  = light.specular  * spec * vec3(texture(material.specularTex, TexCoords));
    }else{
        specular  = light.specular  * spec * material.specular;
    }

    return attenuation * (ambient + diffuse + specular);
}
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    // Attenuation
    float distance    = length(light.position - FragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance +light.quadratic * (distance * distance));

    // Diffuse
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);

    // Specular
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

    // Spotlight
    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon   = light.innerCutoff - light.outerCutoff;
    float intensity = clamp((theta - light.outerCutoff) / epsilon, 0.0, 1.0);

    // 合并结果
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    if(material.ambientNr>0){
        ambient  = light.ambient  * vec3(texture(material.diffuseTex, TexCoords));
    }else{
        ambient  = light.ambient  * material.ambient;
    }
    if(material.diffuseNr>0){
        diffuse  = light.diffuse  * diff * vec3(texture(material.diffuseTex, TexCoords));
    }else{
        diffuse  = light.diffuse  * diff * material.diffuse;
    }
    if(material.specularNr>0){
        specular  = light.specular  * spec * vec3(texture(material.specularTex, TexCoords));
    }else{
        specular  = light.specular  * spec * material.specular;
    }

    return ambient+attenuation*intensity*(diffuse+specular);
}`;

function main() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext('webgl2');
    // var gl = getWebGLContext(canvas);

    if(!gl){
        console.log("无法获取WebGL的上下文");
        return;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // alert(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));

    var program=initShaders(gl, objv, objf);
    //初始化着色器
    if(!program){
        console.log("无法初始化片元着色器");
        return;
    }
    useProgram(gl,program);


    //设置背景色和隐藏面消除
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //获取着色器相关的attribute和uniform变量
    program.aPosition = gl.getAttribLocation(program, "aPosition");
    program.aTexCoords = gl.getAttribLocation(program, "aTexCoords");
    program.aNormal = gl.getAttribLocation(program, "aNormal");
    program.uModel = gl.getUniformLocation(program, "uModel");
    program.uView = gl.getUniformLocation(program, "uView");
    program.uProjection = gl.getUniformLocation(program, "uProjection");

    if(program.aPosition < 0 || program.aTexCoords < 0 || program.aNormal < 0 || !program.uModel || !program.uView|| !program.uProjection){
        console.log("无法获取到attribute和uniform相关变量");
        return;
    }

    var model = new Model(gl, program);
    if(!model){
        console.log("无法准备空白缓冲区");
        return;
    }

    var dirlight = new DirLight();
    dirlight.ambient = new Vector3([0.2,0.2,0.2]);
    dirlight.direction = new Vector3([0,0,-1]);
    dirlight.diffuse = new Vector3([1,1,1]);
    dirlight.specular = new Vector3([1,1,1]);

    dirlight.use(gl);

    //计算视点投影矩阵
    var camera = new Camera();
    var projectionMatrix = new Matrix4();

    // canvas.addEventListener('mousedown',onDocumentMousewheel,false);
    canvas.onmousewheel = function (event) {
        camera.ProcessMouseScroll(event.deltaY/100)
    };


    //读取OBJ文件
    model.readOBJFile("resources/file.obj", gl, true);


    var currentAngle = 0.0; //当前模型的旋转角度
    var tick = function () {
        updateElapsed();

        ProcessInput(camera);

        projectionMatrix.setPerspective(camera.Zoom,canvas.width/canvas.height, 1.0, 1000.0);
        var viewMatrix = camera.getViewMatrix();

        //设置模型旋转
        var modelMatrix = new Matrix4();
        modelMatrix.setRotate(currentAngle, 1.0, 0.0, 0.0);
        modelMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
        modelMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
        modelMatrix.scale(1, 1, 1);

        //计算模型视图投影矩阵
        gl.uniformMatrix4fv(gl.program.uModel, false, modelMatrix.elements);
        gl.uniformMatrix4fv(gl.program.uView, false, viewMatrix.elements);
        gl.uniformMatrix4fv(gl.program.uProjection, false, projectionMatrix.elements);
        gl.uniform3fv(gl.getUniformLocation(gl.program,"viewPos"),camera.Position.elements);

        currentAngle = animate(currentAngle); //更新角度
        model.draw(gl);
        requestAnimationFrame(tick);
    };


    tick();
}

var last = +new Date();
var elapsed = 0;
function updateElapsed() {
    var now = +new Date();
    elapsed = now - last;
    last = now;
}

//模型角度改变函数
var angle_step = 30;
function animate(angle) {
    var newAngle = angle + (angle_step * elapsed) / 1000.0;
    return newAngle % 360;
}

//添加键盘监听事件
document.addEventListener('keydown',onDocumentKeyDown,false);
document.addEventListener('keyup',onDocumentKeyUp,false);
// document.addEventListener('mousemove',onDocumentMousewheel,false);


var PRESSINGKEY = new Map();
main();


function onDocumentKeyDown(event) {
    var code;
    if (event.key !== undefined) {
        code = event.key;
    } else if (event.keyCode !== undefined) {
        code = event.keyCode;
    }
    PRESSINGKEY.set(code,true);
}
function onDocumentKeyUp(){
    var code;
    if (event.key !== undefined) {
        code = event.key;
    } else if (event.keyCode !== undefined) {
        code = event.keyCode;
    }
    PRESSINGKEY.delete(code);
}

function ProcessInput(camera) {
    if(PRESSINGKEY.get(DIRECTION.FORWARD)!==undefined){
        camera.ProcessPosition(DIRECTION.FORWARD,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.BACKWARD)!==undefined){
        camera.ProcessPosition(DIRECTION.BACKWARD,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.LEFT)!==undefined){
        camera.ProcessPosition(DIRECTION.LEFT,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.RIGHT)!==undefined){
        camera.ProcessPosition(DIRECTION.RIGHT,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.ARROWUP)!==undefined){
        camera.ProcessRotation(0,elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.ARROWDOWN)!==undefined){
        camera.ProcessRotation(0,-elapsed);
    }
    if(PRESSINGKEY.get(DIRECTION.ARROWLEFT)!==undefined){
        camera.ProcessRotation(-elapsed,0);
    }
    if(PRESSINGKEY.get(DIRECTION.ARROWRIGHT)!==undefined){
        camera.ProcessRotation(elapsed,0);
    }
}