// App
Birds.App = function() {
    // PRIVATE
    function init(cb) {
        console.log("Init called");
        load_shaders({
            names: ["frshPosition", "frshVelocity", "birdFS", "birdVS"],
            loaded: function(shaders) {
                Birds.shaders = shaders;
                cb();
            }
        })
    }
    

    function load_shaders(config) {
        var names = config.names;
        var onLoaded = config.loaded;
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

    // API
    return {
        init: init
    }

}();

//$(document).ready(Birds.App.init);
