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
  "pentaho/module!../IsEqual",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.IsEqualType
     * @class
     * @extends pentaho.data.filter.PropertyType
     *
     * @classDesc The type class of the equality filter type.
     *
     * For more information see {@link pentaho.data.filter.IsEqual}.
     */

    /**
     * @name pentaho.data.filter.IsEqual
     * @class
     * @extends pentaho.data.filter.Property
     * @amd pentaho/data/filter/IsEqual
     *
     * @classDesc The `IsEqual` class represents an equality filter.
     * This filter selects elements having the value of a certain property equal to
     * a reference value: [value]{@link pentaho.data.filter.IsEqual#value}.
     *
     * @description Creates an equality filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsEqual} [spec] - An equality filter specification.
     */

    filter.IsEqual = filter.Property.extend(/** @lends pentaho.data.filter.IsEqual# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsEqual;
      },

      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @name value
       * @memberOf pentaho.data.filter.IsEqual#
       * @type {pentaho.type.Element}
       *
       * @readOnly
       */

      /** @inheritDoc */
      _compile: function() {

        var property = this.property;
        // Can be null.
        var referenceValue = this.value;

        return function isEqualContains(elem) {
          var value = elem.getv(property, true);

          // valueOf fallback added allowing to compare Dates
          return value === referenceValue
            || value != null && referenceValue != null && value.valueOf() === referenceValue.valueOf();
        };
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        return (this.property || "") + " " + (v ? v.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsEqualType# */{
        id: module.id,
        props: [
          {
            // May be `null`
            name: "value",
            nameAlias: "v",
            valueType: "element",
            isBoundary: true
          }
        ]
      }
    });
  };
});
