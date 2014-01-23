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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/query", "dijit/form/TextBox"
  , "dijit/form/Button", "dojo/text!pentaho/common/TextButtonCombo.html"],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, TextBox, Button, templateStr) {
      return declare("pentaho.common.TextButtonCombo",[_WidgetBase, _TemplatedMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {

        templateString: templateStr,

        buttonLabel: 'Submit',
        textPlaceHolder: 'Enter Text',

        set: function (property, value) {
          if (property == 'buttonLabel') {
            this.submitButton.set('label', value);
          }
          else if (property == 'text' || property == 'value') {
            this.textInput.set('value', value);
          }
          else if (property == 'textPlaceHolder') {
            this.textInput.set('placeHolder', value);
          }
        },

        get: function (property) {
          if (property == 'text' || property == 'value') {
            return this.textInput.get('value');
          }

          return null;
        },

        postCreate: function () {
          this.set('buttonLabel', this.buttonLabel);
          this.set('textPlaceHolder', this.textPlaceHolder);
        },

        _onSubmitButtonClick: function () {
          this.onClickCallback(this.textInput.get('value')); // pass the value of the textbox
        },

        onClickCallback: function (value) {
          console.log("onClickCallback..."); // should override this
        },

        _onTextInputChange: function () {
          this.onChangeCallback(this.textInput.get('value')); // pass the value of the textbox
        },

        onChangeCallback: function (value) {
          console.log("onChangeCallback..."); // should override this
        }
      });
    });
