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
  "pentaho/type/changes/ComplexChangeset",
  "pentaho/data/Table",
  "pentaho/util/object",
  "pentaho/i18n!model",
  // so that r.js sees otherwise invisible dependencies.
  "./abstractModel",
  "./model",
  "pentaho/data/filter/and",
  "pentaho/data/filter/isEqual"
], function(ComplexChangeset, Table, O, bundle) {

  "use strict";

  /**
   * @classDesc Manages the lifetime of the cached information of the mapping instances associated with a
   * target abstract model.
   * @memberOf pentaho.visual.base
   * @class
   * @extends pentaho.type.changes.ComplexChangeset
   * @private
   */
  var ModelAdapterChangeset = ComplexChangeset.extend({

    constructor: function(transaction, owner) {

      this.base(transaction, owner);

      // The transactionVersion properties of the owner's adaptation model are all at 0, as left since the last #_apply.
      this.__adaptationModel = owner.__adaptationModel;

      // Unfortunately, a new adaptation model is always created, even if it has the same data and
      // selection methods/adapters. This will set the initial transactionVersion properties at the several levels.
      // Subsequent calls reuse the adaptationModel, if nothing changed.
      this.__getAdaptationModel();
    },

    __getAdaptationModel: function() {
      return this.__adaptationModel = __createAdaptationModel(this.owner, this.__adaptationModel, this);
    },

    /** @inheritDoc */
    _apply: function(model) {

      this.base(model);

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
    }
  });

  return [
    "./abstractModel",
    "./model",
    "pentaho/data/filter/and",
    "pentaho/data/filter/isEqual",
    function(AbstractModel, Model, AndFilter, IsEqualFilter) {

      var context = this;

      // NOTE: these will be kept private until it is decided between the adapter and the viz concept.

      /**
       * @name pentaho.visual.base.ModelAdapter.Type
       * @class
       * @extends pentaho.visual.base.Model.Type
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
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.base.ModelAdapter>} pentaho/visual/base/modelAdapter
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

          // assert this.model !== null (has a default value)

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
          // 2. Registering a listener has advantages over overriding _onChangeWill, as the transaction manages
          // to only call a listener if things changed below it since the last time it was called.
          // On the other hand, this will cause the commitWill evaluation phase to always have to execute its
          // lengthier path.
          this.on("will:change", this.__onChangeWillHandler.bind(this));
        },

        /** @inheritDoc */
        _createChangeset: function(txn) {
          return new ModelAdapterChangeset(txn, this);
        },

        // region Adaptation
        __adaptationModel: null,

        /**
         * Gets the *ambient* adaptation model of this model adapter.
         *
         * When a transaction is current and this model adapter has changes,
         * this method obtains the adaptation model of the corresponding changeset,
         * which will be up to date with the changes made within the transaction.
         * Otherwise, this method returns the _committed_ adaptation model of the model adapter.
         *
         * @return {!IAdaptationModel} The adaptation model.
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
         * @return {!IAdaptationModel} The adaptation model.
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
         * @return {pentaho.visual.role.adaptation.IAdapter} The visual role adapter, if one is established;
         * `null`, otherwise.
         *
         * @private
         *
         * @see pentaho.visual.role.ExternalMapping#mode
         */
        __getAmbientRoleMode: function(roleName) {
          var methodSelection = this.__getAmbientAdaptationModel().roleInfoMap[roleName].methodSelection;
          return methodSelection && methodSelection.externalMode;
        },

        /**
         * Gets the ambient adapter of a visual role, given its name.
         *
         * @param {string} roleName - The visual role name.
         *
         * @return {pentaho.visual.role.Mode} The operation mode, if one is established; `null`, otherwise.
         *
         * @private
         *
         * @see pentaho.visual.role.ExternalMapping#adapter
         */
        __getAmbientRoleAdapter: function(roleName) {
          return this.__getAmbientAdaptationModel().roleInfoMap[roleName].adapter;
        },

        /**
         * Event handler for the `will:change` event.
         *
         * Handles the special case of when only the `selectionFilter` property has changed
         * by then delegating to the lighter weight `__updateInternalSelection` method.
         * Otherwise, delegates to the full synchronization method, `__updateInternalModel`.
         *
         * @param {!pentaho.type.events.WillChange} event - The will change event.
         * @private
         */
        __onChangeWillHandler: function(event) {
          var propertyNames = event.changeset.propertyNames;
          if(propertyNames.length === 1 && propertyNames[0] === "selectionFilter") {
            this.__updateInternalSelection();
          } else {
            this.__updateInternalModel();
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
          context.enterChange().using(function(scope) {

            internalModel.data = adaptationModel.internalData;
            internalModel.selectionFilter = internalSelectionFilter;

            Object.keys(roleInfoMap).forEach(function(propName) {

              var roleInfo = roleInfoMap[propName];
              var methodSelection = roleInfo.methodSelection;

              var internalMapping = internalModel.get(propName);

              internalMapping.modeFixed = methodSelection && methodSelection.internalMode;
              internalMapping.fields = methodSelection !== null ? __getAdapterOutputFieldNames(roleInfo.adapter) : [];
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

          this.model.selectionFilter = this.__calcInternalSelectionFilter();
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
            return this.__convertFilterToInternal(externalSelectionFilter);
          }

          return null;
        },

        /**
         * Converts an external filter into a corresponding internal filter.
         *
         * @param {!pentaho.data.filter.Abstract} externalFilter - The external filter.
         * @return {!pentaho.data.filter.Abstract} The corresponding internal filter.
         * @private
         */
        __convertFilterToInternal: function(externalFilter) {
          // Find isProperty filters and convert their property equals', name and value to the internal data space.
          return externalFilter.visit(function(filter) {
            if(filter.kind === "and") {
              // Collect and replace all isProperty children

              var equalsMap = null;
              var otherOperands = [];

              filter.operands.each(function(operandFilter) {

                if(operandFilter.kind === "isEqual") {

                  if(equalsMap === null) {
                    equalsMap = Object.create(null);
                  }

                  equalsMap[operandFilter.property] = operandFilter.value;
                } else {
                  otherOperands.push(operandFilter);
                }
              });

              if(equalsMap === null) {
                return filter;
              }

              // Map external values to internal values.
              equalsMap = this.__convertValuesMapToInternal(equalsMap);

              otherOperands.push.apply(otherOperands, Object.keys(equalsMap).map(function(propName) {
                return new IsEqualFilter({
                  property: propName,
                  value: equalsMap[propName]
                });
              }));

              return new AndFilter({operands: otherOperands});
            }
          }.bind(this));
        },

        /**
         * Converts a given map of external property names to values and/or cells into
         * a map of internal property names to cells.
         *
         * External properties which are mapped to visual roles which are not currently valid (have no defined adapter),
         * are skipped.
         * External properties whose values are not known to the current adapter are skipped.
         *
         * @param {!Object.<string, any|pentaho.data.ICell>} externalValuesMap - The map of external property names to
         * values and/or cells.
         *
         * @return {!Object.<string, pentaho.data.ICell>} The corresponding map of internal property names to cells.
         *
         * @private
         */
        __convertValuesMapToInternal: function(externalValuesMap) {

          var ambientRoleInfoMap = this.__getAmbientAdaptationModel().roleInfoMap;
          var internalValuesMap = Object.create(null);

          this.$type.eachVisualRole(function(propType) {

            var externalMapping = this.get(propType);
            var adapter;

            if(externalMapping.hasFields && (adapter = ambientRoleInfoMap[propType.name].adapter) !== null) {

              var externalFieldValues = __collectExternalFieldValues(externalMapping, externalValuesMap);
              if(externalFieldValues !== null) {

                var internalFieldCells = adapter.adapt(externalFieldValues);
                if(internalFieldCells !== null) {

                  var internalData = adapter.data;
                  var outputFieldIndexes = adapter.outputFieldIndexes;

                  internalFieldCells.forEach(function(internalFieldCell, index) {
                    internalValuesMap[internalData.getColumnId(outputFieldIndexes[index])] = internalFieldCell;
                  });
                }
              }
            }
          }, this);

          return internalValuesMap;
        },
        // endregion

        $type: /** @lends pentaho.visual.base.ModelAdapter.Type# */{
          isAbstract: true,

          props: [
            {
              /**
               * Gets or sets the internal model.
               *
               * This property can only be specified at construction time.
               * When not specified,
               * an empty model of the property's [valueType]{@link pentaho.type.Property.Type#valueType}
               * is attempted to be created.
               *
               * @name model
               * @memberOf pentaho.visual.base.ModelAdapter#
               * @type {pentaho.visual.base.Model}
               */
              name: "model",
              valueType: Model,
              isRequired: true,
              isReadOnly: true,
              // Create a new instance each time.
              defaultValue: function() { return {}; }
            }
          ]
        }
      })
      .implement({$type: bundle.structured.modelAdapter});

      return ModelAdapter;
    }
  ];

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
    // then a new data set needs to be determined and all adapters need to be recreated.

    var nextRoleInfoMap = Object.create(null);
    var nextRoleInfoList = [];

    var areAllIdentityMethods = true;
    var forceNewInternalData = false;

    modelAdapter.$type.eachVisualRole(function(propType) {

      var propName = propType.name;

      // If first time or data changed, a new role info is created.
      // Otherwise, try to reuse the existing method/adapter.
      // Be sure to clone the existing object, because, at a minimum, its transactionVersion will be updated,
      // and this can be from the committed adaptation model.
      var nextRoleInfo = previousRoleInfoMap === null
        ? {transactionVersion: 0, methodSelection: null, adapter: null}
        : O.cloneShallow(previousRoleInfoMap[propName]);

      // Only re-evaluate the visual role if it has changed since previousAdaptationModel was created.
      var change = changeset !== null ? changeset.getChange(propType) : null;

      // If no externalData (and data has not changed),
      // then all reused roleInfo already have null methodSelection and adapter.
      if(nextExternalData !== null) {

        if(change === null || nextRoleInfo.transactionVersion < change.transactionVersion) {
          // Select the visual role strategies' methods.
          var nextMethodSelection = propType.selectAdaptationStrategyMethodOn(modelAdapter);

          var oldMethodSelection = nextRoleInfo.methodSelection;

          if(!__areEqualMethodSelections(nextMethodSelection, oldMethodSelection)) {
            nextRoleInfo.methodSelection = nextMethodSelection; // Possibly null.
            nextRoleInfo.adapter = null;

            // If next or previous method was not identity,
            // then the data table needs to be changed and new adapters need to be created.
            if(!forceNewInternalData) {
              if(__isMethodSelectionNotIdentity(oldMethodSelection) ||
                 __isMethodSelectionNotIdentity(nextMethodSelection)) {
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

      if(areAllIdentityMethods) {
        if(__isMethodSelectionNotIdentity(nextRoleInfo.methodSelection)) {
          areAllIdentityMethods = false;
        }
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
        internalData = new Table(nextExternalData.toSpec());
      }
    }

    // Create missing adapters or recreate all adapters (if new internal data).
    if(internalData !== null) {
      nextRoleInfoList.forEach(function(roleInfo) {
        var methodSelection = roleInfo.methodSelection;
        if(methodSelection !== null && (forceNewInternalData || roleInfo.adapter === null)) {
          roleInfo.adapter = methodSelection.apply(internalData);
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

  function __areEqualMethodSelections(methodSelectionA, methodSelectionB) {
    return (methodSelectionA === methodSelectionB) ||
      (methodSelectionA !== null && methodSelectionB !== null &&
        methodSelectionA.validMethodApplication.method.fullName !==
        methodSelectionB.validMethodApplication.method.fullName);
  }

  function __isMethodSelectionNotIdentity(methodSelection) {
    return methodSelection !== null && !methodSelection.validMethodApplication.method.isIdentity;
  }

  function __getAdapterOutputFieldNames(adapter) {

    var internalData = adapter.data;

    return adapter.outputFieldIndexes.map(function(outputFieldIndex) {
      return internalData.getColumnId(outputFieldIndex);
    });
  }
  // endregion

  // region Filter conversion
  function __collectExternalFieldValues(externalMapping, externalValuesMap) {

    var externalFieldValues = null;

    externalMapping.fields.each(function(mappingField) {

      var name = mappingField.name;

      var externalValue = externalValuesMap[name];
      if(externalValue !== undefined) {
        // Accept cells as well.
        if(externalValue !== null) {
          externalValue = externalValue.valueOf();
        }

        if(externalFieldValues == null) {
          externalFieldValues = [externalValue];
        } else {
          externalFieldValues.push(externalValue);
        }
      } else {
        // break on the first field which is not present.
        return false;
      }
    });

    return externalFieldValues;
  }
  // endregion
});
