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
  "pentaho/module!_",
  "./AbstractModel",
  "./Model",
  "../role/ExternalProperty",
  "pentaho/data/filter/True",
  "pentaho/data/filter/False",
  "pentaho/data/filter/Or",
  "pentaho/data/filter/And",
  "pentaho/type/loader",
  "pentaho/type/action/Transaction",
  "pentaho/type/action/ComplexChangeset",
  "pentaho/data/Table",
  "pentaho/data/util",
  "pentaho/util/object",
  "pentaho/util/error",
  "pentaho/util/logger",
  "pentaho/debug",
  "pentaho/debug/Levels",
  "pentaho/i18n!model"
], function(module, AbstractModel, Model, ExternalProperty, TrueFilter, FalseFilter, OrFilter, AndFilter, typeLoader,
            Transaction, ComplexChangeset, Table, dataUtil, O, error, logger, debugMgr, DebugLevels, bundle) {

  "use strict";

  /**
   * @classDesc Manages the lifetime of the cached information of the mapping instances associated with a
   * target abstract model.
   * @memberOf pentaho.visual.base
   * @class
   * @extends pentaho.type.action.ComplexChangeset
   * @private
   */
  var ModelAdapterChangeset = ComplexChangeset.extend({

    constructor: function(transaction, owner) {

      this.base(transaction, owner);

      // The transactionVersion properties of the owner's adaptation model are all at 0, as left since the last #_apply.
      this.__adaptationModel = owner.__adaptationModel;

      // Unfortunately, a new adaptation model is always created, even if it has the same data and
      // strategies. This will set the initial transactionVersion properties at the several levels.
      // Subsequent calls reuse the adaptationModel, if nothing changed.
      this.__getAdaptationModel();
    },

    __getAdaptationModel: function() {
      return this.__adaptationModel = __createAdaptationModel(this.target, this.__adaptationModel, this);
    },

    /** @inheritDoc */
    _apply: function(model) {

      this.base(model);

      // Cannot throw in this delicate phase...
      try {
        // Make sure to use an up to date adaptation model.
        var adaptationModel = this.__getAdaptationModel();

        // Reset all transactionVersion references, cause these are only meaningful within the current transaction.
        adaptationModel.transactionVersion = 0;

        var roleInfoMap = adaptationModel.roleInfoMap;
        Object.keys(roleInfoMap).forEach(function(roleName) {
          roleInfoMap[roleName].transactionVersion = 0;
        });

        // Update model.
        model.__adaptationModel = adaptationModel;
      } catch(ex) {
        if(debugMgr.testLevel(DebugLevels.error, module)) {
          logger.error("ModelAdapterChangeset apply failed: " + (ex && ex.message));
        }
      }
    }
  });

  var __externalPropertyType = ExternalProperty.type;

  // NOTE: these will be kept private until it is decided between the model adapter and the viz concept.

  /**
   * @name pentaho.visual.base.ModelAdapterType
   * @class
   * @extends pentaho.visual.base.ModelType
   *
   * @classDesc The type class of {@link pentaho.visual.base.ModelAdapter}.
   *
   * @private
   */

  /**
   * @name ModelAdapter
   * @memberOf pentaho.visual.base
   * @class
   * @extends pentaho.visual.base.Model
   * @abstract
   *
   * @private
   *
   * @amd pentaho/visual/base/ModelAdapter
   *
   * @classDesc The `ModelAdapter` class is the abstract base class of model adapters.
   *
   * @constructor
   * @description Creates a `ModelAdapter` instance.
   * @param {pentaho.visual.base.spec.IModelAdapter} [instSpec] A plain object containing the model adapter
   * specification.
   */
  var ModelAdapter = AbstractModel.extend(/** @lends pentaho.visual.base.ModelAdapter# */{

    constructor: function() {

      this.base.apply(this, arguments);

      // Although model has a default value,
      // changing the valueType of the property resets the default value.
      // So, model can be null, after all.
      if(this.model === null) {
        throw error.argRequired("spec.model");
      }

      this.__adaptationModel =
        __createAdaptationModel(this, /* previousAdaptationModel: */null, /* changeset: */null);

      // assert this.__adaptationModel !== null

      // This will create a txn and a changeset and the just set adaptationModel to be replaced
      // by another one (most probably, an identical one).
      this.__updateInternalModel();

      // 1. Attaching to the event only after the previous statement has the advantage of not trying to sync the
      // internal model once more... There's no danger of other listeners interfering (and thus needing
      // that the handler would be attached already) because this is a new object. Also mappings are created
      // internally.
      //
      // 2. Registering a listener has advantages over overriding __emitChangeActionPhaseInitEvent, as the
      // transaction manages to only call a listener if things changed below it since the last time it was called.
      // On the other hand, this will cause the commitInit evaluation phase to always have to execute its
      // lengthier path.
      //
      // 3. Must be the last change action init phase listener, or the internal model is not guaranteed to be in sync.
      //    TODO: find a way to ensure that we're really the last listener.
      this.on("change", {
        will: this.__onChangeActionPhaseInitHandler.bind(this)
      }, {priority: -Infinity, isCritical: true});

      this.model.on("change", {
        will: this.__onModelChangeActionPhaseInitHandler.bind(this)
      }, {priority: -Infinity, isCritical: true});
    },

    /** @inheritDoc */
    _createChangeset: function(txn) {
      return new ModelAdapterChangeset(txn, this);
    },

    // region Adaptation

    // TODO: Document IAdaptationModel.

    __adaptationModel: null,

    /**
     * Gets the *ambient* adaptation model of this model adapter.
     *
     * When a transaction is current and this model adapter has changes,
     * this method obtains the adaptation model of the corresponding changeset,
     * which will be up to date with the changes made within the transaction.
     * Otherwise, this method returns the _committed_ adaptation model of the model adapter.
     *
     * @return {IAdaptationModel} The adaptation model.
     *
     * @private
     * @see pentaho.visual.base.ModelAdapter#__getAdaptationModel
     * @see pentaho.visual.base.ModelAdapterChangeset#__getAdaptationModel
     */
    __getAmbientAdaptationModel: function() {
      return (this.$changeset || this).__getAdaptationModel();
    },

    /**
     * Gets the adaptation model of the model adapter.
     *
     * Note that this method must exist with the exact same name and signature in
     * {@link pentaho.visual.base.ModelAdapterChangeset}.
     *
     * See {@link pentaho.visual.base.ModelAdapter#__getAmbientAdaptationModel}.
     *
     * @return {IAdaptationModel} The adaptation model.
     *
     * @private
     */
    __getAdaptationModel: function() {
      return this.__adaptationModel;
    },

    /**
     * Gets the ambient operation mode of a visual role, given its name.
     *
     * @param {string} roleName - The visual role name.
     *
     * @return {pentaho.visual.role.Mode} The visual role operation mode, if one is established;
     * `null`, otherwise.
     *
     * @private
     *
     * @see pentaho.visual.role.ExternalMapping#mode
     */
    __getAmbientRoleMode: function(roleName) {
      var strategyApplication = this.__getAmbientAdaptationModel().roleInfoMap[roleName].strategyApplication;
      return strategyApplication && strategyApplication.externalMode;
    },

    /**
     * Gets the ambient strategy of a visual role, given its name.
     *
     * @param {string} roleName - The visual role name.
     *
     * @return {pentaho.visual.role.adaptation.Strategy} The current strategy, if one is established;
     * `null`, otherwise.
     *
     * @private
     *
     * @see pentaho.visual.role.ExternalMapping#strategy
     */
    __getAmbientRoleStrategy: function(roleName) {
      return this.__getAmbientAdaptationModel().roleInfoMap[roleName].strategy;
    },

    /**
     * Handler for the _init_ phase of a change action execution as emitted by this object.
     *
     * @param {pentaho.action.Execution} actionExecution - The change action execution.
     * @private
     */
    __onChangeActionPhaseInitHandler: function(actionExecution) {

      var changesetAction = actionExecution.action;
      var propertyNames = changesetAction.propertyNames;

      if(__hasSingleChange(propertyNames, "selectionFilter")) {

        // console.log("[ModelAdapter] change action init phase, modelAdapter.selectionFilter " +
        //   (this.selectionFilter && this.selectionFilter.$contentKey));

        this.__updateInternalSelection();

      } else {

        // console.log("[ModelAdapter] change action init phase, other");

        this.__updateInternalModel();
      }
    },

    /**
     * Handler for the _init_ phase of a change action execution as emitted by this.model.
     *
     * @param {pentaho.action.Execution} actionExecution - The change action execution.
     * @private
     */
    __onModelChangeActionPhaseInitHandler: function(actionExecution) {

      var changesetAction = actionExecution.action;

      if(changesetAction.hasChange("selectionFilter")) {

        // console.log("[ModelAdapter] change action init phase, model.selectionFilter");

        this.__updateExternalSelection();
      }
    },

    /**
     * Updates all properties of the internal model:
     * * [data]{@link pentaho.visual.base.Model#data}
     * * [selectionFilter]{@link pentaho.visual.base.Model#selectionFilter}
     * * and for each visual role mapping:
     *   * [modeFixed]{@link pentaho.visual.role.Mapping#modeFixed}
     *   * [fields]{@link pentaho.visual.role.Mapping#fields}
     *
     * @private
     */
    __updateInternalModel: function() {

      var adaptationModel = this.__getAmbientAdaptationModel();

      var roleInfoMap = adaptationModel.roleInfoMap;

      var internalModel = this.model;

      var internalSelectionFilter = this.__calcInternalSelectionFilter();

      // Synchronize internal model.
      Transaction.enter().using(function(scope) {

        internalModel.data = adaptationModel.internalData;
        internalModel.selectionFilter = internalSelectionFilter;

        Object.keys(roleInfoMap).forEach(function(propName) {

          var roleInfo = roleInfoMap[propName];
          var strategyApplication = roleInfo.strategyApplication;

          var internalMapping = internalModel.get(propName);

          internalMapping.modeFixed = strategyApplication && strategyApplication.internalMode;
          internalMapping.fields = strategyApplication !== null ? roleInfo.strategy.outputFieldNames : [];
        });

        scope.accept();
      });
    },

    /**
     * Updates the [selectionFilter]{@link pentaho.visual.base.Model#selectionFilter} property of
     * the internal model.
     *
     * @private
     */
    __updateInternalSelection: function() {
      // In a scenario where the external selectionFilter is updated,
      // this gets called and, unfortunately, the following will also cause __onModelChangeActionPhaseInitHandler to be called,
      // which will update back the external selectionFilter...
      this.model.selectionFilter = this.__calcInternalSelectionFilter();
    },

    /**
     * Updates the [selectionFilter]{@link pentaho.visual.base.Model#selectionFilter} property of
     * the external model.
     *
     * @private
     */
    __updateExternalSelection: function() {
      this.selectionFilter = this.__calcExternalSelectionFilter();
    },
    // endregion

    // region filter conversion
    /**
     * Calculates the internal selection filter based on the external one.
     *
     * @return {pentaho.data.filter.Abstract} The internal filter, possibly `null`.
     * @private
     */
    __calcInternalSelectionFilter: function() {
      var externalSelectionFilter = this.selectionFilter;
      if(externalSelectionFilter !== null) {
        try {
          return this._convertFilterToInternal(externalSelectionFilter);
        } catch(ex) {
          // Sometimes it is not possible to convert the filter cause, for example,
          // the data is not present anymore. Just return null.
          if(debugMgr.testLevel(DebugLevels.info, module)) {
            logger.info("It was not possible to convert external selection filter: " + (ex && ex.message));
          }

          return null;
        }

      }

      return null;
    },
    /**
     * Calculates the external selection filter based on the internal one.
     *
     * @return {pentaho.data.filter.Abstract} The external filter, possibly `null`.
     * @private
     */
    __calcExternalSelectionFilter: function() {
      var internalSelectionFilter = this.model.selectionFilter;
      if(internalSelectionFilter !== null) {
        try {
          return this._convertFilterToExternal(internalSelectionFilter);
        } catch(ex) {
          // Sometimes it is not possible to convert the filter cause, for example,
          // the data is not present anymore. Just return null.
          if(debugMgr.testLevel(DebugLevels.info, module)) {
            logger.info("It was not possible to convert internal selection filter: " + (ex && ex.message));
          }

          return null;
        }
      }

      return null;
    },

    /**
     * Converts a filter from the model adapter namespace into the internal model namespace.
     *
     * @param {pentaho.data.filter.Abstract} externalFilter - The external filter.
     * @return {pentaho.data.filter.Abstract} The corresponding internal filter.
     * @protected
     */
    _convertFilterToInternal: function(externalFilter) {
      var adaptationModel = this.__getAmbientAdaptationModel();
      var internalData = adaptationModel.internalData;
      if(internalData === null) {
        return null;
      }

      var filterContext = {
        modelAdapter: this,
        internalData: internalData,
        toExternal: false
      };

      // Find isProperty filters and convert their property equals', name and value to the internal data space.
      return externalFilter
        .visit(__flattenTree)
        .visit(__transformFilter.bind(filterContext));
    },

    /**
     * Converts a filter from the internal model namespace into the model adapter namespace.
     *
     * @param {pentaho.data.filter.Abstract} internalFilter - The internal filter.
     * @return {pentaho.data.filter.Abstract} The corresponding external filter.
     * @protected
     */
    _convertFilterToExternal: function(internalFilter) {
      var adaptationModel = this.__getAmbientAdaptationModel();
      var internalData = adaptationModel.internalData;
      if(internalData === null) {
        return null;
      }
      var filterContext = {
        modelAdapter: this,
        internalData: internalData,
        toExternal: true
      };

      // Find isProperty filters and convert their property equals', name and value to the external data space.
      return internalFilter
        .visit(__flattenTree)
        .visit(__transformFilter.bind(filterContext));
    },

    /**
     * Converts a given map of property names to values and/or cells into
     * a map of property names to cells on the opposite model.
     *
     * Properties which are mapped to visual roles which are not currently valid
     * (have no defined strategy), are skipped.
     * Properties whose values are not known to the current strategy are skipped.
     *
     * @param {Object.<string, *|pentaho.data.ICell>} originalValuesMap - The map of property names to
     * values and/or cells.
     * @param {boolean} toExternal If true converts from internal to external properties,
     * the other way around if false.
     *
     * @return {Object.<string, pentaho.data.ICell>} The corresponding map of internal or external property names
     *   to cells.
     *
     * @private
     */
    __convertValuesMap: function(originalValuesMap, toExternal) {
      var ambientRoleInfoMap = this.__getAmbientAdaptationModel().roleInfoMap;
      var convertedValuesMap = Object.create(null);
      var originModel = toExternal ? this.model : this;

      originModel.$type.eachVisualRole(function(propType) {
        var mapping = originModel.get(propType);
        var strategy;

        if(mapping.hasFields && (strategy = ambientRoleInfoMap[propType.name].strategy) !== null) {
          var fieldValues = __collectFieldValues(mapping, originalValuesMap);
          if(fieldValues !== null) {
            var fieldCells = toExternal ? strategy.invert(fieldValues) : strategy.map(fieldValues);
            if(fieldCells == null) {
              throw error.argInvalid("originalValuesMap", "Unable to convert values.");
            }

            var fieldNames = toExternal ? strategy.inputFieldNames : strategy.outputFieldNames;

            fieldCells.forEach(function(fieldCell, index) {
              if(fieldCell !== undefined) {
                convertedValuesMap[fieldNames[index]] = fieldCell;
              }
            });
          }
        }
      });

      return convertedValuesMap;
    },
    // endregion

    $type: /** @lends pentaho.visual.base.ModelAdapterType# */{

      id: module.id,
      isAbstract: true,

      /** @inheritDoc */
      get visualKeyType() {
        var modelType = this.get("model").valueType;
        return modelType.visualKeyType;
      },

      props: [
        {
          /**
           * Gets or sets the internal model.
           *
           * This property can only be specified at construction time.
           * When not specified,
           * an empty model of the property's [valueType]{@link pentaho.type.PropertyType#valueType}
           * is attempted to be created.
           *
           * @name model
           * @memberOf pentaho.visual.base.ModelAdapter#
           * @type {pentaho.visual.base.Model}
           */
          name: "model",
          valueType: Model,
          isBoundary: true,
          isRequired: true,
          isReadOnly: true,
          // Create a new instance each time.
          defaultValue: function() { return {}; }
        }
      ]
    }
  })
  .implement({
    $type: /** @lends pentaho.visual.base.ModelAdapterType# */{
      // Declare in a separate specification group so as to not be triggered by the above props specification.
      /** @inheritDoc */
      _configureProperties: function(propTypesSpec) {

        // `propTypeSpecs` is a copy of the original value.
        var normalizedPropTypeSpecs = this._normalizePropertiesSpec(propTypesSpec);

        // Expand the model property into the associated VR properties.

        // Index by property name.
        var propTypeInfoMap = Object.create(null);

        normalizedPropTypeSpecs.forEach(function(propTypeSpec, index) {
          if(!O.hasOwn(propTypeInfoMap, propTypeSpec.name)) {
            propTypeInfoMap[propTypeSpec.name] = {
              spec: propTypeSpec,
              index: index
            };
          }
        });

        var modelPropInfo = propTypeInfoMap.model;
        if(modelPropInfo != null) {
          // Process the model valueType, if specified.
          var internalModelTypeSpec = modelPropInfo.spec.valueType;
          if(internalModelTypeSpec != null) {
            var internalModelTypeBase = this.get("model").valueType;
            var internalModelType = typeLoader.resolveType(internalModelTypeSpec).type;

            if(internalModelTypeBase !== internalModelType &&
              internalModelType.isSubtypeOf(internalModelTypeBase)) {

              // Sync description and such.
              this.label = internalModelType.label;
              this.description = internalModelType.description;
              this.ordinal = internalModelType.ordinal;
              this.category = internalModelType.category;
              this.helpUrl = internalModelType.helpUrl;

              // Expand model.
              var newRolePropTypeSpecs = [];

              internalModelType.eachVisualRole(function(internalPropType) {
                var roleName = internalPropType.name;
                var internalPropTypeBase = internalModelTypeBase.get(roleName, /* sloppy: */true);
                if(internalPropType !== internalPropTypeBase) {
                  // New or something changed. So, need to create/override locally as well.

                  var propTypeSpec;
                  var rolePropInfo = O.getOwn(propTypeInfoMap, roleName, null);
                  if(rolePropInfo !== null) {
                    // Extend and replace existing spec.
                    propTypeSpec = Object.create(rolePropInfo.spec);
                    if(!this.has(roleName)) {
                      propTypeSpec.base = __externalPropertyType;
                    }

                    // Clear out, to not change indexes. Filtered at the end.
                    propTypesSpec[rolePropInfo.index] = null;
                  } else {
                    propTypeSpec = {
                      name: roleName,
                      base: this.has(roleName) ? undefined : __externalPropertyType
                    };
                  }

                  newRolePropTypeSpecs.push(propTypeSpec);
                }
              }, this);

              if(newRolePropTypeSpecs.length > 0) {
                // Insert new/changed role props after the model property.
                newRolePropTypeSpecs.unshift(modelPropInfo.index + 1, 0);
                normalizedPropTypeSpecs.splice.apply(normalizedPropTypeSpecs, newRolePropTypeSpecs);

                // Filter out nulls.
                propTypesSpec = normalizedPropTypeSpecs.filter(function(propTypeSpec) {
                  return propTypeSpec !== null;
                });
              }
            }
          }
        }

        this.base(propTypesSpec);
      }
    }
  })
  .localize({$type: bundle.structured.ModelAdapter})
  .configure({$type: module.config});

  return ModelAdapter;

  // region Filter conversion
  function __transformFilter(filter) {
    var equalsMap;

    switch(filter.kind) {
      case "true":
      case "false":
      case "or":
        return null;
      case "and":
        // Collect and replace all isEqual children.
        equalsMap = null;
        var operands = [];

        var filterOperands = filter.operands;
        var filterOperandsCount = filterOperands.count;
        for(var iOperand = 0; iOperand < filterOperandsCount; iOperand++) {
          var operandFilter = filterOperands.at(iOperand);

          if(operandFilter.kind === "isEqual") {
            if(equalsMap === null) {
              equalsMap = Object.create(null);
            }

            // The same property cannot have different values at the same time therefore return False
            if(equalsMap[operandFilter.property] !== undefined &&
              equalsMap[operandFilter.property] !== operandFilter.value) {
              return FalseFilter.instance;
            }

            equalsMap[operandFilter.property] = operandFilter.value;
          } else {
            // visit other filter types
            operands.push(operandFilter.visit(__transformFilter.bind(this)));
          }
        }

        // if isEqual operands found for And filter
        if(equalsMap !== null) {
          // Map internal/external values to external/internal values.
          equalsMap = this.modelAdapter.__convertValuesMap(equalsMap, this.toExternal);

          operands.push.apply(operands, Object.keys(equalsMap).map(function(propName) {
            return dataUtil.createFilterIsEqualFromCell(
              this.internalData,
              propName,
              equalsMap[propName]);
          }, this));
        }

        return new AndFilter({operands: operands});

      case "isEqual":
        equalsMap = {};
        equalsMap[filter.property] = filter.value;

        equalsMap = this.modelAdapter.__convertValuesMap(equalsMap, this.toExternal);

        filter = dataUtil.createFilterFromCellsMap(equalsMap, this.internalData);

        return filter !== null ? filter : TrueFilter.instance;
      default:
        throw error.argInvalid("filter", "Converting " + filter.kind + " filter is not supported.");
    }
  }

  function __flattenTree(f) {

    var kind;

    // eslint-disable-next-line default-case
    switch((kind = f.kind)) {
      case "and":
      case "or":

        var i = -1;
        var os = f.operands;
        var L = os.count;
        var osFlattened = [];

        while(++i < L) {
          // Recurse in pre-order
          var o = os.at(i).visit(__flattenTree);
          if(o.kind === kind) {
            osFlattened.push.apply(osFlattened, o.operands.toArray());
          } else {
            osFlattened.push(o);
          }
        }

        return new f.constructor({operands: osFlattened});
    }
  }

  function __collectFieldValues(mapping, valuesMap) {
    var fieldValues = null;

    var i = 0;
    var count = mapping.fields.count;
    mapping.fields.each(function(mappingField) {
      var name = mappingField.name;

      var value = valuesMap[name];
      if(value !== undefined) {

        // Accept cells as well.
        value = dataUtil.getCellValue(value);

        if(fieldValues == null) {
          fieldValues = new Array(count);
        }

        fieldValues[i] = value;
      }

      ++i;
    });

    return fieldValues;
  }
  // endregion

  function __hasSingleChange(propertyNames, propertyName) {
    return propertyNames.length === 1 && propertyNames[0] === propertyName;
  }

  // region Adaptation Model
  function __createAdaptationModel(modelAdapter, previousAdaptationModel, changeset) {

    // assert (previousAdaptationModel === null && changeset === null) ||
    //        (previousAdaptationModel !== null && changeset !== null)

    // Any changes?
    if(changeset !== null && previousAdaptationModel.transactionVersion === changeset.transactionVersion) {
      return previousAdaptationModel;
    }

    // May be null.
    var nextExternalData = modelAdapter.data;

    // If first time, calculate everything.
    // If external data has changed, recalculate everything, like if it were the first time.
    var hasDataChanged = previousAdaptationModel === null ||
      (previousAdaptationModel.externalData !== nextExternalData);

    var previousRoleInfoMap = hasDataChanged ? null : previousAdaptationModel.roleInfoMap;

    // If, for any VR, the selected method changes and it was or is not an identity method,
    // then a new data set needs to be determined and all strategies need to be recreated.

    var nextRoleInfoMap = Object.create(null);
    var nextRoleInfoList = [];

    var forceNewInternalData = false;

    modelAdapter.$type.eachVisualRole(function(propType) {

      var propName = propType.name;

      // If first time or data changed, a new role info is created.
      // Otherwise, try to reuse the existing method/strategy.
      // Be sure to clone the existing object, because, at a minimum, its transactionVersion will be updated,
      // and this can be from the committed adaptation model.
      var nextRoleInfo = previousRoleInfoMap === null
        ? {transactionVersion: 0, strategyApplication: null, strategy: null}
        : O.cloneShallow(previousRoleInfoMap[propName]);

      // Only re-evaluate the visual role if it has changed since previousAdaptationModel was created.
      var change = changeset !== null ? changeset.getChange(propType) : null;
      if(change !== null && !change.hasChanges) {
        change = null;
      }

      // If no externalData (and data has not changed),
      // then all reused roleInfo already have null strategyApplication and strategy.
      if(nextExternalData !== null) {

        if(change === null || nextRoleInfo.transactionVersion < change.transactionVersion) {
          // Select the visual role strategies' methods.
          var nextStrategyApplication = propType.selectAdaptationStrategyOn(modelAdapter);

          var previousStrategyApplication = nextRoleInfo.strategyApplication;

          if(!__equalStrategyApplications(nextStrategyApplication, previousStrategyApplication)) {
            nextRoleInfo.strategyApplication = nextStrategyApplication; // Possibly null.
            nextRoleInfo.strategy = null;

            // If next or previous application add fields,
            // then the data table needs to be changed and new strategies need to be created.
            if(!forceNewInternalData) {
              if((previousStrategyApplication !== null && previousStrategyApplication.addsFields) ||
                (nextStrategyApplication !== null && nextStrategyApplication.addsFields)) {
                forceNewInternalData = true;
              }
            }
          }
        }
      }

      // In any case, update the version.
      if(change !== null) {
        nextRoleInfo.transactionVersion = change.transactionVersion;
      }

      nextRoleInfoMap[propName] = nextRoleInfo;
      nextRoleInfoList.push(nextRoleInfo);
    });

    var internalData = null;
    if(nextExternalData !== null) {
      if(!hasDataChanged && !forceNewInternalData) {
        internalData = previousAdaptationModel.internalData;
      }

      if(internalData === null) {
        internalData = forceNewInternalData ? new Table(nextExternalData.toSpec()) : nextExternalData;
      }
    }

    // Create missing strategies or recreate all strategies (if new internal data).
    if(internalData !== null) {
      nextRoleInfoList.forEach(function(roleInfo) {

        var strategyApplication = roleInfo.strategyApplication;

        if(strategyApplication !== null && (forceNewInternalData || roleInfo.strategy === null)) {
          roleInfo.strategy =
            strategyApplication.strategyType.apply(internalData, strategyApplication.externalFieldIndexes);
        }
      });
    }

    return {
      transactionVersion: changeset !== null ? changeset.transactionVersion : 0,
      externalData: nextExternalData,
      internalData: internalData,
      roleInfoMap: nextRoleInfoMap
    };
  }

  function __equalStrategyApplications(strategyApplicationA, strategyApplicationB) {

    if(strategyApplicationA === strategyApplicationB) {
      return true;
    }

    return strategyApplicationA != null && strategyApplicationB != null &&
      strategyApplicationA.internalMode.equals(strategyApplicationB.internalMode) &&
      strategyApplicationA.externalMode.equals(strategyApplicationB.externalMode) &&
      strategyApplicationA.strategyType === strategyApplicationB.strategyType &&

      strategyApplicationA.externalFieldIndexes.length === strategyApplicationB.externalFieldIndexes.length &&
      strategyApplicationA.externalFieldIndexes.every(function(fieldIndex, index) {
        return strategyApplicationB.externalFieldIndexes[index] === fieldIndex;
      });
  }

  // endregion
});
