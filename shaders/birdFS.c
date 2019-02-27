varying vec4 vColor;
varying float z;

uniform vec3 color;

void main() {
    // Fake colors for now
    // float z2 = 0.2 + ( 1000. - z ) / 1000. * vColor.x;
    // gl_FragColor = vec4( z2, z2, z2, 1. );

    //float a = 0.2 + ( 1000. - z ) / 1000. ;
    // float a = sin(z);
    // gl_FragColor = vec4(vColor.rgb, a);
    gl_FragColor = vColor;

}
