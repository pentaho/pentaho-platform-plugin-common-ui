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
  "pentaho/i18n!messages",
  "./mappingAttribute",
  "./level",
  "pentaho/type/value",
  "pentaho/type/list",
  "pentaho/type/number",
  "pentaho/type/date",
  "pentaho/type/valueHelper",
  "pentaho/util/object",
  "pentaho/util/error"
], function(module, bundle, mappingAttributeFactory, measurementLevelFactory,
    valueFactory, listFactory, numberFactory, dateFactory, valueHelper, O, error) {

  "use strict";

  return function(context) {

    var Complex = context.get("complex");

    var _mappingType;
    var List = context.get(listFactory);
    var MeasurementLevel = context.get(measurementLevelFactory);
    var ListLevel = context.get([measurementLevelFactory]);
    var PentahoNumber = context.get(numberFactory);
    var PentahoDate = context.get(dateFactory);

    /**
     * @name pentaho.visual.role.Mapping.Type
     * @class
     * @extends pentaho.type.Complex.Type
     *
     * @classDesc The type class of {@link pentaho.visual.role.Mapping}.
     */

    /**
     * @name pentaho.visual.role.Mapping
     * @class
     * @extends pentaho.type.Complex
     * @abstract
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.Mapping>} pentaho/visual/role/mapping
     *
     * @classDesc The `Mapping` class represents the association between
     * a specific visual role and the data properties, here named _attributes_,
     * of a visualization's current dataset.
     *
     * As a _type_, the mapping defines the capabilities of the visual role it maps to
     * through the attributes:
     *
     * 1. [levels]{@link pentaho.visual.role.Mapping.Type#levels}
     * 2. [dataType]{@link pentaho.visual.role.Mapping.Type#dataType}.
     *
     * As an _instance_, the mapping holds two pieces of information:
     *
     * 1. a fixed [level of measurement]{@link pentaho.visual.role.Mapping#level}
     *    in which the visual role should operate
     * 2. a list of associations to data properties,
     *    [attributes]{@link pentaho.visual.role.Mapping#attributes},
     *    each of type {@link pentaho.visual.role.MappingAttribute}.
     *
     * @description Creates a visual role mapping instance.
     * @constructor
     * @param {pentaho.visual.role.spec.UMapping} [spec] A visual role mapping specification.
     */
    var VisualRoleMapping = Complex.extend("pentaho.visual.role.Mapping", /** @lends pentaho.visual.role.Mapping# */{

      /**
       * Gets the level of measurement in which the visual role will effectively be operating on,
       * according to the mapping's current state.
       *
       * When {@link pentaho.visual.role.Mapping#level} is not `null`,
       * that measurement level is returned.
       * Otherwise,
       * the value of {@link pentaho.visual.role.Mapping#levelAuto},
       * which can be `undefined`, is returned.
       *
       * A visualization should respect the value of this property and actually
       * operate the visual role in the corresponding mode.
       *
       * @type {!pentaho.visual.role.MeasurementLevel|undefined}
       * @readOnly
       */
      get levelEffective() {
        return this.level || this.levelAuto;
      },

      /**
       * Gets the automatic measurement level.
       *
       * The automatic measurement level is determined based on the visual role's
       * [levels]{@link pentaho.type.role.Mapping.Type#levels}
       * and the measurement levels supported by the currently mapped data properties.
       *
       * When the mapping is empty (has no mapped attributes),
       * `undefined` is returned.
       *
       * When the mapping is invalid, `undefined` is returned.
       *
       * When more than one measurement level could be used,
       * the _highest_ measurement level is preferred.
       *
       * @type {!pentaho.visual.role.MeasurementLevel|undefined}
       * @readOnly
       */
      get levelAuto() {
        /* Example 1
         * ---------
         *
         * Attributes:          product|nominal, sales|quantitative
         * Lowest Attrs Level:  nominal
         *
         * Role Levels:         ordinal, quantitative
         *
         * Upgrade from nominal to ordinal is possible.
         * Auto Level:    nominal->ordinal
         *
         * Example 2
         * ---------
         *
         * Attributes:          quantity|quantitative, sales|quantitative
         * Lowest Attrs Level:  quantitative
         *
         * Role Levels:         ordinal
         *
         * Downgrade from quantitative to any qualitative is possible.
         * Auto Level:    quantitative->ordinal
         *
         */
        var levelLowest = this._getLowestLevelInAttrs();
        if(!levelLowest) return;

        var roleLevels = this._getRoleLevelsCompatibleWith();

        // Effective Attributes Role is Incompatible with the role's level of measurement?
        if(!roleLevels.length) return;

        // Get the highest level from roleLevels
        return roleLevels[roleLevels.length - 1];
      },

      _getRoleLevelsCompatibleWith: function(attributeLevel) {
        var isLowestQuant = MeasurementLevel.type.isQuantitative(attributeLevel);

        // if attributeLevel is Quantitative, any role levels are compatible.
        // if attributeLevel is Qualitative,  **only qualitative** role levels are compatible.

        var roleLevels = this.type.levels.toArray();
        if(!isLowestQuant) {
          roleLevels = roleLevels.filter(function(level) {
            return !MeasurementLevel.type.isQuantitative(level);
          });
        }

        // Already sorted from lowest to highest
        return roleLevels;
      },

      /**
       * Determines the lowest level of measurement of all the data properties
       * in mapping attributes.
       *
       * When no attributes or any attribute is invalid, `undefined` is returned.
       * The level of measurement compatibility is not considered for validity at this point.
       *
       * @return {!pentaho.visual.role.MeasurementLevel|undefined} The lowest level of measurement.
       */
      _getLowestLevelInAttrs: function() {
        var mappingAttrs = this.attributes;
        var data, visualModel, L;
        if(!(L = mappingAttrs.count) || !(visualModel = this.owner) || !(data = visualModel.data))
          return;

        // First, find the lowest level of measurement in the mapped attributes.
        // The lowest of the levels in attributes that are also supported by the visual role.
        var levelLowest;

        var roleDataType = this.type.dataType;
        var dataAttrs = data.model.attributes;
        var i = -1;
        var name, dataAttr, dataAttrLevel, dataAttrType;
        while(++i < L) {
          var mappingAttr = mappingAttrs.at(i);
          if(!(name = mappingAttr.name) ||
              !(dataAttr = dataAttrs.get(name)) ||
              !(dataAttrLevel = dataAttr.level) ||
              !(dataAttrType = context.get(dataAttr.type)) ||
              !dataAttrType.isSubtypeOf(roleDataType))
            return; // invalid

          if(!levelLowest || MeasurementLevel.type.compare(dataAttrLevel, levelLowest) < 0)
            levelLowest = dataAttrLevel;
        }

        return levelLowest;
      },

      // TODO: compatible level
      // TODO: #level when not null is one of possible levels

      /**
       * Determines if this visual role mapping is valid.
       *
       * Validity is determined as follows:
       *
       * 1. if the mapping has no owner visual model it is invalid
       * 2. if the visual model has a `null` [data]{@link pentaho.visual.base.Model#data},
       *    then every data property in [attributes]{@link pentaho.visual.role.Mapping#attributes} is
       *    considered undefined.
       * 2. otherwise, if the visual model has a non-`null` [data]{@link pentaho.visual.base.Model#data},
       *    then each data property in [attributes]{@link pentaho.visual.role.Mapping#attributes}:
       *   1. must be defined in `data`
       *   2. must be compatible with the visual role, in terms of data type and measurement level
       * 3. the number of mapped [attributes]{@link pentaho.visual.role.Mapping#attributes} must satisfy
       *    the usual property cardinality constraints,
       *    like [isRequired]{@link pentaho.type.Property.Type#isRequired},
       *    [countMin]{@link pentaho.type.Property.Type#countMin} and
       *    [countMax]{@link pentaho.type.Property.Type#countMax}.
       * 4. mapped attributes must not be duplicates:
       *   1. if the mapping has a quantitative [levelEffective]{@link pentaho.visual.role.Mapping#levelEffective},
       *      then there can be no two mapping attributes with the same
       *      [name]{@link pentaho.visual.role.MappingAttribute#name} and
       *      [aggregation]{@link pentaho.visual.role.MappingAttribute#aggregation}.
       *   2. otherwise, there can be no two mapping attributes with the same
       *      [name]{@link pentaho.visual.role.MappingAttribute#name}
       *
       * @return {?Array.<pentaho.type.ValidationError>} A non-empty array of `ValidationError` or `null`.
       */
      validate: function() {
        var errors = this.base();
        if(!errors) {
          var addErrors = function(newErrors) {
            errors = valueHelper.combineErrors(errors, newErrors);
          };

          // No visual model or visual role property?
          if(!this.owner || !this.ownerProperty) {
            addErrors(new Error(bundle.structured.errors.mapping.noOwnerVisualModel));
          } else {
            this._validateDataProps(addErrors);

            // Duplicate mapped attributes.
            // Only possible to validate when the rest of the stuff is valid.
            if(!errors) this._validateDuplMappingAttrs(addErrors);
          }
        }

        return errors;
      },

      /**
       * Validates that every mapped attribute references a defined data property in the
       * data of the visual model and that this attribute is compatible with the visual role.
       *
       * @param {function} addErrors - Called to add errors.
       * @private
       */
      _validateDataProps: function(addErrors) {
        var data = this.owner.data;
        var dataAttrs = data && data.model.attributes;

        var roleDataType = this.type.dataType;
        var roleLevels = this.type.levels;
        var rolePropType = this.ownerProperty;

        var i = -1;
        var roleAttrs = this.attributes;
        var L = roleAttrs.count;
        while(++i < L) {
          var roleAttr = roleAttrs.at(i);
          var name = roleAttr.name;

          // Invalid attribute mapping? Not our concern.
          if(!name) continue;

          // Attribute with no definition?
          var dataAttr = dataAttrs && dataAttrs.get(name);
          if(!dataAttr) {
            addErrors(new Error(
                bundle.format(
                    bundle.structured.errors.mapping.attributeIsNotDefinedInVisualModelData,
                    [name, rolePropType])));
            continue;
          }

          var dataAttrType = context.get(dataAttr.type);
          if(!dataAttrType.isSubtypeOf(roleDataType)) {
            addErrors(new Error(
                bundle.format(
                    bundle.structured.errors.mapping.attributeDataTypeNotSubtypeOfRoleType,
                    [name, dataAttrType, rolePropType, roleDataType])));
          }

          var dataAttrLevel = dataAttr.level;
          if(!roleLevels.has(dataAttrLevel)) {
            addErrors(new Error(
                bundle.format(
                    bundle.structured.errors.mapping.attributeLevelNotOneOfRoleLevels,
                    [
                      name,
                      // Try to provide a label for dataAttrLevel
                      MeasurementLevel.type.domain.get(dataAttrLevel) || dataAttrLevel,
                      rolePropType,
                      ("'" + roleLevels.toArray().join("', '") + "'")
                    ])));
          }
        }
      },

      /**
       * Validates that mapped attributes are not duplicates.
       *
       * @param {function} addErrors - Called to add errors.
       * @private
       */
      _validateDuplMappingAttrs: function(addErrors) {
        var levelEffective = this.levelEffective;
        if(!levelEffective) return;

        var roleAttrs = this.attributes;
        var L = roleAttrs.count;
        if(L <= 1) return;

        var rolePropType = this.ownerProperty;
        var data = this.owner.data;
        var dataAttrs = data && data.model.attributes;

        var isQuant = MeasurementLevel.type.isQuantitative(levelEffective);
        var keyFun = isQuant ? mappingAttrQuantitativeKey : mappingAttrQualitativeKey;

        var byKey = {};
        var i = -1;
        while(++i < L) {
          var roleAttr = roleAttrs.at(i);
          var key = keyFun(roleAttr);
          if(O.hasOwn(byKey, key)) {
            var dataAttr = dataAttrs.get(roleAttr.name);
            var message;
            if(isQuant) {
              message = bundle.format(
                  bundle.structured.errors.mapping.attributeAndAggregationDuplicate,
                  [dataAttr, roleAttr.get("aggregation"), rolePropType]);

            } else {
              message = bundle.format(
                  bundle.structured.errors.mapping.attributeDuplicate,
                  [dataAttr, rolePropType]);
            }

            addErrors(new Error(message));
            continue;
          }

          byKey[key] = roleAttr;
        }
      },

      type: /** @lends pentaho.visual.role.Mapping.Type# */{
        id: module.id,

        props: [
          /**
           * Gets or sets the fixed measurement level in which the visual role is to operate on.
           *
           * When `null`,
           * the visual role operates in the automatically determined measurement level,
           * as returned by {@link pentaho.visual.role.Mapping#levelAuto}.
           *
           * When specified,
           * it must be one of the measurement levels returned by
           * {@link pentaho.visual.role.Mapping.Type#levels},
           * or, otherwise, the mapping is considered _invalid_.
           *
           * This JS property is syntax sugar for `this.getv("level")` and `this.set("level", value)`.
           *
           * @name pentaho.visual.role.Mapping#level
           * @type {pentaho.visual.role.MeasurementLevel}
           */
          {name: "level", type: MeasurementLevel},

          /**
           * Gets or sets the attributes of the visual role mapping.
           *
           * This JS property is syntax sugar for
           * `this.getv("attributes")` and `this.set("attributes", value)`.
           *
           * @name pentaho.visual.role.Mapping#attributes
           * @type pentaho.type.List<pentaho.visual.role.MappingAttribute>
           */
          {name: "attributes", type: [mappingAttributeFactory]}
        ],

        //region levels
        _levels: new ListLevel(),

        /**
         * Gets or sets the array of measurement levels for which the mapped visual role
         * has a special mode of operation.
         *
         * A visual role that supports more than one measurement level is said to be **modal**.
         *
         * A non-abstract visual role needs to support at least one measurement level.
         *
         * ### This attribute is *Monotonic*
         *
         * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
         *
         * In this case, a measurement level can be added to a visual role mapping,
         * but a supported one cannot be removed.
         *
         * ### This attribute is *Inherited*
         *
         * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
         *
         * The first set local value must respect the _monotonicity_ property with the inherited value.
         *
         * ### Other characteristics
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * The root [visual.role.Mapping]{@link pentaho.visual.role.Mapping} has
         * a `levels` attribute which is an empty list.
         *
         * Do **NOT** modify the returned list or its elements in any way.
         *
         * @type {pentaho.type.List.<pentaho.visual.role.MeasurementLevel>}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
         * [subtypes]{@link pentaho.type.Type#hasDescendants}.
         *
         * @throws {pentaho.lang.ArgumentInvalidError} When adding a measurement level that is
         * quantitative and the visual role's [data type]{@link pentaho.visual.role.Mapping#dataType}
         * is inherently qualitative.
         */
        get levels() {
          return this._levels;
        },

        set levels(values) {
          if(this.hasDescendants)
            throw error.operInvalid(bundle.structured.errors.mapping.levelsLockedWhenTypeHasDescendants);

          // Don't let change the root mapping type.
          // Cannot clear (monotonicity).
          if(this === _mappingType || values == null) return;

          if(values.constructor === Object) {
            this._configureLevels(values);
          } else if(Array.isArray(values) || (values instanceof List)) {
            var levels = this._ensureLevelsOwn();

            // TODO: Because we don't yet expose independent lists' events,
            // we need to validate addition by hand and create a levels list to be added,
            // thus performing parsing for us...
            var addLevels = new ListLevel(values);

            // A quantitative measurement level cannot be added if data type is qualitative.
            var dataType = this.dataType;
            if(!dataType.isAbstract && !isDataTypeQuantitative(dataType)) {
              addLevels.each(function(addLevel) {
                // New level and quantitative?
                if(!levels.has(addLevel.key) && MeasurementLevel.type.isQuantitative(addLevel)) {
                  throw error.argInvalid("levels",
                      bundle.format(
                          bundle.structured.errors.mapping.dataTypeIncompatibleWithRoleLevel,
                          [this.dataType, addLevel]));
                }
              }, this);
            }

            levels.set(addLevels.toArray(), {noRemove: true, noMove: true});
            levels.sort(MeasurementLevel.type.compare);
          } else {
            throw error.argInvalidType("levels", ["Array", "pentaho.type.List", "Object"], typeof values);
          }
        },

        _ensureLevelsOwn: function() {
          var levels = O.getOwn(this, "_levels");
          if(!levels) {
            // Clone the base levels list, including each element.
            var baseLevels = this.ancestor.levels;
            var ListType = baseLevels.constructor;
            this._levels = levels = new ListType(baseLevels.toArray(function(elem) { return elem.clone(); }));
          }
          return levels;
        },

        _configureLevels: function(config) {
          var levels = this._ensureLevelsOwn();
          O.eachOwn(config, function(v, key) {
            var elem = levels.get(key);
            if(!elem) throw error.argInvalid("levels", "A level with key '" +  key + "' is not defined.");
            elem.configure(v);
          });
        },
        //endregion

        //region dataType
        _dataType: context.get(valueFactory).type,

        /**
         * Gets or sets the type of data properties required by the visual role.
         *
         * ### This attribute is *Monotonic*
         *
         * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
         *
         * In this case, the attribute can only change to a
         * type that is a [subtype]{@link pentaho.type.Type#isSubtypeOf} of the attribute's current value,
         * or, otherwise, an error is thrown.
         *
         * ### This attribute is *Inherited*
         *
         * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
         *
         * The first set local value must respect the _monotonicity_ property with the inherited value.
         *
         * ### Other characteristics
         *
         * When set and the visual role mapping already has [subtypes]{@link pentaho.type.Type#hasDescendants},
         * an error is thrown.
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * Otherwise, the set value is assumed to be an [spec.UTypeReference]{@link pentaho.type.spec.UTypeReference}
         * and is first resolved using [this.context.get]{@link pentaho.type.Context#get}.
         *
         * The root [visual.role.Property]{@link pentaho.visual.role.Property} has
         * a `dataType` attribute of [value]{@link pentaho.type.Value}.

         * @type {!pentaho.type.Value.Type}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the visual role mapping
         * already has [subtypes]{@link pentaho.type.Type#hasDescendants}.
         *
         * @throws {pentaho.lang.ArgumentInvalidError} When setting to a _value type_ that is not a subtype
         * of the current _value type_.
         *
         * @throws {pentaho.lang.ArgumentInvalidError} When setting to a _value type_ which is inherently
         * qualitative and the visual role supports quantitative measurement
         * [levels]{@link pentaho.visual.role.Mapping#levels}.
         */
        get dataType() {
          return this._dataType;
        },

        set dataType(value) {
          if(this.hasDescendants)
            throw error.operInvalid(bundle.structured.errors.mapping.dataTypeLockedWhenTypeHasDescendants);

          if(value == null) return;

          var oldType = this._dataType;
          var newType = context.get(value).type;
          if(newType !== oldType) {
            // Hierarchy/PreviousValue consistency
            if(oldType && !newType.isSubtypeOf(oldType))
              throw error.argInvalid("dataType", bundle.structured.errors.mapping.dataTypeNotSubtypeOfBaseType);

            // Is the new data type incompatible with existing measurement levels?
            if(!isDataTypeQuantitative(newType)) {
              // Is there a qualitative measurement level?
              this.levels.each(function(level) {
                if(!MeasurementLevel.type.isQualitative(level))
                  throw error.argInvalid("dataType",
                      bundle.format(
                        bundle.structured.errors.mapping.dataTypeIncompatibleWithRoleLevel,
                        [this.dataType, level]));
              }, this);
            }

            this._dataType = newType;
          }
        }
        //endregion
      }
    })
    .implement({type: bundle.structured.mapping});

    _mappingType = VisualRoleMapping.type;

    return VisualRoleMapping;

    function isDataTypeQuantitative(dataType) {
      return dataType.isSubtypeOf(PentahoNumber.type) || dataType.isSubtypeOf(PentahoDate.type);
    }

    function mappingAttrQuantitativeKey(roleAttr) {
      return roleAttr.name + "|" + roleAttr.aggregation;
    }

    function mappingAttrQualitativeKey(roleAttr) {
      return roleAttr.name;
    }
  };
});