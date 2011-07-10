dojo.provide("pentaho.common.CheckedMenuItem");

dojo.declare("pentaho.common.CheckedMenuItem",
    dijit.CheckedMenuItem,
    {

		templateString: dojo.cache("pentaho.common", "CheckedMenuItem.html"),

		_setCheckedAttr: function(/*Boolean*/ checked){
			// summary:
			//		Hook so attr('checked', bool) works.
			//		Sets the class and state for the check box.
            dojo.toggleClass(this.iconNode, "menuitem-checked", checked); 
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