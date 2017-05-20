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
  "./value",
  "../i18n!types",
  "../util/error",
  "../util/fun"
], function(module, valueFactory, bundle, error, fun) {

  "use strict";

  return function(context) {

    var _elemType = null;

    /**
     * @name pentaho.type.Element.Type
     * @class
     * @extends pentaho.type.Value.Type
     *
     * @classDesc The base type class of *singular* value types.
     *
     * For more information see {@link pentaho.type.Element}.
     */

    var Value = context.get(valueFactory);

    /**
     * @name pentaho.type.Element
     * @class
     * @extends pentaho.type.Value
     * @amd {pentaho.type.Factory<pentaho.type.Element>} pentaho/type/element
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
       */
      equalsContent: function(other) {
        return false;
      },

      type: /** @lends pentaho.type.Element.Type# */{

        id: module.id,
        alias: "element",
        isAbstract: true,

        get isElement() { return true; },

        // region format

        // TODO: recursively inherit? clone? merge on set?

        // -> Optional({}), Inherited, Configurable
        _format: undefined,

        get format() {
          /* istanbul ignore next : not implemented method */
          return this._format;
        },

        set format(value) {
          /* istanbul ignore next : not implemented method */

          if(value == null) {
            if(this !== _elemType) {
              delete this._format;
            }
          } else {
            this._format = value || {};
          }
        },
        // endregion

        // region compare method

        // TODO: document equals consistency and 0 result
        // Should be consistent with result of Value#equals
        // Should be consistent with result of Value#key
        // areEqual => compare -> 0
        // areEqual => key1 === key2

        // Configurable in a special way.
        // Setting always sets the core.
        // Getting always gets the wrapper.
        get compare() {
          /* istanbul ignore next : not implemented method */
          return compareTop;
        },

        set compare(_) {
          /* istanbul ignore next : not implemented method */
          this._compare = _ || compareCore;
        },

        _compare: compareCore
        // endregion
      }
    }).implement({
      type: bundle.structured.element
    });

    _elemType = Element.type;

    return Element;
  };

  // region compare private methods
  // consistent with isEmpty and areEqual
  /* istanbul ignore next : not implemented method */
  function compareTop(va, vb) {
    // Quick bailout test
    if(va === vb) return 0;
    if(va == null) return vb == null ? 0 : 1;
    if(vb == null) return -1;

    return (va.constructor === vb.constructor && va.equals(vb))
        ? 0
        : this._compare(va, vb);
  }

  // natural ascending comparer of non-equal, non-empty values
  /* istanbul ignore next : not implemented method */
  function compareCore(va, vb) {
    return fun.compare(va, vb);
  }
  // endregion
});
