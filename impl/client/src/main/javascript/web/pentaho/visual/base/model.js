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
  "module",

  "pentaho/type/model",
  "./application",
  "pentaho/lang/Event",
  "pentaho/type/filter/abstract",
  "pentaho/type/filter/or",
  "pentaho/util/spec",
  "pentaho/util/object",
  "pentaho/util/error",
  "pentaho/util/fun",
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
], function(module, modelFactory, visualApplicationFactory,
            Event, abstractFilterFactory, orFilterFactory, specUtil, O,
            error, F, UserError,
            selectionModes,
            WillSelect, DidSelect, RejectedSelect,
            WillExecute, DidExecute, RejectedExecute,
            ActionResult,
            bundle,
            mappingFactory) {

  "use strict";

  return function(context) {

    var Model = context.get(modelFactory);
    var Mapping = context.get(mappingFactory);

    /**
     * @name Model
     * @memberOf pentaho.visual.base
     * @class
     * @extends pentaho.type.Model
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
    var VisualModel = Model.extend(/** @lends pentaho.visual.base.Model# */{

      constructor: function() {

        this.base.apply(this, arguments);

        // Create default visual role mappings
        this.type.each(function(propType) {
          if(propType.type.isSubtypeOf(Mapping.type)) {
            // Visual role
            var mapping = this.get(propType);
            if(!mapping) {
              // Create default instance without firing events
              this._values[propType.name] = mapping = propType.toValue({});
              mapping._addReference(this, propType);
            }
          }
        }, this);
      },

      // region Event Flows Handling
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
       * @param {!pentaho.type.filter.Abstract} inputDataFilter - A filter representing
       * the dataset which will be used to modify the current selection filter.
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
      _doSelect: function(will) {
        var currentSelectionFilter = this.selectionFilter;
        var selectionMode = will.selectionMode || this.selectionMode;

        var newSelectionFilter;
        try {
          newSelectionFilter = selectionMode.call(this, currentSelectionFilter, will.dataFilter);
        } catch(e) {
          return ActionResult.reject(e);
        }

        try {
          // Note that when setting to null, it actually gets the default value.
          this.selectionFilter = newSelectionFilter;
        } catch(e) {
          return ActionResult.reject(e);
        }

        return ActionResult.fulfill();
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
       * @param {!pentaho.type.filter.Abstract} inputDataFilter - A filter representing the dataset of
       * the visual element which the user interacted with.
       *
       * @param {Object} [keyArgs] - The keywords argument.
       * @param {function} [keyArgs.doExecute] - A "doExecute" function to use instead of the model's
       * current [doExecute]{@link pentaho.visual.base.Model#doExecute} function.
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
      _doExecute: function(will) {
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

        /* jshint laxbreak:true*/
        var result = willEvent.isCanceled
            ? ActionResult.reject(willEvent.cancelReason)
            : coreAction.call(this, willEvent);

        if(result.error) {
          if(this._hasListeners(RejectedEvent.type)) {
            this._emitSafe(new RejectedEvent(this, result.error, willEvent));
          }
        } else {
          /* eslint no-lonely-if: 0 */
          if(this._hasListeners(DidEvent.type)) {
            this._emitSafe(new DidEvent(this, result.value, willEvent));
          }
        }

        return result;
      },
      // endregion

      // region serialization
      toSpecInContext: function(keyArgs) {

        if(keyArgs && keyArgs.isJson) {
          keyArgs = keyArgs ? Object.create(keyArgs) : {};

          var omitProps = keyArgs.omitProps;
          keyArgs.omitProps = omitProps = omitProps ? Object.create(omitProps) : {};

          // Only isJson serialization does not work with the value of `data`
          // due to the circular dependencies it contains.
          if(omitProps.data == null) omitProps.data = true;

          if(omitProps.selectionFilter == null) omitProps.selectionFilter = true;
        }

        return this.base(keyArgs);
      },
      // endregion

      type: /** @lends pentaho.visual.base.Model.Meta# */{
        sourceId: module.id,
        id: module.id.replace(/.\w+$/, ""),
        defaultView: "./View",
        isAbstract: true,

        props: [
          /**
           * Gets or sets the visual application object.
           *
           * The application object represents the relevant state and
           * interface of the application in which a model is being used.
           *
           * This property does not serialize to JSON by default.
           *
           * @name application
           * @memberOf pentaho.type.Model#
           * @type {pentaho.visual.base.Application}
           */
          {
            name: "application",
            type: visualApplicationFactory
          },
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
            type: "pentaho/type/filter/abstract",
            value: {_: "pentaho/type/filter/or"},
            isRequired: true
          },
          {
            name: "selectionMode",
            type: {
              base: "function",
              cast: function(f) {
                if(typeof f === "string" && O.hasOwn(selectionModes, f))
                  return selectionModes[f];

                return F.as(f);
              }
            },
            value: selectionModes.REPLACE,
            isRequired: true
          },
          {
            name: "doExecute",
            type: "function"
          }
        ],

        _init: function(spec, keyArgs) {

          this.base.apply(this, arguments);

          // ----
          // Block inheritance, with default values

          this._extension = null;
          this._extensionEf = undefined;
        },

        // region Extension
        _extension: null,
        _extensionEf: undefined,

        /**
         * Gets or sets extension properties that a View handles directly.
         *
         * Each visualization type should document the extension properties that
         * it honors when specified via this attribute.
         *
         * When set and the model already has [descendant]{@link pentaho.type.Type#hasDescendants} models,
         * an error is thrown.
         *
         * Returns `null` when there are no local extension properties.
         *
         * Note that this attribute is _not_ serialized when serializing a visual model type.
         * It is expected that this attribute is always specified through configuration.
         * Also, generally, there would be problems serializing functions and other objects
         * it can contain.
         *
         * @type {Object}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the model already has
         * [descendant]{@link pentaho.type.Type#hasDescendants} models.
         *
         * @see pentaho.visual.base.Model.Type#extensionEffective
         *
         * @see pentaho.visual.base.spec.IModel#extension
         */
        get extension() {
          return this._extension;
        },

        set extension(value) {
          if(this.hasDescendants)
            throw error.operInvalid("Cannot change the 'extension' of a model type that has descendants.");

          this._extension = value ? Object(value) : null;
          this._extensionEf = undefined;
        },

        /**
         * Gets the effective extension properties,
         * a merge between the inherited extension properties and the
         * locally specified extension properties.
         *
         * The merging is performed using the rules of the
         * {@link pentaho.util.Spec#merge} method.
         *
         * Returns `null` when there are no local or inherited extension properties.
         *
         * @readOnly
         * @type {Object}
         *
         * @see pentaho.visual.base.Model.Type#extension
         */
        get extensionEffective() {
          var effective = this._extensionEf;
          if(effective === undefined) {
            effective = null;

            var ancestor = this.ancestor;
            if(ancestor.isSubtypeOf(VisualModel.type)) {
              var ancestorExtEf = ancestor.extensionEffective;
              if(ancestorExtEf) {
                effective = {};
                specUtil.merge(effective, ancestorExtEf);
              }
            }

            if(this._extension) {
              if(!effective) effective = {};
              specUtil.merge(effective, this._extension);
            }

            this._extensionEf = effective;
          }

          return effective;
        },
        // endregion

        /**
         * Calls a function for each defined visual role property type.
         *
         * A visual role property type is a property type whose
         * [value type]{@link pentaho.type.Property.Type#type} is a subtype of
         * [Mapping]{@link pentaho.visual.role.Mapping}.
         *
         * @param {function(pentaho.type.Property.Type, number, pentaho.type.Complex) : boolean?} f - The mapping
         * function. Return `false` to break iteration.
         *
         * @param {Object} [x] The JS context object on which `f` is called.
         *
         * @return {pentaho.visual.base.Model} This object.
         */
        eachVisualRole: function(f, x) {
          var j = 0;
          this.each(function(propType) {
            if(this.isVisualRole(propType.type) && f.call(x, propType, j++, this) === false) {
              return false;
            }
          }, this);
          return this;
        },

        /**
         * Gets a value that indicates if a given property type is a subtype of
         * [Mapping]{@link pentaho.visual.role.Mapping.Type}.
         *
         * @param {!pentaho.type.Type} type - The type to test.
         * @return {boolean} `true` if `type` is a mapping type; or `false`, otherwise.
         */
        isVisualRole: function(type) {
          return type.isSubtypeOf(Mapping.type);
        }
      }
    })
    .implement({type: bundle.structured});

    return VisualModel;
  };
});
