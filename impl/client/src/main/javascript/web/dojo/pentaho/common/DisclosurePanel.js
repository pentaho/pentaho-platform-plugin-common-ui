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

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dijit/TitlePane", "dojo/text!pentaho/common/DisclosurePanel.html"],
    function(declare, _WidgetBase, _Templated, on, query, TitlePane, templateStr){
      return declare("pentaho.common.DisclosurePanel" ,[TitlePane],
	    {
        templateString: templateStr,

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
    
      });
    });

