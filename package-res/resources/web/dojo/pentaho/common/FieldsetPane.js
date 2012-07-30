/*
 * ******************************************************************************
 * Pentaho
 *
 * Copyright (C) 2002-2012 by Pentaho : http://www.pentaho.com
 * ******************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * *****************************************************************************
 */

dojo.provide("pentaho.common.FieldsetPane");
dojo.require("dijit.layout.ContentPane");
dojo.require("pentaho.common.Messages");

dojo.declare(
  "pentaho.common.FieldsetPane",
  [dijit.layout.ContentPane, dijit.layout._LayoutWidget, dijit._Templated],
{

  templatePath: dojo.moduleUrl('pentaho.common', 'FieldsetPane.html'),
  widgetsInTemplate: true,
  title: "title",
  width: "100%",
  getLocalString: pentaho.common.Messages.getString,
  _disablePaneDiv: null,
  _titleDiv: null,
  disabled: false,

  postCreate: function() {
    this.inherited(arguments);
    this._disablePaneDiv = dojo.byId(this.id + "_disabledPane");

    if(this._disablePaneDiv == null) {
      this._disablePaneDiv = dojo.query(".disabledpane", this.domNode)[0];
    }

    if(this.disabled) {
      this.disable();
    }

    this._titleDiv = dojo.byId(this.id + "_title");
    if(this._titleDiv == null) {
      this._titleDiv = dojo.query(".pentaho-fieldset-pane-title", this.domNode)[0];
    }

    this._localize();
  },

  _localize: function() {
    var localTitle = this.getLocalString(this.title);
    if(localTitle != this.title) {
      this.setTitle(localTitle);
    }
  },

  setTitle: function(/*String*/ title) {
    this.title = title;
    this._titleDiv.innerHTML = title;
  },

  disable: function() {
    dojo.style(this._disablePaneDiv, {
      display: "block",
      height: "100%",
      width: "100%"
    });

    dojo.query('input', this.containerNode).forEach(
        function(inputElem){
          inputElem.disabled = true;
        }
    );

    this.disabled = true;
  },

  enable: function() {
    dojo.style(this._disablePaneDiv, {
      display: "none"
    });

    dojo.query('input', this.containerNode).forEach(
        function(inputElem){
          inputElem.disabled = false;
        }
    );

    this.disabled = false;

  },

  layout: function() {
    var box = this._borderBox;
    var container = this.containerNode;
    var header = dojo.byId(this.id + "_title");
    var padding = 20;
    dojo.style(container, {
      height: (box.h - header.offsetHeight - padding) + "px"
    });
  }

});
