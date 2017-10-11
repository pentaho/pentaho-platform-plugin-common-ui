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

/**
 * Shows a filter indicator over an anchor element to indicator the number of
 * filters currently active.
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dojo/_base/event", "dojo/_base/html", "dojo/dom-style", "dojo/dom-class"],
    function (declare, _WidgetBase, _Templated, on, query, event, html, style, domClass) {
      return declare("pentaho.common.FilterIndicator",[_WidgetBase, _Templated],
          {
            templateString: '<div data-dojo-attach-point="containerNode" class="hidden cursorPointer filterToolbarIndicator"></div>',
            backgroundClassPrefix: 'filterIndicatorBackground_',
            backgroundClassOverflow: '9_plus',
            min: 1,
            max: 9,

            currentBackgroundClass: undefined,

            toolbarButton: undefined,
            anchorElement: undefined,

            defaultOffsets: {
              top: 0,
              left: 0,
              bottom: 0,
              right: 0
            },

            offsets: this.defaultOffsets,

            /**
             * @param toolbarButton Toolbar button for Filters so we can fake mouse interaction for it when we're interacted with
             * @param offsets
             *          {@see setOffsets()}
             */
            configure: function (toolbarButton, offsets) {
              this.setToolbarButton(toolbarButton);
              this.setAnchorElement(toolbarButton.domNode);
              this.setOffsets(offsets);

              this._connectToToolbarButton();
              this._updatePosition();
            },

            setToolbarButton: function (toolbarButton) {
              this.toolbarButton = toolbarButton;
            },

            /**
             * @param offsets
             *          Offset (padding) to position the indicator relative to the
             *          anchorElement in pixels, e.g. {top: 2, right: 0, bottom: 0,left: 2} (Currently only left and top are used)
             */
            setOffsets: function (offsets) {
              this.offsets = offsets ? offsets : defaultOffsets;
            },

            setAnchorElement: function (e) {
              this.anchorElement = e;
            },

            _connectToToolbarButton: function () {
              on(this.containerNode, 'click', this, function (event) {
                this.toolbarButton._onButtonClick(event);
                event.stop(event);
              });
              on(this.containerNode, 'mouseover', this, function () {
                this.toolbarButton._set("hovering", true);
              });
              on(this.containerNode, 'mouseout', this, function () {
                this.toolbarButton._set("hovering", false);
                this.toolbarButton._set("active", false);
              });
              on(this.containerNode, 'mousedown', this, function () {
                this.toolbarButton._set("hovering", true);
                this.toolbarButton._set("active", true);
              });
              on(this.containerNode, 'mouseup', this, function () {
                this.toolbarButton._set("hovering", true);
                this.toolbarButton._set("active", false);
              });
            },

            /**
             * Update the filter indicator's position relative to the anchor element and
             * offsets.
             */
            _updatePosition: function () {
              if (!this.anchorElement) {
                this.hide();
                return;
              }
              var c = html.coords(this.anchorElement);
              var left = c.x + this.offsets.left;
              var top = c.y + this.offsets.top;
              style.set(this.containerNode, "left", left + "px");
              style.set(this.containerNode, "top", top + "px");
            },

            /**
             * Update the filter indicator to reflect the number of filters provided.
             *
             * @param numFilters
             *          Number of filters currently active.
             */
            update: function (numFilters) {
              if (!numFilters || numFilters < this.min) {
                this.hide();
              } else if (numFilters <= this.max) {
                this.changeBackground(this.backgroundClassPrefix + numFilters);
              } else {
                this.changeBackground(this.backgroundClassPrefix + this.backgroundClassOverflow);
              }
              this._updatePosition();
            },

            show: function () {
              domClass.remove(this.containerNode, "hidden");
            },

            hide: function () {
              domClass.add(this.containerNode, "hidden");
            },

            /**
             * Swap the background CSS class for the container node to the one provided. This will remove the existing background class.
             */
            changeBackground: function (className) {
              if (this.currentBackgroundClass !== className) {
                domClass.add(this.containerNode, className);
                if (this.currentBackgroundClass) {
                  domClass.remove(this.containerNode, this.currentBackgroundClass);
                }
                this.currentBackgroundClass = className;
              }
              this.show();
            }
          });
    });
