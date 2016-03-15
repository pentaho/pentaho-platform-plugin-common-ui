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
    var Model = Complex.extend(/** @lends pentaho.visual.base.Model# */{
        constructor: function(modelSpec) {
          this.base(modelSpec);
        },

        //region Event Flows Handling
        /**
         * Modifies the current selection filter based on an input filter and on a selection mode.
         *
         * This action is the entry point for user-driven modifications of the current selection filter,
         * e.g. if the user clicked a bar in a bar chart,
         * or drew a rectangle over a set of bars in a bar chart.
         *
         * The event ["will:select"]{@link pentaho.visual.base.events.WillSelect}
         * is first emitted.
         * Its event listeners can be attributed a _priority_,
         * and can be regarded as operations in a processing pipeline that are allowed to:
         * - cancel the event,
         * - replace the input filter
         * - replace the selection mode.
         *
         * Afterwards, [_changeSelection]{@link pentaho.visual.base.Model#_changeSelection}
         * is invoked to compute and update the current selection filter.
         *
         * If the modification of the current selection filter is successful, the event
         * ["did:select"]{@link pentaho.visual.base.events.DidSelect} is emitted,
         * and a [result]{@link pentaho.lang.ActionResult} containing
         * the updated current selection filter in the `value` property is returned.
         *
         * Any failure (due to an event cancelation or due to an invalid selection mode)
         * yields an error [result]{@link pentaho.lang.ActionResult}
         * and lead to the emission of the
         * ["rejected:select"]{@link pentaho.visual.base.events.RejectedSelect}.
         * In this case, this method returns a [result]{@link pentaho.lang.ActionResult}
         * with an error in the `error` property.
         *
         * @param {!pentaho.data.filter.AbstractFilter} dataFilter - A filter representing
         * the data set which will be used to modify the current selection filter.
         * @param {?object} keyArgs - Keyword arguments.
         * @param {!function} keyArgs.selectionMode - A function that computes a new selection,
         * taking into account the current selection filter and an input `dataFilter`.
         * @return {pentaho.lang.ActionResult}
         * If unsuccessful, the `error` property describes what originated the error.
         * If successful,  the `error` property is `null` and the `value` property contains the updated current selection filter.
         *
         * @fires "will:select"
         * @fires "did:select"
         * @fires "rejected:select"
         *
         * @see #_runPipeline
         * @see #_changeSelection
         * @see #_broadcastResult
         * @see pentaho.visual.base.types.selectionModes
         */
        selectAction: function(proposedDataFilter, keyArgs) {
          var selectionMode = O.getOwn(keyArgs, "selectionMode");
          var dataFilter = proposedDataFilter;

          var result = this._runPipeline(WillSelect, dataFilter, selectionMode);
          var noError = result && !result.error;
          if(noError) {
            dataFilter = result.value.dataFilter;
            selectionMode = result.value.selectionMode;
          }
          if(noError || !result) {
            try {
              result = this._changeSelection(dataFilter, selectionMode);
            } catch(e) {
              result = new ActionResult(undefined, e);
            }
          }
          return this._broadcastResult(DidSelect, RejectedSelect, result, dataFilter);
        },

        /**
         * Updates the current selection filter based on a filter and on a selection mode.
         *
         * This method is invoked by [selectAction]{@link pentaho.visual.base.Model#selectAction} once all
         * listeners of the ["will:select"]{@link pentaho.visual.base.events.WillSelect} event have eventually
         * replaced the original input filter and the selection mode to be used.
         *
         * @param {!pentaho.data.filter.AbstractFilter} dataFilter -
         * @param {!function} selectionMode -
         * @return {pentaho.lang.ActionResult}
         * If unsuccessful, the `error` property describes what originated the error.
         * If successful,  the `error` property is `null` and the `value` property contains the updated current selection filter.
         *
         * @fires "will:change:select"
         * @fires "did:change:select"
         * @fires "rejected:change:select"
         *
         * @see #selectAction
         * @see #_runPipeline
         * @see #_broadcastResult
         * @protected
         */
        _changeSelection: function(proposedDataFilter, proposedSelectionMode) {
          var selectionMode = proposedSelectionMode || this.getv("selectionMode");
          var dataFilter = proposedDataFilter;

          var result = this._runPipeline(WillChangeSelection, dataFilter, selectionMode);

          var noError = result && !result.error;
          if(noError) {
            selectionMode = result.value.selectionMode;
            dataFilter = result.value.dataFilter;
          }
          if(noError || !result) {
            try {
              var currentFilter = this.get("selectionFilter");
              var combinedSelection = selectionMode(currentFilter, dataFilter);
              if(combinedSelection) {
                this.set("selectionFilter", combinedSelection);
                result = new ActionResult(combinedSelection, null);
              } else {
                result = new ActionResult(undefined, new UserError(bundle.structured.error.selection.invalid));
              }
            } catch(e) {
              result = new ActionResult(undefined, e);
            }
          }

          return this._broadcastResult(DidChangeSelection, RejectedChangeSelection, result, dataFilter);
        },

        /**
         * Executes an action when the user interacts with a visual element, normally by double clicking it.
         *
         * The flow starts by triggering the event
         * {@link pentaho.visual.base.events.WillExecute|will:execute}.
         * Its event listeners can be attributed a _priority_,
         * and can be regarded as operations in a processing pipeline that are allowed to:
         * - cancel the event,
         * - replace the input data filter
         * - change the `doExecute` action.
         *
         * Any failure (due to an event cancellation or due to an invalid `doExecute` action)
         * yields an error {@link pentaho.lang.ActionResult|result}
         * and lead to the emission (and processing) of the
         * {@link pentaho.visual.base.events.RejectedSelect|rejected:execute}.
         * In this case, this method returns a {@link pentaho.lang.ActionResult|result}.
         * with an error in the `error` property.
         *
         * @param {!pentaho.data.filter.AbstractFilter} dataFilter - The filter that represents the visual element which the user interacted with.
         * @return {pentaho.lang.ActionResult}
         * If unsuccessful, the `error` property describes what originated the error.
         * If successful,  the `error` property is `null`.
         * In both cases no value is returned.
         *
         * @fires "will:execute"
         * @fires "did:execute"
         * @fires "rejected:execute"
         *
         * @see #_runPipeline
         * @see #_broadcastResult
         */
        executeAction: function(proposedDataFilter) {
          var doExecute = this.getv("doExecute");
          var dataFilter = proposedDataFilter;

          var result = this._runPipeline(WillExecute, dataFilter, doExecute);

          var noError = result && !result.error;
          if(noError) {
            doExecute = result.value.doExecute;
            dataFilter = result.value.dataFilter;
          }
          if(doExecute && (noError || !result)) {
            try {
              doExecute(dataFilter);
              result = new ActionResult(undefined, null);
            } catch(e) {
              result = new ActionResult(undefined, e);
              result = new ActionResult(undefined, e);
            }
          } else {
            result = new ActionResult(undefined, new UserError(bundle.structured.error.action.notDefined));
          }
          return this._broadcastResult(DidExecute, RejectedExecute, result, dataFilter);

        },

        /**
         * Processes a "will:" event and returns a [result]{@link pentaho.lang.ActionResult}
         * that wraps a possibly mutated event.
         *
         * If no listener is registered for the "will:" event, returns `null`.
         * If some event listener canceled the event (and thus the action at play),
         * the result is an [user error]{pentaho.lang.UserError} that captures the reason for the cancelation.
         *
         * This method abstracts the first part of the "will/did/rejected"
         * set of events associated with an action.
         *
         * @param {pentaho.visual.base.Will} WillEvent - The constructor of the "will:*" event to be processed.
         * @param {pentaho.data.filter.AbstractFilter} dataFilter - The filter describing the data being processed.
         * @param {*} otherArg - The third argument to be passed to the constructor of `WillEvent`.
         * @return {pentaho.lang.ActionResult}
         * If no listener for the "will:" event was registered, `null` is returned.
         * If unsuccessful, the `error` property describes what originated the error.
         * If successful, the `error` property is `null` and the `value` property contains the `WillEvent` instance.
         *
         * @protected
         *
         * @see #_broadcastResult
         */
        _runPipeline: function(WillEvent, dataFilter, otherArg) {
          if(!this._hasListeners(WillEvent.type)) return null;

          var will = new WillEvent(this, dataFilter, otherArg);
          var success = this._emitSafe(will);

          if(success) return new ActionResult(will, null);
          return new ActionResult(undefined, will.cancelReason);
        },

        /**
         * Broadcasts the result of an action, via a "did:" event or a "rejected:" event,
         * depending on the contents of `result`.
         *
         * This method abstracts the third (and final) part of the "will/did/rejected"
         * set of events associated with an action.
         *
         * @param DidEvent
         * @param RejectedEvent
         * @param result
         * @param dataFilter
         * @returns {*}
         * @protected
         *
         * @see #_runPipeline
         */
        _broadcastResult: function(DidEvent, RejectedEvent, result, dataFilter) {
          if(result.error) {
            if(this._hasListeners(RejectedEvent.type)) {
              var rejected = new RejectedEvent(this, result.error, dataFilter);
              this._emitSafe(rejected);
            }
          } else {
            if(this._hasListeners(DidEvent.type)) {
              var did = new DidEvent(this, result.value, dataFilter);
              this._emitSafe(did);
            }
          }
          return result;
        },
        //endregion

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
