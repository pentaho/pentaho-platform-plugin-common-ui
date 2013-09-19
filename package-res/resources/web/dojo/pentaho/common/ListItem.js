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

dojo.provide("pentaho.common.ListItem");

dojo.declare(
    "pentaho.common.ListItem",
    [dijit.MenuItem],
    {
    
        baseClass: "pentaho-listitem",

		templateString: dojo.cache("pentaho.common", "ListItem.html"),

        selected: false,

		_setSelected: function(selected){
            if(!this.disabled) { 
                dojo.toggleClass(this.domNode, "pentaho-listitem-selected", selected);
                dojo.removeClass(this.domNode,'pentaho-listitem-hover');
                this.selected = selected;
            }
        },

		setDisabled: function(/*Boolean*/ disabled){
			this.set('disabled', disabled);
			dojo.toggleClass(this.domNode, "pentaho-listitem-disabled", disabled);
		},
        
		_setDisabledAttr: function(/*Boolean*/ value){
			// summary:
			//		Hook for attr('disabled', ...) to work.
			//		Enable or disable this menu item.

			dijit.setWaiState(this.focusNode, 'disabled', value ? 'true' : 'false');
			this._set("disabled", value);
			dojo.toggleClass(this.domNode, "pentaho-listitem-disabled", value);
		},

		_onHover: function(){
            if(!this.disabled && !this.selected) {
                dojo.addClass(this.domNode,'pentaho-listitem-hover');
            }
            else if(this.selected) {
                dojo.addClass(this.domNode, "pentaho-listitem-selected");
            }
        },
                    
		_onUnhover: function(){
            dojo.removeClass(this.domNode,'pentaho-listitem-hover');
		}
                    
	}
);

