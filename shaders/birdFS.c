varying vec4 vColor;
varying float z;

uniform vec3 color;
uniform float time;

void main() {
    //float a = clamp( (400.0-(300.0-z)) / 400.0, 0.0, 1.0 ) ;
    float a = clamp( (100.0 + z) / 400.0, 0.05, 1.0 ) ;
    gl_FragColor = vec4(vColor.rgb, a);
}
