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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/dom", "dojo/query", "dojo/dom-construct", "dojo/dom-style", "dijit/Dialog", "pentaho/common/button", "pentaho/common/SmallImageButton", "pentaho/common/Messages", "dojo/dom-class",
  "dojo/_base/lang", "dojo/_base/event", "dojo/keys"],
    function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, dom, query, construct, style, Dialog, Button, SmallImageButton, Messages, domClass, lang, event, keys){
      return declare("pentaho.common.Dialog",[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
          {
            popup : null,
            title: "",
            getLocaleString: pentaho.common.Messages.getString,
            callbacks: [],
            shown: false,
            buttonsCreated: false,
            buttonPanel: null,
            hasTitleBar: true,
            hasBorder: true,
            hasCloseIcon: false,
            closeIcon: undefined,
            _onCancelCallback: undefined,

            constructor: function() {
              Dialog._DialogLevelManager._beginZIndex = 1051;
            },

            setLocalizationLookupFunction: function(f) {
              this.getLocaleString = f;
              this._localize();
            },

            buttonClick: function(idx) {
              if(this.callbacks[idx]) {
                this.callbacks[idx]();
              }
            },

            // override this..
            buttons: [],

            // override this..
            _localize: function() {
              if(this.getLocaleString) {
                for(var i=0; i<this.buttons.length; i++) {
                  var button = query("button"+i, this.popup.domNode);
                  this.buttons[i] = this.getLocaleString(this.buttons[i]);
                  if(button) {
                    button.innerHTML = this.getLocaleString();
                  }
                }
                if (this.hasCloseIcon) {
                  this.closeIcon.domNode.setAttribute("title", this.getLocaleString('CloseIcon_title'));
                }
              }
            },

            // override this
            templateString : "<div></div>",

            // * set variables for the template
            postMixInProperties: function() {

              this.inherited(arguments);
            },

            _createButtonPanel: function() {
              this.buttonPanel = construct.create("TABLE");
              style.set(this.buttonPanel, "width", "100%");
              construct.place(this.buttonPanel, this.popup.domNode);
              domClass.add(this.buttonPanel, 'button-panel');
            },

            _createButtons: function() {
              if (this.buttonPanel.rows.length > 0) {
                this.buttonPanel.deleteRow(-1);
              }
              var row = this.buttonPanel.insertRow(-1);
              var cell = row.insertCell(-1);
              style.set(cell, "align", "right");
              style.set(cell, "width", "100%");
              for(var j=0; j<this.buttons.length; j++) {
                cell = row.insertCell(-1);
                style.set(cell, "align", "right");
                var btn = document.createElement("BUTTON");
                domClass.add(btn, "pentaho-button");
                btn.setAttribute( "id", "button"+j);
                btn.innerHTML = this.buttons[j];
                cell.appendChild(btn);
                btn.onclick = lang.hitch(this, this.buttonClick, j);
              }
            },

            setButtonEnabled: function(/*int*/ buttonIndex, /*boolean*/ enabled) {
              var btn = dom.byId("button" + buttonIndex);
              if(typeof(btn) != 'undefined' && btn != null) {
                if(typeof(btn.set) != 'undefined') {
                  btn.set('disabled', !enabled);
                } else {
                  btn.disabled = !enabled;
                }
              }
            },

            postCreate: function() {
              if(this.templatePath || this.templateString != '<div></div>') {
                this.popup.attr("content", this.domNode);
              }
              this.inherited(arguments);

              if(!this.hasTitleBar) {
                domClass.add(query('.dijitDialogTitleBar',this.popup.domNode)[0],'hidden');
              }
              if(this.hasBorder) {
                domClass.add(this.popup.domNode,'pentaho-dialog');
              }
              if(this.hasCloseIcon) {
                this.closeIcon = new pentaho.common.SmallImageButton({"baseClass": "pentaho-closebutton"});
                domClass.add(this.closeIcon.domNode, "pentahoDialogCloseIcon");
                construct.place(this.closeIcon.domNode,
                    query('.dijitDialogTitleBar',this.popup.domNode)[0]);
                this.closeIcon.callback = lang.hitch(this, this.onCancel);
              }

              domClass.add(query('.dijitDialogTitleBar',this.popup.domNode)[0],'Caption');
              on(this.domNode, 'keyPress', lang.hitch( this,  this.keyUp));
              on(this.popup.domNode, 'keyPress', lang.hitch( this,  this.keyUp));

              this.onKeyUp = lang.hitch(this, this.keyup);
              on(this.domNode,  'keyUp', lang.hitch( this,  this.keyup));
              on(this.popup,  'keyUp', lang.hitch( this,  this.keyup));
              on(this.popup.domNode,  'keyUp', lang.hitch( this,  this.keyup));

              this.popup.onCancel = lang.hitch(this, function(){});
              this.popup.onExecute = lang.hitch(this, this.okClick);
              this._localize();

              on(this.popup, "Hide", lang.hitch( lang.hitch(this,  "onHide")));
            },

            keyup: function(evt) {
              event.stop(evt);
              if(evt.keyCode == keys.ENTER) {
                if(this.execute) {
                  this.execute();
                }
              }
              if(evt.keyCode == keys.ESCAPE) {
                if(this.onCancel) {
                  this.onCancel();
                }
              }
            },

            setTitle: function( title ) {
              this.title = title;
              this.popup.set('title',this.title);
            },

            show: function(){
              this.domNode.style.display='';
              this.popup.set('title',this.title);
              style.set(this.popup.domNode, 'display', 'none');
              if(this.templateBased) {
                if(!this.shown) {
                  this.width = ''+style.get(this.domNode,'width')+'px';
                  if (style.get(this.domNode, 'display') === 'block') {
                    this.width = (style.get(this.domNode,'width') +
                        style.get(this.domNode, 'paddingLeft') +
                        style.get(this.domNode, 'paddingRight') +
                        style.get(this.domNode, 'borderLeftWidth') +
                        style.get(this.domNode, 'borderRightWidth')) +'px';
                  }
                  style.set(this.popup.domNode, 'width', this.width);
                  query('.dijitDialogPaneContent', this.popup.domNode).forEach(function(node) {style.set(node, 'width', this.width);});
                  query('.dijitDialogPaneContent', this.domNode).forEach(function(node) {style.set(node, 'width', this.width);});
                }
              } else {
                if(!this.shown) {
                  style.set(this.domNode, 'width', this.width);
                  style.set(this.popup.domNode, 'width', this.width);
                  query('.dijitDialogPaneContent', this.popup.domNode).forEach(function(node) {style.set(node, 'width', this.width);});
                  query('.dijitDialogPaneContent', this.domNode).forEach(function(node) {style.set(node, 'width', this.width);});
                  style.set(this.domNode, 'height', this.height);
                  style.set(this.popup.domNode, 'height', this.height);
                  query('.dijitDialogPaneContent', this.popup.domNode).forEach(function(node) {style.set(node, 'height', this.height);});
                  query('.dijitDialogPaneContent', this.domNode).forEach(function(node) {style.set(node, 'height', this.height);});
                }
              }

              if(!this.shown) {
                this._createButtonPanel();
              }

              this._createButtons();

              this.popup.show();
              this.shown = true;
            },
            hide: function(){
              return this.popup.hide();
            },
            destroy: function(){
              this.popup.destroy();
            },

            destroyRecursive: function() {
              this.popup.destroyRecursive();
              construct.empty(this.domNode);
            },

            buildRendering: function(){

              if(this.templatePath) {
                this.templateString = null;
              }

              this.inherited(arguments);
              if( this.templateString== '<div></div>') {
                this.popup.buildRendering();
              }
            },

            _attachTemplateNodes: function(rootNode, getAttrFunc){
              this.inherited(arguments);
            },

            _fillContent: function(/*DomNode*/ source){

              if(!this.templatePath && this.templateString == '<div></div>') {
                this.templateBased = false;
                this.width = ''+style.get(source, 'width')+'px';
                this.height = ''+style.get(source, 'height')+'px';
                if(domClass.contains(source, 'hidden' )) {
                  domClass.remove(source,'hidden');
                }
//                this.templateString = source.innerHTML;
                this._attachTemplateNodes(source);
                this.source = source;
//                this.popup = new dijit.Dialog();
                this.popup = new Dialog({title: this.title, content: this.source.innerHTML});
                domClass.add(this.popup.domNode,'pentaho-dialog');
                domClass.remove(this.popup.domNode,'hidden');
                domClass.add(query('.dijitDialogTitleBar',this.popup.domNode)[0],'Caption');
              } else {
                this.templateBased = true;
                this.popup = new Dialog();
//                this.popup.attr("content", this.domNode);
              }
              this.inherited(arguments);
            },

            registerOnCancelCallback: function(f) {
              this._onCancelCallback = f;
            },

            /*
             * Called when the close icon is clicked.
             */
            onCancel: function() {
              if (this._onCancelCallback) {
                try {
                  this._onCancelCallback();
                } catch (e) {
                  console.warn("error in onCancelCallback: " + e);
                }
              }
              this.hide();
            },

            onHide: function() {
              // Callback when popup.onHide() is called
            }
          });
    });
