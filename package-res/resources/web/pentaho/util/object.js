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
define(function() {
  "use strict";

  var O_hasOwn = Object.prototype.hasOwnProperty,
      A_empty  = [],
      setProtoOf = Object.setPrototypeOf || ({}.__proto__ ? setProtoProp : setProtoCopy);

  /**
   * The `object` namespace contains functions for
   * common tasks dealing with the manipulation of the internal state of objects.
   *
   * @name object
   * @namespace
   * @memberOf pentaho.util
   * @amd pentaho/util/object
   *
   */
  return /** @lends pentaho.util.object */{
    /**
     * Deletes an enumerable property in an object, even if it is not a direct/own property.
     * Constant properties cannot be deleted.
     *
     * @param {object} object
     * @param {string} property - Property to be deleted
     * @param {any} defaultValue - Default value of the property.
     * @return {any} Returns the value of the deleted property.
     * If the property did not exist, `defaultValue` is returned instead.
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
     * Determines if the property is a direct property of the object.
     * This method does not check down the object's prototype chain.
     *
     * @param {?object} object - Object to be tested.
     * @param {string} property - Name of the property to be tested.
     * @return {boolean} Returns `true` if this is a direct/own property, or `false` otherwise.
     */
    hasOwn: function(o, p) {
      return !!o && O_hasOwn.call(o, p);
    },

    /**
     * Returns the value of a direct property, or the default value.
     * This method does not check down the object's prototype chain.
     *
     * @param {?object} object - Object to be tested.
     * @param {string} property - Name of the property to be retrieved.
     * @param {any} defaultValue - Default value of the property.
     * @return {boolean} Returns the value of the property if it exists in the object and is an own property,
     * otherwise returns `defaultValue`.
     */
    getOwn: function(o, p, dv) {
      return o && O_hasOwn.call(o, p) ? o[p] : dv;
    },

    /**
     * Creates an immutable (constant) property in an object with a given value.
     * The created property can neither be overwritten nor deleted.
     *
     * @param {!object} object - Object to be tested.
     * @param {string} property - Name of the property to be created.
     * @param {any} value - Value to be assigned to the property.
     */
    setConst: function(o, p, v) {
      Object.defineProperty(o, p, {value: v});
    },

    /**
     * Interates over all **direct enumerable** properties of an object,
     * yielding each in turn to an iteratee function.
     * The iteratee is bound to the context object, if one is passed,
     * otherwise it is bound to the iterated object.
     * Each invocation of iteratee is called with two arguments: (propertyValue, propertyName).
     * If the iteratee function returns `false`, the iteration loop is broken out.
     *
     * @param {!object} object - Object containing the properties to be iterated
     * @param {function} iteratee - Function that will be iterated
     * @param {?object} context - Object which will provide the execution context of the iteratee function.
     * If nully, the iteratee will run with the context of the iterated object.
     *
     * @return {boolean} Returns `true` when the iteration completed regularly,
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
     * @param {!object} to - Target object.
     * @param {!object} from - Source object.
     * @return {object} Returns the target object.
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
     * @param {!object} to - Target object.
     * @param {!object} from - Source object.
     * @return {object} Returns the target object.
     * @method
     * @see pentaho.util.object.assignOwn
     */
    assignOwnDefined: assignOwnDefined,

    /**
     * Creates a shallow clone of a plain object or array.
     * Undefined properties are ignored.
     * If `from` is an instance of a class, or a simple value (e.g. string, number),
     * no clone is created and the original object is returned instead.
     *
     * @param {object|Array|any} from - Source object.
     * @return {any} Returns shallow copy of object,
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
     * @param {!object} object - Object that contains the property.
     * @param {!string} property - Name of property.
     * @return {object|null} Returns the
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
     * @param {Array} [args] - The array of arguments, or arguments object, which will be passed to the constructor.
     * @return {object} Returns the constructed instance.
     */
    //only used by pentaho.lang.Base
    make: function(Ctor, args) {
      switch(args.length) {
        case 0: return new Ctor();
        case 1: return new Ctor(args[0]);
        case 2: return new Ctor(args[0], args[1]);
        case 3: return new Ctor(args[0], args[1], args[2]);
      }
      // generic implementation, possibly slower
      var inst = Object.create(Ctor.prototype);
      return Ctor.apply(inst, args || A_empty) || inst;
    },

    /**
     * Sets the _prototype_ (i.e., the internal `prototype` property) of a specified object
     * to another object.
     *
     * Setting the _prototype_ to `null` breaks the object's inheritance.
     *
     * Delegates to the native implementation of `Object.setPrototypeOf`, if supported.
     *
     * @param {object} obj - The object which is to have its prototype set.
     * @param {?object} prototype - The object's new prototype.
     * @return {object} Returns `object`.
     */
    setPrototypeOf: setProtoOf,

    /**
     * Mutates an object so that it becomes an instance of a given class, if not already.
     * In particular, the _prototype_ and _constructor_ properties of a given object are replaced, if necessary.
     *
     * @param {!object} inst - Object to be mutated.
     * @param {function} Class - Constructor of the class to be applied to the object.
     * @param {?Array} args - Array of arguments to be passed to the constructor of the class.
     * @return {object} Returns the mutated object.
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
   * @param {!object} to - Target object.
   * @param {!object} from - Source object.
   * @param {string} p - Name of the property to be copied.
   * @return {object} Returns the target object.
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