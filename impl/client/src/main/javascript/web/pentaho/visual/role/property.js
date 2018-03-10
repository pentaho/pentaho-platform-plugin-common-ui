/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/type/util",
  "pentaho/type/ValidationError",
  "pentaho/util/object",
  "pentaho/util/error",

  // so that r.js sees otherwise invisible dependencies.
  "./baseProperty",
  "./mapping",
  "./mode"
], function(bundle, typeUtil, ValidationError, O, error) {

  "use strict";

  return [
    "./baseProperty",
    "./mapping",
    "./mode",
    function(BaseProperty, Mapping, Mode) {

      var context = this;

      var __modeType = Mode.type;
      var ListOfModeType = this.get([Mode]);

      /**
       * @name pentaho.visual.role.Property.Type
       * @class
       * @extends pentaho.visual.role.BaseProperty.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.Property}.
       */

      /**
       * @name pentaho.visual.role.Property
       * @class
       * @extends pentaho.visual.role.BaseProperty
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.Property>} pentaho/visual/role/property
       *
       * @classDesc The `Property` class represents a visual role of a visualization and defines its capabilities.
       *
       * A visual role is described by:
       *
       * 1. [modes]{@link pentaho.visual.role.Property.Type#modes}
       * 2. [isVisualKey]{@link pentaho.visual.role.Property.Type#isVisualKey}.
       *
       * @description This class was not designed to be constructed directly.
       */
      var VisualRoleProperty = BaseProperty.extend(/** @lends pentaho.visual.role.Property# */{

        $type: /** @lends pentaho.visual.role.Property.Type# */{

          valueType: Mapping,

          // Setting the value type resets the inherited defaultValue.
          defaultValue: function() { return {}; },

          // It's limited to 1 if it has no list modes.
          __fieldsCountMax: function(propType) {
            var mapping = this.get(propType);
            var mode = mapping.mode;
            return (mode !== null ? mode.dataType.isList : propType.hasAnyListModes) ? Infinity : 1;
          },

          /** @inheritDoc */
          _init: function(spec, keyArgs) {

            spec = this.base(spec, keyArgs) || spec;

            if(!this.declaringType || this.isRoot) {

              // Assume default values.
              // Anticipate setting `modes` and `isVisualKey`.

              var modes = spec.modes;
              if(modes != null) {
                this.__setModes(modes);
              } else if(this.isRoot && this.__modes === null) {
                this.__setModes([{dataType: "string"}], /* isDefault: */true);
              }

              var isVisualKey = spec.isVisualKey;
              if(isVisualKey != null) {
                this.isVisualKey = isVisualKey;
              } else if(this.isRoot && this.__isVisualKey === null) {
                this.isVisualKey = this.hasAnyCategoricalModes;
              }

              // Prevent being applied again.
              spec = Object.create(spec);
              spec.modes = undefined;
              spec.isVisualKey = undefined;
            }

            return spec;
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
           *
           * @override
           */
          get modes() {
            return this.__modes;
          },

          set modes(values) {

            this._assertNoSubtypesAttribute("modes");

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
           * Determines the effective operation mode of the visual role on the given visual model.
           *
           * When the associated mapping has a specified [modeFixed]{@link pentaho.visual.role.Mapping#modeFixed}
           * (whether or not it is applicable), then that operation mode is used.
           *
           * Otherwise, the first operation mode in [modes]{@link pentaho.visual.role.Property.Type#modes}
           * which is applicable to the mapping's fields is used.
           * If there are no applicable modes, `null` is returned.
           *
           * @param {!pentaho.visual.base.Model} model - The visual model.
           *
           * @return {pentaho.visual.role.Mode} The effective operation mode, if one exists; `null` if not.
           *
           * @see pentaho.visual.role.Mapping#modeFixed
           * @see pentaho.visual.role.Property.Type#modes
           */
          getModeEffectiveOn: function(model) {

            var mapping = model.get(this);

            var mode = mapping.modeFixed;
            if(mode !== null) {
              return mode;
            }

            var data = model.data;
            if(data === null) {
              return null;
            }

            var fieldIndexes = mapping.fieldIndexes;
            if(fieldIndexes === null) {
              // There's at least one invalid field.
              return null;
            }

            var fieldTypes = fieldIndexes.map(function(fieldIndex) {
              var columnTypeName = data.getColumnType(fieldIndex);
              return context.get(columnTypeName).type;
            });

            var modes = this.modes;
            var modeCount = modes.count;

            // assert modeCount > 0

            var modeIndex = -1;
            while(++modeIndex < modeCount) {
              mode = modes.at(modeIndex);
              if(mode.canApplyToFieldTypes(fieldTypes)) {
                return mode;
              }
            }

            return null;
          },
          // endregion

          // region isVisualKey
          __isVisualKey: null,

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
           *
           * @override
           */
          get isVisualKey() {
            return !!this.__isVisualKey;
          },

          set isVisualKey(value) {

            this._assertNoSubtypesAttribute("isVisualKey");

            if(value == null) return;

            // Can only become true (from false or null). Else ignore.
            if(this.__isVisualKey === null) {
              this.__isVisualKey = !!value;
            } else if(value && !this.__isVisualKey) {
              this.__isVisualKey = true;
            }
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
           * 1. When specified, the value of [modeFixed]{@link pentaho.visual.role.ExternalProperty.Type#modeFixed}
           *    must be one of the corresponding internal visual role's
           *    [modes]{@link pentaho.visual.role.Property.Type#modes}.
           *
           * @param {!pentaho.visual.base.Model} model - The visual model.
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

              // modeFixed must exist in modes, when specified.
              var modeFixed = mapping.modeFixed;
              if(modeFixed !== null) {

                if(!this.modes.has(modeFixed.$key)) {
                  addErrors(new ValidationError(
                      bundle.format(bundle.structured.errors.property.modeFixedInvalid, {role: this})));
                }
              }

              if(!errors) {
                if(mapping.mode == null) {
                  addErrors(new ValidationError(
                      bundle.format(bundle.structured.errors.property.noApplicableMode, {role: this})));
                }
              }
            }

            return errors;
          },
          // endregion

          // region Serialization
          /** @inheritDoc */
          _fillSpecInContext: function(spec, keyArgs) {

            var any = this.base(spec, keyArgs);

            var modes = O.getOwn(this, "__modes");
            if(modes && !this.__isModesDefault) {
              any = true;
              spec.modes = modes.toSpecInContext(keyArgs);
            }

            // Only serialize if not the default value.
            var isVisualKey = O.getOwn(this, "__isVisualKey");
            if(isVisualKey !== null) {
              if(!this.isRoot || isVisualKey !== this.hasAnyCategoricalModes) {
                any = true;
                spec.isVisualKey = isVisualKey;
              }
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
});
