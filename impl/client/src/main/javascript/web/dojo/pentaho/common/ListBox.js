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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/query", "pentaho/common/Menu",
  "pentaho/common/ListItem",
  "pentaho/common/MenuSeparator",
  "pentaho/common/Select", "dojo/text!pentaho/common/ListBox.html", "dojo/dom-class",
"dojo/_base/array", "dojo/_base/lang"],
    function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, Menu, ListItem, MenuSeparator, Select, templateStr, domClass,
             array, lang, Stateful){
      return declare("pentaho.common.ListBox", [Select, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: templateStr,

    width: "150px",
    
    height: "75px",
    
    selectedIndex: -1,

    onchange: null,

    ignoreChange: false,
    
    loadChildrenOnOpen: true,

	postCreate: function(){
		this.inherited(arguments);
        this.loadDropDown(function(){});
        domClass.remove(this.outerNode,"dijitSelect");
        domClass.remove(this.menuNode.domNode,"pentaho-listbox");
        domClass.remove(this.menuNode.domNode,"pentaho-menu-outer");
        this.dropDown._onBlur = function() {
            // noop to prevent deselection of menu items in our list box
        };
	},

	_fillContent: function(){
		this.inherited(arguments);
        this.value = {};
	},

	_addOptionItem: function(/*dijit.form.__SelectOption*/ option){
		// summary:
		//		For the given option, add an option to our dropdown.
		//		If the option doesn't have a value, then a separator is added
		//		in that place.
		if(this.menuNode){
			this.menuNode.addChild(this._getMenuItemForOption(option));
		}
	},

	_loadChildren: function(/*Boolean*/ loadMenuItems){
        this.ignoreChange = true;
		this.inherited(arguments);
    },

    addOption: function(htmlOption) {
      this._addOptionItem(htmlOption);
    },

    setOptions: function(htmlOptions) {
        this.clearOptions();
        for(var idx=0; idx<htmlOptions.length; idx++) {
            this.addOption(htmlOptions[idx]);
        }
    },

    clearOptions: function() {
      array.forEach(this.menuNode.getChildren(), function(child){
			  child.destroyRecursive();
		  });
    },

    _getMenuItemForOption: function(/*dijit.form.__SelectOption*/ option){
        // summary:
        //		For the given option, return the menu item that should be
        //		used to display it.  This can be overridden as needed
        if(!option.value && !option.label){
            // We are a separator (no label set for it)
            return new MenuSeparator();
        }else{
            // Just a regular menu option
            var setSelected = lang.hitch(this, "_setValueAttr", option);
            var item = new ListItem({
                option: option,
                label: option.text || option.value,
                value: option.value ,
                onMouseDown: setSelected,
                onKeyUp: setSelected,
                disabled: option.disabled || false
            });
            item.focusNode.setAttribute("role", "listitem");
            return item;
        }
    },

    set: function( property, value ) {
        if(property == 'value') {
            // cancel the callback
            this.ignoreChange = true;
        }
		this.inherited(arguments);
    },

	_getValueAttr: function(){
        this.inherited(arguments);
        if(this.value) {
            return this.value.value;
        } else {
            return null;
        }
    },

    _setValueAttr: function(value) {
        // set the selection style on the right item
        var valueStr = value.value ? value.value : value;
        var items = this.menuNode.getChildren();
        var oldIndex = this.selectedIndex;
        this.selectedIndex = -1;
        for(var idx=0; idx<items.length; idx++) {
            var item = items[idx];
            if(item.value == valueStr) {
                item.set('selected',true);
                item._setSelected(true);
                if(!this.multiple) {
                    this.selectedIndex = idx;
                    this.value = item;
                }
            } 
            else if(!this.multiple) {
                item.set('selected',false);
                item._setSelected(false);
            }
        };
        if(this.selectedIndex != oldIndex && !this.ignoreChange) {
            if(this.onChange) {
                this.onChange();
            }
        }
        this.ignoreChange = false;
    },

	_updateSelection: function(){
        this.inherited(arguments);

		var val = this.value;
		if(! val instanceof Array){
			val = [val];
		}
		if(val && val[0]){
			array.forEach(this._getChildren(), function(child){
				var isSelected = array.some(val, function(v){
					return child.option && (v === child.option.value);
				});
				domClass.remove(child.domNode, this.baseClass + "SelectedOption");
				domClass.add(child.domNode, "pentaho-listitem-selected");
			}, this);
		}
	}
    
});
});