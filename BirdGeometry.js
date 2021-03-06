// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
Birds.BirdGeometry = function (width) {

    var num_of_birds = width * width;
    var triangles = num_of_birds * 3;
    var points = triangles * 3;

    THREE.BufferGeometry.call( this );

    var vertices = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
    var birdColors = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
    var references = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );
    var birdVertex = new THREE.BufferAttribute( new Float32Array( points ), 1 );

    this.addAttribute( 'position', vertices );
    this.addAttribute( 'birdColor', birdColors );
    this.addAttribute( 'reference', references );
    this.addAttribute( 'birdVertex', birdVertex );

    // this.addAttribute( 'normal', new Float32Array( points * 3 ), 3 );

    var v = 0;

    function verts_push() {
        for ( var i = 0; i < arguments.length; i ++ ) {
            vertices.array[ v ++ ] = arguments[ i ];
        }
    }

    var wingsSpan = 20;

    for ( var f = 0; f < num_of_birds; f ++ ) {

        // Body
        verts_push(
            0, - 0, - 20,
            0, 4, - 20,
            0, 0, 30
        );

        // Left Wing
        verts_push(
            0, 0, - 15,
            - wingsSpan, 0, 0,
            0, 0, 15
        );

        // Right Wing
        verts_push(
            0, 0, 15,
            wingsSpan, 0, 0,
            0, 0, - 15
        );

    }

    for ( var v = 0; v < triangles * 3; v ++ ) {

        // todo: ezt a részt kitisztázni
        var i = ~ ~ ( v / 3 );    // mert minden háromszög három csúcsból áll
        var b = ~ ~ ( i / 3 );    // minden madár három elemből (háromszögből) áll
        // (x,y) Nulla és egy közötti számok, a width által megadott lépésekben.
        // ha egy width x width raster-t nézek... 
        var x = ( b % width ) / width;      // x lépeget: 0,1,2,...
        var y = ~ ~ ( b / width ) / width;  // y lépeget: 0,0,0... 1,1,1... 2,2,2... 
        var c;

        // todo: most próbaképpen háromféle színű madarak lesznek
        // if ( b % 3 == 0 ) c = new THREE.Color(0xAA2222);
        // if ( b % 3 == 1 ) c = new THREE.Color(0x22AA22);
        // if ( b % 3 == 2 ) c = new THREE.Color(0x2222AA);

        // todo:  ez volt eredetileg... ki kellene majd próbálni
        var c = new THREE.Color(
        	0x444444 +
        	(~ ~ ( v / 9 )) / num_of_birds * 0x666666
        );

        birdColors.array[ v * 3 + 0 ] = c.r;
        birdColors.array[ v * 3 + 1 ] = c.g;
        birdColors.array[ v * 3 + 2 ] = c.b;

        // todo: referenciák
        // x és y egy [0..1] tartományban lévő számok, amik
        // valahogy behivatkoznak a raster-be...
        // de tudjuk, hogy utána hogyan használjuk??
        // S miért nem mondjuk egy 1xN vagy Nx1 méretű raszterről beszélünk?
        //  vagy úgy rosszabb lenne a GPU teljesítménye? Nem értem...
        references.array[ v * 2 ] = x;
        references.array[ v * 2 + 1 ] = y;

        // a birdVertex mutatja, hogy az adott csúcs a madáron belül hányadik csúcs: 0..9
        // todo: de ez a nyomi kilences mit keres itt? Ez vicces...
        birdVertex.array[ v ] = v % 9;

    }

    this.scale( 0.2, 0.2, 0.2 );

};
Birds.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
