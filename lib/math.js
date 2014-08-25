'use strict';

(function(globalObj) {


    globalObj.matrixMultiply = function(a,b) {
        var a00=a[0*3+0];
        var a01=a[0*3+1];
        var a02=a[0*3+2];
        var a10=a[1*3+0];
        var a11=a[1*3+1];
        var a12=a[1*3+2];
        var a20=a[2*3+0];
        var a21=a[2*3+1];
        var a22=a[2*3+2];
        var b00=b[0*3+0];
        var b01=b[0*3+1];
        var b02=b[0*3+2];
        var b10=b[1*3+0];
        var b11=b[1*3+1];
        var b12=b[1*3+2];
        var b20=b[2*3+0];
        var b21=b[2*3+1];
        var b22=b[2*3+2];
        return [a00*b00+a01*b10+a02*b20,a00*b01+a01*b11+a02*b21,a00*b02+a01*b12+a02*b22,a10*b00+a11*b10+a12*b20,a10*b01+a11*b11+a12*b21,a10*b02+a11*b12+a12*b22,a20*b00+a21*b10+a22*b20,a20*b01+a21*b11+a22*b21,a20*b02+a21*b12+a22*b22];
    };

    globalObj.makeTranslation = function(tx, ty) {
        return [
            1, 0, 0,
        0, 1, 0,
        tx, ty, 1
            ];
    };

    globalObj.makeRotation = function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c,-s, 0,
            s, c, 0,
            0, 0, 1
                ];
    };

    globalObj.makeScale = function(sx, sy) {
        return [
            sx, 0, 0,
        0, sy, 0,
        0, 0, 1
            ];
    };

    globalObj.rotatePoint = function(pointX, pointY, originX, originY, angle) {
        return [
            Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
            ];
    };

    globalObj.Square = function(p) {
        var xMin, xMax, yMin, yMax, ys, xs, i;
        this.center = p.center;
        this.vertices = [
            [this.center[0] - (p.width / 2), this.center[1] - (p.height / 2)],
            [this.center[0] + (p.width / 2), this.center[1] - (p.height / 2)],
            [this.center[0] + (p.width / 2), this.center[1] + (p.height / 2)],
            [this.center[0] - (p.width / 2), this.center[1] + (p.height / 2)]
                ];

        this.draw = function(ctx) { 
            var i = 0;
            for (i = 0; i < this.vertices.length; i++) {  
                ctx.beginPath();
                ctx.arc(
                        this.vertices[i][0], 
                        this.vertices[i][1], 
                        5, 0, 2 * Math.PI, false);

                ctx.fillStyle = 'green';
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(
                    this.center[0], 
                    this.center[1], 
                    5, 0, 2 * Math.PI, false);

            ctx.fillStyle = 'white';
            ctx.fill();

        };


        this.edges = [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 0]
                ];

        this.getAxis = function(axis) {
            var i = 0;
            var output = [];
            for (i = 0; i < this.vertices.length; i++) {
                output.push(this.vertices[i][axis]);
            }
            return output;
        };


        this.rotate = function(theta) {
            var output = [];
            var i = 0;
            for (i = 0; i < this.vertices.length; i++) {  
                output[i] = globalObj.rotatePoint(this.vertices[i][0], this.vertices[i][1], this.center[0], this.center[1], theta); 
            }
            this.vertices = output;
        };

        if (p.rotation) { 
            this.rotate(-1 * (p.rotation));
        }

        xs = this.getAxis(0);
        ys = this.getAxis(1);
        for (i = 0; i < xs.length; i++) {
            if (!xMin) {
                xMin = xs[i];
            } else {
                if (xMin > xs[i]) {
                    xMin = xs[i];
                }
            }

            if (!xMax) {
                xMax = xs[i];
            } else {
                if (xMax < xs[i]) {
                    xMax = xs[i];
                }
            }

            if (!yMin) {
                yMin = ys[i];
            } else {
                if (yMin > ys[i]) {
                    yMin = ys[i];
                }
            }

            if (!yMax) {
                yMax = ys[i];
            } else {
                if (yMax < ys[i]) {
                    yMax = ys[i];
                }
            }

        }


        this.pointInBoundary = function(x, y) {
            if (xMin <= x && x <= xMax && yMin <= y && y <= yMax) {
                return true;
            }
        };

        var dist2 = function(v, w) { 
            return Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2) ;
        };

        var distToSegmentSquared = function(p, v, w) {
            var l2 = dist2(v, w);
            if (l2 === 0) return dist2(p, v);
            var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
            if (t < 0) return dist2(p, v);
            if (t > 1) return dist2(p, w);
            return dist2(p, { x: v.x + t * (w.x - v.x),
                y: v.y + t * (w.y - v.y) });
        };

        var distToSegment = function(p, v, w) { 
            return Math.sqrt(distToSegmentSquared(p, v, w));
        };

        this.getClosestVertices = function(x, y) {

            var min;
            var distances = [];
            var i = 0;
            for (i = 0; i < this.vertices.length; i++) {
                distances.push(distToSegment({x: x, y: y}, {x: this.vertices[this.edges[i][0]][0], y: this.vertices[this.edges[i][0]][1]}, {x: this.vertices[this.edges[i][1]][0], y: this.vertices[this.edges[i][1]][1]}));
            }

            for (i = 0; i < distances.length; i++) {

                if (min === null) {
                    min = i;
                } else {
                    if (distances[min] > distances[i]) {
                        min = i;
                    }

                }

            }

            return min;
        };
    };

    globalObj.findPerpendicularPoint = function(xp, yp, x1, y1, x2, y2) {
        var t =  ((xp - x1) * (x2 - x1) + (yp - y1) * (y2 - y1)) / (Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];

    };

    globalObj.pointInPolygon = function(numberOfVertices, xCoordinates, yCoordinates, testX, testY) {
        var i, j;
        var c = false;
        for (i = 0, j = numberOfVertices - 1; i < numberOfVertices; j = i++) {
            if ( ((yCoordinates[i] > testY) !== (yCoordinates[j] > testY)) &&
                    (testX < (xCoordinates[j] - xCoordinates[i]) * (testY - yCoordinates[i]) / (yCoordinates[j] - yCoordinates[i]) + xCoordinates[i]) )
                c = !c;
        }

        return c;

    };

    globalObj.length = function(x, y) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    };

    globalObj.Force = function(v, type) {
        var start = new Date();
        var vec = v;
        this.kill = false;
        this.type = type;

        this.getVec = function() {
            var dif = new Date() - start;
            if (dif > 250) {
                this.kill = true;
            }
            return {x: vec.x * Math.cos((dif / 250) * (Math.PI / 2)), y: vec.y * Math.cos((dif / 250) * (Math.PI / 2))};

        };

    };

    globalObj.CURVES = {};

    globalObj.CURVES.linear = function(x) {
        return x;
    };

    globalObj.CURVES.forwardSlope= function(x) {
        return - Math.pow(x - 1, 2) + 1;
    };

    globalObj.CURVES.rearSlope= function(x) {
        return  Math.pow(x, 2);
    };

    globalObj.CURVES.amplify = function(f) {
        return function(x) { return f(f(x)); };
    };

    globalObj.CURVES.step = function(x) {
        if (x < 0.95) {
            return 0;
        } else {
            return 1;
        }

    };

    globalObj.CURVES.compose = function(f, g) {
        return function(x) { return f(g(x)); };

    };

}) (globalObj);
