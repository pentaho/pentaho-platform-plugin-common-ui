/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "./SpecificationContext",
  "./SpecificationScope",
  "./InstancesContainer",
  "../environment",
  "../service!pentaho.config.IService?single",
  "./changes/Transaction",
  "./changes/TransactionScope",
  "./changes/CommittedScope",
  "../lang/Base",
  "./util",
  "../util/promise",
  "../util/arg",
  "../util/error",
  "../util/object",
  "../util/fun",
  "../util/module",
  "../debug",
  "../debug/Levels",
  "../util/logger",
  "./standard" // so that r.js sees otherwise invisible dependencies.
], function(localRequire, module, typeInfo, bundle,
    SpecificationContext, SpecificationScope,
    InstancesContainer, mainPlatformEnv, configurationService,
    Transaction, TransactionScope, CommittedScope,
    Base, typeUtil, promiseUtil, arg, error, O, F, moduleUtil, debugMgr, DebugLevels, logger) {

  "use strict";

  /* globals Promise */

  /* eslint dot-notation: 0, no-unexpected-multiline: 0 */

  // Default `base` type in a type specification.
  var __defaultBaseTypeMid = "complex";

  var __instanceTypeId = "pentaho/type/instance";

  var O_hasOwn = Object.prototype.hasOwnProperty;

  var __standardIds = Object.freeze([
    // types
    "instance",
    "value",
    "element",
    "list",
    "simple",
    "string",
    "number",
    "boolean",
    "date",
    "complex",
    "object",
    "function",
    "typeDescriptor",
    "property",
    "model",
    "application",
    "mixins/enum"
  ].map(function(id) { return "pentaho/type/" + id; }));

  /**
   * @name pentaho.type.ITypeHolder
   * @interface
   * @private
   *
   * @property {string} id - The type's identifier. Always set.
   * @property {?function} factory - The type's factory function. Set when the AMD module is loaded.
   * @property {!Array.<string>} deps - The type's dependencies. Set when the AMD module is loaded.
   *
   * @property {Class.<pentaho.type.Instance>} Ctor - The type's constructor.
   * Only not `null` when the type has already been created.
   *
   * @property {Promise.<Class.<pentaho.type.Instance>>} promise - A promise for the type's constructor.
   * Only not `null` since the type has begun loading.
   */

  var TypeHolder = Base.extend({

    constructor: function(id, context) {

      // assert !id || !temporary(id)

      // Set on construction.
      this.context = context;
      this.id = id || null; // anonymous type

      // Set when loading/creating.
      this.promise = null;

      // Set when Created.
      this.Ctor = null;
      this.error = null; // Set when resolved and error'ed.

      // Register
      if(id) {
        context.__byTypeId[id] = this;
      }
    },

    get isFinished() {
      return !!(this.Ctor || this.error);
    },

    // region load from module
    loadModuleAsync: function() {

      // assert this.id

      return this.promise || this.__finalizeCtorAsync(this.__loadModuleAsyncCore());
    },

    __loadModuleAsyncCore: function() {
      return promiseUtil.require(this.id, localRequire)
          .then(this.__onModuleLoaded.bind(this));
    },

    __onModuleLoaded: function(typeModule) {

      if(typeModule) {

        var factory;
        var deps;

        if(Array.isArray(typeModule)) {
          var L = typeModule.length;
          if(L > 0) {
            factory = typeModule[L - 1];
            deps = typeModule.slice(0, L - 1);
          }
        }

        if(factory) {
          if(!F.is(factory)) {
            return Promise.reject(error.argInvalid("typeModule", "Not an array whose last position is a function."));
          }

          return this.__loadFactoryAsync(factory, deps);
        }
      }

      return Promise.reject(error.argInvalidType("typeModule", "Array", typeof typeModule));
    },

    __loadFactoryAsync: function(factory, depRefs) {

      if(depRefs.length) {

        return this.context.getDependencyAsync(depRefs, {dependentId: this.id})
            .then(this.__createFromFactoryAsync.bind(this, factory));
      }

      return this.__createFromFactoryAsync(factory, depRefs);
    },

    __createFromFactoryAsync: function(factory, deps) {
      var InstCtor;
      try {
        InstCtor = this.context.__creatingType(this.id, function() {
          return factory.apply(this, deps);
        });
      } catch(ex) {
        // TODO: contextual error message.
        return Promise.reject(ex);
      }

      return this.__setCtorAsync(InstCtor);
    },
    // endregion

    // region load from factory
    loadFactoryAsync: function(factory, depRefs) {
      return this.__finalizeCtorAsync(this.__loadFactoryAsync(factory, depRefs));
    },
    // endregion

    // region load from constructor
    loadCtorAsync: function(InstCtor) {
      return this.__finalizeCtorAsync(this.__setCtorAsync(InstCtor));
    },
    // endregion

    loadCtorFinished: function(InstCtor) {
      this.Ctor = InstCtor;
      this.promise = Promise.resolve(InstCtor);
    },

    // region set constructor
    __finalizeCtorAsync: function(p) {
      var me = this;

      return this.promise = p.then(function(InstCtor) {
        me.Ctor = InstCtor;
        me.error = null;

        if(me.id === __instanceTypeId) {
          me.context.__Instance = InstCtor;
        }

        if(me.id && debugMgr.testLevel(DebugLevels.debug, module)) {
          logger.debug("Loaded named type '" + me.id + "'.");
        }

        return InstCtor;
      })["catch"](function(ex) {
        me.Ctor = null;
        me.error = ex;

        if(me.id && debugMgr.testLevel(DebugLevels.error, module)) {
          logger.error("Error loading named type '" + me.id + "': " + ex);
        }

        return Promise.reject(ex);
      });
    },

    __setCtorAsync: function(InstCtor) {

      var ctx = this.context;

      // Validate
      if(!F.is(InstCtor) || (ctx.__Instance && !(InstCtor.prototype instanceof ctx.__Instance))) {
        return Promise.reject(error.operInvalid("Type factory must return a subtype of 'pentaho.type.Instance'."));
      }

      // Holder Registration
      var type = InstCtor.type;
      ctx.__byTypeUid[type.uid] = this;

      if(!this.id) {
        return Promise.resolve(InstCtor);
      }

      // TODO: should alias be registered based on typeInfo alone?
      var alias = type.alias;
      if(alias) {
        if(O_hasOwn.call(ctx.__byTypeId, alias)) {
          return promiseUtil.error(error.argInvalid("typeRef", "Duplicate type class alias."), sync);
        }
        ctx.__byTypeId[alias] = this;
      }

      // Configuration
      return this.__loadConfigAsync()
          .then(function(typeConfig) {
            if(typeConfig) {
              // May throw.
              ctx.__applyConfig(InstCtor, typeConfig);
            }

            return InstCtor;
          });
    },

    __loadConfigAsync: function() {

      var ctx = this.context;

      var typeConfig = ctx.__getTypeConfig(this.id);
      if(typeConfig) {
        // Load typeConfig dependencies and only then...

        // Collect the refs of all dependencies used within typeSpec.
        var depRefs = ctx.__getDependencyRefs(typeConfig);
        if(depRefs.length) {
          return ctx.getDependencyAsync(depRefs).then(function() { return typeConfig; });
        }
      }

      return Promise.resolve(typeConfig);
    }
    // endregion
  });

  var Context = Base.extend(module.id, /** @lends pentaho.type.Context# */{

    /**
     * @alias Context
     * @memberOf pentaho.type
     * @class
     * @amd pentaho/type/Context
     *
     * @classDesc A class that holds **configured** types.
     *
     * When a component, like a visualization, is being assembled,
     * it should not necessarily be unaware of the environment where it is going to be used.
     * A context object gathers information that has a global scope,
     * such as the current locale or the current theme,
     * which is likely to have an impact on how a visualization is presented to the user.
     * For instance, the color palette used in a categorical bar chart might be related to the current theme.
     * As such, besides holding contextual, environmental information,
     * a context object should contain the necessary logic to
     * facilitate the configuration of component types using that information.
     * The Pentaho Type API embraces this concept by defining types as
     * _type factories_ that take a context object as their argument.
     *
     * The instance constructors of types
     * **must** be obtained from a context object,
     * using one of the provided methods:
     * [get]{@link pentaho.type.Context#get},
     * [getAsync]{@link pentaho.type.Context#getAsync},
     * [getAll]{@link pentaho.type.Context#getAll}, or
     * [getAllAsync]{@link pentaho.type.Context#getAllAsync}
     * so that these are configured before being used.
     * This applies whether an instance constructor is used for creating an instance or to derive a subtype.
     *
     * A type context holds environmental information in the form of an environment of the
     * [JavaScript Pentaho Platform]{@link pentaho.environment.IEnvironment},
     * which contains relevant information such as:
     * [application]{@link pentaho.environment.IEnvironment#application},
     * [user]{@link pentaho.environment.IEnvironment#user},
     * [theme]{@link pentaho.environment.IEnvironment#theme} and
     * [locale]{@link pentaho.environment.IEnvironment#locale}.
     * Their values determine (or "select") the _type configuration rules_ that
     * apply and are used to configure the constructors provided by the context.
     *
     * Note that anonymous types cannot be _directly_ configured,
     * as _type configuration rules_ are targeted at specific, identified types.
     *
     * For information on how to configure the `Context` class,
     * see {@link pentaho.type.spec.IContext}.
     *
     * @constructor
     * @description Creates a `Context` with given variables.
     * @param {!pentaho.environment.IEnvironment} env - A platform environment.
     * When unspecified, it defaults to {@link pentaho.environment.main}.
     * @param {!pentaho.config.IConfiguration} config - The configuration for the given environment.
     *
     * @see pentaho.type.spec.IContext
     */
    constructor: function(env, config) {
      /**
       * The associated platform environment.
       *
       * @type {!pentaho.environment.IEnvironment}
       * @readOnly
       * @private
       */
      this.__env = env;

      /**
       * The types and instances configuration.
       *
       * @type {!pentaho.config.IConfiguration}
       * @readOnly
       * @private
       */
      this.__config = config;

      /**
       * The configuration depth is incremented each time the context
       * starts configuring a type, and decremented when it finishes.
       *
       * When the configuration depth is greater than 0,
       * certain Type changes, like property value type subtyping,
       * are not allowed.
       *
       * @type {number}
       * @private
       * @see pentaho.type.Context#__getByInstCtor
       * @see pentaho.type.Context#__getByObjectSpec
       */
      this.__configDepth = 0;

      /**
       * The identifier of the type being created by a factory function.
       * @type {string}
       * @private
       * @see pentaho.type.Context#__creatingType
       */
      this.__creatingTypeId = null;

      /**
       * The ambient/current transaction, if any, or `null`.
       *
       * @type {pentaho.type.changes.Transaction}
       * @private
       */
      this.__txnCurrent = null;

      /**
       * The stack of transaction scopes.
       *
       * @type {Array.<pentaho.type.changes.AbstractTransactionScope>}
       * @readOnly
       * @private
       */
      this.__txnScopes = [];

      /**
       * The version of the next committed/fulfilled transaction.
       *
       * @type {number}
       * @private
       * @default 1
       */
      this.__nextVersion = 1;

      /**
       * Map of instance constructors by [type uid]{@link pentaho.type.Type#uid}.
       *
       * @type {!Object.<string, !pentaho.type.ITypeHolder>}
       * @readOnly
       * @private
       */
      this.__byTypeUid = {};

      // non-anonymous types
      /**
       * Map of instance constructors by [type id]{@link pentaho.type.Type#id}
       * and by [type alias]{@link pentaho.type.Type#alias}
       * for non-anonymous types.
       *
       * @type {!Object.<string, !pentaho.type.ITypeHolder>}
       * @readOnly
       * @private
       */
      this.__byTypeId = {};

      var configSpec = config.selectType(module.id);

      /**
       * @type {!pentaho.type.InstancesContainer}
       * @readOnly
       * @private
       */
      this.__instances = new InstancesContainer(this, configSpec && configSpec.instances);

      /**
       * The root [Instance]{@link pentaho.type.Instance} constructor.
       *
       * @type {Class.<pentaho.type.Instance>}
       * @private
       */
      this.__Instance = null;
    },

    /**
     * Gets the associated platform environment.
     *
     * @type {!pentaho.environment.IEnvironment}
     * @readOnly
     */
    get environment() {
      return this.__env;
    },

    /**
     * Gets the associated instances' container.
     *
     * @type {!pentaho.type.InstancesContainer}
     * @readOnly
     */
    get instances() {
      return this.__instances;
    },

    /**
     * Gets a value that indicates that the context is currently loading and, in particular, configuring a type.
     *
     * Certain changes to types are not safe when performed from configurations.
     * This property allows blocking these changes.
     *
     * @type {boolean}
     * @readonly
     */
    get isConfiguring() {
      return this.__configDepth > 0;
    },

    // region Type Registry

    /**
     * Gets the **configured instance constructor** of a type.
     *
     * For more information on the `typeRef` argument,
     * see [UTypeReference]{@link pentaho.type.spec.UTypeReference}.
     *
     * The modules of standard types and mixins are preloaded and
     * can be requested _synchronously_. These are:
     *
     * * [pentaho/type/instance]{@link pentaho.type.Instance}
     *   * [pentaho/type/value]{@link pentaho.type.Value}
     *     * [pentaho/type/list]{@link pentaho.type.List}
     *     * [pentaho/type/element]{@link pentaho.type.Element}
     *       * [pentaho/type/complex]{@link pentaho.type.Complex}
     *         * [pentaho/type/application]{@link pentaho.type.Application}
     *         * [pentaho/type/model]{@link pentaho.type.Model}
     *       * [pentaho/type/simple]{@link pentaho.type.Simple}
     *         * [pentaho/type/string]{@link pentaho.type.String}
     *         * [pentaho/type/number]{@link pentaho.type.Number}
     *         * [pentaho/type/date]{@link pentaho.type.Date}
     *         * [pentaho/type/boolean]{@link pentaho.type.Boolean}
     *         * [pentaho/type/function]{@link pentaho.type.Function}
     *         * [pentaho/type/object]{@link pentaho.type.Object}
     *         * [pentaho/type/mixins/enum]{@link pentaho.type.mixins.Enum}
     *   * [pentaho/type/property]{@link pentaho.type.Property}
     *     * [pentaho/type/mixins/discreteDomain]{@link pentaho.type.mixins.DiscreteDomain}
     *     * [pentaho/type/mixins/ordinalDomain]{@link pentaho.type.mixins.OrdinalDomain}
     *
     * For all of these, the `pentaho/type/` or `pentaho/type/mixins/` prefix is optional
     * (when requested to a _context_; the AMD module system requires the full module identifiers to be specified).
     *
     * If it is not known whether all non-standard types that are referenced by identifier have already been loaded,
     * the asynchronous method version, [getAsync]{@link pentaho.type.Context#getAsync},
     * should be used instead.
     *
     * @see pentaho.type.Context#getAsync
     *
     * @param {!pentaho.type.spec.UTypeReference} typeRef - A type reference.
     * @param {Object} [keyArgs] The keyword arguments.
     * @param {pentaho.type.spec.UTypeReference} [keyArgs.defaultBase] The default base type
     * of `typeRef` when it is an immediate generic object specification.
     *
     * @return {!Class.<pentaho.type.Instance>} The instance constructor.
     *
     * @throws {pentaho.lang.ArgumentRequiredError} When `typeRef` is an empty string or {@link Nully}.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is of an unsupported JavaScript type:
     * not a string, function, array or object.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is a type constructor
     * (e.g. [Type]{@link pentaho.type.Type})
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is an instance.
     *
     * @throws {Error} When the identifier of a type is not defined as a module in the AMD module system
     * (specified directly in `typeRef`, or present in an generic type specification).
     *
     * @throws {Error} When the identifier of a **non-standard type** is from a module that the AMD module system
     * has not loaded yet (specified directly in `typeRef`, or present in an generic type specification).
     *
     * @throws {pentaho.lang.OperationInvalidError} When the value returned by a factory function is not
     * an instance constructor of a subtype of `Instance`
     * (specified directly in `typeRef`, or obtained indirectly by loading a type's module given its identiifer).
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is, or contains, an array-shorthand,
     * list type specification that has more than one child element type specification.
     */
    get: function(typeRef, keyArgs) {
      return this.__get(typeRef, O.getOwn(keyArgs, "defaultBase"), true);
    },

    /**
     * Gets, asynchronously, the **configured instance constructor** of a type.
     *
     * For more information on the `typeRef` argument,
     * see [UTypeReference]{@link pentaho.type.spec.UTypeReference}.
     *
     * This method can be used even if a generic type specification references non-standard types
     * whose modules have not yet been loaded by the AMD module system.
     *
     * @see pentaho.type.Context#get
     *
     * @example
     * <caption>
     *   Getting a <b>configured</b> type instance constructor, <b>asynchronously</b>, for a specific application.
     * </caption>
     *
     * require(["pentaho/type/Context"], function(Context) {
     *
     *   Context
     *     .createAsync({application: "data-explorer-101"})
     *     .then(function(context) {
     *
     *       context.getAsync("my/viz/chord").then(function(VizChordModel) {
     *
     *         var model = new VizChordModel({outerRadius: 200});
     *
     *         // ...
     *       });
     *
     *     });
     * });
     *
     * @param {!pentaho.type.spec.UTypeReference} typeRef - A type reference.
     * @param {Object} [keyArgs] The keyword arguments.
     * @param {pentaho.type.spec.UTypeReference} [keyArgs.defaultBase] The default base type
     * of `typeRef` when it is an immediate generic object specification.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>} A promise for the instance constructor.
     *
     * @rejects {pentaho.lang.ArgumentRequiredError} When `typeRef` is an empty string or {@link Nully}.
     *
     * @rejects {pentaho.lang.ArgumentInvalidError} When `typeRef` is of an unsupported JavaScript type:
     * not a string, function, array or object.
     *
     * @rejects {pentaho.lang.ArgumentInvalidError} When `typeRef` is a type constructor
     * (e.g. [Type]{@link pentaho.type.Type})
     *
     * @rejects {pentaho.lang.ArgumentInvalidError} When `typeRef` is an instance.
     *
     * @rejects {Error} When the identifier of a type is not defined as a module in the AMD module system
     * (specified directly in `typeRef`, or present in an generic type specification).
     *
     * @rejects {pentaho.lang.OperationInvalidError} When the value returned by a factory function is not
     * an instance constructor of a subtype of `Instance`
     * (specified directly in `typeRef`, or obtained indirectly by loading a type's module given its identifier).
     *
     * @rejects {pentaho.lang.ArgumentInvalidError} When `typeRef` is, or contains, a list type specification
     * with an invalid structure.
     *
     * @rejects {Error} When any other unexpected error occurs.
     */
    getAsync: function(typeRef, keyArgs) {
      try {
        return this.__get(typeRef, O.getOwn(keyArgs, "defaultBase"), false);
      } catch(ex) {
        /* istanbul ignore next : really hard to test safeguard */
        return Promise.reject(ex);
      }
    },

    /**
     * Gets the **configured instance constructors** of
     * all of the loaded types that are subtypes of a given base type.
     *
     * This method is a synchronous version of {@link pentaho.type.Context#getAllAsync}
     *
     * If it is not known whether all known subtypes of `baseTypeId` have already been loaded
     * (for example, by a previous call to [getAllAsync]{@link pentaho.type.Context#getAllAsync}),
     * the asynchronous method version, [getAllAsync]{@link pentaho.type.Context#getAllAsync},
     * should be used instead.
     *
     * @example
     * <caption>
     *   Getting all <code>"my/component"</code> sub-types browsable
     *   in the application <code>"data-explorer-101"</code>.
     * </caption>
     *
     * require(["pentaho/type/Context"], function(Context) {
     *
     *   Context.createAsync({application: "data-explorer-101"})
     *       .then(function(context) {
     *         var ComponentModels = context.getAll("my/component", {isBrowsable: true});
     *
     *         ComponentModels.forEach(function(ComponentModel) {
     *           console.log("will display menu entry for: " + ComponentModel.type.label);
     *         });
     *       });
     * });
     *
     * @param {string} baseTypeId - The identifier of the base type.
     * @param {object} [keyArgs] Keyword arguments.
     * @param {?boolean} [keyArgs.isBrowsable=null] - Indicates that only types with the specified
     *   [isBrowsable]{@link pentaho.type.Value.Type#isBrowsable} value are returned.
     * @param {?boolean} [keyArgs.isAbstract=null] - Indicates that only types with the specified
     *   [isAbstract]{@link pentaho.type.Value.Type#isAbstract} value are returned.
     *
     * @return {!Array.<Class.<pentaho.type.Value>>} An array of instance contructors.
     *
     * @throws {Error} When the identifier of a type is not defined as a module in the AMD module system.
     * @throws {Error} When the identifier of a **non-standard type** is from a module that the AMD module system
     * has not loaded yet.
     *
     * @see pentaho.type.Context#getAllAsync
     * @see pentaho.type.Context#get
     * @see pentaho.type.Context#getAsync
     */
    getAll: function(baseTypeId, keyArgs) {
      if(!baseTypeId) throw error.argRequired("baseTypeId");

      var predicate = this.__buildGetPredicate(keyArgs);

      var baseType = this.get(baseTypeId).type;

      // Ensure that all registered types are loaded.
      // Throws if one isn't yet.
      var depRefs = typeInfo.getSubtypesOf(baseTypeId, {includeDescendants: true});
      if(depRefs) {
        this.getDependency(depRefs);
      }

      return this.__getAllLoadedSubtypesOf(baseType, predicate);
    },

    /**
     * Gets a promise for the **configured instance constructors** of
     * all of the types that are subtypes of a given base type.
     *
     * Any errors that may occur will result in a rejected promise.
     *
     * @example
     * <caption>
     *   Getting all <code>"my/component"</code> sub-types browsable
     *   in the application <code>"data-explorer-101"</code>.
     * </caption>
     *
     * require(["pentaho/type/Context"], function(Context) {
     *
     *   Context.createAsync({application: "data-explorer-101"})
     *       .then(function(context) {
     *         return context.getAllAsync("my/component", {isBrowsable: true})
     *       })
     *       .then(function(ComponentModels) {
     *         ComponentModels.forEach(function(ComponentModel) {
     *           console.log("will display menu entry for: " + ComponentModel.type.label);
     *         });
     *       });
     * });
     *
     * @param {string} baseTypeId - The identifier of the base type.
     * @param {object} [keyArgs] Keyword arguments.
     * @param {?boolean} [keyArgs.isBrowsable=null] - Indicates that only types with the specified
     *   [isBrowsable]{@link pentaho.type.Value.Type#isBrowsable} value are returned.
     * @param {?boolean} [keyArgs.isAbstract=null] - Indicates that only types with the specified
     *   [isAbstract]{@link pentaho.type.Value.Type#isAbstract} value are returned.
     *
     * @return {Promise.<Array.<Class.<pentaho.type.Instance>>>} A promise for an array of instance classes.
     *
     * @see pentaho.type.Context#get
     * @see pentaho.type.Context#getAsync
     */
    getAllAsync: function(baseTypeId, keyArgs) {
      try {
        if(!baseTypeId) return Promise.resolve(error.argRequired("baseTypeId"));

        var predicate = this.__buildGetPredicate(keyArgs);

        var me = this;

        var depRef =
            typeInfo.getSubtypesOf(baseTypeId, {includeSelf: true, includeDescendants: true}) || [baseTypeId];

        return this.getDependencyAsync(depRef)
            .then(function(InstCtors) {

              var baseType = InstCtors[0].type;

              return me.__getAllLoadedSubtypesOf(baseType, predicate);
            });

      } catch(ex) {
        return Promise.reject(ex);
      }
    },

    __buildGetPredicate: function(keyArgs) {
      var filterSpec = null;
      if(keyArgs) {
        filterSpec = {};
        if(keyArgs.isBrowsable != null) { filterSpec.isBrowsable = keyArgs.isBrowsable; }
        if(keyArgs.isAbstract != null) { filterSpec.isAbstract = keyArgs.isAbstract; }
      }

      return F.predicate(filterSpec);
    },

    /**
     * Recursively collects the module ids of custom types used within a type specification.
     *
     * @param {pentaho.type.spec.ITypeProto} typeSpec - A type specification.
     * @param {!Object.<string, string>} [depIdsSet] - An object where to detect if a type id is already
     * present in `depRefs`.
     * @param {!Array.<string|Object>} [depRefs] - An array of dependency references.
     * @private
     * @internal
     * @friend pentaho.type.Type#createAsync
     */
    __collectDependencyRefs: function(typeSpec, depIdsSet, depRefs) {
      __collectDependencyRefsRecursive.call(this, typeSpec, depIdsSet, depRefs);
    },

    __getDependencyRefs: function(typeSpec) {
      var depRefs = [];
      var depIdsSet = {};
      this.__collectDependencyRefs(typeSpec, depIdsSet, depRefs);

      return depRefs;
    },
    // endregion

    // region getDependency, getDependencyAsync, getDependencyApply, getDependencyApplyAsync
    /**
     * Resolves a [module dependency reference]{@link pentaho.type.spec.UModuleDependencyReference}.
     *
     * @param {!pentaho.type.spec.UModuleDependencyReference} depRef - A module dependency reference.
     * @param {object} [keyArgs] Keyword arguments.
     * @param {string} [keyArgs.dependentId] - The identifier of the dependent type,
     * for resolving relative identifiers.
     *
     * @return {Object|Array|pentaho.type.Instance|pentaho.type.Type} A module dependency.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `depRef` is not a valid module dependency reference.
     *
     * @throws {Error} Other errors, as documented in:
     * [get]{@link pentaho.type.Context#get},
     * [getAll]{@link pentaho.type.Context#getAll} and
     * [InstancesContainer#get]{@link pentaho.type.InstancesContainer#get}.
     */
    getDependency: function(depRef, keyArgs) {

      if(!depRef) throw error.argRequired("depRef");

      return this.__getDependencyRecursive(depRef, /* sync: */ true, keyArgs);
    },

    /**
     * Resolves a [module dependency reference]{@link pentaho.type.spec.UModuleDependencyReference}, asynchronously.
     *
     * @param {!pentaho.type.spec.UModuleDependencyReference} depRef - A module dependency reference.
     * @param {object} [keyArgs] Keyword arguments.
     * @param {string} [keyArgs.dependentId] - The identifier of the dependent type,
     * for resolving relative identifiers.
     *
     * @return {Promise.<Object|Array|pentaho.type.Instance|pentaho.type.Type>} A promise for a module dependency.
     *
     * @rejects {pentaho.lang.ArgumentInvalidError} When `depRef` is not a valid module dependency reference.
     *
     * @rejects {Error} Other errors, as documented in:
     * [getAsync]{@link pentaho.type.Context#get},
     * [getAllAsync]{@link pentaho.type.Context#getAllAsync} and
     * [InstancesContainer#getAsync]{@link pentaho.type.InstancesContainer#getAsync}.
     */
    getDependencyAsync: function(depRef, keyArgs) {

      if(!depRef) return Promise.reject(error.argRequired("depRef"));

      return this.__getDependencyRecursive(depRef, /* sync: */ false, keyArgs);
    },

    __getDependencyRecursive: function(depRef, sync, keyArgs) {

      switch(typeof depRef) {
        case "string":
          depRef = moduleUtil.absolutizeIdRelativeToSibling(depRef, O.getOwn(keyArgs, "dependentId"));

          return sync ? this.get(depRef) : this.getAsync(depRef);

        case "object":
          var results;

          if(Array.isArray(depRef)) {

            results = depRef.map(function(oneDepRef) {
              return this.__getDependencyRecursive(oneDepRef, sync, keyArgs);
            }, this);

            return sync ? results : Promise.all(results);
          }

          if(depRef.constructor === Object) {
            return this.__getDependencyObjectRecursive(depRef, sync, keyArgs);
          }
          break;
      }

      return promiseUtil.error(error.argInvalid("depRef", "Invalid module dependency reference."), sync);
    },

    __getDependencyObjectRecursive: function(depRef, sync, keyArgs) {

      // Special syntax ?
      var specialSpec;

      if((specialSpec = depRef.$instance)) {
        // TODO: dependentId for id and type

        // specialSpec: {id, isRequired} | {type, isRequired, filter}
        // instKeyArgs is used only when creating a list of results
        return this.__instances.__getSpecial(specialSpec, /* instKeyArgs: */ null, /* typeDefault */null, sync);
      }

      if((specialSpec = depRef.$types)) {
        // TODO: dependentId for base

        // specialSpec: {base}
        return sync
            ? this.getAll(specialSpec.base)
            : this.getAllAsync(specialSpec.base);
      }

      // Just a shell object.
      var map = {};

      var results;
      if(!sync) { results = []; }

      O.eachOwn(depRef, function(oneDepRef, key) {
        var result = this.__getDependencyRecursive(oneDepRef, sync, keyArgs);
        if(sync) {
          map[key] = result;
        } else {
          result = result.then(function(value) { map[key] = value; });
          results.push(result);
        }
      }, this);

      return sync ? map : Promise.all(results).then(function() { return map; });
    },

    /**
     * Resolves a module dependency reference and applies a given function to the array results.
     *
     * This method calls [getDependency]{@link pentaho.type.Context#getDependency}
     * and then applies the given function to the resolved dependencies.
     * Any module dependency reference which evaluates to an array can be specified.
     *
     * @param {!pentaho.type.spec.UModuleDependencyReference} depRef - A module dependency reference.
     * @param {function} fun - The function to apply the results on.
     * @param {Object} [ctx] - The object on which to call `fun`.
     *
     * @return {any} The result of calling the given function.
     *
     * @see pentaho.type.Context#getDependency
     * @see pentaho.type.Context#getDependencyApplyAsync
     */
    getDependencyApply: function(depRef, fun, ctx) {

      var deps = this.getDependency(depRef);

      return fun.apply(ctx, deps);
    },

    /**
     * Resolves a module dependency reference, asynchronously,
     * and applies a given function to the array results.
     *
     * This method calls [getDependencyAsync]{@link pentaho.type.Context#getDependencyAsync}
     * and then applies the given function to the resolved dependencies.
     * Any module dependency reference which evaluates to an array can be specified.
     *
     * @param {!pentaho.type.spec.UModuleDependencyReference} depRef - A module dependency reference.
     * @param {function} fun - The function to apply the results on.
     * @param {Object} [ctx] - The object on which to call `fun`.
     *
     * @return {Promise} A promise for the result of calling the given function.
     *
     * @see pentaho.type.Context#getDependencyAsync
     * @see pentaho.type.Context#getDependencyApply
     */
    getDependencyApplyAsync: function(depRef, fun, ctx) {

      return this.getDependencyAsync(depRef).then(function(deps) {
        return fun.apply(ctx, deps);
      });
    },
    // endregion

    // region Changes and Transactions
    /**
     * Gets the ambient transaction, if any, or `null`.
     *
     * @type {pentaho.type.changes.Transaction}
     * @readOnly
     */
    get transaction() {
      return this.__txnCurrent;
    },

    /**
     * Enters a scope of change.
     *
     * To mark the changes in the scope as error,
     * call its [reject]{@link pentaho.type.changes.TransactionScope#reject} method.
     *
     * To end the scope of change successfully,
     * dispose the returned transaction scope,
     * by calling its [dispose]{@link pentaho.type.changes.TransactionScope#scope} method.
     *
     * If the scope initiated a transaction,
     * then that transaction is committed.
     * Otherwise,
     * if an ambient transaction already existed when the change scope was created,
     * that transaction is left uncommitted.
     *
     * To end the scope with an error,
     * call its [reject]{@link pentaho.type.changes.TransactionScope#reject} method.
     *
     * @return {!pentaho.type.changes.TransactionScope} The new transaction scope.
     */
    enterChange: function() {
      var txn = this.__txnCurrent || new Transaction(this);
      return txn.enter();
    },

    /**
     * Enters a read-committed scope.
     *
     * Within this scope there is no current transaction and
     * reading the properties of instances obtains their committed values.
     *
     * @return {!pentaho.type.changes.CommittedScope} The read-committed scope.
     */
    enterCommitted: function() {
      return new CommittedScope(this);
    },

    get __txnScopeCurrent() {
      var scopes = this.__txnScopes;
      return scopes.length ? scopes[scopes.length - 1] : null;
    },

    /**
     * Called by a scope to make it become the new ambient scope.
     *
     * @param {!pentaho.type.changes.AbstractTransactionScope} scopeEnter - The new ambient scope.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.changes.AbstractTransactionScope
     */
    __scopeEnter: function(scopeEnter) {

      this.__txnScopes.push(scopeEnter);

      this.__setTransaction(scopeEnter.transaction);
    },

    /**
     * Called by a scope to stop being the current scope.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.changes.AbstractTransactionScope#exit
     */
    __scopeExit: function() {
      this.__txnScopes.pop();
      var scopeResume = this.__txnScopeCurrent;

      this.__setTransaction(scopeResume && scopeResume.transaction);
    },

    /**
     * Sets the new ambient transaction.
     *
     * @param {pentaho.type.changes.Transaction} txnNew - The new ambient transaction.
     *
     * @private
     */
    __setTransaction: function(txnNew) {
      var txnExit = this.__txnCurrent;
      if(txnExit !== txnNew) {
        if(txnExit) txnExit.__exitingAmbient();
        this.__txnCurrent = txnNew;
        if(txnNew) txnNew.__enteringAmbient();
      }
    },

    // @internal
    __transactionExit: function() {
      // Local-exit all scopes of the exiting transaction.
      // Null scopes or scopes of other txns remain non-exited.
      var txnCurrent = this.__txnCurrent;
      this.__txnCurrent = null;

      // Initial scope must be a transaction scope.
      var scopes = this.__txnScopes;
      var i = scopes.length;
      while(i--) {
        var scope = scopes[i];
        if(scope.transaction === txnCurrent) {
          scopes.pop();
          scope.__exitLocal();
          if(scope.isRoot)
            break;
        }
      }
    },

    /**
     * Increments and returns the next version number for use in the
     * [commit]{@link pentaho.type.changes.Transaction#__applyChanges} of a transaction.
     *
     * @return {number} The next version number.
     * @private
     * @internal
     */
    __takeNextVersion: function() {
      return ++this.__nextVersion;
    },
    // endregion

    // region get* support
    __getAllLoadedSubtypesOf: function(baseType, predicate) {

      var byTypeUid = this.__byTypeUid;

      var result = [];

      Object.keys(byTypeUid).forEach(function(typeUid) {
        var InstCtor = byTypeUid[typeUid].Ctor; // may be null (loading or failed)
        if(InstCtor) { // created successfully
          var type = InstCtor.type;
          if(type.isSubtypeOf(baseType) && (!predicate || predicate(type))) {
            result.push(InstCtor);
          }
        }
      });

      return result;
    },

    /**
     * Gets the instance constructor of a type.
     *
     * Internal get method shared by `get` and `getAsync`.
     * Uses `sync` argument to distinguish between the two modes.
     *
     * Main dispatcher according to the type and class of `typeRef`:
     * string, function or array or object.
     *
     * @param {pentaho.type.spec.UTypeReference} typeRef - A type reference.
     * @param {pentaho.type.spec.UTypeReference} defaultBase - A reference to the default base type.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor; while, when async, returns a promise for it.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is of an unsupported JavaScript type:
     * not a string, function, array or object.
     *
     * @private
     */
    __get: function(typeRef, defaultBase, sync) {
      if(typeRef == null || typeRef === "")
        return promiseUtil.error(error.argRequired("typeRef"), sync);

      /* eslint default-case: 0 */
      switch(typeof typeRef) {
        case "string": return this.__getById(typeRef, sync);
        case "function": return this.__getByFun(typeRef, sync);
        case "object": return Array.isArray(typeRef)
            ? this.__getByListSpec(typeRef, sync)
            : this.__getByObjectSpec(typeRef, defaultBase, sync);
      }

      return promiseUtil.error(error.argInvalid("typeRef"), sync);
    },

    __processId: function(id) {
      if(id) {
        if(!SpecificationContext.isIdTemporary(id)) {
          var id2 = typeInfo.getIdOf(id);
          if(id2) {
            id = id2;
          }
        }
      }
      return id;
    },

    __getByIdSettled: function(id, sync, canDefineSpecId) {

      // assert id

      // Deserializing?

      // Is it a temporary id?
      if(SpecificationContext.isIdTemporary(id)) {
        var specContext = SpecificationContext.current;
        if(!specContext) {
          if(canDefineSpecId) {
            return null;
          }

          return promiseUtil.error(
              error.argInvalid("typeRef", "Temporary ids cannot occur outside of a generic type specification."),
              sync);
        }

        // id must exist at the specification context, or it's invalid.
        var type = specContext.get(id);
        if(!type) {
          if(canDefineSpecId) {
            return null;
          }

          return promiseUtil.error(
              error.argInvalid("typeRef", "Temporary id does not correspond to an existing type."),
              sync);
        }

        return promiseUtil["return"](type.instance.constructor, sync);
      }

      // ---

      // Already created?
      var typeHolder = O.getOwn(this.__byTypeId, id);
      if(typeHolder) {
        if(sync) {
          if(typeHolder.Ctor) {
            return typeHolder.Ctor;
          } else if(typeHolder.error) {
            throw typeHolder.error;
          }
        } else {
          return typeHolder.promise;
        }
      }

      if(sync) {
        return promiseUtil.error(
            error.argInvalid("typeRef", "Type '" + id + "' has not been loaded yet."),
            true);
      }

      return null;
    },

    /**
     * Gets the instance constructor of a type given its identifier.
     *
     * If the identifier is a temporary identifier,
     * it must have already been loaded in the ambient specification context.
     *
     * Otherwise, the identifier is permanent.
     * If the identifier does not contain any "/" character,
     * it is considered relative to Pentaho's `pentaho/type` module.
     *
     * Checks if the identifier is already present in the `__byTypeId` map,
     * returning immediately (modulo sync) if it is.
     *
     * Otherwise, it requires the module, using either the sync or the async AMD form.
     *
     * If sync, AMD throws if a module with the given identifier is not yet loaded or is not defined.
     *
     * When the resulting module is returned by AMD,
     * its result is passed on, _recursively_, to `__get`,
     * and, thus, the module can return any of the supported type reference formats.
     * The usual is to return a factory function.
     *
     * ### Ambient specification context
     *
     * This method uses the ambient specification context to support deserialization of
     * generic type specifications containing temporary identifiers for referencing anonymous types.
     *
     * When a temporary identifier is specified and
     * there is no ambient specification context or
     * no definition is contained for it,
     * an error is thrown.
     *
     * @param {string} id - The identifier of a type. It can be a temporary or permanent identifier.
     * In the latter case, it can be relative or absolute.
     *
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor; while, when async, returns a promise for it.
     *
     * @private
     */
    __getById: function(id, sync) {

      id = this.__processId(id);

      var result = this.__getByIdSettled(id, sync);
      if(result) {
        // Loaded, Loading and Async, Error'ed
        return result;
      }

      // Not Loaded and Not Loading and Not Sync

      // Load
      return new TypeHolder(id, this).loadModuleAsync();
    },

    /**
     * Gets the configured instance constructor of a type, given the instance constructor.
     *
     * @param {function} fun - A function.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor; while, when async, returns a promise for it.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `fun` is not an `Instance` constructor.
     *
     * @throws {Error} Other errors, thrown by {@link pentaho.type.Context#__getByInstCtor}.
     *
     * @private
     */
    __getByFun: function(fun, sync) {

      var Instance = this.__Instance;

      if(Instance && fun.prototype instanceof Instance)
        return this.__getByInstCtor(fun, sync);

      return promiseUtil.error(
          error.argInvalid("typeRef", "Function is not a 'pentaho.type.Instance' constructor."), sync);
    },

    /**
     * Gets a _configured_ instance constructor of a type,
     * given the instance constructor of that type.
     *
     * This method works for anonymous types as well -
     * that have no [id]{@link pentaho.type.Type#id} -
     * because it uses the types' [uid]{@link pentaho.type.Type#uid}
     * to identify types.
     *
     * A map of already configured types is kept in `__byTypeUid`.
     *
     * If the type is not yet in the map, and it is not anonymous,
     * configuration is requested for it, and, if any exists,
     * it is applied. Configuration may create a sub-classed instance constructor.
     *
     * The configured type is stored by _uid_ and _id_ (if not anonymous)
     * and `factoryUid` (when specified) in corresponding maps,
     * and is returned immediately (modulo sync).
     *
     * @param {!Class.<pentaho.type.Instance>} InstCtor - An instance constructor.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor; while, when async, returns a promise for it.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When, pathologically, an instance constructor with
     * the same `uid` is already registered.
     *
     * @private
     */
    __getByInstCtor: function(InstCtor, sync) {
      var type = InstCtor.type;

      // Check if already present, by uid.
      var typeHolder = O.getOwn(this.__byTypeUid, type.uid);
      if(typeHolder) {
        // Loaded / Error'ed | Loading

        var InstCtorExisting = typeHolder.Ctor;
        if(InstCtorExisting) {
          // Loaded

          if(InstCtor !== InstCtorExisting) {
            // Pathological case, only possible if the result of an exploit.
            return promiseUtil.error(error.argInvalid("typeRef", "Duplicate type class uid."), sync);
          }

          return promiseUtil["return"](InstCtor, sync);
        }

        // Error'ed | Loading

        if(!sync) {
          return typeHolder.promise;
        }

        if(typeHolder.error) {
          throw typeHolder.error;
        }

        // Getting sync when still loading async.
        // Could it be a cyclic dependency?

        return promiseUtil.error(error.argInvalid("typeRef", "Type is still loading."), true);
      }

      var id = type.id;
      if(id) {
        typeHolder = O.getOwn(this.__byTypeId, id);
        if(typeHolder) {
          // uid is not registered, but id is...
          // so, the type must still be loading (the factory is being evaluated)
          // and its constructor is being used in some nested/recursive structure.

          if(!sync) {
            return typeHolder.promise;
          }

          // Return the constructor, although it is not yet configured by now and hope for the best.
          return InstCtor;
        }
      }

      // Getting a constructor registers it implicitly.
      // If named, can only be done asynchronously.
      if(sync) {
        if(id) {
          return promiseUtil.error(error.argInvalid("typeRef", "Type '" + id + "' has not been loaded yet."), true);
        }

        new TypeHolder(id, this).loadCtorFinished(InstCtor);

        return InstCtor;
      }

      // NOTE: A type's non-null id is never temporary.
      return new TypeHolder(id, this).loadCtorAsync(InstCtor);
    },

    // Inline type spec: {[base: "complex"], [id: ]}
    __getByObjectSpec: function(typeSpec, defaultBase, sync) {
      var Instance = this.__Instance;

      if(typeSpec.constructor !== Object) {
        // An instance of Type ?
        if(typeSpec instanceof Instance.Type)
          return this.__getByInstCtor(typeSpec.instance.constructor, sync);

        if(typeSpec instanceof Instance)
          return promiseUtil.error(
              error.argInvalid("typeRef", "Instances are not supported as type references."), sync);

        return promiseUtil.error(
            error.argInvalid("typeRef", "Object is not a 'pentaho.type.Type' instance or a plain object."), sync);
      }

      var id = typeSpec.id;
      if(id) {
        id = this.__processId(id);

        var result = this.__getByIdSettled(id, sync, /* canDefineSpecId: */true);
        if(result) {
          // Loaded, Loading and Async, Error'ed
          return result;
        }

        // Not Loaded and Not Loading and (NewTempId() or Not Sync)
      }

      return this.__loadByObjectSpec(id, typeSpec, defaultBase, sync);
    },

    // Actually loads a (new) object specification, given its (optional) id and default base.
    __loadByObjectSpec: function(id, typeSpec, defaultBase, sync) {

      if(sync) {
        // assert !id || NewTempId()
        // No configuration.

        // When sync, it should be the case that every referenced id is already loaded,
        // or an error will be thrown when getting these.
        return this.__creatingType(id, typeFactory);
      }

      // if id, may have configuration.

      // Collect the refs of all dependencies used within typeSpec.
      var depRefs = this.__getDependencyRefs(typeSpec);

      return new TypeHolder(id, this).loadFactoryAsync(typeFactory, depRefs);

      function typeFactory() {

        // A root generic type spec initiates a specification context.
        // Each root generic type spec has a separate specification context.
        return O.using(new SpecificationScope(), function createSyncInContext(specScope) {

          // Note the switch to sync mode here, whatever the outer `sync` value.
          // Only the outermost __getByObjectSpec/__loadByObjectSpec call may be async.
          // All following "reentries" will be sync.
          // So, it works to use the above ambient specification context to handle all contained temporary ids.

          // 1. Resolve the base type
          var baseTypeSpec = typeSpec.base || defaultBase || __defaultBaseTypeMid;

          var BaseInstCtor = this.__get(baseTypeSpec, null, /* sync: */true);

          // 2. Extend the base type
          var InstCtor = BaseInstCtor.extend({$type: typeSpec});

          // 3. Register and configure the new type
          if(SpecificationContext.isIdTemporary(id)) {
            // Register also in the specification context, under the temporary id.
            specScope.specContext.add(InstCtor.type, id);
          }

          return InstCtor;
        }, this);
      }
    },

    /*
     * Example: a list of complex type elements
     *
     *  [{props: { ...}}]
     *  <=>
     *  {base: "list", of: {props: { ...}}}
     */
    __getByListSpec: function(typeSpec, sync) {
      var elemTypeSpec;
      if(typeSpec.length !== 1 || !(elemTypeSpec = typeSpec[0]))
        return promiseUtil.error(
            error.argInvalid("typeRef", "List type specification must have a single child element type spec."),
            sync);

      // Expand compact list type spec syntax and delegate to the generic handler.
      return this.__getByObjectSpec({base: "list", of: elemTypeSpec}, null, sync);
    },

    __getTypeConfig: function(id) {
      return this.__config.selectType(id);
    },

    __applyConfig: function(InstCtor, typeConfig) {
      var TypeCtor = InstCtor.type.constructor;
      try {
        this.__configDepth++;

        TypeCtor.implement(typeConfig);

      } finally {
        this.__configDepth--;
      }
    },

    __creatingType: function(id, factory) {
      var previousCreatingTypeId = this.__creatingTypeId;
      this.__creatingTypeId = id; // may be null
      try {
        return factory.call(this);
      } finally {
        this.__creatingTypeId = previousCreatingTypeId;
      }
    }
    // endregion
  }, /** @lends pentaho.type.Context */{

    get standardIds() {
      return __standardIds;
    },

    /**
     * Creates a new context with a given environment and returns a promise for it.
     *
     * @param {pentaho.environment.spec.IEnvironment} [envSpec] The environment variables' specification.
     * When unspecified, it defaults to {@link pentaho.environment.main}.
     * Unspecified platform context properties default to the value of those of the default context.
     *
     * @return {!Promise.<!pentaho.type.Context>} A promise for the new context.
     */
    createAsync: function(envSpec) {

      var env = !envSpec ? mainPlatformEnv :
                envSpec.createChild ? envSpec :
                mainPlatformEnv.createChild(envSpec);

      var standardIds = this.standardIds;

      return configurationService.getAsync(env).then(function(config) {

        var context = new Context(env, config);

        return context.getDependencyAsync(standardIds)
            .then(function() {
              return context;
            });
      });
    }
  });

  return Context;

  // region __collectTypeIds
  function __collectDependencyRefsRecursive(typeSpec, depIdsSet, depRefs) {
    if(!typeSpec) return;

    /* eslint default-case: 0 */
    switch(typeof typeSpec) {
      case "string":
        if(SpecificationContext.isIdTemporary(typeSpec)) return;

        // A standard type that is surely loaded?
        if(O_hasOwn.call(this.__byTypeId, typeSpec)) return;

        if(!O_hasOwn.call(depIdsSet, typeSpec)) {
          depIdsSet[typeSpec] = 1;
          depRefs.push(typeSpec);
        }
        return;

      case "object":
        if(Array.isArray(typeSpec)) {
          // Shorthand list type notation
          // Example: [{props: { ...}}]
          if(typeSpec.length)
            __collectDependencyRefsRecursive.call(this, typeSpec[0], depIdsSet, depRefs);
          return;
        }

        __collectDependencyRefsGenericRecursive.call(this, typeSpec, depIdsSet, depRefs);
        return;
    }
  }

  function __collectDependencyRefsGenericRecursive(typeSpec, depIdsSet, depRefs) {
    // TODO: this method only supports standard types deserialization.
    //   Custom types with own type attributes would need special handling.
    //   Something like a two phase protocol?

    // {[base: "complex", ] [of: "..."] , [props: []]}
    __collectDependencyRefsRecursive.call(this, typeSpec.base, depIdsSet, depRefs);

    __collectDependencyRefsRecursive.call(this, typeSpec.of, depIdsSet, depRefs);

    var props = typeSpec.props;
    if(props) {
      if(Array.isArray(props))
        props.forEach(function(propSpec) {
          if(propSpec) {
            this.__instances.__collectDependencyRefs(propSpec.defaultValue, depIdsSet, depRefs);
            __collectDependencyRefsRecursive.call(this, propSpec.valueType, depIdsSet, depRefs);
            __collectDependencyRefsRecursive.call(this, propSpec.base, depIdsSet, depRefs);
          }
        }, this);
      else
        Object.keys(props).forEach(function(propName) {
          var propSpec = props[propName];
          if(propSpec) {
            this.__instances.__collectDependencyRefs(propSpec.defaultValue, depIdsSet, depRefs);
            __collectDependencyRefsRecursive.call(this, propSpec && propSpec.valueType, depIdsSet, depRefs);
            __collectDependencyRefsRecursive.call(this, propSpec && propSpec.base, depIdsSet, depRefs);
          }
        }, this);
    }

    // These are either ids of AMD modules of type mixins or, directly, type mixins.
    var mixins = typeSpec.mixins;
    if(mixins) {
      if(!(Array.isArray(mixins))) mixins = [mixins];

      mixins.forEach(function(mixinIdOrClass) {
        if(typeof mixinIdOrClass === "string") {
          __collectDependencyRefsRecursive.call(this, mixinIdOrClass, depIdsSet, depRefs);
        }
      }, this);
    }
  }
  // endregion
});
