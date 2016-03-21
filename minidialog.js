(function ($) {
  "use strict";

  // Add a small plugin for Ajax commands
  $.fn.extend({
    /**
     * Used through a Drupal ajax command
     */
    MiniDialogOpen: function (options) {

      var key = null,
        $minidialog = $("#minidialog"),
        defaults = {
          width: "600px",
          height: "auto",
          hideTitleBar: false,
          modal: true
        };

      if (options) {
        for (key in defaults) {
          if (defaults.hasOwnProperty(key) && !options[key]) {
            options[key] = defaults[key];
          }
        }
      } else {
        options = defaults;
      }
      options.open = true;

      $minidialog.dialog(options);

      if (options.hideTitleBar) {
        $minidialog.parent().find(".ui-dialog-titlebar, .modal-title").css({
          display: "none",
          visibility: "hidden"
        });
      }

      $minidialog.find("#minidialog-close").click(function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        $minidialog.find(".content").html("");
        $minidialog.dialog("close")
          .dialog("destroy");
      });

      // Appends some behaviors to forms inside to avoid multiple submits.
      /*
       $minidialog.find("input[type=submit]").on("click", function () {
       console.log("button clicked")
       });
       */

      // setTimeout() call is a workaround: in some edge cases the dialog
      // opens too quickly and does not center properly according to content
      // size..
      // see http://stackoverflow.com/questions/2231446
      setTimeout(function () {
        $minidialog.dialog("open");
      }, 500);
    },

    /**
     * Used through a Drupal ajax command
     */
    MiniDialogClose: function (redirect) {
      if (redirect) {
        if (true === redirect || redirect === window.location.href) {
          if (window.location.reload) {
            window.location.reload();
          } else {
            window.location.href = window.location.href;
          }
        } else {
          window.location.href = redirect;
        }
      } else {
        $('#minidialog')
          .dialog("close")
          .dialog("destroy")
          .find('.content').html("");
      }
    }
  });

  Drupal.behaviors.minidialog = {
    attach: function (context) {
      // Create the necessary DOM element.
      $('body', context).once('minidialog', function () {
        $(this).append('<div id="minidialog" style="display:none;"><div class="content"></div></div>');
      });

      // Catch our links and add add the right parameter on them.
      $(this).once('minidialog').attr('href', function (i, h) {
        if (h.indexOf('minidialog=1') === -1) {
          h += (h.indexOf('?') !== -1 ? "&minidialog=1" : "?minidialog=1");
        }
        return h;
      });
    }
  };
}(jQuery));
