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
define(function() {
  "use strict";

  var O_hasOwn = Object.prototype.hasOwnProperty,
      A_empty  = [],
      setProtoOf = Object.setPrototypeOf || ({}.__proto__ ? setProtoProp : setProtoCopy);

  return /** @lends pentaho.util.object */{
    "delete": function(o, p, dv) {
      var v = dv;
      if(o && (p in o)) {
        v = o[p];
        delete o[p];
      }
      return v;
    },

    hasOwn: function(o, p) {
      return !!o && O_hasOwn.call(o, p);
    },

    getOwn: function(o, p, dv) {
      return o && O_hasOwn.call(o, p) ? o[p] : dv;
    },

    setConst: function(o, p, v) {
      Object.defineProperty(o, p, {value: v});
    },

    eachOwn: function(o, fun, ctx) {
      for(var p in o)
        if(O_hasOwn.call(o, p) && fun.call(ctx || o, o[p], p) === false)
          return false;

      return true;
    },

    eachOwnDefined: function(o, fun, ctx) {
      var v;
      for(var p in o)
        if(O_hasOwn.call(o, p) &&
           (v = o[p]) !== undefined &&
           fun.call(ctx || o, v, p) === false)
          return false;

      return true;
    },

    assignOwnDefined: assignOwnDefined,
    assignOwn: assignOwn,

    copyOneDefined: copyOneDefined,

    copyOwnDefined: function(to, from) {
      if(from) {
        var keys = Object.keys(from),
            i = -1,
            L = keys.length;
        while(++i < L)
          copyOneDefined(to, from, keys[i]);

      }

      return to;
    },

    cloneShallow: function(v) {
      if(v && typeof v === "object") {
        if(v instanceof Array)
          v = v.slice();
        else if(v.constructor === Object)
          v = assignOwnDefined({}, v);
      }
      return v;
    },

    getPropertyDescriptor: getPropertyDescriptor,

    /**
     * Constructs an instance of a class,
     * from a an array of arguments.
     *
     * @param {function} Ctor The constructor function.
     * @param {Array} [args] The array of arguments, or arguments object.
     * @return {*} The constructed instance.
     */
    make: function(Ctor, args) {
      var inst = Object.create(Ctor.prototype);
      switch(args.length) {
        case 1: return new Ctor(args[0]);
        case 2: return new Ctor(args[0], args[1]);
        case 0: return new Ctor();
        case 3: return new Ctor(args[0], args[1], args[2]);
      }

      return Ctor.apply(inst, args || A_empty) || inst;
    },

    setPrototypeOf: setProtoOf,

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

  function assignOwn(to, from) {
    for(var p in from)
      if(O_hasOwn.call(from, p))
        to[p] = from[p];
    return to;
  }

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