dojo.provide("pentaho.common.DisclosurePanel");

dojo.require("dijit.TitlePane");

dojo.declare("pentaho.common.DisclosurePanel",
	dijit.TitlePane,
	{
        templateString: dojo.cache("pentaho.common", "DisclosurePanel.html"),

        baseClass: "",
        
        duration: 0,
        
        _setCss: function(){
        },

        postCreate: function(){
            this.toggleable = false;
            this.inherited(arguments);
            this.toggleable = true;
        },

        _setOpenAttr: function(/*Boolean*/ open, /*Boolean*/ animate){

            this.hideNode.style.display = open ? "" : "none";
            this.arrowNode.className = open ? "pentaho-disclosure-panel-openicon" : "pentaho-disclosure-panel-closeicon";
            this._set("open", open);
            
        }
    
    }
);

