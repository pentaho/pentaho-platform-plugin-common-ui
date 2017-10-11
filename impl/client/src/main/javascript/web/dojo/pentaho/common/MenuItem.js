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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dijit/MenuItem",
"dojo/text!pentaho/common/MenuItem.html", "dojo/dom-class"],
    function(declare, _WidgetBase, _Templated, on, query, MenuItem, templateStr, domClass){
      return declare("pentaho.common.MenuItem",[MenuItem],
    {
    
        baseClass: "pentaho-menuitem",

		templateString: templateStr,

		_setSelected: function(selected){
            if(!this.disabled) { 
                domClass.toggle(this.domNode, "pentaho-menuitem-hover", selected);
            }
        },

		setDisabled: function(/*Boolean*/ disabled){
			this.set('disabled', disabled);
			domClass.toggle(this.domNode, "pentaho-menuitem-disabled", disabled);
		},
        
		_setDisabledAttr: function(/*Boolean*/ value){
			this.focusNode.setAttribute("aria-disabled", value ? 'true' : 'false');
			this._set("disabled", value);
			domClass.toggle(this.domNode, "pentaho-menuitem-disabled", value);
		},
        
		_onHover: function(){
			this.getParent().onItemHover(this);
            if(!this.disabled) { 
                domClass.add(this.domNode, "pentaho-menuitem-hover");
            }
        },

		_onUnhover: function(){
			this.getParent().onItemUnhover(this);
			this._set("hovering", false);
            if(!this.disabled) { 
                domClass.remove(this.domNode, "pentaho-menuitem-hover");
            }
		}        
        
	}
);
    });

