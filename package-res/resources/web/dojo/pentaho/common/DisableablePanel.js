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

dojo.provide("pentaho.common.DisableablePanel");
dojo.require("dijit._Templated");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.layout.ContentPane");

dojo.declare(
  "pentaho.common.DisableablePanel",
  [dijit.layout.ContentPane, dijit.layout._LayoutWidget, dijit._Templated],
{

  templatePath: dojo.moduleUrl('pentaho.common', 'DisableablePanel.html'),
  widgetsInTemplate: true,
  width: "150px",
  disabled: false,

  postCreate: function() {
    this.inherited(arguments);

    if(this.disabled) {
      this.disable();
    }

  },

  disable: function() {
    dojo.style(this.disabledPane, {
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
    dojo.style(this.disabledPane, {
      display: "none"
    });

    dojo.query('input', this.containerNode).forEach(
      function(inputElem){
        inputElem.disabled = false;
      }
    );

    this.disabled = false;

  }

});
