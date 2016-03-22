/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "./Type",
  "../lang/Base",
  "../util/error",
  "../util/object"
], function(Type, Base, error, O) {

  "use strict";

  /**
   * @name pentaho.type.Instance
   * @class
   * @abstract
   * @amd pentaho/type/Instance
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
   * The **type class** of the _Instance_ type is {@link pentaho.type.Type}.
   *
   * When creating a subclass `Foo` of [Instance]{@link pentaho.type.Instance},
   * the corresponding type class is implicitly generated
   * (a subclass of [Type]{@link pentaho.type.Type}),
   * and its singleton object is placed in the static property
   * [Foo.type]{@link pentaho.type.Instance.type}.
   *
   * Instances of the type `Foo` can also conveniently access the type's singleton object
   * through the instance property [this.type]{@link pentaho.type.Instance#type}.
   *
   * The instance and type classes of a type are closely bound and
   * must naturally reference each other.
   * The type singleton object references back the prototype of the instance class,
   * in a property named [instance]{@link pentaho.type.Type#instance}.
   *
   * @example
   * <caption> Create a new class <code>Derived</code> containing
   * an attribute <code>greeting</code> and a method <code>doSomething</code> </caption>
   *
   * require(["pentaho/type/Instance"], function(Instance) {
   *   var Derived = Instance.extend({
   *     constructor: function(label) {
   *       this.label = label;
   *     },
   *     type: { // type specification
   *       greeting: "Hello, ",
   *       veryLongString: "..."
   *     },
   *     saySomething: function() {
   *       console.log(this.type.greeting + this.label + "!");
   *     }
   *   });
   *
   *   var a = new Derived("Alice");
   *   a.saySomething(); // "Hello, Alice!"
   *
   *   var b = new Derived("Bob");
   *   b.saySomething(); // "Hello, Bob!"
   *
   *   // All instances share the same _type_:
   *   b.type.greeting ===  a.type.greeting // true
   * });
   *
   * @description Creates an instance of this type.
   */
  var Instance = Base.extend("pentaho.type.Instance", /** @lends pentaho.type.Instance# */{
    // NOTE: not calling base to block default Base.js from copying 1st argument into `this`.
    constructor: function() {
    },

    //region type property
    _type: null, // Set on Type#_init

    /**
     * Gets the type of this instance.
     *
     * @type pentaho.type.Type
     * @readonly
     * @see pentaho.type.Instance.type
     * @see pentaho.type.Type#instance
     */
    get type() {
      return this._type;
    },

    // Supports Type instance-level configuration only. Can only be called on the prototype,
    //  through Instance#implement!
    // Not documented on purpose, to avoid users trying to configure a type
    //  when they already have an instance of it, which is not supported...
    // However, this is the simplest and cleanest way to implement:
    //   Instance.implement({type: {.}})
    // to mean
    //   Type.implement({.}).instance.constructor
    set type(config) {
      // Class.implement essentially just calls Class#extend.
      if(config) this.type.extend(config);
    }
    //endregion
  }, /** @lends pentaho.type.Instance */{

    //region type property
    /**
     * Gets the type of this instance constructor.
     *
     * @type pentaho.type.Type
     * @readonly
     */
    get type() {
      return this.prototype.type;
    },

    // Supports Type class-level configuration only.
    // Not documented on purpose.
    // Allows writing;
    //   Instance.implementStatic({type: .})
    // to mean:
    //   Type#implementStatic(.).instance.constructor
    set type(config) {
      if(config) this.type.constructor.implementStatic(config);
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
     * @param {pentaho.type.Instance} [baseInstProto] The base instances' prototype.
     *   When nully, defaults to the prototype of this instance constructor.
     *
     * @param {object} [instSpec] The new type specification.
     * @param {object} [keyArgs] Keyword arguments.
     *
     * @return {pentaho.type.Instance} The instances' prototype of the created subtype.
     */
    extendProto: function(baseInstProto, instSpec, keyArgs) {
      if(!instSpec) instSpec = {};
      if(!baseInstProto) baseInstProto = this.prototype;

      // INSTANCE I
      var subInstProto = Object.create(baseInstProto);

      // TYPE
      var typeInstSpec = O["delete"](instSpec, "type");

      var ka  = keyArgs ? Object.create(keyArgs) : {};
      ka.instance = subInstProto;

      baseInstProto.type._extendProto(typeInstSpec, ka);

      // INSTANCE II
      return subInstProto.extend(instSpec);
    },

    //@override
    /**
     * See Base.js
     * @ignore
     */
    _subClassed: function(SubInstCtor, instSpec, classSpec, keyArgs) {
      // 1. `instSpec` may override property accessors only defined by `Complex.Type`
      // 2. So, the Type class must be created *before* applying instSpec and classSpec to SubInstCtor
      // 3. The Type class requires InstCtor to already exist, to be able to define accessors
      var typeInstSpec  = O["delete"](instSpec, "type"),
          typeClassSpec = O["delete"](classSpec, "type"),
          // Setting a function's name is failing on PhantomJS 1.9.8...
          instName      = SubInstCtor.name || SubInstCtor.displayName,
          typeName      = instName && (instName + ".Type");

      var ka  = keyArgs ? Object.create(keyArgs) : {};
      ka.instance = SubInstCtor.prototype;

      this.Type.extend(typeName, typeInstSpec, typeClassSpec, ka);

      SubInstCtor.mix(instSpec, classSpec);
    }
  });

  Type._initInstCtor(Instance);

  return Instance;
});
