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
  "pentaho/module!../IsLessOrEqual",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.IsLessOrEqualType
     * @class
     * @extends pentaho.data.filter.PropertyType
     *
     * @classDesc The type class of the less or equal than filter type.
     *
     * For more information see {@link pentaho.data.filter.IsLessOrEqual}.
     */

    /**
     * @name pentaho.data.filter.IsLessOrEqual
     * @class
     * @extends pentaho.data.filter.Property
     * @amd pentaho/data/filter/IsLessOrEqual
     *
     * @classDesc The `IsLessOrEqual` class represents a filter for being less than or equal to a given value.
     * The filter selects elements having the value of a certain property less or equal than a reference
     * value: [value]{@link pentaho.data.filter.isLessOrEqual#value}.
     *
     * @description Creates a less or equal than filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsLessOrEqual} [spec] - A less or equal than filter specification.
     */

    filter.IsLessOrEqual = filter.Property.extend(/** @lends pentaho.data.filter.IsLessOrEqual# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsLessOrEqual;
      },

      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @name value
       * @memberOf pentaho.data.filter.IsLessOrEqual#
       * @type {pentaho.type.Element}
       *
       * @readOnly
       */

      /** @inheritDoc */
      negate: function() {
        return new filter.IsGreater({property: this.property, value: this.value});
      },

      /** @inheritDoc */
      _compile: function() {

        var property = this.property;
        var referenceValue = this.value;

        return function isLessOrEqualContains(elem) {
          var value = elem.getv(property, true);
          return value !== null && referenceValue <= value;
        };
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        return (this.property || "") + " " + (v ? v.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsLessOrEqualType# */{
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
