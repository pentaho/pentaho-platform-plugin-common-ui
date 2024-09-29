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
  "pentaho/module!../Property"
], function(module) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.PropertyType
     * @class
     * @extends pentaho.data.filter.AbstractType
     *
     * @classDesc The base type class of filter types.
     *
     * For more information see {@link pentaho.data.filter.Property}.
     */

    /**
     * @name pentaho.data.filter.Property
     * @class
     * @extends pentaho.data.filter.Abstract
     * @abstract
     * @amd pentaho/data/filter/Property
     *
     * @classDesc The base class of filters that filter elements in a set
     * by matching the value of a given property against a criteria/condition.
     *
     * @description Creates a property filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IProperty} [spec] - A property filter specification.
     */

    filter.Property = filter.Abstract.extend(/** @lends pentaho.data.filter.Property# */{

      /**
       * Gets the name of the property.
       *
       * This getter is a shorthand for `this.getv("property")`.
       *
       * @name property
       * @memberOf pentaho.data.filter.Property#
       * @type {string}
       * @readonly
       */

      /** @inheritDoc */
      get isProperty() {
        return true;
      },

      $type: /** @lends pentaho.data.filter.PropertyType# */{
        id: module.id,
        isAbstract: true,
        props: [
          {
            name: "property",
            nameAlias: "p",
            valueType: "string",
            isRequired: true
          }
        ]
      }
    });
  };
});
