// App
Birds.App = function() {

    // BOUNDS x BOUNDS x BOUNDS kockában lesznek szétdobva a madarak a világban.
    var BOUNDS = 800;
    var BOUNDS_HALF = BOUNDS / 2;

    var container, stats;
    var camera, scene, renderer;

    var last;

    var gpuCompute;
    var velocityVariable;
    var positionVariable;
    var velocityUniforms;
    var positionUniforms;
    var birdUniforms;

    var flintGpuCompute;
    var flintPositionVariable;
    var flintPositionUniforms;
    var flintUniforms;


    function init(cb) {
        load_shaders({
            names: ["frshPosition", "frshVelocity", "birdFS", "birdVS", "flintPosFS", "flintFS", "flintVS"],
            loaded: function() {
                Birds.Page.init();
                renderInit();
                last = performance.now();
                animate();
            }
        })
    }

    function renderInit() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
        camera.position.z = 350;

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xffffff );
        scene.fog = new THREE.Fog( 0xffffff, 100, 1000 );

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        initComputeRenderer();
        initFlintComputeRenderer();

        // add stats
        stats = new Stats();
        container.appendChild( stats.dom );

        // add controls
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
        gui.add( effectController, "freedom", 0.0, 1.0, 0.025 ).onChange( valuesChanger );
        gui.close();

        var birdMesh = initBirds();
        scene.add( birdMesh );

        var flintMesh = initFlints();
        scene.add( flintMesh );

        window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function initFlintComputeRenderer() {
        flintGpuCompute = new GPUComputationRenderer( 2, 2, renderer );
        var dtPos = flintGpuCompute.createTexture();
        
        function push(arr, vals) {
            for ( var i = 0; i < vals.length; i ++ ) {
                arr[ i ] = vals[ i ];
            }
        }
        push( dtPos.image.data, [
            -10, -10, 300, 0,
            10, -10, 300, 0,
            -10, 10, 300, 0,
            10, 10, 300, 0
        ]);

        flintPositionVariable = flintGpuCompute.addVariable( "texturePosition", Birds.shaders.flintPosFS, dtPos );
        flintGpuCompute.setVariableDependencies( flintPositionVariable, [ flintPositionVariable ] );

        flintPositionUniforms = flintPositionVariable.material.uniforms;
        flintPositionUniforms[ "time" ] = { value: 0.0 };

        flintPositionVariable.wrapS = THREE.RepeatWrapping;
        flintPositionVariable.wrapT = THREE.RepeatWrapping;

        var error = flintGpuCompute.init();
        if ( error !== null ) {
            console.error( error );
        }

    }


    function initComputeRenderer() {

        gpuCompute = new GPUComputationRenderer( Birds.texture_width, Birds.texture_width, renderer );

        var dtPosition = gpuCompute.createTexture();
        var dtVelocity = gpuCompute.createTexture();
        initPositionTexture( dtPosition );
        initVelocityTexture( dtVelocity );

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

        velocityUniforms[ "predator" ].value.set(
            Birds.mouseX / window.innerWidth,
            - Birds.mouseY / window.innerHeight,
            0
        );

        Birds.mouseX = 10000;
        Birds.mouseY = 10000;

        gpuCompute.compute();

        birdUniforms[ "texturePosition" ].value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
        birdUniforms[ "textureVelocity" ].value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;

        // flints
        flintPositionUniforms[ "time" ].value = now;
        flintUniforms[ "time" ].value = now;

        flintGpuCompute.compute();

        flintUniforms[ "texturePosition" ].value = flintGpuCompute.getCurrentRenderTarget( flintPositionVariable ).texture;



        renderer.render( scene, camera );
    }

    function load_shaders(config) {
        var names = config.names;
        var onLoaded = config.loaded; // callback
        var cnt = 0;
        Birds.shaders = {};
        function load(name) {
            $.ajax({
                url : "shaders/" + name + ".glsl",
                success : data => {
                    Birds.shaders[name] = data;
                    if (++cnt == names.length) { onLoaded(); }
                }
            })
        }
        names.forEach(name => load(name));
    }

    function initBirds() {

        var geometry = new Birds.BirdGeometry(Birds.texture_width);

        // For Vertex and Fragment
        birdUniforms = {
            "color": { value: new THREE.Color( 0xff2200 ) },
            "texturePosition": { value: null },
            "textureVelocity": { value: null },
            "time": { value: 1.0 },
            "delta": { value: 0.0 }
        };

        // ShaderMaterial
        var material = new THREE.ShaderMaterial({
            uniforms: birdUniforms,
            vertexShader: Birds.shaders.birdVS,
            fragmentShader: Birds.shaders.birdFS,
            side: THREE.DoubleSide,
            transparent: true
        });

        var birdMesh = new THREE.Mesh( geometry, material );
        //birdMesh.rotation.y = Math.PI / 2;
        birdMesh.matrixAutoUpdate = false;
        birdMesh.updateMatrix();

        return birdMesh;

    }
    
    function initFlints() {
        var geometry = new Birds.FlintGeometry(2);

        flintUniforms = {
            "texturePosition" : { value: null },
            "time" : { value: 0.0 },
            "delta" : { value: 0.0 }
        }

        var material = new THREE.ShaderMaterial({
            uniforms: flintUniforms,
            vertexShader: Birds.shaders.flintVS,
            fragmentShader: Birds.shaders.flintFS,
            side: THREE.DoubleSide,
            //transparent: true
        });

        var mesh = new THREE.Mesh( geometry, material );

        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        return mesh;

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
