attribute vec2 reference;
attribute float birdVertex;

attribute vec3 birdColor;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

varying vec4 vColor;
varying float z;

uniform float time;

void main() {

    vec4 texel = texture2D( texturePosition, reference );
    vec3 pos = texel.xyz;
    // texel.z can be a new kind of attribute

    vec3 velocity = normalize(texture2D( textureVelocity, reference ).xyz);

    vec4 newPosition = modelMatrix * vec4(position, 1.0);

    newPosition += vec4(pos, 0.0);

    z = newPosition.z;
    vColor = vec4( birdColor, 1.0 );
    
    gl_Position = projectionMatrix *  viewMatrix  * newPosition;
}