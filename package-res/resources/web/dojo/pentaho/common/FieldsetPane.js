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
dojo.require("pentaho.common.Messages");
dojo.require("pentaho.common.DisableablePanel");
dojo.require("dijit._Templated");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.layout.ContentPane");
dojo.require("pentaho.common.Messages");

dojo.declare(
  "pentaho.common.FieldsetPane",
  [pentaho.common.DisableablePanel],
{

  templatePath: dojo.moduleUrl('pentaho.common', 'FieldsetPane.html'),
  widgetsInTemplate: true,
  title: "title",
  width: "100%",
  getLocalString: pentaho.common.Messages.getString,

  postCreate: function() {
    this.inherited(arguments);
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
    this.titleNode.innerHTML = title;
  },

  layout: function() {
    var box = this._borderBox;
    var container = this.containerNode;
    var header = this.titleNode;
    var padding = 20;
    dojo.style(container, {
      height: (box.h - header.offsetHeight - padding) + "px"
    });
  }

});
