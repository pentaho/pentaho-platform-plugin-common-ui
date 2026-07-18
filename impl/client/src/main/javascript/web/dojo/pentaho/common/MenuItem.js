/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/


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

