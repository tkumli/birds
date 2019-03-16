// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
Birds.FlintGeometry = function (n,m) {

    var num_of_flints = n * m;
    var num_of_vertices = num_of_flints * 3;

    THREE.BufferGeometry.call( this );

    var verts = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var cols =  new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var refs =  new THREE.BufferAttribute( new Float32Array( num_of_vertices * 2 ), 2 );
    var cubePositions = { array: [] };

    this.addAttribute( 'position', verts );
    this.addAttribute( 'color', cols );
    this.addAttribute( 'reference', refs );
    this.initTextures = { "cubePositions" : cubePositions };

    // first, let's have one or two flints
    function push(attr, vals) {
        for ( var i = 0; i < vals.length; i ++) {
            attr.array[ i ] = vals[ i ];
        }
    }

    var corns = [];
    for (var i = 0; i <= n; i++) { corns[i] = []; }
    corns[0][0] = new THREE.Vector2(-20, -20);
    corns[1][0] = new THREE.Vector2( 10, -10);
    corns[0][1] = new THREE.Vector2(-10,  10);
    corns[1][1] = new THREE.Vector2( 10,  10);
    var rasterMx = [];
    for (var x = 0; x <= n; x++) {
        var colVector = [];
        for (var y = 0; y <= m; y++) {
            var point = new THREE.Vector2(0,0);
            point.add( corns[0][0].clone().multiplyScalar( (n-x) * (m-y) ) );
            point.add( corns[1][0].clone().multiplyScalar( x * (m-y) ) );
            point.add( corns[0][1].clone().multiplyScalar( (n-x) * y ) );
            point.add( corns[1][1].clone().multiplyScalar( x * y ) );
            point.multiplyScalar(1/n/m);                
            colVector.push(point);
        }
        rasterMx.push(colVector);
    }
    
    var i = 0;
    function pushVert(v, c) {
        verts.array[ i ] = v.x;
        verts.array[ i+1 ] = v.y;
        verts.array[ i+2 ] = 0;
        cols.array[ i ] = c.x;
        cols.array[ i+1 ] = c.y;
        cols.array[ i+2 ] = c.z;
        i += 3;
    }

    function pushTriangle(v1, v2, v3, c) {
        pushVert(v1, c);
        pushVert(v2, c);
        pushVert(v3, c);
    }

    var a = verts.array;
    var color = new THREE.Vector3(0.5, 0.5, 0.5);
    for (var x = 0; x < n; x++) {
        for (var y = 0; y < m; y++) {
            color.x = x / n;
            color.y = y / m;
            pushTriangle(rasterMx[x][y], rasterMx[x+1][y], rasterMx[x][y+1], color);
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

    push(cubePositions, [  // four flint, four positions
        -10,  0, 0, 0,
         10,  0, 0, 0,
        -10, 10, 0, 0,
         10, 10, 0, 0
    ]);
    
    //this.scale( 0.2, 0.2, 0.2 );

};
Birds.FlintGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
