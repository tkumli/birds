
varying vec4 vColor;
varying vec2 vUv;
varying float vTime;

float grid(in vec2 uv) {
    
    vec2 fr = fract(uv * 5.0);
    
    float grx = 1.0 - smoothstep(0.0, 0.02, fr.x);
    float gry = 1.0 - smoothstep(0.0, 0.02, fr.y);

    return max(grx, gry);
}

float plot(in vec2 uv, in float y) {

    return smoothstep(uv.y - 0.01, uv.y, y) - smoothstep(uv.y, uv.y + 0.01, y);

}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    //vec2 u = f*f*(3.0-2.0*f);
    vec2 u = smoothstep(0.,1.,f);
    //vec2 u = f;

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

/*
void main() {
    float t = vTime / 10000.0;
    float x = vUv.x;
    float y = 0.5 + 
              0.2 * sin( (x+t) * 10.0) + 
              0.2 * sin( (x*7.32+t/2.4) + 0.4) + 
              0.2 * sin(x*23.56 + 0.2);
    vec3 color = vec3(y);

    // grid
    float pct = grid(vUv);
    color = mix(color, vec3(0.7, 0.0, 0.5), pct);

    // plot
    pct = plot(vUv, y);
    color = mix(color, vec3(0.0, 1.0, 0.0), pct);

    //gl_FragColor = vec4(0.5, 0.1, 0.1, 1.0);
    //gl_FragColor = vec4(vColor.rgba);
    //gl_FragColor = vec4(vUv, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
}
*/

void main() {
    float rnd = random(vUv);
    //float rnd = random( floor(10.0 * vUv) );
    vec3 col1 = vec3(rnd);

    float rnd1 = noise(15.0 * vUv);
    float rnd2 = noise(15.0 * (vUv+23.12));
    float rnd3 = noise(15.0 * (vUv+123.52));
    vec3 col2 = vec3(rnd1, rnd2, rnd3);

    float p = 1.0;
    float x = vUv.x * p;
    float y = vUv.y * p;
    float t = vTime / 500.0;
    float w = sin(3.0 * x + 2.34 + 1.5 * t) +
              sin(5.0 * x + 5.34 + 1.1 * t) +
              sin(3.3 * y + 1.34 + 0.7 * t) +
              sin(4.1 * y + 1.1  + 1.2 * t);
    w = w / 8.0 + 0.5;

    vec3 col = mix(col1, col2, smoothstep(0.35, 0.45, w));
    gl_FragColor = vec4(col, 1.0);
}
