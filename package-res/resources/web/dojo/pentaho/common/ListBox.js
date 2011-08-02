dojo.provide("pentaho.common.ListBox");

dojo.require("pentaho.common.Menu");
dojo.require("pentaho.common.ListItem");
dojo.require("pentaho.common.MenuSeparator");
dojo.require("pentaho.common.Select");

dojo.declare("pentaho.common.ListBox", 
    pentaho.common.Select, {

    templateString: dojo.cache("pentaho.common", "ListBox.html"),

    widgetsInTemplate: true,
    
    width: "150px",
    
    height: "75px",
    
    selectedIndex: -1,

    onchange: null,

    ignoreChange: false,
    
    loadChildrenOnOpen: true,

	postCreate: function(){
		this.inherited(arguments);
        this.loadDropDown(function(){});
        dojo.removeClass(this.outerNode,"dijitSelect");
        dojo.removeClass(this.menuNode.domNode,"pentaho-listbox");
        dojo.removeClass(this.menuNode.domNode,"pentaho-menu-outer");
        this.menuNode._onBlur = function() {
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
		dojo.forEach(this.menuNode.getChildren(), function(child){
			child.destroyRecursive();
		});
    },
    
    _getMenuItemForOption: function(/*dijit.form.__SelectOption*/ option){
        // summary:
        //		For the given option, return the menu item that should be
        //		used to display it.  This can be overridden as needed
        if(!option.value && !option.label){
            // We are a separator (no label set for it)
            return new pentaho.common.MenuSeparator();
        }else{
            // Just a regular menu option
            var setSelected = dojo.hitch(this, "_setValueAttr", option);
            var item = new pentaho.common.ListItem({
                option: option,
                label: option.text || option.value,
                value: option.value ,
                onMouseDown: setSelected,
                onKeyUp: setSelected,
                disabled: option.disabled || false
            });
            dijit.setWaiRole(item.focusNode, "listitem");
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
		if(!dojo.isArray(val)){
			val = [val];
		}
		if(val && val[0]){
			dojo.forEach(this._getChildren(), function(child){
				var isSelected = dojo.some(val, function(v){
					return child.option && (v === child.option.value);
				});
				dojo.removeClass(child.domNode, this.baseClass + "SelectedOption");
				dojo.addClass(child.domNode, "pentaho-listitem-selected");
			}, this);
		}
	}
    
});