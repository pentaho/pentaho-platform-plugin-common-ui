/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
 */
define([
  '../data/AbstractTable',
  '../data/Table',
  '../data/TableView',
  './events',
  './color/paletteRegistry',
  './color/utils',
  './type/registry',
  './type/helper',
  './spec/helper',
  '../lang/Base',
  '../util/arg',
  '../util/error',
  '../util/promise'
], function(
      AbstractDataTable, DataTable, DataView, visualEvents, paletteRegistry, colorUtils,
      typeRegistry, typeHelper, specHelper, Base, arg, error, promiseUtil) {

 /**
  * @module pentaho.visual
  */

  return Base.extend("pentaho.visual.Wrapper", {

    /**
     * Manages the display of visualizatons.
     *
     * #### AMD
     *
     * **Module Id**: `"pentaho/visual/Wrapper"`
     *
     * **Module Type**: The {{#crossLink "VisualWrapper"}}{{/crossLink}} constructor function.
     *
     * @class VisualWrapper
     * @constructor
     * @param {HTMLDOMElement} domElem The HTML DOM element that visuals
     *   instantiated by this wrapper should draw inside of.
     *
     *   All of its child nodes will be cleared.
     *   Becomes the value of property {{#crossLink "VisualWrapper/domElement:property"}}{{/crossLink}}.
     *
     *   The dimensions of this element are used to set the visual's
     *   width and height, as given by the element's `offsetWidth` and `offsetHeight`, respectively.
     *
     * @param {string} [containerTypeId] The id of the container type that is displaying visuals.
     *
     *   Specifying this causes configured and filtered visual types
     *   to be obtained from the {{#crossLink "VisualTypeRegistry"}}{{/crossLink}},
     *   specifically for the given container type.
     *   Becomes the value of property {{#crossLink "VisualWrapper/containerTypeId:property"}}{{/crossLink}}.
     */
    constructor: function(domElem, containerTypeId) {
      if(!domElem) throw error.argRequired("domElem");

      // > 0 when during an async operation.
      this._asyncLock = 0;

      /**
       * Gets the id of the container type that created this wrapper
       * and will be displaying visuals.
       *
       * Set at construction time, through the argument `containerTypeId`.
       *
       * @property containerTypeId
       * @type string
       * @optional
       * @default null
       * @readonly
       */
      this.containerTypeId = (containerTypeId != null && String(containerTypeId)) || null;

      // this.domElement <-
      this._setDomElem(domElem);

      // --------

      this._visualSpec = null;
      this._visualType = null;
      this._drawSpec   = null; // last .draw(, drawSpec) argument
      this._visual     = null;

      this._lastAction  = null;
      this._actionCount = 0;

      // --------

      this._dataTable = null;

      this._highlights = [];
    },

    // ------
    // PROPS

    /**
     * Gets or sets the data to display.
     *
     * Data must be set before a visual can be displayed.
     *
     * To update the visualization display,
     * call {{#crossLink "VisualWrapper/update:method"}}{{/crossLink}}.
     *
     * @property data
     * @type DataTable
     */
    get data() {
      return this._dataTable;
    },

    set data(value) {
      if(!value) throw error.argRequired("data");

      if(this._dataTable !== value) {
        if(!(value instanceof AbstractDataTable))
          value = new DataTable(value);

        this._dataTable = value;

        this._setAction("setData");
      }
    },

    /**
     * Gets or sets the current highlights.
     *
     * When set to _nully_, all highlights are cleared.
     *
     * When the visual specification is defined, its highlights are updated.
     *
     * To update the visualization display,
     * call {{#crossLink "VisualWrapper/update:method"}}{{/crossLink}}.
     *
     * Do **not** directly modify the returned array or its contents.
     *
     * @property highlights
     *
     * @type ISelection[]
     */
    get highlights() {
      return this._highlights;
    },

    set highlights(highlights) {
      if(!highlights) {
        if(!this._highlights.length) return;

        this._highlights.length = 0;
      } else {
        // TODO: do deep equality test on set highlights ?
        this._highlights = highlights;
      }

      if(this._visualSpec) this._visualSpec.highlights = this._highlights;

      this._setAction("setHighlights");
    },

    /**
     * Gets or sets a visual specification.
     *
     * When set to _nully_, the current visual display will be cleared, if updated.
     *
     * An error is thrown if the type of the specified visual is not defined or
     * is disabled for the wrapper's container type,
     * {{#crossLink "VisualWrapper/containerTypeId:property"}}{{/crossLink}}.
     *
     * To update the visualization display,
     * call {{#crossLink "VisualWrapper/update:method"}}{{/crossLink}}.
     *
     * @property visualSpec
     *
     * @type spec.IVisual
     */
    get visualSpec() {
      return this._visualSpec;
    },

    set visualSpec(visualSpec) {
      var prevVisualSpec = this._visualSpec;
      if(prevVisualSpec) {
        // Clear, even when the same object.
        // spec.type may have been mutated.
        this._visualSpec = this._drawSpec = null;

        if(!visualSpec || this._visualType.id !== visualSpec.type) {
          // Clear visual and visualType.
          // NOTE: resets _lastAction and _actionCount!
          this._disposeVisual();
          this._visualType = null;
        }
        // else
        // Same visual type. Keep the Visual and update it with new spec.

        // Also, keep existing highlights, whether or not the visual type has changed,
        // unless present in the new visualSpec.
      }

      if(visualSpec) {
        // We don't check if any property actually changed its value.
        // A deep equality test would need to be performed, and, for that,
        // a deep-clone would need to be kept, and, still,
        // would remain vulnerable to problems with custom class objects.
        this._setAction("setProps");

        // Registers "setHighlights" if highlights change,
        // causing the `visualSpec` set operation to cause a future full draw.
        var specHighlights = visualSpec.highlights;
        if(specHighlights) this.highlights = specHighlights;

        this._visualSpec = visualSpec;

        if(!this._visualType)
          this._visualType = typeRegistry.get(visualSpec.type, this.containerTypeId, /*assert:*/true);
      }
    },

    /**
     * Gets the current visual type.
     *
     * If {{#crossLink "VisualWrapper/containerTypeId:property"}}{{/crossLink}}
     * is defined, the visual type will be configured for that container type.
     *
     * Only defined when {{#crossLink "VisualWrapper/visualSpec:property"}}{{/crossLink}}
     * has a _non-nully_ value.
     *
     * @property visualType
     * @type IVisualType
     * @readonly
     */
    get visualType() {
      return this._visualType;
    },

    /**
     * Gets the current visual.
     *
     * Only available after a call to {{#crossLink "VisualWrapper/update:method"}}{{/crossLink}}.
     *
     * @property visual
     * @type IVisual
     * @readonly
     */
    get visual() {
      return this._visual;
    },

    // -----
    // OPERS

    // TODO: document when highlights/events are refactored.
    on: function(name, handler) {
      visualEvents.addListener(this, name, handler);
    },

    off: function(name) {
      visualEvents.removeListener(this, name);
    },

    /**
     * Displays a visual.
     *
     * When a visual specification is not defined,
     * the current visual display is cleared and the returned promise is immediately resolved.
     *
     * If any of the visual specification properties
     * {{#crossLink "IVisual/width:property"}}{{/crossLink}} and
     * {{#crossLink "IVisual/height:property"}}{{/crossLink}} is unspecified, or is _nully_,
     * it takes the value of the current corresponding dimension
     * of {{#crossLink "VisualWrapper/domElement:property"}}{{/crossLink}}.
     * Otherwise, when specified, it is the corresponding element's dimension
     * that is set with that value.
     *
     * The following errors are thrown, synchronously, if:
     *
     * 1. an asynchronous operation is being executed
     * 2. no data has been set.
     *
     * @method update
     *
     * @param {object} [drawOptions] A map of contextual, transient, arbitrary options to pass to the visual.
     *   Its properties are used to set any `undefined` properties of the visual specification.
     *   Its properties are _not_ saved along with the visual specification.
     * @param {string} [drawOptions.action] The action that triggered the update call and
     *   feeds {{#crossLink "spec.IVisualDraw/action:property"}}{{/crossLink}}.
     *
     *   When unspecified and a single operation was performed on the wrapper since
     *   the last update call, the action passed to the _visual_ is
     *   the corresponding standard action (like `"setHighlights"`, `"setData"` or `"setProps"`).
     *
     *   Otherwise, the action passed to the _visual_ will be `null`.
     *
     * @return {Promise} A promise that is resolved when the visual has been displayed.
     */
    update: function(drawOptions) {
      this._checkAsyncState();

      if(!this._visualSpec) {
        // TODO: Clear the display?
        return Promise.resolve(undefined);
      }

      // TODO: Should prevent action from being a standard action?
      if((!drawOptions || !drawOptions.action) &&
         this._drawSpec && this._actionCount === 1) {
        switch(this._lastAction) {
          case "setHighlights":
            if(this._visual.setHighlights) return this._updateHighlights();
            break;
        }
      }

      // Reset so that `visualSpec` mutations pass-through even when
      // the user does not call `this.visualSpec = .` again.
      this._drawSpec = null;

      return this._updateVisual(drawOptions);
    },

    // -----------------

    _processHighlights: function(args) {
      var mode = args.selectionMode || "TOGGLE";

      if(mode === "REPLACE") {
        // Only use the selections from the arguments passed in.
        this.highlights.length = 0;
      }

      // Just assume these changed, for now.
      this._setAction("setHighlights");

      var highlights = this.highlights;
      for (var i = 0; i < args.selections.length; i++) {
        var selectedItem = args.selections[i];

        // [DCL] BUG ALERT: Variable hoisting makes these not be cleared in each iteration in the loop.
        // So the previous iteration's row/col values can get mixed with the current's.

        var colId, colLabel, colItem;
        var rowId, rowLabel, rowItem;

        var value; // [DCL] NOT USED!!

        // [DCL] Depends on a non-empty row item
        if(selectedItem.rowItem) {
          rowItem = selectedItem.rowItem;
          rowId = selectedItem.rowId;
          rowLabel = selectedItem.rowLabel;
        }

        // [DCL] Does not depend on a non-empty col item, but instead depends on any column index??
        if(selectedItem.column || selectedItem.column == 0) {
          colId = selectedItem.columnId;
          colLabel = selectedItem.columnLabel;
          colItem = selectedItem.columnItem;
        }

        // [DCL] Not used
        if((selectedItem.row || selectedItem.row == 0) && selectedItem.column) {
          value = selectedItem.value;
        }
        //  alert(rowItem+','+colLabel+'='+value);

        // see if this is already highlighted
        var removed = false;
        var modified = false;

        if(mode == "TOGGLE") {
          // previous selection should be retained or if re-selected should be toggled
          for( var hNo=0; hNo< highlights.length; hNo++) {
            var highlight = highlights[hNo];
            var highlightRowItem = highlight.rowItem;
            var highlightColItem = highlight.colItem;

            // [DCL] Will throw when highlightRowItem && !rowItem
            var rowItemsSame = highlightRowItem
                && (highlightRowItem == rowItem
                || (highlightRowItem.join && ( highlightRowItem.join('-') == rowItem.join('-') ) ) );

            // [DCL] Will throw when highlightColItem && !colItem
            var colItemsSame = highlightColItem
                && (highlightColItem == colItem
                || (highlightColItem.join && ( highlightColItem.join('-') == colItem.join('-') ) ) );

            if(typeof colItemsSame == 'undefined') {
              colItemsSame = true;
            }

            if(rowItemsSame && colItemsSame) {

                // [DCL] What kind of operation is this?
                // Change from a column to a row selection when a cell of that column is re-selected?
                // What about the converse?
                // Why would we even be looking at rowItemsSame when highlight.type == 'column'?
                if(colId && selectedItem.type == 'cell' &&
                   highlight.colId == colId && highlight.type == 'column') {

                  // switch this
                  highlight.type  = 'row';
                  highlight.id    = selectedItem.rowId;
                  highlight.value = rowItem;
                  modified = true;
                  break;
                }

                // remove this
                highlights.splice( hNo, 1 );
                removed = true;
                break;
            }
          }
        }

        if(!removed && !modified) {
          highlight = { rowItem: rowItem, colId: colId, colLabel: colLabel, colItem: colItem, rowId: rowId, rowLabel: rowLabel };
          highlight.type = selectedItem.type;
          if( selectedItem.type == 'row' ) {
            highlight.id = rowId;
            highlight.value = rowItem;
          }
          else if( selectedItem.type == 'column' ) {
            highlight.type = 'column';
            highlight.id = colId;
            highlight.value = colLabel;
          }
          else if( selectedItem.type == 'cell' ) {
            highlight.type = 'cell';
            highlight.id = colId;
            highlight.value = colLabel;
          }
          highlights.push( highlight );
        }
      }
    },

    // TODO: remove when IVisual#setHighlights is removed.
    _updateHighlights: function() {
      var hs = this._drawSpec.highlights = this.highlights;

      var resultPromise = promiseUtil.wrapCall(this._visual.setHighlights.bind(this._visual, hs))
          .then(drawn.bind(this));

      return this._async().until(resultPromise);

      function drawn() {
        this._setAction(null);
      }
    },

    // -----------------

    /**
     * Resizes the current visual to adapt to the new available size.
     *
     * When a dimension is not specified, its current value is read from the DOM element.
     * Otherwise, the DOM element is resized to the specified value.
     *
     * The object specified in the `drawSpec` argument
     * of the previous {{#crossLink "IVisual/draw:method"}}{{/crossLink}} call
     * is updated with the new/current available size.
     *
     * Calls the visual's {{#crossLink "IVisual/resize:method"}}{{/crossLink}} method,
     * if implemented, or, otherwise,
     * calls the {{#crossLink "IVisual/draw:method"}}{{/crossLink}} method with
     * the __same arguments__ used in the previous call
     * and with a `"resize"` action.
     *
     * The following errors are thrown, synchronously, if:
     *
     * 1. there is no current visual
     * 2. an asynchronous operation is being executed.
     *
     * @method resize
     *
     * @param {number} [width] The new width, in pixels. Defaults to the DOM element's current width.
     * @param {number} [height] The new height, in pixels. Defaults to the DOM element's current height.
     *
     * @return {Promise} A promise that is resolved when the update operation has ended.
     */
    resize: function(width, height) {
      this._checkVisualState();

      // Apply new sizes to domElement and visualElement (or read current ones).
      // and sync with drawSpec.
      var drawSpec = this._drawSpec,
          w = drawSpec.width  = this._resizeDomDim("width",  width ),
          h = drawSpec.height = this._resizeDomDim("height", height);

      this._setAction("resize");

      // Method IVisual#resize is optional.
      // When not implemented, call draw with the same args and a "resize" action.
      if(!this._visual.resize)
        return this._updateVisual();

      var resultPromise = promiseUtil.wrapCall(this._visual.resize.bind(this._visual, w, h))
          .then(drawn.bind(this));

      return this._async().until(resultPromise);

      function drawn() {
        this._setAction(null);
      }
    },

    /**
     * Updates the visual specification with the current state and/or data.
     *
     * The following errors are thrown, synchronously, if:
     *
     * 1. there is no current visual
     * 2. an asynchronous operation is being executed.
     *
     * @method save
     *
     * @param {object} [options] Options.
     * @param {boolean} [options.saveState=true] Indicates if the current visualization
     *    state should be included. Not all visuals support
     *    {{#crossLink "IVisual/getState:method"}}{{/crossLink}}.
     * @param {boolean} [options.saveData=false] Indicates if the current visual
     *    data should be included.
     *
     * @return {spec.IVisual} The current visual specification.
     */
    save: function(options) {
      this._checkVisualState();

      var visualSpec = this._visualSpec;

      if(arg.optional(options, "saveState", true)) {
        // Method IVisual#getState is optional.
        if(this._visual.getState)
          visualSpec.state = this._visual.getState() || null;
      }

      if(arg.optional(options, "saveData", false))
        visualSpec.data = this._dataTable.toJSON();

      return visualSpec;
    },

    // TODO: dispose and async state check??
    /**
     * Disposes the wrapper and the current visual, if any.
     *
     * @method dispose
     */
    dispose: function() {
      visualEvents.removeSource(this);

      this._disposeVisual(/*finalDispose:*/true);

      this.domElement =
      this.visualElement =
      this._visualType =
      this._visualSpec =
      this._drawSpec = null;
    },

    // ------
    // VISUAL

    /***
     * Gets a promise for the visual.
     *
     * If it is not created, it is created.
     *
     * @method _getVisual
     * @private
     *
     * @return {Promise.<IVisual>} A promise for the {{#crossLink "IVisual"}}{{/crossLink}}.
     */
    _getVisual: function() {
      if(this._visual)
        return Promise.resolve(this._visual);

      var createOptions = {
        type:       this._visualType,
        domElement: this.visualElement
      };

      return typeHelper.createInstance(createOptions)
        .then(this._setVisual.bind(this));
    },

    /***
     * Low level method that sets a new visual.
     * Pairs with {{#crossLink "VisualWrapper/_disposeVisual:method"}}{{/crossLink}}.
     *
     * @method _setVisual
     * @private
     * @param {IVisual} visual The new visual.
     */
    _setVisual: function(visual) {
      this._visual = visual;

      visualEvents.addListener(visual, "select",      this._onVisualSelect     .bind(this));
      visualEvents.addListener(visual, "doubleclick", this._onVisualDoubleClick.bind(this));

      return visual;
    },

    /***
     * Calls `draw` on a visual, of the current visual type,
     * and with the current specification and data.
     *
     * If a visual is not yet created, one is created of the type of
     * {{#crossLink "VisualWrapper/visualType:property"}}{{/crossLink}}.
     *
     * An error is thrown, synchronously, if no data has been set.
     *
     * @method _updateVisual
     * @private
     *
     * @param {object} [drawOptions] A map of options to pass to the visual.
     *   Its properties are used to set any `undefined` properties of the visual specification.
     *
     * @return {Promise} A promise that is resolved when the visual
     *   has been drawn/displayed.
     */
    _updateVisual: function(drawOptions) {
      // assert this._visualSpec && this._visualType &&
      //        this._visualSpec.type === this._visualType.id

      // Need data, even if an empty one.
      // Defensive copy.
      var dataTable = this._dataTable;
      if(!dataTable) throw new Error("No Data");

      var resultPromise = this._getVisual()
          .then(drawItNow.bind(this))
          .then(drawn.bind(this));

      return this._async().until(resultPromise);

      function drawItNow() {
        return this._visual.draw(dataTable, this._getDrawSpec(drawOptions));
      }

      function drawn() {
        this._setAction(null);
      }
    },

    _getDrawSpec: function(drawOptions) {
      var drawSpec = this._drawSpec;
      if(!drawSpec) {
        var ONLY_DEFAULTS = true,
            visualSpec = this._visualSpec;

        drawSpec = this._drawSpec = specHelper.clone(visualSpec);

        // Dimensions
        if(visualSpec.width == null) {
          drawSpec.width = this._readDomDim("width");
        } else {
          drawSpec.width = this._resizeDomDim("width", drawSpec.width);
        }

        if(drawSpec.height == null) {
          drawSpec.height = this._readDomDim("height");
        } else {
          drawSpec.height = this._resizeDomDim("height", drawSpec.height);
        }

        // Should we smash this here? Everytime?
        drawSpec.highlights = this.highlights;

        /*
          context: {},

          // When specified, should use this when generating HTML tooltips.
          tooltipFooter: ...,

          // Pass-through
          direct: {}
        */

        // Higher precedence first
        specHelper.setProperties(drawSpec, this._visualType.args, ONLY_DEFAULTS);
        specHelper.setProperties(drawSpec, drawOptions,           ONLY_DEFAULTS);
      }

      // Always set
      drawSpec.action = (drawOptions && drawOptions.action) ||
          (this._actionCount === 1 ? this._lastAction : null);

      return drawSpec;
    },

    /***
     * Handles the visual's 'select' event.
     *
     * Processes highlights and re-triggers the 'select' event.
     *
     * @method _onVisualSelect
     * @private
     *
     * @param {object} ev The event object.
     */
    _onVisualSelect: function(ev) {
      this._processHighlights(ev);

      // Forward event
      visualEvents.trigger(this, "select", ev);

      if(this._actionCount) this.update();
    },

    /***
     * Handles the visual's 'doubleclick' event.
     *
     * Re-triggers the 'doubleclick' event.
     *
     * @method _onVisualDoubleClick
     * @private
     *
     * @param {object} ev The event object.
     */
    _onVisualDoubleClick: function(ev) {
      // Forward event
      visualEvents.trigger(this, "doubleclick", ev);
    },

    /***
     * Disposes the current visual, if any.
     *
     * Detaches from previously attached visual events.
     *
     * If the optional {{#crossLink "IVisual/dispose:method"}}{{/crossLink}}
     * is declared by the current visual, it is called.
     *
     * Also resets the dom element, preparing it for any future display.
     *
     * @method _disposeVisual
     * @param {boolean} [finalDispose=false] Indicates that this is a final dispose.
     * @private
     */
    _disposeVisual: function(finalDispose) {
      var visual = this._visual;
      if(visual) {

        visualEvents.removeSource(visual);

        if(visual.dispose) visual.dispose();

        if(!finalDispose) {
          this._resetDomElem();
          this._setAction(null);
        }

        this._visual = visual = null;
      }
    },

    /***
     * Registers an action performed.
     *
     * When _nully_, resets the action registry.
     *
     * The action registry is tied to the lifetime of a visual instance.
     * As such, a call to this method only takes effect if there is a current one.
     *
     * @method _setAction
     * @param {string} [action=null] The action performed.
     * @private
     */
    _setAction: function(action) {
      if(this._visual) {
        if(action) {
          if(action !== this._lastAction) {
            this._lastAction = "setHighlights";
            this._actionCount++;
          }
        } else {
          this._lastAction  = null;
          this._actionCount = 0;
        }
      }
    },

    // ---
    // DOM

    /***
     * Sets and prepares the DOM element that the visuals
     * created by this wrapper should draw in.
     *
     * @method _setDomElem
     * @private
     * @param {HTMLDOMElement} domElem The HTML DOM element.
     */
    _setDomElem: function(domElem) {

      /**
       * Gets the HTML DOM element that visuals
       * created by this wrapper will draw inside of.
       *
       * Set at construction time, through the argument `domElem`.
       *
       * @property domElement
       * @type HTMLDOMElement
       * @readonly
       */
      this.domElement = domElem;

      this._resetDomElem();
    },

    /***
     * Clears the contents of `domElement`.
     * Recreates the child `visualElement`.
     *
     * @method _resetDomElem
     * @private
     */
    _resetDomElem: function() {
      // Empty out `domElement`
      var domElem = this.domElement;
      while(domElem.firstChild) domElem.removeChild(domElem.firstChild);

      // Create the child `visualElement`.
      // Recreating it each time ensures we can provide a
      // fresh, clean element to the next visual.

      // TODO: should be inner box.
      // Bellow conversions to string are due to rhino/java.
      var width  = this._readDomDim("width" ),
          height = this._readDomDim("height"),

          // Respect the type of document we're in
          visualElem = String(domElem.tagName.toLowerCase()) === "svg"
              ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
              : document.createElement("div");

      visualElem.setAttribute("class", "visual-element");

      var styles = ["border-width:0px;"];
      if(width ) styles.push("width: "  + width  + "px;");
      if(height) styles.push("height: " + height + "px;");
      visualElem.setAttribute("style", styles.join(" "));

      domElem.appendChild(visualElem);

      this.visualElement = visualElem;
    },

    /***
     * Resizes one of the DOM elements' dimensions.
     *
     * If the specified `len` is _nully_,
     * the current dimension length is read and returned.
     *
     * @method _resizeDomDim
     * @private
     *
     * @param {string} [dim]  The dimension name. One of `width` or `height`.
     * @param {string|number} [len] The new length, in pixels, or _nully_.
     *
     * @return {number} The parsed (or read) dimension value.
     */
    _resizeDomDim: function(dim, len) {
      if(len != null) {
        len = +len;
        if(isNaN(len) || !isFinite(len) || len < 1)
          len = 1;

        this.domElement.style[dim] =
        this.visualElement.style[dim] = len + "px";
      } else {
        len = this._readDomDim(dim);
      }

      return len;
    },

    /***
     * Reads the value of one of the DOM elements' dimensions.
     *
     * The dimension is first read using either `offsetWidth` or `offsetHeight`.
     *
     * If these return a _nully_ value, then the dimensions are read
     * from the "width" or "height" DOM attributes, using the `getAttribute` method.
     * The latter satisfies the use case of SVG elements, in a Rhino/Batik environment,
     * where `offsetWidth` and `offsetHeight` do not function appropriately.
     *
     * @method _readDomDim
     * @private
     *
     * @param {string} [dim] The dimension name. One of `width` or `height`.
     *
     * @return {number} The read dimension value or `null` if not defined.
     */
    _readDomDim: function(dim) {
      var len = this.domElement[dim === "height" ? "offsetHeight" : "offsetWidth"];
      if(len == null) {
        len = this.domElement.getAttribute(dim);
        if(len == null || !String(len)) { // cast len to JS string (Rhino)
          len = null;
        } else {
          len = +len;
          if(isNaN(len)) len = null;
        }
      }
      return len;
    },

    // -----
    // ASYNC

    /***
     * Starts an asynchronous operation whose end can
     * be associated with a {{#crossLink "Promise"}}{{/crossLink}}.
     *
     * The asynchronous operation is automatically ended
     * when the associated promise is settled.
     *
     * @method _endAsync
     * @private
     * @return {object} An object with a property `until`,
     *   a function that receives a {{#crossLink "Promise"}}{{/crossLink}} whose
     *   settlement signals the end of the asynchronous operation.
     */
    _async: function() {
      var me = this;

      me._asyncLock++;

      return {
        // Wrap the given promise,
        // and make sure to call _endAsync in any case.
        until: function asyncUntil(untilPromise) {
          return promiseUtil["finally"](untilPromise, me._endAsync, me);
        }
      };
    },

    /***
     * Ends an asynchronous operation.
     *
     * @method _endAsync
     * @private
     */
    _endAsync: function() {
      if(!this._asyncLock) throw new Error("Assertion: invalid asynchronous state.");
      this._asyncLock--;
    },

    /***
     * Throws an error if an asynchronous operation is being executed.
     *
     * @method _checkAsyncState
     * @private
     */
    _checkAsyncState: function() {
      if(this._asyncLock) throw new Error("Controller is currently locked.");
    },

    /***
     * Throws an error if there is no current visual
     * or if an asynchronous operation is being executed.
     *
     * @method _checkVisualState
     * @private
     */
    _checkVisualState: function() {
      if(!this._visual) throw new Error("No current visualization.");
      this._checkAsyncState();
    }
  });
});
