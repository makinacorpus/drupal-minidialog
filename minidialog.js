(function ($, window, Drupal, document) {
  "use strict";

  var currentDialog;

  /**
   * Resize iframe
   *
   * @param element target
   *   IFrame DOMElement
   */
  function resizeIFrameToFitContent(target) {
    target.width  = target.contentWindow.document.body.scrollWidth;
    target.height = target.contentWindow.document.body.scrollHeight;
  }

  /**
   * Close and destroy the given dialog
   *
   * @param object dialog
   */
  function destroyDialog(dialog) {
    dialog.content.innerHTML = "";
    dialog.handle.dialog("close");
    dialog.handle.dialog("destroy");
  }

  /**
   * Normalize dialog options for jQuery dialog
   *
   * @param object options
   *   API user input and options
   *
   * @returns object
   *   Normalized and default-populated options
   */
  function normalizeOptions(options) {

    var key = null;
    var defaults = {
      width: "600px",
      height: "auto",
      hideTitleBar: false,
      modal: true
    };

    if ("string" === typeof options) {
      options = {content: options};
    }
    if (options.iframe) {
      if (!options.href) {
        throw "You must provide the 'href' property when using the 'iframe' option";
      }
    } else if (!options.content) {
      throw "You must provide the 'content' property";
    }

    // Set "wide" width before applying default
    if (options && options.wide && !options.width) {
      options.width = "900px";
    }

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

    return options;
  }

  /**
   * Open a new dialog
   *
   * @param object|string options
   *   Either the content, for default display options, or an array jQuery
   *   dialog options containing the "content" attributes with the supposed
   *   dialog content.
   *   If the 'iframe' content is specified, content will be ignored and
   *   the 'href' key must be used instead. If no 'href' is provided and
   *   'content' is given, it will attempt to use 'content' as an URL.
   *
   * @returns object
   *   Handle to the dialog
   */
  function openDialog(options) {

    // @todo this supposes there is only one. It should be spawned dyanmically
    //   by this javascript code instead
    var $minidialog = $("#minidialog");
    var minidialog = $minidialog.get(0);

    options = normalizeOptions(options);

    var dialog = {
      handle: $minidialog,
      content: $minidialog.find('.content').get(0),
      options: options
    };

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
      destroyDialog(dialog);
    });

    // Allow caller to change minidialog class for theming
    if (options['class']) {
      minidialog['class'] = options['class'];
    } else {
      minidialog['class'] = "";
    }

    if (options.iframe) {
      var target = document.createElement("iframe");
      target.seamless = "seamless";
      target.setAttribute('frameborder', 0);
      target.setAttribute('src', options.href);
      target.setAttribute('width', "100%");
      target.onload = function () {
        resizeIFrameToFitContent(this);
      };
      setDialogContent(dialog, target);
      // @todo Iframe communication
    } else {
      setDialogContent(dialog, options.content);
    }

    return dialog;
  }

  /**
   * Set dialog content
   *
   * @param object dialog
   * @param DOMNode|string content
   */
  function setDialogContent(dialog, content) {
    if ("string" === typeof content) {
      dialog.content.innerHTML = content;

      // @todo tainted, but working
      Drupal.attachBehaviors(dialog.content);
      // Sometimes it work first time, sometimes not...
      setTimeout(function () {
        Drupal.attachBehaviors(dialog.content);
      }, 700);

      applyContentAjaxification(dialog);

    } else {
      dialog.content.innerHTML = "";
      dialog.content.appendChild(content);
    }
  }

  /**
   * Apply ajaxification on dialog content
   *
   * @param object dialog
   */
  function applyContentAjaxification(dialog) {
    // Appends some behaviors to forms inside to avoid multiple submits.
    if (dialog.options.ajaxify) {
      dialog.handle
        .find("form")
        .each(function () {
          var $this = $(this);
          var action = $this.attr('action');
          var linkOptions = {
            minidialog: 1,
            ajaxify: 1,
            wide: dialog.options.wide ? 1 : 0
          };
          var opt;
          for (opt in linkOptions) {
            if (action && -1 === action.indexOf(opt + '=')) {
              if (-1 === action.indexOf('?')) {
                action = action + '?' + opt + '=' + linkOptions[opt];
              } else {
                action = action + '&' + opt + '=' + linkOptions[opt];
              }
            }
          }
          $this.attr('action', action);
        })
        .ajaxForm({
          dataType: 'json',
          success: function (response, status) {
            if ("string" === typeof response) {
              dialog.content.html(response);
              Drupal.attachBehaviors(dialog.handle);
            } else {
              // Else attempt to pass that to Drupal.ajax and prey
              var element = $('<a href="" class="use-ajax">');
              var hugeHack = new Drupal.ajax('you_know_what', element, {url: 'system/ajax'});
              hugeHack.success(response, status);
            }
          }
        })
      ;
    }
  }

  // Add a small plugin for Ajax commands
  $.fn.extend({

    /**
     * Set the minidialog content, implies open
     */
    MiniDialogContent: function (options) {
      currentDialog = openDialog(options);
    },

    /**
     * Used through a Drupal ajax command
     */
    MiniDialogOpen: function (options) {

      if (currentDialog) {
        destroyDialog(currentDialog);
      }

      currentDialog = openDialog(options);

      // setTimeout() call is a workaround: in some edge cases the dialog
      // opens too quickly and does not center properly according to content
      // size..
      // see http://stackoverflow.com/questions/2231446
      /*
       * ARGG... Actually, we do have a serious problem when using Drupal.ajax,
       * timeout will disallow some behaviors to be correctly set, I have no
       * idea why on earth this may happen.
       *
      setTimeout(function () {
        $minidialog.dialog("open");
      }, 500);
       */
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
        if (currentDialog) {
          destroyDialog(currentDialog);
        }
      }
    }
  });

  /**
   * Drupal behavior.
   */
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

      $(context).find('.minidialog').once('minidialog-ajax', function () {
        if (-1 !== this.href.indexOf('iframe=1')) {
          $(this).on("click", function (event) {
            // @todo find a way to propagate options
            event.stopPropagation();
            event.preventDefault();
            $.fn.MiniDialogOpen({
              iframe: true,
              href: this.href
            });
          });
        }
      });
    }
  };
}(jQuery, window, Drupal, document));
