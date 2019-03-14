Birds.Page = function() {

    var WINDOW_HALF_X, WINDOW_HALF_Y;

    function init() {
        if ( WEBGL.isWebGLAvailable() === false ) {
            document.body.appendChild( WEBGL.getWebGLErrorMessage() );
        }

        var hash = document.location.hash.substr( 1 );
        if ( hash ) hash = parseInt( hash, 0 );

        /* TEXTURE WIDTH FOR SIMULATION */
        //Birds.texture_width = hash || 32;
        Birds.texture_width = 8;
        Birds.num_of_birds  = Birds.texture_width * Birds.texture_width;
        
        WINDOW_HALF_X = window.innerWidth / 2;
        WINDOW_HALF_Y = window.innerHeight / 2;

        document.getElementById( 'birds' ).innerText = Birds.num_of_birds;

        var options = '';
        for ( i = 1; i < 7; i ++ ) {
            var j = Math.pow( 2, i );
            options += '<a href="#" onclick="return Birds.Page.change(' + j + ')">' + ( j * j ) + '</a> ';
        }
        document.getElementById( 'options' ).innerHTML = options;

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );

        window.addEventListener( 'resize', onWindowResize, false );
    }

    function change( n ) {
        location.hash = n;
        location.reload();
        return false;
    }

    function onWindowResize() {
        WINDOW_HALF_X = window.innerWidth / 2;
        WINDOW_HALF_Y = window.innerHeight / 2;
    }

    function onDocumentMouseMove( event ) {
        Birds.mouseX = event.clientX - WINDOW_HALF_X;
        Birds.mouseY = event.clientY - WINDOW_HALF_Y;
    }

    function onDocumentTouchStart( event ) {
        if ( event.touches.length === 1 ) {

            event.preventDefault();

            Birds.mouseX = event.touches[ 0 ].pageX - WINDOW_HALF_X;
            Birds.mouseY = event.touches[ 0 ].pageY - WINDOW_HALF_Y;
        }
    }

    function onDocumentTouchMove( event ) {
        if ( event.touches.length === 1 ) {
            event.preventDefault();

            Birds.mouseX = event.touches[ 0 ].pageX - WINDOW_HALF_X;
            Birds.mouseY = event.touches[ 0 ].pageY - WINDOW_HALF_Y;
        }
    }

    // API
    return {
        init: init,
        change: change
    }

}();