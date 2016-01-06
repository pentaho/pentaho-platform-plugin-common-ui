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
  "./value",
  "./PropertyMetaCollection",
  "../../i18n!../i18n/types",
  "../../util/object"
], function(valueFactory, PropertyMetaCollection, bundle, O) {

  "use strict";

  // TODO: self-recursive complexes won't work if we don't handle them specially:
  // Component.parent : Component
  // Will cause requiring Component during it's own build procedure...
  // Need to recognize requests for the currently being built _top-level_ complex in a special way -
  // the one that cannot be built and have a module id.

  /**
   * Creates the `Complex` class for the given context.
   *
   * ### AMD
   *
   * Module Id: `pentaho/type/complex`
   *
   * @alias complexFactory
   * @memberOf pentaho.type
   * @type pentaho.type.Factory
   * @amd pentaho/type/complex
   * @return {Class.<pentaho.type.Complex>} The `Complex` class of the given context.
   */
  return function(context) {

    var Value = context.get(valueFactory);

    /**
     * @name pentaho.type.Complex.Meta
     * @class
     * @extends pentaho.type.Value.Meta
     *
     * @classDesc The metadata class of {@link pentaho.type.Complex}.
     */

    /**
     * @name pentaho.type.Complex
     * @class
     * @extends pentaho.type.Value
     *
     * @classDesc The base class of complex types.
     *
     * Example complex type:
     * ```javascript
     * define(["pentaho/type/complex"], function(complexFactory) {
     *
     *   return function(context) {
     *
     *     var Complex = context.get(complexFactory);
     *
     *     return Complex.extend({
     *       meta: {
     *         // Properties
     *         props: [
     *           {name: "name", type: "string", label: "Name"},
     *           {name: "category", type: "string", label: "Category", list: true},
     *           {name: "price", type: "number", label: "Price"}
     *         ]
     *       }
     *     });
     *   };
     *
     * });
     * ```
     *
     * @description Creates a complex instance.
     */
    var Complex = Value.extend("pentaho.type.Complex", {

      // Note: neither `Value` or `Item` do anything in their constructor,
      // so, in the name of performance, we're purposely not calling base.
      constructor: function(spec) {
        // Create `Property` instances.
        var pMetas = this.meta.props,
            i = pMetas.length,
            nameProp = !spec ? undefined : ((spec instanceof Array) ? "index" : "name"),
            pMeta;

        while(i--) {
          pMeta = pMetas[i];
          this[pMeta._namePriv] = pMeta.create(this, nameProp && spec[pMeta[nameProp]]);
        }
      },

      get: function(name) {
        var pMeta = this.meta.props.get(name);
        return pMeta ? this[pMeta._namePriv] : null;
      },

      getValue: function(name, dv) {
        var pMeta = this.meta.props.get(name);
        return pMeta ? this[pMeta._namePriv].value : dv;
      },

      meta: /** @lends pentaho.type.Complex.Meta# */{
        id: "pentaho/type/complex",

        "abstract": true,

        styleClass: "pentaho-type-complex",

        //region properties property
        _props: null,

        /**
         * Gets or configures (when set) the `Property.Meta` collection of the complex type.
         *
         * To _configure_ the properties _set_ `props` with
         * any value accepted by {@link pentaho.type.PropertyMetaCollection#configure}.
         *
         * @type pentaho.type.PropertyMetaCollection
         * @readonly
         */
        get props() {
          // Always get/create from/on the class' prototype.
          // Lazy creation.
          var proto = this.constructor.prototype;
          return O.getOwn(proto, "_props") ||
              (proto._props = PropertyMetaCollection.to([], /*declaringMeta:*/this));
        },

        set props(propSpecs) {
          this.props.configure(propSpecs);
        }
        //endregion
      }
    }).implement({
      meta: bundle.structured.complex
    });

    return Complex;
  };
});
