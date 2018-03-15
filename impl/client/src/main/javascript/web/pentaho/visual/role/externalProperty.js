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
  "pentaho/util/arg",

  // so that r.js sees otherwise invisible dependencies.
  "./abstractProperty",
  "./externalMapping",
  "./strategy/base"
], function(bundle, ValidationError, DataView, typeUtil, O, error, arg) {

  "use strict";

  return [
    "./abstractProperty",
    "./externalMapping",
    "./strategy/base",
    "./mode",
    {$instance: {type: ["pentaho/visual/role/strategy/base"]}},

    function(AbstractProperty, ExternalMapping, BaseStrategy, Mode, allStrategiesList) {

      var allStrategies = allStrategiesList.toArray();

      var ListOfStrategyType = this.get([BaseStrategy]);
      var ListOfModeType = this.get([Mode]);

      // This one should remain private
      /**
       * @name pentaho.visual.role.IStrategyMethodInfo
       * @interface
       * @private
       * @property {!pentaho.visual.role.Mode} internalMode - The internal mode.
       * @property {!pentaho.visual.role.Mode} externalMode - The external mode.
       * @property {!pentaho.visual.role.adaptation.IStrategyMethod} method - The adaptation strategy method.
       */

      // NOTE: these will be kept private until it is decided between the adapter and the viz concept.

      /**
       * @name pentaho.visual.role.ExternalProperty.Type
       * @class
       * @extends pentaho.visual.role.AbstractProperty.Type
       *
       * @private
       *
       * @classDesc The type class of {@link pentaho.visual.role.ExternalProperty}.
       */

      /**
       * @name pentaho.visual.role.ExternalProperty
       * @class
       * @extends pentaho.visual.role.AbstractProperty
       *
       * @private
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
      var ExternalProperty = AbstractProperty.extend(/** @lends pentaho.visual.role.ExternalProperty# */{

        $type: /** @lends pentaho.visual.role.ExternalProperty.Type# */{

          valueType: ExternalMapping,

          // Setting the value type resets the inherited defaultValue.
          defaultValue: function() { return {}; },

          /** @inheritDoc */
          _init: function(spec, keyArgs) {

            spec = this.base(spec, keyArgs) || spec;

            if(this.isRoot) {

              O.setConst(this, "_internalProperty", arg.required(keyArgs, "internalProperty", "keyArgs"));

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

          // region modes
          // Initialized in #__setStrategies
          __modes: null,

          /** @inheritDoc */
          get modes() {
            return this.__modes;
          },
          // endregion

          // @override
          get isVisualKey() {
            return this._internalProperty.isVisualKey;
          },

          // region fields
          /**
           * Gets the metadata about the fields property of mappings of this visual role property.
           *
           * @type {!pentaho.visual.role.IFieldsMetadata}
           * @readOnly
           * @override
           */
          get fields() {
            var fields = O.getOwn(this, "__fields");
            if(!fields) {

              var propType = this;

              this.__fields = fields = Object.freeze({
                countRangeOn: function(model) {
                  return propType.__fieldsCountRangeOn(model);
                }
              });
            }

            return fields;
          },

          /**
           * The property is required if its internal property is required.
           * The property is a list if its current mode is a list or, when there is no current mode,
           * if it has any list modes.
           *
           * Implements IFieldsMetadata#countRangeOn.
           *
           * @param {!pentaho.visual.base.ModelAdapter} modelAdapter - The model adapter.
           * @return {pentaho.IRange<number>} The field count range.
           * @private
           */
          __fieldsCountRangeOn: function(modelAdapter) {

            var isRequired = this._internalProperty.fields.countRangeOn(modelAdapter.model).min > 0;

            // In unit-tests, these properties are used outside of a real model. So mapping can be null.
            var externalMapping = modelAdapter.get(this);
            var mode = externalMapping && externalMapping.mode;

            var countMax = (mode !== null ? mode.dataType.isList : this.hasAnyListModes) ? Infinity : 1;

            return {min: isRequired ? 1 : 0, max: countMax};
          },
          // endregion

          // region strategies
          __strategies: null,
          __isStrategiesDefault: true,

          /**
           * List of a applicable strategy methods along with corresponding internal and external modes.
           * @type {Array.<pentaho.visual.role.IStrategyMethodInfo>}
           * @private
           */
          __strategyMethodInfos: null,

          /**
           * Gets or sets the array of adaptation strategies used to adapt the
           * fields mapped to the visual role to those required by one of its modes.
           *
           * Visual roles _should_ have at least one mapping strategy.
           *
           * When set to a {@link Nully} value, the set operation is ignored.
           *
           * If not specified at the root [visual.role.Property]{@link pentaho.visual.role.ExternalProperty},
           * the `strategies` attribute is initialized with all registered
           * [strategy]{@link pentaho.visual.role.adaptation.Strategy} instances
           * (registered as instances of the type `pentaho/visual/role/adaptation/strategy`).
           *
           * The Viz. API pre-registers instances of the following standard strategy types, in the given order:
           * 1. [IdentityStrategy]{@link pentaho.visual.role.adaptation.IdentityStrategy} strategy
           * 2. [CombineStrategy]{@link pentaho.visual.role.adaptation.CombineStrategy} strategy
           * 3. [TupleStrategy]{@link pentaho.visual.role.adaptation.TupleStrategy} strategy.
           *
           * The returned list or its elements should not be modified.
           *
           * @type {!pentaho.type.List.<pentaho.visual.role.adaptation.Strategy>}
           *
           * @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
           * [subtypes]{@link pentaho.type.Type#hasDescendants}.
           */
          get strategies() {
            return this.__strategies;
          },

          set strategies(values) {

            this._assertNoSubtypesAttribute("strategies");

            if(values == null) return;

            this.__setStrategies(values, /* isDefault: */false);
          },

          __setStrategies: function(values, isDefault) {

            var strategies = new ListOfStrategyType(values, {isReadOnly: true});

            // Collect role adapter factories from the strategies, for each internal mode.
            // Determine external modes.

            var strategyMethodInfos = [];

            var externalModes = new ListOfModeType();

            var isVisualKey = this.isVisualKey;

            this._internalProperty.modes.each(function(internalMode) {

              strategies.each(function(strategy) {
                // Strategy
                //   selectMethods(outputDataType, isVisualKey) : IStrategyMethod[] ?
                //
                // IStrategyMethod
                //   (strategy)
                //   name
                //   (isVisualKey)
                //   isIdentity
                //   isInvertible
                //   inputDataType
                //   outputDataType
                //   validateApplication(schemaDataTable, inputFieldIndexes) ?
                //
                // IStrategyMethodValidApplication
                //   method
                //   schemaData
                //   inputFieldIndexes
                //   apply(dataTable)
                //
                // IAdapter
                //   method
                //   dataTable
                //   inputFieldIndexes
                //   ----
                //   outputFieldIndexes
                //   invert(outputValuesOrCells) : inputCells

                var strategyMethods = strategy.selectMethods(internalMode.dataType, isVisualKey);
                if(strategyMethods != null) {

                  var isContinuous = internalMode.isContinuous;

                  strategyMethods.forEach(function(strategyMethod) {

                    var externalMode = new Mode({dataType: strategyMethod.inputDataType, isContinuous: isContinuous});

                    externalModes.add(externalMode);
                    externalMode = externalModes.get(externalMode.$key);

                    strategyMethodInfos.push(/** @type {pentaho.visual.role.IStrategyMethodInfo} */{
                      externalMode: externalMode,
                      method: strategyMethod,
                      internalMode: internalMode
                    });
                  });
                }
              });
            });

            this.__modes = externalModes;

            this.__strategies = strategies;

            this.__isStrategiesDefault = !!isDefault;

            this.__strategyMethodInfos = strategyMethodInfos;
          },
          // endregion

          // region selectAdaptationStrategyMethodOn
          /**
           * Selects a valid adaptation strategy method for the corresponding visual role of the given model adapter.
           *
           * If the current external mapping is such that its
           * [isCategoricalFixed]{@link pentaho.visual.role.ExternalMapping#isCategoricalFixed} is `true`,
           * then only the categorical modes of [internal modes]{@link pentaho.visual.role.Property.Type#modes}
           * are considered.
           * Otherwise, all internal modes are considered.
           *
           * @param {!pentaho.visual.base.ModelAdapter} modelAdapter - The model adapter.
           *
           * @return {pentaho.visual.role.IAdaptationStrategyMethodSelection} A strategy method selection instance,
           * if a method can be applied; `null`, otherwise.
           */
          selectAdaptationStrategyMethodOn: function(modelAdapter) {

            var externalMapping = modelAdapter.get(this);
            if(!externalMapping.hasFields) {
              return null;
            }

            // Leave if no data or if there are any invalid external field names.
            var externalFieldIndexes = externalMapping.fieldIndexes;
            if(externalFieldIndexes === null) {
              return null;
            }

            var schemaData = modelAdapter.data;
            var strategyMethodInfos = this.__strategyMethodInfos;
            var M = strategyMethodInfos.length;
            var m = -1;
            var isCategoricalFixed = externalMapping.isCategoricalFixed;
            while(++m < M) {
              var strategyMethodInfo = strategyMethodInfos.at(m);
              if(!isCategoricalFixed || !strategyMethodInfo.externalMode.isContinuous) {

                var selection = this.__validateAdaptationStrategyMethod(
                  strategyMethodInfo, schemaData, externalFieldIndexes);

                if(selection !== null) {
                  return selection;
                }
              }
            }

            return null;
          },

          /**
           * Performs basic validation that the external fields are compatible with the method's external data type,
           * and if so, calls the strategy method's own validation.
           *
           * @param {!pentaho.visual.role.IStrategyMethodInfo} strategyMethodInfo - The adaptation strategy method info.
           * @param {!pentaho.data.Table} schemaData - The schema data table.
           * @param {!Array.<number>} externalFieldIndexes - The indexes of the external fields.
           *
           * @return {pentaho.visual.role.IAdaptationStrategyMethodSelection} A strategy method selection,
           * if the application is valid; `null`, otherwise.
           */
          __validateAdaptationStrategyMethod: function(strategyMethodInfo, schemaData, externalFieldIndexes) {

            var externalDataType = strategyMethodInfo.method.inputDataType;
            var externalFieldCount = externalFieldIndexes.length;

            // 1) Non-list input data types can only handle a single field.
            if(!externalDataType.isList && externalFieldCount > 1) {
              return null;
            }

            // 2) Compatible field data types.
            var externalElementDataType = externalDataType.elementType;
            var externalFieldIndex = -1;
            var context = externalDataType.context;
            while(++externalFieldIndex < externalFieldCount) {
              var actualIndex = externalFieldIndexes[externalFieldIndex];
              var fieldDataType = context.get(schemaData.getColumnType(actualIndex)).type;
              if(!fieldDataType.isSubtypeOf(externalElementDataType)) {
                return null;
              }
            }

            var application = strategyMethodInfo.method.validateApplication(schemaData, externalFieldIndexes);
            if(application === null) {
              return null;
            }

            return /** @type {!pentaho.visual.role.IAdaptationStrategyMethodSelection} */Object.freeze({
              externalMode: strategyMethodInfo.externalMode,
              validMethodApplication: application,
              internalMode: strategyMethodInfo.internalMode
            });
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
           * @param {!pentaho.visual.base.ModelAdapter} modelAdapter - The model adapter.
           *
           * @return {Array.<pentaho.type.ValidationError>} A non-empty array of `ValidationError` or `null`.
           */
          validateOn: function(modelAdapter) {

            var errors = this.base(modelAdapter);
            if(!errors) {
              var addErrors = function(newErrors) {
                errors = typeUtil.combineErrors(errors, newErrors);
              };

              var mapping = modelAdapter.get(this);

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
