'strict mode'

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


    function getUrlParameters(parameter, staticURL, decode){
        /*
           Function: getUrlParameters
           Description: Get the value of URL parameters either from 
           current URL or static URL
           Author: Tirumal
           URL: www.code-tricks.com
           */
        var currLocation = (staticURL.length)? staticURL : window.location.search,
            parArr = currLocation.split("?")[1].split("&"),
            returnBool = true;

        for(var i = 0; i < parArr.length; i++){
            parr = parArr[i].split("=");
            if(parr[0] == parameter){
                return (decode) ? decodeURIComponent(parr[1]) : parr[1];
                returnBool = true;
            }else{
                returnBool = false;            
            }
        }

        if(!returnBool) return false;  

    }) (globalObj, globalGL);
}
