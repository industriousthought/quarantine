'use strict';

(function(globalObj, globalGl) {



    globalGl.loadProgram = function(gl, shaders, opt_attribs, opt_locations) {
        var program = gl.createProgram();
        for (var ii = 0; ii < shaders.length; ++ii) {
            gl.attachShader(program, shaders[ii]);
        }
        if (opt_attribs) {
            for (ii = 0; ii < opt_attribs.length; ++ii) {
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
            var lastError = gl.getProgramInfoLog (program);
            globalObj.error('Error in program linking:' + lastError);

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
        var shaderSource = '';
        var shaderType;
        var shaderScript = document.getElementById(scriptId);
        if (!shaderScript) {
            throw('*** Error: unknown script element' + scriptId);
        }
        shaderSource = shaderScript.text;

        if (!opt_shaderType) {
            if (shaderScript.type === 'x-shader/x-vertex') {
                shaderType = gl.VERTEX_SHADER;
            } else if (shaderScript.type === 'x-shader/x-fragment') {
                shaderType = gl.FRAGMENT_SHADER;
            } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
                throw('*** Error: unknown shader type');
                return null;
            }
        }

        return globalObj.loadShader(
                gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
                opt_errorCallback);
    };

    globalGl.loadShader = function(gl, shaderSource, shaderType, opt_errorCallback) {
        var errFn = opt_errorCallback || globalObj.error;
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
            var lastError = gl.getShaderInfoLog(shader);
            errFn('*** Error compiling shader "' + shader + '":' + lastError);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    };

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
            for (i in globalObj.textures) {

                (function (){
                    var index = i;
                    var image = new Image();
                    image.onload = function() {
                        globalObj.textures[index].vertexBuffer = globalGl.gl.createBuffer();
                        globalGl.gl.bindBuffer(globalGl.gl.ARRAY_BUFFER, globalObj.textures[index].vertexBuffer);

                        var xMin = 0;
                        var xMax = globalObj.textures[index].width;
                        var yMin = 0;
                        var yMax = globalObj.textures[index].height;


                        globalGl.gl.bufferData(globalGl.gl.ARRAY_BUFFER, new Float32Array([
                                xMin, yMax,
                                xMax, yMax,
                                xMin, yMin,
                                xMin, yMin,
                                xMax, yMax,
                                xMax, yMin]), globalGl.gl.STATIC_DRAW);
                        globalGl.gl.enableVertexAttribArray(globalGl.positionLocation);
                        globalGl.gl.vertexAttribPointer(globalGl.positionLocation, 2, globalGl.gl.FLOAT, false, 0, 0);

                        globalObj.textures[index].texCoordLocation = globalGl.gl.getAttribLocation(globalGl.program, 'a_texCoord');


                        globalObj.textures[index].texCoordBuffer = globalGl.gl.createBuffer();
                        globalGl.gl.bindBuffer(globalGl.gl.ARRAY_BUFFER, globalObj.textures[index].texCoordBuffer);
                        globalGl.gl.bufferData(globalGl.gl.ARRAY_BUFFER, new Float32Array([
                                    0,  1,
                                    1,  1,
                                    0,  0,
                                    0,  0,
                                    1,  1,
                                    1,  0]), globalGl.gl.STATIC_DRAW);
                        globalGl.gl.enableVertexAttribArray( globalObj.textures[index].texCoordLocation);
                        globalGl.gl.vertexAttribPointer(globalObj.textures[index].texCoordLocation, 2, globalGl.gl.FLOAT, false, 0, 0);

                        // Create a texture.
                        globalObj.textures[index].texture = globalGl.gl.createTexture();
                        globalObj.textures[index].u_imageLocation = globalGl.gl.getUniformLocation(globalGl.program, 'u_image' + globalObj.textures[index].textureIndex);
                        globalGl.gl.uniform1i(globalObj.textures[index].u_imageLocation, globalObj.textures[index].textureIndex); 

                        globalGl.gl.bindTexture(globalGl.gl.TEXTURE_2D, globalObj.textures[index].texture);


                        // Upload the image into the texture.
                        globalGl.gl.texImage2D(globalGl.gl.TEXTURE_2D, 0, globalGl.gl.RGBA, globalGl.gl.RGBA, globalGl.gl.UNSIGNED_BYTE, image);

                        // Set the parameters so we can render any size image.
                        globalGl.gl.texParameteri(globalGl.gl.TEXTURE_2D, globalGl.gl.TEXTURE_WRAP_S, globalGl.gl.CLAMP_TO_EDGE);
                        globalGl.gl.texParameteri(globalGl.gl.TEXTURE_2D, globalGl.gl.TEXTURE_WRAP_T, globalGl.gl.CLAMP_TO_EDGE);
                        globalGl.gl.texParameteri(globalGl.gl.TEXTURE_2D, globalGl.gl.TEXTURE_MIN_FILTER, globalGl.gl.NEAREST);
                        globalGl.gl.texParameteri(globalGl.gl.TEXTURE_2D, globalGl.gl.TEXTURE_MAG_FILTER, globalGl.gl.NEAREST);

                        globalGl.gl.bindTexture(globalGl.gl.TEXTURE_2D, null);



                    };

                    image.src = globalObj.textures[i].image;  
                })();
            }
        }

    };
    globalGl.textures.init();


    // Get A
    globalGl.overlay = document.getElementById('overlay').getContext('2d');
    globalGl.canvas = document.getElementById('display');
    globalGl.debug = document.getElementById('debug');
    globalGl.canvas.setAttribute('width', '1200');
    globalGl.canvas.setAttribute('height', '750');
    globalGl.gl = globalObj.canvas.getContext('experimental-webgl');




    // setup a GLSL program
    globalGl.vertexShader = globalGl.createShaderFromScript(globalGl.gl, '2d-vertex-shader');
    globalGl.fragmentShader = globalGl.createShaderFromScript(globalGl.gl, '2d-fragment-shader');
    globalGl.program = globalGl.loadProgram(globalGl.gl, [globalGl.vertexShader, globalGl.fragmentShader]);
    globalGl.gl.useProgram(globalGl.program);

    // look up where the vertex data needs to go.
    globalGl.positionLocation = globalGl.gl.getAttribLocation(globalGl.program, 'a_position');

    globalGl.translationLocation = globalGl.gl.getUniformLocation(globalGl.program, 'u_translation');

    //Get rotation location
    globalGl.rotationLocation = globalGl.gl.getUniformLocation(globalGl.program, 'u_rotation');

    // set the resolution
    globalGl.resolutionLocation = globalGl.gl.getUniformLocation(globalGl.program, 'u_resolution');

    globalGl.gl.uniform2f(globalGl.resolutionLocation, globalObj.canvas.width, globalObj.canvas.height);


}) (globalObj, globalGl);
    
