/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "./level",
  "./mapping",
  "pentaho/i18n!messages",
  "pentaho/i18n!/pentaho/type/i18n/types",
  "pentaho/type/ValidationError",
  "pentaho/type/util",
  "pentaho/util/object",
  "pentaho/util/error"
], function(module, measurementLevelFactory, mappingFactory, bundle, bundleTypes, ValidationError, typeUtil, O, error) {

  "use strict";

  return function(context) {

    var __Property = context.get("property");
    var __levelType = context.get(measurementLevelFactory).type;
    var __ListLevelType = context.get([measurementLevelFactory]);

    /**
     * @name pentaho.visual.role.Property.Type
     * @class
     * @extends pentaho.type.Property.Type
     *
     * @classDesc The type class of {@link pentaho.visual.role.Property}.
     */

    /**
     * @name pentaho.visual.role.Property
     * @class
     * @extends pentaho.type.Property
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.Property>} pentaho/visual/role/property
     *
     * @classDesc The `Property` class represents a visual role of a visualization and defines its capabilities.
     *
     * The capabilities of the visual role are described by the following attributes:
     *
     * 1. [levels]{@link pentaho.visual.role.Property.Type#levels}
     * 2. [dataType]{@link pentaho.visual.role.Property.Type#dataType}.
     *
     * The [valueType]{@link pentaho.type.Property.Type#valueType} of a property of this type is
     * [Mapping]{@link pentaho.visual.role.Mapping} and
     * stores the association between the visual role and the data properties, here named _data attributes_,
     * of a visualization's current dataset.
     * The mapping holds two pieces of information:
     *
     * 1. an optional, fixed [level of measurement]{@link pentaho.visual.role.Mapping#level}
     *    in which the visual role should operate
     * 2. a list of associations to data properties,
     *    [attributes]{@link pentaho.visual.role.Mapping#attributes},
     *    each of the type {@link pentaho.visual.role.MappingAttribute}.
     *
     * @description This class was not designed to be constructed directly.
     */
    var VisualRoleProperty = __Property.extend(/** @lends pentaho.visual.role.Property# */{

      $type: /** @lends pentaho.visual.role.Property.Type# */{

        id: module.id,

        valueType: mappingFactory,

        // Create a new Mapping each time.
        defaultValue: function() { return {}; },

        isRequired: true,

        // Anticipate extension of `levels`, relative to, at least, `dataType`.
        // Setting a more restricted dataType at the same time as restricting levels could fail.
        extend_order: ["levels"],

        // region levels
        // Defaults to all measurement levels
        __levels: __levelType.domain,

        /**
         * Gets or sets the array of measurement levels for which the visual role
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
         * In this case, a measurement level can be removed from a visual role property,
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

         * The root [visual.role.Property]{@link pentaho.visual.role.Property} has
         * a `levels` attribute which is the list of all possible measurement levels.
         *
         * The returned array or its elements should not be modified.
         *
         * @type {!pentaho.type.List.<pentaho.visual.role.Level>}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
         * [subtypes]{@link pentaho.type.Type#hasDescendants}.
         */
        get levels() {
          return this.__levels;
        },

        set levels(values) {
          if(values == null) return;

          // Validation Rules
          // 1. Cannot change if already have descendants
          // 2. Cannot remove all measurement levels.
          // 3. Cannot add new levels. Can only restrict, by removing some of the inherited/current levels.
          // 4. The last qualitative measurement level cannot be removed if data type is qualitative only (e.g. string).
          //    > Never happens because when extending, levels is always applied first, and only then can dataType
          //      become qualitative-only. The error is always thrown in the dataType attribute.
          //    > If we would remove all qualitative measurement-levels while data type is already qual only,
          //      then we'd remove all measurement levels and rule 2. would be triggered first.

          if(this.hasDescendants)
            throw error.operInvalid(bundle.structured.errors.property.levelsLockedWhenTypeHasDescendants);

          if(!Array.isArray(values)) values = [values];

          var levels = values.map(function(value) { return this.to(value); }, __levelType);

          // Intersect with current list.
          var levelsNew = __levelType.__intersect(this.__levels.toArray(), levels);

          if(!levelsNew.length)
            throw error.argInvalid("levels", bundle.structured.errors.property.noLevels);

          levelsNew.sort(__levelType.compare.bind(__levelType));

          this.__levels = new __ListLevelType(levelsNew, {isReadOnly: true});
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
            if(__levelType.isQualitative(level)) {
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
            if(__levelType.isQuantitative(level)) {
              any = true;
              return false;
            }
          });
          return any;
        },
        // endregion

        // region dataType
        __dataType: context.get("value").type,

        /**
         * Gets or sets the value type of data properties required by the visual role.
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
         * When set and the visual role property already has [subtypes]{@link pentaho.type.Type#hasDescendants},
         * an error is thrown.
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * Otherwise, the set value is assumed to be an [spec.UTypeReference]{@link pentaho.type.spec.UTypeReference}
         * and is first resolved using [this.context.get]{@link pentaho.type.Context#get}.
         *
         * The root [visual.role.Property]{@link pentaho.visual.role.Property} has
         * a `dataType` attribute of [Value]{@link pentaho.type.Value}.
         *
         * @type {!pentaho.type.Value.Type}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the visual role property
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
          return this.__dataType;
        },

        set dataType(value) {

          if(this.hasDescendants)
            throw error.operInvalid(bundle.structured.errors.property.dataTypeLockedWhenTypeHasDescendants);

          if(value == null) return;

          var oldType = this.__dataType;
          var newType = context.get(value).type;
          if(newType !== oldType) {
            // Hierarchy/PreviousValue consistency
            if(oldType && !newType.isSubtypeOf(oldType))
              throw error.argInvalid("dataType", bundle.structured.errors.property.dataTypeNotSubtypeOfBaseType);

            // Is the new data type incompatible with existing measurement levels?
            if(__levelType.isTypeQualitativeOnly(newType)) {
              // Is there a qualitative measurement level?
              this.levels.each(function(level) {
                if(!__levelType.isQualitative(level))
                  throw error.argInvalid("dataType",
                      bundle.format(
                          bundle.structured.errors.property.dataTypeIncompatibleWithRoleLevel,
                          [newType, level]));
              });
            }

            this.__dataType = newType;
          }
        },
        // endregion

        dynamicAttributes: {
          /**
           * Gets or sets a value that indicates if visual roles of this type are visual keys.
           *
           * ### This attribute is *Dynamic*
           *
           * When a _dynamic_ attribute is set to a function,
           * it can evaluate to a different value for each given visualization model.
           *
           * When a _dynamic_ attribute is set to a value other than a function or a {@link Nully} value,
           * its value is the same for every visualization model.
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
           * @memberOf pentaho.visual.role.Property.Type#
           * @type {undefined | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>}
           *
           * @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
           * [descendant]{@link pentaho.type.Type#hasDescendants} types.
           *
           * @see pentaho.visual.role.Property.Type#isVisualKeyOn
           */
          isVisualKey: {
            value: null,
            cast: Boolean,
            combine: function(baseEval, localEval) {
              return function(propType) {
                // localEval is skipped if base is true or false (not nully).
                var value = baseEval.call(this, propType);
                return value != null ? value : localEval.call(this, propType);
              };
            }
          },

          // Exposed through IPropertyAttributes.isRequired
          // Additionally defines __attrsIsRequiredOn
          __attrsIsRequired: {
            value: false,
            cast: Boolean,
            group: "attributes",
            localName: "isRequired",
            combine: function(baseEval, localEval) {
              return function(propType) {
                // localEval is skipped if base is true.
                return baseEval.call(this, propType) || localEval.call(this, propType);
              };
            }
          },

          // Exposed through IPropertyAttributes.countMin
          // Additionally defines __attrsCountMinOn
          __attrsCountMin: {
            value: 0,
            cast: __castCount,
            group: "attributes",
            localName: "countMin",
            combine: function(baseEval, localEval) {
              return function(propType) {
                return Math.max(baseEval.call(this, propType), localEval.call(this, propType));
              };
            }
          },

          // Exposed through IPropertyAttributes.countMax
          // Additionally defines __attrsCountMaxOn
          __attrsCountMax: {
            value: Infinity,
            cast: __castCount,
            group: "attributes",
            localName: "countMax",
            combine: function(baseEval, localEval) {
              return function(propType) {
                return Math.min(baseEval.call(this, propType), localEval.call(this, propType));
              };
            }
          }
        },

        // region attributes
        /*
         * Actually implements IPropertyAttributes#countRangeOn.
         */
        __attrsCountRangeOn: function(model) {
          var isRequired = this.__attrsIsRequiredOn(model);
          var countMin = this.__attrsCountMinOn(model);
          var countMax = this.__attrsCountMaxOn(model);

          if(isRequired && countMin < 1) countMin = 1;

          if(countMax < countMin) countMax = countMin;

          return {min: countMin, max: countMax};
        },

        /**
         * Gets or sets the attributes metadata related with this visual role property.
         *
         * @type {!pentaho.visual.role.IPropertyAttributes}
         */
        get attributes() {
          var attrs = O.getOwn(this, "__attrs");
          if(!attrs) {

            var propType = this;

            this.__attrs = attrs = {
              get isRequired() {
                return propType.__attrsIsRequired;
              },
              set isRequired(value) {
                propType.__attrsIsRequired = value;
              },
              get countMin() {
                return propType.__attrsCountMin;
              },
              set countMin(value) {
                propType.__attrsCountMin = value;
              },
              get countMax() {
                return propType.__attrsCountMax;
              },
              set countMax(value) {
                propType.__attrsCountMax = value;
              },
              countRangeOn: function(model) {
                return propType.__attrsCountRangeOn(model);
              }
            };
          }
          return attrs;
        },

        set attributes(value) {

          if(!value) return;

          var attrs = this.attributes;

          if("isRequired" in value) attrs.isRequired = value.isRequired;
          if("countMin" in value) attrs.countMin = value.countMin;
          if("countMax" in value) attrs.countMax = value.countMax;
        }
        // endregion
      }
    }).implement({
      $type: /** @lends pentaho.visual.role.Property.Type# */{
        /**
         * Determines the level of measurement on which this visual role will effectively be operating,
         * on the given visualization model, according to the mapping's current state.
         *
         * When [Mapping#level]{@link pentaho.visual.role.Mapping#level} is not `null`,
         * that measurement level is returned.
         * Otherwise, the result of calling [levelAutoOn]{@link pentaho.visual.role.Property#levelAutoOn},
         * which can be `undefined`,
         * is returned.
         *
         * A visualization should respect the value of this property (when defined) and actually
         * operate the visual role in the corresponding mode.
         *
         * @param {!pentaho.visual.base.Model} model - The visualization model.
         * @return {string|undefined} The effective level of measurement.
         */
        levelEffectiveOn: function(model) {

          var mapping = model.get(this);
          return mapping.level || this.levelAutoOn(model);
        },

        /**
         * Determines the automatic measurement level of this visual role on the given visualization model,
         * according to the mapping's current state.
         *
         * The automatic measurement level is determined based on the visual role's
         * [levels]{@link pentaho.type.role.Property.Type#levels}
         * and the measurement levels supported by the currently mapped data properties.
         *
         * When the current mapping is empty (has no mapped attributes), `undefined` is returned.
         *
         * When the current mapping is invalid, `undefined` is returned.
         *
         * When more than one measurement level could be used,
         * the _highest_ measurement level is preferred.
         *
         * @param {!pentaho.visual.base.Model} model - The visualization model.
         * @return {string|undefined} The automatic level of measurement.
         */
        levelAutoOn: function(model) {

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
          var attrsMaxLevel = this.getAttributesMaxLevelOf(model);
          if(attrsMaxLevel)
            return this.getLevelCompatibleWith(attrsMaxLevel);
        },

        /**
         * Determines the highest level of measurement supported by all of the data attributes of
         * the current mapping of the given visualization model.
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
         * @param {!pentaho.visual.base.Model} model - The visualization model.
         *
         * @return {string|undefined} The highest level of measurement.
         */
        getAttributesMaxLevelOf: function(model) {

          var mapping = model.get(this);
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
                !__levelType.domain.get(dataAttrLevel))
              return; // invalid

            if(!levelLowest || __levelType.compare(dataAttrLevel, levelLowest) < 0)
              levelLowest = dataAttrLevel;
          }

          return levelLowest;
        },

        /**
         * Determines the highest role level of measurement that is compatible
         * with a given data property level of measurement, if any.
         *
         * @param {string} attributeLevel - The level of measurement of the data property.
         * @param {pentaho.visual.role.Level[]} [allRoleLevels] - The role's levels of measurement.
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
         * @param {pentaho.visual.role.Level[]} [allRoleLevels] - The role's levels of measurement.
         * Defaults to the visual role's levels.
         *
         * @return {string[]} The compatible role's levels of measurement.
         */
        getLevelsCompatibleWith: function(attributeLevel, allRoleLevels) {

          var isMaxQuant = __levelType.isQuantitative(attributeLevel);

          // if attributeLevel is Quantitative, any role levels are compatible.
          // if attributeLevel is Qualitative,  **only qualitative** role levels are compatible.

          var roleLevels = allRoleLevels || this.levels.toArray();
          if(!isMaxQuant) {
            roleLevels = roleLevels.filter(function(level) {
              return !__levelType.isQuantitative(level);
            });
          }

          // Already sorted from lowest to highest
          return roleLevels.map(function(level) { return level.value; });
        },

        // overrides the method automatically generated by dynamicAttributes
        /**
         * Evaluates the value of the `isVisualKey` attribute of this property type
         * on a given visualization model.
         *
         * If [isVisualKey]{@link pentaho.visual.role.Property.Type#isVisualKey} is not specified or
         * its evaluation results in a `null` value, a default value is determined, by the following rules:
         *
         * 1. Return `false` if the current mapping is not [mapped]{@link pentaho.visual.role.Mapping#isMapped};
         * 2. Return `true` if the
         *    [effective level of measurement]{@link pentaho.visual.role.Property.Type#levelEffectiveOn}
         *    is qualitative;
         * 3. Return `true` if the current mapping contains at least one attribute of a non-numeric type (like `date`).
         * 4. Otherwise, return `false`.
         *
         * @param {!pentaho.visual.base.Model} model - The visualization model.
         * @return {boolean} The evaluated value of the `isVisualKey` attribute.
         */
        isVisualKeyOn: function(model) {

          var value = this.base(model);
          if(value != null)
            return value;

          // Is the mapping mapped and valid?
          var level = this.levelEffectiveOn(model);
          if(!level) return false;
          if(!__levelType.isQuantitative(level)) return true;

          // If a Date typed attribute is mapped, then default to being a visual key as well,
          // cause date aggregations are harder to make sense of (and only the non-default AVG would apply).
          return this.__isMappedToNonRatioAttributesOn(model);
        },

        /**
         * Gets a value that indicates if this visual role is mapped to at least one non-ratio
         * measurement-level attribute in the given visualization model.
         *
         * @param {!pentaho.visual.base.Model} model - The visualization model.
         * @return {boolean} `true` if it is mapped; `false`, otherwise.
         *
         * @private
         */
        __isMappedToNonRatioAttributesOn: function(model) {
          var data;
          var any = false;
          if((data = model.data)) {
            var mapping = model.get(this);
            if(mapping.isMapped) {
              mapping.attributes.each(function(mappingAttr) {
                var attr = data.model.attributes.get(mappingAttr.name);
                if(attr && attr.type !== "number") {
                  any = true;
                  return false; // break;
                }
              });
            }
          }

          return any;
        },

        // region Validation

        /**
         * Determines if this visual role is valid on the given visualization model.
         *
         * If generic property validation fails, those errors are returned.
         *
         * Otherwise, validity is further determined as follows:
         *
         * 1. If the visualization model has a `null` [data]{@link pentaho.visual.base.Model#data},
         *    then every data property in the current mapping's
         *    [attributes]{@link pentaho.visual.role.Mapping#attributes} is considered undefined and invalid
         * 2. Otherwise, if the visual model has a non-`null` [data]{@link pentaho.visual.base.Model#data},
         *    then each data property in the current mapping's
         *    [attributes]{@link pentaho.visual.role.Mapping#attributes}:
         *   1. Must be defined in `data`
         *   2. Must be compatible with the visual role, in terms of data type and measurement level
         * 3. The number of currently mapped [attributes]{@link pentaho.visual.role.Mapping#attributes} must satisfy
         *    the usual property cardinality constraints,
         *    like [isRequired]{@link pentaho.type.Property.Type#isRequired},
         *    [countMin]{@link pentaho.type.Property.Type#countMin} and
         *    [countMax]{@link pentaho.type.Property.Type#countMax}
         * 4. Currently mapped attributes must not be duplicates:
         *   1. If the mapping has a quantitative
         *      [effective level of measurement]{@link pentaho.visual.role.Property.Type#levelEffectiveOn},
         *      then there can be no two mapping attributes with the same
         *      [name]{@link pentaho.visual.role.MappingAttribute#name} and
         *      [aggregation]{@link pentaho.visual.role.MappingAttribute#aggregation}
         *   2. Otherwise, there can be no two mapping attributes with the same
         *      [name]{@link pentaho.visual.role.MappingAttribute#name}
         *
         * @param {!pentaho.visual.base.Model} model - The visualization model.
         *
         * @return {Array.<pentaho.type.ValidationError>} A non-empty array of `ValidationError` or `null`.
         */
        validateOn: function(model) {

          var errors = this.base(model);
          if(!errors) {
            var addErrors = function(newErrors) {
              errors = typeUtil.combineErrors(errors, newErrors);
            };

            var mapping = model.get(this);

            // Cardinality validation
            var range = this.__attrsCountRangeOn(model);
            var count = mapping.attributes.count;
            if(count < range.min) {
              addErrors(new ValidationError(
                  bundleTypes.get("errors.property.countOutOfRange", [
                    this.label + " " + mapping.$type.get("attributes").label,
                    count,
                    range.min,
                    range.max
                  ])));

            } else if(count > range.max) {
              addErrors(new ValidationError(
                  bundleTypes.get("errors.property.countOutOfRange", [
                    this.label + " " + mapping.$type.get("attributes").label,
                    count,
                    range.min,
                    range.max
                  ])));
            }

            if(!errors) {
              // Data props are defined in data and of a type compatible with the role's dataType.
              this.__validateDataPropsOn(model, mapping, addErrors);

              // Validate level is one of the visual role's levels.
              this.__validateLevelOn(model, mapping, addErrors);

              // Duplicate mapped attributes.
              // Only possible to validate when the rest of the stuff is valid.
              if(!errors) {
                this.__validateDuplMappingAttrsOn(model, mapping, addErrors);
              }
            }
          }

          return errors;
        },

        /**
         * Validates the level property and that the levels of attributes are compatible with
         * the visual role's levels.
         *
         * @param {!pentaho.visual.base.Model} model - The visualization model.
         * @param {!pentaho.visual.role.Mapping} mapping - The mapping.
         * @param {function} addErrors - Called to add errors.
         * @private
         */
        __validateLevelOn: function(model, mapping, addErrors) {

          var allRoleLevels = this.levels;
          var level = mapping.get("level"); // want Simple value
          var roleLevels = null; // defaults to all role levels
          if(level) {
            // Fixed level.
            // Must be one of the role's levels.
            if(!allRoleLevels.has(level.$key)) {
              addErrors(new ValidationError(bundle.format(
                bundle.structured.errors.property.levelIsNotOneOfRoleLevels,
                {
                  role: this,
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
          var dataAttrLevel = this.getAttributesMaxLevelOf(model);
          if(dataAttrLevel) {
            var roleLevel = this.getLevelCompatibleWith(dataAttrLevel, roleLevels);
            if(!roleLevel) {
              addErrors(new ValidationError(
                bundle.format(
                  bundle.structured.errors.property.attributesLevelNotCompatibleWithRoleLevels,
                  {
                    role: this,
                    // Try to provide a label for dataAttrLevel.
                    dataLevel: __levelType.domain.get(dataAttrLevel),
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
         * @param {!pentaho.visual.base.Model} model - The visualization model.
         * @param {!pentaho.visual.role.Mapping} mapping - The mapping.
         * @param {function} addErrors - Called to add errors.
         * @private
         */
        __validateDataPropsOn: function(model, mapping, addErrors) {

          var data = model.data;
          var dataAttrs = data && data.model.attributes;

          var roleDataType = this.dataType;

          var i = -1;
          var roleAttrs = mapping.attributes;
          var L = roleAttrs.count;
          while(++i < L) {
            var roleAttr = roleAttrs.at(i);
            var name = roleAttr.name;

            // Attribute with no definition?
            var dataAttr = dataAttrs && dataAttrs.get(name);
            if(!dataAttr) {
              addErrors(new ValidationError(
                bundle.format(
                  bundle.structured.errors.property.attributeIsNotDefinedInVisualModelData,
                  {
                    name: name,
                    role: this
                  })));
              continue;
            }

            // Attribute of an incompatible data type.
            var dataAttrType = context.get(dataAttr.type).type;
            if(!dataAttrType.isSubtypeOf(roleDataType)) {
              addErrors(new ValidationError(
                bundle.format(
                  bundle.structured.errors.property.attributeDataTypeNotSubtypeOfRoleType,
                  {
                    name: name,
                    dataType: dataAttrType,
                    role: this,
                    roleDataType: roleDataType
                  })));
            }
          }
        },

        /**
         * Validates that mapped attributes are not duplicates.
         *
         * @param {!pentaho.visual.base.Model} model - The visualization model.
         * @param {!pentaho.visual.role.Mapping} mapping - The mapping.
         * @param {function} addErrors - Called to add errors.
         * @private
         */
        __validateDuplMappingAttrsOn: function(model, mapping, addErrors) {

          var levelEffective = this.levelEffectiveOn(model);
          if(!levelEffective) return;

          var roleAttrs = mapping.attributes;
          var L = roleAttrs.count;
          if(L <= 1) return;

          var data = mapping.model.data;
          var dataAttrs = data && data.model.attributes;

          var isQuant = __levelType.isQuantitative(levelEffective);

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
                  bundle.structured.errors.property.attributeAndAggregationDuplicate,
                  {
                    name: dataAttr,
                    aggregation: roleAttr.get("aggregation"),
                    role: this
                  });

              } else {
                message = bundle.format(
                  bundle.structured.errors.property.attributeDuplicate,
                  {
                    name: dataAttr,
                    role: this
                  });
              }

              addErrors(new ValidationError(message));
              continue;
            }

            byKey[key] = roleAttr;
          }
        },
        // endregion

        // region Serialization
        /** @inheritDoc */
        _fillSpecInContext: function(spec, keyArgs) {

          // The dynamic attributes: isVisualKey and attributes.countMin/countMax/isRequired are handled
          // by the Type base class.

          var any = this.base(spec, keyArgs);

          var levels = O.getOwn(this, "__levels");
          if(levels) {
            any = true;
            spec.levels = levels.toSpecInContext(keyArgs);
          }

          var dataType = O.getOwn(this, "__dataType");
          if(dataType) {
            var dataTypeRef = dataType.toRefInContext(keyArgs);
            if(dataTypeRef !== "value") {
              any = true;
              spec.dataType = dataTypeRef;
            }
          }

          return any;
        }

        // endregion
      }
    })
    .implement({$type: bundle.structured.property});

    return VisualRoleProperty;
  };

  function __castCount(v) {
    v = +v;
    if(isNaN(v) || v < 0) return;// undefined;
    return Math.floor(v);
  }
});
