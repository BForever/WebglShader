#version 300 es
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
}