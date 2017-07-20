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
  "pentaho/i18n!messages",
  "./aggregation",
  "pentaho/type/util"
], function(module, bundle, aggregationFactory, typeUtil) {

  "use strict";

  return function(context) {

    var Complex = context.get("complex");

    /**
     * @name pentaho.visual.role.MappingAttribute
     * @class
     * @extends pentaho.type.Complex
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.MappingAttribute>} pentaho/visual/role/mappingAttribute
     *
     * @classDesc The `MappingAttribute` class represents a data property in a
     * [visual role mapping]{@link pentaho.visual.role.Mapping}.
     *
     * @see pentaho.visual.role.Mapping
     *
     * @description Creates a visual role mapping attribute instance.
     * @constructor
     * @param {pentaho.visual.role.spec.UMappingAttribute} [spec] A visual role mapping attribute specification.
     */
    return Complex.extend("pentaho.visual.role.MappingAttribute", /** @lends pentaho.visual.role.MappingAttribute# */{

      constructor: function(spec, keyArgs) {
        // The name property?
        if(typeof spec === "string") spec = {name: spec};

        this.base(spec, keyArgs);
      },

      /**
       * Gets the visual role mapping that owns this mapping attribute, if any, or `null`.
       *
       * @type {pentaho.visual.base.role.Mapping}
       * @readonly
       */
      get mapping() {
        // TODO: Test it is an attributes list of a mapping...
        var attrsList = typeUtil.__getFirstRefContainer(this);
        return attrsList && typeUtil.__getFirstRefContainer(attrsList);
      },

      /**
       * Gets the visual model that owns this visual role mapping attribute, if any, or `null`.
       *
       * @type {pentaho.visual.base.Model}
       * @readonly
       */
      get model() {
        var mapping = this.mapping;
        return mapping && mapping.model;
      },

      // TODO: cannot make this public unless the data model is made public...
      // TODO: change to __

      /**
       * Gets the data attribute referenced by this visual role mapping attribute.
       *
       * @type {pentaho.data.Attribute}
       * @private
       * @readonly
       *
       * @see pentaho.visual.role.MappingAttribute#name
       * @see pentaho.visual.role.MappingAttribute#mapping
       * @see pentaho.visual.role.MappingAttribute#model
       */
      get dataAttribute() {
        var name = this.name;
        if(name) {
          var data;
          var model = this.model;
          if(model && (data = model.data)) {
            return data.model.attributes.get(name);
          }
        }

        return null;
      },

      /** @inheritDoc */
      toSpecInContext: function(keyArgs) {

        var spec = this.base(keyArgs);

        if(spec.constructor === Object) {
          // If only the name is output, then return it directly.
          var count = 0;
          var name = null;

          /* eslint guard-for-in: 0 */
          for(var p in spec) {
            count++;
            if(count > 1 || p !== "name") break;
            // count === 0 && p === name
            name = spec.name;
          }

          if(name && count === 1) spec = name;
        }

        return spec;
      },

      /**
       * Gets a key of this mapping attribute for use when
       * the containing mapping's [levelEffective]{@link pentaho.visual.role.Mapping#levelEffective}
       * is [qualitative]{@link pentaho.visual.role.MeasurementLevel.Type#isQualitative}.
       *
       * This key is composed by the value of the [name]{@link pentaho.visual.role.MappingAttribute#name} property.
       *
       * @type {string}
       * @readOnly
       */
      get keyQualitative() {
        var name = this.get("name");
        return name ? name.$key : "";
      },

      /**
       * Gets a key of this mapping attribute for use when
       * the containing mapping's [levelEffective]{@link pentaho.visual.role.Mapping#levelEffective}
       * is [quantitative]{@link pentaho.visual.role.MeasurementLevel.Type#isQuantitative}.
       *
       * This key is composed by the value of the [name]{@link pentaho.visual.role.MappingAttribute#name} and
       * the [aggregation]{@link pentaho.visual.role.MappingAttribute#aggregation} properties.
       *
       * @type {string}
       * @readOnly
       */
      get keyQuantitative() {
        var aggregation = this.get("aggregation");
        return this.keyQualitative + "|" + (aggregation ? aggregation.$key : "");
      },

      $type: {
        id: module.id,

        props: [
          /**
           * Gets or sets the name of the data property.
           *
           * This property is required.
           *
           * @name pentaho.visual.role.MappingAttribute#name
           * @type {string}
           * @see pentaho.visual.role.spec.IMappingAttribute#name
           */
          {name: "name", valueType: "string", isRequired: true},

          // Not defaulted because only "first" and "last" are compatible with any type.
          // Applies to quantitative or qualitative mappings.
          /**
           * Gets or sets the aggregation that is performed on the data attribute.
           *
           * The value must be one of the supported [Aggregation]{@link pentaho.visual.role.Aggregation} values.
           *
           * The aggregation must be compatible with the data type of the data attribute.
           *
           * @name pentaho.visual.role.MappingAttribute#aggregation
           * @type {string}
           * @see pentaho.visual.role.spec.IMappingAttribute#aggregation
           */
          {name: "aggregation", valueType: aggregationFactory},

          /**
           * Gets or sets a value that indicates if the data property contributes to the
           * default order of an _ordinal_ visual role
           * by using the **reverse** natural order of the data attribute.
           *
           * @name pentaho.visual.role.MappingAttribute#isReverseOrder
           * @type {boolean}
           * @default false
           * @see pentaho.visual.role.spec.IMappingAttribute#isReverseOrder
           */
          {name: "isReverseOrder", valueType: "boolean", defaultValue: false}
        ]
      }
    })
    .implement({$type: bundle.structured.mappingAttribute});
  };
});
