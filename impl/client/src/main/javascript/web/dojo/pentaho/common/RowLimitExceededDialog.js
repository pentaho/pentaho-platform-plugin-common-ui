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

define(["dojo/_base/declare", "dojo/on", "dojo/query", "dojo/_base/lang", 'dijit/_WidgetBase',
      'dijit/_TemplatedMixin', 'pentaho/common/button', 'pentaho/common/Dialog', "dojo/dom-style", "dojo/dom-attr", "dojo/text!pentaho/common/RowLimitExceededDialog.html"],
    function (declare, on, query, lang, _WidgetBase, _TemplatedMixin, button, Dialog, style, attr, templateStr) {
      return declare("pentaho.common.RowLimitExceededDialog", [pentaho.common.Dialog], {

            _systemRowLimit: '',

            hasCloseIcon: false,
            buttons: ['OK'],
            _getLocaleString: undefined,

            templateString: templateStr,

            cleanseSizeAttr: function (attr, defaultValue) {
              if (attr === undefined) {
                return defaultValue;
              }
              if (!/.*px$/.exec(attr)) {
                attr = attr + 'px';
              }
              return attr;
            },

            showDialog: function () {
              this.show();
            },

            postCreate: function () {
              this.inherited(arguments);
              this.callbacks = [lang.hitch(this, this.onCancel)];
            },

            registerLocalizationLookup: function (f) {
              this._getLocaleString = f;
              this._localize();
            },

            _localize: function () {
              if(this._getLocaleString) {
                this.setTitle(this._getLocaleString("RowLimitExceededDialogTitle"));
                this.rowLimitExceededDialogMessage.innerHTML = this._getLocaleString("SystemRowLimitExceededDialogMessage", this._systemRowLimit);
              }
            },

            setSystemRowLimit: function (systemRowLimit) {
              this._systemRowLimit = '' + systemRowLimit;
              this._localize();
            }

          }
      );
    });
