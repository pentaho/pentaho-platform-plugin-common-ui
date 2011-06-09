dojo.provide("pentaho.common.CustomColorPicker");
dojo.require("dijit.form._FormWidget");
dojo.require("dojo.dnd.move");
dojo.require("dojo.fx");
dojo.require("dojox.color");
dojo.require("dojo.i18n");

(function(d){
	
	dojo.declare("pentaho.common.CustomColorPicker",
		dojox.widget.ColorPicker,
		{
        
            showPreview: true,
            
            templateString: dojo.cache("pentaho.common","CustomColorPicker/CustomColorPicker.html"),

		postCreate: function(){
			this.inherited(arguments);
			if(!this.showPreview){ this.previewNode.style.visibility = "hidden"; }
			if(!this.showHsv){ dojo.style( this.hsvRow, 'display', "none"); }
            if(!this.showPreview && !this.webSafe) {
                if(!this.showPreview){ dojo.style( this.previewNodes, 'display', "none"); }
            }
		},
            
            _setTimer: function(mover){
                if (!dojo.hasClass(mover.node, "dojoxHuePickerPoint")) {
                    // Not a dnd move event from the color picker - ignore it
                    return;
                }                
                this.inherited(arguments);
            },

            _clearTimer: function(mover){
                if (!dojo.hasClass(mover.node, "dojoxHuePickerPoint")) {
                    // Not a dnd move event from the color picker - ignore it
                    return;
                }                
                this.inherited(arguments);
            }

	});
})(dojo);
