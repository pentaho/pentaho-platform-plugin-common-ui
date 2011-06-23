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
                if (!dojo.hasClass(mover.node, "dojoxHuePickerPoint") && !dojo.hasClass(mover.node, "dojoxColorPickerPoint")) {
                    // Not a dnd move event from the color picker - ignore it
                    return;
                }                
                this.inherited(arguments);
            },

            _clearTimer: function(mover){
                if (!dojo.hasClass(mover.node, "dojoxHuePickerPoint") && !dojo.hasClass(mover.node, "dojoxColorPickerPoint")) {
                    // Not a dnd move event from the color picker - ignore it
                    return;
                }                
                this.inherited(arguments);
            },

        /* we are overriding this because the Dojo 1.6 code does not work in Safari */
		_setPoint: function(/* Event */evt){
			// summary: set our picker point based on relative x/y coordinates
			//  evt.preventDefault();
			var satSelCenterH = this.PICKER_SAT_SELECTOR_H/2;
			var satSelCenterW = this.PICKER_SAT_SELECTOR_W/2;

            var root = dojo.position(this.colorUnderlay, true);
            var newTop = evt.pageY - root.y - satSelCenterH;
            var newLeft = evt.pageX - root.x - satSelCenterW;

			if(evt){ dijit.focus(evt.target); }

			if(this.animatePoint){
				d.fx.slideTo({
					node: this.cursorNode,
					duration: this.slideDuration,
					top: newTop,
					left: newLeft,
					onEnd: d.hitch(this, function() {this._updateColor(true); dijit.focus(this.cursorNode);})
				}).play();
			}else{
				d.style(this.cursorNode, {
					left: newLeft + "px",
					top: newTop + "px"
				});
				this._updateColor(false);
			}
		},
        
        /* we are overriding this because the Dojo 1.6 code does not work in Safari */
		_setHuePoint: function(/* Event */evt){
			// summary: set the hue picker handle on relative y coordinates
			var selCenter = (this.PICKER_HUE_SELECTOR_H/2);
            var root = dojo.position(this.colorUnderlay, true);
            var ypos = evt.pageY - root.y - selCenter;
			if(this.animatePoint){
				d.fx.slideTo({
					node: this.hueCursorNode,
					duration:this.slideDuration,
					top: ypos,
					left: 0,
					onEnd: d.hitch(this, function() {this._updateColor(true); dijit.focus(this.hueCursorNode);})
				}).play();
			}else{
				d.style(this.hueCursorNode, "top", ypos + "px");
				this._updateColor(false);
			}
		}     

	});
})(dojo);
