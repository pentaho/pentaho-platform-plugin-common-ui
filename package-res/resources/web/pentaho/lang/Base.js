/*!
 * Based on Base.js 1.1a (c) 2006-2010, Dean Edwards
 * Updated to pass JSHint and converted into a module by Kenneth Powers
 * License: http://www.opensource.org/licenses/mit-license.php
 */
/*!
 * Based on Base.js by Dean Edwards, and later edited by Kenneth Powers.
 *
 * Changes:
 * 1. Added support for the `instanceof` operator.
 * 2. Added support for ES5 get/set properties.
 * 3. Added support for "Array classes", through `Base.Array`.
 * 4. Improved support for mixins.
 *
 *    Namely, it is now possible to call the mixed-in class constructor
 *    to initialize an instance of another class.
 *
 * 5. `Class.init` is now inherited.
 * 6. Added the `Class.to` method.
 *
 *    Converts its arguments to an instance of `Class`, or throws if that is impossible.
 *
 *    The default implementation tests if the first argument is an instance of that type and returns it, if it is.
 *    Otherwise, it calls `Class` with the `new` operator and all of the given arguments and returns the result.
 *
 * 7. To support 4., the previous constructor behavior, for when invoked
 *    on a non-instance of it (possibly without using the `new` operator) was dropped.
 *    It would extend the first argument with the class' prototype.
 *    Now, it ends up initializing the global object...
 * 8. Removed `Class#forEach`.
 * 9. Instances no longer have an own "base" property,
 *    it is inherited from, and set on, the corresponding "Base" root prototype object.
 * 10. `Base._prototyping` and `Base#_constructing` are no longer needed to
 *     control Class constructor and inst_extend flow.
 * 11. Class.valueOf removed. No longer needed... ?
 * 12. `Base#__root_proto__` is a new constant, non-enumerable property, set at each "Base" root prototype.
 * 13. `Base#__init__` is a new constant, non-enumerable, property, set at the prototype of "Base" classes
 *      that have an own initialization method (specified with the `constructor` property).
 * 14. Added new Class.implementStatic method to allow to specify the class interface after extend.
 *     Is parallel to Class.implement.
 * 15. Any existing static methods are inherited (not only standard Base ones).
 */
define([
  "../util/object",
  "../util/fun"
], function(O, fun) {
  "use strict";

  // ## Support variables

  // Used by `inst_extend_object`
  var _hidden = ["toString", "valueOf"],
      _hiddenClass = ["toString"],
      F_toString   = Function.prototype.toString,
      _extendProto = {
        toSource: null
        // Others from Object.prototype:
        // toString
        // valueOf
        // constructor
        // ...
      };

  var A_slice = Array.prototype.slice;

  return base_create();

  // -----------

  /**
   * @private
   *
   * Defines the Base class.
   *
   * @returns {pentaho.lang.Base}
   */
  function base_create() {
    var Base = base_root(Object, {}, "Base.Object");
    Base.version = "2.0";

    /**
     * @public
     * @static
     *
     * @alias pentaho.lang.Base.Object
     *
     * @type {pentaho.lang.Base.Object}
     *
     * The Base.Object root class is the base class for regular Object classes.
     *
     */
    Base.Object = Base;

    /**
     * @public
     * @static
     *
     * @alias pentaho.lang.Base.Array
     *
     * @type {pentaho.lang.Base.Array}
     *
     * The Base.Array root class is the base class for Array classes.
     *
     */
    Base.Array = base_root(Array, [], "Base.Array");
    Base.Array.to = class_array_to;

    return Base;
  }

  /**
   * @private
   *
   * Creates a Base root class.
   *
   * @param NativeBase
   * @param bootProto
   * @param baseRootName
   * @returns {Function|*}
   */
  function base_root(NativeBase, bootProto, baseRootName) {
    // Bootstrapping "Base" class.
    // Does not have the full "Base" class interface,
    // but only enough properties set to trick `class_extend`.
    // `BaseBoot` becomes accessible only by following the prototype chain,
    // finding `bootProto` along the way.

    var BaseBoot = function() {};

    BaseBoot.prototype = bootProto;

    // Static interface that is inherited by all Base classes.
    BaseBoot.extend    = class_extend;
    BaseBoot._extend   = class_extend_core;
    BaseBoot.mix       = class_mix;
    BaseBoot.implement = class_implement;
    BaseBoot.implementStatic = class_implementStatic;
    BaseBoot.toString  = properFunToString;
    BaseBoot.to        = class_to;
    BaseBoot.init      = null;

    // Used by BaseBoot.extend, just below
    BaseBoot.prototype.extend = inst_extend;
    // ---

    var BaseRoot = BaseBoot.extend( /** @lends pentaho.lang.Base# */{
      // Cannot reuse constructor functions.
      /**
       * @public
       * @class
       *
       * @name Base
       * @memberOf pentaho.lang
       *
       * @classDesc Base Class for JavaScript Inheritance.
       *
       * Based on Base.js by Dean Edwards, and later edited by Kenneth Powers.
       *
       */
      constructor: function() {
        this.extend(arguments[0]);
      },
      /**
       * @public
       *
       * @alias pentaho.lang.Base#base
       * @lends pentaho.lang.Base.Object#base
       * @lends pentaho.lang.Base.Array#base
       *
       * If a method has been overridden then the base method provides access to the overridden method.
       * Can also be called from within a constructor function.
       *
       */
      base: inst_base
    }, /** @lends pentaho.lang.Base */ {
      /**
       * @public
       * @static
       *
       * @alias pentaho.lang.Base.ancestor
       * @lends pentaho.lang.Base.Object.ancestor
       * @lends pentaho.lang.Base.Array.ancestor
       *
       * This class ancestor.
       *
       */
      ancestor: NativeBase // Replaces BaseBoot by NativeBase
    });

    // The `__root_proto__` property is a cheap way to obtain
    // the correct Base-root prototype for setting the "base" property,
    // in `methodOverride`.
    // Create shared, hidden, constant `__root_proto__` property.
    Object.defineProperty(BaseRoot.prototype, "__root_proto__", {value: BaseRoot.prototype});

    setFunName(BaseRoot, baseRootName);

    return BaseRoot;
  }

  //region Class methods

  // Creates a sub-class of this class.
  // Static method of all "Base" constructors.

  /**
   * @public
   * @static
   *
   * @alias pentaho.lang.Base.extend
   * @lends pentaho.lang.Base.Object.extend
   * @lends pentaho.lang.Base.Array.extend
   *
   * Subclass a Base class.
   *
   * All classes inherit the `extend` method, so they can also be subclassed.
   *
   * Inheritance is delegated to the `_extend` method, which can be overridden.
   *
   * @param {string} [name] The name of the created class. Optional parameter.
   * @param {?Object} instSpec The instance interface spec.
   * @param {?Object} [classSpec] The static (class) interface spec. Optional parameter.
   * @param {?Object} [keyArgs] Keyword arguments. Optional parameter.
   *
   * @returns {pentaho.lang.Base} The new subclass.
   */
  function class_extend(name, instSpec, classSpec, keyArgs) {
    if(arguments.length < 3 && typeof name !== "string") {
      keyArgs = classSpec;
      classSpec = instSpec;
      instSpec = name;
      name = null;
    }

    return this._extend(name, instSpec, classSpec, keyArgs);
  }

  /**
   * @public
   * @static
   *
   * @alias pentaho.lang.Base._extend
   * @lends pentaho.lang.Base.Object._extend
   * @lends pentaho.lang.Base.Array._extend
   *
   * Default implementation of class extension.
   *
   * @param {?string} name The name of the created class.
   * @param {?Object} instSpec The instance interface spec.
   * @param {?Object} classSpec The static (class) interface spec.
   * @param {?Object} keyArgs Keyword arguments. Passed to `_subClassed` and `init` if present.
   *
   * @returns {pentaho.lang.Base} The new subclass.
   */
  function class_extend_core(name, instSpec, classSpec, keyArgs) {

    var SubClass = class_extend_subclass.call(this, name, instSpec);

    if(fun.is(this._subClassed))
      this._subClassed(SubClass, instSpec, classSpec, keyArgs);
    else
      SubClass.mix(instSpec, classSpec);

    // Init
    if(fun.is(SubClass.init)) SubClass.init(keyArgs);

    return SubClass;
  }

  /**
   * @private
   *
   * @param {?string} name The name of the created class.
   * @param {?Object} instSpec The instance interface spec.
   *
   * @returns {pentaho.lang.Base} The new subclass.
   */
  function class_extend_subclass(name, instSpec) {
    // Create PROTOTYPE and CONSTRUCTOR
    var subProto = Object.create(this.prototype),
        SubClass = class_extend_createCtor(subProto, instSpec);

    if(name) setFunName(SubClass, name);

    // Wire proto and constructor, so that the `instanceof` operator works.
    Object.defineProperty(subProto, "constructor", {
      //configurable: true,
      //writable: true,
      value: SubClass
    });
    SubClass.prototype = subProto;
    SubClass.ancestor  = this;

    // Inherit static _methods_ or getter/setters
    class_inherit_static.call(SubClass, this);

    return SubClass;
  }

  /**
   * @private
   *
   * Provides a constructor for the new subclass.
   *
   * When a `constructor` property has been specified in `instSpec`:
   *    1. If it doesn't call base: uses it as the constructor;
   *    2. If it calls base: uses its override wrapper as the constructor.
   *
   * Otherwise:
   *    1. If there is an inherited init: creates a constructor that calls it;
   *      a. If `init` calls base, it also gets wrapped;
   *    2. Otherwise, creates an empty constructor.
   *
   * @param {Object} proto The subclass prototype.
   * @param {?Object} instSpec The instance interface spec.
   *
   * @returns {Function} The subclass constructor.
   */
  function class_extend_createCtor(proto, instSpec) {
    var baseInit = proto.__init__;
    var Class = class_extend_readCtor(instSpec);

    if(Class) {
      // Maybe override base constructor.
      Class = methodOverride(Class, baseInit, proto.__root_proto__);

      // Create shared, hidden, constant `__init__` property.
      Object.defineProperty(proto, "__init__", {value: Class});
    } else {
      Class = class_extend_createCtorInit(baseInit);
    }

    return Class;
  }

  /**
   * @private`
   *
   * Reads the `constructor` property and returns it, if not Object#constructor.
   *
   * Note: Should not be a get/set property, or it will be evaluated and the resulting value used instead.
   *
   * @param {?Object} instSpec The instance interface spec.
   *
   * @returns {Function|null} The constructor function provided in `instSpec.
   */
  function class_extend_readCtor(instSpec) {
    var init = instSpec && instSpec.constructor;
    return init && init !== _extendProto.constructor && fun.is(init) ? init : null;
  }

  /**
   * @private
   *
   * Creates constructor that calls `init`.
   *
   * Notes: When mixing in, init won't be available through this.__init__,
   * so the fixed `init` argument is actually required.
   *
   * @param {Function} init The function to be called by the constructor.
   *
   * @returns {Function} The function that calls init.
   */
  function class_extend_createCtorInit(init) {
    return function() {
      return init.apply(this, arguments);
    };
  }

  /**
   * @public
   * @static
   *
   * @alias pentaho.lang.Base.to
   * @lends pentaho.lang.Base.Object.to
   *
   * Converts its arguments to an instance of `Class`, or throws if that is impossible.
   *
   * The default implementation tests if the first argument is an instance of that type and returns it, if it is.
   * Otherwise, it calls `Class` with the `new` operator and all of the given arguments and returns the result.
   *
   * @param {*} v The value to be casted.
   *
   * @returns {pentaho.lang.Base}
   *
   * @throws {Error} If cannot convert value.
   */
  function class_to(v) {
    return (v instanceof this) ? v : O.make(this, arguments);
  }

  /**
   * @public
   * @static
   *
   * @alias pentaho.lang.Base.Array.to
   *
   * Converts its arguments to an instance of `Array`, or throws if that is impossible.
   *
   * The method tests if `a` is an instance of this type and returns it, if it is.
   * Otherwise, if instance of Array, it converts it by changing it prototype.
   *
   * Warning: in this case, the input parameter only be modified!
   *
   * Notes: Arrays of a certain sub-class cannot be newed up (in ES5, at least).
   * As such, a normal array must be created first and then "switched" to
   * inheriting from this class: var baseArray = BaseArray.to([]);
   *
   * @param {Array|null} a The value to be casted.
   *
   * @returns {pentaho.lang.Base.Array}
   *
   * @throws {Error} If cannot convert value.
   */
  function class_array_to(a) {
    // First, convert to an array.
    if(a == null)
      a = [];
    else if(a instanceof this)
      return a;
    else if(!(a instanceof Array))
      throw new Error("Cannot convert value to Base.Array.");

    return O.applyClass(a, this, A_slice.call(arguments, 1));
  }

  /**
   * @public
   * @static
   *
   * @alias pentaho.lang.Base.mix
   * @lends pentaho.lang.Base.Object.mix
   * @lends pentaho.lang.Base.Array.mix
   *
   * Adds interfaces to a class.
   * The interfaces can be defined by another classes or object literals.
   *
   * The method extends the class but does not create a new class.
   *
   * @param {?Function|Object} instSpec The Class to mixin or an instance interface spec.
   * @param {?Object} [classSpec] The static (class) interface spec. Optional parameter.
   *
   * @returns {pentaho.lang.Base}
   */
  function class_mix(instSpec, classSpec) {
    if(fun.is(instSpec)) {
      if(arguments.length === 1) classSpec = instSpec;
      instSpec  = instSpec.prototype;
    }

    // Note: #extend implementations *must not* copy the `constructor` property!
    if(instSpec)  this.implement(instSpec);

    // Note: overriding static methods sets the special `.base()` property on the constructor...
    if(classSpec) this.implementStatic(classSpec);

    return this;
  }

  /**
   * @public
   * @static
   *
   * @alias pentaho.lang.Base.implement
   * @lends pentaho.lang.Base.Object.implement
   * @lends pentaho.lang.Base.Array.implement
   *
   * Adds another instance interfaces to a class.
   * The new interfaces can be defined by another classes or object literals.
   *
   * The method extends the class prototype but does not create a new class.
   *
   * Can applied to non-Base classes (e.g. using `Base.implement.call(Alien, instanceMix)`).
   *
   * @param {...Function|Object} instSpec One or more classes to mixin or instance interface specs.
   *
   * @returns {pentaho.lang.Base|Function}
   */
  function class_implement() {
    var i = -1,
        L = arguments.length,
        proto = this.prototype,
        extend = proto.extend || inst_extend;

    while(++i < L) {
      var v = arguments[i];
      extend.call(proto, fun.is(v) ? v.prototype : v);
    }

    return this;
  }

  /**
   * @private
   *
   * Inherit each of the `BaseClass` properties to this class.
   *
   * Copies `toString` manually and skip _special_ members.
   *
   * Notes: Adapted from inst_extend_object to better handle the Class static inheritance case.
   *
   * @param {Function} BaseClass Class from where to inherit static members.
   *
   */
  function class_inherit_static(BaseClass) {
    for(var i = 0; i < _hiddenClass.length; i++) {
      var h = _hiddenClass[i];
      if(BaseClass[h] !== _extendProto[h])
        inst_extend_propDesc.call(this, h, BaseClass, undefined, /*funOnly:*/true);
    }

    for(var name in BaseClass)
      if(!_extendProto[name] &&
         name !== "ancestor" &&
         name !== "prototype" &&
         name !== "valueOf" &&
         name !== "Array" &&
         name !== "Object" &&
         name !== "base" &&
         name !== "name" &&
         name !== "displayName")
        inst_extend_propDesc.call(this, name, BaseClass, undefined, /*funOnly:*/true);
  }

  /**
   * @public
   * @static
   *
   * @alias pentaho.lang.Base.implementStatic
   * @lends pentaho.lang.Base.Object.implementStatic
   * @lends pentaho.lang.Base.Array.implementStatic
   *
   * Adds another static (class) interfaces to a class.
   * The new interfaces can be defined by another classes or object literals.
   *
   * The method extends the class prototype but does not create a new class.
   *
   * Can applied to non-Base classes (e.g. using `Base.implementStatic.call(Alien, classMix)`).
   *
   * @param {...Function|Object} classSpec One or more classes to mixin or static (class) interface specs.
   *
   * @returns {pentaho.lang.Base|Function}
   */
  function class_implementStatic() {
    var i = -1,
        L = arguments.length;
    while(++i < L) {
      // Extend the constructor with `classSpec`.
      // (overriding static methods sets the `base` property on the constructor)
      var classSpec = arguments[i];
      if(classSpec) inst_extend_object.call(this, classSpec);
    }

    return this;
  }

  // endregion

  //region Instance methods

  function inst_base() {}

  /**
   * @public
   *
   * @alias pentaho.lang.Base#extend
   * @lends pentaho.lang.Base.Object#extend
   * @lends pentaho.lang.Base.Array#extend
   *
   * Extend an object with either a key/value pair or an object literal defining key/value pairs.
   *
   * Methods that are overridden are accessible through `this.base`.
   *
   * The method extends the object but doesn't change its class.
   *
   * Can applied to non-Base instances (e.g. using `Base.prototype.extend.call(alien, {a: "hello"})`)
   *
   * @param {String|Object} source The name of the member to extent or the instance interface spec.
   * @param {?*} [value] The value to assign to the extended member. Optional parameter.
   *  If provided `source` must be the name of the member to extend.
   *
   * @returns {Object} This object, extended.
   */
  function inst_extend(source, value) {
    if(arguments.length > 1) {
      inst_extend_propAssign.call(this, source, value, this.__root_proto__);
    } else if(source) {
      // Call `this.extend` method instead of this one, if it exists.
      if(!fun.is(this) && fun.is(this.extend) && this.extend !== inst_extend) {
        // Because in Base.js, Function#extend has a sub-classing semantics,
        // functions are not considered here, by testing `!fun.is(this)`.
        //
        // In the previous version of this code, the custom extend method was used
        // only for _assigning_ values to individual properties,
        // by using the `#extend(prop, value)` signature variant.
        // Manual properties and outer prop loop were still handled by `inst_extend_object`.
        //
        // Supporting get/set properties generally requires copying property descriptors,
        // and, not, assigning values, so the old `#extend(prop, value)` signature is
        // not adequate anymore for this particular scenario.
        //
        // The solution was to delegate to the foreign `extend` method directly at the
        // object level, through its `#extend(source)` signature variant,
        // and rely on the foreign `extend` method to mimic the semantics that would
        // otherwise be imposed by `inst_extend_object`.
        //
        // Note, also, that this path of code was (and is) not used by "Base"'s internal code.
        // It could (and can) only happen when `Base#extend` method is applied to some "foreign" object.
        this.extend(source);
      } else {
        inst_extend_object.call(this, source, this.__root_proto__);
      }
    }

    return this;
  }

  /**
   * @private
   *
   * Copy each of the `source` members to this object.
   *
   * Copies `toString` manually and skip _special_ members.
   *
   * @param {Object} source Object from where to copy members.
   * @param {?Object} rootProto The root constructor.
   */
  function inst_extend_object(source, rootProto) {
    // Do the "toString" and other methods manually.
    for(var i = 0; i < _hidden.length; i++) {
      var h = _hidden[i];
      if(source[h] !== _extendProto[h])
        inst_extend_propDesc.call(this, h, source, rootProto);
    }

    // Copy each of the source object's properties to this object.
    for(var name in source)
      if(!_extendProto[name])
        inst_extend_propDesc.call(this, name, source, rootProto);
  }

  /**
   * @private
   *
   * Copy member from `source` to this object.
   *
   * @param {String} name The name of the property.
   * @param {Object} source Object from where to copy members.
   * @param {?Object} rootProto The root constructor.
   * @param {?boolean} funOnly If true, copy only if member is a function.
   */
  function inst_extend_propDesc(name, source, rootProto, funOnly) {
    var desc = O.getPropertyDescriptor(source, name);
    if(desc.get || desc.set) {
      // Property getter/setter
      var baseDesc = O.getPropertyDescriptor(this, name);
      if(baseDesc) {
        if(desc.get || baseDesc.get) desc.get = methodOverride(desc.get, baseDesc.get, rootProto);
        if(desc.set || baseDesc.set) desc.set = methodOverride(desc.set, baseDesc.set, rootProto);
      }

      Object.defineProperty(this, name, desc);
    } else {
      // Property value
      inst_extend_propAssign.call(this, name, desc.value, rootProto, funOnly);
    }
  }

  /**
   * @private
   *
   * Assign `value` to member `name` of this object.
   *
   * @param {String} name The name of the property.
   * @param {*} value The value to assign to the member.
   * @param {?Object} rootProto The root constructor.
   * @param {?boolean} funOnly If true, assign only if value is a function.
   */
  function inst_extend_propAssign(name, value, rootProto, funOnly) {
    if(fun.is(value)) {
      this[name] = methodOverride(value, this[name], rootProto);
    } else if(!funOnly) {
      this[name] = value;
    }
  }

  //endregion

  //region Method Override

  /**
   * @private
   *
   * Evaluates the need to wrap a method for overriding
   * and returns the apropriate version.
   *
   * If `value` is null, returns the `baseValue`.
   * If `value` doesn't call `this.base`, returns `value`.
   *
   * Otherwise, returns a wrapped method that calls `value`,
   * and modifies its `valueOf()` and `toString()` methods
   * to return the unwrapped original function.
   *
   * If `baseValue` is null `this.base` will be the empty
   * `inst_base` function.
   *
   * @param {?Function} value The method overriding.
   * @param {?Function} baseValue The method to override.
   * @param {?Object} rootProto The root constructor.
   *
   * @returns {Function|null} The override-ready function,
   * or null if both `value` and `baseValue` are nully.
   */
  function methodOverride(value, baseValue, rootProto) {
    if(!value) return baseValue;

    if(!baseValue) baseValue = inst_base;

    // Get the unwrapped value.
    var method = value.valueOf();

    // valueOf() test is to avoid circular references
    if(!method ||
       (baseValue.valueOf && baseValue.valueOf() === method) ||
       !methodCallsBase(method))
      return value;

    value = methodOverrideWrap(method, baseValue, rootProto);

    // Returns the underlying, wrapped method
    value.valueOf = function(type) {
      return type === "object" ? value : method;
    };

    value.toString = properFunToString;

    return value;
  }

  /**
   * @private
   *
   * Checks if `this.base` is called in the body of `method`.
   *
   * @param {Function} method The function to check.
   *
   * @returns {boolean} `true` if the method calls `this.base`.
   */
  function methodCallsBase(method) {
    return /\bbase\b/.test(method);
  }

  /**
   * @private
   *
   * Creates a wrapper method that injects `baseMethod` into `this.base`
   * and calls `method`.
   *
   * The `baseMethod` is injected into the root constructor `rootProto`,
   * when available.
   *
   * If not (non-Base classes) it is injected directly in the instance.
   *
   * @param {?Function} method The method overriding.
   * @param {?Function} baseMethod The method to override.
   * @param {?Object} rootProto The root constructor.
   *
   * @returns {Function} The wrapped function.
   */
  function methodOverrideWrap(method, baseMethod, rootProto) {
    if(rootProto)
      return function() {
        var previous = rootProto.base; rootProto.base = baseMethod;
        try {
          return method.apply(this, arguments);
        } finally { rootProto.base = previous; }
      };

    // float
    return function() {
      var previous = this.base; this.base = baseMethod;
      try {
        return method.apply(this, arguments);
      } finally { this.base = previous; }
    };
  }

  //endregion

  //region Helpers

  /**
   * @private
   *
   * Returns the string representation of this method.
   *
   * Notes: The native String function or toString method do not call .valueOf() on its argument.
   * However, concatenating with a string does...
   *
   * @returns {String} The string representation of the function.
   */
  function properFunToString() {
    return F_toString.call(this.valueOf());
  }

  /**
   * @private
   *
   * Defines the `name` and `displayName` of a function.
   *
   * Notes: Because `Function#name` is non-writable but configurable it
   * can be set, but only through `Object.defineProperty`.
   *
   * @param {Function} fun The function.
   * @param {String} name The name to set on the function.
   */
  function setFunName(fun, name) {
    fun.displayName = name;
    try {
      Object.defineProperty(fun, "name", {value: name, configurable: true});
    } catch(ex) {
      // TODO: for some pre-ES6 engines the property is not configurable
      // Notably, PhantomJS 1.9.8 fails here.
    }
  }

  //endregion
});
