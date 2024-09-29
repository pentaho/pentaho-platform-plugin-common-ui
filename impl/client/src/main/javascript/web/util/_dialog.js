/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


/* globals pho */

/*
 * Portions of this file are based on jQuery UI, v1.13.2
 */

/* Need module name as this file is loaded first as a static resource by common-ui. */
define("common-ui/util/_dialog", [
  "./_focus",
  "../jquery-clean"
], function(focusUtil, $) {
  "use strict";

  var KeyCodes = {
    tab: 9
  };
  var Selectors = {
    autoFocus: "[autofocus]",
    tabbable: focusUtil.Selectors.tabbable
  };
  var RestoreFocusModes = {
    off: 1,
    fixed: 2,
    auto: 3
  };

  // region Open Dialog Contexts
  var openDialogContexts = [];

  function getOpenDialogContextIndex(dialog) {
    return openDialogContexts.findIndex(function(context) {
      return context.getElement() === dialog;
    });
  }

  function getOpenDialogContext(dialog) {
    var index = getOpenDialogContextIndex(dialog);
    return index < 0 ? null : openDialogContexts[index];
  }
  // endregion

  // region DialogContext
  /**
   * @name DialogContext
   * @memberOf pho.util
   * @class
   * @classDesc A dialog context.
   *
   * @constructor
   * @param {Element} dialog - The dialog element.
   */
  function DialogContext(dialog) {
    this._$dialog = $(dialog);
    this.setContent(null);
    this.setButtons(null);
  }

  function querySection(section, selector) {
    if(Array.isArray(section)) {
      // Filter given elements.
      return $(section).filter(selector);
    }

    // The section's root element or a jQuery of it.
    // Filter descendants.
    return $(section).find(selector);
  }

  Object.assign(DialogContext.prototype, /** @lends pho.util.DialogContext# */{
    _doesAutoFocus: true,
    _doesTrapFocus: true,
    _restoreFocusMode: RestoreFocusModes.auto,
    _$restoreFocus: null,
    _handles: null,

    /**
     * Gets the dialog element.
     * @return {Element} The dialog element.
     */
    getElement: function() {
      return this._$dialog[0];
    },

    /**
     * Gets a value that indicates if the dialog context is open.
     * @return `true` if the dialog context is open; `false`, otherwise.
     */
    isOpen: function() {
      return getOpenDialogContext(this.getElement()) === this;
    },

    /**
     * Sets the dialog's content section information.
     * @param {?Element|Element[]} content - The content section element, or an array of individual content elements.
     *   Defaults to the evaluation of the selector `.dialog-content` on `dialog`.
     * @return {DialogContext} The dialog context.
     */
    setContent: function(content) {
      if(content == null) {
        content = this._$dialog.find(".dialog-content");
        if(!content.length) {
          content = this._$dialog;
        }
      }

      this._queryContent = querySection.bind(null, content);
      return this;
    },

    /**
     * Sets the dialog's buttons section information.
     * @param {?Element|Element[]} buttons - The buttons section element, or an array of individual action elements.
     *   Defaults to the evaluation of the selector `.button-panel` on `dialog`.
     * @return {DialogContext} The dialog context.
     */
    setButtons: function(buttons) {
      if(buttons == null) {
        buttons = this._$dialog.find(".button-panel");
        if(!buttons.length) {
          buttons = this._$dialog;
        }
      }

      this._queryButtons = querySection.bind(null, buttons);
      return this;
    },

    /**
     * Sets the dialog's autofocus behavior.
     *
     * @param {boolean} [autoFocus=true] - The auto-focus configuration.
     *  When `false`, focus is not automatically set when opening the dialog.
     *  When `true`, the element to focus is determined by searching first the content section and then the buttons
     *  section. For either section, the first element with an `autofocus` attribute is chosen. When none exists,
     *  the first element that can receive keyboard focus is chosen. Lastly, the dialog is focused.
     * @return {DialogContext} The dialog context.
     */
    setAutoFocus: function(autoFocus) {
      this._doesAutoFocus = autoFocus == null || !!autoFocus;
      return this;
    },

    /**
     * Sets a value that indicates whether the keyboard focus is trapped inside the dialog.
     *
     * @param {boolean} [trapFocus=true] - The trap-focus value.
     * @return {DialogContext} The dialog context.
     */
    setTrapFocus: function(trapFocus) {
      this._doesTrapFocus = trapFocus == null || !!trapFocus;
      return this;
    },

    /**
     * Sets if and how the dialog restores the focus when closed.
     *
     * @param {boolean|?Element} [restoreFocus=true] - The restore-focus configuration.
     *  When `false`, focus is not restored.
     *  When `true`, focus is restored to the element which had the focus when the dialog was opened.
     *  When an `Element`, focus is restored to it.
     *
     * @return {DialogContext} The dialog context.
     */
    setRestoreFocus: function(restoreFocus) {
      if(restoreFocus === false) {
        this._restoreFocusMode = RestoreFocusModes.off;
        this._$restoreFocus = null;
      } else if(restoreFocus == null || restoreFocus === true) {
        this._restoreFocusMode = RestoreFocusModes.auto;
        this._$restoreFocus = null;
      } else {
        // An Element. Can be from another frame, so cannot reliably use instanceof.
        this._restoreFocusMode = RestoreFocusModes.fixed;
        this._$restoreFocus = $(restoreFocus);
      }

      return this;
    },

    /**
     * Opens the dialog context, if closed.
     * @return {DialogContext} The dialog context.
     * @throws {Error} If the dialog is open in another context.
     */
    open: function() {
      var context = getOpenDialogContext(this.getElement());
      if(context != null) {
        if(context === this) {
          return this;
        }

        throw new Error("Dialog already open in another context.");
      }

      openDialogContexts.push(this);

      if(this._restoreFocusMode === RestoreFocusModes.auto) {
        var activeElement = this._getActiveElement();
        this._$restoreFocus = activeElement && $(activeElement);
      }

      if(this._doesTrapFocus) {
        this._on("keydown", "_onTrapFocusKeyDown");
      }

      if(this._doesAutoFocus) {
        this._autoFocus();
      }

      return this;
    },

    /**
     * Places the focus inside the dialog using the autofocus procedure, if it is open.
     *
     * If a fixed autofocus element, it is chosen. Otherwise, search proceeds first in the dialog's content section,
     * and then in the buttons section. For either section, the first element with an `autofocus` attribute is chosen,
     * and, none existing, the first element that can receive keyboard focus is chosen. Lastly, the dialog is focused.
     *
     * @return {DialogContext} The dialog context.
     */
    autoFocus: function() {
      if(this.isOpen()) {
        this._autoFocus();
      }

      return this;
    },

    _autoFocus: function() {
      var $targets = this._queryContent(Selectors.autoFocus);
      if(!$targets.length) {
        $targets = this._queryContent(Selectors.tabbable);
        if(!$targets.length) {
          $targets = this._queryButtons(Selectors.autoFocus);
          if(!$targets.length) {
            $targets = this._queryButtons(Selectors.tabbable);
            if(!$targets.length) {
              $targets = this._$dialog;
            }
          }
        }
      }

      $targets.eq(0).trigger("focus");
    },

    /**
     * Closes a dialog context, if it is open.
     * @return {DialogContext} The dialog context.
     */
    close: function() {
      // Is this context open?
      var index = getOpenDialogContextIndex(this.getElement());
      if(index < 0 || openDialogContexts[index] !== this) {
        return this;
      }

      openDialogContexts.splice(index, 1);

      if(this._handles != null) {
        this._handles.forEach(function(handle) {
          handle();
        });
        this._handles = null;
      }

      this._doRestoreFocus(index);

      return this;
    },

    _doRestoreFocus: function(nextIndex) {
      if(this._$restoreFocus != null) {
        // Focus still within the dialog?
        var activeElement = this._getActiveElement();
        var isActiveEf = activeElement == null || this._contains(activeElement);
        if(isActiveEf) {
          this._$restoreFocus.trigger("focus");
        } else if(nextIndex < openDialogContexts.length) {
          console.log("active element null or not contained in dialog and was not top-level dialog");

          // Focus was already "stolen". It's best to let it be.
          // E.g. when a dialog A opens another dialog B, B's autofocus may run before A is closed.

          // PUC examples are wizards implemented as dialog to dialog navigation (c.f. Scheduling dialogs),
          // or, on the "Folder Rename" dialog, pressing enter without a folder name,
          // which closes the dialog and only then displays an error message.

          // However, avoid losing the restore focus when a modal dialog navigates to another (the first is closed),
          // by passing the closing dialog's restore focus element to the one after/above,
          // *unless*:
          // - it has a restore focus mode of off
          // - it has a fixed restore focus to an element not of this dialog

          var nextContext = openDialogContexts[nextIndex];
          var nextMode = nextContext._restoreFocusMode;
          if((nextMode === RestoreFocusModes.auto) ||
             (nextMode === RestoreFocusModes.fixed && this._contains(nextContext._$restoreFocus[0]))) {
            nextContext._$restoreFocus = this._$restoreFocus;
          }
        }

        if(this._restoreFocusMode === RestoreFocusModes.auto) {
          this._$restoreFocus = null;
        }
      }
    },

    _getActiveElement: function() {
      var activeElement = document.activeElement;
      while(activeElement !== null && activeElement.tagName.toLowerCase() === "iframe") {
        try {
          activeElement = activeElement.contentDocument.activeElement;
        } catch(ex) {
          // Cross-site security.
          // Just keep the iframe as the active element.
          break;
        }
      }

      return activeElement;
    },

    _contains: function(elem) {
      var dialog = this.getElement();
      return elem === dialog || $.contains(dialog, elem);
    },

    _onTrapFocusKeyDown: function(event) {
      // Adapted from https://github.com/jquery/jquery-ui/blob/1.13.2/ui/widgets/dialog.js
      if(event.keyCode !== KeyCodes.tab || event.isDefaultPrevented()) {
        return;
      }

      var $tabbables = this._$dialog.find(Selectors.tabbable);
      var $first = $tabbables.first();
      var $last = $tabbables.last();

      var targetElem = event.target;
      var isTargetDialog = targetElem === this.getElement();
      if(!event.shiftKey) {
        // Tab forward. At last element or at dialog.
        // Focus first element.
        if(isTargetDialog || targetElem === $last[0]) {
          $first.trigger("focus");
          event.preventDefault();
        }
      } else if(isTargetDialog || targetElem === $first[0]) {
        // Tab backward. At first element or at dialog.
        $last.trigger("focus");
        event.preventDefault();
      }
    },

    _on: function(name, handlerName) {
      var $dialog = this._$dialog;
      var handler = this[handlerName].bind(this);
      $dialog.on(name, handler);

      var disposer = $dialog.off.bind($dialog, name, handler);

      (this._handles || (this._handles = [])).push(disposer);
    }
  });
  // endregion

  return {
    /**
     * Creates a dialog context for a given dialog element.
     *
     * @param {Element} dialog - The dialog element.
     * @return {DialogContext} The dialog context.
     */
    create: function(dialog) {
      return new DialogContext(dialog);
    },

    /**
     * Gets the dialog context of the given open dialog, if any.
     * @method
     * @param {Element} dialog - The dialog element.
     * @return {DialogContext} The dialog context or `null`.
     */
    getOpen: getOpenDialogContext
  };
});

// Create global reference for non-amd users.
var pho = pho || {};
if (pho.util == null) {
  pho.util = {};
}

require(["common-ui/util/_dialog"], function(dialogUtil) {
  pho.util._dialog = dialogUtil;
});
