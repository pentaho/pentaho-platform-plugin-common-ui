/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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
(function() {

  "use strict";

  /* globals require */

  /* eslint require-jsdoc: 0 */

  var _nextUid = 1;
  var A_slice = Array.prototype.slice;

  /**
   * Creates a new RequireJS context and returns its `require` function.
   *
   * The new context's initial configuration is that of the parent context.
   *
   * To apply additional configurations to the context, call the `config` method.
   *
   * To provide module definitions to the context, call the `define` method.
   * Only non-anonymous modules are supported.
   *
   * To dispose the context, call the `dispose` method.
   *
   * @alias new
   * @return {function} A contextual, disposable require function.
   */
  require.new = function() {
    // Get a new, unique name for the context.
    // Create the new context with a configuration cloned from the parent or default context.
    var name           = newContextName();
    var parentName     = this.contextName || "_";
    var config         = newContextConfig(name, parentName);
    var contextRequire = require.config(config);
    var context        = getContextByName(name);

    /**
     * The name of the context.
     *
     * @alias contextName
     * @type {string}
     */
    contextRequire.contextName = name;

    contextRequire.new     = require.new;
    contextRequire.promise = require.promise;
    contextRequire.using   = require.using;

    /**
     * Configures the context.
     *
     * @alias config
     * @param {Object} config The configuration.
     * @return {function} The `require` function.
     */
    contextRequire.config = function(config) {
      /* jshint validthis:true*/

      context.configure(config);
      return this;
    };

    /**
     * Defines a module in the context.
     *
     * @alias define
     * @param {string} id The module id.
     * @param {string[]} [deps] The ids of dependencies.
     * @param {function|any} callback The module definition function or the module's value.
     * @return {function} The `require` function.
     */
    contextRequire.define = function(id, deps, callback) {
      /* jshint validthis:true*/

      if(typeof id !== "string")
        throw new Error("Argument 'id' is required. Anonymous modules are not supported.");

      // This module may not have dependencies
      if(!Array.isArray(deps)) {
        callback = deps;
        deps = null;
      }

      if(!deps && typeof callback === "function") {
        deps = [];
      }

      // Publish module in this context's queue.
      // A require call will process these first.
      context.defQueue.push([id, deps, callback]);
      context.defQueueMap[id] = true;

      return this;
    };

    /**
     * Disposes the context.
     * @alias dispose
     */
    contextRequire.dispose = function() {
      delete require.s.contexts[name];
    };

    return contextRequire;
  };

  require.promise = function(deps) {
    var localRequire = this;

    return new Promise(function(resolve, reject) {
      localRequire(deps, function() {
        resolve(A_slice.call(arguments));
      }, reject);
    });
  };

  require.using = function(deps, config, scopedFun) {
    if(!scopedFun && typeof config === "function") {
      scopedFun = config;
      config = null;
    }

    // Identify the special "require" argument.
    // Copy the array, remove "require", and add `localRequire` in its place, later.
    var requireIndex = deps.indexOf("require");
    if(requireIndex >= 0)
      (deps = deps.slice()).splice(requireIndex, 1);

    var localRequire = this.new();
    if(typeof config === "function") {
      config.call(config, localRequire);
    } else if(config !== null) {
      localRequire.config(config);
    }

    return localRequire.promise(deps)
        .then(processDeps)
        .then(callScoped)
        .then(function() {
          disposeContext();
        }, function(reason) {
          disposeContext();
          return Promise.reject(reason);
        });

    function processDeps(values) {

      if(requireIndex >= 0) values.splice(requireIndex, 0, localRequire);

      return values;
    }

    function callScoped(values) {
      /* jshint validthis:true*/
      // forward `this`
      return scopedFun.apply(this, values);
    }

    function disposeContext() {
      localRequire.dispose();
    }
  };

  // ---

  function newContextName() {
    return "_NEW_" + (_nextUid++);
  }

  function getContextByName(name) {
    return require.s.contexts[name];
  }

  function newContextConfig(contextName, parentName) {

    /* eslint default-case: 0 */

    var configClone = {
      context: contextName
    };

    var parentContext = getContextByName(parentName);

    if(parentContext) eachProp(parentContext.config, function(v, p) {
      switch(p) {
        // Don't apply to non-default contexts or are internal state.
        case "deps":
        case "callback":
        case "context": // shouldn't happen
        case "pkgs": return; // ignore

        case "shim": v = cloneConfigShims(v); break;

        // Object deep clone
        case "packages":
        case "paths":
        case "bundles":
        case "config":
        case "map": v = cloneDeep(v); break;
      }

      configClone[p] = v;
    });

    return configClone;
  }

  function cloneConfigShims(shims) {
    var shimsClone = {};

    // Make sure to exclude internally computed property 'exportsFn'
    eachProp(shims, function(shim, mid) {
      shimsClone[mid] = {deps: shim.deps, exports: shim.exports, init: shim.init};
    });

    return shimsClone;
  }

  // ---

  function cloneDeep(source) {
    if(typeof source === "object") {
      if(!source) return source; // null
      if(source instanceof Array) return source.map(cloneDeep);
      if(source.constructor === Object) {
        var target = {};
        eachProp(source, function(v, p) { target[p] = cloneDeep(v); });
        return target;
      }
      // Of Object subclasses (Date, Error, RegExp, ... ?)
    }
    // undefined, number, boolean, string, function
    return source;
  }

  function eachProp(obj, fun, ctx) {
    if(obj) Object.keys(obj).forEach(function(p) {
      fun.call(ctx, obj[p], p);
    });
  }
})();
