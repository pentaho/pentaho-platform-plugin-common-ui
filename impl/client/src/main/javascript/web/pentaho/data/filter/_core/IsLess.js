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
  "pentaho/module!../IsLess",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.IsLessType
     * @class
     * @extends pentaho.data.filter.PropertyType
     *
     * @classDesc The type class of the strict less than filter type.
     *
     * For more information see {@link pentaho.data.filter.IsLess}.
     */

    /**
     * @name pentaho.data.filter.IsLess
     * @class
     * @extends pentaho.data.filter.Property
     * @amd pentaho/data/filter/IsLess
     *
     * @classDesc The `IsLess` class represents a filter for being strictly less than a given value.
     * The filter selects elements having the value of a certain property strictly less than a reference
     * value: [value]{@link pentaho.data.filter.IsLess#value}.
     *
     * @description Creates a greater than filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsLess} [spec] - A less than filter specification.
     */

    filter.IsLess = filter.Property.extend(/** @lends pentaho.data.filter.IsLess# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsLess;
      },

      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @name value
       * @memberOf pentaho.data.filter.IsLess#
       * @type {pentaho.type.Element}
       *
       * @readOnly
       */

      /** @inheritDoc */
      negate: function() {
        return new filter.IsGreaterOrEqual({property: this.property, value: this.value});
      },

      /** @inheritDoc */
      _compile: function() {

        var property = this.property;
        var referenceValue = this.value;

        return function isLessContains(elem) {
          var value = elem.getv(property, true);
          return value !== null && referenceValue < value;
        };
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        return (this.property || "") + " " + (v ? v.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsLessType# */{
        id: module.id,
        props: [
          {
            name: "value",
            nameAlias: "v",
            valueType: "element",
            isRequired: true,
            isBoundary: true
          }
        ]
      }
    });
  };
});
