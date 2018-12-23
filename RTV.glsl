#version 300 es
in vec3 aPosition;
out vec3 Normal;
void main()
{
    gl_Position = vec4(aPosition, 1.0);
}