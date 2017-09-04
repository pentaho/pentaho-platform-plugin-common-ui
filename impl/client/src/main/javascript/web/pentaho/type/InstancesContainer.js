/*!
 * Copyright 2017 Pentaho Corporation. All rights reserved.
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
  "require",
  "module",
  "../typeInfo",
  "../i18n!types",
  "../service!pentaho.config.IService?single",
  "./changes/Transaction",
  "./changes/TransactionScope",
  "./changes/CommittedScope",
  "../lang/Base",
  "../util/promise",
  "../util/arg",
  "../util/error",
  "../util/object",
  "../util/fun"
], function(localRequire, module, service, typeInfo, bundle, configurationService,
            Base, promiseUtil, arg, error, O, F) {

  "use strict";

  /* globals Promise */
  /* eslint dot-notation: 0 */

  /**
   * @name pentaho.type.IInstanceHolder
   * @interface
   * @private
   *
   * @property {!pentaho.type.InstancesContainer} container - The instances container. Always set.
   * @property {string} id - The instance's identifier. Always set.
   *
   * @property {pentaho.type.Instance} instance - The instance.
   * Only not `null` when the instance has already been created.
   *
   * @property {Error} error - The error in case the instance failed creation.
   *
   * @property {Promise.<pentaho.type.Instance>} promise - A promise for the instance.
   * Only not `null` since the instance has begun loading.
   */

  var __nextInstanceIndex = 1;

  var InstanceHolder = Base.extend({

    constructor: function(id, container, spec) {
      if(!id) throw error.argRequired("id");
      if(!spec) throw error.argRequired("instances['" + id + "]'");

      this.index = __nextInstanceIndex++;

      // Set on construction.
      this.container = container;

      this.typeId = spec.type;
      if(!this.typeId) throw error.argRequired("instances['" + id + "'].type");

      this.id = id;
      this.priority = +spec.priority || 0;

      // Set lazily, when loading.
      this.__promise = null;

      // Set when Created.
      this.instance = null;
      this.error = null; // Set when resolved and error'ed.
    },

    get isFinished() {
      return !!(this.instance || this.error);
    },

    get promise() {
      return this.__promise || this.__finalizeInstanceAsync(this.__loadModuleAsyncCore());
    },

    __loadModuleAsyncCore: function() {
      var configPromise = this.__loadConfigAsync();
      var typePromise = this.container.context.getAsync(this.typeId);
      var modulePromise = promiseUtil.require(this.id, localRequire);

      return modulePromise.then(this.__onModuleLoaded.bind(this, configPromise, typePromise));
    },

    __onModuleLoaded: function(configPromise, typePromise, instModule) {

      if(instModule) {

        var factory;
        var deps;

        if(Array.isArray(instModule)) {
          var L = instModule.length;
          if(L > 0) {
            factory = instModule[L - 1];
            deps = instModule.slice(0, L - 1);
          }
        }

        if(factory) {
          if(!F.is(factory)) {
            return Promise.reject(error.argInvalid("instModule", "Not an array whose last position is a function."));
          }

          return this.__loadFactory(factory, deps, configPromise, typePromise);
        }
      }

      return Promise.reject(error.argInvalidType("instModule", "Array", typeof instModule));
    },

    __loadFactory: function(factory, deps, configPromise, typePromise) {
      var allPromises = [
        configPromise,
        typePromise
      ];

      if(deps && deps.length) {
        allPromises.push(this.container.context.resolveAsync(deps));
      }

      return Promise.all(allPromises).then(this.__createFromFactoryAsync.bind(this, factory));
    },

    __createFromFactoryAsync: function(factory, results) {
      var configSpec = results[0];
      var InstCtor = results[1];
      var deps = results[2] || [];

      var depsAndConfig = deps.concat(configSpec);
      var instance;
      try {
        instance = factory.apply(this.container.context, depsAndConfig);
      } catch(ex) {
        // TODO: contextual error message.
        return Promise.reject(ex);
      }

      // Validate
      if(!instance || !(instance instanceof InstCtor)) {
        return Promise.reject(error.operInvalid("Instance factory must return an instance of '" + this.typeId + "'."));
      }

      return Promise.resolve(instance);
    },
    // endregion

    // region set instance
    __loadConfigAsync: function() {
      return configurationService.selectInstanceAsync(this.id, this.container.context.environment);
    },

    __finalizeInstanceAsync: function(p) {
      var me = this;

      return this.__promise = p.then(function(instance) {
        me.instance = instance;
        me.error = null;

        return instance;
      })["catch"](function(ex) {
        me.instance = null;
        me.error = ex;

        return Promise.reject(ex);
      });
    }
    // endregion
  });

  var InstancesContainer = Base.extend(module.id, /** @lends pentaho.type.InstancesContainer# */{

    /**
     * @alias InstancesContainer
     * @memberOf pentaho.type
     * @class
     * @amd pentaho/type/InstancesContainer
     *
     * @classDesc A class that holds **configured** named instances.
     *
     * @constructor
     * @param {!pentaho.type.Context} context - The associated type context.
     * @param {pentaho.type.spec.IInstancesContainer} spec - The container specification.
     */
    constructor: function(context, spec) {

      if(!context) throw error.argRequired("context");

      /**
       * @type {!pentaho.type.Context}
       * @private
       * @readonly
       */
      this.__context = context;

      /**
       * Map of instance holders by instance id.
       *
       * @type {!Object.<string, !pentaho.type.IInstanceHolder>}
       * @private
       * @readonly
       */
      this.__instanceById = {};

      /**
       * Map from type id to list of instance holders.
       *
       * @type {!Object.<string, !Array.<!pentaho.type.IInstanceHolder>>}
       * @private
       * @readonly
       */
      this.__instancesByType = {};

      // Initialize from given specification
      if(spec) {
        this.configure(spec);
      }
    },

    /**
     * Gets the associated type context.
     *
     * @type {!pentaho.type.Context}
     * @readOnly
     */
    get context() {
      return this.__context;
    },

    /**
     * Configures the instance container with the given specification.
     *
     * @param {pentaho.type.spec.IInstancesContainer} spec - The container specification.
     * @return {!pentaho.type.InstanceContainer} This instance container.
     */
    configure: function(spec) {
      O.eachOwn(spec, function(spec, id) { this.__define(id, spec, /* noSort: */true); }, this);

      O.eachOwn(this.__instancesByType, function(holders) { this.__sortHolders(holders); }, this);

      return this;
    },

    // region define
    /**
     * Defines an instance with a given identifier and container specification.
     *
     * @param {string} id - The instance identifier.
     * @param {object} instanceSpec — The instance's container specification.
     *
     * @return {!pentaho.type.InstanceContainer} This instance container.
     */
    define: function(id, instanceSpec) {

      this.__define(id, instanceSpec);

      return this;
    },

    __define: function(id, instanceSpec, noSort) {

      if(O.getOwn(this.__instanceById, id))
        throw error.argInvalid("id", "An instance with identifier '" + id + "' is already defined.");

      var holder = new InstanceHolder(id, this, instanceSpec);

      this.__instanceById[holder.id] = holder;

      var holders = (this.__instancesByType[holder.typeId] || (this.__instancesByType[holder.typeId] = []));

      holders.push(holder);

      if(!noSort) {
        this.__sortHolders(holders);
      }
    },

    __sortHolders: function(holders) {
      if(holders.length > 1) {
        // By Descending priority and then By Ascending definition index.
        holders.sort(function(holderA, holderB) {
          return F.compare(holderB.priority, holderA.priority) || F.compare(holderA.index, holderB.index);
        });
      }
    },
    // endregion

    // region getById, getByIdAsync
    /**
     * Gets a promise for a configured instance given its identifier.
     *
     * @param {string} id - The instance identifier.
     * @return {!Promise.<pentaho.type.Instance>} A promise for the requested instance.
     *
     * @rejects {pentaho.lang.ArgumentRequiredError} When `id` is an empty string or {@link Nully}.
     * @rejects {pentaho.lang.ArgumentInvalidError} When `id` is not the identifier of a defined instance.
     *
     * @rejects {Error} When the requested instance or its type are not defined as a module in the AMD module system.
     *
     * @rejects {pentaho.lang.OperationInvalidError} When the requested instance's AMD module did not return
     * an instance of the defined type.
     *
     * @rejects {Error} When any other unexpected error occurs.
     */
    getByIdAsync: function(id) {

      if(!id) return Promise.reject(error.argRequired("id"));

      try {
        // Check if there is an instance holder for it.
        var holder = O.getOwn(this.__instanceById, id);
        if(!holder) {
          return Promise.reject(error.argInvalid("id", "An instance with identifier '" + id + "' is not defined."));
        }

        return holder.promise;
      } catch(ex) {
        return Promise.reject(ex);
      }
    },

    /**
     * Gets a loaded configured instance given its identifier.
     *
     * An instance can only be requested synchronously if it has already been requested asynchronously before.
     *
     * @param {string} id - The instance identifier.
     * @return {!pentaho.type.Instance} The requested instance.
     *
     * @throws {pentaho.lang.ArgumentRequiredError} When `id` is an empty string or {@link Nully}.
     * @throws {pentaho.lang.ArgumentInvalidError} When `id` is not the identifier of a defined instance.
     * @throws {pentaho.lang.OperationInvalidError} When the requested instance has not been loaded yet.
     *
     * @throws {Error} When the requested instance or its type are not defined as a module in the AMD module system.
     * @throws {pentaho.lang.OperationInvalidError} When the requested instance's AMD module did not return
     * an instance of the defined type.
     */
    getById: function(id) {

      if(!id) throw error.argRequired("id");

      // Check if there is an instance holder for it.
      var holder = O.getOwn(this.__instanceById, id);
      if(!holder) {
        throw error.argInvalid("id", "An instance with identifier '" + id + "' is not defined.");
      }

      if(!holder.isFinished) {
        throw error.operInvalid("The instance with identifier '" + id + "' has not been loaded yet.");
      }

      if(holder.instance)
        return holder.instance;

      throw holder.error;
    },
    // endregion

    // region getByTypeAsync, getAllByTypeAsync, getByType, getAllByType
    /**
     * Gets a promise for the first instance of the given type and that, optionally, matches a specified filter.
     *
     * @param {string} baseTypeId - The identifier of the base type.
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {function(!pentaho.type.Instance) : boolean} [keyArgs.filter] - A predicate function that determines
     * whether an instance can be the result.
     * @param {boolean} [keyArgs.isRequired=false] - Indicates that the promise should be rejected
     * if there is no matching result.
     *
     * @return {!Promise.<pentaho.type.Instance>} A promise for: a matching instance or `null`.
     *
     * @rejects {pentaho.lang.ArgumentRequiredError} When `baseTypeId` is an empty string or {@link Nully}.
     */
    getByTypeAsync: function(baseTypeId, keyArgs) {

      if(!baseTypeId) return Promise.reject(error.argRequired("baseTypeId"));

      if(O.getOwn(keyArgs, "filter")) {
        // Loads all instances of type and then filters.
        return this.__getAllByTypeAsync(baseTypeId, keyArgs).then(function(instances) {
          return instances.length ? instances[0] : null;
        });
      }

      // Load the first registered instance, only.
      var holders = O.getOwn(this.__instancesByType, baseTypeId);
      if(holders) {
        return holders[0].promise;
      }

      if(O.getOwn(keyArgs, "isRequired")) {
        return Promise.reject(error.operInvalid("There is no defined matching instance of type '" + baseTypeId + "'."));
      }

      return Promise.resolve(null);
    },

    /**
     * Gets a promise for all of the instances of the given type and that, optionally, match a specified filter.
     *
     * @param {string} baseTypeId - The identifier of the base type.
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {function(!pentaho.type.Instance) : boolean} [keyArgs.filter] - A predicate function that determines
     * whether an instance can be part of the result.
     * @param {boolean} [keyArgs.isRequired=false] - Indicates that the promise should be rejected
     * if there is no matching result.
     *
     * @return {!Promise.<Array.<!pentaho.type.Instance>>} A promise for an array of matching instances, possibly empty.
     *
     * @rejects {pentaho.lang.ArgumentRequiredError} When `baseTypeId` is an empty string or {@link Nully}.
     */
    getAllByTypeAsync: function(baseTypeId, keyArgs) {

      if(!baseTypeId) return Promise.reject(error.argRequired("baseTypeId"));

      return this.__getAllByTypeAsync(baseTypeId, keyArgs);
    },

    /**
     * Gets the first of the instances of the given type which are already successfully loaded and that, optionally,
     * match a specified filter.
     *
     * @param {string} baseTypeId - The identifier of the base type.
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {function(!pentaho.type.Instance) : boolean} [keyArgs.filter] - A predicate function that determines
     * whether an instance can be the result.
     * @param {boolean} [keyArgs.isRequired=false] - Indicates that an error should be thrown if there is no matching
     * result.
     *
     * @return {pentaho.type.Instance} A matching loaded instance, or `null`.
     *
     * @throws {pentaho.lang.OperationInvalidError} When there is no matching result and `keyArgs.isRequired` is `true`.
     */
    getByType: function(baseTypeId, keyArgs) {

      if(!baseTypeId) return error.argRequired("baseTypeId");

      var holders = this.__getHolders(baseTypeId);
      if(holders) {
        var filter = O.getOwn(keyArgs, "filter");

        var L = holders.length;
        var i = -1;
        while(++i < L) {
          var instance = holders[i].instance;
          if(instance && (!filter || filter(instance))) {
            return instance;
          }
        }
      }

      if(O.getOwn(keyArgs, "isRequired")) {
        throw this.__createRequiredError(baseTypeId);
      }

      return null;
    },

    /**
     * Gets all of the instances of the given type which are already successfully loaded and that, optionally,
     * match a specified filter.
     *
     * @param {string} baseTypeId - The identifier of the base type.
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {function(!pentaho.type.Instance) : boolean} [keyArgs.filter] - A predicate function that determines
     * whether an instance can be part of the result.
     *
     * @param {boolean} [keyArgs.isRequired=false] - Indicates that an error should be thrown if there are no matching
     * results.
     *
     * @return {!Array.<!pentaho.type.Instance>} An array of matching instances, possibly empty.
     */
    getAllByType: function(baseTypeId, keyArgs) {

      if(!baseTypeId) return error.argRequired("baseTypeId");

      var filter = O.getOwn(keyArgs, "filter");

      var holders = this.__getHolders(baseTypeId);
      if(holders) {
        holders = holders.filter(function(holder) {
          return !!holder.instance && (!filter || filter(holder.instance));
        });

        if(holders.length) {
          return holders;
        }
      }

      if(O.getOwn(keyArgs, "isRequired")) {
        throw this.__createRequiredError(baseTypeId);
      }

      return [];
    },

    __getAllByTypeAsync: function(baseTypeId, keyArgs) {
      var promiseAll;
      var holders = this.__getHolders(baseTypeId);
      if(holders) {
        promiseAll = Promise.all(holders.map(function(holder) { return holder.promise; }));

        var filter = O.getOwn(keyArgs, "filter");
        if(filter) {
          promiseAll = promiseAll.then(function(instances) { return instances.filter(filter); });
        }
      } else {
        promiseAll = Promise.resolve([]);
      }

      if(O.getOwn(keyArgs, "isRequired")) {
        promiseAll = promiseAll.then(function(instances) {
          if(!instances.length) {
            return Promise.reject(this.__createRequiredError(baseTypeId));
          }

          return instances;
        });
      }

      return promiseAll;
    },

    // Holders are already sorted by priority.
    __getHolders: function(baseTypeId) {

      // TODO: Get, from typeInfo, all types that descend from baseTypeId.

      return O.getOwn(this.__instancesByType, baseTypeId);
    },

    __createRequiredError: function(baseTypeId) {
      return error.operInvalid("There is no defined matching instance of type '" + baseTypeId + "'.");
    },
    // endregion

    getAsync: function(instSpec) {

    },

    getAllAsync: function(typeSpec) {

    }
  });
});
