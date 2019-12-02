attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vNormalEye;
varying vec3 vVertexPositionEye3;

uniform mat4 uProjectionMat;
uniform mat4 uModelViewMat;
uniform mat3 uNormalMat;

void main() {
    // calculate the vertex position in eye coordinates
    vec4 vertexPos = vec4(aVertexPosition, 1);
    vec4 vertexPositionEye4 = uModelViewMat * vertexPos;
    vVertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;

    // calculate the normal vector in eye coordinates
    vNormalEye = normalize(uNormalMat * aVertexNormal);

    vColor = aVertexColor;
    vTextureCoord = aTextureCoord;

    gl_Position = uProjectionMat * vertexPositionEye4;
}