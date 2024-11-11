/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dijit/MenuItem",
  "dojo/text!pentaho/common/ListItem.html", "dojo/dom-class"],
    function(declare, _WidgetBase, _Templated, on, query, MenuItem, templateStr, domClass){
      return declare("pentaho.common.ListItem", [MenuItem],
    {
    
        baseClass: "pentaho-listitem",

		templateString: templateStr,

        selected: false,

		_setSelected: function(selected){
            if(!this.disabled) { 
                domClass.toggle(this.domNode, "pentaho-listitem-selected", selected);
                domClass.remove(this.domNode,'pentaho-listitem-hover');
                this.selected = selected;
            }
        },

		setDisabled: function(/*Boolean*/ disabled){
			this.set('disabled', disabled);
			domClass.toggle(this.domNode, "pentaho-listitem-disabled", disabled);
		},
        
		_setDisabledAttr: function(/*Boolean*/ value){
			// summary:
			//		Hook for attr('disabled', ...) to work.
			//		Enable or disable this menu item.

			this.focusNode.setAttribute("aria-disabled", value ? 'true' : 'false');
			this._set("disabled", value);
			domClass.toggle(this.domNode, "pentaho-listitem-disabled", value);
		},

		_onHover: function(){
            if(!this.disabled && !this.selected) {
                domClass.add(this.domNode,'pentaho-listitem-hover');
            }
            else if(this.selected) {
                domClass.add(this.domNode, "pentaho-listitem-selected");
            }
        },
                    
		_onUnhover: function(){
            domClass.remove(this.domNode,'pentaho-listitem-hover');
		}
                    
	});
});
