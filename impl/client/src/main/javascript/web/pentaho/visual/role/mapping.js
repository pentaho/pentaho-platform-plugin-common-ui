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
  "./mappingAttribute",
  "./level",
  "pentaho/i18n!messages",
  "pentaho/type/util",
  "pentaho/util/object",
  "pentaho/util/error"
], function(module, mappingAttributeFactory, measurementLevelFactory, bundle, typeUtil, O, error) {

  "use strict";

  return function(context) {

    var Complex = context.get("complex");
    var MeasurementLevel = context.get(measurementLevelFactory);
    var ListLevel = context.get([measurementLevelFactory]);

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
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.Mapping>} pentaho/visual/role/mapping
     *
     * @classDesc The `Mapping` class represents the association between
     * a specific visual role and the data properties, here named _data attributes_,
     * of a visualization's current dataset.
     *
     * As a _type_, the mapping defines the capabilities of the visual role, through the following properties:
     *
     * 1. [levels]{@link pentaho.visual.role.Mapping.Type#levels}
     * 2. [dataType]{@link pentaho.visual.role.Mapping.Type#dataType}.
     *
     * As an _instance_, the mapping holds two pieces of information:
     *
     * 1. an optional, fixed [level of measurement]{@link pentaho.visual.role.Mapping#level}
     *    in which the visual role should operate
     * 2. a list of associations to data properties,
     *    [attributes]{@link pentaho.visual.role.Mapping#attributes},
     *    each of the type {@link pentaho.visual.role.MappingAttribute}.
     *
     * @description Creates a visual role mapping instance.
     * @constructor
     * @param {pentaho.visual.role.spec.IMapping} [spec] A visual role mapping specification.
     */
    var VisualRoleMapping = Complex.extend("pentaho.visual.role.Mapping", /** @lends pentaho.visual.role.Mapping# */{

      /**
       * Gets the visual model that owns this visual role mapping, if any, or `null`.
       *
       * @type {pentaho.visual.base.Model}
       *
       * @see pentaho.type.List#setOwnership
       */
      get model() {
        // TODO: Test it is a visual Model (cyclic dependency)
        return typeUtil._getFirstRefContainer(this);
      },

      /**
       * Gets the visual role property type in which the visual model contains this visual role mapping,
       * if any, or `null`.
       *
       * @type {pentaho.type.Property.Type}
       */
      get modelProperty() {
        // TODO: Test it is a visual Model (cyclic dependency)
        return typeUtil._getFirstRefProperty(this);
      },

      /**
       * Gets a value that indicates if the mapping has any attributes.
       *
       * @type {boolean}
       */
      get isMapped() {
        return this.attributes.count > 0;
      },

      /**
       * Gets the level of measurement on which the visual role will effectively be operating,
       * according to the mapping's current state.
       *
       * When [level]{@link pentaho.visual.role.Mapping#level} is not `null`,
       * that measurement level is returned.
       * Otherwise, the value of [levelAuto]{@link pentaho.visual.role.Mapping#levelAuto},
       * which can be `undefined`,
       * is returned.
       *
       * A visualization should respect the value of this property (when defined) and actually
       * operate the visual role in the corresponding mode.
       *
       * @type {string|undefined}
       * @readOnly
       */
      get levelEffective() {
        return this.level || this.levelAuto;
      },

      /**
       * Gets whether the visual role is considered a visual key according to the mapping's current state.
       *
       * If the type does not specify [isVisualKey]{@link pentaho.visual.role.Mapping.Type#isVisualKey} or
       * its evaluation results in a `null` value,
       * a default value is determined, by the following rules:
       *
       * 1. Return `false` if the mapping is not [mapped]{@link pentaho.visual.role.Mapping#isMapped};
       * 2. Return `true` if the mapping's [levelEffective]{@link pentaho.visual.role.Mapping#levelEffective}
       *    is qualitative;
       * 3. Return `true` if the mapping contains at least one attribute of a non-numeric type (like `date`).
       * 4. Otherwise, return `false`.
       *
       * @type {boolean}
       * @readOnly
       */
      get isVisualKey() {
        var value = this.type.isVisualKeyEval(this);
        if(value != null)
          return value;

        // Is the mapping [mapped]{@link pentaho.visual.role.Mapping#isMapped} and valid?
        var level = this.levelEffective;
        if(!level) return false;
        if(!MeasurementLevel.type.isQuantitative(level)) return true;

        // If a Date typed attribute is mapped, then default to being a visual key as well,
        // cause date aggregations are harder to make sense of (and only the non-default AVG would apply).
        return this.__isMappedToNonRatioAttributes;
      },

      /**
       * Gets a value that indicates if the visual role is mapped to at least one non-ratio measurement-level attribute.
       *
       * @type {boolean}
       * @private
       */
      get __isMappedToNonRatioAttributes() {
        var model = this.model;
        var data;
        var any = false;

        if(model && (data = model.data) && this.isMapped) {
          this.attributes.each(function(mappingAttr) {
            var attr = data.model.attributes.get(mappingAttr.name);
            if(attr && attr.type !== "number") {
              any = true;
              return false; // break;
            }
          });
        }

        return any;
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
       * @type {string|undefined}
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
         */
        var attrsMaxLevel = this.type.getAttributesMaxLevelOf(this);
        if(attrsMaxLevel) return this.type.getLevelCompatibleWith(attrsMaxLevel);
      },

      type: /** @lends pentaho.visual.role.Mapping.Type# */{
        id: module.id,

        props: [
          /**
           * Gets or sets the fixed measurement level on which the associated visual role is to operate.
           *
           * When `null` or unspecified,
           * the associated visual role operates in an automatically determined measurement level,
           * as returned by [levelAuto]{@link pentaho.visual.role.Mapping#levelAuto}.
           *
           * When specified,
           * it must be one of the measurement levels supported by the associated visual role,
           * as defined in [levels]{@link pentaho.visual.role.Mapping.Type#levels};
           * otherwise, the mapping is considered _invalid_.
           *
           * This JS property is syntax sugar for `this.getv("level")` and `this.set("level", value)`.
           *
           * @name pentaho.visual.role.Mapping#level
           * @type {string}
           *
           * @see pentaho.visual.role.spec.IMapping#level
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

        _init: function(spec, keyArgs) {

          this.base(spec, keyArgs);

          // Inherit / Clone the base levels list, including each element.
          var baseLevels = this.ancestor.levels;
          var ListType = baseLevels.constructor;
          this._levels = new ListType(baseLevels.toArray(function(elem) { return elem.clone(); }));
          this._levels.on("will:change", this._onLevelsChangeWill.bind(this));
        },

        // Anticipate extension of `levels`, relative to, at least, `dataType`.
        // Setting a more restricted dataType at the same time as restricting levels could fail.
        extend_order: ["levels"],

        // region levels
        // Defaults to all measurement levels
        _levels: new ListLevel(MeasurementLevel.type.domain, {isReadOnly: true}),

        /**
         * Gets or sets the array of measurement levels for which the mapped visual role
         * has a special mode of operation.
         *
         * A visual role that supports more than one measurement level is said to be **modal**.
         *
         * Visual roles need to support at least one measurement level.
         *
         * ### This attribute is *Monotonic*
         *
         * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
         *
         * In this case, a measurement level can be removed from a visual role mapping,
         * but one cannot be added.
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
         * a `levels` attribute which is list of all possible measurement levels.
         *
         * The returned list or its elements should not be modified.
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
          if(values != null) {
            this._levels.set(values, {noMove: true});
          }
        },

        _onLevelsChangeWill: function(event) {
          // Validation Rules
          // 1. Cannot change if already have descendants
          // 2. Cannot remove all measurement levels.
          // 3. Cannot add new levels. Can only restrict, by removing some of the inherited/current levels.
          // 4. The last qualitative measurement level cannot be removed if data type is qualitative only (e.g. string).
          //    > Never happens because when extending, levels is always applied first, and only then can dataType
          //      become qualitative-only. The error is always thrown in the dataType attribute.
          //    > If we would remove all qualitative measurement-levels while data type is already qual only,
          //      then we'd remove all measurement levels and rule 2. would be triggered first.
          if(event.changeset.hasChanges) {
            if(this.hasDescendants) {
              event.cancel(error.operInvalid(bundle.structured.errors.mapping.levelsLockedWhenTypeHasDescendants));
              return;
            }

            if(!this.levels.count) {
              event.cancel(error.argInvalid("levels", bundle.structured.errors.mapping.noLevels));
              return;
            }

            var changes = event.changeset.changes;
            var i = -1;
            var L = changes.length;
            while(++i < L) {
              var change = changes[i];
              if(change.type === "add") {
                event.cancel(error.operInvalid(bundle.structured.errors.mapping.levelsCannotBeAdded));
                return;
              }
            }

            var levelType = MeasurementLevel.type;
            this.levels.sort(levelType.compare.bind(levelType));
          }
        },

        /**
         * Gets a value that indicates if the visual role has
         * any qualitative levels.
         *
         * @type {boolean}
         * @readOnly
         */
        get anyLevelsQualitative() {
          var any = false;
          this.levels.each(function(level) {
            if(MeasurementLevel.type.isQualitative(level)) {
              any = true;
              return false;
            }
          });
          return any;
        },

        /**
         * Gets a value that indicates if the visual role has
         * any quantitative levels.
         *
         * @type {boolean}
         * @readOnly
         */
        get anyLevelsQuantitative() {
          var any = false;
          this.levels.each(function(level) {
            if(MeasurementLevel.type.isQuantitative(level)) {
              any = true;
              return false;
            }
          });
          return any;
        },
        // endregion

        // region dataType
        _dataType: context.get("value").type,

        /**
         * Gets or sets the type of data properties required by the visual role.
         *
         * ### This attribute is *Monotonic*
         *
         * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
         *
         * In this case, the attribute can only change to a
         * type that is a [subtype]{@link pentaho.type.Type#isSubtypeOf} of the attribute's current value;
         * otherwise, an error is thrown.
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
            if(MeasurementLevel.type.isTypeQualitativeOnly(newType)) {
              // Is there a qualitative measurement level?
              this.levels.each(function(level) {
                if(!MeasurementLevel.type.isQualitative(level))
                  throw error.argInvalid("dataType",
                      bundle.format(
                        bundle.structured.errors.mapping.dataTypeIncompatibleWithRoleLevel,
                        [newType, level]));
              }, this);
            }

            this._dataType = newType;
          }
        },
        // endregion

        dynamicAttributes: {
          /**
           * Evaluates the value of the `isVisualKey` attribute on a given mapping instance of this type.
           *
           * This method is used by the instance-level
           * [isVisualKey]{@link pentaho.visual.role.Mapping#isVisualKey} property and
           * is not intended to be used directly.
           *
           * @name isVisualKeyEval
           * @memberOf pentaho.visual.role.Mapping.Type#
           * @param {pentaho.visual.role.Mapping} mapping - The mapping instance.
           * @return {boolean} The evaluated value of the `isRequired` attribute.
           *
           * @ignore
           */

          /**
           * Gets or sets a value that indicates if visual roles of this type are visual keys.
           *
           * ### This attribute is *Dynamic*
           *
           * When a _dynamic_ attribute is set to a function,
           * it can evaluate to a different value for each mapping instance.
           *
           * When a _dynamic_ attribute is set to a value other than a function or a {@link Nully} value,
           * its value is the same for every mapping instance.
           *
           * ### This attribute is *Monotonic*
           *
           * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
           *
           * In this case, while a _visual role_'s `isVisualKey` attribute is `null`,
           * it can later be marked as being either `true` or `false`.
           * However, after a _visual role_'s `isVisualKey` is set or evaluates to either `true` or `false`,
           * its value can no longer change.
           *
           * Because this attribute is also _dynamic_,
           * the actual `isVisualKey` values are only known
           * when evaluated for specific mapping instances.
           * This behavior ensures that monotonic changes are deferred until evaluation.
           * No errors are thrown; non-monotonic changes simply don't take effect.
           *
           * ### This attribute is *Inherited*
           *
           * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
           *
           * The first set local value must respect the _monotonicity_ property with the inherited value.
           *
           * ### Other characteristics
           *
           * The value got by the attribute is the **last set local, value**, if any -
           * a function, a constant value or `undefined`, when unset.
           *
           * When set to a {@link Nully} value, the set operation is ignored.
           *
           * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
           * an error is thrown.
           *
           * The default (root) `isVisualKey` attribute value is `null`.
           *
           * When the result of evaluation is `null`,
           * the ultimate `isVisualKey` value is determined
           * by considering that [mapped]{@link pentaho.visual.role.Mapping#isMapped}
           * mappings with a _qualitative_ effective measurement level are the visual keys.
           *
           * @name isVisualKey
           * @memberOf pentaho.visual.role.Mapping.Type#
           * @type undefined | boolean | pentaho.type.DynamicAttribute.<pentaho.visual.role.Mapping, boolean>
           *
           * @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
           * [descendant]{@link pentaho.type.Type#hasDescendants} types.
           *
           * @see pentaho.visual.role.Mapping#isVisualKey
           */
          isVisualKey: {
            value: null,
            cast:  Boolean,
            combine: function(baseEval, localEval) {
              return function() {
                // localEval is skipped if base is true or false (not nully).
                var value = baseEval.call(this);
                return value != null ? value : localEval.call(this);
              };
            }
          }
        },

        /**
         * Determines the highest level of measurement supported by all of the data properties
         * in the mapping attributes of the given mapping.
         *
         * Any attributes that aren't defined in the visual model's current data should be ignored.
         * Defined attributes should be considered even if their data type is not compatible with the visual role's
         * supported data types.
         *
         * When there are no attributes or when all attributes are invalid, `undefined` is returned.
         *
         * This method should not care about whether the returned level of measurement
         * is one of the supported visual role's measurement levels.
         *
         * @param {!pentaho.visual.role.Mapping} mapping - The visual role mapping.
         *
         * @return {string|undefined} The highest level of measurement.
         */
        getAttributesMaxLevelOf: function(mapping) {
          var mappingAttrs = mapping.attributes;
          var data;
          var visualModel;
          var L;
          if(!(L = mappingAttrs.count) || !(visualModel = mapping.model) || !(data = visualModel.data))
            return;

          // First, find the lowest level of measurement in the mapped attributes.
          // The lowest of the levels in attributes that are also supported by the visual role.
          var levelLowest;

          var dataAttrs = data.model.attributes;
          var i = -1;
          var name;
          var dataAttr;
          var dataAttrLevel;
          while(++i < L) {
            var mappingAttr = mappingAttrs.at(i);
            if(!(name = mappingAttr.name) ||
                !(dataAttr = dataAttrs.get(name)) ||
                !(dataAttrLevel = dataAttr.level) ||
                !MeasurementLevel.type.domain.get(dataAttrLevel))
              return; // invalid

            if(!levelLowest || MeasurementLevel.type.compare(dataAttrLevel, levelLowest) < 0)
              levelLowest = dataAttrLevel;
          }

          return levelLowest;
        },

        /**
         * Determines the highest role level of measurement that is compatible
         * with a given data property level of measurement, if any.
         *
         * @param {string} attributeLevel - The level of measurement of the data property.
         * @param {pentaho.visual.role.MeasurementLevel[]} [allRoleLevels] - The role's levels of measurement.
         * Defaults to the visual role's levels.
         *
         * @return {string|undefined} The highest role level of measurement or
         * `undefined` if none.
         */
        getLevelCompatibleWith: function(attributeLevel, allRoleLevels) {
          var roleLevels = this.getLevelsCompatibleWith(attributeLevel, allRoleLevels);

          // Attribute Role is Compatible with the role's level of measurements?
          // If so, get the highest level from roleLevels.
          if(roleLevels.length)
            return roleLevels[roleLevels.length - 1];
        },

        /**
         * Chooses from `allRoleLevels` the levels of measurement that are compatible
         * with a given data property level of measurement.
         *
         * @param {string} attributeLevel - The level of measurement of the data property.
         * @param {pentaho.visual.role.MeasurementLevel[]} [allRoleLevels] - The role's levels of measurement.
         * Defaults to the visual role's levels.
         *
         * @return {string[]} The compatible role's levels of measurement.
         */
        getLevelsCompatibleWith: function(attributeLevel, allRoleLevels) {
          var isMaxQuant = MeasurementLevel.type.isQuantitative(attributeLevel);

          // if attributeLevel is Quantitative, any role levels are compatible.
          // if attributeLevel is Qualitative,  **only qualitative** role levels are compatible.

          var roleLevels = allRoleLevels || this.levels.toArray();
          if(!isMaxQuant) {
            roleLevels = roleLevels.filter(function(level) {
              return !MeasurementLevel.type.isQuantitative(level);
            });
          }

          // Already sorted from lowest to highest
          return roleLevels.map(function(level) { return level.value; });
        },

        // region Validation

        /**
         * Determines if the given visual role mapping is valid.
         *
         * Validity is determined as follows:
         *
         * 1. If the mapping has no owner visual model, it is invalid
         * 2. If the visual model has a `null` [data]{@link pentaho.visual.base.Model#data},
         *    then every data property in [attributes]{@link pentaho.visual.role.Mapping#attributes} is
         *    considered undefined and invalid
         * 3. Otherwise, if the visual model has a non-`null` [data]{@link pentaho.visual.base.Model#data},
         *    then each data property in [attributes]{@link pentaho.visual.role.Mapping#attributes}:
         *   1. Must be defined in `data`
         *   2. Must be compatible with the visual role, in terms of data type and measurement level
         * 4. The number of mapped [attributes]{@link pentaho.visual.role.Mapping#attributes} must satisfy
         *    the usual property cardinality constraints,
         *    like [isRequired]{@link pentaho.type.Property.Type#isRequired},
         *    [countMin]{@link pentaho.type.Property.Type#countMin} and
         *    [countMax]{@link pentaho.type.Property.Type#countMax}
         * 5. Mapped attributes must not be duplicates:
         *   1. If the mapping has a quantitative [levelEffective]{@link pentaho.visual.role.Mapping#levelEffective},
         *      then there can be no two mapping attributes with the same
         *      [name]{@link pentaho.visual.role.MappingAttribute#name} and
         *      [aggregation]{@link pentaho.visual.role.MappingAttribute#aggregation}
         *   2. Otherwise, there can be no two mapping attributes with the same
         *      [name]{@link pentaho.visual.role.MappingAttribute#name}
         *
         * @param {!pentaho.visual.role.Mapping} value - The value to validate.
         *
         * @return {?Array.<pentaho.type.ValidationError>} A non-empty array of `ValidationError` or `null`.
         * @protected
         */
        _validate: function(value) {
          var errors = this.base(value);
          if(!errors) {
            var addErrors = function(newErrors) {
              errors = typeUtil.combineErrors(errors, newErrors);
            };

            // No visual model or visual role property?
            if(!value.model || !value.modelProperty) {
              addErrors(new Error(bundle.structured.errors.mapping.noOwnerVisualModel));
            } else {
              // Data props are defined in data and of a type compatible with the role's dataType.
              this.__validateDataProps(value, addErrors);

              // Validate level is one of the visual role's levels.
              this.__validateLevel(value, addErrors);

              // Duplicate mapped attributes.
              // Only possible to validate when the rest of the stuff is valid.
              if(!errors) this.__validateDuplMappingAttrs(value, addErrors);
            }
          }

          return errors;
        },

        /**
         * Validates the level property and that the levels of attributes are compatible with
         * the visual role's levels.
         *
         * @param {!pentaho.visual.role.Mapping} mapping - The mapping to validate.
         * @param {function} addErrors - Called to add errors.
         * @private
         */
        __validateLevel: function(mapping, addErrors) {
          var allRoleLevels = this.levels;
          var level = mapping.get("level"); // want Simple value
          var roleLevels = null; // defaults to all role levels
          if(level) {
            // Fixed level.
            // Must be one of the role's levels.
            if(!allRoleLevels.has(level.key)) {
              addErrors(new Error(bundle.format(
                bundle.structured.errors.mapping.levelIsNotOneOfRoleLevels,
                {
                  role: mapping.modelProperty,
                  level: level,
                  roleLevels: ("'" + allRoleLevels.toArray().join("', '") + "'")
                })));
              return;
            }

            roleLevels = [level];
          } else {
            // Auto level.
            // Check there is a possible auto-level.
            roleLevels = allRoleLevels.toArray();
          }

          // Data Attributes, if any, must be compatible with level.
          var dataAttrLevel = this.getAttributesMaxLevelOf(mapping);
          if(dataAttrLevel) {
            var roleLevel = this.getLevelCompatibleWith(dataAttrLevel, roleLevels);
            if(!roleLevel) {
              addErrors(new Error(
                bundle.format(
                  bundle.structured.errors.mapping.attributesLevelNotCompatibleWithRoleLevels,
                  {
                    role: mapping.modelProperty,
                    // Try to provide a label for dataAttrLevel.
                    dataLevel: MeasurementLevel.type.domain.get(dataAttrLevel),
                    roleLevels: ("'" + allRoleLevels.toArray().join("', '") + "'")
                  })));
            }
          }
        },

        /**
         * Validates that every mapped attribute references a defined data property in the
         * data of the visual model and that its type is compatible with the visual role's `dataType`.
         *
         * Assumes the mapping is valid according to the base complex validation.
         *
         * @param {!pentaho.visual.role.Mapping} mapping - The mapping to validate.
         * @param {function} addErrors - Called to add errors.
         * @private
         */
        __validateDataProps: function(mapping, addErrors) {
          var data = mapping.model.data;
          var dataAttrs = data && data.model.attributes;

          var roleDataType = this.dataType;
          var rolePropType = mapping.modelProperty;

          var i = -1;
          var roleAttrs = mapping.attributes;
          var L = roleAttrs.count;
          while(++i < L) {
            var roleAttr = roleAttrs.at(i);
            var name = roleAttr.name;

            // Attribute with no definition?
            var dataAttr = dataAttrs && dataAttrs.get(name);
            if(!dataAttr) {
              addErrors(new Error(
                bundle.format(
                  bundle.structured.errors.mapping.attributeIsNotDefinedInVisualModelData,
                  {
                    name: name,
                    role: rolePropType
                  })));
              continue;
            }

            // Attribute of an incompatible data type.
            var dataAttrType = context.get(dataAttr.type).type;
            if(!dataAttrType.isSubtypeOf(roleDataType)) {
              addErrors(new Error(
                bundle.format(
                  bundle.structured.errors.mapping.attributeDataTypeNotSubtypeOfRoleType,
                  {
                    name: name,
                    dataType: dataAttrType,
                    role: rolePropType,
                    roleDataType: roleDataType
                  })));
            }
          }
        },

        /**
         * Validates that mapped attributes are not duplicates.
         *
         * @param {!pentaho.visual.role.Mapping} mapping - The mapping to validate.
         * @param {function} addErrors - Called to add errors.
         * @private
         */
        __validateDuplMappingAttrs: function(mapping, addErrors) {
          var levelEffective = mapping.levelEffective;
          if(!levelEffective) return;

          var roleAttrs = mapping.attributes;
          var L = roleAttrs.count;
          if(L <= 1) return;

          var rolePropType = mapping.modelProperty;
          var data = mapping.model.data;
          var dataAttrs = data && data.model.attributes;

          var isQuant = MeasurementLevel.type.isQuantitative(levelEffective);

          var byKey = {};
          var i = -1;
          while(++i < L) {
            var roleAttr = roleAttrs.at(i);
            var key = isQuant ? roleAttr.keyQuantitative : roleAttr.keyQualitative;
            if(O.hasOwn(byKey, key)) {
              var dataAttr = dataAttrs.get(roleAttr.name);
              var message;
              if(isQuant) {
                message = bundle.format(
                  bundle.structured.errors.mapping.attributeAndAggregationDuplicate,
                  {
                    name: dataAttr,
                    aggregation: roleAttr.get("aggregation"),
                    role: rolePropType
                  });

              } else {
                message = bundle.format(
                  bundle.structured.errors.mapping.attributeDuplicate,
                  {
                    name: dataAttr,
                    role: rolePropType
                  });
              }

              addErrors(new Error(message));
              continue;
            }

            byKey[key] = roleAttr;
          }
        }
        // endregion
      }
    })
    .implement({type: bundle.structured.mapping});

    return VisualRoleMapping;
  };
});
