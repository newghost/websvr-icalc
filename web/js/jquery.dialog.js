/*
Description: $.fn.dialog
Author: Kris Zhang
*/

(function($) {

  $.fn.dialog = function(options) {

    var self    = this
      , $this   = $(self)
      , $msgbox = $this.closest(".dialog");

    var create = function(msg, func, opts) {
      var msghtml
        = '<div class="dialog modal">'
        +   '<h3 class="header"></h3>'
        +   '<div class="body"></div>'
        +   '<table class="footer">'
        +   '<tr></tr>'
        +   '</table>'
        + '</div>';

      $msgbox = $(msghtml);
      $(document.body).append($msgbox);
      $msgbox.find(".body").append($this);
      $this.show();
    };

    var createButton = function() {
      var buttons = options.buttons || {}
        , $btnrow = $msgbox.find(".footer tr");

      for (var button in buttons) {
        var btnObj  = buttons[button]
          , id      = btnObj.id
          , text    = btnObj.text
          , click   = btnObj.click;

        if (!text || !click) {
          for (var txt in btnObj) {
            if (btnObj[txt].constructor == Function) {
              text  = txt;
              click = btnObj[txt];
            }
          }
        }

        if (btnObj.constructor == Function) {
          text  = button;
          click = btnObj;
        }

        var $button = $("<td>{0}</td>".format(text));

        id && $button.attr("id", id);
        click && $button.click(function() {
          click.call(self);
        });

        $btnrow.append($button);
      }
    };

    var destroy = function() {
      //display the lottery
      $("#lottery").show();
      $msgbox.hide();
    };

    if (options.constructor == Object) {
      if ($msgbox.size() < 1) {
        create();
        createButton();
      }

      //hidden the lottery
      $("#lottery").hide();
      $msgbox.show();
      $(".header", $msgbox).html(options.title || "");      
    }

    if (options == "destroy" || options == "close") {
      destroy();
    }

    return $this;
  };

})(jQuery);