/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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

    var _elemMeta = null;

    /**
     * @name pentaho.type.Element.Meta
     * @class
     * @extends pentaho.type.Value.Meta
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
     * @amd pentaho/type/element
     *
     * @classDesc
     *
     * ### AMD
     *
     * Module Id: `pentaho/type/element`
     *
     * The AMD module returns the type's factory, a
     * {@link pentaho.type.Factory<pentaho.type.Element>}.
     *
     * @description Creates an element instance.
     */
    var Element = Value.extend("pentaho.type.Element", {
      meta: /** @lends pentaho.type.Element.Meta# */{

        id: module.id,

        styleClass: "pentaho-type-element",

        //region list property
        //@override
        /**
         * Gets a value that indicates if a type is a list type.
         *
         * This implementation is sealed and always returns `false`.
         *
         * @name list
         * @memberOf pentaho.type.Element.Meta#
         * @type boolean
         * @readOnly
         * @sealed
         */
        get list() {
          return false;
        },
        //endregion

        //region format

        // TODO: recursively inherit? clone? merge on set?

        // -> Optional({}), Inherited, Configurable
        _format: undefined,

        get format() {
          return this._format;
        },

        set format(value) {
          if(value == null) {
            if(this !== _elemMeta) {
              delete this._format;
            }
          } else {
            this._format = value || {};
          }
        },
        //endregion

        //region compare method

        // TODO: document equals consistency and 0 result
        // Should be consistent with result of Value#equals
        // Should be consistent with result of Value#key
        // areEqual => compare -> 0
        // areEqual => key1 === key2

        // Configurable in a special way.
        // Setting always sets the core.
        // Getting always gets the wrapper.
        get compare() {
          return compareTop;
        },

        // NOTE: the argument cannot have the same name as the property setter
        // or PhantomJS 1.9.8 will throw a syntax error...
        set compare(_) {
          this._compare = _ || compareCore;
        },

        _compare: compareCore
        //endregion
      }
    }).implement({
      meta: bundle.structured.element
    });

    _elemMeta = Element.meta;

    return Element;
  };

  //region compare private methods
  // consistent with isEmpty and areEqual
  function compareTop(va, vb) {
    // Quick bailout test
    if(va ===  vb) return 0;
    if(va == null) return vb == null ? 0 : 1;
    if(vb == null) return -1;
    return (va.constructor === vb.constructor && va.equals(vb))
        ? 0
        : this._compare(va, vb);
  }

  // natural ascending comparer of non-equal, non-empty values
  function compareCore(va, vb) {
    return fun.compare(va, vb);
  }
  //endregion
});
