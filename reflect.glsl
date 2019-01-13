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
    vec3 rayin = normalize(FragPos - viewPos);
    vec3 reflected = reflect(rayin, normalize(Normal));
    FragColor = sqrt(vec4(texture(skybox, reflected).xyz, 1.0));
}