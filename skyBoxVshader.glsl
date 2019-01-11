#version 300 es
in vec3 aPosition;

out vec3 TexCoords;

uniform mat4 uView,uProjection;

void main()
{
    gl_Position = uProjection* uView * vec4(aPosition, 1.0);
    TexCoords = aPosition;
}