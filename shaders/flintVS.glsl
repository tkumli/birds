// attrs: position, color, reference
attribute vec3 color;
attribute vec2 reference;

uniform sampler2D texturePosition;
uniform float time;

varying vec4 vColor;

void main() {

    vec4 newPosition = vec4(position, 1.0);

    vec4 texel = texture2D( texturePosition, reference );
    vec3 pos = texel.xyz;
    newPosition += vec4(pos, 0.0);

    newPosition = modelMatrix * newPosition;

    gl_Position = projectionMatrix *  viewMatrix  * newPosition;
    vColor = vec4( color, 1.0 );

}