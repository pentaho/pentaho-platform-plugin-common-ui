dojo.provide("pentaho.common.MenuItem");

dojo.declare(
    "pentaho.common.MenuItem",
    [dijit.MenuItem],
    {
    
        baseClass: "pentaho-menuitem",

		templateString: dojo.cache("pentaho.common", "MenuItem.html"),

		_setSelected: function(selected){
            if(!this.disabled) { 
                dojo.toggleClass(this.domNode, "pentaho-menuitem-hover", selected);
            }
        },

		setDisabled: function(/*Boolean*/ disabled){
			this.set('disabled', disabled);
			dojo.toggleClass(this.domNode, "pentaho-menuitem-disabled", disabled);
		},
        
		_setDisabledAttr: function(/*Boolean*/ value){
			// summary:
			//		Hook for attr('disabled', ...) to work.
			//		Enable or disable this menu item.

			dijit.setWaiState(this.focusNode, 'disabled', value ? 'true' : 'false');
			this._set("disabled", value);
			dojo.toggleClass(this.domNode, "pentaho-menuitem-disabled", value);
		}
                    
// _setStateClass: function(){
        
        
	}
);

dojo.provide("pentaho.common.PopupMenuItem");

dojo.declare(
    "pentaho.common.PopupMenuItem",
    [dijit.PopupMenuItem, pentaho.common.MenuItem],
    {
    
        baseClass: "pentaho-menuitem",

		_setSelected: function(selected){
            if(!this.disabled) { 
                dojo.toggleClass(this.domNode, "pentaho-menuitem-hover", selected);
            }
        }
        
	}
);

dojo.provide("pentaho.common.CheckedMenuItem");

dojo.declare("pentaho.common.CheckedMenuItem",
    dijit.CheckedMenuItem,
    {

		templateString: dojo.cache("pentaho.common", "CheckedMenuItem.html"),

		_setCheckedAttr: function(/*Boolean*/ checked){
			// summary:
			//		Hook so attr('checked', bool) works.
			//		Sets the class and state for the check box.
            if(checked) {
                dojo.addClass(this.iconNode, "pentaho-checkmenuitem-checked"); 
                dojo.removeClass(this.iconNode, "pentaho-checkmenuitem"); 
            } else {
                dojo.removeClass(this.iconNode, "pentaho-checkmenuitem-checked"); 
                dojo.addClass(this.iconNode, "pentaho-checkmenuitem"); 
            }
			dijit.setWaiState(this.domNode, "checked", checked);
			this._set("checked", checked);
		},

		_setSelected: function(selected){
            if(!this.disabled) { 
                dojo.toggleClass(this.domNode, "pentaho-menuitem-hover", selected);
            }
        }

    }
);

dojo.provide("pentaho.common.Menu");

dojo.declare("pentaho.common.Menu",
	dijit.Menu,
	{
        baseClass: "pentaho-menu",

		templateString: dojo.cache("pentaho.common", "Menu.html")
    }
);


dojo.provide("pentaho.common.MenuSeparator");

dojo.declare("pentaho.common.MenuSeparator",
		dijit.MenuSeparator,
		{
		// summary:
		//		A line between two menu items

		templateString: dojo.cache("pentaho.common", "MenuSeparator.html"),

	}
);
