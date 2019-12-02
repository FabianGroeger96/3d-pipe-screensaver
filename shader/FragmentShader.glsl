precision mediump float;
varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vNormalEye;
varying vec3 vVertexPositionEye3;

uniform sampler2D uSampler2D;
uniform bool uEnableTexture;

uniform bool uEnableLighting;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;

const float ambientFactor = 0.3;
const float shininess = 4.0;
const vec3 specularMaterialColor = vec3(0.6, 0.6, 0.6);

void main () {
    vec3 baseColor = vColor.xyz;
    if (uEnableTexture) {
        baseColor = texture2D(uSampler2D, vec2(vTextureCoord.s, vTextureCoord.t)).rgb;
    }

    if (uEnableLighting) {
        // calculate light direction as seen from the vertex position
        vec3 lightDirectionEye = normalize(uLightPosition - vVertexPositionEye3);
        vec3 normal = normalize(vNormalEye);

        // ambient lighting
        vec3 ambientColor = ambientFactor * baseColor.rgb;

        // diffuse lighting
        float diffuseFactor = max(0.0, dot(normal, lightDirectionEye));
        vec3 diffuseColor = uLightColor * baseColor * diffuseFactor;

        // specular lighting
        vec3 specularColor = vec3(0, 0, 0);
        if (diffuseFactor > 0.0) {
            //vec3 reflectionDir = (2.0 * normal * dot(normal, lightDirectionEye)) - lightDirectionEye;
            vec3 reflectionDir = reflect(-lightDirectionEye, normal);
            vec3 eyeDir = -normalize(vVertexPositionEye3);
            float cosPhi = max(0.0, dot(reflectionDir, eyeDir));
            float specularFactor = pow(cosPhi, shininess);
            specularColor = uLightColor * specularFactor * specularMaterialColor;
        }

        vec3 color = ambientColor + diffuseColor + specularColor;
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(baseColor, 1.0);
    }
}