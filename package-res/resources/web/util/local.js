/**
 * local.js: A RequireJS plugin that enables coordinating other framework's asynchronous loading mechanisms with "local" modules.
 *
 * For more information see https://github.com/jganoff/localjs
 *
 * Licensed under the Apache License 2.0 (http://www.apache.org/licenses/LICENSE-2.0.txt)
 *
 * This is a slight modification from the one found on Github. We use pen.define here (instead of define) so it can be
 * used outside of our build process.
 */
/*jslint regexp: false, nomen: false, plusplus: true, sloppy: true */
/*global require: false, define: false */

pen.define(function () {
  var local, addCallback, invokeCallbacks, isDefined, registerLocal,
    defined = {}, required = {};

  /**
   * Register a local module object
   * @param {String} name Name of the local module
   */
  registerLocal = function (name, module) {
    defined[name] = [module];
    // Call any callbacks waiting for this local to be defined and remove them from our cache
    invokeCallbacks(name, module);
  };

  /**
   * Determine if a local module has been defined
   * @param {String} name Name of the local module to check
   */
  isDefined = function (name) {
    return defined[name] !== undefined;
  };

  /**
   * Add a callback to be called when the local module is loaded
   * @param {String} name Name of the local module the callback depends on
   * @param {Function} callback The function to execute when the local module is loaded
   */
  addCallback = function (name, callback) {
    var req = required[name] || [];
    req.push(callback);
    required[name] = req;
  };

  /**
   * Invokes callbacks registered for the local module and removes them from our cache
   * @param {String} name Name of the local module
   * @param {Object} local Local module to pass along to the callback
   */
  invokeCallbacks = function (name, local) {
    var i, req = required[name];
    if (req !== undefined) {
      for (i = 0; i < req.length; i++) {
        req[i].call(null, local);
      }
    }
    // This local module is no longer required by any callbacks, clean up memory.
    delete required[name];
  };

  /**
   * local.js public interface
   */
  local = {
    /**
     * RequireJS plugin API to load a module.
     */
    load: function (name, req, load, config) {
      if (isDefined(name)) {
        // If we're already defined execute the callback immediately
        load.call(null, defined[name][0]);
      } else {
        // Cache the callback to be notified when the local module has been loaded
        addCallback(name, load);
      }
    },

    /**
     * Provides a way for client code to define a local module. This is required until RequireJS provides a pluggable definition system.
     * Local modules may only be defined once.
     *
     * TODO Implement dependencies during define (would be best to hook into RequireJS for this)
     *
     * @param {String} name Name of the local module to define
     * @param {Function} f The function that should return the defined module. This is optional.
     */
    define: function (name, f) {
      var module;
      // Only allow a local module to be defined once
      if (isDefined(name)) {
        throw "local module is already defined: " + name;
      }

      // Evaluate the function to get the module's value
      module = (typeof f !== "undefined") ? f.call(null) : null;
      // Register the local module
      registerLocal(name, module);
    }
  };

  return local;
});