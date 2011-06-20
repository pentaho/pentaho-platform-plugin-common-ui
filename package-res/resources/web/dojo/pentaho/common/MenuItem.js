dojo.provide("pentaho.common.MenuItem");

dojo.declare(
    "pentaho.common.MenuItem",
    [dijit.MenuItem],
    {
    
        baseClass: "pentaho-menuitem",

		_setSelected: function(selected){
			// summary:
			//		Indicate that this node is the currently selected one
			// tags:
			//		private

			dojo.toggleClass(this.domNode, "pentaho-menuitem-hover", selected);
		}
        
	}
);

dojo.provide("pentaho.common.PopupMenuItem");

dojo.declare(
    "pentaho.common.PopupMenuItem",
    [dijit.PopupMenuItem],
    {
    
        baseClass: "pentaho-menuitem",

		_setSelected: function(selected){
			// summary:
			//		Indicate that this node is the currently selected one
			// tags:
			//		private

			dojo.toggleClass(this.domNode, "pentaho-menuitem-hover", selected);
		}
        
	}
);

dojo.provide("pentaho.common.CheckedMenuItem");

dojo.declare("pentaho.common.CheckedMenuItem",
    dijit.CheckedMenuItem,
    {
		_setCheckedAttr: function(/*Boolean*/ checked){
			// summary:
			//		Hook so attr('checked', bool) works.
			//		Sets the class and state for the check box.
			dojo.toggleClass(this.domNode, "pentaho-menuitem-checked", checked);
			dijit.setWaiState(this.domNode, "checked", checked);
			this._set("checked", checked);
		}

    }
);

dojo.provide("pentaho.common.Menu");

dojo.declare("pentaho.common.Menu",
	dijit.Menu,
	{
        baseClass: "pentaho-menu"
    }
);
