// App
Birds.App = function() {


    var container, stats;
    var camera, scene, renderer;

    var last;

    var flintGpuCompute;

    var flintPositionVariable;
    var flintPositionUniforms;

    var flintMesh;
    var flintUniforms;

    function init(cb) {
        load_shaders({
            names: ["flintPosFS", "flintFS", "flintVS"],
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
        scene.fog = new THREE.Fog( 0xffffff, 100, 1000 ); // ez mi?

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        flintMesh = initFlints();
        scene.add( flintMesh );

        initFlintComputeRenderer( flintMesh );

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
            /*
            velocityUniforms[ "seperationDistance" ].value = effectController.seperation;
            velocityUniforms[ "alignmentDistance" ].value = effectController.alignment;
            velocityUniforms[ "cohesionDistance" ].value = effectController.cohesion;
            velocityUniforms[ "freedomFactor" ].value = effectController.freedom;
            */
        };
        valuesChanger();

        gui.add( effectController, "seperation", 0.0, 100.0, 1.0 ).onChange( valuesChanger );
        gui.add( effectController, "alignment", 0.0, 100, 0.001 ).onChange( valuesChanger );
        gui.add( effectController, "cohesion", 0.0, 100, 0.025 ).onChange( valuesChanger );
        gui.add( effectController, "freedom", 0.0, 1.0, 0.025 ).onChange( valuesChanger );
        gui.close();

        window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function initFlintComputeRenderer( mesh ) {
        flintGpuCompute = new GPUComputationRenderer( 2, 2, renderer );
        var dtPos = flintGpuCompute.createTexture();
        
        function push(arr, vals) {
            for ( var i = 0; i < vals.length; i ++ ) {
                arr[ i ] = vals[ i ];
            }
        }
        push( dtPos.image.data, mesh.geometry.initTextures["cubePositions"].array);

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

        Birds.mouseX = 10000;
        Birds.mouseY = 10000;

        flintMesh.rotation.y += .01;
        flintMesh.position.z = 300;
        flintMesh.updateMatrix();

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

        var mesh2 = new Birds.FlintMesh(renderer);
        console.log(mesh2);

        var mesh = new THREE.Mesh( geometry, material );
        //console.log(mesh);
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();

        flintMesh = mesh;
        return mesh;

    }

    // API
    // ... a single init() method exposed:
    return {
        init: init
    }

}();

$(document).ready(Birds.App.init);
