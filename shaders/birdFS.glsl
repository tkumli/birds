varying vec4 vColor;
varying float z;

uniform vec3 color;   // a color uniform also?
uniform float time;

void main() {
    // kinda fog effect...
    float a = clamp( (100.0 + z) / 400.0, 0.05, 1.0 ) ;
    gl_FragColor = vec4(vColor.rgb, a);
}
