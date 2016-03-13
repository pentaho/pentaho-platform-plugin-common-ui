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
  "pentaho/type/complex",
  "pentaho/lang/EventSource",
  "pentaho/lang/Event",
  "pentaho/data/filter",
  "pentaho/util/object",
  "pentaho/util/error",
  "pentaho/lang/UserError",
  "./types/selectionModes",

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

  "pentaho/i18n!type"
], function(complexFactory, EventSource, Event, filter, O,
            error, UserError,
            selectionModes,
            WillSelect, DidSelect, RejectedSelect,
            WillChangeSelection, DidChangeSelection, RejectedChangeSelection,
            WillExecute, DidExecute, RejectedExecute,
            ActionResult,
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
         * @param {!pentaho.data.filter.AbstractFilter} proposedDataFilter - A filter representing the increment
         * @param {?object} keyArgs - Keyword arguments.
         * @param {!function} keyArgs.selectionMode - A function that computes a new selection,
         * taking into account the current selection and an input `dataFilter`.
         * @see {pentaho.visual.base.types.selectionModes}
         * @return {boolean} `true` if the selection was modified, `false` otherwise.
         *
         * @fires pentaho.visual.base.events#"will:select"
         */
        selectAction: function(proposedDataFilter, keyArgs) {
          var selectionMode = O.getOwn(keyArgs, "selectionMode");
          var dataFilter = proposedDataFilter;

          var result = this._runPipeline(dataFilter, selectionMode, WillSelect, RejectedSelect);
          if(result) {
            if(result.error) return result;
            selectionMode = result.value.selectionMode;
            dataFilter = result.value.dataFilter;
          }

          try {
            result = this._changeSelection(dataFilter, selectionMode);
          } catch(e) {
            result = new ActionResult(undefined, e);
          }
          return this._broadcastResult(result, dataFilter, DidSelect, RejectedSelect);
        },

        _changeSelection: function(proposedDataFilter, proposedSelectionMode) {
          var selectionMode = proposedSelectionMode || this.getv("selectionMode");
          var dataFilter = proposedDataFilter;

          var result = this._runPipeline(dataFilter, selectionMode, WillChangeSelection, RejectedChangeSelection);
          if(result) {
            if(result.error) return result;
            selectionMode = result.value.selectionMode;
            dataFilter = result.value.dataFilter;
          }

          try {
            var combinedSelection = selectionMode(this, dataFilter);
            if(combinedSelection) {
              this.set("selectionFilter", combinedSelection);
              result = new ActionResult(combinedSelection, null);
            } else {
              result = new ActionResult(undefined, new UserError(bundle.structured.error.selection.invalid));
            }
          } catch(e) {
            result = new ActionResult(undefined, e);
          }

          return this._broadcastResult(result, dataFilter, DidChangeSelection, RejectedChangeSelection);
        },

        executeAction: function(proposedDataFilter) {
          var doExecute = this.getv("doExecute");
          var dataFilter = proposedDataFilter;

          var result = this._runPipeline(dataFilter, doExecute, WillExecute, RejectedExecute);
          if(result) {
            if(result.error) return result;
            doExecute = result.value.doExecute;
            dataFilter = result.value.dataFilter;
          }

          if(doExecute) {
            try {
              doExecute(dataFilter);
              result = new ActionResult(undefined, null);
            } catch(e) {
              result = new ActionResult(undefined, e);
            }
          } else {
            result = new ActionResult(undefined, new UserError(bundle.structured.error.action.notDefined));
          }
          return this._broadcastResult(result, dataFilter, DidExecute, RejectedExecute);

        },

        /**
         * Emits an event. All exceptions are caught (and swallowed).
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

        _runPipeline: function(dataFilter, otherArg, WillEvent, RejectedEvent) {
          if(!this._hasListeners(WillEvent.type)) return null;

          var will = new WillEvent(this, dataFilter, otherArg);
          var isCanceled = !this._emit(will);

          if(isCanceled) {
            var result = new ActionResult(undefined, will.cancelReason);
            if(this._hasListeners(RejectedEvent.type)) {
              var canceled = new RejectedEvent(this, result.error, will.dataFilter);
              this._emit(canceled);
            }
            return result;
          }
          return new ActionResult(will, null);
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
