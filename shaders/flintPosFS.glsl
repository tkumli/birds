uniform float time;

void main()	{

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D( texturePosition, uv ).xyz;

    //gl_FragColor = vec4( pos.x, pos.y + sin(time / 300.0 + uv.x), pos.z, 0.0 );
    gl_FragColor = vec4( pos.x, pos.y, pos.z, 0.0 );

}
