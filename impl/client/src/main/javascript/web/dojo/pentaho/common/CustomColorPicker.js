/*!
* Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

define(["dojo/_base/declare", "dojo/_base/lang", "dijit/form/_FormWidget", "dojox/widget/ColorPicker", "dojo/text!pentaho/common/CustomColorPicker/CustomColorPicker.html",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/dom-geometry",
        "dojo/dom-style",
        "dojo/fx",
        "dijit/focus",
        "dojo/dnd/move",
        "dojo/fx",
        "dojox/color",
        "dojo/i18n",
  "dijit/ColorPalette"],
  function(declare, lang, _FormWidget, ColorPicker, templateStr, domClass, style, geometry, domStyle, baseFx, focus){
    return declare("pentaho.common.CustomColorPicker",[ColorPicker],
		{

            showPreview: true,

            templateString: templateStr,

		postCreate: function(){
			this.inherited(arguments);
			if(!this.showPreview){ this.previewNode.style.visibility = "hidden"; }
			if(!this.showHsv){ style.set( this.hsvRow, 'display', "none"); }
            if(!this.showPreview && !this.webSafe) {
                if(!this.showPreview){ domStyle.set( this.previewNodes, 'display', "none"); }
            }
		},

            _setTimer: function(mover){
                if (!domClass.contains(mover.node, "dojoxHuePickerPoint") && !domClass.contains(mover.node, "dojoxColorPickerPoint")) {
                    // Not a dnd move event from the color picker - ignore it
                    return;
                }
                this.inherited(arguments);
            },

            _clearTimer: function(mover){
                if (!domClass.contains(mover.node, "dojoxHuePickerPoint") && !domClass.contains(mover.node, "dojoxColorPickerPoint")) {
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

            var root = geometry.position(this.colorUnderlay, true);
            var newTop = evt.pageY - root.y - satSelCenterH;
            var newLeft = evt.pageX - root.x - satSelCenterW;

			if(evt){ focus.focus(evt.target); }

			if(this.animatePoint){
				fx.slideTo({
					node: this.cursorNode,
					duration: this.slideDuration,
					top: newTop,
					left: newLeft,
					onEnd: d.hitch(this, function() {this._updateColor(true); focus.focus(this.cursorNode);})
				}).play();
			}else{
				domStyle.set(this.cursorNode, {
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
            var root = geometry.position(this.colorUnderlay, true);
            var ypos = evt.pageY - root.y - selCenter;
			if(this.animatePoint){
				baseFx.slideTo({
					node: this.hueCursorNode,
					duration:this.slideDuration,
					top: ypos,
					left: 0,
					onEnd: lang.hitch(this, function() {this._updateColor(true); focus.focus(this.hueCursorNode);})
				}).play();
			}else{
				domStyle.set(this.hueCursorNode, "top", ypos + "px");
				this._updateColor(false);
			}
		}

	});
});
