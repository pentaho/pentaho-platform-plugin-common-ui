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
  './data/AbstractDataTable',
  './data/DataTable',
  './data/DataView',
  './events',
  './color/paletteRegistry',
  './color/utils',
  './type/registry',
  './type/helper',
  './spec/helper',
  './_utils'
], function(
      AbstractDataTable, DataTable, DataView, visualEvents, paletteRegistry, colorUtils,
      typeRegistry, typeHelper, specHelper, utils) {

 /**
  * @module pentaho.visual
  */

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
  function VisualWrapper(domElem, containerTypeId) {
    if(!domElem) throw utils.error.argRequired("domElem");

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

    // --------

    this._dataTable = null;

    /**
     * Gets the current highlights.
     *
     * Do **not** modify the returned array or its contents.
     *
     * @property highlights
     * @type ISelection[]
     * @readonly
     */
    this.highlights = [];
  }

  utils.extend(VisualWrapper.prototype, {
    // ------
    // PROPS

    /**
     * Gets or sets the data table instance that will be used by the next
     * {{#crossLink "VisualWrapper/update:method"}}{{/crossLink}} call.
     *
     * A data table must be set before a visual can be drawn.
     *
     * @property data
     * @type DataTable
     */
    get data() {
      return this._dataTable;
    },

    set data(value) {
      if(!value) throw utils.error.argRequired("data");

      if(this._dataTable !== value) {
        if(!(value instanceof AbstractDataTable))
          value = new DataTable(value);

        this._dataTable = value;
      }
    },

    /**
     * Gets or sets a visual specification.
     *
     * When set to _nully_, the current visual display will be cleared if updated.
     *
     * When the visual specification is a _nully_ value,
     * the current visual display will be cleared, if updated.
     *
     * An error is thrown if the type of the specified visual is not defined or
     * is disabled for the wrapper's container type,
     * {{#crossLink "VisualWrapper/containerTypeId:property"}}{{/crossLink}}.
     *
     * @property visualSpec
     *
     * @type IVisualSpec
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
          this._disposeVisual();
          this._visualType = null;
        }
        // else
        // Same visual type. Keep visual and update with new spec.
      }

      if(visualSpec) {
        if(!this._visualType)
          this._visualType = typeRegistry.get(visualSpec.type, this.containerTypeId, /*assert:*/true);

        this._visualSpec = visualSpec;
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
    // [DCL] NEW
    on: function(name, handler) {
      visualEvents.addListener(this, name, handler);
    },

    // [DCL] NEW
    off: function(name) {
      visualEvents.removeListener(this, name);
    },

    /**
     * Displays a visual.
     *
     * When a visual specification is not defined,
     * the current visual display is cleared and the returned promise
     * is immediately resolved.
     *
     * If any of the visual specification properties
     * {{#crossLink "IVisual/width:property"}}{{/crossLink}} and
     * {{#crossLink "IVisual/height:property"}}{{/crossLink}} is unspecified, or is _nully_,
     * it takes the value of the current corresponding dimension
     * of {{#crossLink "VisualWrapper/domElement:property"}}{{/crossLink}}.
     * Otherwise, when specified, it is the corresponding element's dimension
     * that takes that value.
     *
     * The following errors are thrown, synchronously, if:
     *
     * 1. an asynchronous operation is being executed
     * 2. no data has been set.
     *
     * @method update
     * @param {object} [drawOptions] A map of contextual, transient, arbitrary options to pass to the visual.
     *   Its properties are used to set any `undefined` properties of the visual specification.
     *   Its properties are not saved with the visual specification.
     *
     * @return {Promise} A promise that is resolved when the visual has been displayed.
     */
    update: function(drawOptions) {
      this._checkAsyncState();

      if(!this._visualSpec) return Promise.resolve(undefined);

      // Reset so that any updates to visualSpec may pass-through.
      this._drawSpec = null;

      return this._updateVisual(drawOptions);
    },

    // -----------------

    processHighlights: function(args) {
      var mode = args.selectionMode || "TOGGLE";

      if (mode == "REPLACE") {
        // only use the selections from the arguments passed in
        this.highlights = [];
      }

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
          for( var hNo=0; hNo<this.highlights.length; hNo++) {
            var highlight = this.highlights[hNo];
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
                this.highlights.splice( hNo, 1 );
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
          this.highlights.push( highlight );
        }
      }
      //this.updateHighlights();
    },

    /*
     updateHighlights
     Updates all of the highlights on the visual
     */
    updateHighlights: function() {
      if(this._visual.setHighlights) {
        this._visual.setHighlights(this.highlights);
      }
    },

    // TODO: Missing setHighlights and getHighlights...
    // TODO: Should be called clearHighlights??
    /*
     updateHighlights
     Clears all of the highlights on the visual
     */
    clearSelections: function() {
      this.highlights = [];
      // [DCL] Why isn't visual updated?
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
     * the __same arguments__ used in the previous call.
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
     * @return {Promise} A promise that is
     *    resolved when the current visual display has finished.
     */
    resize: function(width, height) {
      this._checkVisualState();

      // Apply new sizes to domElement and visualElement (or read current ones).
      // and sync with drawSpec.
      var drawSpec = this._drawSpec,
          w = drawSpec.width  = this._resizeDomDim("width",  width ),
          h = drawSpec.height = this._resizeDomDim("height", height);

      // Method IVisual#resize is optional.
      // Call draw with same args when missing.
      if(!this._visual.resize)
        return this._updateVisual();

      var promise = utils.promiseCall(this._visual.resize.bind(this._visual, w, h));

      return this._async().until(promise);
    },

    /**
     * Updates the visual specification with the current highlights, state or data.
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
     * @return {object} A visual specification.
     */
    save: function(options) {
      this._checkVisualState();

      var visualSpec = this._visualSpec;

      if(utils.option(options, "saveState", true)) {
        visualSpec.highlights = this.highlights;

        // Method IVisual#getState is optional.
        if(this._visual.getState)
          visualSpec.state = this._visual.getState() || null;
      }

      if(utils.option(options, "saveData", false))
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

      var promise = this._getVisual().then(drawItNow.bind(this));

      return this._async().until(promise);

      function drawItNow() {
        var dataView = new DataView(dataTable); // [DCL] Why a view? Isolation?
        var drawSpec = this._getDrawSpec(drawOptions);

        return this._visual.draw(dataView, drawSpec);
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

        // TODO: these will remain in the datatable under revised names.
        var jsonTable = this._dataTable.getJsonTable();
        drawSpec.memberPalette = jsonTable.colors || {};
        drawSpec.formatInfo    = jsonTable.formatStrings;

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
      this.processHighlights(ev);

      // Forward event
      visualEvents.trigger(this, "select", ev);
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

        if(!finalDispose) this._resetDomElem();

        this._visual = visual = null;
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
        until: function asyncUntil(promise) {
          return utils.promiseFinally(promise, me._endAsync, me);
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

  return VisualWrapper;
});
