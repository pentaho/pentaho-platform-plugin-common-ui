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
  "./mapping"
], function(module, bundle, mappingFactory) {

  "use strict";

  return function(context) {

    var Property = context.get("property");

    /**
     * @name pentaho.visual.role.Property.Type
     * @class
     * @extends pentaho.type.Property.Type
     * @abstract
     *
     * @classDesc The type class of {@link pentaho.visual.role.Property}.
     */

    /**
     * @name pentaho.visual.role.Property
     * @class
     * @extends pentaho.type.Property
     * @abstract
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.Property>} pentaho/visual/role/property
     *
     * @classDesc The base abstract class of visual role properties.
     *
     * This type is to be used as the base type of properties
     * of a [visual model]{@link pentaho.visual.base.Model}
     * that represent visual roles.
     * The following example shows how a visual role property named `color` could be defined
     * in a visual model:
     *
     * ```js
     * var visualModelSpec = {
     *   base: "pentaho/visual/base",
     *   props: [
     *     {
     *       name: "color"
     *       base: "pentaho/visual/role/property",
     *       levels: ["nominal"],
     *       dataType: "string"
     *     }
     *   ]
     * };
     * ```
     *
     * In one hand,
     * a visual role property allows the specification of additional metadata
     * about the capabilities of a visual role of a visualization,
     * by specifying the attributes
     * [levels]{@link pentaho.visual.role.Mapping.Type#levels} and
     * [dataType]{@link pentaho.visual.role.Mapping.Type#dataType}.
     *
     * On the other hand,
     * the value of the property in a visual model
     * holds an actual mapping between the visual role
     * and the data properties, here named _attributes_,
     * of a visualization's current dataset.
     * Visual role properties have the
     * [value type]{@link pentaho.visual.role.Property#type}
     * {@link pentaho.visual.role.Mapping}.
     */
    var VisualRoleProperty = Property.extend("pentaho.visual.role.Property", {

      type: /** @lends pentaho.visual.role.Property.Type# */{
        id: module.id,

        isAbstract: true,

        // value type
        /**
         * Gets or sets the type of value that properties of this type can hold.
         *
         * This type of property contains visual role mapping instances.
         *
         * @type {!pentaho.visual.role.Mapping.Type}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the property already has
         * [descendant]{@link pentaho.type.Type#hasDescendants} properties.
         * @throws {pentaho.lang.ArgumentInvalidError} When setting to a _value type_ that is not a subtype
         * of the current _value type_.
         */
        type: mappingFactory,

        //region levels
        // NOTE: See facets/DiscreteDomain#domain for a similar implementation.
        // "nominal", "ordinal", "quantitative"
        _levels: null,

        /**
         * Gets or sets the array of measurement levels for which the visual role
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
         * When set and the type already has [subtypes]{@link pentaho.type.Type#hasDescendants},
         * an error is thrown.
         *
         * The root [visual.role.Property]{@link pentaho.visual.role.Property} has
         * a `levels` attribute which is an empty list.
         *
         * Do **NOT** modify the returned list or its elements in any way.
         *
         * @type {pentaho.type.List.<pentaho.visual.role.MeasurementLevel>}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
         * [subtypes]{@link pentaho.type.Type#hasDescendants}.
         */
        get levels() {
          throw new Error("Implement me!");
        },

        set levels(value) {
          throw new Error("Implement me!");
        },
        //endregion

        //region dataType
        _dataType: undefined,

        // NOTE: See Property.Type#type for a similar implementation.
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
         */
        get dataType() {
          throw new Error("Implement me!");
        },

        set dataType(value) {
          throw new Error("Implement me!");
        },
        //endregion

        /**
         * Gets the levels of measurement that are effectively supported by the visual role,
         * when both
         * the supported [levels]{@link pentaho.visual.role.Property#levels}
         * and the supported [dataType]{@link pentaho.visual.role.Property#dataType}
         * are considered together.
         *
         * Specifically, when the data type is not compatible with a certain level of measurement,
         * that level of measurement is removed from the result.
         * This attribute returns a subset of the list returned by the `levels` attribute.
         *
         * Do **NOT** modify the returned list or its elements in any way.
         *
         * The contents of this list could be displayed to a user for
         * him to choose one of the possible measurement levels.
         *
         * @type {pentaho.type.List.<pentaho.visual.role.MeasurementLevel>}
         * @readOnly
         */
        get levelsEffective() {
          // Compute and cache the result. Must be local cache, not inherited.
          // Invalidate local cache on _levels and _dataType change.
          throw new Error("Implement me!");
        }
      }
    })
    .implement({type: bundle.structured.property});

    return VisualRoleProperty;
  };
});