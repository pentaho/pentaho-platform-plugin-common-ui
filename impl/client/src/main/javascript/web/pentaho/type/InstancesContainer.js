/*!
 * Copyright 2017 Hitachi Vantara. All rights reserved.
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
  "../instanceInfo",
  "../typeInfo",
  "../i18n!types",
  "../lang/Base",
  "../lang/SortedList",
  "./util",
  "../util/promise",
  "../util/arg",
  "../util/error",
  "../util/object",
  "../util/fun",
  "../debug",
  "../debug/Levels",
  "../util/logger"
], function(localRequire, module, instanceInfo, typeInfo, bundle, Base, SortedList, typeUtil,
            promiseUtil, arg, error, O, F, debugMgr, DebugLevels, logger) {

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

    constructor: function(id, container, typeId, instanceConfig) {

      if(!id) throw error.argRequired("id");
      if(!typeId) throw error.argRequired("typeId");

      this.index = __nextInstanceIndex++;

      // Set on construction.
      this.container = container;

      // Convert an alias to its id.
      this.typeId = typeInfo.getIdOf(typeId) || typeId;

      this.id = id;
      this.ranking = (instanceConfig && +instanceConfig.ranking) || 0;

      var isEnabled = instanceConfig && instanceConfig.isEnabled;
      this.isEnabled = isEnabled == null || !!isEnabled;

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
      var typePromise = this.container.context.getAsync(this.typeId);
      var modulePromise = promiseUtil.require(this.id, localRequire);

      return modulePromise.then(this.__onModuleLoaded.bind(this, typePromise));
    },

    __onModuleLoaded: function(typePromise, instModule) {

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

          return this.__loadFactory(factory, deps, typePromise);
        }
      }

      return Promise.reject(error.argInvalidType("instModule", "Array", typeof instModule));
    },

    __loadFactory: function(factory, depRefs, typePromise) {
      var allPromises = [
        typePromise
      ];

      if(depRefs && depRefs.length) {
        allPromises.push(this.container.context.getDependencyAsync(depRefs, {dependentId: this.id}));
      }

      return Promise.all(allPromises).then(this.__createFromFactoryAsync.bind(this, factory));
    },

    __createFromFactoryAsync: function(factory, results) {
      var InstCtor = results[0];
      var deps = results[1] || [];

      var configSpec = this.container.context.__config.selectInstance(this.id);
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
    __finalizeInstanceAsync: function(p) {
      var me = this;

      return this.__promise = p.then(function(instance) {
        me.instance = instance;
        me.error = null;

        if(debugMgr.testLevel(DebugLevels.debug, module)) {
          logger.info("Loaded named instance '" + me.id + "'.");
        }

        return instance;
      })["catch"](function(ex) {
        me.instance = null;
        me.error = ex;

        if(debugMgr.testLevel(DebugLevels.error, module)) {
          logger.error("Error loading named instance '" + me.id + "': " + ex);
        }

        return Promise.reject(ex);
      });
    }
    // endregion
  });

  return Base.extend(module.id, /** @lends pentaho.type.InstancesContainer# */{

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
     * @param {pentaho.type.spec.ContextInstancesConfiguration} spec - The instances' context configuration.
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

      // Caches
      this.__Number = null;
      this.__Boolean = null;
      this.__String = null;

      var instanceIds = instanceInfo.getAllByType("pentaho/type/instance", {includeDescendants: true});
      if(instanceIds) {
        instanceIds.forEach(function(instanceId) {
          var typeId = instanceInfo.getTypeOf(instanceId);
          var instanceDecl = O.getOwn(spec, instanceId);
          this.declare(instanceId, typeId, instanceDecl);
        }, this);
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

    // region declare
    /**
     * Declares an instance with a given identifier and container specification.
     *
     * @param {string} id - The instance identifier.
     * @param {string} typeId - The type identifier.
     * @param {pentaho.type.spec.IContextInstanceConfiguration} instanceConfig — The instance's container configuration.
     *
     * @return {!pentaho.type.InstancesContainer} This instance container.
     */
    declare: function(id, typeId, instanceConfig) {

      if(O.getOwn(this.__instanceById, id))
        throw error.argInvalid("id", "An instance with identifier '" + id + "' is already defined.");

      var holder = new InstanceHolder(id, this, typeId, instanceConfig);

      this.__instanceById[holder.id] = holder;

      var holders = (this.__instancesByType[holder.typeId] ||
          (this.__instancesByType[holder.typeId] = new SortedList({comparer: __holderComparer})));

      holders.push(holder);

      return this;
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
     *
     * @return {pentaho.type.Instance} The requested instance, or `null`, when reserved.
     *
     * @throws {pentaho.lang.ArgumentRequiredError} When `id` is an empty string or {@link Nully}.
     * @throws {pentaho.lang.OperationInvalidError} When `id` is not the identifier of a defined instance.
     * @throws {pentaho.lang.OperationInvalidError} When the requested instance has not been loaded yet.
     * @throws {pentaho.lang.OperationInvalidError} When the requested instance's AMD module did not return
     * an instance of the defined type.
     * @throws {Error} When the requested instance or its type are not defined as a module in the AMD module system.
     */
    getById: function(id) {

      if(!id) throw error.argRequired("id");

      // Check if there is an instance holder for it.
      var holder = O.getOwn(this.__instanceById, id);
      if(!holder) {
        throw error.operInvalid("An instance with identifier '" + id + "' is not defined.");
      }

      if(!holder.isFinished) {
        throw error.operInvalid("The instance with identifier '" + id + "' has not been loaded yet.");
      }

      var instance = holder.instance;
      if(instance) {
        return instance;
      }

      throw holder.error;
    },
    // endregion

    // region getByTypeAsync, getAllByTypeAsync, getByType, getAllByType
    /**
     * Gets a promise for the first instance of the given type and that, optionally, matches a specified filter.
     *
     * @param {string|Class.<pentaho.type.Instance>|pentaho.type.Type} baseTypeId - The identifier of the base type or
     * the instance constructor or type of an identified type.
     *
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {function(!pentaho.type.Instance) : boolean} [keyArgs.filter] - A predicate function that determines
     * whether an instance can be the result.
     * @param {boolean} [keyArgs.isRequired=false] - Indicates that the promise should be rejected
     * if there is no matching result.
     *
     * @return {!Promise.<pentaho.type.Instance>} A promise for: a matching instance or `null`.
     *
     * @rejects {pentaho.lang.ArgumentRequiredError} When `baseTypeId` is an empty string or {@link Nully}.
     * @rejects {pentaho.lang.ArgumentInvalidError} When `baseTypeId` is an instance constructor or type object of
     * an anonymous type.
     * @rejects {pentaho.lang.OperationInvalidError} When `keyArgs.isRequired` is `true` and
     * there is no matching result.
     */
    getByTypeAsync: function(baseTypeId, keyArgs) {

      try {
        // Loads all instances of type and then filters.
        return this.__getAllByTypeAsync(baseTypeId, keyArgs).then(function(instances) {
          return instances.length ? instances[0] : null;
        });
      } catch(ex) {
        return Promise.reject(ex);
      }
    },

    /**
     * Gets a promise for all of the instances of the given type and that, optionally, match a specified filter.
     *
     * @param {string|Class.<pentaho.type.Instance>|pentaho.type.Type} baseTypeId - The identifier of the base type or
     * the instance constructor or type of an identified type.
     *
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {function(!pentaho.type.Instance) : boolean} [keyArgs.filter] - A predicate function that determines
     * whether an instance can be part of the result.
     * @param {boolean} [keyArgs.isRequired=false] - Indicates that the promise should be rejected
     * if there is no matching result.
     *
     * @return {!Promise.<Array.<!pentaho.type.Instance>>} A promise for an array of matching instances, possibly empty.
     *
     * @rejects {pentaho.lang.ArgumentRequiredError} When `baseTypeId` is an empty string or {@link Nully}.
     * @rejects {pentaho.lang.ArgumentInvalidError} When `baseTypeId` is an instance constructor or type object of
     * an anonymous type.
     * @rejects {pentaho.lang.OperationInvalidError} When `keyArgs.isRequired` is `true` and
     * there are no matching results.
     */
    getAllByTypeAsync: function(baseTypeId, keyArgs) {

      try {
        return this.__getAllByTypeAsync(baseTypeId, keyArgs);
      } catch(ex) {
        return Promise.reject(ex);
      }
    },

    /**
     * Gets a function which filters results.
     *
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {function(!pentaho.type.Instance) : boolean} [keyArgs.filter] - A predicate function that determines
     * whether an instance can be the result.
     *
     * @return {function(!pentaho.type.Instance) : boolean} A function that returns `true` if the instance is selected
     * by the filter and returns `false`, otherwise.
     * @private
     */
    __getFilter: function(keyArgs) {

      var filter = O.getOwn(keyArgs, "filter");

      return function(instance) {
        return !!instance && (!filter || filter(instance));
      };
    },

    /**
     * Gets the highest ranking instance among the instances of the given type which are successfully loaded and
     * that, optionally, match a specified filter.
     *
     * @param {string|Class.<pentaho.type.Instance>|pentaho.type.Type} baseTypeId - The identifier of the base type or
     * the instance constructor or type of an identified type.
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {function(!pentaho.type.Instance) : boolean} [keyArgs.filter] - A predicate function that determines
     * whether an instance can be the result.
     * @param {boolean} [keyArgs.isRequired=false] - Indicates that an error should be thrown if there is no matching
     * result.
     *
     * @return {pentaho.type.Instance} A matching loaded instance, or `null`.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `baseTypeId` is an instance constructor or type object of
     * an anonymous type.
     * @throws {pentaho.lang.OperationInvalidError} When `keyArgs.isRequired` is `true` and there is no matching result.
     */
    getByType: function(baseTypeId, keyArgs) {

      baseTypeId = this.__processType(baseTypeId);

      var holders = this.__getHolders(baseTypeId);
      if(holders) {
        var filter = this.__getFilter(keyArgs);

        var L = holders.length;
        var i = -1;
        while(++i < L) {
          var holder = holders[i];
          if(holder.isEnabled) {
            var instance = holder.instance;
            if(filter(instance)) {
              return instance;
            }
          }
        }
      }

      if(O.getOwn(keyArgs, "isRequired")) {
        throw this.__createNoInstancesOfTypeError(baseTypeId);
      }

      return null;
    },

    /**
     * Gets all of the instances of the given type which are already successfully loaded and that, optionally,
     * match a specified filter.
     *
     * @param {string|Class.<pentaho.type.Instance>|pentaho.type.Type} baseTypeId - The identifier of the base type or
     * the instance constructor or type of an identified type.
     *
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {function(!pentaho.type.Instance) : boolean} [keyArgs.filter] - A predicate function that determines
     * whether an instance can be part of the result.
     * @param {boolean} [keyArgs.isRequired=false] - Indicates that an error should be thrown if there are no matching
     * results.
     *
     * @return {!Array.<!pentaho.type.Instance>} An array of matching instances, possibly empty.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `baseTypeId` is an instance constructor or type object of
     * an anonymous type.
     * @throws {pentaho.lang.OperationInvalidError} When there is no matching result and `keyArgs.isRequired` is `true`.
     */
    getAllByType: function(baseTypeId, keyArgs) {

      baseTypeId = this.__processType(baseTypeId);

      var holders = this.__getHolders(baseTypeId);
      if(holders) {
        var filter = this.__getFilter(keyArgs);

        var instances = holders
            .map(function(holder) {
              // NotLoaded/Failed instances return null.
              return holder.isEnabled ? holder.instance : null;
            })
            .filter(filter);

        if(instances.length) {
          return instances;
        }
      }

      if(O.getOwn(keyArgs, "isRequired")) {
        throw this.__createNoInstancesOfTypeError(baseTypeId);
      }

      return [];
    },

    __getAllByTypeAsync: function(baseTypeId, keyArgs) {

      baseTypeId = this.__processType(baseTypeId);

      var promiseAll;
      var isRequired = O.getOwn(keyArgs, "isRequired");

      var holders = this.__getHolders(baseTypeId);
      if(holders) {
        var filter = O.getOwn(keyArgs, "filter");
        var me = this;

        promiseAll = Promise.all(holders.map(function(holder) {
          // Convert failed instances to null
          if(!holder.isEnabled) return null;
          return holder.promise["catch"](function() { return null; });
        }))
        .then(function(instances) {
          instances = instances.filter(function(instance) {
            return !!instance && (!filter || filter(instance));
          });

          if(isRequired && !instances.length) {
            return Promise.reject(me.__createNoInstancesOfTypeError(baseTypeId));
          }

          return instances;
        });

      } else if(isRequired) {
        promiseAll = Promise.reject(this.__createNoInstancesOfTypeError(baseTypeId));
      } else {
        promiseAll = Promise.resolve([]);
      }

      return promiseAll;
    },

    __processType: function(baseTypeId) {

      if(!baseTypeId) throw error.argRequired("baseTypeId");

      var Instance;
      switch(typeof baseTypeId) {
        case "string":
          return baseTypeId;

        case "function":
          Instance = this.context.__Instance;
          if(Instance && baseTypeId.prototype instanceof Instance) {
            return this.__validateTypeId(baseTypeId.type.id);
          }
          break;

        case "object":
          Instance = this.context.__Instance;
          if(Instance && baseTypeId instanceof Instance.Type) {
            return this.__validateTypeId(baseTypeId.id);
          }
          break;
      }

      throw error.argInvalidType(
        "baseTypeId",
        ["string", "Class<pentaho.type.Instance>", "pentaho.type.Type"],
        typeof baseTypeId);
    },

    __validateTypeId: function(baseTypeId) {
      if(!baseTypeId) throw error.argInvalid("baseTypeId", "Type is anonymous.");
      return baseTypeId;
    },

    // Holders are already sorted by ranking.
    // It is assumed that the resulting array cannot be modified/made public.
    __getHolders: function(baseTypeId) {

      var instsByType = this.__instancesByType;

      // Also automatically converts aliases to full type ids
      var typeIds = typeInfo.getSubtypesOf(baseTypeId, {includeSelf: true, includeDescendants: true}) || [baseTypeId];
      var hasCloned = false;

      return typeIds.reduce(function(holders, typeId) {
        var holdersOfType = O.getOwn(instsByType, typeId);
        if(holdersOfType) {
          if(holders) {
            // Don't modify a list stored in __instancesByType.
            if(!hasCloned) {
              hasCloned = true;
              var holdersClone = new SortedList({comparer: __holderComparer});
              holdersClone.addMany(holders);
              holders = holdersClone;
            }

            holders.addMany(holdersOfType);
          } else {
            // Use same instance if possible.
            holders = holdersOfType;
          }
        }

        return holders;
      }, null);
    },

    __createNoInstancesOfTypeError: function(baseTypeId) {
      return error.operInvalid("There is no defined matching instance of type '" + baseTypeId + "'.");
    },
    // endregion

    // region get, getAsync
    /**
     * Resolves an instance reference, asynchronously.
     *
     * This method can be used for:
     *
     * * creating a new instance - when given an [instance specification]{@link pentaho.type.spec.UInstance}
     * * resolving instances from the instances' container -
     *   when given a [resolve instance specification]{@link pentaho.type.spec.IInstanceResolve}.
     *
     * @param {pentaho.type.spec.UInstanceReference} [instRef] - An instance reference.
     *
     * @param {Object} [instKeyArgs] - The keyword arguments passed to the instance constructor, when one is created.
     * @param {pentaho.type.Type} [typeBase] - The base type of which returned instances must be an instance and,
     * also, the default type used when type information is not available in `instRef`.
     *
     * @return {!Promise.<pentaho.type.Instance>} A promise to an instance.
     *
     * @rejects {pentaho.lang.OperationInvalidError} When it is not possible to determine the type of instance to create
     * based on `instRef` and `baseType` is not specified.
     *
     * @rejects {pentaho.lang.OperationInvalidError} When an instance should be created but its determined type
     * is [abstract]{@link pentaho.type.Value.Type#isAbstract}.
     *
     * @rejects {pentaho.lang.OperationInvalidError} When the special "resolve instance by type" syntax is used
     * but it is not possible to determine the type to resolve against and `baseType` is not specified.
     *
     * @rejects {pentaho.lang.OperationInvalidError} When the special "resolve instance by type" syntax is used
     * but the corresponding "element type" is an anonymous type.
     *
     * @rejects {pentaho.lang.OperationInvalidError} When the type of the resolved value is not a subtype of `typeBase`.
     *
     * @rejects {Error} Other errors, as documented in:
     * [Context#get]{@link pentaho.type.Context#get},
     * [Context#getDependencyAsync]{@link pentaho.type.Context#getDependencyAsync},
     * [get]{@link pentaho.type.InstancesContainer#get},
     * [getByIdAsync]{@link pentaho.type.InstancesContainer#getByIdAsync} and
     * [getByTypeAsync]{@link pentaho.type.InstancesContainer#getByTypeAsync}.
     *
     * @see pentaho.type.InstancesContainer#get
     * @see pentaho.type.Type#createAsync
     */
    getAsync: function(instRef, instKeyArgs, typeBase) {

      if(instRef && typeof instRef === "object") {

        // 1. A special $instance form
        if(instRef.constructor === Object && instRef.$instance) {
          return this.__getSpecial(instRef.$instance, instKeyArgs, typeBase, /* sync: */ false);
        }

        // Follow the generic path of loading all found dependencies first and calling `get` later.

        var depRefs = this.__getDependencyRefs(instRef);
        if(depRefs.length) {
          // 2. Resolve dependencies first and only then use the synchronous get method.
          return this.context
              .getDependencyAsync(depRefs)
              .then(getSync.bind(this));
        }
      }

      // 3. No dependencies. Yet, behave asynchronously as requested.
      return promiseUtil.wrapCall(getSync, this);

      function getSync() {
        return this.get(instRef, instKeyArgs, typeBase);
      }
    },

    /**
     * Resolves an instance reference.
     *
     * This method can be used for:
     *
     * * creating a new instance - when given an [instance specification]{@link pentaho.type.spec.UInstance}
     * * resolving instances from the instances' container -
     *   when given a [resolve instance specification]{@link pentaho.type.spec.IInstanceResolve}.
     *
     * @param {pentaho.type.spec.UInstanceReference} [instRef] - An instance reference.
     *
     * @param {Object} [instKeyArgs] - The keyword arguments passed to the instance constructor, when one is created.
     * @param {pentaho.type.Type} [typeBase] - The base type of which returned instances must be an instance and,
     * also, the default type used when type information is not available in `instRef`.
     *
     * @return {pentaho.type.Instance} An instance, or `null`
     *
     * @throws {pentaho.lang.OperationInvalidError} When it is not possible to determine the type of instance to create
     * based on `instRef` and `baseType` is not specified.
     *
     * @throws {pentaho.lang.OperationInvalidError} When an instance should be created but its determined type
     * is [abstract]{@link pentaho.type.Value.Type#isAbstract}.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the special "resolve instance by type" syntax is used
     * but it is not possible to determine the type to resolve against and `baseType` is not specified.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the special "resolve instance by type" syntax is used
     * but the corresponding "element type" is an anonymous type.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the type of the resolved value is not a subtype of `typeBase`.
     *
     * @throws {Error} Other errors, as documented in:
     * [Context#get]{@link pentaho.type.Context#get},
     * [getById]{@link pentaho.type.InstancesContainer#getById} and
     * [getByType]{@link pentaho.type.InstancesContainer#getByType}.
     *
     * @see pentaho.type.InstancesContainer#getAsync
     * @see pentaho.type.Type#create
     */
    get: function(instRef, instKeyArgs, typeBase) {

      var InstCtor;
      var typeRef;

      // Find either a special $instance or a specific InstCtor or fail

      if(instRef && typeof instRef === "object" && instRef.constructor === Object) {

        // 1. A special instance
        if(instRef.$instance) {
          return this.__getSpecial(instRef.$instance, instKeyArgs, typeBase, /* sync: */ true);
        }

        // 2. Type in inline type property {_: "type"}
        if((typeRef = instRef._)) {
          InstCtor = this.__context.get(typeRef);

          var type = InstCtor.type;
          if(typeBase) typeBase.__assertSubtype(type);

          if(type.isAbstract) { type.__throwAbstractType(); }
        }
      }

      // 3. Default the type from one of String, Number, or Boolean,
      //    if one of these is the type of `instRef` and typeBase is respected.
      if(!InstCtor) {
        if(!typeBase || typeBase.isAbstract) {

          /* eslint default-case: 0 */
          switch(typeof instRef) {
            case "string": InstCtor = this.__String || (this.__String = this.__context.get("string")); break;
            case "number": InstCtor = this.__Number || (this.__Number = this.__context.get("number")); break;
            case "boolean": InstCtor = this.__Boolean || (this.__Boolean = this.__context.get("boolean")); break;
          }

          // Must still respect the base type.
          if(InstCtor && typeBase && !InstCtor.type.isSubtypeOf(typeBase)) { InstCtor = null; }

          if(!InstCtor) {
            if(typeBase) {
              typeBase.__throwAbstractType();
            } else {
              throw error.operInvalid("Cannot create instance of unspecified type.");
            }
          }

          // These types are never abstract
        } else {
          InstCtor = typeBase.instance.constructor;
        }
      }

      // assert InstCtor

      return new InstCtor(instRef, instKeyArgs);
    },

    __getSpecial: function(specialSpec, instKeyArgs, typeDefault, sync) {

      var value;

      if((value = specialSpec.id)) {
        // specialSpec: {id}

        // Always required.
        return sync
          ? this.getById(value)
          : this.getByIdAsync(value);
      }

      if((value = specialSpec.type || typeDefault)) {
        // specialSpec: {type, isRequired, filter}

        // (Async) Take care not to `context.get` a type given as a string (or an array-wrapped one)
        // as these may not be loaded. Always calling context.get does not do.
        // In the end, note that only identified element types are supported.

        var elemTypeId;
        var listType;
        var isList;

        // "elemTypeId"
        // ["elemTypeId"]
        // [elementTypeInstance]
        // elementTypeInstance
        // listTypeInstance
        if(typeof value === "string") {

          // TODO: FIXME: this is not necessarily true; it may be the id of a list type...

          isList = false;
          elemTypeId = value;
        } else if(Array.isArray(value)) {
          isList = true;
          value = value[0];
          if(typeof value === "string") {
            elemTypeId = value;
          } else {
            // better not be a list type...
            elemTypeId = this.__context.get(value).type.id;
          }
        } else {
          // Assume a typeRef of some kind
          var type = this.__context.get(value).type;
          if(type.isList) {
            isList = true;
            listType = type;
            elemTypeId = type.elementType.id;
          } else {
            isList = false;
            elemTypeId = type.id;
          }
        }

        if(!elemTypeId) {
          return promiseUtil.error(error.operInvalid("Cannot resolve instance for an anonymous type."), sync);
        }

        if(isList) {
          // Must load the list type, even if there are 0 results...

          var context = this.__context;

          var getListCtorSync = function() {
            return listType
              ? listType.instance.constructor
              : context.get([elemTypeId]);
          };

          var createList = function(ListCtor, results) {
            return new ListCtor(results, instKeyArgs);
          };

          if(sync) {
            return createList(getListCtorSync(), this.getAllByType(elemTypeId, specialSpec));
          }

          return Promise.all([this.context.getAsync(elemTypeId), this.getAllByTypeAsync(elemTypeId, specialSpec)])
              .then(function(values) {
                return createList(getListCtorSync(), values[1]);
              });
        }

        return sync
          ? this.getByType(elemTypeId, specialSpec)
          : this.getByTypeAsync(elemTypeId, specialSpec);
      }

      return promiseUtil.error(error.operInvalid("Cannot resolve instance for an unspecified type."), sync);
    },
    // endregion

    // region dependency references
    __getDependencyRefs: function(instRef) {
      var depIdsSet = {};
      var depRefs = [];
      __collectDependencyRefsRecursive.call(this, instRef, depIdsSet, depRefs);

      return depRefs;
    },

    __collectDependencyRefs: function(instRef, depIdsSet, depRefs) {
      __collectDependencyRefsRecursive.call(this, instRef, depIdsSet, depRefs);
    }
    // endregion
  });

  // By Descending ranking and then By Ascending definition index.
  function __holderComparer(holderA, holderB) {
    return F.compare(holderB.ranking, holderA.ranking) || F.compare(holderA.index, holderB.index);
  }

  function __collectDependencyRefsRecursive(instRef, depIdsSet, depRefs) {
    if(instRef && typeof instRef === "object") {
      __collectDependencyRefsObjectRecursive.call(this, instRef, depIdsSet, depRefs);
    }
  }

  function __collectDependencyRefsObjectRecursive(instRef, depIdsSet, depRefs) {
    if(Array.isArray(instRef)) {
      instRef.forEach(function(elemRef) {
        __collectDependencyRefsRecursive.call(this, elemRef, depIdsSet, depRefs);
      }, this);
    } else if(instRef.constructor === Object) {
      if(instRef.$instance) {
        depRefs.push(instRef);
      } else {
        Object.keys(instRef).forEach(function(name) {
          var elemRef = instRef[name];
          if(name === "_") {
            this.__context.__collectDependencyRefs(elemRef, depIdsSet, depRefs);
          } else {
            __collectDependencyRefsRecursive.call(this, elemRef, depIdsSet, depRefs);
          }
        }, this);
      }
    }
  }
});
