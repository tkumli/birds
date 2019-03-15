// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
Birds.FlintGeometry = function (width) {

    var num_of_flints = width * width;
    var num_of_vertices = num_of_flints * 3;

    THREE.BufferGeometry.call( this );

    var verts = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var cols =  new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var refs =  new THREE.BufferAttribute( new Float32Array( num_of_vertices * 2 ), 2 );

    this.addAttribute( 'position', verts );
    this.addAttribute( 'color', cols );
    this.addAttribute( 'reference', refs );

    // first, let's have one or two flints
    function push(attr, vals) {
        for ( var i = 0; i < vals.length; i ++) {
            attr.array[ i ] = vals[ i ];
        }
    }

    push(verts, [
        0, 0, 0,
        10, 0, 0,
        0, 10, 0,
        10, 0, 0,
        10, 10, 0,
        0, 10, 0
    ]);

    push(cols, [
        1, 0, 0, 
        1, 0, 0, 
        1, 0, 0, 
        0, 1, 0,
        0, 1, 0,
        0, 1, 0
    ]);

    push(refs, [
        0.25, 0.25,
        0.25, 0.25,
        0.25, 0.25,
        0.75, 0.25,
        0.75, 0.25,
        0.75, 0.25
    ]);
    
    //this.scale( 0.2, 0.2, 0.2 );

};
Birds.FlintGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
