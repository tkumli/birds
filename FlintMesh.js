Birds.FlintMesh = function (renderer) {
    
    var geometry = new Birds.FlintGeometry(2);
    
    // normal mesh 
    var flintUniforms = {
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

    THREE.Mesh.call( this, geometry, material );

    // gpuCompute to compute positions
    var gpuCompute = new GPUComputationRenderer( 2, 2, renderer );
    var dtPos = gpuCompute.createTexture();
    
    function push(arr, vals) {
        for ( var i = 0; i < vals.length; i ++ ) {
            arr[ i ] = vals[ i ];
        }
    }
    push( dtPos.image.data, geometry.initTextures["cubePositions"].array);

    var posVar = gpuCompute.addVariable( "texturePosition", Birds.shaders.flintPosFS, dtPos );
    gpuCompute.setVariableDependencies( posVar, [ posVar ] );

    var posVarUniforms = posVar.material.uniforms;
    posVarUniforms[ "time" ] = { value: 0.0 };

    posVar.wrapS = THREE.RepeatWrapping;
    posVar.wrapT = THREE.RepeatWrapping;

    var error = gpuCompute.init();
    if ( error !== null ) {
        console.error( error );
    }

    this._flint_ = {
        flintUniforms: flintUniforms,
        posVar: posVar,
        posVarUniforms: posVarUniforms,
        gpuCompute: gpuCompute
    }

};

Birds.FlintMesh.prototype = Object.create( THREE.Mesh.prototype );

Object.assign(Birds.FlintMesh.prototype, {
    setTime : function( time ) {
        var self = this._flint_;
        self.flintUniforms[ "time" ] = time;
        self.posVarUniforms[ "time" ] = time;
    },

    compute : function() {
        var self = this._flint_;
        self.gpuCompute.compute();
        self.flintUniforms[ "texturePosition" ].value = gpuCompute.getCurrentRenderTarget( this.posvar ).texture;
    }

});


