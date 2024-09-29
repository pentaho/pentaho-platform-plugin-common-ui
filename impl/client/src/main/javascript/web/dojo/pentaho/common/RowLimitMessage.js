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

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_Templated", "dojo/on", "dojo/_base/lang", "dojo/query",
      "pentaho/common/button", "pentaho/common/Dialog", "dojo/dom-class", "dojo/text!pentaho/common/RowLimitMessage.html"],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Templated, on, lang, query, button, Dialog, domClass, templateStr) {
      return declare("pentaho.common.RowLimitMessage", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
          {

            templateString: templateStr,
            _runCallback: undefined,
            _scheduleCallback: undefined,
            _getLocaleString: undefined,

            postCreate: function () {
              this.inherited(arguments);
              on(this.systemLimitRunNow, 'click', lang.hitch(this, '_onRun'));
              on(this.systemLimitSchedule, 'click', lang.hitch(this, '_onSchedule'));
            },

            hide: function () {
              domClass.add(this.limitArea, "hidden");
              domClass.add(this.limitMessage, "hidden");
              domClass.add(this.systemLimitMessage, "hidden");
            },

            registerLocalizationLookup: function (f) {
              this._getLocaleString = f;
              this._localize();
            },

            bindRun: function (callback) {
              this._runCallback = callback;
            },

            bindSchedule: function (callback) {
              this._scheduleCallback = callback;
            },

            _localize: function () {
              if(this._getLocaleString) {
                this.limitMessage.innerHTML = this._getLocaleString('UserRowLimitReachedMessage');
                this.systemMessageInner.innerHTML = this._getLocaleString('SystemRowLimitReachedMessage');
                this.systemLimitRunNow.innerHTML = this._getLocaleString('RowLimitRunNow');
                this.systemLimitSchedule.innerHTML = this._getLocaleString('RowLimitSchedule');
              }
            },

            limitReached: function () {
              domClass.remove(this.limitArea, "hidden");
              domClass.remove(this.limitMessage, "hidden");
              domClass.add(this.systemLimitMessage, "hidden");
            },

            systemLimitReached: function () {
              domClass.remove(this.limitArea, "hidden");
              domClass.add(this.limitMessage, "hidden");
              domClass.remove(this.systemLimitMessage, "hidden");
              this._localize();
            },

            _onRun: function () {
              if (this._runCallback) {
                this._runCallback();
              }
            },

            _onSchedule: function () {
              if (this._scheduleCallback) {
                this._scheduleCallback();
              }
            }
          });
    });
