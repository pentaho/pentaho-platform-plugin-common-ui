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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/query", "dojo/dom-style",
  "pentaho/common/FieldsetPane", "pentaho/common/Messages", "pentaho/common/DisableablePanel", "dijit/layout/_LayoutWidget", "dijit/layout/ContentPane", "pentaho/common/Messages",
  "dojo/text!pentaho/common/FieldsetPane.html"],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, style, FieldsetPane, Messages, DisableablePanel, _LayoutWidget, ContentPane, Messages, templateStr) {
      return declare("pentaho.common.FieldsetPane",[DisableablePanel, _TemplatedMixin, _WidgetsInTemplateMixin],
          {

            templateString: templateStr,
            title: "title",
            width: "100%",
            getLocalString: pentaho.common.Messages.getString,

            postCreate: function () {
              this.inherited(arguments);
              this._localize();
            },

            _localize: function () {
              var localTitle = this.getLocalString(this.title);
              if (localTitle != this.title) {
                this.setTitle(localTitle);
              }
            },

            setTitle: function (/*String*/ title) {
              this.title = title;
              this.titleNode.innerHTML = title;
            },

            layout: function () {
              var box = this._borderBox;
              var container = this.containerNode;
              var header = this.titleNode;
              var padding = 20;
              style.set(container, {
                height: (box.h - header.offsetHeight - padding) + "px"
              });
            }

          });
    });
