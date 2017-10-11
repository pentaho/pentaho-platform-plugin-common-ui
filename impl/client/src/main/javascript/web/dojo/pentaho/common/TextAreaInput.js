/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/query",
  "dojo/text!pentaho/common/TextAreaInput.html", "dojo/_base/lang", "pentaho/common/Messages","dijit/form/Textarea"],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, templateStr, lang, Messages, Textarea) {
      return declare("pentaho.common.TextAreaInput",[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        getLocaleString: pentaho.common.Messages.getString,
        templateString: templateStr,
        widgetsInTemplate: true,

        // widget properties
        width: null,
        height: null,
        okButtonLabel: null,
        cancelButtonLabel: null,
        text: null,
        titleText: null,
        model: null, // placeholder for a stateful model

        attributeMap: lang.delegate(_WidgetBase.prototype.attributeMap, {
          width: {
            node: 'textArea',
            type: 'attribute',
            attribute: 'width'
          },
          height: {
            node: 'textArea',
            type: 'attribute',
            attribute: 'height'
          },
          okButtonLabel: {
            node: 'okayButton',
            type: 'innerHTML'
          },
          cancelButtonLabel: {
            node: 'cancelButton',
            type: 'innerHTML'
          },
          titleText: {
            node: 'titleNode',
            type: 'innerHTML'
          },
          text: {
            node: 'textArea',
            type: 'attribute',
            attribute: 'value'
          }
        }),

        constructor: function () {
          this.inherited(arguments);
          this.okButtonLabel = this.getLocaleString('Ok');
          this.cancelButtonLabel = this.getLocaleString('Cancel');
        },

        postCreate: function () {
          this.container.titleNode = '';
        },

        _widthSetter: function (newWidth) {
          this.width = newWidth;
          this.container.style.width = newWidth;
          this.textArea.style.width = newWidth;
        },

        _heightSetter: function (newHeight) {
          this.height = newHeight;
          this.textArea.style.height = newHeight;
        },

        _textGetter: function () {
          this.text = this.textArea.value;
          return this.text;
        },

        onCancel: function () {
          // override hook
        },

        onSubmit: function () {
          // override hook
        }
      });
    });
