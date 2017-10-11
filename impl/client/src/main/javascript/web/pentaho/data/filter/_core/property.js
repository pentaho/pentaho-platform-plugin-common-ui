/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
define(function() {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.Property.Type
     * @class
     * @extends pentaho.data.filter.Abstract.Type
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
     * @amd {pentaho.type.spec.UTypeModule<pentaho.data.filter.Property>} pentaho/data/filter/property
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

      /**
       * Determines if a property value is such that the owner element is selected by this filter.
       *
       * @name _operation
       * @memberOf pentaho.data.filter.Property#
       * @method
       *
       * @param {!pentaho.type.Element} elem - The element to be tested
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
       */
      _contains: function(elem) {
        return elem.$type.has(this.property) && this._operation(elem);
      },

      $type: /** @lends pentaho.data.filter.Property.Type# */{
        id: "pentaho/data/filter/property",
        isAbstract: true,
        props: [
          {
            name: "property",
            nameAlias: "p",
            valueType: "string",
            isRequired: true,
            isReadOnly: true
          }
        ]
      }
    });
  };
});
