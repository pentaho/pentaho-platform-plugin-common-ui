/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/module!_",
  "pentaho/type/Complex",
  "./MappingField",
  "pentaho/data/util",
  "pentaho/i18n!messages"
], function(module, Complex, MappingField, dataUtil, bundle) {

  "use strict";

  /**
   * @name pentaho.visual.role.AbstractMappingType
   * @class
   * @extends pentaho.type.ComplexType
   *
   * @classDesc The type class of {@link pentaho.visual.role.AbstractMapping}.
   */

  /**
   * @name pentaho.visual.role.AbstractMapping
   * @class
   * @extends pentaho.type.Complex
   * @abstract
   *
   * @amd pentaho/visual/role/AbstractMapping
   *
   * @classDesc The `AbstractMapping` class is the base class for associations between
   * a visual role and data fields of a visualization's current dataset.
   *
   * A mapping contains a list of [fields]{@link pentaho.visual.role.AbstractMapping#fields},
   * each of the type [MappingField]{@link pentaho.visual.role.MappingField}.
   *
   * @description Creates a visual role mapping instance.
   * @constructor
   * @param {pentaho.visual.role.spec.IAbstractMapping} [spec] A visual role mapping specification.
   */
  var AbstractMapping = Complex.extend(/** @lends pentaho.visual.role.AbstractMapping# */{

    /**
     * Gets a value that indicates if the mapping has any fields.
     *
     * @type {boolean}
     * @readonly
     */
    get hasFields() {
      return this.fields.count > 0;
    },

    /**
     * Resets any existing adaptation related cached information.
     *
     * Called by the containing abstract model whenever its data or visual role properties change.
     *
     * @protected
     * @friend pentaho.visual.AbstractModel
     */
    _onDataOrMappingChanged: function() {
    },

    /**
     * Gets the reference corresponding to the containing abstract model and visual role property, if any.
     *
     * @type {?({container: pentaho.visual.AbstractModel, property: pentaho.visual.role.AbstractProperty})}
     * @readOnly
     * @protected
     */
    get _modelReference() {
      var refs = this.$references;
      if(refs && refs.length) {
        return refs[0];
      }

      return null;
    },

    /**
     * Gets an array of the indexes of dataset columns of the mapped fields.
     *
     * If there is no container model, or the model has no dataset, `null` is returned.
     * If any of the mapped fields is not defined in the dataset, `null` is returned.
     *
     * @type {Array.<number>}
     * @readOnly
     */
    get fieldIndexes() {

      var fieldIndexes = null;

      var iref = this._modelReference;
      if(iref !== null) {
        var data = iref.container.data;
        if(data !== null) {
          var mappingFieldNames = this.fields.toArray(function(mappingField) { return mappingField.name; });
          return dataUtil.getColumnIndexesByIds(data, mappingFieldNames);
        }
      }

      return fieldIndexes;
    },

    /**
     * Gets the _effective_ operation mode in which the associated visual role is to operate.
     *
     * @name pentaho.visual.role.AbstractMapping#mode
     * @type {pentaho.visual.role.Mode}
     * @readonly
     */

    $type: /** @lends pentaho.visual.role.AbstractMappingType# */{
      id: module.id,

      props: [
        /**
         * Gets or sets the fields of the visual role mapping.
         *
         * @name pentaho.visual.role.AbstractMapping#fields
         * @type {pentaho.type.List<pentaho.visual.role.MappingField>}
         */
        {name: "fields", valueType: [MappingField]}
      ]
    }
  })
  .localize({$type: bundle.structured.AbstractMapping})
  .configure();

  return AbstractMapping;
});
