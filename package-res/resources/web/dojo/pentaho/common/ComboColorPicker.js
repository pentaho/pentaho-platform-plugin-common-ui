dojo.provide('pentaho.common.ComboColorPicker');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('pentaho.common.button');
dojo.require('pentaho.common.Dialog');
dojo.require("pentaho.common.CustomColorPicker");
dojo.require("pentaho.common.TabSet");

dojo.declare(
     'pentaho.common.ComboColorPicker',
     [dijit._Widget, dijit._Templated],
     {
          
        widgetsInTemplate: true,

        hasTitleBar: false,
     
        onColorChange: null,
     
        closeCallback: null,
     
        setLocalizationLookupFunction: function(f) {
            this.getLocaleString = f;
            this._localize();
        },

        _localize: function() {
            this.inherited(arguments);
            this.currentLbl.innerHTML =  this.getLocaleString("currentColor_content");
            this.inUseLbl.innerHTML =  this.getLocaleString("inUseColors_content");
            this.tabset.setTabs([
                {
                    id: 'palettetab',
                    title: this.getLocaleString("Palette_txt"),
                    afterCallback: dojo.hitch(this, 'showTab', 'palettetab')
                },
                {
                    id: 'customtab',
                    title: this.getLocaleString("Custom_txt"),
                    afterCallback: dojo.hitch(this, 'showTab', 'customtab')
                }
            ]);
        },

        showTab: function(id) {
            if(id=='palettetab') {
                dojo.addClass(this.customtab, 'hidden');
                dojo.removeClass(this.palettetab, 'hidden');
            } else {
                dojo.addClass(this.palettetab, 'hidden');
                dojo.removeClass(this.customtab, 'hidden');
            }
        },

        show: function() {
            dojo.removeClass(this.topframe, 'hidden');            
        },

        hide: function() {
            dojo.addClass(this.topframe, 'hidden');            
        },

        templatePath: dojo.moduleUrl('pentaho.common', 'ComboColorPicker.html'),
        
        usedColors: [],
        
        setColor: function(color) {
            this._setColor(color);
        },
            
        _setColor: function(color) {
            dojo.style(this.currentColor, 'backgroundColor', color);
            // see if this color is in the palette
            this.palette._setValueAttr(color, false);
            this.colorPicker.setColor(color,false);
        },

        _colorChange: function(color) {
            this._setColor(color);
            if(this.onColorChange) {
                this.onColorChange(color);
            }
        },
            
        colorPaletteChange: function(color) {
            this.colorPicker.setColor(color,false);
            dojo.style(dis.currentColor, 'backgroundColor', color);
        },
        
        setUsedColors: function(colors) {
            this.usedColors = colors;
            var table = this.colorTable;
            while(table.rows.length>0) {
                table.deleteRow(0); 
            }
            // add the used colors
            var row = null;
            for(var idx=0; idx<colors.length; idx++) {
                var color = colors[idx];
                if(row == null) {
                    row = table.insertRow(-1);
                }
                var cell = row.insertCell(-1);
                var div = document.createElement("DIV");
                div.className = 'usedColorTableDiv';
                cell.className = 'usedColorTableCell';
                dojo.style(div, 'backgroundColor', ''+color);
                var id = 'usedcolor'+idx;
                if(color.indexOf('rgb') == 0) {
                    color = eval('this.'+color);
                }
                if(color[0] != '#') {
                    var array = dojo.Color.named[color];
                    if(array) {
                        color = dojox.color.fromArray(array).toHex();
                    }
                }
                dojo.attr(div, "id", id);
                dojo.attr(div, "color", ''+color);
                dojo.connect(cell, 'onclick', this, 'usedColorClick');
                cell.appendChild(div);
                
                if((idx % 10) == 9) {
                    // force a new row
                    row = null;
                }
            }
        },
        
        usedColorClick: function(event) {
            var idx = parseInt(event.target.id.substr('usedcolor'.length));
            this._colorChange(this.usedColors[idx], false);
        },
        
        closeRequest: function() {
            if(this.closeCallback) {
                this.closeCallback()
            }
        },
        
       postCreate: function() {
            this.inherited(arguments);
            this.colorPicker.animatePoint = false;
            pentaho.common.Messages.addUrlBundle('pentaho.common',CONTEXT_PATH+'i18n?plugin=common-ui&name=resources/web/dojo/pentaho/common/nls/messages');
            dojo.connect(this.palette, "onChange", this, '_colorChange' );    
            dojo.connect(this.colorPicker, "onChange", this, '_colorChange' );
            dojo.connect(this.closeBtn, "onclick", this, 'closeRequest' );
       },
       
        rgb: function(r,g,b) {

            var hex = '#';
            var c1 = r.toString(16);
            var c2 = g.toString(16);
            var c3 = b.toString(16);
            hex += c1.length<2 ? '0'+c1 : c1;
            hex += c2.length<2 ? '0'+c2 : c2;
            hex += c3.length<2 ? '0'+c3 : c3;
            return hex;
        },

        rgba: function(r,g,b,a) {

            var hex = '#';
            var c1 = r.toString(16);
            var c2 = g.toString(16);
            var c3 = b.toString(16);
            hex += c1.length<2 ? '0'+c1 : c1;
            hex += c2.length<2 ? '0'+c2 : c2;
            hex += c3.length<2 ? '0'+c3 : c3;
            return hex;
        }
            
    }
);

            