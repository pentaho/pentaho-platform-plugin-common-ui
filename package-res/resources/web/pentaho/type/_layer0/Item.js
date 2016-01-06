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
  "./Item.Meta",
  "../../lang/Base",
  "../../util/error",
  "../../util/object"
], function(ItemMeta, Base, error, O) {

  "use strict";

  /**
   * @name pentaho.type.Item
   * @class
   * @abstract
   *
   * @classDesc The abstract base class of _item_ types.
   *
   * The metadata (prototype) of this class can be accessed through {@link pentaho.type.Item#meta}.
   *
   * @description Creates an instance.
   */
  var Item = Base.extend("pentaho.type.Item", /** @lends pentaho.type.Item# */{
    // NOTE: not calling base to block default Base.js from copying 1st argument into `this`.
    constructor: function() {
    },

    //region meta property
    _meta: null,

    /**
     * Gets the _metadata_ _prototype_ of this item type.
     *
     * @name meta
     * @memberOf pentaho.type.Item#
     * @type pentaho.type.Item.Meta
     * @readonly
     * @abstract
     * @see pentaho.type.Item.Meta#mesa
     */
    get meta() {
      return this._meta;
    },

    // Supports Meta instance-level configuration only. Can only be called on the prototype,
    //  through Item#implement!
    // Not documented on purpose, to avoid users trying to configure an item
    //  when they already have an instance of it, which is not supported...
    // However, this is the simplest and cleanest way to implement:
    //   Item.implement({meta: {.}})
    // to mean
    //   Item.Meta.implement({.}).Mesa
    set meta(config) {
      // Class.implement essentially just calls Class#extend.
      if(config) this.meta.extend(config);
    }
    //endregion
  }, /** @lends pentaho.type.Item */{

    //region meta property
    /**
     * Gets the _metadata_ _prototype_ of this item type.
     *
     * @type pentaho.type.Item.Meta
     * @readonly
     */
    get meta() {
      return this.prototype.meta;
    },

    // Supports Meta class-level configuration only.
    // Not documented on purpose.
    // Allows writing;
    //   Item.implementStatic({meta: .})
    // to mean:
    //   Item.Meta#implementStatic(.).Mesa
    set meta(config) {
      if(config) this.meta.constructor.implementStatic(config);
    },
    //endregion

    /**
     * Creates a sub-prototype of a given one.
     *
     * This method creates a _prototype_ which does not have an own constructor.
     * The current constructor is kept.
     *
     * To create a _prototype_ with a constructor,
     * extend from the base constructor instead, by calling its `extend` method.
     *
     * @param {pentaho.type.Item} [mesa] The base _mesadata_ prototype.
     *   When nully, defaults to the prototype of the constructor
     *   where this method is called.
     *
     * @param {object} [instSpec] The sub-prototype specification.
     * @param {object} [keyArgs] Keyword arguments.
     *
     * @return {pentaho.type.Item} The created sub-prototype.
     */
    extendProto: function(mesa, instSpec, keyArgs) {
      if(!instSpec) instSpec = {};
      if(!mesa) mesa = this.prototype;

      // MESA I
      var subMesa = Object.create(mesa);

      // META
      var metaInstSpec = O["delete"](instSpec,  "meta");

      var ka = keyArgs ? Object.create(keyArgs) : {};
      ka.mesa = subMesa;

      mesa.meta._extendProto(metaInstSpec, ka);

      // MESA II
      return subMesa.extend(instSpec);
    },

    /**
     * @override
     * @ignore
     */
    _subClassed: function(SubMesa, instSpec, classSpec, keyArgs) {
      // 1. `instSpec` may override property accessors only defined by `Complex.Meta`
      // 2. So, the Meta class must be created *before* applying instSpec and classSpec to SubMesa
      // 3. The Meta class requires Mesa to already exist, to be able to define accessors
      var metaInstSpec  = O["delete"](instSpec,  "meta"),
          metaClassSpec = O["delete"](classSpec, "meta"),
          // Setting a function's name is failing on PhantomJS 1.9.8...
          mesaName      = SubMesa.name || SubMesa.displayName,
          metaName      = mesaName && (mesaName + ".Meta");

      var ka = keyArgs ? Object.create(keyArgs) : {};
      ka.mesa = SubMesa.prototype;

      this.Meta.extend(metaName, metaInstSpec, metaClassSpec, ka);

      SubMesa.mix(instSpec, classSpec);
    }
  });

  ItemMeta._initMesa(Item);

  return Item;
});
