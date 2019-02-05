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
  "pentaho/module!_",
  "pentaho/type/Property",
  "./AbstractMapping",
  "../base/KeyTypes",
  "pentaho/i18n!messages",
  "pentaho/type/loader",
  "pentaho/type/ValidationError",
  "pentaho/data/TableView",
  "pentaho/type/util"
], function(module, Property, AbstractMapping, VisualKeyTypes, bundle, typeLoader,
            ValidationError, DataView, typeUtil) {

  "use strict";

  /**
   * @name pentaho.visual.role.AbstractPropertyType
   * @class
   * @extends pentaho.type.PropertyType
   * @abstract
   *
   * @classDesc The type class of {@link pentaho.visual.role.AbstractProperty}.
   */

  /**
   * @name pentaho.visual.role.AbstractProperty
   * @class
   * @extends pentaho.type.Property
   *
   * @amd pentaho/visual/role/AbstractProperty
   *
   * @classDesc The `AbstractProperty` class is the base class of properties that represent a visual role of a
   * visualization and defines its capabilities.
   *
   * The [valueType]{@link pentaho.type.PropertyType#valueType} of a property of this type is
   * [Mapping]{@link pentaho.visual.role.AbstractMapping} and
   * stores the association between the visual role and the data fields of a visualization's current dataset.
   *
   * @description This class was not designed to be constructed directly.
   */
  var AbstractProperty = Property.extend(/** @lends pentaho.visual.role.AbstractProperty# */{

    $type: /** @lends pentaho.visual.role.AbstractPropertyType# */{

      id: module.id,

      valueType: AbstractMapping,

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
       * @name pentaho.visual.role.AbstractPropertyType#modes
       * @type {pentaho.type.List.<pentaho.visual.role.Mode>}
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
          if(mode.dataType.isList) {
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
       * @see pentaho.visual.role.AbstractPropertyType#hasAnyContinuousModes
       * @see pentaho.visual.role.Mode#isContinuous
       * @see pentaho.visual.role.AbstractPropertyType#modes
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
       * @see pentaho.visual.role.AbstractPropertyType#hasAnyCategoricalModes
       * @see pentaho.visual.role.Mode#isContinuous
       * @see pentaho.visual.role.AbstractPropertyType#modes
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

      /**
       * Gets a value that indicates if the visual role has any modes having the specified properties.
       *
       * @param {object} keyArgs - The keyword arguments.
       * @param {?boolean} [keyArgs.isContinuous] - Indicates that matching modes are continuous.
       * @param {?boolean} [keyArgs.isList] - Indicates that the data type of matching modes are list data types.
       * @param {pentaho.type.spec.TypeReference} [keyArgs.elementDataType] - The element data type (or a subtype of)
       * of matching modes.
       *
       * @return {boolean} `true` if a mode having the specified properties exists; `false` otherwise.
       *
       * @see pentaho.visual.role.AbstractPropertyType#hasAnyContinuousModes
       * @see pentaho.visual.role.AbstractPropertyType#hasAnyCategoricalModes
       * @see pentaho.visual.role.AbstractPropertyType#hasAnyListModes
       *
       * @see pentaho.visual.role.AbstractPropertyType#modes
       * @see pentaho.visual.role.Mode#isContinuous
       * @see pentaho.type.Type#isList
       * @see pentaho.visual.role.Mode#dataType
       * @see pentaho.type.Type#elementType
       */
      hasAnyModes: function(keyArgs) {
        var isContinuous = keyArgs.isContinuous;
        var isList = keyArgs.isList;
        var elementDataType = keyArgs.elementDataType ? typeLoader.resolveType(keyArgs.elementDataType).type : null;

        var any = false;

        this.modes.each(function(mode) {
          if(isContinuous != null && mode.isContinuous !== isContinuous) {
            return;
          }

          if(isList != null && mode.dataType.isList !== isList) {
            return;
          }

          if(elementDataType != null && !elementDataType.isSubtypeOf(mode.dataType.elementType)) {
            return;
          }

          // Found. Stop.
          any = true;
          // eslint-disable-next-line consistent-return
          return false;
        });

        return any;
      },
      // endregion

      /**
       * Gets a value that indicates if the visual role is a key property of the visual space.
       *
       * This attribute is only applicable when the associated model
       * has [visualKeyType]{@link pentaho.visual.base.AbstractModelType#visualKeyType}
       * of [dataKey]{@link }pentaho.visual.base.KeyTypes.dataKey}.
       *
       * When a visual role is a key visual role,
       * each distinct combination of key visual roles' values corresponds to
       * a distinct visual element being rendered.
       *
       * @name pentaho.visual.role.AbstractPropertyType#isVisualKey
       * @type {boolean}
       * @readOnly
       * @abstract
       *
       * @see pentaho.visual.base.AbstractModelType#visualKeyType
       * @see pentaho.visual.role.AbstractPropertyType#isVisualKeyEffective
       */

      /**
       * Gets a value that indicates if the visual role is _effectively_ a visual key.
       *
       * When the property's associated model is not defined or does not have a
       * [visualKeyType]{@link pentaho.visual.base.AbstractModelType#visualKeyType} of
       * [dataKey]{@link }pentaho.visual.base.KeyTypes.dataKey},
       * `undefined` is returned.
       *
       * @type {boolean|undefined}
       * @readOnly
       * @see pentaho.visual.role.AbstractPropertyType#isVisualKey
       */
      get isVisualKeyEffective() {
        var modelType = this.declaringType;
        return modelType !== null && modelType.visualKeyType === VisualKeyTypes.dataKey
          ? this.isVisualKey
          : undefined;
      },

      /**
       * Gets the metadata about the fields property of mappings of this visual role property.
       *
       * @name pentaho.visual.role.AbstractPropertyType#fields
       * @type {pentaho.visual.role.IFieldsMetadata}
       * @readOnly
       * @abstract
       */

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
       *    [fields]{@link pentaho.visual.role.AbstractMapping#fields} is considered undefined and invalid;
       * 2. Otherwise, if the model has a non-`null` [data]{@link pentaho.visual.base.AbstractModel#data},
       *    then each field in the current mapping's
       *    [fields]{@link pentaho.visual.role.AbstractMapping#fields} must be defined in `data`.
       *
       * @param {pentaho.visual.base.AbstractModel} model - The abstract model.
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

          if(!errors && mapping.hasFields) {
            // Fields are defined in data and of a type compatible with the role's dataType.
            this.__validateFieldsOn(model, mapping, addErrors);
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
       * @param {pentaho.visual.base.AbstractModel} model - The abstract model.
       * @param {pentaho.visual.role.AbstractMapping} mapping - The mapping.
       * @param {function} addErrors - Called to add errors.
       * @private
       */
      __validateFieldsOn: function(model, mapping, addErrors) {

        var data = model.data;

        var i = -1;
        var mappingFields = mapping.fields;
        var L = mappingFields.count;
        while(++i < L) {
          var mappingField = mappingFields.at(i);
          var name = mappingField.name;

          // Field with no definition?
          var columnIndex = data ? data.getColumnIndexById(name) : -1;
          if(columnIndex < 0) {
            addErrors(new ValidationError(
              bundle.format(
                bundle.structured.errors.property.fieldIsNotDefinedInAbstractModelData,
                {
                  name: name,
                  role: this
                })));
            // Continue
          }

          // TODO: Validate isVisualKeyEffective and isKey. Note the rule on vizApi.conf.js temporarily doing this
          // for Analyzer and DET.
        }
      }
      // endregion
    }
  })
  .localize({$type: bundle.structured.AbstractProperty})
  .configure({$type: module.config});

  return AbstractProperty;
});
