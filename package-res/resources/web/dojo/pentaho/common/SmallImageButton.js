/*!
 * Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query",
  "dojo/text!pentaho/common/SmallImageButton.html", "dojo/dom-class", "dojo/_base/lang"],
    function (declare, _WidgetBase, _Templated, on, query, templateStr, domClass, lang) {
      return declare("pentaho.common.SmallImageButton", [_WidgetBase, _Templated],
          {
            title: '',

            baseClass: '',
            _imageSrc : require.toUrl("pentaho/common/images/spacer.gif"),

            callback: function () {
            },

            disabled: false,

            onClick: function (event) {

              if (this.callback && !this.get('disabled')) {
                this.callback(event);
              }
            },

            templateString: templateStr,

            mouseOver: function () {
              if (!this.disabled) {
                domClass.add(this.buttonImg, 'pentaho-imagebutton-hover');
              }
            },

            mouseOut: function () {
              if (!this.disabled) {
                domClass.remove(this.buttonImg, 'pentaho-imagebutton-hover');
              }
            },

            set: function (attr, value) {
              this.inherited(arguments);
              if (attr == 'disabled') {
                this.disabled = value;
                domClass.toggle(this.buttonImg, 'pentaho-imagebutton-disabled', this.disabled);
                if (this.disabled) {
                  this.buttonImg.title = '';
                } else {
                  this.buttonImg.title = this.title;
                }
              }
            },

            postMixInProperties: function () {
              this.inherited(arguments);
            },

            postCreate: function () {
              this.inherited(arguments);
              this.buttonImg.className = this.baseClass;
              domClass.toggle(this.buttonImg, 'pentaho-imagebutton-disabled', this.disabled);
              on(this.buttonImg, "click", lang.hitch(this, this.onClick));
              on(this.buttonImg, "mouseover", lang.hitch(this, this.mouseOver));
              on(this.buttonImg, "mouseout", lang.hitch(this, this.mouseOut));
            }
          });
    });
