/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/i18n!/pentaho/type/i18n/types",
  "pentaho/type/ValidationError",
  "pentaho/type/util",
  "pentaho/util/object",
  "pentaho/util/error"
], function(bundle, bundleTypes, ValidationError, typeUtil, O, error) {

  "use strict";

  return [
    "property",
    "./mode",
    "./strategies/base",
    "./mapping",
    "./strategies/identity",
    "./strategies/combine",
    "./strategies/tuple",
    function(__Property, Mode, BaseStrategy, Mapping, IdentityStrategy, CombineStrategy, TupleStrategy) {

      var context = this;

      var __modeType = Mode.type;
      var ListOfModeType = this.get([Mode]);
      var ListOfStrategyType = this.get([BaseStrategy]);

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
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.Property>} pentaho/visual/role/property
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

          valueType: Mapping,

          // Create a new Mapping each time.
          defaultValue: function() { return {}; },

          isRequired: true,

          /** @inheritDoc */
          _init: function(spec, keyArgs) {

            spec = this.base(spec, keyArgs) || spec;

            if(this.isRoot) {

              // Assume default values.
              // Anticipate setting `modes`, `strategies` and `isVisualKey`.

              var modes = spec.modes;
              if(modes != null) {
                this.__setModes(modes);
              } else {
                this.__setModes([{dataType: "string"}], /* isDefault: */true);
              }

              var strategies = spec.strategies;
              if(strategies != null) {
                this.__setStrategies(strategies);
              } else {
                this.__setStrategies([
                  new IdentityStrategy(),
                  new CombineStrategy(),
                  new TupleStrategy()
                ], /* isDefault: */true);
              }

              var isVisualKey = spec.isVisualKey;
              this.isVisualKey = isVisualKey != null ? isVisualKey : this.hasAnyCategoricalModes;

              // Prevent being applied again.
              spec = Object.create(spec);
              spec.modes = undefined;
              spec.isVisualKey = undefined;
            }

            return spec;
          },

          /**
           * Asserts that the type has no subtypes.
           *
           * @param {string} attributeName - The name of the attribute being set.
           *
           * @throws {pentaho.lang.OperationInvalidError} When setting and the visual role property
           * already has [subtypes]{@link pentaho.type.Type#hasDescendants}.
           *
           * @private
           */
          __assertNoDescendants: function(attributeName) {

            if(this.hasDescendants) {
              throw error.operInvalid(
                  bundle.get("errors.property.attributeLockedWhenTypeHasDescendants", [attributeName]));
            }
          },

          // region modes
          __modes: null,
          __isModesDefault: true,

          /**
           * Gets or sets the array of modes of operation supported by the visual role.
           *
           * A visual role that supports more than one mode of operation is said to be **modal**.
           *
           * Visual roles need to support at least one mode of operation.
           *
           * ### This attribute is *Monotonic*
           *
           * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
           *
           * In this case,
           * modes can only be added at the root property, at construction time, after which modes can only be removed.
           * To remove a mode, set the property to all of the current modes
           * (possibly other instances, but which are equal to the existing ones)
           * except the one to be removed.
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
           * If not specified at the root [visual.role.Property]{@link pentaho.visual.role.Property},
           * the `modes` attribute is initialized with a single, default mode,
           * having
           * a [dataType]{@link pentaho.visual.role.Mode#dataType} of [String]{@link pentaho.type.String} and
           * an [isContinuous]{@link pentaho.visual.role.Mode#isContinuous} of `false`.
           *
           * The returned list or its elements should not be modified.
           *
           * @type {!pentaho.type.List.<pentaho.visual.role.Mode>}
           *
           * @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
           * [subtypes]{@link pentaho.type.Type#hasDescendants}.
           */
          get modes() {
            return this.__modes;
          },

          set modes(values) {

            this.__assertNoDescendants("modes");

            if(values == null) return;

            this.__setModes(values, false);
          },

          __setModes: function(values, isDefault) {

            // Validation Rules
            // 1. Cannot change if already have descendants
            // 2. Cannot remove all modes.
            // 3. Cannot add new modes. Can only restrict, by removing some of the inherited/current modes.

            if(!Array.isArray(values)) values = [values];

            var modes = values.map(function(value) { return __modeType.to(value); });

            var modesNew;
            if(this.__modes === null) {
              modesNew = modes;
            } else {
              // Intersect with current list.
              modesNew = __modeType.__intersect(this.__modes.toArray(), modes);
            }

            if(!modesNew.length) {
              throw error.argInvalid("modes", bundle.structured.errors.property.noModes);
            }

            this.__modes = new ListOfModeType(modesNew, {isReadOnly: true});
            this.__isModesDefault = !!isDefault;
          },

          /**
           * Gets a value that indicates if the visual role has any categorical modes.
           *
           * @type {boolean}
           * @readOnly
           * @see pentaho.visual.role.Property.Type#hasAnyContinuousModes
           * @see pentaho.visual.role.Mode#isContinuous
           * @see pentaho.visual.role.Property.Type#modes
           */
          get hasAnyCategoricalModes() {
            var any = false;
            this.modes.each(function(mode) {
              if(!mode.isContinuous) {
                any = true;
                return false;
              }
            });
            return any;
          },

          /**
           * Gets a value that indicates if the visual role has any continuous modes.
           *
           * @type {boolean}
           * @readOnly
           * @see pentaho.visual.role.Property.Type#hasAnyCategoricalModes
           * @see pentaho.visual.role.Mode#isContinuous
           * @see pentaho.visual.role.Property.Type#modes
           */
          get hasAnyContinuousModes() {
            var any = false;
            this.modes.each(function(mode) {
              if(mode.isContinuous) {
                any = true;
                return false;
              }
            });
            return any;
          },
          // endregion

          // region strategies
          __strategies: null,
          __isStrategiesDefault: true,

          /**
           * Gets or sets the array of mapping strategies used by the visual role.
           *
           * Visual roles need to have at least one mapping strategy.
           *
           * When set to a {@link Nully} value, the set operation is ignored.
           *
           * If not specified at the root [visual.role.Property]{@link pentaho.visual.role.Property},
           * the `strategies` attribute is initialized with
           * an [Identity]{@link pentaho.visual.role.strategies.Identity} strategy,
           * a [Combine]{@link pentaho.visual.role.strategies.Combine} strategy and
           * a [Tuple]{@link pentaho.visual.role.strategies.Tuple} strategy,
           * in that order.
           *
           * The returned list or its elements should not be modified.
           *
           * @type {!pentaho.type.List.<pentaho.visual.role.strategies.Base>}
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

          // region isVisualKey
          __isVisualKey: false,

          /**
           * Gets or sets a value that indicates if the visual role is a key property of the visual space.
           *
           * When a visual role is a key visual role,
           * each distinct combination of key visual roles' values corresponds to
           * a distinct visual element being rendered.
           * When a visual model has no key visual roles,
           * then it is assumed that one visual element is rendered per input row of data.
           *
           * ### This attribute is *Monotonic*
           *
           * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
           *
           * In this case, once `true`, the value cannot be set to `false` anymore.
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
           * The default value of the root property is the value returned by
           * [hasAnyCategoricalModes]{@link pentaho.visual.role.Property.Type#hasAnyCategoricalModes}.
           *
           * @type {boolean}
           *
           * @throws {pentaho.lang.OperationInvalidError} When setting and the visual role property
           * already has [subtypes]{@link pentaho.type.Type#hasDescendants}.
           */
          get isVisualKey() {
            return this.__isVisualKey;
          },

          set isVisualKey(value) {

            this.__assertNoDescendants("isVisualKey");

            if(value == null) return;

            // Can only become true. Else ignore.
            if(value && !this.__isVisualKey) {
              this.__isVisualKey = true;
            }
          },

          // endregion

          dynamicAttributes: {
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
          },
          // endregion

          // region Validation

          // TODO: reimplement validateOn

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
           * 4. There can be no two mapping attributes with the same
           *    [name]{@link pentaho.visual.role.MappingAttribute#name}.
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
                      dataLevel: __modeType.domain.get(dataAttrLevel),
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

            var byKey = {};
            var i = -1;
            while(++i < L) {
              var roleAttr = roleAttrs.at(i);
              var key = roleAttr.name;
              if(O.hasOwn(byKey, key)) {
                var dataAttr = dataAttrs.get(roleAttr.name);
                var attributeDuplicateMessage = bundle.structured.errors.property.attributeDuplicate;
                var errorMessage = bundle.format(attributeDuplicateMessage, {
                  name: dataAttr,
                  role: this
                });

                addErrors(new ValidationError(errorMessage));
                continue;
              }

              byKey[key] = roleAttr;
            }
          },
          // endregion

          // region Serialization
          /** @inheritDoc */
          _fillSpecInContext: function(spec, keyArgs) {

            // The dynamic attributes: attributes.countMin/countMax/isRequired are handled
            // by the Type base class.

            var any = this.base(spec, keyArgs);

            var modes = O.getOwn(this, "__modes");
            if(modes && !this.__isModesDefault) {
              any = true;
              spec.modes = modes.toSpecInContext(keyArgs);
            }

            var strategies = O.getOwn(this, "__strategies");
            if(strategies && !this.__isStrategiesDefault) {
              any = true;
              spec.strategies = strategies.toSpecInContext(keyArgs);
            }

            // Only serialize if not the default value.
            var isVisualKey;
            if(this.isRoot) {
              isVisualKey = this.isVisualKey;
              if(isVisualKey !== this.hasAnyCategoricalModes) {
                any = true;
                spec.isVisualKey = isVisualKey;
              }
            } else if((isVisualKey = O.getOwn(this, "__isVisualKey")) != null) {
              any = true;
              spec.isVisualKey = isVisualKey;
            }

            return any;
          }
          // endregion
        }
      })
      .implement({$type: bundle.structured.property});

      return VisualRoleProperty;
    }
  ];

  function __castCount(v) {
    v = +v;
    if(isNaN(v) || v < 0) return; // undefined;
    return Math.floor(v);
  }
});
