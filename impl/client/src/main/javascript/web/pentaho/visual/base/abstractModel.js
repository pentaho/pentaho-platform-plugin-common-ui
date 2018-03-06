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
  "pentaho/util/object",
  "pentaho/type/changes/ComplexChangeset",
  "pentaho/i18n!model",
  // so that r.js sees otherwise invisible dependencies.
  "../role/abstractProperty",
  "../color/paletteProperty",
  "./application",
  "pentaho/data/filter/abstract"
], function(O, ComplexChangeset, bundle) {

  "use strict";

  // NOTE: Doing it this way, did:change listeners cannot observe invalid cached information.
  /**
   * @classDesc Manages the lifetime of the cached information of the mapping instances associated with a
   * target abstract model.
   * @memberOf pentaho.visual.base
   * @class
   * @extends pentaho.type.changes.ComplexChangeset
   * @private
   */
  var AbstractModelChangeset = ComplexChangeset.extend({

    /** @inheritDoc */
    _apply: function(model) {

      this.base(model);

      var modelType = model.$type;
      if(this.__areDataOrMappingsChanged(modelType)) {
        modelType.eachVisualRole(function(propType) {
          model.get(propType)._onDataOrMappingChanged();
        });
      }
    },

    /**
     * Determines if the changeset contains data and/or visual role mapping.
     *
     * The implementation determines if the changeset
     * contains the `data` property or any other visual role property.
     *
     * @param {!pentaho.visual.base.AbstractModel.Type} modelType - The target abstract model type.
     *
     * @return {boolean} `true`, if it contains; `false`, if not.
     *
     * @private
     */
    __areDataOrMappingsChanged: function(modelType) {

      var propNames = this.propertyNames;
      var i = -1;
      var P = propNames.length;
      while(++i < P) {
        var propName = propNames[i];
        if(propName === "data") {
          return true;
        }

        if(modelType.isVisualRole(modelType.get(propName))) {
          return true;
        }
      }

      return false;
    }
  });

  return [
    "complex",
    "../role/abstractProperty",
    "../color/paletteProperty",
    "./application",
    "pentaho/data/filter/abstract",
    "object",

    // Pre-load all registered filter types.
    {$types: {base: "pentaho/data/filter/abstract"}},

    function(Complex, RoleAbstractProperty, PaletteProperty, VisualApplication, AbstractFilter, PentahoObject) {

      var _roleAbstractPropertyType = RoleAbstractProperty.type;
      var _palettePropertyType = PaletteProperty.type;

      /**
       * @name pentaho.visual.base.AbstractModel.Type
       * @class
       * @extends pentaho.type.Complex.Type
       *
       * @classDesc The base class of visual model types.
       *
       * For more information see {@link pentaho.visual.base.AbstractModel}.
       */

      /**
       * @name AbstractModel
       * @memberOf pentaho.visual.base
       * @class
       * @extends pentaho.type.Complex
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.base.AbstractModel>} pentaho/visual/base/abstractModel
       *
       * @classDesc The `AbstractModel` class is the abstract base class of visualization models.
       *
       * @constructor
       * @description Creates an `AbstractModel` instance.
       * @param {pentaho.visual.base.spec.IAbstractModel} [modelSpec] A plain object containing the abstract model
       * specification.
       */
      var AbstractModel = Complex.extend(/** @lends pentaho.visual.base.AbstractModel# */{

        /** @inheritDoc */
        _createChangeset: function(txn) {
          return new AbstractModelChangeset(txn, this);
        },

        // region serialization
        /** @inheritDoc */
        toSpecInContext: function(keyArgs) {

          if(keyArgs && keyArgs.isJson) {
            keyArgs = Object.create(keyArgs);

            var omitProps = keyArgs.omitProps;
            keyArgs.omitProps = omitProps = omitProps ? Object.create(omitProps) : {};

            // Only isJson serialization does not work with the value of `data`
            // due to the circular dependencies it contains.
            if(omitProps.data == null) omitProps.data = true;

            if(omitProps.selectionFilter == null) omitProps.selectionFilter = true;

            if(omitProps.application == null) omitProps.application = true;
          }

          return this.base(keyArgs);
        },
        // endregion

        $type: /** @lends pentaho.visual.base.AbstractModel.Type# */{
          isAbstract: true,

          props: [
            // TODO: Viz or Model?
            /**
             * Gets or sets the visual application object.
             *
             * The application object represents the relevant state and
             * interface of the application in which a model is being used.
             *
             * By default, this property is not included when serializing to JSON.
             * To serialize it, specify the argument `keyArgs.omitProps.application` of
             * [toSpec]{@link pentaho.visual.base.AbstractModel#toSpec} to `false`.
             *
             * @name application
             * @memberOf pentaho.visual.base.Model#
             * @type {pentaho.visual.base.Application}
             */
            {
              name: "application",
              valueType: VisualApplication
            },

            /**
             * Gets or sets the data of the visualization.
             *
             * By default, this property is not included when serializing to JSON.
             * To serialize it, specify the argument `keyArgs.omitProps.data` of
             * [toSpec]{@link pentaho.visual.base.AbstractModel#toSpec} to `false`.
             *
             * @name data
             * @memberOf pentaho.visual.base.Model#
             * @type {pentaho.data.ITable}
             */
            {
              name: "data",
              valueType: "object",
              isRequired: true,

              // @override
              toValueOn: function(defaultValueOwner, valueSpec) {
                var simpleTable = this.base(defaultValueOwner, valueSpec);
                if(simpleTable !== null) {
                  var table = simpleTable.value.toPlainTable();
                  // wrap as simple again
                  return new PentahoObject(table);
                }
                return simpleTable;
              }
            },

            // TODO: Currently, the type system provides no easy way to normalize a set value,
            // without defining a subtype. Ideally, we'd use some "cast" hook provided
            // by property types. Because of this, the conversion to DNF (or simply calling toDnf() to make sure
            // non-termination is caught early) is not being ensured when the property is set but only on
            // the Select action's _doDefault.
            {
              /**
               * Gets or sets the current data selection filter.
               *
               * This property is required.
               *
               * By default, this property is not included when serializing to JSON.
               * To serialize it, specify the argument `keyArgs.omitProps.selectionFilter` of
               * [toSpec]{@link pentaho.visual.base.AbstractModel#toSpec} to `false`.
               *
               * When set to a filter specification, {@link pentaho.data.filter.spec.IAbstract},
               * it is converted into a filter object.
               * Any standard filter can be safely loaded synchronously.
               *
               * **ATTENTION**: The current implementation only supports filters that can be
               * converted to [DNF]{@link pentaho.data.filter.Abstract#toDnf} _in a reasonable amount of time_.
               *
               * @name selectionFilter
               * @memberOf pentaho.visual.base.View#
               * @type {pentaho.data.filter.Abstract}
               */
              name: "selectionFilter",
              valueType: AbstractFilter,

              // Can be a shared instance - filters are immutable.
              defaultValue: {_: "or"},
              isRequired: true
            }
          ],

          /**
           * Calls a function for each defined visual role property type.
           *
           * A visual role property type is a property type which is a subtype of
           * {@link pentaho.visual.role.AbstractProperty}.
           *
           * @param {function(pentaho.type.Property.Type, number, pentaho.type.Complex) : boolean?} f - The mapping
           * function. Return `false` to break iteration.
           *
           * @param {Object} [x] The JS context object on which `f` is called.
           *
           * @return {!pentaho.visual.base.Model} This object.
           */
          eachVisualRole: function(f, x) {
            var j = 0;
            this.each(function(propType) {
              if(this.isVisualRole(propType) && f.call(x, propType, j++, this) === false) {
                return false;
              }
            }, this);
            return this;
          },

          /**
           * Gets a value that indicates if a given property type is a subtype of
           * {@link pentaho.visual.role.AbstractProperty.Type}.
           *
           * @param {!pentaho.type.Property.Type} propType - The property type to test.
           * @return {boolean} `true` if `type` is a visual role property type; or `false`, otherwise.
           */
          isVisualRole: function(propType) {
            return propType.isSubtypeOf(_roleAbstractPropertyType);
          },

          /**
           * Gets a value that indicates if a given property type is a subtype of
           * {@link pentaho.visual.color.PaletteProperty.Type}.
           *
           * @param {!pentaho.type.Property.Type} propType - The property type to test.
           * @return {boolean} `true` if `type` is a color palette property type; or `false`, otherwise.
           */
          isColorPalette: function(propType) {
            return propType.isSubtypeOf(_palettePropertyType);
          }
        }
      })
      .implement({$type: bundle.structured.abstractModel});

      return AbstractModel;
    }
  ];
});
