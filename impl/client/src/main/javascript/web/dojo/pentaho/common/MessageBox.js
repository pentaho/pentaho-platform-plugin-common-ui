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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query",'pentaho/common/button'
  ,'pentaho/common/Dialog', "dojo/dom-class", "dojo/text!pentaho/common/MessageBox.html"],
    function(declare, _WidgetBase, _Templated, on, query, button, Dialog, domClass, templateStr){
      return declare("pentaho.common.MessageBox", [Dialog],
     {
        buttons: ['btn1','btn2','btn3'],
        messageType: null,                         // options are null, ERROR, WARN, INFO

        setTitle: function(title) {
            this.titleNode.innerHTML = title;
        },

        postCreate: function() {
          this.inherited(arguments);
          this.setMessageType(this.messageType);
        },

        setMessageType: function(/*String*/ type) {
          this.messageType = type;
          if(type != null) {
            if(type == "ERR" || type == "ERROR") {
              domClass.replace(this.typeIcon, "error-large-icon", "warning-large-icon info-large-icon");
            } else if(type == "WARN" || type == "WARNING") {
              domClass.replace(this.typeIcon, "warning-large-icon", "error-large-icon info-large-icon");
            } else {
              domClass.replace(this.typeIcon, "info-large-icon", "error-large-icon warning-large-icon");
            }
          } else {
            // remove the image
            domClass.remove(this.typeIcon, "error-large-icon info-large-icon warning-large-icon");
          }
        },

        setMessage: function(message) {
            this.messagelbl.innerHTML = message;
        },

        setButtons: function(buttons) {
        
            this.buttons = buttons;
            for(var i=0; i<3; i++) {
                var button = query("button"+i, this.popup.domNode)
                if(button) {
                    if(i<this.buttons.length) {
                        button.innerHTML = this.buttons[i];
                        domClass.remove(button, 'hidden');
                    } else {
                        domClass.add(button, 'hidden');
                    }
                }
            }
        },

        templateString: templateStr
           
      }
);
});
