/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/lang/EventSource",
  "pentaho/type/complex",
  "pentaho/data/filter",
  "pentaho/util/error",
  "pentaho/util/object",
  "./types/selectionModes",

  "pentaho/lang/Event",

  "./events/WillSelect",
  "./events/DidSelect",
  "./events/RejectedSelect",

  "./events/WillChangeSelection",
  "./events/DidChangeSelection",
  "./events/RejectedChangeSelection",

  "./events/WillExecute",
  "./events/DidExecute",
  "./events/RejectedExecute",

  "pentaho/lang/ActionResult",
  "pentaho/lang/UserError",

  "pentaho/i18n!type"
], function(EventSource, complexFactory, filter, error, O, selectionModes,
            Event,
            WillSelect, DidSelect, RejectedSelect,
            WillChangeSelection, DidChangeSelection, RejectedChangeSelection,
            WillExecute, DidExecute, RejectedExecute,
            ActionResult, UserError,
            bundle) {

  "use strict";

  /**
   * Creates the `Model` type of a given context.
   *
   * @name modelFactory
   * @memberOf pentaho.visual.base
   * @type pentaho.type.Factory.<pentaho.visual.base.Model>
   * @amd pentaho/visual/base/model
   */
  return function(context) {

    var Complex = context.get(complexFactory);

    /**
     * @name Model
     * @memberOf pentaho.visual.base
     * @class
     * @extends pentaho.type.Complex
     * @abstract
     * @classDesc This is the base model class for visualizations.
     *
     * @constructor
     * @description Creates a base `Model`.
     * @param {pentaho.visual.base.spec.IModel} modelSpec A plain object containing the model specification.
     */
    var Model = Complex.extend().implement(EventSource).extend(/** @lends pentaho.visual.base.Model# */{
        constructor: function(modelSpec) {
          this.base(modelSpec);
        },

        /**
         * Modifies the current selection.
         *
         * The selection is modified in two phases:
         * In the first phase, the
         *
         * @param {!pentaho.data.filter.AbstractFilter} dataFilter - A filter representing the increment
         * @param {?object} keyArgs - Keyword arguments.
         * @param {!function} keyArgs.selectionMode - A function that computes a new selection,
         * taking into account the current selection and an input `dataFilter`.
         * @see {pentaho.visual.base.types.selectionModes}
         * @return {boolean} `true` if the selection was modified, `false` otherwise.
         *
         * @fires pentaho.visual.base.events#"will:select"
         */
        selectAction: function(dataFilter, keyArgs) {
          var result;
          var processedDataFilter = dataFilter;
          var isCanceled = false;
          var selectionMode = O.getOwn(keyArgs, "selectionMode");

          if(this._hasListeners(WillSelect.type)) {
            var will = new WillSelect(this, dataFilter, selectionMode);
            isCanceled = !this._emit(will);

            processedDataFilter = will.dataFilter;
            if(isCanceled) {
              result = new ActionResult(undefined, will.cancelReason);
              if(this._hasListeners(RejectedSelect.type)) {
                var canceled = new RejectedSelect(this, result.error, processedDataFilter);
                this._emit(canceled);
              }
              return result;
            }
            selectionMode = will.selectionMode;
          }

          try {
            result = this._changeSelection(processedDataFilter, selectionMode, keyArgs);
          } catch(e) {
            result = new ActionResult(undefined, e);
          }
          return this._broadcastResult(result, processedDataFilter, DidSelect, RejectedSelect);
        },

        _changeSelection: function(dataFilter, proposedSelectionMode, keyArgs) {
          var result;
          var processedDataFilter = dataFilter;
          var isCanceled = false;
          var selectionMode = proposedSelectionMode || this.getv("selectionMode");

          if(this._hasListeners(WillChangeSelection.type)) {
            var will = new WillChangeSelection(this, dataFilter, selectionMode);
            isCanceled = !this._emit(will);

            processedDataFilter = will.dataFilter;
            if(isCanceled) {
              result = new ActionResult(undefined, will.cancelReason);
              if(this._hasListeners(RejectedChangeSelection.type)) {
                var canceled = new RejectedChangeSelection(this, result.error, processedDataFilter);
                this._emit(canceled);
              }
              return result;
            }
            selectionMode = will.selectionMode;
          }

          try {
            var combinedSelection = selectionMode(this, processedDataFilter, keyArgs);
            if(combinedSelection) {
              this.set("selectionFilter", combinedSelection);
              result = new ActionResult(combinedSelection, null);
            } else {
              result = new ActionResult(undefined, new UserError("Invalid selection."));
            }
          } catch(e) {
            result = new ActionResult(undefined, e);
          }

          return this._broadcastResult(result, processedDataFilter, DidChangeSelection, RejectedChangeSelection);
        },

        /**
         * Emits an event. All exceptions are caught (and swallowed)
         * @param event
         * @returns {*}
         * @private
         */
        _emit: function(event) {
          var result = null;
          try {
            result = this.base(event);
          } catch(e) {
            console.log("Exception thrown during '", event.type, "' loop:", e);
          }
          return result;
        },

        executeAction: function(dataFilter) {
          var result;
          var processedDataFilter = dataFilter;
          var isCanceled = false;
          var doExecute = this.getv("doExecute");

          if(this._hasListeners(WillExecute.type)) {
            var will = new WillExecute(this, dataFilter, doExecute);
            isCanceled = !this._emit(will);

            processedDataFilter = will.dataFilter;
            if(isCanceled) {
              result = new ActionResult(undefined, will.cancelReason);
              if(this._hasListeners(RejectedSelect.type)) {
                var canceled = new RejectedSelect(this, result.error, processedDataFilter);
                this._emit(canceled);
              }
              return result;
            }
            doExecute = will.executeAction;
          }

          if(doExecute) {
            try {
              doExecute(processedDataFilter);
              result = new ActionResult(undefined, null);
            } catch(e) {
              result = new ActionResult(undefined, e);
            }
          } else {
            result = new ActionResult(undefined, new UserError("No action defined"));
          }
          return this._broadcastResult(result, processedDataFilter, DidExecute, RejectedExecute);

        },

        _broadcastResult: function(result, dataFilter, DidEvent, RejectedEvent) {
          if(result.error) {
            if(this._hasListeners(RejectedEvent.type)) {
              var rejected = new RejectedEvent(this, result.error, dataFilter);
              this._emit(rejected);
            }
          } else {
            if(this._hasListeners(DidEvent.type)) {
              var did = new DidEvent(this, result.value, dataFilter);
              this._emit(did);
            }
          }
          return result;
        },

        meta: {
          id: "pentaho/visual/base",
          view: "View",
          isAbstract: true,
          props: [
            {
              name: "width",
              type: "number",
              isRequired: true
            },
            {
              name: "height",
              type: "number",
              isRequired: true
            },
            {
              name: "isInteractive",
              type: "boolean",
              value: true
            },
            {
              name: "data",
              type: "object",
              isRequired: true
            },
            {
              name: "selectionFilter",
              type: "object",
              value: new filter.Or()
            },
            {
              name: "selectionMode",
              type: "function",
              value: selectionModes.REPLACE
            },
            {
              name: "doExecute",
              type: "function"
            }
          ]
        }
      })
      .implement({meta: bundle.structured});

    return Model;

  };
});
