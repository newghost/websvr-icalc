/* Strings */
/*
var console = {};
console.log = function() {
  !$("#logger").size()
    && $(document.body).append('<div id="logger" style="top:0;position: absolute; z-index: 100000000000; background-color: rgb(0, 0, 0); color: rgb(255, 255, 255);"></div>');

  var $panel = $("#logger");

  for (var i = 0, l = arguments.length; i < l; i++ ) {
    $panel.append(
      arguments[i].constructor == Object
        ? JSON.stringify(arguments[i])
        : arguments[i].toString()
    );
  }
};
*/

String.prototype.format=function(){for(var b=this,a=0;a<arguments.length;++a)b=b.replace(new RegExp("\\{"+a+"\\}","g"),arguments[a]);return b};