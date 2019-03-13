// attributes
attribute vec3 meshColor;
attribute vec2 reference;
attribute float vertIx;

// texture uniforms - what we calculate GPU side
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

// varyings
varying vec4 vColor;
varying float z;

// uniforms
uniform float time;

void main() {

    vec4 posTexel = texture2D( texturePosition, reference );
    vec3 worldPosition = posTexel.xyz;
    // posTexel.w may carry some additional info
    vec3 velocity = normalize(texture2D( textureVelocity, reference ).xyz);

    // model
    vec3 newPosition = position;
    newPosition = mat3( modelMatrix ) * position;

    newPosition += vec3(0., 10.*sin(time/200.), 0.); 
    newPosition += worldPosition;
    newPosition = (viewMatrix * vec4(newPosition, 1.)).xyz;
    newPosition = (0.5 + 0.5 * sin(time/200.)) * newPosition;
    // view, projection
    //gl_Position = projectionMatrix * viewMatrix  * vec4( newPosition, 1.0 );
    gl_Position = vec4(normalize(newPosition.xyz), 1.);
    //gl_Position = vec4(newPosition.xyz, 1.);

    // also calculating varyings
    z = newPosition.z;
    vColor = vec4( meshColor, 1.0 );

}