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
define([
  "require",
  "module",
  "../i18n!types",
  "./standard",
  "./SpecificationContext",
  "./SpecificationScope",
  "../GlobalContextVars",
  "./configurationService",
  "../lang/Base",
  "../util/promise",
  "../util/arg",
  "../util/error",
  "../util/object",
  "../util/fun"
], function(localRequire, module, bundle, standard, SpecificationContext, SpecificationScope,
    GlobalContextVars, configurationService, Base, promiseUtil, arg, error, O, F) {

  "use strict";

  /*global SESSION_NAME:false, SESSION_LOCALE:false, active_theme:false, Promise:false */

  var _nextUid = 1,

      _baseMid = module.id.replace(/Context$/, ""), // e.g.: "pentaho/type/"

      _baseFacetsMid = _baseMid + "facets/",

      // Default `base` type in a type specification.
      _defaultBaseTypeMid = "complex",

      // Standard types which can be assumed to already be loaded.
      _standardTypeMids = {};

  Object.keys(standard).forEach(function(name) {
    if(name !== "facets") _standardTypeMids[_baseMid + name] = 1;
  });

  Object.keys(standard.facets).forEach(function(name) {
    _standardTypeMids[_baseFacetsMid + name] = 1;
  });

  /**
   * @name pentaho.type.Context
   * @class
   * @amd pentaho/type/Context
   *
   * @classDesc A `Context` object holds instance constructors of **configured** types.
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
   * The Pentaho Metadata Model embraces this concept by defining types as
   * _type factories_ that take a context object as their argument.
   *
   * The instance constructors of types
   * **must** be obtained from a context object,
   * using one of the provided methods:
   * [get]{@link pentaho.type.Context#get},
   * [getAsync]{@link pentaho.type.Context#getAsync},
   * [getAllAsync]{@link pentaho.type.Context#getAllAsync}, or
   * [inject]{@link pentaho.type.Context#inject},
   * so that these are configured before being used.
   * This applies whether an instance constructor is used for creating an instance or to derive a subtype.
   *
   * The following properties are specified at construction time and
   * constitute the environmental information held by a context:
   * [application]{@link pentaho.spec.IContextVars#application},
   * [user]{@link pentaho.spec.IContextVars#user},
   * [theme]{@link pentaho.spec.IContextVars#theme} and
   * [locale]{@link pentaho.spec.IContextVars#locale}.
   * Their values determine (or "select") the _type configuration rules_ that
   * apply and are used to configure the constructors provided by the context.
   *
   * To better understand how a context provides configured types,
   * assume that an non-anonymous type,
   * with the [id]{@link pentaho.type.Type#id} `"my/own/type"`,
   * is requested from a context object, `context`:
   *
   * ```js
   * var MyOwnInstanceCtor = context.get("my/own/type");
   * ```
   *
   * Internally, (it is like if) the following steps are taken:
   *
   * 1. If the requested type has been previously created and configured, just return it:
   *    ```js
   *    var InstanceCtor = getStored(context, "my/own/type");
   *    if(InstanceCtor != null) {
   *      return InstanceCtor;
   *    }
   *    ```
   *
   * 2. Otherwise, the context requires the type's module from the AMD module system,
   *    and obtains its [factory function]{@link pentaho.type.Factory} back:
   *    ```js
   *    var typeFactory = require("my/own/type");
   *    ```
   *
   * 3. The factory function is called with the context as argument
   *    and creates and returns an instance constructor for that context:
   *
   *    ```js
   *    InstanceCtor = typeFactory(context);
   *    ```
   *
   * 4. The instance constructor is configured with any applicable rules:
   *    ```js
   *    InstanceCtor = configure(context, InstanceCtor);
   *    ```
   *
   * 5. The configured instance constructor is stored under its id:
   *    ```js
   *    store(context, InstanceCtor.type.id, InstanceCtor);
   *    ```
   *
   * 6. Finally, it is returned to the caller:
   *    ```js
   *    return InstanceCtor;
   *    ```
   *
   * Note that anonymous types cannot be _directly_ configured,
   * as _type configuration rules_ are targeted at specific, identified types.
   *
   * @constructor
   * @description Creates a `Context` with given variables.
   * @param {pentaho.spec.IContextVars} [contextVars] The context variables' specification.
   * When unspecified, it defaults to an instance of {@link pentaho.GlobalContextVars}.
   */
  var Context = Base.extend(/** @lends pentaho.type.Context# */{

    constructor: function(contextVars) {
      this._vars = contextVars || new GlobalContextVars();

      // factory uid : Class.<pentaho.type.Instance>
      this._byFactoryUid = {};

      // type uid : Class.<pentaho.type.Instance>
      this._byTypeUid = {};

      // non-anonymous types
      // type id : Class.<pentaho.type.Instance>
      this._byTypeId = {};

      // Create the context's root Instance/Type type.
      this._Instance = this._getByFactory(standard.instance, /*sync:*/true);

      // Register all other standard types
      // This mostly helps tests being able to require.undef(.) these at any time
      //  and not cause random failures for assuming all standard types were loaded.
      Object.keys(standard).forEach(function(lid) {
        if(lid !== "facets" && lid !== "instance") this._getByFactory(standard[lid], /*sync:*/true);
      }, this);
    },

    /**
     * The context's variables.
     *
     * @type {!pentaho.spec.IContextVars}
     * @readOnly
     */
    get vars() {
      return this._vars;
    },

    /**
     * Gets the **configured instance constructor** of a type.
     *
     * For more information on the `typeRef` argument,
     * please see [UTypeReference]{@link pentaho.type.spec.UTypeReference}.
     *
     * The modules of standard types and refinement facet _mixins_ are preloaded and
     * can be requested _synchronously_. These are:
     *
     * * [pentaho/type/instance]{@link pentaho.type.Instance}
     *   * [pentaho/type/value]{@link pentaho.type.Value}
     *     * [pentaho/type/list]{@link pentaho.type.List}
     *     * [pentaho/type/element]{@link pentaho.type.Element}
     *       * [pentaho/type/complex]{@link pentaho.type.Complex}
     *       * [pentaho/type/simple]{@link pentaho.type.Simple}
     *         * [pentaho/type/string]{@link pentaho.type.String}
     *         * [pentaho/type/number]{@link pentaho.type.Number}
     *         * [pentaho/type/date]{@link pentaho.type.Date}
     *         * [pentaho/type/boolean]{@link pentaho.type.Boolean}
     *         * [pentaho/type/function]{@link pentaho.type.Function}
     *         * [pentaho/type/object]{@link pentaho.type.Object}
     *     * [pentaho/type/refinement]{@link pentaho.type.Refinement}
     *       * [pentaho/type/facets/Refinement]{@link pentaho.type.facets.RefinementFacet}
     *         * [pentaho/type/facets/DiscreteDomain]{@link pentaho.type.facets.DiscreteDomain}
     *         * [pentaho/type/facets/OrdinalDomain]{@link pentaho.type.facets.OrdinalDomain}
     *   * [pentaho/type/property]{@link pentaho.type.Property}
     *
     * For all of these, the `pentaho/type/` or `pentaho/type/facets/` prefix is optional
     * (when requested to a _context_; the AMD module system requires the full module ids to be specified).
     *
     * If it is not known whether all non-standard types that are referenced by id have already been loaded,
     * the asynchronous method version, [getAsync]{@link pentaho.type.Context#getAsync},
     * should be used instead.
     *
     * @see pentaho.type.Context#getAsync
     *
     * @example
     * <caption>
     *   Getting a <b>configured</b> type instance constructor <b>synchronously</b> for a specific application.
     * </caption>
     *
     * require(["pentaho/type/Context", "my/viz/chord"], function(Context) {
     *
     *   var context = new Context({application: "data-explorer-101"})
     *
     *   // Request synchronously cause it was already loaded in the above `require`
     *   var VizChordModel = context.get("my/viz/chord");
     *
     *   var model = new VizChordModel({outerRadius: 200});
     *
     *   // Render the model using the default view
     *   model.type.viewClass.then(function(View) {
     *     var view = new View(document.getElementById("container"), model);
     *
     *     // ...
     *   });
     *
     * });
     *
     * @param {!pentaho.type.spec.UTypeReference} typeRef A type reference.
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
     * @throws {Error} When the id of a type is not defined as a module in the AMD module system
     * (specified directly in `typeRef`, or present in an generic type specification).
     *
     * @throws {Error} When the id of a **non-standard type** is from a module that the AMD module system
     * hasn't loaded yet (specified directly in `typeRef`, or present in an generic type specification)
     *
     * @throws {pentaho.lang.OperationInvalidError} When the value returned by a factory function is not
     * an instance constructor of a subtype of `Instance`
     * (specified directly in `typeRef`, or obtained indirectly by loading a type's module given its id).
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is, or contains, an array-shorthand,
     * list type specification that has more than one child element type specification.
     */
    get: function(typeRef, keyArgs) {
      return this._get(typeRef, O.getOwn(keyArgs, "defaultBase"), true);
    },

    /**
     * Binds the initial arguments of a function to
     * the instance constructors corresponding to
     * given type references.
     *
     * The specified type references are each resolved synchonously,
     * using [get]{@link pentaho.type.Context#get},
     * when the bound function is first called.
     * Thus, any resolve errors are only thrown then.
     *
     * If a fixed JavaScript context object is specified in `ctx`,
     * then `fun` gets bound to that object.
     * Otherwise, the JavaScript context object in which `fun` is called is dynamic (whichever the caller decides).
     *
     * @param {!Array.<pentaho.type.spec.UTypeReference>} typeRefs An array of type references.
     * @param {function} fun The function to bind.
     * @param {Object} [ctx] The fixed JavaScript context object to use.
     *
     * @return {function} The new bound function.
     */
    inject: function(typeRefs, fun, ctx) {
      var InstCtors = null;
      var me = this;

      return function injected() {
        // Resolve on first use.
        if(!InstCtors) InstCtors = typeRefs.map(me.get, me);

        return fun.apply(ctx || this, InstCtors.concat(arg.slice(arguments)));
      };
    },

    /**
     * Gets, asynchronously, the **configured instance constructor** of a type.
     *
     * For more information on the `typeRef` argument,
     * please see [UTypeReference]{@link pentaho.type.spec.UTypeReference}.
     *
     * This method can be used even if a generic type specification references non-standard types
     * whose modules have not yet been loaded by the AMD module system.
     *
     * @see pentaho.type.Context#get
     *
     * @example
     * <caption>
     *   Getting a <b>configured</b> type instance constructor <b>asynchronously</b> for a specific application.
     * </caption>
     *
     * require(["pentaho/type/Context"], function(Context) {
     *
     *   var context = new Context({application: "data-explorer-101"})
     *
     *   context.getAsync("my/viz/chord")
     *     .then(function(VizChordModel) {
     *
     *       var model = new VizChordModel({outerRadius: 200});
     *
     *       // Render the model using the default view
     *       model.type.viewClass.then(function(View) {
     *         var view = new View(document.getElementById("container"), model);
     *
     *         // ...
     *       });
     *     });
     *
     * });
     *
     * @param {!pentaho.type.spec.UTypeReference} typeRef A type reference.
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
     * @rejects {Error} When the id of a type is not defined as a module in the AMD module system
     * (specified directly in `typeRef`, or present in an generic type specification).
     *
     * @rejects {pentaho.lang.OperationInvalidError} When the value returned by a factory function is not
     * an instance constructor of a subtype of `Instance`
     * (specified directly in `typeRef`, or obtained indirectly by loading a type's module given its id).
     *
     * @rejects {pentaho.lang.ArgumentInvalidError} When `typeRef` is, or contains, an array-shorthand,
     * list type specification that has more than one child element type specification.
     *
     * @rejects {Error} When any other, unexpected error occurs.
     */
    getAsync: function(typeRef, keyArgs) {
      try {
        return this._get(typeRef, O.getOwn(keyArgs, "defaultBase"), false);
      } catch(ex) {
        /* istanbul ignore next : really hard to test safeguard */
        return Promise.reject(ex);
      }
    },

    /**
     * Gets a promise for the **configured instance constructors** of
     * all of the types that are subtypes of a given base type.
     *
     * Any errors that may occur result in a rejected promise.
     *
     * @example
     * <caption>
     *   Getting all <code>"my/component"</code> sub-types browsable
     *   in the application <code>"data-explorer-101"</code>.
     * </caption>
     *
     * require(["pentaho/type/Context"], function(Context) {
     *
     *   var context = new Context({application: "data-explorer-101"});
     *
     *   context.getAllAsync("my/component", {isBrowsable: true})
     *     .then(function(ComponentModels) {
     *
     *       ComponentModels.forEach(function(ComponentModel) {
     *
     *         console.log("will display menu entry for: " + ComponentModel.type.label);
     *
     *       });
     *     });
     *
     * });
     *
     * @param {string} [baseTypeId] The id of the base type. Defaults to `"pentaho/type/value"`.
     * @param {object} [keyArgs] Keyword arguments.
     * @param {?boolean} [keyArgs.isBrowsable=null] Indicates that only types with the specified
     *   [isBrowsable]{@link pentaho.type.Type#isBrowsable} value are returned.
     *
     * @return {Promise.<Array.<Class.<pentaho.type.Instance>>>} A promise for an array of instance classes.
     *
     * @see pentaho.type.Context#get
     * @see pentaho.type.Context#getAsync
     */
    getAllAsync: function(baseTypeId, keyArgs) {
      try {
        if(!baseTypeId) baseTypeId = "pentaho/type/value";

        var predicate = F.predicate(keyArgs);
        var me = this;
        return promiseUtil.require("pentaho/service!" + baseTypeId, localRequire)
            .then(function(factories) {
              return Promise.all(factories.map(me.getAsync, me));
            })
            .then(function(InstCtors) {
              /*jshint laxbreak:true*/
              return predicate
                  ? InstCtors.filter(function(InstCtor) { return predicate(InstCtor.type); })
                  : InstCtors;
            });
      } catch(ex) {
        /* istanbul ignore next : really hard to test safeguard */
        return Promise.reject(ex);
      }
    },

    //region get support
    /**
     * Gets the instance constructor of a type.
     *
     * Internal get method shared by `get` and `getAsync`.
     * Uses `sync` argument to distinguish between the two modes.
     *
     * Main dispatcher according to the type and class of `typeRef`:
     * string, function or array or object.
     *
     * @param {pentaho.type.spec.UTypeReference} typeRef A type reference.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor, while, when async, returns a promise for it.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is of an unsupported JavaScript type:
     * not a string, function, array or object.
     *
     * @private
     */
    _get: function(typeRef, defaultBase, sync) {
      if(typeRef == null || typeRef === "")
        return this._error(error.argRequired("typeRef"), sync);

      /*jshint laxbreak:true*/
      switch(typeof typeRef) {
        case "string":   return this._getById (typeRef, sync);
        case "function": return this._getByFun(typeRef, sync);
        case "object":   return Array.isArray(typeRef)
            ? this._getByListSpec(typeRef, sync)
            : this._getByObjectSpec(typeRef, defaultBase, sync);
      }

      return this._error(error.argInvalid("typeRef"), sync);
    },

    /**
     * Gets the instance constructor of a type given its id.
     *
     * If the id is a temporary id,
     * it must have already been loaded in the ambient specification context.
     *
     * Otherwise, the id is permanent.
     * If the id does not contain any "/" character,
     * it is considered relative to pentaho's `pentaho/type` module.
     *
     * Checks if id is already present in the `_byTypeId` map,
     * returning immediately (modulo sync) if it is.
     *
     * Otherwise, requires the module, using either the sync or the async AMD form.
     *
     * If sync, AMD throws if a module with the given id is not yet loaded or isn't defined.
     *
     * When the resulting module is returned by AMD,
     * its result is passed on, _recursively_, to `_get`,
     * and, thus, the module can return any of the supported type reference formats.
     * The usual is to return a factory function. Honestly, haven't thought much about
     * whether it makes total sense for a module to return the other formats.
     *
     * ### Ambient specification context
     *
     * This method uses the ambient specification context to support deserialization of
     * generic type specifications containing temporary ids, for referencing anonymous types.
     *
     * When a temporary id is specified and
     * there is no ambient specification context or
     * it does not contain a definition for it,
     * an error is thrown.
     *
     * @param {string} id The id of a type. It can be a temporary or permanent id.
     * In the latter case, it can be relative or absolute.
     *
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor, while, when async, returns a promise for it.
     *
     * @private
     */
    _getById: function(id, sync) {
      // Is it a temporary id?
      if(SpecificationContext.isIdTemporary(id)) {
        var specContext = SpecificationContext.current;
        if(!specContext) {
          return this._error(
              error.argInvalid("typeRef", "Temporary ids cannot occur outside of a generic type specification."),
              sync);
        }

        // id must exist at the specification context, or it's invalid.
        var type = specContext.get(id);
        if(!type) {
          return this._error(
              error.argInvalid("typeRef", "Temporary id does not correspond to an existing type."),
              sync);
        }

        return this._return(type.instance.constructor, sync);
      }

      id = toAbsTypeId(id);

      // Check if id is already present.
      var InstCtor = O.getOwn(this._byTypeId, id);
      if(InstCtor) return this._return(InstCtor, sync);

      /*jshint laxbreak:true*/
      return sync
          // `require` fails if a module with the id in the `typeSpec` var
          // is not already _loaded_.
          ? this._get(localRequire(id), null, true)
          : promiseUtil.require(id, localRequire).then(this._get.bind(this));
    },

    /**
     * Gets the instance constructor of a type given a function that represents it.
     *
     * The function can be:
     *
     * 1. An instance constructor
     * 2. A type constructor
     * 3. Any other function, which is assumed to be a factory function.
     *
     * In the first two cases, the operation is delegated to `getByType`,
     * passing in the instance constructor, representing the type.
     *
     * In the latter case, it is delegated to `_getByFactory`.
     *
     * @param {function} fun A function.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor, while, when async, returns a promise for it.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `fun` is a type constructor
     * (e.g. [Type]{@link pentaho.type.Type}).
     *
     * @throws {Error} Other errors,
     * thrown by {@link pentaho.type.Context#_getByInstCtor} and {@link pentaho.type.Context#_getByFactory}.
     *
     * @private
     */
    _getByFun: function(fun, sync) {
      var proto = fun.prototype;
      var Instance = this._Instance;

      if(proto instanceof Instance)
        return this._getByInstCtor(fun, sync);

      if(proto instanceof Instance.Type)
        return this._error(error.argInvalid("typeRef", "Type constructor is not supported."), sync);

      // Assume it's a factory function.
      return this._getByFactory(fun, sync);
    },

    /**
     * Gets a _configured_ instance constructor of a type,
     * given the instance constructor of that type.
     *
     * This method works for anonymous types as well -
     * that have no [id]{@link pentaho.type.Type#id} -
     * cause it uses the types' [uid]{@link pentaho.type.Type#uid}
     * to identify types.
     *
     * A map of already configured types is kept in `_byTypeUid`.
     *
     * If the type not yet in the map, and it is not anonymous,
     * configuration is requested for it, and, if any exists,
     * it is applied. Configuration may create a sub-classed instance constructor.
     *
     * The configured type is stored by _uid_ and _id_ (if not anonymous)
     * and `factoryUid` (when specified) in corresponding maps,
     * and is returned immediately (modulo sync).
     *
     * @param {!Class.<pentaho.type.Instance>} InstCtor An instance constructor.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     * @param {?number} [factoryUid] The factory unique id, when `Type` was created by one.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor, while, when async, returns a promise for it.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When, pathologically, an instance constructor with
     * the same `uid` is already registered.
     *
     * @private
     */
    _getByInstCtor: function(InstCtor, sync, factoryUid) {
      var type = InstCtor.type;

      // Check if already present, by uid.
      var InstCtorExisting = O.getOwn(this._byTypeUid, type.uid);
      /* istanbul ignore else */
      if(!InstCtorExisting) {
        // Not present yet.
        var id = type.id;
        if(id) {
          // Configuration is for the type-constructor.
          var config = this._getConfig(id);
          if(config) type.constructor.implement(config);

          this._byTypeId[id] = InstCtor;
        }

        this._byTypeUid[type.uid] = InstCtor;

      } else if(InstCtor !== InstCtorExisting) {
        // Pathological case, only possible if the result of an exploit.
        return this._error(error.argInvalid("typeRef", "Duplicate type class uid."), sync);
      }

      if(factoryUid != null) {
        this._byFactoryUid[factoryUid] = InstCtor;
      }

      return this._return(InstCtor, sync);
    },

    /**
     * Gets a configured instance constructor of a type,
     * given a factory function that creates it.
     *
     * Factory functions are tracked by using an unique id property (`_uid_`),
     * which is automatically assigned to them the first time they are given
     * to this function.
     *
     * A map of already evaluated factory functions,
     * indexed by their unique id, is kept in `_byFactoryUid`.
     *
     * If a factory has already been evaluated before,
     * the type it returned then is now returned immediately (modulo sync).
     *
     * Otherwise the factory function is evaluated being passed this context as argument.
     *
     * The returned instance constructor is passed to `_getType`,
     * for registration and configuration,
     * and then returned immediately (module sync).
     *
     * @param {!pentaho.type.Factory.<pentaho.type.Instance>} typeFactory A factory of a type's instance constructor.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     * returns the instance constructor, while, when async, returns a promise for it.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the value returned by the factory function
     * is not a instance constructor of a subtype of `Instance`.
     *
     * @private
     */
    _getByFactory: function(typeFactory, sync) {
      var factoryUid = getFactoryUid(typeFactory);

      var InstCtor = O.getOwn(this._byFactoryUid, factoryUid);
      if(InstCtor)
        return this._return(InstCtor, sync);

      InstCtor = typeFactory(this);

      if(!F.is(InstCtor) || (this._Instance && !(InstCtor.prototype instanceof this._Instance)))
        return this._error(
            error.operInvalid("Type factory must return a sub-class of 'pentaho.type.Instance'."),
            sync);

      return this._getByInstCtor(InstCtor, sync, factoryUid);
    },

    // Inline type spec: {[base: "complex"], [id: ]}
    _getByObjectSpec: function(typeSpec, defaultBase, sync) {
      var Instance = this._Instance;

      if(typeSpec instanceof Instance.Type)
        return this._getByInstCtor(typeSpec.instance.constructor, sync);

      if(typeSpec instanceof Instance)
        return this._error(error.argInvalid("typeRef", "Instances are not supported as type references."), sync);

      var baseTypeSpec = typeSpec.base || defaultBase || _defaultBaseTypeMid;
      var id = typeSpec.id;
      if(id) {
        // Already loaded?

        var InstCtor;

        if(SpecificationContext.isIdTemporary(id)) {
          var specContext = SpecificationContext.current;
          if(specContext) {
            var type = specContext.get(id);
            if(type) InstCtor = type.instance.constructor;
          }
        } else {
          // id ~ "value" goes here.
          id = toAbsTypeId(id);
          InstCtor = O.getOwn(this._byTypeId, id);
        }

        // If so, keep initial specification. Ignore the new one.
        if(InstCtor) return this._return(InstCtor, sync);
      }

      // assert baseTypeSpec

      return this._getByObjectSpecCore(id, baseTypeSpec, typeSpec, sync);
    },

    // Actually gets an object specification, given its already processed _base type spec_ and id.
    // Also, this method assumes that the type is not yet registered either in the context or in the
    // specification context.
    _getByObjectSpecCore: function(id, baseTypeSpec, typeSpec, sync) {
      // if id and not loaded, the id is used later to register the new type under that id and configure it.

      // A root generic type spec initiates a specification context.
      // Each root generic type spec has a separate specification context.
      var resolveSync = function() {
        /*jshint validthis:true*/

        return O.using(new SpecificationScope(), function resolveSyncInContext(specScope) {
          /*jshint validthis:true*/

          // Note the switch to sync mode here, whatever the outer `sync` value.
          // Only the outermost _getByObjectSpec call will be async.
          // All following "reentries" will be sync.
          // So, it works to use the above ambient specification context to handle all contained temporary ids.

          // 1. Resolve the base type
          var BaseInstCtor = this._get(baseTypeSpec, null, /*sync:*/true);

          // 2. Extend the base type
          var InstCtor = BaseInstCtor.extend({type: typeSpec});

          // 3. Register and configure the new type
          if(SpecificationContext.isIdTemporary(id)) {
            // Register also in the specification context, under the temporary id.
            specScope.specContext.add(InstCtor.type, id);
          }

          return this._getByInstCtor(InstCtor, /*sync:*/true);
        }, this);
      };

      // When sync, it should be the case that every referenced id is already loaded,
      // or an error will be thrown when requiring these.
      if(sync) return resolveSync.call(this);

      // Collect the module ids of all custom types used within typeSpec.
      var customTypeIds = collectTypeIds(typeSpec);
      /*jshint laxbreak:true*/
      return customTypeIds.length
          // Require them all and only then invoke the synchronous BaseType.extend method.
          ? promiseUtil.require(customTypeIds, localRequire).then(resolveSync.bind(this))
          // All types are standard and can be assumed to be already loaded.
          // However, we should behave asynchronously as requested.
          : promiseUtil.wrapCall(resolveSync, this);
    },

    /*
     * Example: a list of complex type elements
     *
     *  [{props: { ...}}]
     *  <=>
     *  {base: "list", of: {props: { ...}}}
     */
    _getByListSpec: function(typeSpec, sync) {
      var elemTypeSpec;
      if(typeSpec.length !== 1 || !(elemTypeSpec = typeSpec[0]))
        return this._error(
            error.argInvalid("typeRef", "List type specification must have a single child element type spec."),
            sync);

      // Expand compact list type spec syntax and delegate to the generic handler.
      return this._getByObjectSpec({base: "list", of: elemTypeSpec}, null, sync);
    },

    _getConfig: function(id) {
      return configurationService.select(id, this._vars);
    },
    //endregion

    _return: function(InstCtor, sync) {
      return sync ? InstCtor : Promise.resolve(InstCtor);
    },

    _error: function(ex, sync) {
      if(sync) throw ex;
      return Promise.reject(ex);
    }
  });

  return Context;

  function getFactoryUid(factory) {
    return factory._fuid_ || (factory._fuid_ = _nextUid++);
  }

  // It's considered an AMD id only if it has at least one "/".
  // Otherwise, append pentaho's base amd id.
  function toAbsTypeId(id) {
    return id.indexOf("/") < 0 ? (_baseMid + id) : id;
  }

  // Recursively collect the module ids of all custom types used within typeSpec.
  function collectTypeIds(typeSpec) {
    var customTypeIds = [];
    collectTypeIdsRecursive(typeSpec, customTypeIds);
    return customTypeIds;
  }

  function collectTypeIdsRecursive(typeSpec, outIds) {
    if(!typeSpec) return;

    switch(typeof typeSpec) {
      case "string":
        if(SpecificationContext.isIdTemporary(typeSpec)) return;

        // It's considered an AMD id only if it has at least one "/".
        // Otherwise, append pentaho's base amd id.
        if(typeSpec.indexOf("/") < 0) typeSpec = _baseMid + typeSpec;

        // A standard type that is surely loaded?
        if(_standardTypeMids[typeSpec] === 1) return;

        outIds.push(typeSpec);
        return;

      case "object":
        if(Array.isArray(typeSpec)) {
          // Shorthand list type notation
          // Example: [{props: { ...}}]
          if(typeSpec.length)
            collectTypeIdsRecursive(typeSpec[0], outIds);
          return;
        }

        // TODO: this method only supports standard types deserialization.
        //   Custom types with own type attributes would need special handling.
        //   Something like a two phase protocol?

        // {[base: "complex", ] [of: "..."] , [props: []]}
        collectTypeIdsRecursive(typeSpec.base, outIds);

        collectTypeIdsRecursive(typeSpec.of, outIds);

        var props = typeSpec.props;
        if(props) {
          if(Array.isArray(props))
            props.forEach(function(propSpec) {
              collectTypeIdsRecursive(propSpec && propSpec.type, outIds);
              collectTypeIdsRecursive(propSpec && propSpec.base, outIds);
            });
          else
            Object.keys(props).forEach(function(propName) {
              var propSpec = props[propName];
              collectTypeIdsRecursive(propSpec && propSpec.type, outIds);
              collectTypeIdsRecursive(propSpec && propSpec.base, outIds);
            });
        }

        // These are not ids of types but only of mixin AMD modules.
        var facets = typeSpec.facets;
        if(facets != null) {
          if(!(Array.isArray(facets))) facets = [facets];

          facets.forEach(function(facetIdOrClass) {
            if(typeof facetIdOrClass === "string") {
              if(facetIdOrClass.indexOf("/") < 0)
                facetIdOrClass = _baseFacetsMid + facetIdOrClass;

              collectTypeIdsRecursive(facetIdOrClass, outIds);
            }
          });
        }
        return;
    }
  }
});
