// attrs: position, color, reference
attribute vec3 color;
attribute vec2 reference;
// attribute vec2 uv;

uniform sampler2D texturePosition;
uniform float time;

uniform mat4 flintRotation;

varying vec4 vColor;
varying vec2 vUv;
varying float vTime;

void main() {

    // testing uniform flintRotation
    vec4 newPosition = flintRotation * vec4(position, 1.0);
    if (reference.x < 0.3) {
        newPosition = flintRotation * newPosition;
    }

    // local disposition 
    vec4 texel = texture2D( texturePosition, reference );
    vec4 pos = vec4(texel.xyz, 0);
    newPosition += pos;

    gl_Position = projectionMatrix *  viewMatrix  * modelMatrix * newPosition;
    vColor = vec4( color, 0.5 );
    vUv = uv;
    vTime = time;

}