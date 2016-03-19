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
  "./Type",
  "./SpecificationScope",
  "../lang/Base",
  "../util/error",
  "../util/object"
], function(Type, SpecificationScope, Base, error, O) {

  "use strict";

  var _keyArgsExcludeInstance = {exclude: {type: 1}};

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
   *
   * @see pentaho.type.spec.IInstance
   * @see pentaho.type.spec.IInstanceProto
   * @see pentaho.type.spec.ITypeProto
   */
  var Instance = Base.extend("pentaho.type.Instance", /** @lends pentaho.type.Instance# */{
    // NOTE: not calling base to block default Base.js from copying 1st argument into `this`.
    constructor: function() {
    },

    // Properties to ignore within extend
    extend_exclude: {_: 1},

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
    },
    //endregion

    //region serialization
    /**
     * Creates a top-level specification that describes this instance.
     *
     * This method creates a new {@link pentaho.type.SpecificationScope} for describing
     * this instance, and any other instances and types it references,
     * delegating the actual work to {@link pentaho.type.Instance#toSpecInScope}.
     *
     * @param {Object} [keyArgs] - The keyword arguments object.
     * Passed to every instance and type serialized within this scope.
     *
     * Please see the documentation of subclasses for information on additional, supported keyword arguments.
     *
     * @param {boolean} [keyArgs.omitRootType=false] - Omits the inline type property, `_`,
     * on the root (`this`) value specification.
     *
     * @return {!any} A specification of this instance.
     */
    toSpec: function(keyArgs) {
      if(!keyArgs) keyArgs = {};

      var scope = new SpecificationScope();
      var requireType = !keyArgs.omitRootType;
      var spec = this.toSpecInScope(scope, requireType, keyArgs);

      scope.dispose();

      return spec;
    },

    /**
     * Creates a specification that describes this instance under a given scope.
     *
     * @param {!pentaho.type.SpecificationScope} scope - The specification scope.
     * @param {boolean} requireType - Requires inlining the type of this instance in the specification.
     * @param {!Object} keyArgs - The keyword arguments object.
     * Passed to every instance serialized within this scope.
     *
     * Please see the documentation of subclasses for information on additional, supported keyword arguments.
     *
     * @return {!any} A specification of this instance.
     *
     * @abstract
     *
     * @see pentaho.type.Instance#toSpec
     */
    toSpecInScope: function(scope, requireType, keyArgs) {
      /* istanbul ignore next : abstract method */
      throw error.notImplemented();
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
      var ka = keyArgs ? Object.create(keyArgs) : {};
      ka.instance = subInstProto;

      baseInstProto.type._extendProto(instSpec && instSpec.type, ka);

      // INSTANCE II
      // Don't process `instSpec.type` twice, during construction.
      return subInstProto.extend(instSpec, _keyArgsExcludeInstance);
    },

    // override the documentation to specialize the argument types.
    /**
     * Creates a subtype of this one.
     *
     * For more information on class extension, in general,
     * see {@link pentaho.lang.Base.extend}.
     *
     * @name extend
     * @memberOf pentaho.type.Instance
     *
     * @param {string} [name] The name of the created class. Used for debugging purposes.
     * @param {pentaho.type.spec.IInstanceProto} [instSpec] The instance specification.
     * @param {Object} [classSpec] The static specification.
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * @return {!Class.<pentaho.type.Value>} The new value subclass.
     *
     * @see pentaho.lang.Base.extend
     */

    //@override
    /**
     * See Base.js
     * @ignore
     */
    _subclassed: function(SubInstCtor, instSpec, classSpec, keyArgs) {
      // 1. `instSpec` may override property accessors only defined by `Complex.Type`
      // 2. So, the Type class must be created *before* applying instSpec and classSpec to SubInstCtor
      // 3. The Type class requires InstCtor to already exist, to be able to define accessors

      // Setting a function's name is failing on PhantomJS 1.9.8...
      var instName = SubInstCtor.name || SubInstCtor.displayName,
          typeName = instName && (instName + ".Type");

      var ka = keyArgs ? Object.create(keyArgs) : {};
      ka.instance = SubInstCtor.prototype;

      this.Type.extend(typeName, instSpec && instSpec.type, classSpec && classSpec.type, ka);

      // Don't process `instSpec.type` and `classSpec.type` twice, during construction.
      SubInstCtor.mix(instSpec, classSpec, _keyArgsExcludeInstance);
    }
  });

  Type._initInstCtor(Instance);

  return Instance;
});
