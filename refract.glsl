#version 300 es
#ifdef GL_ES
precision mediump float;
#endif
out vec4 FragColor;

in vec3 Normal;
in vec3 FragPos;

uniform vec3 viewPos;

uniform samplerCube skybox;

void main()
{
    float ratio = 1.00 / 1.52;
    vec3 rayin = normalize(FragPos - viewPos);
    vec3 refracted = refract(rayin, normalize(Normal), ratio);
    FragColor = vec4(texture(skybox, refracted).xyz, 1.0);
}