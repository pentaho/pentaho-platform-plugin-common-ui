/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/i18n!messages",
  "pentaho/type/ValidationError",
  "pentaho/data/TableView",
  "pentaho/type/util",
  "pentaho/util/object",
  "pentaho/util/error",

  // so that r.js sees otherwise invisible dependencies.
  "./baseProperty",
  "./externalMapping",
  "./strategy/base"
], function(bundle, ValidationError, DataView, typeUtil, O, error) {

  "use strict";

  return [
    "./baseProperty",
    "./externalMapping",
    "./strategy/base",
    {$instance: {type: ["pentaho/visual/role/strategy/base"]}},

    function(BaseProperty, ExternalMapping, BaseStrategy, allStrategiesList) {

      var allStrategies = allStrategiesList.toArray();

      var ListOfStrategyType = this.get([BaseStrategy]);

      /**
       * @name pentaho.visual.role.ExternalProperty.Type
       * @class
       * @extends pentaho.visual.role.BaseProperty.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.ExternalProperty}.
       */

      /**
       * @name pentaho.visual.role.ExternalProperty
       * @class
       * @extends pentaho.visual.role.BaseProperty
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.ExternalProperty>} pentaho/visual/role/externalProperty
       *
       * @classDesc The `ExternalProperty` class represents a visual role of a visualization as seen from the outside.
       *
       * The [valueType]{@link pentaho.type.Property.Type#valueType}
       * of a property of this type is {@link pentaho.visual.role.ExternalMapping}.
       *
       * @description This class was not designed to be constructed directly.
       */
      var ExternalProperty = BaseProperty.extend(/** @lends pentaho.visual.role.ExternalProperty# */{

        $type: /** @lends pentaho.visual.role.ExternalProperty.Type# */{

          valueType: ExternalMapping,

          // Setting the value type resets the inherited defaultValue.
          defaultValue: function() { return {}; },

          /** @inheritDoc */
          _init: function(spec, keyArgs) {

            spec = this.base(spec, keyArgs) || spec;

            if(this.isRoot) {

              var internalProperty = keyArgs && keyArgs.internalProperty;
              if(internalProperty == null) {
                throw error.argRequired("keyArgs.internalProperty");
              }

              O.setConst(this, "_internalProperty", internalProperty);

              // Assume default values.
              // Anticipate setting `strategies`.

              var strategies = spec.strategies;
              if(strategies != null) {
                this.__setStrategies(strategies);
              } else {
                this.__setStrategies(allStrategies, /* isDefault: */true);
              }

              // Prevent being applied again.
              spec = Object.create(spec);
              spec.strategies = undefined;
            }

            return spec;
          },

          // region _internalProperty
          /**
           * Gets the corresponding internal visual role property type.
           *
           * @type {!pentaho.visual.role.Property.Type}
           * @readOnly
           * @protected
           */
          _internalProperty: null,
          // endregion

          // @override
          get modes() {
            return this._internalProperty.modes;
          },

          // @override
          get isVisualKey() {
            return this._internalProperty.isVisualKey;
          },

          // region strategies
          __strategies: null,
          __isStrategiesDefault: true,

          /**
           * Gets or sets the array of adaptation strategies used to adapt the
           * fields mapped to the visual role to those required by one of its modes.
           *
           * Visual roles need to have at least one mapping strategy.
           *
           * When set to a {@link Nully} value, the set operation is ignored.
           *
           * If not specified at the root [visual.role.Property]{@link pentaho.visual.role.ExternalProperty},
           * the `strategies` attribute is initialized with all registered
           * [strategy]{@link pentaho.visual.role.strategy.Base} instances
           * (registered as instances of the type `pentaho/visual/role/strategy/base`).
           *
           * The Viz. API pre-registers the following standard strategies, in the given order:
           * 1. [Identity]{@link pentaho.visual.role.strategies.Identity} strategy
           * 2. [Combine]{@link pentaho.visual.role.strategies.Combine} strategy
           * 3. [Tuple]{@link pentaho.visual.role.strategies.Tuple} strategy.
           *
           * The returned list or its elements should not be modified.
           *
           * @type {!pentaho.type.List.<pentaho.visual.role.strategy.Base>}
           *
           * @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
           * [subtypes]{@link pentaho.type.Type#hasDescendants}.
           */
          get strategies() {
            return this.__strategies;
          },

          set strategies(values) {

            this.__assertNoDescendants("strategies");

            if(values == null) return;

            this.__setStrategies(values, /* isDefault: */false);
          },

          __setStrategies: function(values, isDefault) {
            var strategies = new ListOfStrategyType(values, {isReadOnly: true});
            if(strategies.count === 0) {
              throw error.argInvalid("strategies", bundle.structured.errors.property.noStrategies);
            }

            this.__strategies = strategies;

            this.__isStrategiesDefault = !!isDefault;
          },
          // endregion

          // region getAdapterOn
          /**
           * Obtains an applicable adapter for the given visualization.
           *
           * If the current external mapping is such that its
           * [isCategoricalFixed]{@link pentaho.visual.role.ExternalMapping#isCategoricalFixed} is `true`,
           * then only categorical modes of [modes]{@link pentaho.visual.role.Property.Type#modes} are considered.
           * Otherwise, all modes are considered.
           *
           * Modes are tried, in turn. For each mode, registered strategies are queried for an applicable adapter.
           * The first returned adapter is used.
           *
           * @param {!pentaho.visual.base.Visualization} visualization - The visualization.
           *
           * @return {pentaho.visual.role.IAdapter} An adapter if one is applicable, or `null`, if not.
           */
          getAdapterOn: function(visualization) {

            var mapping = visualization.get(this);
            var fields = mapping.fields;

            if(fields.count === 0) {
              return null;
            }

            var dataTable = visualization.data;
            if(dataTable === null) {
              return null;
            }

            // Obtain column indexes of fields.
            var anyInvalidField = false;

            var columnIndexes = fields.toArray(function(field) {

              var index = dataTable.getColumnIndexById(field.name);

              anyInvalidField |= (index < 0);

              return index;
            });

            // Leave if any invalid field names.
            if(anyInvalidField) {
              return null;
            }

            var inputData = new DataView(dataTable).setSourceColumns(columnIndexes);

            var modes = this.modes;
            var M = modes.count;
            var m = -1;
            var isCategoricalFixed = mapping.isCategoricalFixed;
            while(++m < M) {
              var mode = modes.at(m);

              if(!isCategoricalFixed || !mode.isContinuous) {

                var adapter = this.__getAdapterForMode(inputData, mode);
                if(adapter !== null) {
                  return adapter;
                }
              }
            }

            return null;
          },

          /**
           * Gets an adapter for a given input data and mode.
           *
           * Every registered strategy is queried for an applicable adapter.
           * The first returned adapter is used.
           *
           * @param {!pentaho.data.ITable} inputData - The data set view to be adapter.
           * @param {!pentaho.visual.role.Mode} mode - The mode which will be used.
           *
           * @return {pentaho.visual.role.IAdapter} An adapter if one is applicable, or `null`, if not.
           *
           * @private
           */
          __getAdapterForMode: function(inputData, mode) {

            var strategies = this.strategies;
            var S = strategies.count;
            var s = -1;
            var adapter;
            while(++s < S) {
              if((adapter = strategies.at(s).getAdapter(this, inputData, mode)) != null) {
                return adapter;
              }
            }

            return null;
          },
          // endregion

          // region Validation

          /**
           * Determines if this visual role is valid on the given visualization model.
           *
           * If base property validation fails, those errors are returned.
           *
           * Otherwise, validity is further determined as follows:
           *
           * 1. One of the registered strategies must be able to adapt the specified fields to one of the
           *    visual role's modes.
           *
           * @param {!pentaho.visual.base.Visualization} visualization - The visualization.
           *
           * @return {Array.<pentaho.type.ValidationError>} A non-empty array of `ValidationError` or `null`.
           */
          validateOn: function(visualization) {

            var errors = this.base(visualization);
            if(!errors) {
              var addErrors = function(newErrors) {
                errors = typeUtil.combineErrors(errors, newErrors);
              };

              var mapping = visualization.get(this);

              // Can adapt.
              if(mapping.adapter === null) {
                addErrors(new ValidationError(
                    bundle.format(bundle.structured.errors.property.noAdapter, {role: this})));
              }
            }

            return errors;
          },
          // endregion

          // region Serialization
          /** @inheritDoc */
          _fillSpecInContext: function(spec, keyArgs) {

            var any = this.base(spec, keyArgs);

            var strategies = O.getOwn(this, "__strategies");
            if(strategies && !this.__isStrategiesDefault) {
              any = true;
              spec.strategies = strategies.toSpecInContext(keyArgs);
            }

            return any;
          }
          // endregion
        }
      });

      return ExternalProperty;
    }
  ];
});
