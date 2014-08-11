'strict mode'

(function(globalObj, globalGl) {

    var CURVES = {};

    CURVES.linear = function(x) {
        return x;
    };

    CURVES.forwardSlope= function(x) {
        return - Math.pow(x - 1, 2) + 1;
    };

    CURVES.rearSlope= function(x) {
        return  Math.pow(x, 2);
    };

    CURVES.amplify = function(f) {
        return function(x) { return f(f(x)); };
    };

    CURVES.step = function(x) {
        if (x < .95) {
            return 0;
        } else {
            return 1;
        }

    };

    CURVES.compose = function(f, g) {
        return function(x) { return f(g(x)) };

    }}) (globalObj, globalGL);
;
