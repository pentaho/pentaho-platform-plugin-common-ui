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
  "pentaho/i18n!/pentaho/type/i18n/types",
  "pentaho/type/ValidationError",
  "pentaho/data/TableView",
  "pentaho/type/util",
  "pentaho/util/object",

  // so that r.js sees otherwise invisible dependencies.
  "./baseMapping"
], function(bundle, bundleTypes, ValidationError, DataView, typeUtil, O) {

  "use strict";

  return [
    "property",
    "./baseMapping",
    function(Property, BaseMapping) {

      /**
       * @name pentaho.visual.role.BaseProperty.Type
       * @class
       * @extends pentaho.type.Property.Type
       * @abstract
       *
       * @classDesc The type class of {@link pentaho.visual.role.BaseProperty}.
       */

      /**
       * @name pentaho.visual.role.BaseProperty
       * @class
       * @extends pentaho.type.Property
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.BaseProperty>} pentaho/visual/role/baseProperty
       *
       * @classDesc The `BaseProperty` class is the base class of properties that represent a visual role of a
       * visualization and defines its capabilities.
       *
       * The [valueType]{@link pentaho.type.Property.Type#valueType} of a property of this type is
       * [Mapping]{@link pentaho.visual.role.BaseMapping} and
       * stores the association between the visual role and the data fields of a visualization's current data set.
       *
       * @description This class was not designed to be constructed directly.
       */
      var BaseProperty = Property.extend(/** @lends pentaho.visual.role.BaseProperty# */{

        $type: /** @lends pentaho.visual.role.BaseProperty.Type# */{

          valueType: BaseMapping,

          // Create a new Mapping each time.
          defaultValue: function() { return {}; },

          isRequired: true,

          // region modes
          /**
           * Gets the array of modes of operation supported by the visual role.
           *
           * A visual role that supports more than one mode of operation is said to be **modal**.
           *
           * Visual roles need to support at least one mode of operation.
           *
           * The returned list or its elements should not be modified.
           *
           * @name pentaho.visual.role.BaseProperty.Type#modes
           * @type {!pentaho.type.List.<pentaho.visual.role.Mode>}
           * @readOnly
           * @abstract
           */

          /**
           * Gets a value that indicates if the visual role has any list modes.
           *
           * @type {boolean}
           * @readOnly
           * @see pentaho.visual.role.Mode#dataType
           * @see pentaho.type.Type#isList
           * @see pentaho.type.Type#isElement
           */
          get hasAnyListModes() {
            var any = false;
            this.modes.each(function(mode) {
              var dataType = mode.dataType;
              // it's either a list type or not an element as well (e.g. instance or value).
              if(dataType.isList || !dataType.isElement) {
                any = true;
                return false;
              }
            });
            return any;
          },

          /**
           * Gets a value that indicates if the visual role has any categorical modes.
           *
           * @type {boolean}
           * @readOnly
           * @see pentaho.visual.role.BaseProperty.Type#hasAnyContinuousModes
           * @see pentaho.visual.role.Mode#isContinuous
           * @see pentaho.visual.role.BaseProperty.Type#modes
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
           * @see pentaho.visual.role.BaseProperty.Type#hasAnyCategoricalModes
           * @see pentaho.visual.role.Mode#isContinuous
           * @see pentaho.visual.role.BaseProperty.Type#modes
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

          // region isVisualKey
          /**
           * Gets a value that indicates if the visual role is a key property of the visual space.
           *
           * When a visual role is a key visual role,
           * each distinct combination of key visual roles' values corresponds to
           * a distinct visual element being rendered.
           * When a visual model has no key visual roles,
           * then it is assumed that one visual element is rendered per input row of data.
           *
           * @name pentaho.visual.role.BaseProperty.Type#isVisualKey
           * @type {boolean}
           * @readOnly
           * @abstract
           */
          // endregion

          dynamicAttributes: {
            // Exposed through IFieldsConstraints.isRequired
            // Additionally defines __fieldsIsRequiredOn
            __fieldsIsRequired: {
              value: false,
              cast: Boolean,
              group: "fields",
              localName: "isRequired",
              combine: function(baseEval, localEval) {
                return function(propType) {
                  // localEval is skipped if base is true.
                  return baseEval.call(this, propType) || localEval.call(this, propType);
                };
              }
            },

            // Exposed through IFieldsConstraints.countMin
            // Additionally defines __fieldsCountMinOn
            __fieldsCountMin: {
              value: 0,
              cast: __castCount,
              group: "fields",
              localName: "countMin",
              combine: function(baseEval, localEval) {
                return function(propType) {
                  return Math.max(baseEval.call(this, propType), localEval.call(this, propType));
                };
              }
            },

            // Exposed through IFieldsConstraints.countMax
            // Additionally defines __fieldsCountMaxOn
            __fieldsCountMax: {
              value: Infinity,
              cast: __castCount,
              group: "fields",
              localName: "countMax",
              combine: function(baseEval, localEval) {
                return function(propType) {
                  return Math.min(baseEval.call(this, propType), localEval.call(this, propType));
                };
              }
            }
          },

          // region fields
          /*
           * Actually implements IFieldsConstraints#countRangeOn.
           *
           * TODO: Shouldn't this also integrate the underlying `fields` property's own isRequired, countMin, countMax
           * attributes? Can be a problem if anyone creates a subclass of property (outside of configuration)
           * and changes the defaults.
           */
          __fieldsCountRangeOn: function(model) {
            var isRequired = this.__fieldsIsRequiredOn(model);
            var countMin = this.__fieldsCountMinOn(model);
            var countMax = this.__fieldsCountMaxOn(model);

            if(isRequired && countMin < 1) countMin = 1;

            if(countMax < countMin) countMax = countMin;

            return {min: countMin, max: countMax};
          },

          /**
           * Gets or sets the fields metadata related with this visual role property.
           *
           * @type {!pentaho.visual.role.IFieldsConstraints}
           */
          get fields() {
            var fields = O.getOwn(this, "__fields");
            if(!fields) {

              var propType = this;

              this.__fields = fields = {
                get isRequired() {
                  return propType.__fieldsIsRequired;
                },
                set isRequired(value) {
                  propType.__fieldsIsRequired = value;
                },
                get countMin() {
                  return propType.__fieldsCountMin;
                },
                set countMin(value) {
                  propType.__fieldsCountMin = value;
                },
                get countMax() {
                  return propType.__fieldsCountMax;
                },
                set countMax(value) {
                  propType.__fieldsCountMax = value;
                },
                countRangeOn: function(model) {
                  return propType.__fieldsCountRangeOn(model);
                }
              };
            }
            return fields;
          },

          set fields(value) {

            if(!value) return;

            var fields = this.fields;

            if("isRequired" in value) fields.isRequired = value.isRequired;
            if("countMin" in value) fields.countMin = value.countMin;
            if("countMax" in value) fields.countMax = value.countMax;
          },
          // endregion

          // region Validation

          /**
           * Determines if this visual role is valid on the given abstract model.
           *
           * If generic property validation fails, those errors are returned.
           *
           * Otherwise, validity is further determined as follows:
           *
           * 1. If the abstract model has a `null` [data]{@link pentaho.visual.base.AbstractModel#data},
           *    then every field in the current mapping's
           *    [fields]{@link pentaho.visual.role.BaseMapping#fields} is considered undefined and invalid
           * 2. Otherwise, if the model has a non-`null` [data]{@link pentaho.visual.base.AbstractModel#data},
           *    then each field in the current mapping's
           *    [fields]{@link pentaho.visual.role.BaseMapping#fields} must be defined in `data`
           * 3. The number of currently mapped [fields]{@link pentaho.visual.role.BaseMapping#fields} must satisfy
           *    the usual property cardinality constraints,
           *    according to [BaseProperty.Type#fields]{@link pentaho.visual.role.BaseProperty.Type#fields}
           * 4. There can be no two mapping fields with the same
           *    [name]{@link pentaho.visual.role.MappingField#name}
           *
           * @param {!pentaho.visual.base.AbstractModel} model - The abstract model.
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
              var range = this.__fieldsCountRangeOn(model);
              var count = mapping.fields.count;
              if(count < range.min) {
                addErrors(new ValidationError(
                    bundleTypes.get("errors.property.countOutOfRange", [
                      this.label + " " + mapping.$type.get("fields").label,
                      count,
                      range.min,
                      range.max
                    ])));

              } else if(count > range.max) {
                addErrors(new ValidationError(
                    bundleTypes.get("errors.property.countOutOfRange", [
                      this.label + " " + mapping.$type.get("fields").label,
                      count,
                      range.min,
                      range.max
                    ])));
              }

              if(!errors && count > 0) {
                // Fields are defined in data and of a type compatible with the role's dataType.
                this.__validateFieldsOn(model, mapping, addErrors);

                // Duplicate mapped fields.
                // Only possible to validate when the rest of the stuff is valid.
                if(!errors) {
                  this.__validateDuplMappingFieldsOn(model, mapping, addErrors);
                }
              }
            }

            return errors;
          },

          /**
           * Validates that every mapped field references a defined column in the
           * data of the abstract model.
           *
           * Assumes the mapping is valid according to the base complex validation.
           *
           * @param {!pentaho.visual.base.AbstractModel} model - The abstract model.
           * @param {!pentaho.visual.role.BaseMapping} mapping - The mapping.
           * @param {function} addErrors - Called to add errors.
           * @private
           */
          __validateFieldsOn: function(model, mapping, addErrors) {

            var data = model.data;
            var dataAttrs = data && data.model.attributes;

            var i = -1;
            var mappingFields = mapping.fields;
            var L = mappingFields.count;
            while(++i < L) {
              var mappingField = mappingFields.at(i);
              var name = mappingField.name;

              // Field with no definition?
              var dataAttr = dataAttrs && dataAttrs.get(name);
              if(!dataAttr) {
                addErrors(new ValidationError(
                  bundle.format(
                    bundle.structured.errors.property.fieldIsNotDefinedInAbstractModelData,
                    {
                      name: name,
                      role: this
                    })));
                // continue;
              }
            }
          },

          /**
           * Validates that the mapping fields have no duplicates.
           *
           * @param {!pentaho.visual.base.AbstractModel} model - The abstract model.
           * @param {!pentaho.visual.role.BaseMapping} mapping - The mapping.
           * @param {function} addErrors - Called to add errors.
           * @private
           */
          __validateDuplMappingFieldsOn: function(model, mapping, addErrors) {

            var mappingFields = mapping.fields;
            var L = mappingFields.count;
            if(L <= 1) return;

            var data = model.data;
            var dataAttrs = data && data.model.attributes;

            var byKey = {};
            var i = -1;
            while(++i < L) {
              var mappingField = mappingFields.at(i);
              var key = mappingField.name;
              if(O.hasOwn(byKey, key)) {
                var dataAttr = dataAttrs.get(mappingField.name);
                var errorMessage = bundle.format(bundle.structured.errors.property.fieldDuplicate, {
                  name: dataAttr,
                  role: this
                });

                addErrors(new ValidationError(errorMessage));
                continue;
              }

              byKey[key] = mappingField;
            }
          }
          // endregion
        }
      })
      .implement({$type: bundle.structured.property});

      return BaseProperty;
    }
  ];

  function __castCount(v) {
    v = +v;
    if(isNaN(v) || v < 0) return; // undefined;
    return Math.floor(v);
  }
});
