/*!
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright (c) 2002-2017 Hitachi Vantara. All rights reserved.
 */
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
