// attrs: position, color, reference
attribute vec3 color;
attribute vec2 reference;
attribute vec3 pos2;
attribute float hide;
// attribute vec2 uv;

uniform sampler2D texturePosition;
uniform float time;

uniform mat4 flintRotation;

uniform float scale;
uniform float morph;
uniform float hideSome;

varying vec4 vColor;
varying vec2 vUv;
varying float vTime;

void main() {

    // testing uniform flintRotation
    // vec4 newPosition = flintRotation * vec4(position, 1.0);
    vec3 pos = mix(position, pos2, morph);
    vec4 newPosition = flintRotation * vec4(pos, 1.0);
    // if (reference.x < 0.3) {
    //     newPosition = flintRotation * newPosition;
    // }

    // local disposition 
    vec4 texel = texture2D( texturePosition, reference );
    vec4 flintPos = vec4(texel.xyz, 0);
    newPosition += flintPos + vec4(0.0, hide * hideSome * 100000.0, 0.0, 0.0);

    gl_Position = projectionMatrix *  viewMatrix  * modelMatrix * newPosition;
    vColor = vec4( color, 0.5 );
    vUv = uv;
    vTime = time;

}