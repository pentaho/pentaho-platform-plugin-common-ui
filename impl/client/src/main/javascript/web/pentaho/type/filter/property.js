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
  "../../util/object",
  "./abstract"
], function(module, O, abstractFactory) {

  "use strict";

  return function(context) {

    var AbstractFilter = context.get(abstractFactory);

    /**
     * @name pentaho.type.filter.Property.Type
     * @class
     * @extends pentaho.type.Abstract.Type
     *
     * @classDesc The base type class of filter types.
     *
     * For more information see {@link pentaho.type.filter.Property}.
     */

    /**
     * @name pentaho.type.filter.Property
     * @class
     * @extends pentaho.type.filter.Abstract
     * @abstract
     * @amd {pentaho.type.Factory<pentaho.type.filter.Property>} pentaho/type/filter/property
     *
     * @classDesc The base class of filters that filter elements in a set
     * by matching the value of a given property against a criteria/condition.
     *
     * @description Creates a property filter instance.
     *
     * @constructor
     * @param {pentaho.type.filter.spec.IProperty} [spec] - A property filter specification.
     */

    return AbstractFilter.extend("pentaho.type.filter.Property", /** @lends pentaho.type.filter.Property# */{

      /**
       * Gets the name of the property.
       *
       * This getter is a shorthand for `this.getv("property")`.
       *
       * @type {string}
       * @readonly
       */
      get property() {
        return this.getv("property");
      },

      // TODO: In the future, review if value argument should be of type pentaho.type.Value.
      /**
       * Determines if a property value is such that its element is selected by this filter.
       *
       * @name _operation
       * @memberOf pentaho.type.filter.Property#
       * @method
       *
       * @param {any} value - The property value to be tested.
       *
       * @returns {boolean} `true` if the element is selected; `false`, otherwise.
       *
       * @protected
       * @abstract
       */

      /**
       * Determines if an element is selected by this filter.
       *
       * @param {!pentaho.type.Element} elem - The element to be tested.
       *
       * @return {boolean} `true` if `elem` is selected; `false`, otherwise.
       *
       * @override
       */
      _contains: function(elem) {
        var prop = this.property;
        return elem.type.has(prop) && this._operation(elem.getv(prop));
      },

      type: /** @lends pentaho.type.filter.Property.Type# */{
        id: module.id,

        isAbstract: true,

        styleClass: "pentaho-type-filter-property",

        props: [
          {
            name: "property",
            nameAlias: "p",
            type: "string",
            isRequired: true
          }
        ]
      }
    });
  };
});
