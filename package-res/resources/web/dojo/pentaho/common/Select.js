dojo.provide("pentaho.common.Select");

dojo.require("dijit.form.Select");
dojo.require("pentaho.common.Menu");
dojo.require("pentaho.common.ListItem");
dojo.require("pentaho.common.MenuSeparator");

dojo.declare("pentaho.common._SelectMenu", pentaho.common.Menu, {
	// summary:
	//		An internally-used menu for dropdown that allows us a vertical scrollbar
	buildRendering: function(){
		// summary:
		//		Stub in our own changes, so that our domNode is not a table
		//		otherwise, we won't respond correctly to heights/overflows
		this.inherited(arguments);
		var o = (this.menuTableNode = this.domNode);
		var n = (this.domNode = dojo.create("div", {style: {overflowX: "hidden", overflowY: "scroll"}}));
		if(o.parentNode){
			o.parentNode.replaceChild(n, o);
		}
		dojo.removeClass(o, "dijitMenuTable");
		n.className = o.className + " dijitSelectMenu";
		n.className = "pentaho-listbox";
		o.className = "dijitReset dijitMenuTable";
		dijit.setWaiRole(o,"listbox");
		dijit.setWaiRole(n,"presentation");
		n.appendChild(o);
	},

	postCreate: function(){
		// summary:
		//              stop mousemove from selecting text on IE to be consistent with other browsers

		this.inherited(arguments);

		this.connect(this.domNode, "onmousemove", dojo.stopEvent);
        
	},

	resize: function(/*Object*/ mb){
		// summary:
		//		Overridden so that we are able to handle resizing our
		//		internal widget.  Note that this is not a "full" resize
		//		implementation - it only works correctly if you pass it a
		//		marginBox.
		//
		// mb: Object
		//		The margin box to set this dropdown to.
		if(mb){
			dojo.marginBox(this.domNode, mb);
			if("w" in mb){
				// We've explicitly set the wrapper <div>'s width, so set <table> width to match.
				// 100% is safer than a pixel value because there may be a scroll bar with
				// browser/OS specific width.
				this.menuTableNode.style.width = "100%";
			}
		}
	}
});


dojo.declare("pentaho.common.Select",
	dijit.form.Select,
	{

        templateString: dojo.cache("pentaho.common", "Select.html"),

        _setDisplay: function(/*String*/ newDisplay){
            // summary:
            //		sets the display for the given value (or values)
            var lbl = newDisplay || this.emptyLabel;
            this.containerNode.innerHTML = '<span class="dijitReset dijitInline label">' + lbl + '</span>';
            dijit.setWaiState(this.focusNode, "valuetext", lbl);
        },
        
        _fillContent: function(){
            // summary:
            //		Set the value to be the first, or the selected index
            this.inherited(arguments);
            // set value from selected option
            if(this.options.length && !this.value && this.srcNodeRef){
                var si = this.srcNodeRef.selectedIndex || 0; // || 0 needed for when srcNodeRef is not a SELECT
                this.value = this.options[si >= 0 ? si : 0].value;
            }
            // Create the dropDown widget
            this.dropDown.destroy();
            this.dropDown = new pentaho.common._SelectMenu({id: this.id + "_menu"});
//            dojo.addClass(this.dropDown.domNode, this.baseClass + "Menu");
            dojo.addClass(this.dropDown.domNode, "pentaho-listbox");
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
                var click = dojo.hitch(this, "_setValueAttr", option);
                var item = new pentaho.common.ListItem({
                    option: option,
                    label: option.label || this.emptyLabel,
                    onClick: click,
                    disabled: option.disabled || false
                });
                dijit.setWaiRole(item.focusNode, "listitem");
                return item;
            }
        }
        
    }
);


