'strict mode'

(function(globalObj, globalGl) {



    globalGl.loadProgram = function(gl, shaders, opt_attribs, opt_locations) {
        var program = gl.createProgram();
        for (var ii = 0; ii < shaders.length; ++ii) {
            gl.attachShader(program, shaders[ii]);
        }
        if (opt_attribs) {
            for (var ii = 0; ii < opt_attribs.length; ++ii) {
                gl.bindAttribLocation(
                    program,
                    opt_locations ? opt_locations[ii] : ii,
                    opt_attribs[ii]);
            }
        }
        gl.linkProgram(program);

        // Check the link status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            lastError = gl.getProgramInfoLog (program);
            error("Error in program linking:" + lastError);

            gl.deleteProgram(program);
            return null;
        }
        return program;
    };


    globalGl.error = function(msg) {
        if (window.console) {
            if (window.console.error) {
                window.console.error(msg);
            }
            else if (window.console.log) {
                window.console.log(msg);
            }
        }
    };

    globalGl.createShaderFromScript = function (gl, scriptId, opt_shaderType, opt_errorCallback) {
        var shaderSource = "";
        var shaderType;
        var shaderScript = document.getElementById(scriptId);
        if (!shaderScript) {
            throw("*** Error: unknown script element" + scriptId);
        }
        shaderSource = shaderScript.text;

        if (!opt_shaderType) {
            if (shaderScript.type == "x-shader/x-vertex") {
                shaderType = gl.VERTEX_SHADER;
            } else if (shaderScript.type == "x-shader/x-fragment") {
                shaderType = gl.FRAGMENT_SHADER;
            } else if (shaderType != gl.VERTEX_SHADER && shaderType != gl.FRAGMENT_SHADER) {
                throw("*** Error: unknown shader type");
                return null;
            }
        }

        return loadShader(
                gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
                opt_errorCallback);
    };

    globalGl.loadShader = function(gl, shaderSource, shaderType, opt_errorCallback) {
        var errFn = opt_errorCallback || error;
        // Create the shader object
        var shader = gl.createShader(shaderType);

        // Load the shader source
        gl.shaderSource(shader, shaderSource);

        // Compile the shader
        gl.compileShader(shader);

        // Check the compile status
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            lastError = gl.getShaderInfoLog(shader);
            errFn("*** Error compiling shader '" + shader + "':" + lastError);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    globalGl.textures = {
        'player': {image: './hero.png', textureIndex: 0, width: 89, height: 50, texHorizontalNum: 6, texVerticalNum: 2, tileCount: [6, 5]},
        'zombie1': {image: './zombie1.png', textureIndex: 2, width: 89, height: 50, texHorizontalNum: 6, texVerticalNum: 3, tileCount: [6, 5, 2]},
        'zombie2': {image: './zombie2.png', textureIndex: 3, width: 69, height: 50, texHorizontalNum: 6, texVerticalNum: 3, tileCount: [6, 5, 2]},
        'zombie3': {image: './zombie3.png', textureIndex: 4, width: 69, height: 50, texHorizontalNum: 6, texVerticalNum: 3, tileCount: [6, 5, 2]},
        'bullet': {image: './bullet.png', textureIndex: 1, width: 4, height: 4, texHorizontalNum: 1, texVerticalNum: 1, tileCount: [1, 1]},
        'car1': {image: './car1.png', textureIndex: 5, width: 150, height: 225, texHorizontalNum: 1, texVerticalNum: 1, tileCount: [1, 1]},
        'car2': {image: './car2.png', textureIndex: 5, width: 150, height: 225, texHorizontalNum: 1, texVerticalNum: 1, tileCount: [1, 1]},
        'car3': {image: './car3.png', textureIndex: 5, width: 150, height: 225, texHorizontalNum: 1, texVerticalNum: 1, tileCount: [1, 1]},
        'car4': {image: './car4.png', textureIndex: 5, width: 150, height: 225, texHorizontalNum: 1, texVerticalNum: 1, tileCount: [1, 1]},
        'init': function() {
            var i;
            for (i in textures) {

                (function (){
                    var index = i;
                    var image = new Image();
                    image.onload = function() {
                        textures[index].vertexBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, textures[index].vertexBuffer);

                        var xMin = 0;
                        var xMax = textures[index].width;
                        var yMin = 0;
                        var yMax = textures[index].height;


                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                                xMin, yMax,
                                xMax, yMax,
                                xMin, yMin,
                                xMin, yMin,
                                xMax, yMax,
                                xMax, yMin]), gl.STATIC_DRAW);
                        gl.enableVertexAttribArray(globalGL.positionLocation);
                        gl.vertexAttribPointer(globalGL.positionLocation, 2, gl.FLOAT, false, 0, 0);

                        textures[index].texCoordLocation = gl.getAttribLocation(globalGL.program, 'a_texCoord');


                        textures[index].texCoordBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, textures[index].texCoordBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                                    0,  1,
                                    1,  1,
                                    0,  0,
                                    0,  0,
                                    1,  1,
                                    1,  0]), gl.STATIC_DRAW);
                        gl.enableVertexAttribArray( textures[index].texCoordLocation);
                        gl.vertexAttribPointer(textures[index].texCoordLocation, 2, gl.FLOAT, false, 0, 0);

                        // Create a texture.
                        textures[index].texture = gl.createTexture();
                        textures[index].u_imageLocation = gl.getUniformLocation(globalGL.program, "u_image" + textures[index].textureIndex);
                        gl.uniform1i(textures[index].u_imageLocation, textures[index].textureIndex); 

                        gl.bindTexture(gl.TEXTURE_2D, textures[index].texture);


                        // Upload the image into the texture.
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                        // Set the parameters so we can render any size image.
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

                        gl.bindTexture(gl.TEXTURE_2D, null);



                    };

                    image.src = textures[i].image;  
                })();
            }
        }

    };
    globalGl.textures.init();


    // Get A
    globalGl.overlay = document.getElementById("overlay").getContext('2d');
    globalGl.canvas = document.getElementById("display");
    globalGl.debug = document.getElementById("debug");
    globalGl.canvas.setAttribute('width', '1200');
    gloablGl.canvas.setAttribute('height', '750');
    globalGl.gl = canvas.getContext("experimental-webgl");




    // setup a GLSL program
    gloablGl.vertexShader = createShaderFromScript(gl, "2d-vertex-shader");
    gloablGl.fragmentShader = createShaderFromScript(gl, "2d-fragment-shader");
    globalGL.program = loadProgram(gl, [vertexShader, fragmentShader]);
    gloablGl.gl.useProgram(globalGL.program);

    // look up where the vertex data needs to go.
    globalGL.positionLocation = gl.getAttribLocation(globalGL.program, "a_position");

    globalGL.translationLocation = gl.getUniformLocation(globalGL.program, "u_translation");

    //Get rotation location
    globalGL.rotationLocation = gl.getUniformLocation(globalGL.program, "u_rotation");

    // set the resolution
    globalGL.resolutionLocation = gl.getUniformLocation(globalGL.program, "u_resolution");

    gloablGl.gl.uniform2f(globalGL.resolutionLocation, canvas.width, canvas.height)}) (globalObj, globalGL);
    ;
