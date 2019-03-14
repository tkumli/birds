uniform float time;
uniform float delta;

void main()	{

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D( texturePosition, uv );
    vec3 position = tmpPos.xyz;
    vec3 velocity = texture2D( textureVelocity, uv ).xyz;

    // pl. lehet phase a 4. ertek
    float phase = tmpPos.w;

    phase = mod( ( phase + delta +
        length( velocity.xz ) * delta * 3. +
        max( velocity.y, 0.0 ) * delta * 6. ), 62.83 );

    //gl_FragColor = vec4( position + velocity * delta * 15. , phase );
    gl_FragColor = vec4( position, phase );

    // párat kispécizek
    if ( gl_FragCoord.x == 0.5 && gl_FragCoord.y == 0.5 ) {
        gl_FragColor = vec4( vec3(-0.0, -6., 330.), phase);
    }
    if ( gl_FragCoord.x == 1.5 && gl_FragCoord.y == 0.5 ) {
        gl_FragColor = vec4( vec3(0., -3., 330.), phase/3.0);
    }
    if ( gl_FragCoord.x == 2.5 && gl_FragCoord.y == 0.5 ) {
        gl_FragColor = vec4( vec3(6., -3., 330.), 0.);
    }

    if ( gl_FragCoord.x == 3.5 && gl_FragCoord.y == 0.5 ) {
        gl_FragColor = vec4( vec3(-6., 3., 330.), phase);
    }
    if ( gl_FragCoord.x == 4.5 && gl_FragCoord.y == 0.5 ) {
        gl_FragColor = vec4( vec3(0., 3., 330.), phase/3.0);
    }
    if ( gl_FragCoord.x == 5.5 && gl_FragCoord.y == 0.5 ) {
        gl_FragColor = vec4( vec3(6., 3., 330.), 0.);
    }




}
