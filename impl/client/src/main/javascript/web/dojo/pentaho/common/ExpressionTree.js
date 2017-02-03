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

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/query", "dojo/dom-construct", "dojo/dom-geometry",
  "dijit/form/Select", "dojo/text!pentaho/common/ExpressionTree/ExpressionTree.html", "dojo/has", "dojo/sniff", "pentaho/common/Messages"],

    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, construct, geometry, Select, templateStr, has, sniff) {
      return declare("pentaho.common.ExpressionTree",[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: templateStr,
            defaultOperator: null,
            operators: null,

            addBundleMessages: function() {
              pentaho.common.Messages.addUrlBundle('pentaho.common',CONTEXT_PATH+'i18n?plugin=common-ui&name=resources/web/dojo/pentaho/common/nls/messages');
            },

            // Function for retrieving localized strings
            getLocaleString: function(key) {
              var localizedMessage = key;
              if (key) {
                localizedMessage = pentaho.common.Messages.getString(key);
              }
              return localizedMessage;
            },

            constructor: function (defaultOp) {
              this.addBundleMessages();

              if (defaultOp && defaultOp.label && defaultOp.value) {
                defaultOp.label = this.getLocaleString(defaultOp.label);
                this.defaultOperator = defaultOp;
              }
              else {
                this.defaultOperator = {
                  label: this.getLocaleString('AND'),
                  value: 'AND'
                  //selected: true
                };
              }

              this.operators = [
                { label: this.getLocaleString('AND'), value: 'AND' },
                { label: this.getLocaleString('OR'), value: 'OR' }
              ];
            },

            postCreate: function () {
              //console.log('postCreate...');
              this.set('operators', this.operators);
              this.operatorSelect.set('options', this.operators);
            },

            startUp: function () {
              //console.log('startup...');
            },

            addCondition: function (dom) {
              var div = construct.create("div", {
                "class": "pentaho-condition"
              });
              construct.place(dom, div);
              construct.place(div, this.conditionsNode);
              this.resize();
            },

            resize: function () {
              //var height = dojo.getComputedStyle(this.conditionsNode).height;
              var height = geometry.position(this.conditionsNode).h + 'px'; // PIR-742
              this.bracketNode.style.height = height;
              this.operatorNode.style.height = height;

              // PIR-725  - IE9 does not like line-height set to auto
              height = (has("ie") && height == 'auto') ? 'inherit' : height;

              this.operatorNode.style.lineHeight = height;

              // center operator
              height = geometry.position(this.bracketNode).h;
              var selectContentHeight = geometry.position(this.operatorSelect.domNode).h;
              this.operatorSelectNode.style.marginTop = (height - selectContentHeight) / 2 + 'px';
              this.operatorSelectNode.style.marginBottom = (height - selectContentHeight) / 2 + 'px';
            },

            onOperatorChange: function (newValue) {
              this.defaultOperator = {
                label: this.getLocaleString(newValue),
                value: newValue,
                selected: true
              };
            }
          }
      );
    });
