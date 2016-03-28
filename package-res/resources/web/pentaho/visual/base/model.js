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
  "pentaho/lang/Event",
  "pentaho/data/filter",
  "pentaho/util/object",
  "pentaho/util/error",
  "pentaho/lang/UserError",
  "./types/selectionModes",

  "./events/WillSelect",
  "./events/DidSelect",
  "./events/RejectedSelect",

  "./events/WillExecute",
  "./events/DidExecute",
  "./events/RejectedExecute",

  "pentaho/lang/events/WillChange",
  "pentaho/lang/events/DidChange",
  "pentaho/lang/events/RejectedChange",

  "pentaho/lang/ActionResult",

  "pentaho/i18n!type"
], function(complexFactory, Event, filter, O,
            error, UserError,
            selectionModes,
            WillSelect, DidSelect, RejectedSelect,
            WillExecute, DidExecute, RejectedExecute,
            WillChange, DidChange, RejectedChange,
            ActionResult,
            bundle) {

  "use strict";

  return function(context) {

    var Complex = context.get(complexFactory);

    /**
     * @name Model
     * @memberOf pentaho.visual.base
     * @class
     * @extends pentaho.type.Complex
     * @mixes pentaho.lang.EventSource
     * @abstract
     *
     * @amd {pentaho.type.Factory<pentaho.visual.base.Model>} pentaho/visual/base/model
     *
     * @classDesc This is the base model class for visualizations.
     *
     * @constructor
     * @description Creates a base `Model`.
     * @param {pentaho.visual.base.spec.IModel} modelSpec A plain object containing the model specification.
     */
    var Model = Complex.extend(/** @lends pentaho.visual.base.Model# */{
        //region Event Flows Handling
        /**
         * Modifies the current selection filter based on an input filter and on a selection mode.
         *
         * This action is the entry point for user-driven modifications of the current selection filter.
         * For example, if the user clicked a bar in a bar chart or drew a rectangle over a set of bars in a bar chart.
         *
         * The event ["will:select"]{@link pentaho.visual.base.events.WillSelect}
         * is first emitted.
         * Its event listeners can be attributed a _priority_
         * and can be regarded as operations in a processing pipeline that are allowed to:
         * - cancel the event
         * - replace the input filter
         * - replace the selection mode
         *
         * Afterwards, the current selection filter is updated.
         * If the modification of the current selection filter is successful, the event
         * ["did:select"]{@link pentaho.visual.base.events.DidSelect} is emitted.
         *
         * Any failure (due to an event cancelation or due to an invalid selection mode)
         * leads to the emission of the
         * ["rejected:select"]{@link pentaho.visual.base.events.RejectedSelect}.
         *
         * @param {!pentaho.data.filter.AbstractFilter} inputDataFilter - A filter representing
         * the data set which will be used to modify the current selection filter.
         * @param {?object} keyArgs - Keyword arguments.
         * @param {!function} keyArgs.selectionMode - A function that computes a new selection filter,
         * taking into account the current selection filter and an input `dataFilter`.
         * @return {pentaho.lang.ActionResult}
         * If unsuccessful, the `error` property describes what originated the error.
         * If successful,  the `error` property is `null` and the `value` property contains the updated current selection filter.
         *
         * @fires "will:select"
         * @fires "did:select"
         * @fires "rejected:select"
         *
         * @see pentaho.visual.base.types.selectionModes
         */
        selectAction: function(inputDataFilter, keyArgs) {
          var selectionMode = O.getOwn(keyArgs, "selectionMode") || this.getv("selectionMode");
          var will = new WillSelect(this, inputDataFilter, selectionMode);
          return this._doAction(this._doSelect, will, DidSelect, RejectedSelect);
        },

        /**
         * Modifies the current selection.
         *
         * @param {pentaho.visual.base.events.WillSelect} will - The "will:select" event object.
         * @return {ActionResult} The result object.
         * @protected
         */
        _doSelect: function(will){
          var currentSelectionFilter = this.getv("selectionFilter");
          var selectionMode = will.selectionMode || this.getv("selectionMode");

          var newSelectionFilter;
          try {
            newSelectionFilter = selectionMode.call(this, currentSelectionFilter, will.dataFilter);
          } catch(e) {
            return ActionResult.reject(e);
          }

          return this.change("selectionFilter", newSelectionFilter || new filter.Or()); //setting to null assigns the default value
        },

        /**
         * Changes the value of a property and returns a [result]{@link pentaho.lang.ActionResult} object.
         *
         * This method is supposed to set the value of a property, trigger event loops and return a result.
         *
         * @param {nonEmptyString} property - Name of the property to set.
         * @param {*} value - Value to assign to the property.
         * @return {pentaho.lang.ActionResult} The result object.
         * @private
         * @fires "will:change"
         * @fires "did:change"
         * @fires "rejected:change"
         */
        change: function(property, value){
          var will = new WillChange(this, property, value, this.getv(property));
          return this._doAction(this._setWithResult, will, DidChange, RejectedChange);
        },

         _setWithResult: function(will){
          var result;
          try {
            this.set(will.property, will.value);
            result = ActionResult.fulfill(will.value);
           } catch(e) {
            result = ActionResult.reject(e);
          }
          return result;
        },

        /**
         * Executes an action when the user interacts with a visual element, normally by double clicking it.
         *
         * The flow starts by triggering the event {@link pentaho.visual.base.events.WillExecute|will:execute}.
         * Its event listeners can be attributed a _priority_
         * and can be regarded as operations in a processing pipeline that are allowed to:
         * - cancel the event
         * - replace the input data filter
         * - change the [doExecute]{@link pentaho.visual.base.Model.Meta} action
         *
         * Any failure (due to an event cancellation or due to an invalid `doExecute` action)
         * triggers the event {@link pentaho.visual.base.events.RejectedSelect|rejected:execute}.
         *
         * @param {!pentaho.data.filter.AbstractFilter} inputDataFilter - A filter representing the data set of
         * the visual element which the user interacted with.
         *
         * @return {pentaho.lang.ActionResult}
         * If unsuccessful, the `error` property describes what originated the error.
         * If successful,  the `error` property is `null`.
         * In either case no value is returned.
         *
         * @fires "will:execute"
         * @fires "did:execute"
         * @fires "rejected:execute"
         *
         */
        executeAction: function(inputDataFilter, keyArgs) {
          var doExecute = O.getOwn(keyArgs, "doExecute") || this.getv("doExecute");
          var will = new WillExecute(this, inputDataFilter, doExecute);
          return this._doAction(this._doExecute, will, DidExecute, RejectedExecute);
        },

        /**
         * Runs the `doExecute` action and returns a [result]{@link pentaho.lang.ActionResult} object.
         *
         * @param {pentaho.visual.base.events.WillExecute} will - The "will:execute" event object.
         * @return {ActionResult} The result object.
         * @protected
         */
        _doExecute: function(will){
          if(!will.doExecute)
            return ActionResult.reject(bundle.structured.error.action.notDefined);

          var result;
          try {
            result = will.doExecute.call(this, will.dataFilter);
          } catch(e) {
            return ActionResult.reject(e);
          }
          return result && result.isRejected ? result : ActionResult.fulfill();
        },
        //endregion

        type:  /** @lends pentaho.visual.base.Model.Meta# */{
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
              value: new filter.Or(),
              isRequired: true
            },
            {
              name: "selectionMode",
              type: {
                base: "function",
                cast: function(f) {
                  if(typeof f === "string" && selectionModes.hasOwnProperty(f))
                    return selectionModes[f];

                  // TODO: must default to eval if string
                  return f;
                }
              },
              value: selectionModes.REPLACE,
              isRequired: true
            },
            {
              name: "doExecute",
              type: "function"
            }
          ]
        }
      })
      .implement({type: bundle.structured});

    return Model;

  };
});
