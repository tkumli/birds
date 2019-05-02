
uniform float time;
uniform sampler2D cubePos;
uniform sampler2D spherePos;
uniform float scale;
uniform float morph;

void main()	{
    float t = time / 1000.0;

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float n = (gl_FragCoord.y - 0.5)* 32.0 + (gl_FragCoord.x - 0.5);

    //vec3 pos = texture2D(texturePosition, uv).xyz;
    
    vec3 cubePos = texture2D(cubePos, uv).xyz;
    vec3 spherePos = texture2D(spherePos, uv).xyz;

    //gl_FragColor = vec4( pos.x, pos.y + sin(time / 300.0 + uv.x), pos.z, 0.0 );

    // if ( n > 69.0 && n < 74.0 ) {
    //     float h = - 3.0 * abs(sin(t));
    //     //float h = 1.0 + gl_FragCoord.x / 10.0;
    //     pos = cubePos + vec3(0.0, 0.0, h);
    // }

    //pos = cubePos + vec3()
    
    //float h = 1.0 + 0.5 * smoothstep(0.5, 0.9, abs(sin(t)));
    vec3 p = mix(cubePos, spherePos, morph);
    vec3 pos = scale * p;
    gl_FragColor = vec4( pos.x, pos.y, pos.z, 0.0 );

}
