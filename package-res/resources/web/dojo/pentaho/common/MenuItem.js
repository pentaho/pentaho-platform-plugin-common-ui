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

