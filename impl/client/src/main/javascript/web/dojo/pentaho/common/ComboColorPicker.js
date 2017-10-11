/*!
* Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",'pentaho/common/button','pentaho/common/Dialog',
        "pentaho/common/CustomColorPicker",
        "pentaho/common/TabSet", "dojo/dom-style", "dojo/on", "dojo/_base/lang", "dojo/dom-class", 'dojo/text!pentaho/common/ComboColorPicker.html'],
  function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Button, Dialog, CustomColorPicker, TabSet, style, on, lang, domClass, templateStr){
    return declare("pentaho.common.ComboColorPicker",[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

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
                      afterCallback: lang.hitch(this, 'showTab', 'palettetab')
                  },
                  {
                      id: 'customtab',
                      title: this.getLocaleString("Custom_txt"),
                      afterCallback: lang.hitch(this, 'showTab', 'customtab')
                  }
              ]);
          },

          showTab: function(id) {
              if(id=='palettetab') {
                  domClass.add(this.customtab, 'hidden');
                  domClass.remove(this.palettetab, 'hidden');
              } else {
                  domClass.add(this.palettetab, 'hidden');
                  domClass.remove(this.customtab, 'hidden');
              }
          },

          show: function() {
              domClass.remove(this.topframe, 'hidden');
          },

          hide: function() {
              domClass.add(this.topframe, 'hidden');
          },

          templateString: templateStr,

          usedColors: [],

          setColor: function(color) {
              this._setColor(color);
          },

          _setColor: function(color) {
              style.set(this.currentColor, 'backgroundColor', color);
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
              style.set(dis.currentColor, 'backgroundColor', color);
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
                  style.set(div, 'backgroundColor', ''+color);
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
                  div.setAttribute("id", id);

                  div.setAttribute("color", ''+color);
                  on(cell, 'onclick', this, 'usedColorClick');
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
              on(this.palette, "change", lang.hitch(this, '_colorChange' ));
              on(this.colorPicker, "change", lang.hitch(this, '_colorChange' ));
              on(this.closeBtn, "click", lang.hitch(this, 'closeRequest' ));
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
  }
);
