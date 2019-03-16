// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
Birds.FlintGeometry = function (n,m) {

    Vec3 = THREE.Vector3;

    THREE.BufferGeometry.call( this );

    // dimensions
    var num_of_flints = n * m * 2 * 6;  // cube: 6 faces, m*n tiles, 2 flints per tile
    var num_of_vertices = num_of_flints * 3; // flint: a simple triangle
    var txtrSize = Math.pow(2, Math.ceil(Math.log2(Math.sqrt(num_of_flints))));

    // per vertex buffers
    var verts = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var cols =  new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var refs =  new THREE.BufferAttribute( new Float32Array( num_of_vertices * 2 ), 2 );
    var iv = 0;  // i vertex buffer index
    var ic = 0;  // i color buffer index
    var ir = 0;  // i reference buffer index

    // per flint buffer
    var cubePositions = { array: [] };
    var icp = 0; // i cube positions buffer index

    // i flint index...
    var ifl = 0;

    // adding per vertex attributes : will read by shader
    this.addAttribute( 'position', verts );
    this.addAttribute( 'color', cols );
    this.addAttribute( 'reference', refs );
    // adding extra per flint attributes : will read by FlintMesh
    this.initTextures = {
        size: txtrSize,
        cubePositions: cubePositions
    };

    // let's construct a flint cube
    var cube = {
        verts: [
            new Vec3(-15, -15, -10),
            new Vec3( 10, -10, -10),
            new Vec3( 10,  10, -10),
            new Vec3(-10,  10, -10),
            new Vec3( -5,  -5,  10),
            new Vec3( 10, -10,  10),
            new Vec3( 10,  10,  10),
            new Vec3(-10,  10,  10),
        ],
        faces: [
            [0, 1, 2, 3],
            [7, 6, 5, 4]
        ]
    };
    
    for ( var i = 0; i < cube.faces.length; i++ ) {
        var raster = createRaster(
            cube.verts[ cube.faces[i][0] ],
            cube.verts[ cube.faces[i][1] ],
            cube.verts[ cube.faces[i][2] ],
            cube.verts[ cube.faces[i][3] ]
        );

        addFaceByRaster(raster);
    }

    function addFaceByRaster(rasterMx) {
        var color1 = new THREE.Vector3(0.5, 0.5, 0.25);
        var color2 = new THREE.Vector3(0.5, 0.5, 0.75);
        for (var x = 0; x < n; x++) {
            for (var y = 0; y < m; y++) {
                color1.x = x / n;
                color1.y = y / m;
                color2.x = x / n;
                color2.y = y / m;
                pushTriangle(rasterMx[x][y], rasterMx[x+1][y], rasterMx[x][y+1], color1);
                pushTriangle(rasterMx[x+1][y+1], rasterMx[x][y+1], rasterMx[x+1][y], color2);
            }
        }
    }

    function createRaster(corner00, corner10, corner11, corner01) {
        var rasterMx = [];
        for (var x = 0; x <= n; x++) {
            var colVector = [];
            for (var y = 0; y <= m; y++) {
                var point = new THREE.Vector3();
                point.add( corner00.clone().multiplyScalar( (n-x) * (m-y) ) );
                point.add( corner10.clone().multiplyScalar( x * (m-y) ) );
                point.add( corner01.clone().multiplyScalar( (n-x) * y ) );
                point.add( corner11.clone().multiplyScalar( x * y ) );
                point.multiplyScalar(1/n/m);                
                colVector.push(point);
            }
            rasterMx.push(colVector);
        }
        return rasterMx;
    }

    function pushVert(v, o, c, r) {

        // vertex (x,y,z)
        verts.array[ iv++ ] = v.x - o.x;
        verts.array[ iv++ ] = v.y - o.y;
        verts.array[ iv++ ] = v.z - o.z;

        // color (r,g,b)
        cols.array[ ic++ ] = c.x;
        cols.array[ ic++ ] = c.y;
        cols.array[ ic++ ] = c.z;

        // flint reference (u,v)
        refs.array[ ir++ ] = r.x;
        refs.array[ ir++ ] = r.y;
    }

    // storing a flint (triangle here, whoops it is a flint)
    function pushTriangle(v1, v2, v3, c) {
        
        // center point
        var o = new THREE.Vector3();
        o.add(v1);
        o.add(v2);
        o.add(v3);
        o.multiplyScalar(1/3);
        
        // ref uv on texture
        r = new THREE.Vector2(
            ifl % txtrSize + 0.5,
            ~ ~ (ifl / txtrSize) + 0.5
        );
        r.multiplyScalar(1/txtrSize);
        ifl ++;
        pushVert(v1, o, c, r);
        pushVert(v2, o, c, r);
        pushVert(v3, o, c, r);
        
        // flint position to form a cube
        cubePositions.array[ icp++ ] = o.x;
        cubePositions.array[ icp++ ] = o.y;
        cubePositions.array[ icp++ ] = o.z;
        cubePositions.array[ icp++ ] = 0;   // texel is vec4...
    }
};

Birds.FlintGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
