// Computing position values with GPU, aka with a shader.
//
// Input "variables" are position and valocity textures:
//   texturePosition
//   textureVelocity
// both being textures with vec4 texels: position vectors
// are coded into a texture.
//   
// The quad (shape) we render here is set up to be exactly the same
// resolution as the input variables. The rendering target (drawn 
// image or texture) will form the next iteration of
// texturePosition variable.
// 
// This shader is invoked as many times as many texels we have in 
// the "image" or textures (resolutionx * resolution.y) with
// gl_FragCoord as input variable representing the actual textel.
//    - based on glFragCoord we can read the position or velocity
//      vectors from the input variables. (Actual or any other.)
//    - by setting glFragColor we can set the next iteration
//      of the actual position vector.
// 

uniform float time;
uniform float delta;

void main()	{

    // read variables: read texture values
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 position = texture2D( texturePosition, uv );      // actual
    vec3 velocity = texture2D( textureVelocity, uv ).xyz;  // actual

    // simply setting the input (no change)
    gl_FragColor = vec4( position );

}
