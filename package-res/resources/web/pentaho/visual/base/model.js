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

  "pentaho/lang/ActionResult",

  "pentaho/i18n!type",

  // pre-load all visual role mapping types
  "../role/mapping",
  "../role/nominal",
  "../role/ordinal",
  "../role/quantitative"
], function(complexFactory, Event, filter, O,
            error, UserError,
            selectionModes,
            WillSelect, DidSelect, RejectedSelect,
            WillExecute, DidExecute, RejectedExecute,
            ActionResult,
            bundle,
            mappingFactory) {

  "use strict";

  return function(context) {

    var Complex = context.get(complexFactory);
    var Mapping = context.get(mappingFactory);

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
     * @classDesc The `Model` class is the abstract base class of visualization models.
     *
     * @constructor
     * @description Creates a visual model.
     * @param {pentaho.visual.base.spec.IModel} [modelSpec] A plain object containing the model specification.
     */
    var Model = Complex.extend(/** @lends pentaho.visual.base.Model# */{

      constructor: function() {

        this.base.apply(this, arguments);

        this.type.each(function(propType) {
          if(propType.type.isSubtypeOf(Mapping.type)) {
            // Visual role
            var mapping = this.get(propType);
            if(!mapping) {
              // Create default instance without firing events
              this._values[propType.name] = mapping = propType.toValue({});
            }

            mapping.setOwnership(this, propType);
          }
        }, this);
      },

      set: function(name, valueSpec) {

        var result = this.base(name, valueSpec);

        if(!result || result.isFulfilled) {
          var propType = this.type.get(name);
          if(propType.type.isSubtypeOf(Mapping.type)) {
            var mapping = this.get(name);
            if(mapping)
              mapping.setOwnership(this, propType);
          }
        }

        return result;
      },

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
       * Any rejection (due to an event cancelation or due to an invalid selection mode)
       * leads to the emission of the
       * ["rejected:select"]{@link pentaho.visual.base.events.RejectedSelect}.
       *
       * @param {!pentaho.data.filter.AbstractFilter} inputDataFilter - A filter representing
       * the data set which will be used to modify the current selection filter.
       * @param {Object} keyArgs - Keyword arguments.
       * @param {function} keyArgs.selectionMode - A function that computes a new selection filter,
       * taking into account the current selection filter and an input `dataFilter`.
       *
       * @return {!pentaho.lang.ActionResult}
       * If unsuccessful, the `error` property describes what originated the error.
       * If successful,  the `error` property is `null` and the `value` property contains
       * the updated current selection filter.
       *
       * @fires "will:select"
       * @fires "did:select"
       * @fires "rejected:select"
       *
       * @see pentaho.visual.base.types.selectionModes
       */
      selectAction: function(inputDataFilter, keyArgs) {
        var selectionMode = O.getOwn(keyArgs, "selectionMode") || this.selectionMode;
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
        var currentSelectionFilter = this.selectionFilter;
        var selectionMode = will.selectionMode || this.selectionMode;

        var newSelectionFilter;
        try {
          newSelectionFilter = selectionMode.call(this, currentSelectionFilter, will.dataFilter);
        } catch(e) {
          return ActionResult.reject(e);
        }

        return this.set("selectionFilter", newSelectionFilter); //setting to null assigns the default value
      },

      /**
       * Executes an action when the user interacts with a visual element, normally by double clicking it.
       *
       * The flow starts by emitting the event {@link pentaho.visual.base.events.WillExecute|"will:execute"}.
       * Its event listeners can be attributed a _priority_
       * and can be regarded as operations in a processing pipeline that are allowed to:
       * - cancel the event
       * - replace the input data filter
       * - change the [doExecute]{@link pentaho.visual.base.Model.Meta} action
       *
       * Any rejection (due to an event cancellation or due to an invalid `doExecute` action)
       * emits the event {@link pentaho.visual.base.events.RejectedSelect|"rejected:execute"}.
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
        var doExecute = O.getOwn(keyArgs, "doExecute") || this.doExecute;
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

      /**
       * Executes the will/did/rejected event loop associated with a given action.
       *
       * @param {function} coreAction - The action to be executed.
       * @param {pentaho.visual.base.events.Will} willEvent - The "will:" event object.
       * @param {function} DidEvent - The constructor of the "did:" event.
       * @param {function} RejectedEvent - The constructor of the "rejected:" event.
       * @return {pentaho.lang.ActionResult} The result object.
       * @protected
       */
      _doAction: function(coreAction, willEvent, DidEvent, RejectedEvent) {

        if(this._hasListeners(willEvent.type))
          this._emitSafe(willEvent);

        /*jshint laxbreak:true*/
        var result = willEvent.isCanceled
            ? ActionResult.reject(willEvent.cancelReason)
            : coreAction.call(this, willEvent);

        if(result.error) {
          if(this._hasListeners(RejectedEvent.type)) {
            this._emitSafe(new RejectedEvent(this, result.error, willEvent));
          }
        } else {
          if(this._hasListeners(DidEvent.type)) {
            this._emitSafe(new DidEvent(this, result.value, willEvent));
          }
        }

        return result;
      },
      //endregion

      //region serialization
      toSpecInContext: function(keyArgs) {

        if(keyArgs && keyArgs.isJson) {
          keyArgs = keyArgs ? Object.create(keyArgs) : {};

          var omitProps = keyArgs.omitProps;
          keyArgs.omitProps = omitProps = omitProps ? Object.create(omitProps) : {};

          // TODO: Add keyword arguments to serialize data/interaction when desired.
          // Only isJson serialization does not work with the values of these properties
          // due to the circular dependencies they contain.

          omitProps.data = true;
          omitProps.selectionFilter = true;
        }

        return this.base(keyArgs);
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
