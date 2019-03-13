uniform float time;
uniform float testing;
uniform float delta; // about 0.016

const float PI = 3.141592653589793;

const float UPPER_BOUNDS = BOUNDS;
const float LOWER_BOUNDS = -UPPER_BOUNDS;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// simple, no change
void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 velocity = texture2D( textureVelocity, uv );

    gl_FragColor = vec4( velocity  );

}