'use strict'

(function(globalObj, globalGL) {

globalObj.getNewPlayerCoordinates = function() {
    return {x: 200, y: 200};
};

globalObj.getNewZombieCoordinates = function() {
    var locations = [
    {x: 50, y: 50},
    {x: 1150, y: 350},
    {x: 200, y: 650},

    ];
    var i = Math.floor(Math.random() * 3);

    return locations[i];
};

globalObj.TextureMap = function(p) {
    var horizontalNum = p.horizontalNum;
    var verticalNum = p.verticalNum;
    var currentTile = [0, 0];
    var tileCount = p.tileCount;


    this.getTile = function(tile) {
        if (tile !== null) {
            currentTile[1] = tile;
            if (currentTile[0] < tileCount[tile] - 1) {
                currentTile[0]++;
            } else {
                currentTile[0] = 0;
            } 
        }

        return {minX: (1 / horizontalNum) * currentTile[0], maxX: (1 / horizontalNum) * (currentTile[0] + 1), minY: (1 / verticalNum) * currentTile[1], maxY: (1 / verticalNum) * (currentTile[1] + 1)};


    };

};

globalObj.eventLoop = function() {
    globalGl.clear(globalGl.COLOR_BUFFER_BIT);


    var i, j, k, yDif, xDif, coordinates, edge, collider, collidee, pointA, pointB, closestVertices, perpPoint, closestEdge;
    var polygon;
    var crossings = 0;
    var now = new Date();
    var playerCount = 0;

    if (!globalObj.pause && now - globalObj.lastZombieTime > 500 && globalObj.running) {
        globalObj.lastZombieTime = now;
        coordinates = globalObj.getNewZombieCoordinates();
        globalObj.newZombie({id: 'z' + globalObj.lastZombieId, x: coordinates.x, y: coordinates.y});
        globalObj.lastZombieId++;
    }

    for (i in globalObj.agents) {
        collider = globalObj.agents[i];

        if (collider.type === 'player') {
            playerCount++;
        }

        if (collider.logic) {
            collider.logic();
        }

        for (j in globalObj.agents) {
            collidee = globalObj.agents[j];

            if (collidee.collision.radius && collider.collision.radius && collider.collision[collidee.type]) {
                xDif = collider.x - collidee.x;
                yDif = collider.y - collidee.y;
                if (Math.abs(xDif) < collider.collision.radius && Math.abs(yDif) < collider.collision.radius && collider.id !== collidee.id) {
                    collider.collision[collidee.type]({i: i, j: j, xDif: xDif, yDif: yDif});
                }
            }

            if (collidee && collidee.collision.edges && !collider.collision.edges) {
                if (collidee.shape.pointInBoundary(collider.x, collider.y)) {
                    polygon = collidee.shape;
                    if (globalObj.pointInPolygon(polygon.vertices.length, polygon.getAxis(0), polygon.getAxis(1), collider.x, collider.y)) {
                        closestEdge = polygon.getClosestVertices(collider.x, collider.y);
                        perpPoint = globalObj.findPerpendicularPoint(collider.x, collider.y, polygon.vertices[polygon.edges[closestEdge][0]][0], polygon.vertices[polygon.edges[closestEdge][0]][1], polygon.vertices[polygon.edges[closestEdge][1]][0],  polygon.vertices[polygon.edges[closestEdge][1]][1]);
                        collider.collision.edge({i: i, x: perpPoint[0], y: perpPoint[1]});

                    } 
                }
            }
        }

        //if (collider.shape) {
            //collider.shape.draw(overlay);
        //}
        if (collider.draw) {
            collider.draw();   
        }

        if (globalObj.agents[i].kill) {
            delete globalObj.agents[i];
        }

    }

    return playerCount;
};

globalObj.init = function() {

    globalObj.agents = [];
    globalObj.lastZombieTime = new Date();
    globalObj.lastZombieId = 0;
    globalObj.lastBulletId = 0;
    globalObj.players = [];
    globalObj.running = true;

    globalObj.factories.newCar({id: 'car0', type: '1', x: 300, y: 250, rotation: Math.PI / 4});
    globalObj.factories.newCar({id: 'car1', type: '2', x: 800, y: 200, rotation: Math.PI / 0.75});
    globalObj.factories.newCar({id: 'car2', type: '3', x: 200, y: 500, rotation: Math.PI / 1.75});
    globalObj.factories.newField({id: 'wall1', x: 0, y: 470, width: 50, height: 640, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall2', x: 90, y: 750, width: 160, height: 50, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall3', x: 275, y: 780, width: 250, height: 50, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall4', x: 390, y: 630, width: 50, height: 300, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall5', x: 700, y: 505, width: 600, height: 50, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall6', x: 1100, y: 580, width: 280, height: 50, rotation: Math.PI * -1.2});
    globalObj.factories.newField({id: 'wall7', x: 1230, y: 420, width: 50, height: 500, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall8', x: 1200, y: 100, width: 50, height: 230, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall9', x: 715, y: 0, width: 1000, height: 50, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall10', x: 121, y: -15, width: 219, height: 50, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall11', x: -5, y: 82, width: 50, height: 160, rotation: Math.PI});
    globalObj.factories.newField({id: 'wall12', x: 5, y: 5, width: 50, height: 100, rotation: Math.PI * -1.25});

    var socket = io.connect(window.location.protocol + '//' + window.location.host + '/dis' + globalObj.gameID);

    socket.on('pause', function (data) {
        if (globalObj.pause === true) { 
            globalObj.pause = false;
        } else {
            globalObj.pause = true;
        }
    });

    socket.on('ping', function (data) {
        socket.emit('pingBack', {
            id: 'display'
        });
    });

    socket.on('event', function (data) {
        if (data.newPlayer) {
            var newPos = globalObj.getNewPlayerCoordinates();
            globalObj.running = true;
            globalObj.factories.newPlayer({id: data.newPlayer, nick: data.nick, x: newPos.x, y: newPos.y});
            main();
            //console.log(data.newPlayer);

        }

        if (data.controller && globalObj.players[data.id]) {
            globalObj.players[data.id].controller(data);
        }

    });

};

globalObj.main = function() {
    (function(){
        var i = 0;
        var fadeOutNumber;
        var f = function( ){
            if (i < 5 && i > 0) {
                AnimationManager.addAnimation(fadeOutNumber);
                console.log(fadeOutNumber);
            }
            i++;
            if (i < 4) {
                var img = document.getElementById(i + 'number');

                var fadeInNumber = new AnimationEvent({
                    properties: {
                        opacity: {
                            start: 0,
                    stop: 1,
                    suffix: '',
                    curve: CURVES.compose(CURVES.forwardSlope, CURVES.rearSlope)

                        }
                    },
                    length: 500,
                    object: img
                });
                AnimationManager.addAnimation(fadeInNumber.add);
                fadeOutNumber = fadeInNumber.remove;
                window.setInterval(f,2000);
            }
            if (i === 5) {

                var g = function(){
                    var playerCount = eventLoop();
                    if (playerCount > 0) {
                        return true;
                    } else {
                        reset();    
                        return false;
                    }
                };
                AnimationManager.addAnimation(g);
            }
        };
        f();
    })();
};

globalObj.reset = function() {
    window.location.assign(window.location.protocol + '//' + window.location.host + '?id=' + gameID);
};



globalObj.gameID = getUrlParameters('id', '', true);
globalObj.pause = true;

}) (globalObj, globalGL);
