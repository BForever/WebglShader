#version 300 es
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
#define NR_POINT_LIGHTS 1
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
    //第三阶段：聚光
    for(int i = 0; i < NR_SPOT_LIGHTS; i++)
        result += CalcSpotLight(spotLights[i], norm, FragPos, viewDir);

    FragColor = vec4(result, 1.0);
//    FragColor = sqrt(vec4(spotLights[0].diffuse, 1.0));
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
}