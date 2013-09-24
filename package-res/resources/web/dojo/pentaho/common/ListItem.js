dojo.provide("pentaho.common.ListItem");

dojo.declare(
    "pentaho.common.ListItem",
    [dijit.MenuItem],
    {
    
        baseClass: "pentaho-listitem",

		templateString: dojo.cache("pentaho.common", "ListItem.html"),

        selected: false,

		_setSelected: function(selected){
            if(!this.disabled) { 
                dojo.toggleClass(this.domNode, "pentaho-listitem-selected", selected);
                dojo.removeClass(this.domNode,'pentaho-listitem-hover');
                this.selected = selected;
            }
        },

		setDisabled: function(/*Boolean*/ disabled){
			this.set('disabled', disabled);
			dojo.toggleClass(this.domNode, "pentaho-listitem-disabled", disabled);
		},
        
		_setDisabledAttr: function(/*Boolean*/ value){
			// summary:
			//		Hook for attr('disabled', ...) to work.
			//		Enable or disable this menu item.

			dijit.setWaiState(this.focusNode, 'disabled', value ? 'true' : 'false');
			this._set("disabled", value);
			dojo.toggleClass(this.domNode, "pentaho-listitem-disabled", value);
		},

		_onHover: function(){
            if(!this.disabled && !this.selected) {
                dojo.addClass(this.domNode,'pentaho-listitem-hover');
            }
            else if(this.selected) {
                dojo.addClass(this.domNode, "pentaho-listitem-selected");
            }
        },
                    
		_onUnhover: function(){
            dojo.removeClass(this.domNode,'pentaho-listitem-hover');
		}
                    
	}
);

