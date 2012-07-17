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
  [dijit._Widget, dijit._Templated],
{

  templatePath: dojo.moduleUrl('pentaho.common', 'FieldsetPane.html'),
  widgetsInTemplate: true,
  title: "title",
  width: "100%",
  getLocalString: pentaho.common.Messages.getString,
  _disablePaneDiv: null,
  disabled: false,

  postCreate: function() {
    this.inherited(arguments);
    this._localize();
    this._disablePaneDiv = dojo.byId(this.id + "_disabledPane");
    if(this.disabled) {
      this.disable();
    }
  },

  _localize: function() {
    var localTitle = this.getLocalString(this.title);
    if(localTitle != this.title) {
      this.setTitle(localTitle);
    }
  },

  setTitle: function(/*String*/ title) {
    this.title = title;
    dojo.byId(this.id + "_title").innerHTML = title;
  },

  disable: function() {
    dojo.style(this._disablePaneDiv, {
      display: "block",
      height: this.domNode.clientHeight + "px",
      width: this.domNode.clientWidth + "px"
    });
    this.disabled = true;
  },
  enable: function() {
    dojo.style(this._disablePaneDiv, {
      display: "none"
    });
    this.disabled = false;

  }

});
