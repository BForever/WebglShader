var vertexShaderSource = "" +
    "attribute vec4 a_Position;\n" +
    "attribute vec4 a_Color;\n" +
    "attribute vec4 a_Normal;\n" +
    "uniform mat4 u_MvpMatrix;\n" +
    "uniform mat4 u_NormalMatrix;\n" +
    "varying vec4 v_Color;\n" +
    "void main(){\n" +
    "   vec3 lightDirection = vec3(-0.35, 0.35, 0.87);\n" +
    "   gl_Position = u_MvpMatrix * a_Position;\n" +
    "   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    "   float nDotL = max(dot(normal, lightDirection), 0.0);\n" +
    "   v_Color = vec4(a_Color.rgb * nDotL, a_Color.a);\n" +
    "}\n";

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

    FragColor = vec4(result, 1.0);
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


//片元着色器
var fragmentShaderSource = "" +
    "#ifdef GL_ES\n" +
    "precision mediump float;\n" +
    "#endif\n" +
    "varying vec4 v_Color;\n" +
    "void main(){\n" +
    "   gl_FragColor = v_Color;\n" +
    "}\n";

function main() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext('webgl2');
    // var gl = getWebGLContext(canvas);

    if(!gl){
        console.log("无法获取WebGL的上下文");
        return;
    }

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

    //为顶点坐标、颜色和法向量准备空白缓冲区对象
    var model = initVertexBuffer(gl, program);
    if(!model){
        console.log("无法准备空白缓冲区");
        return;
    }
    var dirlight = new DirLight();
    dirlight.ambient = new Vector3([0.2,0.2,0.2]);
    dirlight.direction = new Vector3([0,-1,0]);
    dirlight.diffuse = new Vector3([1,1,1]);
    console.log(dirlight)
    dirlight.set(gl);

    //计算视点投影矩阵
    var projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(45.0,canvas.width/canvas.height, 1.0, 1000.0);

    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    //读取OBJ文件
    readOBJFile("resources/cube.obj", gl, model, 60, true);

    var currentAngle = 0.0; //当前模型的旋转角度
    var tick = function () {
        currentAngle = animate(currentAngle); //更新角度
        draw(gl, program, currentAngle, viewMatrix,projectionMatrix, model);
        requestAnimationFrame(tick);
    };


    tick();
}
//模型角度改变函数
var angle_step = 30;
var last = +new Date();

function animate(angle) {
    var now = +new Date();
    var elapsed = now - last;
    last = now;
    var newAngle = angle + (angle_step * elapsed) / 1000.0;
    return newAngle % 360;
}
main();