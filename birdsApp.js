// App
Birds.App = function() {

    var container, stats;
    var camera, scene, renderer;

    var last;

    var flintMesh;

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
        scene.fog = new THREE.Fog( 0xffffff, 100, 1000 ); // todo: ez mi?

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        flintMesh =new Birds.FlintMesh( renderer );
        scene.add( flintMesh );

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

        // flints
        flintMesh.rotation.y += .01;
        flintMesh.position.z = 300;
        flintMesh.updateMatrix();

        flintMesh.setTime(now);
        flintMesh.compute();
        
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
    
    // API
    // ... a single init() method exposed:
    return {
        init: init
    }

}();

$(document).ready(Birds.App.init);
