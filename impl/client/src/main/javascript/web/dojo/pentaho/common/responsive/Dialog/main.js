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
/* globals Promise */

define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/dom-class',
  'dijit/Dialog',
  'pentaho/i18n!messages',
  'dojo/text!./template.html',
  '../../Overrides',
  'pentaho/shim/es6-promise',
  'css!./themes/styles.css'
], function(declare, lang, on, domClass, Dialog, bundle, templateHtml) {

  // The pentaho/common/Overrides is needed so that the dialog's modal underlay/backdrop uses the Pentaho
  // glasspane CSS class and associated color.

  /**
   * @name dijit.Dialog
   * @class
   */

  /**
   * @name pentaho.common.responsive
   * @namespace
   */

  /**
   * @name pentaho.common.responsive.spec
   * @namespace
   */

  /**
   * @name Action
   * @memberof pentaho.common.responsive
   * @interface
   * @protected
   * @property {string} code - The code of the action.
   * @property {string} label - The label of the action.
   * @property {number} index - The index of the action.
   */

  /**
   * A responsive Dojo/Dijit dialog whose body is given as a template string and whose button section
   * is dynamically generated from provided metadata.
   *
   * To specify the HTML string of the body section, override {@link #bodyHtml} or
   * specify the `body` parameter when constructing an instance.
   *
   * To specify the buttons to display in the button section, override {@link #actions} or
   * specify the `actions` parameter when constructing an instance.
   *
   * @alias Dialog
   * @memberof pentaho.common.responsive
   * @class
   * @extends dijit.Dialog
   */
  return declare(Dialog, /** @lends pentaho.common.responsive.Dialog# */{
    /** @override */
    templateString: templateHtml,

    /**
     * CSS classes to add to the dialog.
     *
     * Can be specified on the prototype or via constructor `params` argument.
     *
     * @type {?string}
     */
    dialogClasses: null,

    /**
     * The HTML of the body section.
     *
     * Can be specified on the prototype or via constructor `params` argument.
     *
     * @type {?string}
     */
    bodyHtml: null,

    /**
     * The actions' specification.
     *
     * A map from action code to action label.
     *
     * Can be specified on the prototype or via constructor `params` argument.
     *
     * @type {Object.<string, string>}
     */
    actions: {},

    /**
     * The compiled map of actions by action code.
     * @type {Object.<string, pentaho.common.responsive.Action>}
     * @private
     */
    __actions: Object.create(null),

    /**
     * Sets the actions' specification.
     *
     * Integrates with Dojo's {@link #set} method. Only takes effect if used before `postCreate` is called.
     *
     * @param {Object.<string, string>} actionsSpec - The actions' specification; a map from code to label.
     * @protected
     */
    _setActionsAttr: function(actionsSpec) {
      this.actions = actionsSpec;
      this.__actions = this.__buildActionsMap(actionsSpec);
    },

    /**
     * Gets the actions' specification.
     *
     * Integrates with Dojo's {@link #get} method.
     *
     * @return {Object.<string, string>} The actions' specification.
     * @protected
     */
    _getActionsAttr: function() {
      return this.actions;
    },

    /**
     * Sets the dialog-level CSS classes as a space separated string.
     *
     * Integrates with Dojo's {@link #set} method.
     *
     * @return {?string} The new dialog-level CSS classes.
     * @protected
     */
    _setDialogClassesAttr: function(classes) {
      if (!classes) {
        classes = null;
      }

      if (this.dialogClasses != null) {
        domClass.remove(this.domNode, this.dialogClasses);
      }

      this.dialogClasses = classes;

      if (this.dialogClasses != null) {
        domClass.add(this.domNode, this.dialogClasses);
      }
    },

    /**
     * Gets the dialog-level CSS classes as a space separated string.
     *
     * Integrates with Dojo's {@link #get} method.
     *
     * @return {?string} The dialog-level CSS classes.
     * @protected
     */
    _getDialogClassesAttr: function() {
      return this.dialogClasses;
    },

    /**
     * Builds an actions' map from an actions' specification.
     *
     * @param {Object.<string, string>} actionsSpec - An actions' specification.
     * @return {Object.<string, pentaho.common.responsive.Action>} The actions' map.
     * @private
     */
    __buildActionsMap: function(actionsSpec) {
      var actions = Object.create(null);

      if (actionsSpec != null) {
        Object.keys(actionsSpec).forEach(function(code, index) {
          actions[code] = {
            code: code,
            label: actionsSpec[code] || bundle.structured.actions[code] || code,
            index: index
          };
        });
      }

      return Object.freeze(actions);
    },

    /**
     * The button panel element, bound by the HTML template and Dojo attach node.
     * @type {?Element}
     * @protected
     */
    _buttonPanelNode: null,

    /** @override */
    buildRendering: function() {
      var rendered = this._rendered;
      if (!rendered) {
        // Replace any variables in bodyHtml, before this one is itself, substituted into the main template.
        this.bodyHtml = this._stringRepl(this.bodyHtml);
      }

      this.inherited(arguments);
    },

    /** @override */
    postCreate: function() {
      this.inherited(arguments);

      // buildRendering already called. Attributes already initialized.

      this._initializeButtons();
    },

    /**
     * Sets the dialog's title.
     *
     * @param {string} titleHtml - The title of the dialog as an HTML string.
     */
    setTitle: function(titleHtml) {
      this.set("title", titleHtml);
    },

    // region show dialog
    /** @override */
    show: function() {
      if (this._promiseControl == null) {
        var promiseControl = this._promiseControl = createPromiseControl();

        // A Dojo Promise / "Then'able". Not a standard Promise.
        promiseControl.fadeInPromiseLike = this.inherited(arguments);
      }

      return this._promiseControl.fadeInPromiseLike;
    },

    /**
     * Shows the dialog.
     *
     * When the dialog is already being shown,
     * returns the promise that was returned by the method call that initially showed the dialog.
     *
     * This method is equivalent to the {@link #show} method with the distinction of the returned promise —
     * the promise returned by the latter is resolved when the dialog's fade in animation ends.
     *
     * @return {Promise} A promise that is resolved when the dialog is accepted,
     *  and is rejected when the dialog is canceled.
     *  The resolution value is the dialog's result value.
     *  The rejection value is the dialog's cancellation value. However, it may also contain an error object if one
     *  occurs while showing the dialog (e.g. if the fade in animation fails).
     */
    showDialog: function() {

      this.show();

      // assert this._promiseControl != null;

      return this._promiseControl.promise;
    },

    /**
     * Initializes the buttons panel from the defined actions.
     * @protected
     */
    _initializeButtons: function() {
      Object.keys(this.__actions).forEach(function(code) {
        this._buttonPanelNode.appendChild(this._createButton(this.__actions[code]));
      }, this);
    },

    /**
     * Creates the button element for a given action.
     *
     * The returned button element already has events attached.
     *
     * @param {pentaho.common.responsive.Action} action - The action object.
     * @return {Element} The button element.
     * @protected
     */
    _createButton: function(action) {
      var buttonNode = document.createElement('button');
      buttonNode.classList.add('pentaho-button');
      buttonNode.innerText = action.label;

      this.own(on(buttonNode, 'click', this.__createButtonClickHandler(action.code)));

      return buttonNode;
    },

    __createButtonClickHandler: function(actionCode) {
      return actionCode === 'cancel' ?
          this.cancelDialog.bind(this, actionCode) :
          this.acceptDialog.bind(this, actionCode);
    },
    // endregion

    // region Action State
    /**
     * Sets the enabled state of an action, given its code.
     *
     * The enabled state of the corresponding button is updated in response.
     *
     * @param {string} actionCode - The code of the action whose enabled state to set.
     * @param {boolean} enabled - The enabled state of the action.
     */
    setActionEnabled: function(actionCode, enabled) {
      this._getButton(actionCode).disabled = !enabled;
    },

    /**
     * Gets the action button of an action given its code.
     *
     * @param {string} actionCode - The code of the action.
     * @return {Element} The button element.
     * @protected
     */
    _getButton: function(actionCode) {
      return this._buttonPanelNode.children[this._getAction(actionCode).index];
    },

    /**
     * Gets the action object given its code.
     *
     * @param {string} actionCode - The code of the action.
     * @return {pentaho.common.responsive.Action} The action object.
     * @protected
     */
    _getAction: function(actionCode) {
      var action = this.__actions[actionCode];
      if (action == null) {
        throw new Error('Undefined action \'' + actionCode + '\'.');
      }

      return action;
    },
    // endregion

    // region Accept and Cancel
    /**
     * Checks that the dialog is showing and throws an error if not.
     * @throws {Error} If method is called when the dialog is not shown or is already hiding.
     * @private
     */
    __checkShowing: function() {
      if (this._promiseControl == null || this._fadeOutDeferred != null) {
        throw new Error('Dialog is not open.');
      }
    },

    /**
     * Accepts the dialog, optionally with a given result.
     *
     * This method hides the dialog and resolves the promise previously returned by {@link #showDialog} with the given
     * result value.
     *
     * All action buttons, except that of the action named `cancel`, accept the dialog with the action id as a result.
     *
     * @param {*} [result] - The result, if any.
     * @throws {Error} If method is called when the dialog is not shown or is already hiding.
     */
    acceptDialog: function(result) {
      this.__checkShowing();

      this._promiseControl.accepted = true;
      this._promiseControl.result = result;

      // Call DialogMixin#_onSubmit.
      // - Calls onExecute. Which hides the dialog, via aspect.after on dijit.Dialog.
      // - Calls execute.
      this._onSubmit();
    },

    /**
     * Cancels the dialog.
     *
     * Pressing the `ESC` key also cancels the dialog.
     *
     * Directly hiding the dialog via `hide()` has the same effect of calling `cancelDialog()`.
     * The `hide` method does not, however, allow specifying a cancellation error.
     *
     * The action button of an action named `cancel` cancels the dialog with the action id as a result.
     *
     * @param {*} [reason] - A cancellation reason, if any.
     * @throws {Error} If method is called when the dialog is not shown or is already hiding.
     * @see #hide
     */
    cancelDialog: function(reason) {
      this.__checkShowing();

      // This is the default value.
      // assert this._promiseControl.accepted ==== false;

      this._promiseControl.reason = reason;

      // - Hides the dialog, via aspect.after on dijit.Dialog.
      this.onCancel();
    },

    /**
     * Called when the dialog is hidden, when the fade out animation ends.
     * @override
     */
    onHide: function() {
      var promiseControl = this._promiseControl;
      // assert promiseControl != null

      this._promiseControl = null;

      if (promiseControl.accepted) {
        promiseControl.resolve(promiseControl.result);
      } else {
        promiseControl.reject(promiseControl.reason);
      }
    },
    // endregion
  });

  function createPromiseControl() {
    var promiseControl = {
      promise: null,
      resolve: null,
      reject: null,
      accepted: false,
      result: undefined,
      reason: undefined,
      fadeInPromiseLike: null
    };

    promiseControl.promise = new Promise(function(resolve, reject) {
      // This function is called synchronously.
      promiseControl.resolve = resolve;
      promiseControl.reject = reject;
    });

    return promiseControl;
  }
});
