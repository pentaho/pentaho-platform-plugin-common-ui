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
  "pentaho/module!../IsGreaterOrEqual",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.IsGreaterOrEqualType
     * @class
     * @extends pentaho.data.filter.PropertyType
     *
     * @classDesc The type class of the greater or equal than filter type.
     *
     * For more information see {@link pentaho.data.filter.IsGreaterOrEqual}.
     */

    /**
     * @name pentaho.data.filter.IsGreaterOrEqual
     * @class
     * @extends pentaho.data.filter.Property
     * @amd pentaho/data/filter/IsGreaterOrEqual
     *
     * @classDesc The `IsGreaterOrEqual` class represents a filter for being greater than or equal to a given value.
     * The filter selects elements having the value of a certain property greater or equal to a reference
     * value: [value]{@link pentaho.data.filter.IsGreaterOrEqual#value}.
     *
     * @description Creates a greater or equal than filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsGreaterOrEqual} [spec] - A greater than filter specification.
     */

    filter.IsGreaterOrEqual = filter.Property.extend(/** @lends pentaho.data.filter.IsGreaterOrEqual# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsGreaterOrEqual;
      },

      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @name value
       * @memberOf pentaho.data.filter.IsGreaterOrEqual#
       * @type {pentaho.type.Element}
       *
       * @readOnly
       */

      /** @inheritDoc */
      negate: function() {
        return new filter.IsLess({property: this.property, value: this.value});
      },

      /** @inheritDoc */
      _compile: function() {

        var property = this.property;
        var referenceValue = this.value;

        return function isGreaterOrEqualContains(elem) {
          var value = elem.getv(property, true);
          return value !== null && referenceValue >= value;
        };
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        return (this.property || "") + " " + (v ? v.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsGreaterOrEqualType# */{
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
