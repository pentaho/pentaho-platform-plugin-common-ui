
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
define([
  "service!IVizTypeProvider",
  "common-ui/es6-promise-shim"
], function(vizTypeProviders) {

  /*global Promise:true*/

  var O_hasOwn = Object.prototype.hasOwnProperty;

  /**
   * @module common-ui.vizapi
   */

  /**
   * A singleton class that manages visualization types
   * of which visualization instances can be created.
   *
   * #### AMD
   *
   * **Module Id**: `"common-ui/vizapi/vizTypeRegistry"`
   *
   * **Module Type**: {{#crossLink "VizTypeRegistry"}}{{/crossLink}}
   *
   * @class VizTypeRegistry
   * @constructor
   */
  function VizTypeRegistry() {
    this._vizTypeList = [];
    this._vizTypeMap  = {};
  }

  /**
   * Adds a visualization type.
   *
   * An error is thrown if a visualization type with
   * the same _id_ is already registered.
   *
   * @method add
   * @param {IVizType} vizType The visualization type.
   * @chainable
   */
  VizTypeRegistry.prototype.add = function(vizType) {
    if(!vizType) throw new Error("Argument required: 'vizType'.");

    var vizType0 = O_hasOwn.call(this._vizTypeMap, vizType.id)
      ? this._vizTypeMap[vizType.id]
      : null;
    if(vizType0) {
      if(vizType0 === vizType) return this;

      throw new Error(
        "Argument invalid: 'vizType'. " +
        "A visualization with the id '" + vizType.id +
        "' is already registered.");
    }

    this._vizTypeList.push(vizType);
    this._vizTypeMap[vizType.id] = vizType;
    return this;
  };

  /**
   * Gets an array with all registered visualization types.
   *
   * Do **not** modify the returned array.
   *
   * @method getAll
   * @return {Array} An array of {{#crossLink "IVizType"}}{{/crossLink}}.
   */
  VizTypeRegistry.prototype.getAll = function() {
    return this._vizTypeList;
  };

  /**
   * Gets a visualization type given its id,
   * or `null` if one is not registered.
   *
   * @method get
   * @param {String} [id] The id of the visualization type.
   * @return {IVizType|Null} The visualization type or `null`.
   */
  VizTypeRegistry.prototype.get = function(id) {
    return O_hasOwn.call(this._vizTypeMap, id) ? this._vizTypeMap[id] : null;
  };

  // NOTE: This method is temporary until createAsync is implemented.
  VizTypeRegistry.prototype.createByTypeAsync = function(vizType, arg) {
    return new Promise(function(resolve, reject) {
      var moduleId = vizType.instanceModule,
          tryResolve = function(viz) {
            if(!viz)
              reject(new Error("Invalid visualization factory."));
            else
              resolve(viz);
          };
      if(moduleId) {
        require([moduleId], function(instFactory) {
          Promise.resolve(instFactory(vizType.id, arg))
            .then(tryResolve, reject);
        });
      } else {
        try {
          // Legacy global class
          var className = vizType['class'],
              viz2;
          eval('(viz2 = new ' + className + '(arg))');
          tryResolve(viz2);
        } catch(ex) {
          reject(ex);
        }
      }
    });
  };

  // -------

  var vizTypeRegistry = new VizTypeRegistry();

  // Auto-load the registry from registered IVizTypeProvider instances.
  vizTypeProviders.forEach(function(vizTypeProvider) {
    vizTypeProvider.getAll().forEach(function(vizType) {
      vizTypeRegistry.add(vizType);
    });
  });

  return vizTypeRegistry;
});
