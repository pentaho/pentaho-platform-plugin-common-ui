/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "./InstanceType",
  "./SpecificationScope",
  "pentaho/i18n!types",
  "pentaho/lang/Base",
  "pentaho/util/error",
  "pentaho/util/object"
], function(module, Type, SpecificationScope, bundle, Base, error, O) {

  "use strict";

  /**
   * @name pentaho.type.Instance
   * @class
   * @abstract
   * @amd pentaho/type/Instance
   *
   * @classDesc The root, abstract class of things that can be represented by the Pentaho Type API.
   *
   * _Types_ are constituted by two classes (or constructors):
   * the **instance class** and the **type class**.
   *
   * The former creates the actual instances of the type.
   * The latter creates a single object (a singleton) that **represents the type**,
   * which is shared by all instances of the type,
   * and essentially, holds its metadata.
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
   * through the instance property [this.$type]{@link pentaho.type.Instance#$type}.
   *
   * The instance and type classes of a type are closely bound and
   * must naturally reference each other.
   * The type singleton object references back the prototype of the instance class,
   * in a property named [instance]{@link pentaho.type.Type#instance}.
   *
   * @example
   * <caption>
   *   Create a new class <code>Derived</code> containing an attribute
   *   <code>greeting</code> and a method <code>doSomething</code>.
   * </caption>
   *
   * require(["pentaho/type/Instance"], function(Instance) {
   *
   *   var Derived = Instance.extend({
   *     constructor: function(label) {
   *       this.label = label;
   *     },
   *     $type: { // type specification
   *       greeting: "Hello, ",
   *       veryLongString: "..."
   *     },
   *     saySomething: function() {
   *       console.log(this.$type.greeting + this.label + "!");
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
   *   b.$type.greeting ===  a.$type.greeting // true
   * });
   *
   * @description Creates an instance of this type.
   *
   * @see pentaho.type.spec.IInstance
   * @see pentaho.type.spec.IType
   */
  var Instance = Base.extend("pentaho.type.Instance", /** @lends pentaho.type.Instance# */{
    // NOTE: not calling base to block default Base.js from copying 1st argument into `this`.
    constructor: function() {
    },

    // Properties to ignore within extend
    extend_exclude: {_: 1},

    // region $type property
    __type: null, // Set on Type#_init

    /**
     * Gets the type of this instance.
     *
     * @type {!pentaho.type.Type}
     * @readonly
     * @see pentaho.type.Instance.type
     * @see pentaho.type.Type#instance
     */
    get $type() {
      return this.__type;
    },

    // Supports Type instance-level configuration only. Can only be called on the prototype,
    //  through Instance#implement!
    // Not documented on purpose, to avoid users trying to configure a type
    //  when they already have an instance of it, which is not supported...
    // However, this is the simplest and cleanest way to implement:
    //   Instance.implement({$type: {.}})
    // to mean
    //   Type.implement({.}).instance.constructor
    set $type(config) {
      // Class.implement essentially just calls Class#extend.
      if(config) this.__type.extend(config);
    }, // endregion

    // region serialization
    /**
     * Creates a top-level specification that describes this instance.
     *
     * If an [ambient specification context]{@link pentaho.type.SpecificationContext.current}
     * currently exists, it is used to manage the serialization process.
     * Otherwise, one is created and set as current.
     * Then, the actual work is delegated to {@link pentaho.type.Instance#toSpecInContext}.
     *
     * @param {Object} [keyArgs] - The keyword arguments' object.
     * Passed to every instance and type serialized within this scope.
     *
     * Please see the documentation of subclasses for information on additional, supported keyword arguments.
     *
     * @param {?boolean} [keyArgs.isJson=false] Generates a JSON-compatible specification.
     * Attributes that do not have a JSON-compatible specification are omitted.
     *
     * @param {?pentaho.type.Type} [keyArgs.declaredType] The base type of this value's storage location.
     * If the value does not have this exact type, its inline type property must be included
     * in the specification. Otherwise, it can be omitted.
     * When unspecified, the inline type property is only included if `forceType` is `true`.
     *
     * @param {?boolean} [keyArgs.forceType=false] In the specification, forces inclusion of
     * the inline type property: `_`.
     *
     * @return {!any} A specification of this instance.
     */
    toSpec: function(keyArgs) {
      return O.using(new SpecificationScope(), this.toSpecInContext.bind(this, keyArgs || {}));
    },

    /**
     * Creates a specification that describes this instance.
     *
     * @param {Object} [keyArgs] The keyword arguments' object.
     * Passed to every instance and type serialized within this scope.
     *
     * Please see the documentation of subclasses for information on additional, supported keyword arguments.
     *
     * @return {!any} A specification of this instance.
     *
     * @abstract
     *
     * @see pentaho.type.Instance#toSpec
     */
    toSpecInContext: function(keyArgs) {
      /* istanbul ignore next : abstract method */
      throw error.notImplemented();
    },

    /**
     * Creates a top-level JSON specification that describes this instance.
     *
     * Attributes which do not have a JSON-compatible specification are omitted.
     * Specifically, for inline types, attributes with a function value are not supported.
     *
     * This method simply calls {@link @see pentaho.type.Instance#toSpec} with argument `keyArgs.isJson` as `true`
     * and exists for seamless integration with JavaScript's
     * [JSON.stringify](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
     * method.
     *
     * @see pentaho.type.Instance#toSpec
     *
     * @return {JsonValue} A JSON-compatible specification.
     */
    toJSON: function() {
      return this.toSpec({isJson: true});
    }
    // endregion
  }, /** @lends pentaho.type.Instance */{

    // region type property
    /**
     * Gets the type of this instance constructor.
     *
     * @type {pentaho.type.Type}
     * @readonly
     */
    get type() {
      return this.prototype.$type;
    },
    // endregion

    /*
     * Defaults `name` from `instSpec.$type.sourceId` or `instSpec.$type.id`, if any.
     *
     * @ignore
     */
    _extend: function(name, instSpec, classSpec, keyArgs) {

      var typeSpec;

      if(name == null && (typeSpec = (instSpec && instSpec.$type))) {
        name = typeSpec.sourceId || typeSpec.id || null;
        if(name) name = name.toString();
      }

      return this.base(name, instSpec, classSpec, keyArgs);
    },

    /*
     * See `Base.js`.
     * @ignore
     */
    _subclassed: function(SubInstCtor, instSpec, classSpec, keyArgs) {
      // 1. `instSpec` may override property accessors only defined by `ComplexType`
      // 2. So, the Type class must be created *before* applying instSpec and classSpec to SubInstCtor
      // 3. The Type class requires InstCtor to already exist, to be able to define accessors

      // Setting a function's name is failing on PhantomJS 1.9.8...
      var instName = SubInstCtor.name || SubInstCtor.displayName;
      var typeName = instName && (instName + ".Type");

      var ka = keyArgs ? Object.create(keyArgs) : {};
      ka.instance = SubInstCtor.prototype;

      this.Type.extend(typeName, instSpec && instSpec.$type, classSpec && classSpec.$type, ka);

      // Don't process `instSpec.$type` and `classSpec.$type` twice, during construction.
      ka = keyArgs ? Object.create(keyArgs) : {};
      (ka.exclude || (ka.exclude = {})).$type = 1;

      this.base(SubInstCtor, instSpec, classSpec, ka);
    },

    /**
     * Applies localization information to the class' prototype.
     *
     * Works similarly to {@link pentaho.lang.Base.implement}.
     *
     * @param {object} config - The localization information.
     * @return {!Class.<pentaho.type.Instance>} This constructor.
     */
    localize: function(config) {
      return this.implement(config);
    },

    /**
     * Applies configuration information to the class' prototype.
     *
     * Works similarly to {@link pentaho.lang.Base.implement}.
     *
     * @param {object} config - The configuration information.
     *
     * @return {!Class.<pentaho.type.Instance>} This constructor.
     */
    configure: function(config) {
      return this.implement(config);
    }
  });

  Type._initInstCtor(Instance, {id: module.id});

  Instance.localize({$type: bundle.structured.Instance});

  return Instance;
});
