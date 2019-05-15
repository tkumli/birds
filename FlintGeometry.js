// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
Birds.FlintGeometry = function (n, m) {

    var C = 10;
    var S = 0.5 * ( 10 + Math.sqrt(10*10 + 10*10 + 10*10) );
    var B = C / n;
    var D = B / 2;

    Vec3 = THREE.Vector3;

    THREE.BufferGeometry.call( this );

    // dimensions
    var num_of_flints = n * m * 2 * 6;  // cube: 6 faces, m*n tiles, 2 flints per tile
    var num_of_triangles = num_of_flints * 3;   // flint transforms to bird, a bird takes 3 triangles
    var num_of_vertices = num_of_triangles * 3; // a triangle takes three vertices
    var txtrSize = Math.pow(2, Math.ceil(Math.log2(Math.sqrt(num_of_flints))));

    // per vertex buffers
    var verts  = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var verts2 = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var vertsB = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 4 ), 4 );
    var cols   = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 3 ), 3 );
    var hides  = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 1 ), 1 );
    var uvs    = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 2 ), 2 );
    var refs   = new THREE.BufferAttribute( new Float32Array( num_of_vertices * 2 ), 2 );
    var iv = 0;  // i vertex buffer index
    var iv2 = 0; // i vertex buffer 2 index
    var ivb = 0; // i vertex buffer (bird) index
    var ic = 0;  // i color buffer index
    var ih = 0;  // i hide buffer index
    var ir = 0;  // i reference buffer index
    var iuv = 0; // i uv buffer

    // per flint buffer
    var cubePositions = { array: [] };
    var icp = 0; // i cube positions buffer index
    var spherePositions = { array: [] };
    var isp = 0; // i sphere positions buffer index

    // i flint index...
    var ifl = 0;

    // adding per vertex attributes : will read by shader
    this.addAttribute( 'position', verts );
    this.addAttribute( 'pos2', verts2 );
    this.addAttribute( 'pos_b', vertsB );
    this.addAttribute( 'hide', hides );
    this.addAttribute( 'color', cols );
    this.addAttribute( 'hides', hides );
    this.addAttribute( 'uv', uvs );
    this.addAttribute( 'reference', refs );
    // adding extra per flint attributes : will read by FlintMesh
    this.initTextures = {
        size: txtrSize,
        cubePositions: cubePositions,
        spherePositions: spherePositions
    };

    // let's construct a flint cube
    var cube = {
        verts: [
            new Vec3(-C, -C, -C),
            new Vec3( C, -C, -C),
            new Vec3( C,  C, -C),
            new Vec3(-C,  C, -C),
            new Vec3(-C, -C,  C),
            new Vec3( C, -C,  C),
            new Vec3( C,  C,  C),
            new Vec3(-C,  C,  C),
        ],
        faces: [
            [0, 1, 2, 3],
            [6, 5, 4, 7],
            [1, 5, 6, 2],
            [7, 4, 0, 3],
            [5, 1, 0, 4],
            [3, 2, 6, 7]
        ]
    };

    var faceHides = [0, 0, 1, 1, 0, 0];
    
    for ( var i = 0; i < cube.faces.length; i++ ) {
        var raster = createRaster(
            cube.verts[ cube.faces[i][0] ],
            cube.verts[ cube.faces[i][1] ],
            cube.verts[ cube.faces[i][2] ],
            cube.verts[ cube.faces[i][3] ]
        );

        addFaceByRaster(raster, faceHides[i]);
    }

    function addFaceByRaster(rasterMx, hide) {
        var color1 = new THREE.Vector3(0.5, 0.5, 0.25);
        var color2 = new THREE.Vector3(0.5, 0.5, 0.75);
        var uv00 = new THREE.Vector2(0.0, 0.0);
        var uv01 = new THREE.Vector2(0.0, 1.0);
        var uv10 = new THREE.Vector2(1.0, 0.0);
        var uv11 = new THREE.Vector2(1.0, 1.0);
        for (var x = 0; x < n; x++) {
            for (var y = 0; y < m; y++) {
                color1.x = x / n;
                color1.y = y / m;
                color2.x = x / n;
                color2.y = y / m;
                pushFlint(rasterMx[x][y], rasterMx[x+1][y], rasterMx[x][y+1], uv00, uv10, uv01, color1, hide);
                pushFlint(rasterMx[x+1][y+1], rasterMx[x][y+1], rasterMx[x+1][y], uv11, uv01, uv10, color2, hide);
                //pushTriangle(rasterMx[x+1][y+1], rasterMx[x][y+1], rasterMx[x+1][y], uv00, uv10, uv01, color2, hide);
            }
        }
    }

    function createRaster(corner00, corner10, corner11, corner01) {
        var rasterMx = [];
        for (var x = 0; x <= n; x++) {
            var colVector = [];
            for (var y = 0; y <= m; y++) {
                var pos = new THREE.Vector3();
                pos.add( corner00.clone().multiplyScalar( (n-x) * (m-y) ) );
                pos.add( corner10.clone().multiplyScalar(   x   * (m-y) ) );
                pos.add( corner01.clone().multiplyScalar( (n-x) *   y   ) );
                pos.add( corner11.clone().multiplyScalar(   x   *   y   ) );
                pos.multiplyScalar(1/n/m);

                var uv = new THREE.Vector2(x/n, y/m);
                colVector.push({pos: pos, uv: uv});
            }
            rasterMx.push(colVector);
        }
        return rasterMx;
    }

    function pushVert(pos, o, pos2, o2, c, r, uv, hide, bv) {

        // vertex (x,y,z)
        verts.array[ iv++ ] = pos.x - o.x;
        verts.array[ iv++ ] = pos.y - o.y;
        verts.array[ iv++ ] = pos.z - o.z;

        // vertex (x,y,z)
        verts2.array[ iv2++ ] = pos2.x - o2.x;
        verts2.array[ iv2++ ] = pos2.y - o2.y;
        verts2.array[ iv2++ ] = pos2.z - o2.z;

        // vertex (x, y, z)
        vertsB.array[ ivb ++ ] = bv.x;
        vertsB.array[ ivb ++ ] = bv.y;
        vertsB.array[ ivb ++ ] = bv.z;
        vertsB.array[ ivb ++ ] = bv.w;

        // uv
        uvs.array[ iuv++ ] = uv.x;
        uvs.array[ iuv++ ] = uv.y;
        
        // color (r,g,b)
        cols.array[ ic++ ] = c.x;
        cols.array[ ic++ ] = c.y;
        cols.array[ ic++ ] = c.z;

        // hide (h)
        hides.array[ ih++ ] = hide; 

        // flint reference (u,v)
        refs.array[ ir++ ] = r.x;
        refs.array[ ir++ ] = r.y;
    }

    // storing a flint: it takes 3 triangles - 3 almost identical
    function pushFlint(v1, v2, v3, uv1, uv2, uv3, c, hide) {
        
        // center point
        var o = new THREE.Vector3();
        o.add(v1.pos);
        o.add(v2.pos);
        o.add(v3.pos);
        o.multiplyScalar(1/3);
        
        // vertex projected to sphere... and its center point
        s1 = v1.pos.clone().normalize().multiplyScalar(S);
        s2 = v2.pos.clone().normalize().multiplyScalar(S);
        s3 = v3.pos.clone().normalize().multiplyScalar(S);
        var o2 = new THREE.Vector3();
        o2.add(s1);
        o2.add(s2);
        o2.add(s3);
        o2.multiplyScalar(1/3);

        // ref uv on texture
        r = new THREE.Vector2(
            ifl % txtrSize + 0.5,
            ~ ~ (ifl / txtrSize) + 0.5
        );
        r.multiplyScalar(1/txtrSize);
        ifl ++;

        // bird vertex coords
        var bv1 = new THREE.Vector4( 0,  0,  B,  0);
        var bv2 = new THREE.Vector4( 0,  0, -B,  0);
        var bv3 = new THREE.Vector4( D,  B,  0,  1);
        var bv4 = new THREE.Vector4( 0,  0,  B,  0);
        var bv5 = new THREE.Vector4( 0,  0, -B,  0);
        var bv6 = new THREE.Vector4(-D,  B,  0,  1);
        var bv7 = new THREE.Vector4( 0,  0,  B,  0);
        var bv8 = new THREE.Vector4( 0,  0, -B,  0);
        var bv9 = new THREE.Vector4( 0,  D,  D,  0);

        pushTriangle(o, v1, v2, v3, o2, s1, s2, s3, r, uv1, uv2, uv3, c, hide, bv1, bv2, bv3);
        pushTriangle(o, v1, v2, v3, o2, s1, s2, s3, r, uv1, uv2, uv3, c,    1, bv4, bv5, bv6);
        pushTriangle(o, v1, v2, v3, o2, s1, s2, s3, r, uv1, uv2, uv3, c,    1, bv7, bv8, bv9);

        // flint position to form a cube
        cubePositions.array[ icp++ ] = o.x;
        cubePositions.array[ icp++ ] = o.y;
        cubePositions.array[ icp++ ] = o.z;
        cubePositions.array[ icp++ ] = 0;   // texel is vec4...

        // flint position to form a sphere
        spherePositions.array[ isp++ ] = o2.x;
        spherePositions.array[ isp++ ] = o2.y;
        spherePositions.array[ isp++ ] = o2.z;
        spherePositions.array[ isp++ ] = 0;   // texel is vec4...
    }
    
    // storing a flint (triangle here, whoops it is a flint)
    function pushTriangle(o, v1, v2, v3, o2, s1, s2, s3, r, uv1, uv2, uv3, c, hide, bv1, bv2, bv3) {

        pushVert(v1.pos, o, s1, o2, c, r, v1.uv, hide, bv1);
        pushVert(v2.pos, o, s2, o2, c, r, v2.uv, hide, bv2);
        pushVert(v3.pos, o, s3, o2, c, r, v3.uv, hide, bv3);

        //pushVert(v1.pos, o, c, r, uv1);
        //pushVert(v2.pos, o, c, r, uv2);
        //pushVert(v3.pos, o, c, r, uv3);
    }
};

Birds.FlintGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
