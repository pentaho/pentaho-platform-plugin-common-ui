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

dojo.provide("pentaho.common.DisclosurePanel");

dojo.require("dijit.TitlePane");

dojo.declare("pentaho.common.DisclosurePanel",
	dijit.TitlePane,
	{
        templateString: dojo.cache("pentaho.common", "DisclosurePanel.html"),

        baseClass: "",
        
        duration: 0,
        
        _setCss: function(){
        },

        postCreate: function(){
            this.toggleable = false;
            this.inherited(arguments);
            this.toggleable = true;
        },

        _setOpenAttr: function(/*Boolean*/ open, /*Boolean*/ animate){

            this.hideNode.style.display = open ? "" : "none";
            this.arrowNode.className = open ? "pentaho-disclosure-panel-openicon" : "pentaho-disclosure-panel-closeicon";
            this._set("open", open);
            
        }
    
    }
);

