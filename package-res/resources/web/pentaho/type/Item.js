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
  "../lang/Base",
  "../util/error",
  "../util/object"
], function(ItemMeta, Base, error, O) {

  "use strict";

  /**
   * @name pentaho.type.Item
   * @class
   * @abstract
   *
   * @classDesc The base class of types in the Pentaho Client Metadata Model.
   *
   * The `pentaho.type.Item` class (and its descendants) embeds its own metadata,
   * which can be accessed via the property {@link pentaho.type.Item#meta}.
   * Because the metadata can be inherited, it is actually an instance
   * of a metaclass stored at {@link pentaho.type.Item.Meta}.
   *
   * The developer is expected to subclass only the {@link pentaho.type.Item} class,
   * as the corresponding companion class is automatically generated from the spec
   * passed to the {@link pentaho.type.Item#meta} property.
   *
   * Other frameworks generally require the developer to maintain two class hierarchies
   * (one for storing data, another for storing metadata) and ensure that the
   * two hierarchies are properly linked together.
   * This framework attempts to simplify the development process by automating the
   * the generation and linking of the class that describes the metadata.
   *
   * @example
   * <caption> Create a new class <code>DerivedItem</code> containing
   * an attribute <code>greeting</code> and a method <code>doSomething</code> </caption>
   *
   * require(["pentaho/type/Item"], function(Item){
   *   var DerivedItem = Item.extend({
   *     constructor: function(label){
   *       this.label = label;
   *     },
   *     meta: { // metadata spec
   *       greeting: "Hello, ",
   *       veryLongString: "..."
   *     },
   *     saySomething: function(){
   *       console.log(this.meta.greeting + this.label + "!");
   *     }
   *   });
   *
   *   var a = new DerivedItem("Alice");
   *   a.saySomething(); // "Hello, Alice!"
   *   var b = new DerivedItem("Bob");
   *   b.saySomething(); // "Hello, Bob!"
   *
   *   // All instances share the same _meta_:
   *   b.meta.greeting ===  a.meta.greeting // true
   * });
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
     * Gets the singleton that describes the metadata associated with this type.
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
    },
    //endregion

    //region validation
    /**
     * Performs validation of this item.
     *
     * When invalid, returns either one `Error` or a non-empty array of `Error` objects.
     * When valid, `null` is returned.
     *
     * @return {Error|Array.<!Error>|null} An `Error`, a non-empty array of `Error` or `null`.
     */
    validate: function() {
      return null;
    },

    /**
     * Gets a value that indicates if this value is valid.
     *
     * This property evaluates {@link pentaho.type.Value#validate} and
     * returns whether no errors were returned.
     *
     * @type boolean
     * @readonly
     */
    get isValid() {
      return !this.validate();
    }
    //endregion

  }, /** @lends pentaho.type.Item */{

    //region meta property
    /**
     * Gets the singleton that describes the metadata associated with this type.
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
     * @param {pentaho.type.Item} [mesa] The prototype of the class used for representing the data.
     *   When nully, defaults to the prototype of the constructor
     *   where this method is called.
     *
     * @param {object} [instSpec] The specification of the prototype that will be returned by this function.
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
      var metaInstSpec = O["delete"](instSpec, "meta");

      var ka  = keyArgs ? Object.create(keyArgs) : {};
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
      var metaInstSpec  = O["delete"](instSpec, "meta"),
          metaClassSpec = O["delete"](classSpec, "meta"),
          // Setting a function's name is failing on PhantomJS 1.9.8...
          mesaName      = SubMesa.name || SubMesa.displayName,
          metaName      = mesaName && (mesaName + ".Meta");

      var ka  = keyArgs ? Object.create(keyArgs) : {};
      ka.mesa = SubMesa.prototype;

      this.Meta.extend(metaName, metaInstSpec, metaClassSpec, ka);

      SubMesa.mix(instSpec, classSpec);
    }
  });

  ItemMeta._initMesa(Item);

  return Item;
});
