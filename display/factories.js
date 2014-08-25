'use strict';

(function(globalObj, globalGl) {

    globalObj.factories = {};
    globalObj.factories.Agent = function (p) {

        this.id = p.id;

        if (p.textureName) {    

            this.getSpeedCurve = function() {
                var elapsedTime = new Date() - this.changeTime;
                if (this.targetSpeedScaler && (this.targetSpeedScaler > this.currentSpeedScaler)) {
                    this.actualSpeedScaler = this.currentSpeedScaler + ((this.targetSpeedScaler - this.currentSpeedScaler) * Math.sin(((elapsedTime) / 250) * (Math.PI / 2))); 
                    if (elapsedTime > 250) {
                        this.actualSpeedScaler = this.targetSpeedScaler;
                        this.currentSpeedScaler = this.targetSpeedScaler;
                        this.targetSpeedScaler = null;
                        this.changeTime = null;
                    }
                }

                if (this.targetSpeedScaler && (this.targetSpeedScaler < this.currentSpeedScaler)) {
                    this.actualSpeedScaler = this.currentSpeedScaler - ((this.currentSpeedScaler - this.targetSpeedScaler) * Math.sin(((elapsedTime) / 250) * (Math.PI / 2))); 
                    if (elapsedTime > 250) {
                        this.actualSpeedScaler = this.targetSpeedScaler;
                        this.currentSpeedScaler = this.targetSpeedScaler;
                        this.targetSpeedScaler = null;
                        this.changeTime = null;
                    }
                }

            };

            this.changeSpeed = function(targetScaler) {
                this.changeTime = new Date();
                this.targetSpeedScaler = targetScaler;
            };

            this.speed = 0;
            this.changeTime = null;
            this.targetSpeedScaler = null;
            this.currentSpeedScaler = 0;
            this.actualSpeedScaler = 0;
            this.textureIndex = globalObj.textures[p.textureName].textureIndex;
            this.textureName = p.textureName;
            this.texture = globalObj.textures[p.textureName];
            this.texHorizontalNum = globalObj.textures[p.textureName].texHorizontalNum;
            this.texVerticalNum = globalObj.textures[p.textureName].texVerticalNum;
            this.animationTick = 0;
            this.width = globalObj.textures[p.textureName].width;
            this.height = globalObj.textures[p.textureName].height;
            this.x = p.x;
            this.y = p.y;
            this.rotation = p.rotation || 0;
            this.currentAnimationSequence = 0;
            this.lastAnimationSequence = 0;
            this.texMap = new TextureMap({horizontalNum: this.texHorizontalNum, verticalNum: this.texVerticalNum, tileCount: this.texture.tileCount});
            this.currentTex = this.texMap.getTile();


            this.draw = function() {

                var tex;

                if (this.speed > 0 || this.currentAnimationSequence !== this.lastAnimationSequence) {
                    if (this.animationTick > 15 / this.speed || this.currentAnimationSequence !== this.lastAnimationSequence) {
                        this.animationTick = 0;
                        tex = this.texMap.getTile(this.currentAnimationSequence);
                    } else {
                        this.animationTick++;
                    }
                }
                this.lastAnimationSequence = this.currentAnimationSequence;

                if (tex) {
                    this.currentTex = tex;
                }

                globalGl.gl.bindBuffer(globalGl.gl.ARRAY_BUFFER, this.texture.vertexBuffer);
                globalGl.gl.vertexAttribPointer(globalGl.positionLocation, 2, globalGl.gl.FLOAT, false, 0, 0);

                this.texture.texCoordLocation = globalGl.gl.getAttribLocation(globalGl.program, 'a_texCoord');


                globalGl.gl.bindBuffer(globalGl.gl.ARRAY_BUFFER, this.texture.texCoordBuffer);
                globalGl.gl.bufferData(globalGl.gl.ARRAY_BUFFER, new Float32Array([
                            this.currentTex.minX,  this.currentTex.maxY,
                            this.currentTex.maxX,  this.currentTex.maxY,
                            this.currentTex.minX,  this.currentTex.minY,
                            this.currentTex.minX,  this.currentTex.minY,
                            this.currentTex.maxX,  this.currentTex.maxY,
                            this.currentTex.maxX,  this.currentTex.minY]), globalGl.gl.STATIC_DRAW);
                globalGl.gl.enableVertexAttribArray(this.texture.texCoordLocation);
                globalGl.gl.vertexAttribPointer(this.texture.texCoordLocation, 2, globalGl.gl.FLOAT, false, 0, 0);

                var matrixLocation = globalGl.gl.getUniformLocation(globalGl.program,'u_matrix');

                var centerTranslation = [-this.width / 2, -this.height / 2];
                var translation = [this.x, this.y];
                var angleInRadians = this.rotation;
                var scale = [1, 1];

                // Compute the matrices
                var centerTranslationMatrix = globalObj.makeTranslation(centerTranslation[0], centerTranslation[1]);
                var translationMatrix = globalObj.makeTranslation(translation[0], translation[1]);
                var rotationMatrix = globalObj.makeRotation(angleInRadians);
                var scaleMatrix = globalObj.makeScale(scale[0], scale[1]);

                // Multiply the matrices.
                var matrix = globalObj.matrixMultiply(scaleMatrix, centerTranslationMatrix);
                matrix = globalObj.matrixMultiply(matrix, rotationMatrix);
                matrix = globalObj.matrixMultiply(matrix, translationMatrix);

                // Set the matrix.
                globalGl.gl.uniformMatrix3fv(matrixLocation, false, matrix);

                globalGl.gl.activeTexture(globalGl.gl.TEXTURE0);

                globalGl.gl.bindTexture(globalGl.gl.TEXTURE_2D, this.texture.texture);

                // draw
                globalGl.gl.drawArrays(globalGl.gl.TRIANGLES, 0, 6);
                globalGl.gl.bindTexture(globalGl.gl.TEXTURE_2D, null);
            };
        }

        globalObj.agents[this.id] = this;
    };

    globalObj.factories.newField = function(p) {
        var agent = new globalObj.factories.Agent({id: p.id, x: p.x, y: p.y, rotation: p.rotation});
        agent.shape = new globalObj.factories.Square({width: p.width, height: p.height, rotation: p.rotation, center: [p.x, p.y]});
        agent.type = 'field';
        agent.collision = {};
        agent.collision.edges = agent.shape.edges;


    };

    globalObj.factories.newCar = function(p) {
        var agent = new globalObj.factories.Agent({textureName: 'car' + p.type, id: p.id, x: p.x, y: p.y, rotation: p.rotation});
        agent.shape = new globalObj.factories.Square({width: agent.width, height: agent.height, rotation: agent.rotation, center: [p.x, p.y]});
        agent.type = 'car';
        agent.collision = {};
        agent.collision.edges = agent.shape.edges;


    };

    globalObj.factories.newBullet = function(p) {
        var agent = new globalObj.factories.Agent({textureName: 'bullet', id: p.id, x: p.x, y: p.y});
        agent.type = 'bullet';

        agent.vector = p.vector;

        agent.collision = {
            radius: 35,
            edge: function(p) {
                globalObj.agents[p.i].kill = true;
            },
            zombie: function(p) {
                globalObj.agents[p.j].forces.push(new globalObj.factories.Force(globalObj.agents[p.i].vector, 'shot'));
                globalObj.agents[p.j].health -= Math.random() * 20 + 30;
                globalObj.agents[p.i].kill = true;
                //globalObj.agents[p.j].hit = true;
            }
        };

        agent.logic = function() {
            this.x += this.vector.x * 7;
            this.y -= this.vector.y * 7;
            if (this.x < 0 || this.x > globalGl.canvas.width || this.y < 0 || this.y > globalGl.canvas.height) {
                this.kill = true;
            }
        };

    };

    globalObj.factories.newPlayer = function(p) {
        var agent = new globalObj.factories.Agent({textureName: 'player', id: p.id, x: p.x, y: p.y});

        agent.type = 'player';
        agent.reloading = false;
        agent.maxSpeed = 1.5;

        agent.controller = function(data) {
            var x, y, vectorLength;

            if (data.controller === 'leftJoystick') {
                if (data.x || data.y) {
                    if (this.speed === 0) {
                        this.changeSpeed(1.5);
                    }

                    vectorLength = globalObj.length(data.x, data.y);
                    if (vectorLength > this.maxSpeed) {
                        data.x = data.x * (this.maxSpeed/ vectorLength);
                        data.y = data.y * (this.maxSpeed/ vectorLength);
                    }
                    x = data.x * 2 * this.actualSpeedScaler;
                    y = data.y * 2 * this.actualSpeedScaler;
                    this.x -= x;
                    this.y -= y;
                    this.speed = globalObj.length(x, y);

                    if (!this.shooting) {
                        this.rotation = Math.atan2(data.x, data.y) + (Math.PI / 2);
                    }
                } else {
                    this.speed = 0;
                    this.changeSpeed(0);
                }
            }

            if (data.controller === 'rightJoystick') {

                if (data.x || data.y) {
                    if (this.speed > 0) {
                        this.changeSpeed(1);
                    }
                    this.shooting = true;
                    this.rotation = Math.atan2(data.x, data.y) + (Math.PI / 2);
                } else {
                    if (this.speed > 0) {
                        this.changeSpeed(1.5);
                    }
                    this.shooting = false;
                }

            }

        };

        agent.logic = function() {
            if (this.targetSpeedScaler) {
                this.getSpeedCurve();
            }
            if (this.shooting) {
                if (!this.reloading) {
                    globalObj.factories.newBullet({
                        x: this.x + (25 * Math.cos(this.rotation)), 
                        y: this.y - (25 * Math.sin(this.rotation)), 
                        vector: {x: Math.cos(this.rotation) * 2, y: Math.sin(this.rotation) * 2}, 
                        id: globalObj.lastBulletId++});
                    this.reloading = new Date();
                } else {
                    if (new Date() - this.reloading > 100)
                        this.reloading = false;
                }
                this.currentAnimationSequence = 1;
            } else {
                this.currentAnimationSequence = 0;
            }

        };

        agent.nick = p.nick;
        agent.collision = {
            radius: 20,
            edge: function(p) {
                globalObj.agents[p.i].x = p.x;
                globalObj.agents[p.i].y = p.y;
            },
            player: function(p) {

            },
            zombie: function(p) {

            }

        };

        globalObj.players[agent.id] = agent;


        //alert(agent.nick);
    };


    globalObj.factories.newZombie = function(p) {
        var randomNumber = Math.random() * 9;
        var textureIndex = Math.floor(randomNumber / 3);


        var agent = new globalObj.factories.Agent({textureName: 'zombie' + (1 + textureIndex), id: p.id, x: p.x, y: p.y});

        agent.forces = [];
        agent.health = 100;

        agent.baseSpeed = (Math.random() * 1) + 1;
        agent.runner = 150 + Math.random() * 250;

        agent.collision = {
            radius: 20,
            edge: function(p) {
                globalObj.agents[p.i].x = p.x;
                globalObj.agents[p.i].y = p.y;
            },
            player: function(p) {
                delete globalObj.agents[p.j];
                delete globalObj.players[p.j];
                globalObj.socket.emit('deadPlayer', {
                    id: p.j
                });

            },
            zombie: function(p) {
                globalObj.agents[p.i].x -= (20 - p.xDif) / 50;
                globalObj.agents[p.i].y -= (20 - p.yDif) / 50;

            }

        };
        agent.type = 'zombie';
        agent.logic = function() {
            if (this.health < 0) {
                this.kill = true;
            }

            var closestPlayer = {};
            var i, xDif, yDif, forceVector;
            for (i in globalObj.players) {
                
                xDif = globalObj.players[i].x - this.x;
                yDif = globalObj.players[i].y - this.y;
                if (!closestPlayer.id || Math.sqrt(Math.pow(xDif, 2) + (Math.pow(yDif, 2))) < closestPlayer.distance) {
                    closestPlayer.id = i;
                    closestPlayer.distance = Math.sqrt(Math.pow(xDif, 2) + (Math.pow(yDif, 2)));
                    closestPlayer.xDif = xDif;
                    closestPlayer.yDif = yDif;
                }

            }

            if (this.targetSpeedScaler) {
                this.getSpeedCurve();
            }

            if (this.actualSpeedScaler === 0) {
                this.changeSpeed(1);
            }

            if (closestPlayer.distance < this.runner) {
                if (this.actualSpeedScaler === 1) {
                    this.changeSpeed(1.5);
                }
                this.currentAnimationSequence = 1;
            } else {
                if (this.actualSpeedScaler === 1.5) {
                    this.changeSpeed(1);
                }
                this.currentAnimationSequence = 0;
            }

            this.speed = this.baseSpeed * this.actualSpeedScaler;

            this.rotation = Math.atan2(xDif, yDif) - (Math.PI / 2);
            if (globalObj.players[closestPlayer.id]) {
                this.x += Math.cos(this.rotation) * this.speed;
                this.y -= Math.sin(this.rotation) * this.speed;
            }

            for (i = this.forces.length; i > 0; i--) {
                if (!this.forces[i - 1].kill) {
                    if (this.forces[i - 1].type === 'shot') {
                        this.currentAnimationSequence = 2;
                    }
                    forceVector = this.forces[i - 1].getVec();
                    this.x += forceVector.x * 5;
                    this.y -= forceVector.y * 5;
                } else {
                    this.forces.splice(i - 1, 1);
                }
            }

        };

    };

}) (globalObj, globalGl);

