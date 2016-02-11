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
   * @classDesc The base **instance class** of types in the Pentaho Client Metadata Model.
   *
   * Types of the metadata model are constituted by two classes (or constructors):
   * the **instance class** and the **type class**.
   *
   * The former creates the actual instances of the type.
   * The latter creates a single object (a singleton) that **represents the type**,
   * is shared by all instances of the type,
   * and, essentially, holds its metadata.
   *
   * The **type class** of the _Item_ type is {@link pentaho.type.Item.Meta}.
   *
   * When creating a subclass `Foo` of [Item]{@link pentaho.type.Item},
   * the corresponding type metadata class is implicitly generated
   * (a subclass of [Item.Meta]{@link pentaho.type.Item.Meta}),
   * and its singleton object is placed in the static property
   * [Foo.meta]{@link pentaho.type.Item.meta}.
   *
   * Instances of the type `Foo` can also conveniently access the type's singleton object
   * through the instance property [this.meta]{@link pentaho.type.Item#meta}.
   *
   * The instance and type classes of a type are closely bound and
   * must naturally reference each other.
   * The type singleton object references back the prototype of the instance class,
   * in a property named [mesa]{@link pentaho.type.Item.Meta#mesa}.
   *
   * @example
   * <caption> Create a new class <code>DerivedItem</code> containing
   * an attribute <code>greeting</code> and a method <code>doSomething</code> </caption>
   *
   * require(["pentaho/type/Item"], function(Item) {
   *   var DerivedItem = Item.extend({
   *     constructor: function(label) {
   *       this.label = label;
   *     },
   *     meta: { // metadata spec
   *       greeting: "Hello, ",
   *       veryLongString: "..."
   *     },
   *     saySomething: function() {
   *       console.log(this.meta.greeting + this.label + "!");
   *     }
   *   });
   *
   *   var a = new DerivedItem("Alice");
   *   a.saySomething(); // "Hello, Alice!"
   *
   *   var b = new DerivedItem("Bob");
   *   b.saySomething(); // "Hello, Bob!"
   *
   *   // All instances share the same _meta_:
   *   b.meta.greeting ===  a.meta.greeting // true
   * });
   *
   * @description Creates an instance of this type.
   */
  var Item = Base.extend("pentaho.type.Item", /** @lends pentaho.type.Item# */{
    // NOTE: not calling base to block default Base.js from copying 1st argument into `this`.
    constructor: function() {
    },

    //region meta property
    _meta: null, // Set on Item.Meta#_init

    /**
     * Gets the type of this instance.
     *
     * @type pentaho.type.Item.Meta
     * @readonly
     * @see pentaho.type.Item.meta
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
    //   Item.Meta.implement({.}).mesa.constructor
    set meta(config) {
      // Class.implement essentially just calls Class#extend.
      if(config) this.meta.extend(config);
    }
    //endregion
  }, /** @lends pentaho.type.Item */{

    //region meta property
    /**
     * Gets the type of this instance constructor.
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
    //   Item.Meta#implementStatic(.).mesa.constructor
    set meta(config) {
      if(config) this.meta.constructor.implementStatic(config);
    },
    //endregion

    /**
     * Creates a subtype of a given one.
     *
     * This method creates a subtype which does not have an own instance constructor.
     * The base type's instance constructor is used to _initialize_ instances.
     *
     * To create a type with an own constructor,
     * extend from the base constructor instead,
     * by calling its `extend` method.
     *
     * @param {pentaho.type.Item} [baseInstProto] The base instances' prototype.
     *   When nully, defaults to the prototype of this instance constructor.
     *
     * @param {object} [instSpec] The new type specification.
     * @param {object} [keyArgs] Keyword arguments.
     *
     * @return {pentaho.type.Item} The instances' prototype of the created subtype.
     */
    extendProto: function(baseInstProto, instSpec, keyArgs) {
      if(!instSpec) instSpec = {};
      if(!baseInstProto) baseInstProto = this.prototype;

      // MESA I
      var subInstProto = Object.create(baseInstProto);

      // META
      var metaInstSpec = O["delete"](instSpec, "meta");

      var ka  = keyArgs ? Object.create(keyArgs) : {};
      ka.mesa = subInstProto;

      baseInstProto.meta._extendProto(metaInstSpec, ka);

      // MESA II
      return subInstProto.extend(instSpec);
    },

    //@override
    /**
     * See Base.js
     * @ignore
     */
    _subClassed: function(SubInstCtor, instSpec, classSpec, keyArgs) {
      // 1. `instSpec` may override property accessors only defined by `Complex.Meta`
      // 2. So, the Type class must be created *before* applying instSpec and classSpec to SubInstCtor
      // 3. The Type class requires InstCtor to already exist, to be able to define accessors
      var metaInstSpec  = O["delete"](instSpec, "meta"),
          metaClassSpec = O["delete"](classSpec, "meta"),
          // Setting a function's name is failing on PhantomJS 1.9.8...
          mesaName      = SubInstCtor.name || SubInstCtor.displayName,
          metaName      = mesaName && (mesaName + ".Meta");

      var ka  = keyArgs ? Object.create(keyArgs) : {};
      ka.mesa = SubInstCtor.prototype;

      this.Meta.extend(metaName, metaInstSpec, metaClassSpec, ka);

      SubInstCtor.mix(instSpec, classSpec);
    }
  });

  ItemMeta._initInstCtor(Item);

  return Item;
});
