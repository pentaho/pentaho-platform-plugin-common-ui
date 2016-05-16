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
  "pentaho/util/object",
  "pentaho/util/error"
], function(module, bundle, mappingAttributeFactory, measurementLevelFactory,
    valueFactory, listFactory, numberFactory, dateFactory, O, error) {

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
        // TODO: levelAuto can only be determined by accessing the visual model...
        // TODO: dependent on DataTable object model
        var mappingAttrs = this.attributes;
        var data, visualModel, L;
        if(!(L = mappingAttrs.count) || !(visualModel = this.owner) || !(data = visualModel.data))
          return;

        // The lowest of the levels in attributes that are also supported by the visual role
        var levelAuto;

        var roleDataType = this.type.dataType;
        var roleLevels = this.type.levels;
        var dataAttrs = data.model.attributes;
        var dataAttrsLevelsVisited = new ListLevel();
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

          if(!dataAttrsLevelsVisited.has(dataAttrLevel) && roleLevels.has(dataAttrLevel)) {
            dataAttrsLevelsVisited.add(dataAttrLevel);

            if(!levelAuto || MeasurementLevel.type.compare(dataAttrLevel, levelAuto) < 0) {
              levelAuto = dataAttrLevel;
            }
          }
        }

        // may be undefined
        return levelAuto;
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
         * qualitative and the visual role's [data type]{@link pentaho.visual.role.Mapping#dataType}
         * is inherently quantitative.
         */
        get levels() {
          return this._levels;
        },

        set levels(values) {
          if(this.hasDescendants)
            throw error.operInvalid("Cannot change the 'levels' attribute of a Mapping that has descendants.");

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

            // A qualitative measurement level cannot be added if data type is quantitative.
            if(isDataTypeQuantitative(this.dataType)) {
              addLevels.each(function(addLevel) {
                if(!levels.has(addLevel.key) && MeasurementLevel.type.isQualitative(addLevel)) {
                  throw error.argInvalid("levels",
                      "Measurement level '" + addLevel +
                      "' is not compatible with a visual role having a quantitative data type, '" +
                      this.dataType._getErrorLabel() +
                      "'.");
                }
              }, this);
            }

            levels.set(addLevels, {noRemove: true});
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
         * quantitative and the visual role supports qualitative measurement
         * [levels]{@link pentaho.visual.role.Mapping#levels}.
         */
        get dataType() {
          return this._dataType;
        },

        set dataType(value) {
          if(this.hasDescendants)
            throw error.operInvalid("Cannot change the 'dataType' attribute of a Mapping that has descendants.");

          if(value == null) return;

          var oldType = this._dataType;
          var newType = context.get(value).type;
          if(newType !== oldType) {
            // Hierarchy/PreviousValue consistency
            if(oldType && !newType.isSubtypeOf(oldType))
              throw error.argInvalid("type", bundle.structured.errors.mapping.dataTypeNotSubtypeOfBaseType);

            // Is the new data type incompatible with existing measurement levels?
            if(isDataTypeQuantitative(newType)) {
              // Is there a qualitative measurement level?
              this.levels.each(function(level) {
                if(MeasurementLevel.type.isQualitative(level))
                  throw error.argInvalid("dataType",
                      "Quantitative data type '" + this.dataType._getErrorLabel() + "' is not compatible " +
                      "with qualitative measurement level '" + level + "'.");
              });
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
  };
});