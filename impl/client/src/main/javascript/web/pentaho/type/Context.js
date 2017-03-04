/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "../service",
  "../typeInfo",
  "../i18n!types",
  "./standard",
  "./SpecificationContext",
  "./SpecificationScope",
  "../context",
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
], function(localRequire, module, service, typeInfo, bundle, standard, SpecificationContext, SpecificationScope,
    mainPlatformContext, configurationService,
    Transaction, TransactionScope, CommittedScope,
    Base, promiseUtil, arg, error, O, F) {

  "use strict";

  /* globals Promise */

  var _nextFactoryUid = 1;
  var _singleton = null;
  var _baseMid = module.id.replace(/Context$/, ""); // e.g.: "pentaho/type/"
  var _baseFacetsMid = _baseMid + "facets/";

  // Default `base` type in a type specification.
  var _defaultBaseTypeMid = "complex";

  var O_hasOwn = Object.prototype.hasOwnProperty;

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
     * [getAllAsync]{@link pentaho.type.Context#getAllAsync}, or
     * [inject]{@link pentaho.type.Context#inject},
     * so that these are configured before being used.
     * This applies whether an instance constructor is used for creating an instance or to derive a subtype.
     *
     * A type context holds environmental information in the form of an environment of the
     * [JavaScript Pentaho Platform]{@link pentaho.context.IContext},
     * which contains relevant information such as:
     * [application]{@link pentaho.context.IContext#application},
     * [user]{@link pentaho.context.IContext#user},
     * [theme]{@link pentaho.context.IContext#theme} and
     * [locale]{@link pentaho.context.IContext#locale}.
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
     * Internally, (it is as if) the following steps are taken:
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
     * 5. The configured instance constructor is stored under its identifier:
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
     * @param {pentaho.context.spec.IContext} [platformContextSpec] The context variables' specification.
     * When unspecified, it defaults to {@link pentaho.context.main}.
     * Unspecified platform context properties default to the value of those of the default context.
     */
    constructor: function(platformContextSpec) {
      /**
       * The associated platform context.
       *
       * @type {!pentaho.context.IContext}
       * @private
       */
      this._vars = !platformContextSpec ? mainPlatformContext :
          platformContextSpec.createChild ? platformContextSpec :
          mainPlatformContext.createChild(platformContextSpec);

      /**
       * The ambient/current transaction, if any, or `null`.
       *
       * @type {pentaho.type.changes.Transaction}
       * @private
       */
      this._txnCurrent = null;

      /**
       * The stack of transaction scopes.
       *
       * @type {Array.<pentaho.type.changes.AbstractTransactionScope>}
       * @private
       */
      this._txnScopes = [];

      /**
       * The version of the next committed/fulfilled transaction.
       *
       * @type {number}
       * @private
       * @default 1
       */
      this._nextVersion = 1;

      /**
       * Map of instance constructors by factory function _uid_.
       *
       * See also `_nextFactoryUid` and `getFactoryUid`.
       *
       * @type {!Object.<string, Class.<pentaho.type.Instance>>}
       */
      this._byFactoryUid = {};

      /**
       * Map of instance constructors by [type uid]{@link pentaho.type.Type#uid}.
       *
       * @type {!Object.<string, Class.<pentaho.type.Instance>>}
       */
      this._byTypeUid = {};

      // non-anonymous types
      /**
       * Map of instance constructors by [type id]{@link pentaho.type.Type#id}
       * and by [type alias]{@link pentaho.type.Type#alias}
       * for non-anonymous types.
       *
       * @type {!Object.<string, Class.<pentaho.type.Instance>>}
       */
      this._byTypeId = {};

      /**
       * The root [Instance]{@link pentaho.type.Instance} constructor.
       *
       * @type {!Class.<pentaho.type.Instance>}
       */
      this._Instance = this._getByFactory(standard.instance, /* sync: */true);

      // Register all other standard types
      // This mostly helps tests being able to require.undef(.) these at any time
      //  and not cause random failures for assuming all standard types were loaded.
      Object.keys(standard).forEach(function(lid) {
        if(lid !== "facets" && lid !== "filter" && lid !== "instance")
          this._getByFactory(standard[lid], /* sync: */true);
      }, this);

      Object.keys(standard.filter).forEach(function(fid){
        this._getByFactory(standard.filter[fid], /* sync: */true);
      }, this);
    },

    /**
     * Gets the associated platform context.
     *
     * @type {!pentaho.context.IContext}
     * @readOnly
     */
    get vars() {
      return this._vars;
    },

    // region Type Registry

    // TODO: Removed from docs, below, until isIn is made public.
    // [pentaho/type/filter/isIn]{@link pentaho.type.filter.IsIn}

    /**
     * Gets the **configured instance constructor** of a type.
     *
     * For more information on the `typeRef` argument,
     * see [UTypeReference]{@link pentaho.type.spec.UTypeReference}.
     *
     * The modules of standard types and refinement facet _mixins_ are preloaded and
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
     *     * [pentaho/type/refinement]{@link pentaho.type.Refinement}
     *       * [pentaho/type/facets/Refinement]{@link pentaho.type.facets.RefinementFacet}
     *         * [pentaho/type/facets/DiscreteDomain]{@link pentaho.type.facets.DiscreteDomain}
     *         * [pentaho/type/facets/OrdinalDomain]{@link pentaho.type.facets.OrdinalDomain}
     *   * [pentaho/type/property]{@link pentaho.type.Property}
     *
     * For all of these, the `pentaho/type/` or `pentaho/type/facets/` prefix is optional
     * (when requested to a _context_; the AMD module system requires the full module identifiers to be specified).
     *
     * The filter types are also preloaded:
     *
     *   * [pentaho/type/filter/abstract]{@link pentaho.type.filter.Abstract}
     *     * [pentaho/type/filter/tree]{@link pentaho.type.filter.Tree}
     *       * [pentaho/type/filter/and]{@link pentaho.type.filter.And}
     *       * [pentaho/type/filter/or]{@link pentaho.type.filter.Or}
     *     * [pentaho/type/filter/not]{@link pentaho.type.filter.Not}
     *     * [pentaho/type/filter/property]{@link pentaho.type.filter.Property}
     *       * [pentaho/type/filter/isEqual]{@link pentaho.type.filter.IsEqual}
     *
     * If it is not known whether all non-standard types that are referenced by identifier have already been loaded,
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
     *   model.type.defaultViewClass.then(function(View) {
     *     var view = new View(document.getElementById("container"), model);
     *
     *     // ...
     *   });
     *
     * });
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
      return this._get(typeRef, O.getOwn(keyArgs, "defaultBase"), true);
    },

    /**
     * Binds the initial arguments of a function to
     * the instance constructors corresponding to
     * given type references.
     *
     * The specified type references are each resolved synchronously,
     * using [get]{@link pentaho.type.Context#get},
     * when the bound function is first called.
     * Thus, any resolve errors are only thrown then.
     *
     * If a fixed JavaScript context object is specified in `ctx`,
     * then `fun` gets bound to that object.
     * Otherwise, the JavaScript context object in which `fun` is called is dynamic (whichever the caller decides).
     *
     * @param {!Array.<pentaho.type.spec.UTypeReference>} typeRefs - An array of type references.
     * @param {function} fun - The function to bind.
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
     * see [UTypeReference]{@link pentaho.type.spec.UTypeReference}.
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
     *       model.type.defaultViewClass.then(function(View) {
     *         var view = new View(document.getElementById("container"), model);
     *
     *         // ...
     *       });
     *     });
     *
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
        return this._get(typeRef, O.getOwn(keyArgs, "defaultBase"), false);
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
     * the asynchronous method version, [getAllAsync]{@link pentaho.type.Context#getAsync},
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
     *   var context = new Context({application: "data-explorer-101"});
     *
     *   var ComponentModels = context.getAll("my/component", {isBrowsable: true});
     *   ComponentModels.forEach(function(ComponentModel) {
     *
     *     console.log("will display menu entry for: " + ComponentModel.type.label);
     *
     *   });
     *
     * });
     *
     * @param {string} [baseTypeId] The identifier of the base type. It defaults to `"pentaho/type/value"`.
     * @param {object} [keyArgs] Keyword arguments.
     * @param {?boolean} [keyArgs.isBrowsable=null] Indicates that only types with the specified
     *   [isBrowsable]{@link pentaho.type.Value.Type#isBrowsable} value are returned.
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
      if(!baseTypeId) baseTypeId = "pentaho/type/value";

      var predicate = F.predicate(keyArgs);

      var baseType  = this.get(baseTypeId).type;

      // Ensure that all registered types are loaded.
      // Throws if one isn't yet.
      service.getRegisteredIds(baseTypeId).forEach(function(id) { this.get(id); }, this);

      var byTypeUid = this._byTypeUid;

      var output = [];
      for(var uid in byTypeUid) {
        /* istanbul ignore else: almost impossible to test; browser dependent */
        if(O_hasOwn.call(byTypeUid, uid)) {
          var InstCtor = byTypeUid[uid];
          var type = InstCtor.type;
          if(type.isSubtypeOf(baseType) && (!predicate || predicate(type))) {
            output.push(InstCtor);
          }
        }
      }

      return output;
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
     * @param {string} [baseTypeId] The identifier of the base type. Defaults to `"pentaho/type/value"`.
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
        var instCtorsPromise = promiseUtil.require("pentaho/service!" + baseTypeId, localRequire)
          .then(function(factories) {
            return Promise.all(factories.map(me.getAsync, me));
          });

        return Promise.all([this.getAsync(baseTypeId), instCtorsPromise])
          .then(function(values) {
            var baseType  = values[0].type;
            var InstCtors = Object.keys(me._byTypeUid).map(function(typeUid) {
              return me._byTypeUid[typeUid];
            });

            return InstCtors.filter(function(InstCtor) {
              var type = InstCtor.type;
              return type.isSubtypeOf(baseType) && (!predicate || predicate(type));
            });
          });

      } catch(ex) {
        /* istanbul ignore next : really hard to test safeguard */
        return Promise.reject(ex);
      }
    },

    /**
     * Recursively collects the module ids of custom types used within a type specification.
     *
     * @param {pentaho.type.spec.UTypeReference} typeRef - A type reference.
     * @param {!Object.<string, string>} [customTypeIds] - An object where to add found type ids to.
     * @return {!Object.<string, string>} A possibly empty object whose own keys are type module ids.
     * @private
     * @friend pentaho.type.Type#createAsync
     */
    _collectTypeSpecTypeIds: function(typeSpec, customTypeIds) {
      if(!customTypeIds) customTypeIds = {};
      collectTypeIdsRecursive(typeSpec, customTypeIds, this._byTypeId);
      return customTypeIds;
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
      return this._txnCurrent;
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
      var txn = this._txnCurrent || new Transaction(this);
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

    get _scopeCurrent() {
      var scopes = this._txnScopes;
      return scopes.length ? scopes[scopes.length - 1] : null;
    },

    /**
     * Called by a scope to make it become the new ambient scope.
     *
     * @param {!pentaho.type.changes.AbstractTransactionScope} scopeEnter - The new ambient scope.
     *
     * @private
     *
     * @see pentaho.type.changes.AbstractTransactionScope
     */
    _scopeEnter: function(scopeEnter) {

      this._txnScopes.push(scopeEnter);

      this._setTransaction(scopeEnter.transaction);
    },

    /**
     * Called by a scope to stop being the current scope.
     *
     * @private
     *
     * @see pentaho.type.changes.AbstractTransactionScope#exit
     */
    _scopeExit: function() {
      this._txnScopes.pop();
      var scopeResume = this._scopeCurrent;

      this._setTransaction(scopeResume && scopeResume.transaction);
    },

    /**
     * Sets the new ambient transaction.
     *
     * @param {pentaho.type.changes.Transaction} txnNew - The new ambient transaction.
     *
     * @private
     */
    _setTransaction: function(txnNew) {
      var txnExit = this._txnCurrent;
      if(txnExit !== txnNew) {
        if(txnExit) txnExit._exitingAmbient();
        this._txnCurrent = txnNew;
        if(txnNew) txnNew._enteringAmbient();
      }
    },

    _transactionExit: function() {
      // Local-exit all scopes of the exiting transaction.
      // Null scopes or scopes of other txns remain non-exited.
      var txnCurrent = this._txnCurrent;
      this._txnCurrent = null;

      // Initial scope must be a transaction scope.
      var scopes = this._txnScopes;
      var i = scopes.length;
      while(i--) {
        var scope = scopes[i];
        if(scope.transaction === txnCurrent) {
          scopes.pop();
          scope._exitLocal();
          if(scope.isRoot)
            break;
        }
      }
    },

    /**
     * Increments and returns the next version number for use in the
     * [commit]{@link pentaho.type.changes.Transaction#_applyChanges} of a transaction.
     *
     * @return {number} The next version number.
     * @private
     */
    _takeNextVersion: function() {
      return ++this._nextVersion;
    },
    // endregion

    // region get support
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
    _get: function(typeRef, defaultBase, sync) {
      if(typeRef == null || typeRef === "")
        return this._error(error.argRequired("typeRef"), sync);

      /* eslint default-case: 0 */
      switch(typeof typeRef) {
        case "string": return this._getById(typeRef, sync);
        case "function": return this._getByFun(typeRef, sync);
        case "object": return Array.isArray(typeRef)
            ? this._getByListSpec(typeRef, sync)
            : this._getByObjectSpec(typeRef, defaultBase, sync);
      }

      return this._error(error.argInvalid("typeRef"), sync);
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
     * Checks if the identifier is already present in the `_byTypeId` map,
     * returning immediately (modulo sync) if it is.
     *
     * Otherwise, it requires the module, using either the sync or the async AMD form.
     *
     * If sync, AMD throws if a module with the given identifier is not yet loaded or is not defined.
     *
     * When the resulting module is returned by AMD,
     * its result is passed on, _recursively_, to `_get`,
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

      // Check if id is already present.
      var InstCtor = O.getOwn(this._byTypeId, id);
      if(!InstCtor) {
        // Resolve possible alias.
        var id2 = typeInfo.getIdOf(id);
        if(id2 && id2 !== id) InstCtor = O.getOwn(this._byTypeId, (id = id2));
      }

      if(InstCtor) return this._return(InstCtor, sync);

      /* jshint laxbreak:true*/
      return sync
          // `require` fails if a module with the id in the `typeSpec` var
          // is not already _loaded_.
          ? this._get(localRequire(id), null, true)
          : promiseUtil.require(id, localRequire).then(this._get.bind(this));
    },

    /**
     * Gets the instance constructor of a type, given a function that represents it.
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
     * @param {function} fun - A function.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor; while, when async, returns a promise for it.
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
      // make sure overrides don't confuse factory detection
      fun = fun.valueOf();

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
     * because it uses the types' [uid]{@link pentaho.type.Type#uid}
     * to identify types.
     *
     * A map of already configured types is kept in `_byTypeUid`.
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
     * @param {?number} [factoryUid] The factory unique identifier, when `Type` was created by one.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     *   returns the instance constructor; while, when async, returns a promise for it.
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

          var alias = type.alias;
          if(alias) {
            if(O_hasOwn.call(this._byTypeId, alias)) {
              return this._error(error.argInvalid("typeRef", "Duplicate type class alias."), sync);
            }
            this._byTypeId[alias] = InstCtor;
          }
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
     * Factory functions are tracked by using an unique identifier property (`_uid_`),
     * which is automatically assigned to them the first time they are given
     * to this function.
     *
     * A map of already evaluated factory functions,
     * indexed by their unique identifier, is kept in `_byFactoryUid`.
     *
     * If a factory has already been evaluated before,
     * the type it returned then is now returned immediately (modulo sync).
     *
     * Otherwise, the factory function is evaluated, being passed this context as argument.
     *
     * The returned instance constructor is passed to `_getType`,
     * for registration and configuration,
     * and then returned immediately (module sync).
     *
     * @param {!pentaho.type.Factory.<pentaho.type.Instance>} typeFactory - A factory of a type's instance constructor.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Instance>>|!Class.<pentaho.type.Instance>} When sync,
     * returns the instance constructor; while, when async, returns a promise for it.
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
        /* jshint validthis:true*/

        return O.using(new SpecificationScope(), function resolveSyncInContext(specScope) {
          /* jshint validthis:true*/

          // Note the switch to sync mode here, whatever the outer `sync` value.
          // Only the outermost _getByObjectSpec call will be async.
          // All following "reentries" will be sync.
          // So, it works to use the above ambient specification context to handle all contained temporary ids.

          // 1. Resolve the base type
          var BaseInstCtor = this._get(baseTypeSpec, null, /* sync: */true);

          // 2. Extend the base type
          var InstCtor = BaseInstCtor.extend({type: typeSpec});

          // 3. Register and configure the new type
          if(SpecificationContext.isIdTemporary(id)) {
            // Register also in the specification context, under the temporary id.
            specScope.specContext.add(InstCtor.type, id);
          }

          return this._getByInstCtor(InstCtor, /* sync: */true);
        }, this);
      };

      // When sync, it should be the case that every referenced id is already loaded,
      // or an error will be thrown when requiring these.
      if(sync) return resolveSync.call(this);

      // Collect the module ids of all custom types used within typeSpec.
      var customTypeIds = Object.keys(this._collectTypeSpecTypeIds(typeSpec));
      /* jshint laxbreak:true*/
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
    // endregion

    _return: function(value, sync) {
      return sync ? value : Promise.resolve(value);
    },

    _error: function(ex, sync) {
      if(sync) throw ex;
      return Promise.reject(ex);
    }
  }, /** @lends pentaho.type.Context */{

    /**
     * Gets the default type context of the Pentaho Type API.
     *
     * This type context instance is created with the Pentaho Platform's default context variables,
     * as given by {@link pentaho.context.main}.
     *
     * @type {!pentaho.type.Context}
     * @readOnly
     */
    get instance() {
      return _singleton || (_singleton = new Context());
    }
  });

  return Context;

  // region type registry
  function getFactoryUid(factory) {
    return factory._fuid_ || (factory._fuid_ = _nextFactoryUid++);
  }

  function collectTypeIdsRecursive(typeSpec, outIds, byTypeId) {
    if(!typeSpec) return;

    /* eslint default-case: 0 */
    switch(typeof typeSpec) {
      case "string":
        if(SpecificationContext.isIdTemporary(typeSpec)) return;

        // A standard type that is surely loaded?
        if(O_hasOwn.call(byTypeId, typeSpec)) return;

        outIds[typeSpec] = typeSpec;
        return;

      case "object":
        if(Array.isArray(typeSpec)) {
          // Shorthand list type notation
          // Example: [{props: { ...}}]
          if(typeSpec.length)
            collectTypeIdsRecursive(typeSpec[0], outIds, byTypeId);
          return;
        }

        collectTypeIdsGenericRecursive(typeSpec, outIds, byTypeId);
        return;
    }
  }

  function collectTypeIdsGenericRecursive(typeSpec, outIds, byTypeId) {
    // TODO: this method only supports standard types deserialization.
    //   Custom types with own type attributes would need special handling.
    //   Something like a two phase protocol?

        // {[base: "complex", ] [of: "..."] , [props: []]}
        collectTypeIdsRecursive(typeSpec.base, outIds, byTypeId);

        collectTypeIdsRecursive(typeSpec.of, outIds, byTypeId);

        var props = typeSpec.props;
        if(props) {
          if(Array.isArray(props))
            props.forEach(function(propSpec) {
              collectTypeIdsRecursive(propSpec && propSpec.type, outIds, byTypeId);
              collectTypeIdsRecursive(propSpec && propSpec.base, outIds, byTypeId);
            });
          else
            Object.keys(props).forEach(function(propName) {
              var propSpec = props[propName];
              collectTypeIdsRecursive(propSpec && propSpec.type, outIds, byTypeId);
              collectTypeIdsRecursive(propSpec && propSpec.base, outIds, byTypeId);
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

          collectTypeIdsRecursive(facetIdOrClass, outIds, byTypeId);
        }
      });
    }

    // These are either ids of AMD modules of type mixins or, directly, type mixins.
    var mixins = typeSpec.mixins;
    if(mixins) {
      if(!(Array.isArray(mixins))) mixins = [mixins];

      mixins.forEach(function(mixinIdOrClass) {
        if(typeof mixinIdOrClass === "string") {
          collectTypeIdsRecursive(mixinIdOrClass, outIds, byTypeId);
        }
      });
    }
  }
  // endregion
});
