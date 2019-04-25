
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
    return fract(sin(dot(floor(10.0 * st.xy), vec2(12.9898, 78.233))) * 43758.5453123);
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
    gl_FragColor = vec4(vec3(vUv.x, rnd, rnd), 1.0);
}
