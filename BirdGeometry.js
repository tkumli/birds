//
// Custom Geometry - using a single triangle geometry each.
// No UVs, no normals yet.
//
Birds.BirdGeometry = function (width) {

    var num_of_meshes = width * width;           // texture resolution gives the number of meshes
    var num_of_triangles = num_of_meshes * 1;    // single triangle geometry
    var num_of_vertices = num_of_triangles * 3;

    THREE.BufferGeometry.call( this );

    var vertices =   new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var colors =     new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var references = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 2 ), 2 );
    var vertIxs =    new THREE.BufferAttribute( new Float32Array( num_of_vertices * 1 ), 1 );

    this.addAttribute( 'position', vertices );
    this.addAttribute( 'meshColor', colors );
    this.addAttribute( 'reference', references );
    this.addAttribute( 'vertIx', vertIxs );

    var geometry = [   // a single triangle geometry
        -20,  0, -20,
         20,  0, -20,
          0, 20, -20
    ];

    var vert_attrIx = 0;
    var color_attrIx = 0;
    var ref_attrIx = 0;
    var vertIx_attrIx = 0;

    // push a single mesh
    function mesh_push(vertexBuffer, color, ref_x, ref_y) {
        var numOfVertices = vertexBuffer.length / 3;
        var vbIx = 0;
        for ( i = 0; i < numOfVertices; i ++) {
            // vertex coordinates 
            vertices.array[ vert_attrIx ++ ] = vertexBuffer[ vbIx ++ ];
            vertices.array[ vert_attrIx ++ ] = vertexBuffer[ vbIx ++ ];
            vertices.array[ vert_attrIx ++ ] = vertexBuffer[ vbIx ++ ];
            // vertex color
            colors.array[ color_attrIx ++ ] = color[ 0 ];
            colors.array[ color_attrIx ++ ] = color[ 1 ];
            colors.array[ color_attrIx ++ ] = color[ 2 ];
            // reference
            references.array[ ref_attrIx ++ ] = ref_x;
            references.array[ ref_attrIx ++ ] = ref_y;
            // vertex index
            vertIxs.array[ vertIx_attrIx ++ ] = i;
        }
    }

    // push the meshes
    for ( var x = 0; x < width; x ++) {
        for ( var y = 0; y < width; y ++) {
            //meshColor = [1, x / width, y / width];
            meshColor = [1, 0, 0];
            mesh_push( geometry, meshColor, x, y);
        }
    }

    //this.scale( 0.2, 0.2, 0.2 );

    /*
    console.log("Vertices");
    console.log(vertices.array);
    console.log("Colors");
    console.log(colors.array);
    console.log("References");
    console.log(references.array);
    console.log("Vertex indexes");
    console.log(vertIxs.array);
    */

};
Birds.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
