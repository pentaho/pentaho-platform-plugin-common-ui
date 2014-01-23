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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "pentaho/common/SmallImageButton",
  "dojo/text!pentaho/common/SectionHeader.html", "dojo/_base/lang"],
    function (declare, _WidgetBase, _Templated, on, query, SmallImageButton, templateStr, lang) {
      return declare("pentaho.common.SectionHeader",

          [_WidgetBase, _Templated],
          {
            title: '',

            header: 'header',

            buttonTypes: '',

            headerButtons: [],

            id: '',

            buttonInfo: [],

            height: '20px',

            templateString: templateStr,

            postMixInProperties: function () {
              this.inherited(arguments);
            },

            postCreate: function () {
              this.inherited(arguments);
              if (this.buttonTypes && this.buttonTypes.length > 0) {
                var list = this.buttonTypes.split(',');
                var buttonInfo = [];
                for (var idx = 0; idx < list.length; idx++) {
                  var info = {
                    baseClass: list[idx],
                    id: '' + this.id + '-button-' + idx,
                    title: '',
                    callback: lang.hitch(this, this.buttonClick, idx)
                  };
                  buttonInfo.push(info);
                }
                this.setButtons(buttonInfo);
              }
            },

            setButtons: function (buttonInfo) {
              this.buttonInfo = buttonInfo;
              this.headerButtons = [];
              for (var idx = 0; idx < buttonInfo.length; idx++) {
                var button = new SmallImageButton(buttonInfo[idx]);
                this.headerButtons.push(button);
                // the the button to the section.
                var cell = this.table.rows[0].insertCell(-1);
                cell.appendChild(button.domNode);
              }
            },

            buttonClick: function (idx) {
              if (this.callbacks && idx < this.callbacks.length) {
                this.callbacks[idx](this.headerButtons[idx].id);
              }
            },

            setHeader: function (/*String*/ header) {
              this.header = header;
              this.headerNode.innerHTML = header;
            }

          });
    });
