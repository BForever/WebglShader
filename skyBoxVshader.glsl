#version 300 es
in vec3 aPosition;

out vec3 TexCoords;

uniform mat4 uView,uProjection;

void main()
{
    vec4 pos = uProjection* uView * vec4(aPosition, 1.0);
    gl_Position = pos.xyww;
    TexCoords = aPosition;
}