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
define(["./has"], function(has) {
  "use strict";

  var O_hasOwn = Object.prototype.hasOwnProperty,
      A_empty  = [],
      setProtoOf = has("Object.setPrototypeOf") ? Object.setPrototypeOf : (has("Object.prototype.__proto__") ? setProtoProp : setProtoCopy),
      constPropDesc = {value: undefined, writable: false, configurable: false, enumerable: false};

  /**
   * The `object` namespace contains functions for
   * common tasks dealing with the manipulation of the internal state of objects.
   *
   * @name object
   * @namespace
   * @memberOf pentaho.util
   * @amd pentaho/util/object
   * @private
   */
  return /** @lends pentaho.util.object */{
    /**
     * Deletes a direct property of an object and returns its value before deletion.
     *
     * Constant properties cannot be deleted.
     *
     * If the specified object is a {@link Nully} value,
     * or the specified property does not exist in the object,
     * own or not,
     * the value of `defaultValue` is returned,
     * or `undefined`, if unspecified.
     *
     * Otherwise, if the specified property exists in the object,
     * but is not an own property,
     * it is not deleted and the inherited value is returned.
     *
     * Finally, if the specified property exists in the object
     * and is an own property,
     * it is deleted and its _previous_ own value is returned.
     *
     * @param {?Object} object - The object whose own property is to be deleted.
     * @param {string} property - The name of the property.
     * @param {any} [defaultValue] - The default value. Defaults to `undefined`.
     * @return {any} The value of the property before deletion.
     *
     * @throws {TypeError} Cannot delete a constant property.
     */
    "delete": function(o, p, dv) {
      var v = dv;
      if(o && (p in o)) {
        v = o[p];
        delete o[p];
      }
      return v;
    },

    /**
     * Calls a function that uses a disposable resource.
     *
     * Returns the function result.
     * The disposable resource is disposed before returning.
     *
     * @param {!pentaho.lang.IDisposable} disposable The disposable resource.
     * @param {function(pentaho.lang.IDisposable):any} fun The function to call with the given resource.
     * @param {Object} [context] The context in which to call `fun`.
     *
     * @return {any} The value returned by `fun`.
     */
    using: function(disposable, fun, context) {
      try {
        return fun.call(context, disposable);
      } finally {
        disposable.dispose();
      }
    },

    /**
     * Determines if a property is a direct property of an object.
     *
     * This method does not check down the object's prototype chain.
     *
     * If the specified object is a {@link Nully} value, `false` is returned.
     *
     * @param {?Object} object - The object to be tested.
     * @param {string} property - The name of the property.
     * @return {boolean} `true` if this is a direct/own property, or `false` otherwise.
     */
    hasOwn: function(o, p) {
      return !!o && O_hasOwn.call(o, p);
    },

    /**
     * Returns the value of a direct property, or the default value.
     *
     * This method does not check down the object's prototype chain.
     *
     * If the specified object is a {@link Nully} value, the default value is returned.
     *
     * @param {?Object} object - The object whose property is to be retrieved.
     * @param {string} property - The name of the property.
     * @param {any} [defaultValue] - The default value. Defaults to `undefined`.
     * @return {boolean} The value of the property if it exists in the object and is an own property,
     * otherwise returns `defaultValue`.
     */
    getOwn: function(o, p, dv) {
      return o && O_hasOwn.call(o, p) ? o[p] : dv;
    },

    /**
     * Sets a property in an object to a value and makes it constant (immutable).
     *
     * The created property cannot be overwritten, deleted, enumerated or configured.
     *
     * @param {!Object} object - The object whose property is to be set.
     * @param {string} property - The name of the property.
     * @param {any} value - The value of the property.
     */
    setConst: function(o, p, v) {
      // Specifying writable ensures overriding previous writable value.
      // Otherwise, only new properties receive a default of false...
      constPropDesc.value = v;

      // Leaks `v` if the following throws, but its an acceptable risk, being an error condition.
      Object.defineProperty(o, p, constPropDesc);

      constPropDesc.value = undefined;
    },

    /**
     * Iterates over all **direct enumerable** properties of an object,
     * yielding each in turn to an iteratee function.
     *
     * The iteratee is bound to the context object, if one is passed,
     * otherwise it is bound to the iterated object.
     * Each invocation of iteratee is called with two arguments: (propertyValue, propertyName).
     * If the iteratee function returns `false`, the iteration loop is broken out.
     *
     * @param {!Object} object - The object containing the properties to be iterated.
     * @param {function} iteratee - The function that will be iterated.
     * @param {?object} [context] - The object which will provide the execution context of the iteratee function.
     * If nully, the iteratee will run with the context of the iterated object.
     *
     * @return {boolean} `true` when the iteration completed regularly,
     * or `false` if the iteration was forcefully terminated.
     */
    eachOwn: function(o, fun, ctx) {
      for(var p in o)
        if(O_hasOwn.call(o, p) && fun.call(ctx || o, o[p], p) === false)
          return false;

      return true;
    },

    /**
     * Iterates over the own properties of a source object and assigns them to a target object.
     *
     * @param {!Object} to - The target object.
     * @param {?Object} from - The source object.
     * @return {!Object} The target object.
     */
    assignOwn: function(to, from) {
      for(var p in from)
        if(O_hasOwn.call(from, p))
          to[p] = from[p];
      return to;
    },

    /**
     * Iterates over the own properties of a source object,
     * checks if their values are defined, and if so, assigns them to a target object.
     *
     * @param {!Object} to - The target object.
     * @param {?Object} from - The source object.
     * @return {!Object} The target object.
     * @method
     * @see pentaho.util.object.assignOwn
     */
    assignOwnDefined: assignOwnDefined,

    /**
     * Creates a shallow clone of a plain object or array.
     *
     * Undefined properties are ignored.
     * If `from` is an instance of a class, or a simple value (e.g. string, number),
     * no clone is created and the original object is returned instead.
     *
     * @param {Object|Array|any} from - The source object.
     * @return {any} A shallow copy of the object,
     * or the object itself if it is neither a plain object nor an array.
     */
    cloneShallow: function(v) {
      if(v && typeof v === "object") {
        if(v instanceof Array)
          v = v.slice();
        else if(v.constructor === Object)
          v = assignOwnDefined({}, v);
      }
      return v;
    },

    /**
     * Retrieves an object that describes a property, traversing the inheritance chain if necessary.
     *
     * @param {!Object} object - The object that contains the property.
     * @param {string} property - The name of property.
     * @return {?Object} The
     * [property descriptor]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty}.
     * @method
     */
    //only used by pentaho.lang.Base
    getPropertyDescriptor: getPropertyDescriptor,

    /**
     * Constructs an instance of a class,
     * from an array of arguments.
     *
     * @param {function} Ctor - The constructor function of the class to be instantiated.
     * @param {?Array} [args] - The array of arguments, or arguments object, which will be passed to the constructor.
     * @return {!Object} The constructed instance.
     */
    //only used by pentaho.lang.Base
    make: function(Ctor, args) {
      switch(args ? args.length : 0) {
        case 0: return new Ctor();
        case 1: return new Ctor(args[0]);
        case 2: return new Ctor(args[0], args[1]);
        case 3: return new Ctor(args[0], args[1], args[2]);
      }

      // generic implementation, possibly slower
      var inst = Object.create(Ctor.prototype);
      return Ctor.apply(inst, args) || inst;
    },

    /**
     * Sets the _prototype_ (i.e., the internal `prototype` property) of a specified object
     * to another object.
     *
     * Setting the _prototype_ to `null` breaks the object's inheritance.
     *
     * Delegates to the native implementation of `Object.setPrototypeOf`, if supported.
     *
     * @param {!Object} object - The object which is to have its prototype set.
     * @param {?Object} prototype - The object's new prototype.
     * @return {!Object} The `object`.
     */
    setPrototypeOf: setProtoOf,

    /**
     * Mutates an object so that it becomes an instance of a given class, if not already.
     *
     * In particular, the _prototype_ and _constructor_ properties of a given object are replaced, if necessary.
     *
     * @param {!Object} inst - The object to be mutated.
     * @param {function} Class - The constructor of the class to be applied to the object.
     * @param {?Array} [args] - The array of arguments to be passed to the constructor of the class.
     * @return {object} The mutated object.
     */
    //only used by pentaho.lang.Base
    applyClass: function(inst, Class, args) {
      var proto = Class.prototype;
      if(proto === inst || proto.isPrototypeOf(inst))
        return inst;

      setProtoOf(inst, proto);

      if(inst.constructor !== Class)
        Object.defineProperty(inst, "constructor", {
          //enumerable: false,
          configurable: true,
          writable: true,
          value: Class
        });

      return Class.apply(inst, args || A_empty) || inst;
    }
  };

  function assignOwnDefined(to, from) {
    var v;
    for(var p in from)
      if(O_hasOwn.call(from, p) && (v = from[p]) !== undefined)
        to[p] = v;
    return to;
  }

  /**
   * Copies a single property from a source object to a target object, provided it is defined.
   * A property is defined if either its value, getter or setter are defined.
   *
   * @param {!Object} to - The target object.
   * @param {!Object} from - The source object.
   * @param {string} p - the name of the property.
   * @return {!Object} The target object.
   * @method
   */
  function copyOneDefined(to, from, p) {
    var pd = getPropertyDescriptor(from, p);
    if(pd && pd.get || pd.set || pd.value !== undefined)
      Object.defineProperty(to, p, pd);
    return to;
  }

  function getPropertyDescriptor(o, p) {
    var pd;
    while(!(pd = Object.getOwnPropertyDescriptor(o, p)) && (o = Object.getPrototypeOf(o)));
    return pd || null;
  }

  function setProtoProp(o, proto) {
    o.__proto__ = proto;
    return o;
  }

  function setProtoCopy(o, proto) {
    for(var p in proto) copyOneDefined(o, proto, p);
    return o;
  }
});
