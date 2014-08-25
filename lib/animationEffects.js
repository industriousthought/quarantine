'use strict';

(function(globalObj, globalGl) {

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function (callback) {
                return window.setTimeout(callback, 17 /*~ 1000/60*/);
            });
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = (window.cancelRequestAnimationFrame ||
            window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
            window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
            window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame ||
            window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame ||
            window.clearTimeout);
    }


    gloablObj.AnimationEvent = function(p){
        var addTime, removeTime, callBackUp;
        var animate = function(hash, time) {

            var elapsedTime, ratioTime, i, value;
            var now = new Date();
            if (!time) {

                time = now;
                if (hash.start === 'start') {

                    addTime = time;
                } else {
                    removeTime = time;

                }
                return true;
            } else {
                elapsedTime = now - time;
                if (elapsedTime < p.length) {
                    ratioTime = elapsedTime / p.length;
                    for (i in p.properties) {
                        if (p.properties[i][hash['start']] < p.properties[i][hash['stop']]) {
                            value = (Math.abs(p.properties[i][hash['start']] - p.properties[i][hash['stop']]) * p.properties[i].curve(ratioTime)) + p.properties[i][hash['start']];
                        } else {
                            value = p.properties[i][hash['start']] - (Math.abs(p.properties[i][hash['start']] - p.properties[i][hash['stop']]) * p.properties[i].curve(ratioTime));
                        }
                        if (p.properties[i].integer) {
                            value = parseInt(value);
                        }
                        p.object.style[i] = value + p.properties[i].suffix;
                    }
                    return true;
                } else {
                    for (i in p.properties) {
                        if (p.properties[i].integer) {
                            p.object.style[i] = parseInt(p.properties[i][hash['stop']]) + p.properties[i].suffix;
                        } else {
                            p.object.style[i] = p.properties[i][hash['stop']] + p.properties[i].suffix;
                        }
                    }
                    if (hash.start === 'stop') {
                        if (p.callBack) {
                            p.callBack();
                        }
                        removeTime = null;
                    } else {
                        addTime = null;
                    }
                    return false;
                }
            }
        };

        this.add = function() {
            if (removeTime) {
                removeTime = new Date() - p.length;
                if (p.callBack) {
                    callBackUp = p.callBack;
                    p.callBack = function() {
                        p.callBack = callBackUp;
                    };
                }
            }
            return animate({start: 'start', stop: 'stop'}, addTime);

        };

        this.remove = function() {
            if (addTime) {
                addTime = new Date() - p.length;
            }
            return animate({start: 'stop', stop: 'start'}, removeTime);

        };



    };

    globalObj.AnimationManager = new function () {
        var animationQueue = [];
        var running = false;
        var animate = function() {
            (function animloop(){

                for (var i = animationQueue.length - 1; i >= 0; i--) {
                    if (!animationQueue[i]()) {
                        animationQueue.splice(i, 1);
                    }
                }

                if (animationQueue.length > 0) {
                    window.requestAnimationFrame(animloop);
                } else {
                    running = false;
                }
            })();
        };

        this.addAnimation = function(animationEvent) {
            if (animationEvent) {
                animationQueue.push(animationEvent);
                if (running === false) {
                    running = true;
                    animate();
                }
            } else {
                console.log('null animation event caught');
            }
        };
    };

}) (globalObj, globalGL);

