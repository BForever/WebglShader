#version 300 es
#ifdef GL_ES
precision mediump float;
#endif
out vec4 FragColor;

in vec3 TexCoords;

uniform samplerCube skybox;

void main()
{
    FragColor = sqrt(texture(skybox, TexCoords));
//FragColor = vec4(TexCoords,1.0);
}