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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/query", "dijit/form/Select"
  , "pentaho/common/Menu"
  , "pentaho/common/ListItem"
  , "pentaho/common/MenuSeparator", "dojo/dom-class", "dojo/dom-geometry", "dojo/text!pentaho/common/Select.html",
  "dojo/_base/lang", "dojo/dom-construct", "dojo/_base/event"],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, Select, Menu, ListItem, MenuSeparator, domClass, geometry, templateStr, lang, construct, event) {
      var _SelectMenu = declare("pentaho.common.Select",[Menu, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //		An internally-used menu for dropdown that allows us a vertical scrollbar
        buildRendering: function () {
          // summary:
          //		Stub in our own changes, so that our domNode is not a table
          //		otherwise, we won't respond correctly to heights/overflows
          this.inherited(arguments);
          var o = (this.menuTableNode = this.domNode);
          var n = (this.domNode = construct.create("div", {style: {overflowX: "hidden", overflowY: "scroll"}}));
          if (o.parentNode) {
            o.parentNode.replaceChild(n, o);
          }
          domClass.remove(o, "dijitMenuTable");
          n.className = o.className + " dijitSelectMenu";
          n.className = "pentaho-listbox";
          o.className = "dijitReset dijitMenuTable";
          o.setAttribute("role", "listbox");
          n.setAttribute("role", "presentation");
          n.appendChild(o);
        },

        postCreate: function () {
          // summary:
          //              stop mousemove from selecting text on IE to be consistent with other browsers

          this.inherited(arguments);

          this.own(on(this.domNode, "mousemove", event.stop));

        },

        resize: function (/*Object*/ mb) {
          // summary:
          //		Overridden so that we are able to handle resizing our
          //		internal widget.  Note that this is not a "full" resize
          //		implementation - it only works correctly if you pass it a
          //		marginBox.
          //
          // mb: Object
          //		The margin box to set this dropdown to.
          if (mb) {
            geometry.setMarginBox(this.domNode, mb);
            if ("w" in mb) {
              // We've explicitly set the wrapper <div>'s width, so set <table> width to match.
              // 100% is safer than a pixel value because there may be a scroll bar with
              // browser/OS specific width.
              this.menuTableNode.style.width = "100%";
            }
          }
        }
      });


      return declare([dijit.form.Select],
          {

            templateString: templateStr,

            _setDisplay: function (/*String*/ newDisplay) {
              // summary:
              //		sets the display for the given value (or values)
              var lbl = newDisplay || this.emptyLabel;
              this.containerNode.innerHTML = '<span class="dijitReset dijitInline label">' + lbl + '</span>';
              this.focusNode.setAttribute("aria-valuetext", lbl);
            },

            _fillContent: function () {
              // summary:
              //		Set the value to be the first, or the selected index
              this.inherited(arguments);
              // set value from selected option
              if (this.options.length && !this.value && this.srcNodeRef) {
                var si = this.srcNodeRef.selectedIndex || 0; // || 0 needed for when srcNodeRef is not a SELECT
                this.value = this.options[si >= 0 ? si : 0].value;
              }
              // Create the dropDown widget
              this.dropDown.destroy();
              this.dropDown = new _SelectMenu({id: this.id + "_menu"});
//            domClass.add(this.dropDown.domNode, this.baseClass + "Menu");
              domClass.add(this.dropDown.domNode, "pentaho-listbox");
            },

            _getMenuItemForOption: function (/*dijit.form.__SelectOption*/ option) {
              // summary:
              //		For the given option, return the menu item that should be
              //		used to display it.  This can be overridden as needed
              if (!option.value && !option.label) {
                // We are a separator (no label set for it)
                return new pentaho.common.MenuSeparator();
              } else {
                // Just a regular menu option
                var click = lang.hitch(this, "_setValueAttr", option);
                var item = new ListItem({
                  option: option,
                  label: option.label || this.emptyLabel,
                  onClick: click,
                  disabled: option.disabled || false
                });
                item.focusNode.setAttribute("role", "listitem");
                return item;
              }
            }

          }
      );
    });
