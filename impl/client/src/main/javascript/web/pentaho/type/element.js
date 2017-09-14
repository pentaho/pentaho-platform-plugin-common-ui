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
  "../i18n!types",
  "../util/object",
  "../util/error",
  "../util/fun"
], function(module, bundle, O, error, fun) {

  "use strict";

  return ["value", function(Value) {

    var __elemType = null;

    /**
     * @name pentaho.type.Element.Type
     * @class
     * @extends pentaho.type.Value.Type
     *
     * @classDesc The base type class of *singular* value types.
     *
     * For more information see {@link pentaho.type.Element}.
     */

    /**
     * @name pentaho.type.Element
     * @class
     * @extends pentaho.type.Value
     * @amd {pentaho.type.spec.UTypeModule<pentaho.type.Element>} pentaho/type/element
     *
     * @classDesc The base class of singular values.
     *
     * @description Creates an element instance.
     *
     * @see pentaho.type.List
     */
    var Element = Value.extend({

      // @override
      /**
       * Determines if a given value, of the same type, represents the same entity with the same content.
       *
       * @param {!pentaho.type.Value} other - A value to test for equality.
       * @return {boolean} `true` if the values have the same content; or, `false`, oterhwise.
       */
      equalsContent: function(other) {
        return false;
      },

      $type: /** @lends pentaho.type.Element.Type# */{

        id: module.id,
        alias: "element",
        isAbstract: true,

        get isElement() { return true; },

        // region format

        // TODO: recursively inherit? clone? merge on set?

        // -> Optional({}), Inherited, Configurable
        __format: undefined,

        get format() {
          /* istanbul ignore next : not implemented method */
          return this.__format;
        },

        set format(value) {
          /* istanbul ignore next : not implemented method */

          if(value == null) {
            if(this !== __elemType) {
              delete this.__format;
            }
          } else {
            this.__format = value || {};
          }
        },
        // endregion

        // region compare method
        /**
         * Compares two values according to their order.
         *
         * If the two values are identical, as per JavaScript's `===` operator, they have the same order.
         * If both values are {@link Nully}, they have the same order.
         * If only one of the values is {@link Nully},
         * that value is considered to occur _before_, and the other, _after_.
         * If the two values are considered equal according to {@link pentaho.type.Value.Type#_areEqual},
         * then they have the same order.
         * Otherwise, the operation is delegated to {@link pentaho.type.Element.Type#_compare}.
         *
         * @param {any} va - The first value.
         * @param {any} vb - The second value.
         *
         * @return {number} `-1` if `va` is considered _before_ `vb`; `1` is `va` is considered _after_ `vb`;
         * `0`, otherwise.
         */
        compare: function(va, vb) {
          // Quick bailout tests
          if(va === vb) return 0;
          if(va == null) return vb == null ? 0 : -1;
          if(vb == null) return 1;

          return this._areEqual(va, vb) ? 0 : this._compare(va, vb);
        },

        /**
         * Compares two non-equal, non-{@link Nully} values according to their order.
         *
         * The default implementation compares the two values
         * by natural ascending order of their data type.
         * If both values are numbers, numeric order is used.
         * Otherwise, their string representations are compared in lexicographical order.
         *
         * @param {any} va - The first value.
         * @param {any} vb - The second value.
         *
         * @return {number} `-1` if `va` is considered _before_ `vb`; `1` is `va` is considered _after_ `vb`;
         * `0`, otherwise.
         *
         * @protected
         */
        _compare: function(va, vb) {
          return fun.compare(va, vb);
        },
        // endregion

        /**
         * Intersects two element arrays whose declared element type is this type.
         *
         * If this type is a simple type,
         * the intersection preserves the instance which has a `formatted` value.
         * When both have one, the elements of `elemsB` are preserved.
         *
         * Removes duplicates of `elemsB`, keeping the first occurrence.
         *
         * @param {!Array.<pentaho.type.Element>} elemsA - The previous array of elements.
         * @param {!Array.<pentaho.type.Element>} elemsB - The next array of elements.
         *
         * @return {!Array.<pentaho.type.Element>} The intersection array, possibly empty.
         *
         * @private
         * @internal
         */
        __intersect: function(elemsA, elemsB) {
          var elemsAByKey = {};
          O.eachOwn(elemsA, function(elemA0) { elemsAByKey[elemA0.$key] = elemA0; });

          // Output order is that of `elemsB`.
          var isSimple = this.isSimple;
          var elemsC = [];
          var elemsCByKey = {};
          var i = -1;
          var countB = elemsB.length;
          while(++i < countB) {
            var elemB = elemsB[i];
            var key = elemB.$key;
            var elemA = O.getOwn(elemsAByKey, key);
            if(elemA && !O.hasOwn(elemsCByKey, key)) {
              // The formatted value of elemB overrides that of elemA. Keep elemB if it has a formatted value.
              var elemC = (!isSimple || elemB.formatted) ? elemB : elemA;
              elemsCByKey[key] = elemC;
              elemsC.push(elemC);
            }
          }

          return elemsC;
        }
      }
    }).implement({
      $type: bundle.structured.element
    });

    __elemType = Element.type;

    return Element;
  }];
});
