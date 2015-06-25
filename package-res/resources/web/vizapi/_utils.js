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

 // Visual API Private Module

define(["es6-promise-shim"], function() {

  var O_hasOwn = Object.prototype.hasOwnProperty;

  return {
    O_hasOwn: O_hasOwn,
    O_getOwn: O_getOwn,
    O_copyOwnDefined: O_copyOwnDefined,
    O_eachOwnDefined: O_eachOwnDefined,
    F_true: F_true,
    shallowObjectClone: shallowObjectClone,
    extend:  extend,
    compare: compare,
    option:  option,
    randomId: randomId,
    promiseCall: promiseCall,
    promiseFinally: promiseFinally,
    requirePromise: requirePromise,
    error: {
      argRequired: argRequired,
      argInvalid:  argInvalid
    }
  };

  function O_getOwn(p, dv) {
    return O_hasOwn.call(this, p) ? this[p] : dv;
  }

  function O_copyOwnDefined(from) {
    var v;
    for(var p in from)
      if(O_hasOwn.call(from, p) && (v = from[p]) !== undefined)
        this[p] = v;
    return this;
  }

  function O_eachOwnDefined(fun, ctx) {
    var v;
    for(var p in this)
      if(O_hasOwn.call(this, p) && (v = this[p]) !== undefined)
        fun.call(this, v, p);
    return this;
  }

  function shallowObjectClone(v) {
    if(v && typeof v === "object") {
      if(v instanceof Array)
        v = v.slice();
      else if(v.constructor === Object)
        v = O_copyOwnDefined.call({}, v);
    }
    return v;
  }

  // Copy own full
  function extend(to, from) {
    if(from) Object.keys(from).forEach(function(p) {
      var pd = Object.getOwnPropertyDescriptor(from, p);
      if(pd.get || pd.set || pd.value !== undefined) {
        Object.defineProperty(to, p, pd);
      }
    });
    return to;
  }

  function option(o, p, dv) {
    var v;
    return o && (v = o[p]) != null ? v : dv;
  }

  function randomId(prefix) {
    return (prefix == null ? "a" : prefix) +
        "_" + (new Date()).getTime() +
        "_" + Math.floor(Math.random() * 1000);
  }

  function F_true() {
    return true;
  }

  function argRequired(name) {
    return new Error("Argument required: '" + name + "'.");
  }

  function argInvalid(name, text) {
    return new Error("Argument '" + name + "' is invalid." + (text ? (" " + text) : ""));
  }

  function compare(a, b) {
      return (a === b) ? 0 : ((a > b) ? 1 : -1);
  }

  function promiseCall(fun, ctx) {
    // Wrapping a call this way,
    // ensures that any sync Error flows to the outer promise.
    return new Promise(function(resolve, reject) {
        Promise
          .resolve(fun.call(ctx))
          .then(resolve, reject);
      });
  }

  function requirePromise(deps, localRequire) {
    var requireFun = localRequire || require;
    return new Promise(function(resolve, reject) { requireFun(deps, resolve, reject); });
  }

  function promiseFinally(promise, fun, ctx) {
    return promise.then(function(value) {
      fun.call(ctx);
      return value;
    }, function(reason) {
      fun.call(ctx);
      return Promise.reject(reason);
    });
  }
});
