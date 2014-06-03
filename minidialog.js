;(function (jQuery) {
  "use strict";

  // I'm sorry for what I have done. Anyone that knows better jQuery please
  // rewrite this once for all.
  jQuery.fn.extend({

    MiniDialogOpen: function (options) {

      var key = null, jTarget = jQuery("#minidialog"), defaults = {
        width: "400px",
        height: "auto",
        //hideTitleBar: true,
        modal: true
      };

      if (options) {
        for (key in defaults) {
          if (!options[key]) {
            options[key] = defaults[key];
          }
        }
      } else {
        options = defaults;
      }
      options.open = true;

      jTarget.dialog(options);

      if (options.hideTitleBar) {
        jTarget.parent().find(".ui-dialog-titlebar").css({
          display: "none",
          visibility: "hidden"
        });
      }

      jTarget.find("#minidialog-close").click(function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        jQuery("#minidialog .content").html("");
        jQuery("#minidialog").dialog("close");
        jQuery("#minidialog").dialog("destroy");
      });

      // Appends some behaviors to forms inside to avoid multiple submits.
      /*
      jTarget.find("input[type=submit]").on("click", function () {
        console.log("button clicked")
      });
       */

      // setTimeout() call is a workaround: in some edge cases the dialog
      // opens too quickly and does not center properly according to content
      // size..
      // see http://stackoverflow.com/questions/2231446
      setTimeout(function () {
        jTarget.dialog("open");
      }, 500);
    },

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
        jQuery("#minidialog .content").html("");
        jQuery("#minidialog").dialog("close");
        jQuery("#minidialog").dialog("destroy");
      }
    }
  });

  Drupal.behaviors.MiniDialog = {
    attach: function (context) {
      var jContext = jQuery(context);
      jContext.find("body").once("minidialog", function () {
        jQuery(this).append("<div id=\"minidialog\" style=\"display:none;\"><div class=\"content\"></div></div>");
      });
      /*
      jContext.find("a.minidialog").once("minidialog", function () {
        jQuery(this).click(function (e) {
          var jDialog = jQuery("#minidialog");
          e.preventDefault();
          // Do not stop propagation Drupal.ajax needs it.
          jQuery("#minidialog .content").html("<p>Loading</p>");
          jQuery.fn.MiniDialogOpen();
        });
      });
       */
    }
  };

}(jQuery));
