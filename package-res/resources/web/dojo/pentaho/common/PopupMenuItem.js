dojo.provide("pentaho.common.PopupMenuItem");

dojo.require("pentaho.common.MenuItem");

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
