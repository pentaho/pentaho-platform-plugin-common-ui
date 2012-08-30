dojo.provide("pentaho.common.MenuItem");
dojo.require("dijit.MenuItem");

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
			dijit.setWaiState(this.focusNode, 'disabled', value ? 'true' : 'false');
			this._set("disabled", value);
			dojo.toggleClass(this.domNode, "pentaho-menuitem-disabled", value);
		},
        
		_onHover: function(){
			this.getParent().onItemHover(this);
            if(!this.disabled) { 
                dojo.addClass(this.domNode, "pentaho-menuitem-hover");
            }
        },

		_onUnhover: function(){
			this.getParent().onItemUnhover(this);
			this._set("hovering", false);
            if(!this.disabled) { 
                dojo.removeClass(this.domNode, "pentaho-menuitem-hover");
            }
		}        
        
	}
);

