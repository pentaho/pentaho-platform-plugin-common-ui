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
 *     that have an own initialization method (specified with the `constructor` property).
 * 14. Added new Class.implementStatic method to allow to specify the class interface after extend.
 *     Is parallel to Class.implement.
 * 15. Any existing static methods are inherited (not only standard Base ones).
 * 16. Dropped support for the overload Base#extend(name, value).
 *     The same method now supports only the signature Base#extend(instSpec[, keyArgs]).
 * 17. Added support to augment the set of per-class, inherited property names that are excluded from
 *     instance-extension operations.
 *     Specify `extend_exclude` when sub-classing, e.g. `Base.extend({extend_exclude: {a: true, b: true}});`.
 * 18. Added support to control, per-class, the properties extension order in instance-extension operations.
 *     Specify `extend_order` when sub-classing, e.g. `Base.extend({extend_order: ["b", "a"]});`.
 */
define([
  "module",
  "../util/object",
  "../util/fun",
  "../util/text",
  "../debug",
  "../debug/Levels"
], function(module, O, fun, text, debugMgr, DebugLevels) {
  "use strict";

  // ## Support variables

  // Used by `inst_extend_object`
  var F_toString = Function.prototype.toString;
  var O_hasOwn = Object.prototype.hasOwnProperty;
  var A_slice = Array.prototype.slice;
  var _excludeExtendInst = Object.freeze({
        "base": 1,
        "constructor": 1,
        "extend_order": 1,
        "extend_exclude": 1,
        "__init__": 1,
        "__root_proto__": 1,
        "__extend_order__": 1,
        "__extend_exclude__": 1
      });
  var _excludeExtendStatic = Object.freeze({
        "ancestor": 1,
        "prototype": 1,
        "valueOf": 1,
        "Array": 1,
        "Object": 1,
        "base": 1,
        "name": 1,
        "displayName": 1,
        "extend_order": 1,
        "extend_exclude": 1
      });
  var _isDebugMode = debugMgr.testLevel(DebugLevels.debug, module);

  return base_create();

  // -----------

  /**
   * Defines the Base class.
   *
   * @return {Class.<pentaho.lang.Base>} The created class constructor.
   *
   * @private
   */
  function base_create() {
    /**
     * @classdesc `Base` Class for JavaScript Inheritance.
     *
     * Based on Base.js by Dean Edwards, and later edited by Kenneth Powers.
     *
     * @class
     * @alias Base
     * @memberOf pentaho.lang
     * @amd pentaho/lang/Base
     *
     * @description Creates a new `Base` object.
     *
     * If `spec` is specified, the new object is [extended]{@link pentaho.lang.Base#extend} with it.
     *
     * @constructor
     * @param {Object} [spec] An extension specification.
     */
    function BaseObject(spec) {
      this.extend(spec);
    }

    var Base = base_root(Object, {}, "Base.Object", BaseObject);
    Base.version = "2.0";

    /**
     * The `Base.Object` root class is the base class for regular `Object` classes,
     * and an alias for [Base]{@link pentaho.lang.Base}.
     *
     * @see pentaho.lang.Base
     *
     * @name Object
     * @memberOf pentaho.lang.Base
     *
     * @class
     * @extends Object
     */
    Base.Object = Base;

    /**
     * The `Base.Array` root class is the base class for `Array` classes.
     *
     * @alias Array
     * @memberOf pentaho.lang.Base
     *
     * @class
     * @extends Array
     *
     * @borrows pentaho.lang.Base.ancestor as ancestor
     * @borrows pentaho.lang.Base.extend as extend
     * @borrows pentaho.lang.Base._extend as _extend
     * @borrows pentaho.lang.Base._subclassed as _subclassed
     * @borrows pentaho.lang.Base.mix as mix
     * @borrows pentaho.lang.Base.implement as implement
     * @borrows pentaho.lang.Base.implementStatic as implementStatic
     * @borrows pentaho.lang.Base#base as #base
     * @borrows pentaho.lang.Base#extend as #extend
     *
     * @description Initializes a new array of `Base.Array` class.
     *
     * If provided, extends the created instance with the spec in `source` parameter.
     *
     * To "create" an instance of `Base.Array`,
     * use {@link pentaho.lang.Base.Array.to},
     * to convert an existing array instance.
     *
     * @constructor
     * @param {Array} [source] An extension specification.
     */
    function BaseArray(source) {
      this.extend(source);
    }

    Base.Array = base_root(Array, [], "Base.Array", BaseArray);
    Base.Array.to = class_array_to;

    // ---

    /**
     * The `Base.Error` root class is the base class for `Error` classes.
     *
     * @alias Error
     * @memberOf pentaho.lang.Base
     *
     * @class
     * @extends Error
     *
     * @constructor
     * @param {string} [message] The error message.
     *
     * @borrows pentaho.lang.Base.ancestor as ancestor
     * @borrows pentaho.lang.Base.extend as extend
     * @borrows pentaho.lang.Base._extend as _extend
     * @borrows pentaho.lang.Base._subclassed as _subclassed
     * @borrows pentaho.lang.Base.mix as mix
     * @borrows pentaho.lang.Base.implement as implement
     * @borrows pentaho.lang.Base.implementStatic as implementStatic
     * @borrows pentaho.lang.Base#base as #base
     * @borrows pentaho.lang.Base#extend as #extend
     */
    function BaseError(message) {
      this.message = message;
      this.stack = (new Error()).stack;
    }

    Base.Error = base_root(Error, Object.create(Error.prototype), "Base.Error", BaseError);

    return Base;
  }

  /**
   * Creates a `Base` root class.
   *
   * @param {!Class} NativeBase The native base constructor that this _Base_ root is rooted on.
   * @param {!Object} bootProto The prototype of the _boot_ constructor.
   * @param {string} baseRootName The name of the _root_ constructor.
   * @param {function} baseConstructor The base constructor.
   *
   * @return {!Class.<pentaho.lang.Base>} The new `Base` root class.
   *
   * @private
   */
  function base_root(NativeBase, bootProto, baseRootName, baseConstructor) {
    // Bootstrapping "Base" class.
    // Does not have the full "Base" class interface,
    // but only enough properties set to trick `class_extend`.
    // `BaseBoot` becomes accessible only by following the prototype chain,
    // finding `bootProto` along the way.

    /* istanbul ignore next : irrelevant and hard to test */
    var BaseBoot = function() {};

    BaseBoot.prototype = bootProto;

    // Static interface that is inherited by all Base classes.
    BaseBoot.extend      = class_extend;
    BaseBoot._extend     = class_extend_core;
    BaseBoot._subclassed = class_subclassed;
    BaseBoot.mix         = class_mix;
    BaseBoot.implement   = class_implement;
    BaseBoot.implementStatic = class_implementStatic;
    BaseBoot.toString    = properFunToString;
    BaseBoot.to          = class_to;
    BaseBoot.init        = null;

    // Used by BaseBoot.extend, just below
    BaseBoot.prototype.extend = inst_extend;

    // ---

    var BaseRoot = BaseBoot.extend({
      constructor: baseConstructor,
      extend_exclude: _excludeExtendInst
    }, {
      /**
       * The ancestor class.
       *
       * @name ancestor
       * @memberOf pentaho.lang.Base
       * @readonly
       */
      ancestor: NativeBase // Replaces BaseBoot by NativeBase
    });

    /**
     * If a method has been overridden then the base method provides access to the overridden method.
     *
     * Can also be called from within a constructor function.
     *
     * @name base
     * @memberOf pentaho.lang.Base#
     * @type {function}
     * @readonly
     * @protected
     */
    Object.defineProperty(BaseRoot.prototype, "base", {
      configurable: true,
      writable: true,
      enumerable: false,
      value: inst_base
    });

    // The `__root_proto__` property is a cheap way to obtain
    // the correct Base-root prototype for setting the `base` property,
    // in `methodOverride`.
    // Create shared, hidden, constant `__root_proto__` property.
    O.setConst(BaseRoot.prototype, "__root_proto__", BaseRoot.prototype);

    setFunName(BaseRoot, baseRootName);

    return BaseRoot;
  }

  // region Class methods

  /**
   * Creates a subclass of this one.
   *
   * All classes inherit the `extend` method, so they can also be subclassed.
   *
   * Inheritance is delegated to the [_extend]{@link pentaho.lang.Base.extend} method, which can be overridden.
   *
   * @alias extend
   * @memberOf pentaho.lang.Base
   *
   * @param {string} [name] The name of the created class. Used for debugging purposes.
   * @param {Object} [instSpec] The instance specification.
   * @param {?string[]} [instSpec.extend_order] An array of instance property names that
   * [extend]{@link pentaho.lang.Base#extend} should always apply
   * before other properties and in the given order.
   *
   * The given property names are appended to any inherited _ordered_ property names.
   *
   * @param {Object} [instSpec.extend_exclude] A set of property names to _exclude_,
   * whenever the instance side of the class
   * (through [mix]{@link pentaho.lang.Base.mix} or [implement]{@link pentaho.lang.Base.implement})
   * or
   * its instances (through [extend]{@link pentaho.lang.Base#extend})
   * are extended.
   *
   * The given property names are joined with any inherited _excluded_ property names.
   *
   * Properties can have any value.
   *
   * @param {Object} [classSpec] The static specification.
   * @param {Object} [keyArgs] The keyword arguments.
   * @param {Object} [keyArgs.exclude] A set of property names to _exclude_,
   * _both_ from the instance and class sides, in this method call.
   * Properties can have any value.
   *
   * @return {!Class.<pentaho.lang.Base>} The new subclass.
   *
   * @sealed
   */
  function class_extend(name, instSpec, classSpec, keyArgs) {
    /* jshint validthis:true*/

    // extend()
    // extend(instSpec)
    // extend(instSpec, classSpec)
    // extend(instSpec, classSpec, keyArgs)
    if(arguments.length < 4 && typeof name !== "string") {
      keyArgs = classSpec;
      classSpec = instSpec;
      instSpec = name;
      name = null;
    }

    return this._extend(name, instSpec, classSpec, keyArgs);
  }

  /**
   * Actually creates a subclass of this one.
   *
   * The default implementation creates the subclass constructor,
   * inherits static members and handles the special
   * `instSpec.extend_exclude` and `instSpec.extend_order` properties.
   * Then, it delegates the remainder of the subclass setup to the
   * [_subclassed]{@link pentaho.lang.Base._subclassed},
   * whose default implementation mixes-in the given instance and class specifications.
   * Finally, when the subclass' [init]{@link pentaho.lang.Base.init} method is defined, it is called.
   *
   * @alias _extend
   * @memberOf pentaho.lang.Base
   *
   * @param {?string} name The name of the created class.
   * @param {Object} instSpec The instance-side specification.
   * @param {?string[]} [instSpec.extend_order] An array of instance property names that
   * [extend]{@link pentaho.lang.Base#extend} should always apply
   * before other properties and in the given order.
   *
   * The given property names are appended to any inherited _ordered_ property names.
   *
   * @param {Object} [instSpec.extend_exclude] A set of property names to _exclude_,
   * whenever the instance side of the class
   * (through [mix]{@link pentaho.lang.Base.mix} or [implement]{@link pentaho.lang.Base.implement})
   * or
   * its instances (through [extend]{@link pentaho.lang.Base#extend})
   * are extended.
   *
   * The given property names are joined with any inherited _excluded_ property names.
   *
   * Properties can have any value.
   *
   * @param {Object} classSpec The class-side specification.
   * @param {Object} keyArgs The keyword arguments.
   *
   * @return {!Class.<pentaho.lang.Base>} The new subclass.
   *
   * @protected
   */
  function class_extend_core(name, instSpec, classSpec, keyArgs) {
    /* jshint validthis:true*/

    // Allow the value of AMD module.id to be passed directly to name
    if(name && name.indexOf("/") > 0) {
      var parts = name.split("/");
      // Also, ensure last segment is upper case, as this is a class...
      // Module ids sometimes differ in casing due to other reasons.
      var lastIndex = parts.length - 1;
      parts[lastIndex] = text.firstUpperCase(parts[lastIndex]);
      name = parts.join(".");
    }

    var Subclass = class_extend_subclass.call(this, name, instSpec);

    this._subclassed(Subclass, instSpec, classSpec, keyArgs);

    if(fun.is(Subclass.init)) Subclass.init(keyArgs);

    return Subclass;
  }

  /**
   * Creates the subclass constructor.
   *
   * Inherits base constructor properties.
   *
   * @alias _subclass
   * @memberOf pentaho.lang.Base
   *
   * @param {?string} name The name of the created class.
   * @param {Object} instSpec The instance-side specification.
   * @param {?string[]} [instSpec.extend_order] An array of instance property names that
   * [extend]{@link pentaho.lang.Base#extend} should always apply
   * before other properties and in the given order.
   *
   * The given property names are appended to any inherited _ordered_ property names.
   *
   * @param {Object} [instSpec.extend_exclude] A set of property names to _exclude_,
   * whenever the instance side of the class
   * (through [mix]{@link pentaho.lang.Base.mix} or [implement]{@link pentaho.lang.Base.implement})
   * or
   * its instances (through [extend]{@link pentaho.lang.Base#extend})
   * are extended.
   *
   * The given property names are joined with any inherited _excluded_ property names.
   *
   * Properties can have any value.
   *
   * @return {Class.<pentaho.lang.Base>} The new subclass.
   *
   * @private
   */
  function class_extend_subclass(name, instSpec) {
    /* jshint validthis:true*/

    if(!name) {
      name = this.name || this.displayName || null;
      if(name) name += "$";
    }

    // Create PROTOTYPE and CONSTRUCTOR
    var subProto = Object.create(this.prototype);
    var Subclass = class_extend_createCtor(subProto, instSpec, name);

    // Wire proto and constructor, so that the `instanceof` operator works.
    O.setConst(subProto, "constructor", Subclass);
    Subclass.prototype = subProto;
    Subclass.ancestor = this;

    // ----

    var subExclude = instSpec && instSpec.extend_exclude;
    if(subExclude) {
      subExclude = O.assignOwn(O.assignOwn({}, subProto.__extend_exclude__), subExclude);

      O.setConst(subProto, "__extend_exclude__", Object.freeze(subExclude));
    }

    var subOrdered = instSpec && instSpec.extend_order;
    if(subOrdered) {
      subOrdered = (subProto.__extend_order__ || []).concat(subOrdered);

      O.setConst(subProto, "__extend_order__", Object.freeze(subOrdered));
    }

    // ----

    // Inherit static _methods_ or getter/setters
    class_inherit_static.call(Subclass, this);

    return Subclass;
  }

  /**
   * Called when a subclass of this class has been created.
   *
   * The default implementation mixes the given instance and class specification in the new subclass.
   *
   * @alias _subclassed
   * @memberOf pentaho.lang.Base
   *
   * @param {function} Subclass The created subclass.
   * @param {Object} instSpec The instance-side specification.
   * @param {Object} classSpec The static-side specification.
   * @param {Object} keyArgs The keyword arguments.
   *
   * @protected
   */
  function class_subclassed(Subclass, instSpec, classSpec, keyArgs) {
    Subclass.mix(instSpec, classSpec, keyArgs);
  }

  /**
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
   * @param {!Object} proto The subclass' prototype.
   * @param {Object} instSpec The instance-side specification.
   * @param {string} [name] The class name.
   *
   * @return {function} The subclass constructor.
   *
   * @private
   */
  function class_extend_createCtor(proto, instSpec, name) {
    /* jshint validthis:true*/

    var baseInit = proto.__init__;
    var Class = class_extend_readCtor(instSpec);

    if(Class) {
      // Maybe override base constructor.
      Class = methodOverride(Class, baseInit, proto.__root_proto__, name, /* forceOverrideIfDebug: */true);

      // Create shared, hidden, constant `__init__` property.
      O.setConst(proto, "__init__", Class);
    } else {
      Class = class_extend_createCtorInit(baseInit, name);
    }

    if(name) setFunName(Class, name);

    return Class;
  }

  /**
   * Reads the `constructor` property and returns it, if not `Object#constructor`.
   *
   * Should not be a get/set property, or it will be evaluated and the resulting value used instead.
   *
   * @param {Object} instSpec The instance-side specification.
   *
   * @return {?function} The constructor function provided in `instSpec`, if any, or `null`.
   *
   * @private
   */
  function class_extend_readCtor(instSpec) {
    var init = instSpec && instSpec.constructor;
    return init && init !== Object && fun.is(init) ? init : null;
  }

  /**
   * Creates constructor that calls `init`.
   *
   * When mixing in, `init` won't be available through `this.__init__`,
   * so the fixed `init` argument is actually required.
   *
   * @param {function} init The function to be called by the constructor.
   * @param {string} [name] The class name.
   *
   * @return {function} The function that calls `init`.
   *
   * @private
   */
  function class_extend_createCtorInit(init, name) {
    if(!name || !_isDebugMode) {
      return function() {
        return init.apply(this, arguments);
      };
    }

    var f = new Function(
        "init",
        "return function " + sanitizeIdentifier(name) + "() {\n" +
        "  return init.apply(this, arguments);\n" +
        "};");

    return f(init);
  }

  function sanitizeIdentifier(name) {
    return name.replace(/[^\w0-9$_]/gi, "_");
  }

  /**
   * Converts a value to an instance of this class, or throws if that is impossible.
   *
   * When `value` is an instance of this type, it is returned.
   *
   * Otherwise, a new instance of this class is created,
   * using all of the specified arguments as constructor arguments.
   *
   * @alias to
   * @memberOf pentaho.lang.Base
   *
   * @param {any} value The value to be cast.
   * @param {...any} other Remaining arguments passed alongside `value` to the class constructor.
   *
   * @return {!pentaho.lang.Base} The converted value.
   *
   * @throws {Error} When `value` cannot be converted.
   */
  function class_to(value) {
    /* jshint validthis:true*/
    return (value instanceof this) ? value : O.make(this, arguments);
  }

  /**
   * Converts a value to an instance of this class, or throws if that is impossible.
   *
   * When `value` is {@link Nully}, and empty array instance of this class is created and returned.
   *
   * When `value` is an instance of this type, it is returned.
   *
   * When `value` is an instance of `Array`,
   * it converts it to an instance of this array class,
   * by changing it prototype and calling this class' constructor on it,
   * along with the remaining arguments specified.
   * Note that, in this case, `value` is mutated!
   *
   * Arrays of a certain sub-class cannot be newed up (in ES5, at least).
   * As such, a normal array must be created first and then "switched" to
   * inheriting from this class: `var baseArray = BaseArray.to([]);`.
   *
   * @alias pentaho.lang.Base.Array.to
   *
   * @param {pentaho.lang.Base.Array|Array} value The value to be converted.
   * @param {...any} other Remaining arguments passed alongside `value` to the class constructor.
   *
   * @return {!pentaho.lang.Base.Array} The converted value.
   *
   * @throws {Error} When `value` cannot be converted.
   */
  function class_array_to(value) {
    /* jshint validthis:true*/

    // First, convert to an array.
    if(value == null)
      value = [];
    else if(value instanceof this)
      return value;
    else if(!(value instanceof Array))
      throw new Error("Cannot convert value to Base.Array.");

    return O.applyClass(value, this, A_slice.call(arguments, 1));
  }

  /**
   * Adds additional members to, or overrides existing ones of, this class.
   *
   * This method does _not_ create a new class.
   *
   * This method supports two signatures:
   *
   * 1. mix(Class: function[, keyArgs: Object]) -
   *     mixes-in the given class, both its instance and class sides.
   *
   * 2. mix(instSpec: Object[, classSpec: Object[, keyArgs: Object]]) -
   *     mixes-in the given instance and class side specifications.
   *
   * @alias mix
   * @memberOf pentaho.lang.Base
   *
   * @param {function|Object} instSpec The class to mixin or the instance-side specification.
   * @param {Object} [classSpec] The class-side specification.
   * @param {Object} [keyArgs] The keyword arguments.
   * @param {Object} [keyArgs.exclude] A set of property names to _exclude_,
   *  _both_ from the instance and class sides. Properties can have any value.
   *
   * @return {Class.<pentaho.lang.Base>} This class.
   */
  function class_mix(instSpec, classSpec, keyArgs) {
    /* jshint validthis:true*/

    if(fun.is(instSpec)) {
      // function, keyArgs
      keyArgs   = classSpec;
      classSpec = instSpec;
      instSpec  = classSpec.prototype;
    }

    // Versions of implement and implementStatic, but for a single spec and with keyArgs
    if(instSpec)  this.prototype.extend(instSpec, keyArgs);
    if(classSpec) inst_extend_object.call(this, classSpec, null, keyArgs);

    return this;
  }

  /**
   * Adds instance specifications to this class.
   *
   * This method does _not_ create a new class.
   *
   * Each instance specification can be a class or an object.
   * When it is a class, only its instance-side is mixed-in.
   *
   * This method can be applied to other, non-`Base` classes (e.g. using `Base.implement.call(Alien, instanceMix)`).
   *
   * @alias implement
   * @memberOf pentaho.lang.Base
   *
   * @param {...?function|...Object} instSpecs The instance-side specifications to mix-in.
   *
   * @return {!Class.<pentaho.lang.Base>|function} This class.
   *
   * @see pentaho.lang.Base.implementStatic
   * @see pentaho.lang.Base.mix
   */
  function class_implement() {
    /* jshint validthis:true*/

    var i = -1;
    var L = arguments.length;
    var proto = this.prototype;
    var extend = proto.extend || inst_extend;

    while(++i < L) {
      var v = arguments[i];
      extend.call(proto, fun.is(v) ? v.prototype : v);
    }

    return this;
  }

  /**
   * Inherit each of the `BaseClass` properties to this class.
   *
   * Adapted from `inst_extend_object` to better handle the Class static inheritance case.
   *
   * @param {function} BaseClass Class from where to inherit static members.
   *
   * @private
   */
  function class_inherit_static(BaseClass) {
    /* jshint validthis:true*/

    for(var name in BaseClass)
      if(!Object[name] && !O_hasOwn.call(_excludeExtendStatic, name))
        inst_extend_propDesc.call(this, name, BaseClass, undefined, /* funOnly: */true);
  }

  /**
   * Adds static specifications to this class.
   *
   * This method does _not_ create a new class.
   *
   * Each class-side/static specification can be a class or an object.
   * When it is a class, only its class-side is mixed-in.
   *
   * This method can be applied to other, non-`Base` classes (e.g. using `Base.implementStatic.call(Alien, classMix)`).
   *
   * @alias implementStatic
   * @memberOf pentaho.lang.Base
   *
   * @param {...?function|...Object} classSpecs The class-side specifications to mix-in.
   *
   * @return {!Class.<pentaho.lang.Base>|function} This class.
   */
  function class_implementStatic() {
    /* jshint validthis:true*/

    var i = -1;
    var L = arguments.length;
    while(++i < L) {
      // Extend the constructor with `classSpec`.
      // (overriding static methods sets the `base` property on the constructor)
      var classSpec = arguments[i];
      if(classSpec) inst_extend_object.call(this, classSpec);
    }

    return this;
  }

  // endregion

  // region Instance methods

  function inst_base() {}

  /**
   * Extend an object with the properties of another.
   *
   * Methods that are overridden are accessible through `this.base`.
   *
   * This object is extended, but its class doesn't change.
   *
   * Can be applied to non-`Base` instances (e.g. using `Base.prototype.extend.call(alien, {a: "hello"})`).
   *
   * @alias extend
   * @memberOf pentaho.lang.Base#
   *
   * @param {Object} source The instance specification.
   * @param {Object} [keyArgs] The keyword arguments.
   * @param {Object} [keyArgs.exclude] A map of property names to _exclude_ from `source`.
   *
   * @return {!Object} This object.
   */
  function inst_extend(source, keyArgs) {
    /* jshint validthis:true*/
    if(source) {
      // Call `this.extend` method instead of this one, if it exists.
      if(!fun.is(this) && !this.__root_proto__ && fun.is(this.extend) && this.extend !== inst_extend) {
        // If it is inherited from Base (has __root_proto__), don't go this path,
        // to allow overriding the extend method and still call this.base().
        //
        // Because in Base.js, Function#extend has a sub-classing semantics,
        // functions are not considered here, by testing `!fun.is(this)`.
        //
        // This path of code is not used by "Base"'s internal code.
        // It can only happen when `Base#extend` method is applied to a "foreign" object.
        this.extend(source, keyArgs);
      } else {
        inst_extend_object.call(this, source, this.__root_proto__, keyArgs);
      }
    }

    return this;
  }

  /**
   * Copy each of the `source` members to this object.
   *
   * Copies `toString` manually and skip _special_ members.
   *
   * @param {!Object} source Object from where to copy members.
   * @param {Object} [rootProto] The root prototype.
   * When unspecified, overriding methods requires using each actual instance to store the special `base` property.
   *
   * @param {Object} [keyArgs] The keyword arguments.
   * @param {Object} [keyArgs.exclude] A map of property names to _exclude_ from `source`.
   *
   * @private
   */
  function inst_extend_object(source, rootProto, keyArgs) {
    /* jshint validthis:true*/

    // When called, for e.g. on functions, there's no __extend_exclude__
    var lcaExclude = rootProto && O.lca(source, rootProto);
    var exclude = this.__extend_exclude__ || _excludeExtendInst;
    var l_exclude = keyArgs && keyArgs.exclude;
    var visited = Object.create(null);
    var extendProp = function(inst, n) {
      if(!O_hasOwn.call(visited, n) &&
         !O_hasOwn.call(exclude, n) &&
         (!l_exclude || !O_hasOwn.call(l_exclude, n))) {
        visited[n] = 1;
        inst_extend_propDesc.call(inst, n, source, rootProto, null, lcaExclude);
      }
    };

    // Ordered properties first.
    var name;
    var ordered = this.__extend_order__;
    if(ordered) {
      var i = -1;
      var L = ordered.length;
      while(++i < L) if((name = ordered[i]) in source) extendProp(this, name);
    }

    // All other properties
    // eshint guard-for-in: 0
    for(name in source) extendProp(this, name);
  }

  /**
   * Copy member from `source` to this object.
   *
   * @param {string} name The name of the property.
   * @param {!Object} source Object from where to copy members.
   * @param {Object} [rootProto] The root prototype.
   * When unspecified, overriding methods requires using each actual instance to store the special `base` property.
   * @param {?boolean} [funOnly=false] If true, copy only if member is a function.
   * @param {Object} [lcaExclude] An object which base of both this and `source` and whose properties should
   * be excluded from extension.
   * @private
   */
  function inst_extend_propDesc(name, source, rootProto, funOnly, lcaExclude) {
    /* jshint validthis:true*/

    var desc = O.getPropertyDescriptor(source, name, lcaExclude);
    if(desc) {
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
  }

  /**
   * Assign `value` to member `name` of this object.
   *
   * @param {string} name The name of the property.
   * @param {any} value The value to assign to the member.
   * @param {Object} [rootProto] The root prototype.
   * When unspecified, overriding methods requires using each actual instance to store the special `base` property.
   * @param {?boolean} [funOnly] If true, assign only if value is a function.
   *
   * @private
   */
  function inst_extend_propAssign(name, value, rootProto, funOnly) {
    /* jshint validthis:true*/

    if(fun.is(value)) {
      // Only override if it is a normal property.
      // When there is not baseDesc, methodOverride may need to provide a default base method.
      var baseDesc = O.getPropertyDescriptor(this, name);
      if(baseDesc && (baseDesc.get || baseDesc.set)) {
        this[name] = value;
      } else {
        this[name] = methodOverride(value, baseDesc && baseDesc.value, rootProto, name);
      }
    } else if(!funOnly) {
      this[name] = value;
    }
  }

  // endregion

  // region Method Override

  /**
   * Evaluates the need to wrap a method for overriding
   * and returns the appropriate version.
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
   * @param {?function} value The method overriding.
   * @param {?function} baseValue The method to override.
   * @param {Object} [rootProto] The root prototype.
   * When unspecified, overriding methods requires using each actual instance to store the special `base` property.
   * @param {string} [name] The name to give to the overriding method.
   * @param {boolean} [forceOverrideIfDebug=false] Indicates that the method should be overridden, when in debug mode,
   * even in a case where the base method is not called. Only applies if name is specified non-empty.
   * @return {?function} The override-ready function,
   * or null if both `value` and `baseValue` are nully.
   *
   * @private
   */
  function methodOverride(value, baseValue, rootProto, name, forceOverrideIfDebug) {
    if(!value) return baseValue;

    // Get the unwrapped value.
    var method = value.valueOf();

    if(!baseValue) {
      // if `value` was wrapped, return it
      if(method !== value) {
        return value;
      }

      // if not, provide a default empty `baseValue`
      baseValue = inst_base;
    }

    // valueOf() test is to avoid circular references
    if(!method ||
       (baseValue.valueOf && baseValue.valueOf() === method) ||
       ((!forceOverrideIfDebug || !_isDebugMode) && !methodCallsBase(method)))
      return value;

    value = methodOverrideWrapWithName(method, baseValue, rootProto, name);

    // Returns the underlying, wrapped method
    value.valueOf = function(type) {
      return type === "object" ? value : method;
    };

    value.toString = properFunToString;

    return value;
  }

  /**
   * Checks if `this.base` is called in the body of `method`.
   *
   * @param {function} method The function to check.
   *
   * @return {boolean} `true` if the method calls `this.base`.
   *
   * @private
   */
  function methodCallsBase(method) {
    return /\bthis(\s*)\.(\s*)base\b/.test(method);
  }

  /**
   * Creates a wrapper method that injects `baseMethod` into `this.base` and calls `method`.
   *
   * The `baseMethod` is injected into the root constructor `rootProto`, when available.
   *
   * If not (non-Base classes) it is injected directly in the instance.
   *
   * @param {function} method The method overriding.
   * @param {function} baseMethod The method to override.
   * @param {Object} [rootProto] The root prototype.
   * When unspecified, overriding methods requires using each actual instance to store the special `base` property.
   *
   * @return {function} The wrapped function.
   *
   * @private
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

  function methodOverrideWrapWithName(method, baseMethod, rootProto, name) {

    if(!name || !_isDebugMode)
      return methodOverrideWrap(method, baseMethod, rootProto);

    var f;

    if(rootProto) {
      f = new Function(
          "_method_",
          "_baseMethod_",
          "_rootProto_",
          "return function " + sanitizeIdentifier(name) + "() {\n" +
          "  var previous = _rootProto_.base; _rootProto_.base = _baseMethod_;\n" +
          "  try {\n" +
          "      return _method_.apply(this, arguments);\n" +
          "  } finally { _rootProto_.base = previous; }\n" +
          "};");
    } else {
      // float
      f = new Function(
          "_method_",
          "_baseMethod_",
          "_rootProto_",
          "return function " + sanitizeIdentifier(name) + "() {\n" +
          "  var previous = this.base; this.base = _baseMethod_;\n" +
          "  try {\n" +
          "     return _method_.apply(this, arguments);\n" +
          "  } finally { this.base = previous; }\n" +
          "};");
    }

    return f(method, baseMethod, rootProto);
  }

  // endregion

  // region Helpers

  /**
   * Returns the string representation of this method.
   *
   * The native String function or toString method do not call .valueOf() on its argument.
   * However, concatenating with a string does...
   *
   * @return {string} The string representation of the function.
   *
   * @private
   */
  function properFunToString() {
    /* jshint validthis:true*/
    return F_toString.call(this.valueOf());
  }

  /**
   * Defines the `name` and `displayName` of a function.
   *
   * Because `Function#name` is non-writable but configurable it
   * can be set, but only through `Object.defineProperty`.
   *
   * @param {function} fun The function.
   * @param {string} name The name to set on the function.
   *
   * @private
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

  // endregion
});
