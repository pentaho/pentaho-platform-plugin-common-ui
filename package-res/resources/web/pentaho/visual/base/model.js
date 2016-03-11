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

  "./events/WillExecute",
  "./events/DidExecute",
  "./events/RejectedExecute",

  "pentaho/lang/ActionResult",
  "pentaho/lang/UserError",

  "pentaho/i18n!type"
], function(EventSource, complexFactory, filter, error, O, selectionModes,
            Event,
            WillSelect, DidSelect, RejectedSelect,
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
    var Model = Complex.extend(/** @lends pentaho.visual.base.Model# */{
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
          var isCanceled = false;
          var processedDataFilter = dataFilter;
          var selectionMode = O.getOwn(keyArgs, "selectionMode");

          if(this._hasListeners(WillSelect.type)) {
            var will = new WillSelect(this, dataFilter, selectionMode);
            isCanceled = !this._emitSafely(will, 'Exception thrown during "will:select" loop');

            processedDataFilter = will.dataFilter;
            if(isCanceled) {
              if(this._hasListeners(RejectedSelect.type)) {
                var canceled = new RejectedSelect(this, processedDataFilter);
                this._emitSafely(canceled);
              }
              return new ActionResult(undefined, will.cancelReason);
            }
            selectionMode = will.selectionMode;
          }

          var result;
          try {
            result = this._changeSelection(processedDataFilter, selectionMode, keyArgs);
          } catch(e) {
            result = new ActionResult(undefined, e);
          }

          if(result.error) {
            if(this._hasListeners(RejectedSelect.type)) {
              var rejected = new RejectedSelect(this, processedDataFilter);
              this._emitSafely(rejected);
              return result;
            }

          } else {
            if(this._hasListeners(DidSelect.type)) {
              var did = new DidSelect(this, processedDataFilter);
              this._emitSafely(did);
            }
            return result;
          }

        },

        _emitSafely: function(event, message) {
          var result = null;
          try {
            result = this._emit(event);
          } catch(e) {
            console.log(message, ":", e);
          }
          return result;
        },

        executeAction: function(dataFilter) {
          var doExecute = this.getv("doExecute");

          var isCanceled = false;
          var processedDataFilter = dataFilter;

          if(this._hasListeners(WillExecute.type)) {
            var will = new WillExecute(this, dataFilter, doExecute);
            isCanceled = !this._emitSafely(will, 'Exception thrown during "will:execute" loop');

            processedDataFilter = will.dataFilter;
            if(isCanceled) {
              if(this._hasListeners(RejectedSelect.type)) {
                var canceled = new RejectedSelect(this, processedDataFilter);
                this._emitSafely(canceled);
              }
              return new ActionResult(undefined, will.cancelReason);
            }
            doExecute = will.doExecute;
          }

          var result;
          if(doExecute) {
            try {
              doExecute(processedDataFilter);
            } catch(e) {
              result = new ActionResult(undefined, e);
            }
          } else {
            result = new ActionResult(undefined, new UserError("No action defined"));
          }
          if(result.error) {
            if(this._hasListeners(RejectedExecute.type)) {
              var rejected = new RejectedExecute(this, processedDataFilter, e);
              this._emitSafely(rejected, 'Exception thrown during "reject:execute" loop');
            }
            return result;
          }

          if(this._hasListeners(DidExecute.type)) {
            var did = new DidExecute(this, processedDataFilter);
            this._emitSafely(did, 'Exception thrown during "did:execute" loop');
          }
          return new ActionResult(undefined, null);

        },

        /**
         *
         * @param candidateSelection
         * @param selectionMode
         * @param keyArgs
         * @returns {boolean}
         * @protected
         */
        _changeSelection: function(candidateSelection, selectionMode, keyArgs) {
          var combineSelections = selectionMode || this.getv("selectionMode");
          if(!combineSelections)
            return new ActionResult(undefined, new UserError("No selectionMode defined"));

          var combinedSelection;
          try {
            combinedSelection = combineSelections(this, candidateSelection, keyArgs);
          } catch(e) {
            if(this._hasListeners("rejected:change:selection")) {
              var rejectSelect = new RejectedSelect(this, processedDataFilter);
              this._emit(rejectSelect);
              return new ActionResult(undefined, e);
            }
          }


          if(combinedSelection) {
            this.set("selectionFilter", combinedSelection);
            // MOCK emission of an event
            if(this._hasListeners("did:change:selection")) {
              var didEvent = new Event("did:change:selection", this, false);
              this._emit(didEvent);
            }
            // END MOCK
            return new ActionResult(combinedSelection, null);
          }
          return new ActionResult(undefined, new TypeError("Nully"));
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
      .implement(EventSource)
      .implement({meta: bundle.structured});

    return Model;

  };
});
