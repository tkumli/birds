// App
Birds.App = function() {

    // APP GLOBALS
    var WIDTH;
    var BIRDS;
    
    var BOUNDS, BOUNDS_HALF;   // todo: ez mi is pontosan?

    var container, stats;
    var camera, scene, renderer;
    var windowHalfX, windowHalfY;
    var mouseX = 0, mouseY = 0;

    var last;

    var gpuCompute;
    var velocityVariable;
    var positionVariable;
    var positionUniforms;
    var velocityUniforms;
    var birdUniforms;

    function init(cb) {
        console.log("Init called");
        load_shaders({
            names: ["frshPosition", "frshVelocity", "birdFS", "birdVS"],
            loaded: function(shaders) {
                Birds.shaders = shaders;
                pageInit();
                renderInit();
				animate();
            }
        })
    }

    function pageInit() {

        if ( WEBGL.isWebGLAvailable() === false ) {
            document.body.appendChild( WEBGL.getWebGLErrorMessage() );
        }

        var hash = document.location.hash.substr( 1 );
        if ( hash ) hash = parseInt( hash, 0 );

        /* TEXTURE WIDTH FOR SIMULATION */
        WIDTH = hash || 32;
        BIRDS = WIDTH * WIDTH;
        
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        BOUNDS = 800;
        BOUNDS_HALF = BOUNDS / 2;

        document.getElementById( 'birds' ).innerText = BIRDS;

        function change( n ) {
            location.hash = n;
            location.reload();
            return false;
        }

        var options = '';
        for ( i = 1; i < 7; i ++ ) {
            var j = Math.pow( 2, i );
            options += '<a href="#" onclick="return change(' + j + ')">' + ( j * j ) + '</a> ';
        }
        document.getElementById( 'options' ).innerHTML = options;

        last = performance.now();   // todo: move to renderInit
    }

    //////////////////////////////
    function renderInit() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
        camera.position.z = 350;

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xffffff );
        scene.fog = new THREE.Fog( 0xffffff, 100, 1000 );

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        initComputeRenderer();

        stats = new Stats();
        container.appendChild( stats.dom );

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );

        //

        window.addEventListener( 'resize', onWindowResize, false );

        var gui = new dat.GUI();

        var effectController = {
            seperation: 20.0,
            alignment: 20.0,
            cohesion: 20.0,
            freedom: 0.75
        };

        var valuesChanger = function () {

            velocityUniforms[ "seperationDistance" ].value = effectController.seperation;
            velocityUniforms[ "alignmentDistance" ].value = effectController.alignment;
            velocityUniforms[ "cohesionDistance" ].value = effectController.cohesion;
            velocityUniforms[ "freedomFactor" ].value = effectController.freedom;

        };

        valuesChanger();

        gui.add( effectController, "seperation", 0.0, 100.0, 1.0 ).onChange( valuesChanger );
        gui.add( effectController, "alignment", 0.0, 100, 0.001 ).onChange( valuesChanger );
        gui.add( effectController, "cohesion", 0.0, 100, 0.025 ).onChange( valuesChanger );
        // todo: freedomfactor miert nem allithato?
        gui.close();

        var birdMesh = initBirds();
        scene.add( birdMesh );
    }

    function initComputeRenderer() {

        gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );

        var dtPosition = gpuCompute.createTexture();
        var dtVelocity = gpuCompute.createTexture();
        fillPositionTexture( dtPosition );
        fillVelocityTexture( dtVelocity );

        velocityVariable = gpuCompute.addVariable( "textureVelocity", Birds.shaders.frshVelocity, dtVelocity );
        positionVariable = gpuCompute.addVariable( "texturePosition", Birds.shaders.frshPosition, dtPosition );

        gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
        gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );

        positionUniforms = positionVariable.material.uniforms;
        velocityUniforms = velocityVariable.material.uniforms;

        positionUniforms[ "time" ] = { value: 0.0 };
        positionUniforms[ "delta" ] = { value: 0.0 };
        velocityUniforms[ "time" ] = { value: 1.0 };
        velocityUniforms[ "delta" ] = { value: 0.0 };
        velocityUniforms[ "testing" ] = { value: 1.0 };
        velocityUniforms[ "seperationDistance" ] = { value: 1.0 };
        velocityUniforms[ "alignmentDistance" ] = { value: 1.0 };
        velocityUniforms[ "cohesionDistance" ] = { value: 1.0 };
        velocityUniforms[ "freedomFactor" ] = { value: 1.0 };
        velocityUniforms[ "predator" ] = { value: new THREE.Vector3() };
        velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );

        velocityVariable.wrapS = THREE.RepeatWrapping;
        velocityVariable.wrapT = THREE.RepeatWrapping;
        positionVariable.wrapS = THREE.RepeatWrapping;
        positionVariable.wrapT = THREE.RepeatWrapping;

        var error = gpuCompute.init();
        if ( error !== null ) {
            console.error( error );
        }

    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function onDocumentMouseMove( event ) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    function onDocumentTouchStart( event ) {
        if ( event.touches.length === 1 ) {

            event.preventDefault();

            mouseX = event.touches[ 0 ].pageX - windowHalfX;
            mouseY = event.touches[ 0 ].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove( event ) {
        if ( event.touches.length === 1 ) {
            event.preventDefault();

            mouseX = event.touches[ 0 ].pageX - windowHalfX;
            mouseY = event.touches[ 0 ].pageY - windowHalfY;
        }
    }

    //

    function animate() {
        requestAnimationFrame( animate );
        render();
        stats.update();
    }

    function render() {
        var now = performance.now();
        var delta = ( now - last ) / 1000;

        if ( delta > 1 ) delta = 1; // safety cap on large deltas
        last = now;

        positionUniforms[ "time" ].value = now;
        positionUniforms[ "delta" ].value = delta;
        velocityUniforms[ "time" ].value = now;
        velocityUniforms[ "delta" ].value = delta;
        birdUniforms[ "time" ].value = now;
        birdUniforms[ "delta" ].value = delta;

        velocityUniforms[ "predator" ].value.set( 0.5 * mouseX / windowHalfX, - 0.5 * mouseY / windowHalfY, 0 );

        mouseX = 10000;
        mouseY = 10000;

        gpuCompute.compute();

        birdUniforms[ "texturePosition" ].value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
        birdUniforms[ "textureVelocity" ].value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;

        renderer.render( scene, camera );
    }
    //////////////////////////////

    function load_shaders(config) {
        var names = config.names;
        var onLoaded = config.loaded; // callback
        var shaders = {};
        var cnt = 0;
        function load(name) {
            $.ajax({
                url : name + ".c",
                success : data => {
                    shaders[name] = data;
                    if (++cnt == names.length) { onLoaded(shaders); }
                }
            })
        }
        names.forEach(name => load(name));
    }

    function initBirds() {

        var geometry = new Birds.BirdGeometry(WIDTH);

        // For Vertex and Fragment
        birdUniforms = {
            "color": { value: new THREE.Color( 0xff2200 ) },
            "texturePosition": { value: null },
            "textureVelocity": { value: null },
            "time": { value: 1.0 },
            "delta": { value: 0.0 }
        };

        // ShaderMaterial
        var material = new THREE.ShaderMaterial( {
            uniforms: birdUniforms,
            vertexShader: Birds.shaders.birdVS,
            fragmentShader: Birds.shaders.birdFS,
            side: THREE.DoubleSide

        } );

        var birdMesh = new THREE.Mesh( geometry, material );
        birdMesh.rotation.y = Math.PI / 2;
        birdMesh.matrixAutoUpdate = false;
        birdMesh.updateMatrix();

        return birdMesh;

    }

    function initPositionTexture( texture ) {

        var theArray = texture.image.data;

        for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {

            // random initial position between space bounds
            var x = Math.random() * BOUNDS - BOUNDS_HALF;
            var y = Math.random() * BOUNDS - BOUNDS_HALF;
            var z = Math.random() * BOUNDS - BOUNDS_HALF;

            theArray[ k + 0 ] = x;
            theArray[ k + 1 ] = y;
            theArray[ k + 2 ] = z;
            theArray[ k + 3 ] = 1;
        }
    }

    function initVelocityTexture( texture ) {

        var theArray = texture.image.data;

        for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {

            // random initial velocity between space bounds
            var x = Math.random() - 0.5;
            var y = Math.random() - 0.5;
            var z = Math.random() - 0.5;

            theArray[ k + 0 ] = x * 10;
            theArray[ k + 1 ] = y * 10;
            theArray[ k + 2 ] = z * 10;
            theArray[ k + 3 ] = 1;
        }
    }

    // API
    // ... a single init() method exposed:
    return {
        init: init
    }

}();

$(document).ready(Birds.App.init);
