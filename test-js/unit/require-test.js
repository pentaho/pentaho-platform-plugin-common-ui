/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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

  /*global require:false */

  var _nextUid = 1;

  /**
   * Creates a new RequireJS context and returns its `require` function.
   *
   * The new context's initial configuration is that of the parent context.
   *
   * To apply additional configurations to the context, call the `config` method.
   *
   * To provide module definitions to the context, call the `define` method.
   * Only non-anonymous methods are supported.
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

    contextRequire.new = require.newContext;

    /**
     * Configures the context.
     *
     * @alias config
     * @param {Object} config The configuration.
     * @return {function} The `require` function.
     */
    contextRequire.config = function(config) {
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

  // ---

  function newContextName() {
    return "_NEW_" + (_nextUid++);
  }

  function getContextByName(name) {
    return require.s.contexts[name];
  }

  function newContextConfig(contextName, parentName) {
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
}());
