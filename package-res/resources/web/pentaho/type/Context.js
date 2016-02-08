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
  "module",
  "./Item",
  "../i18n!types",
  "./standard",
  "../lang/Base",
  "../util/promise",
  "../util/arg",
  "../util/error",
  "../util/object",
  "../util/fun"
], function(module, Item, bundle, standard, Base, promise, arg, error, O, F) {

  "use strict";

  /*global SESSION_NAME:false, SESSION_LOCALE:false, active_theme:false, Promise:false */

  var _nextUid = 1,

      _baseMid = module.id.replace(/Context$/, ""), // e.g.: "pentaho/type/"

      _baseFacetsMid = _baseMid + "facets/",

      // Default type, in a type specification.
      _defaultTypeMid = "string",

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
   * @classDesc A `Context` object holds instance constructors of **configured** _Value_ types.
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
   * The Pentaho Metadata Model embraces this concept by defining most types -
   * the [Value]{@link pentaho.type.Value} types - as
   * _type factories_ that take a context object as their argument.
   *
   * The instance constructors of _Value_ types
   * **must** be obtained from a context object,
   * using one of the provided methods:
   * [get]{@link pentaho.type.Context#get},
   * [getAsync]{@link pentaho.type.Context#getAsync} or
   * [getAllAsync]{@link pentaho.type.Context#getAllAsync},
   * so that these are configured before being used.
   * This applies whether an instance constructor is used for creating an instance or to derive a subtype.
   *
   * The following properties are specified at construction time and
   * constitute the environmental information held by a context:
   * [container]{@link pentaho.type.Context#container},
   * [user]{@link pentaho.type.Context#user},
   * [theme]{@link pentaho.type.Context#theme} and
   * [locale]{@link pentaho.type.Context#locale}.
   * Their values determine (or "select") the _type configuration rules_ that
   * apply and are used to configure the constructors provided by the context.
   *
   * To better understand how a context provides configured types,
   * assume that an non-anonymous type,
   * with the [id]{@link pentaho.type.Value.Meta#id} `"my/own/type"`,
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
   *    store(context, InstanceCtor.meta.id, InstanceCtor);
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
   * @description Creates a `Context` whose variables default to the Pentaho thin-client state variables.
   * @param {object} [keyArgs] Keyword arguments.
   * @param {string?} [keyArgs.container] The id of the container application.
   * @param {string?} [keyArgs.user] The id of the user. Defaults to the current user.
   * @param {string?} [keyArgs.theme] The id of the theme. Defaults to the current theme.
   * @param {string?} [keyArgs.locale] The id of the locale. Defaults to the current locale.
   */
  var Context = Base.extend(/** @lends pentaho.type.Context# */{

    constructor: function(keyArgs) {
      this._container = arg.optional(keyArgs, "container") || getCurrentContainer();
      this._user      = arg.optional(keyArgs, "user")      || getCurrentUser();
      this._theme     = arg.optional(keyArgs, "theme")     || getCurrentTheme();
      this._locale    = arg.optional(keyArgs, "locale")    || getCurrentLocale();

      // factory uid : Class.<pentaho.type.Value>
      this._byFactoryUid = {};

      // type uid : Class.<pentaho.type.Value>
      this._byTypeUid = {};

      // non-anonymous types
      // type id : Class.<pentaho.type.Value>
      this._byTypeId = {};

      // Register standard types
      // This mostly helps tests being able to require.undef(.) these at any time
      //  and not cause random failures for assuming all standard types were loaded.
      Object.keys(standard).forEach(function(lid) {
        if(lid !== "facets") this._getByFactory(standard[lid], /*sync:*/true);
      }, this);
    },

    //region context variables

    /**
     * Gets the id of the context's container application, if any.
     *
     * @type {?string}
     * @readonly
     */
    get container() {
      return this._container;
    },

    /**
     * Gets the id of the context's user, if any.
     *
     * @type {?string}
     * @readonly
     */
    get user() {
      return this._user;
    },

    /**
     * Gets the id of the context's theme, if any.
     *
     * @type {?string}
     * @readonly
     */
    get theme() {
      return this._theme;
    },

    /**
     * Gets the id of the context's locale, if any.
     *
     * @type {?string}
     * @readonly
     */
    get locale() {
      return this._locale;
    },
    //endregion

    /**
     * Gets the **configured instance constructor** of a value type.
     *
     * For more information on the `typeRef` argument,
     * please see [UTypeReference]{@link pentaho.type.spec.UTypeReference}.
     *
     * The modules of standard types and refinement facet _mixins_ are preloaded and
     * can be requested _synchronously_. These are:
     *
     * * [pentaho/type/value]{@link pentaho.type.Value}
     *   * [pentaho/type/list]{@link pentaho.type.List}
     *   * [pentaho/type/element]{@link pentaho.type.Element}
     *     * [pentaho/type/complex]{@link pentaho.type.Complex}
     *     * [pentaho/type/simple]{@link pentaho.type.Simple}
     *       * [pentaho/type/string]{@link pentaho.type.String}
     *       * [pentaho/type/number]{@link pentaho.type.Number}
     *       * [pentaho/type/date]{@link pentaho.type.Date}
     *       * [pentaho/type/boolean]{@link pentaho.type.Boolean}
     *       * [pentaho/type/function]{@link pentaho.type.Function}
     *       * [pentaho/type/object]{@link pentaho.type.Object}
     *   * [pentaho/type/refinement]{@link pentaho.type.Refinement}
     *     * [pentaho/type/facets/Refinement]{@link pentaho.type.facets.RefinementFacet}
     *       * [pentaho/type/facets/DiscreteDomain]{@link pentaho.type.facets.DiscreteDomain}
     *       * [pentaho/type/facets/OrdinalDomain]{@link pentaho.type.facets.OrdinalDomain}
     *
     * For all of these, the `pentaho/type/` or `pentaho/type/facets/` prefix is optional
     * (when requested to a _context_; the AMD module system requires the full module ids to be specified).
     *
     * If is not known whether all non-standard types that are referenced by id have already been loaded,
     * the asynchronous method version, [getAsync]{@link pentaho.type.Context#getAsync},
     * should be used instead.
     *
     * An error is thrown when:
     *
     * * the argument `typeRef` is of an unsupported JavaScript type: not a string, function, array or object
     *
     * * the argument `typeRef` is a value type's constructor (e.g. [Value.Meta]{@link pentaho.type.Value.Meta})
     *
     * * the argument `typeRef` is a value instance
     *
     * * the id of a type is not defined as a module in the AMD module system
     *   (specified directly in `typeRef`, or present in an generic type specification)
     *
     * * the id of a **non-standard type** is from a module that the AMD module system hasn't loaded yet
     *   (specified directly in `typeRef`, or present in an generic type specification)
     *
     * * the value returned by a factory function is not a instance constructor of a subtype of _Value_
     *   (specified directly in `typeRef`, or obtained indirectly by loading a type's module given its id)
     *
     * * an instance constructor is from a different [context]{@link pentaho.type.Value.Meta#context}
     *   (directly specified in `typeRef`,
     *    or obtained indirectly by loading a type's module given its id, or from a factory function)
     *
     * @example
     * <caption>
     *   Getting a <b>configured</b> type instance constructor <b>synchronously</b> for a specific container.
     * </caption>
     *
     * require(["pentaho/type/Context", "my/viz/chord"], function(Context) {
     *
     *   var context = new Context({container: "data-explorer-101"})
     *
     *   // Request synchronously cause it was already loaded in the above `require`
     *   var VizChordModel = context.get("my/viz/chord");
     *
     *   var model = new VizChordModel({outerRadius: 200});
     *
     *   // Render the model using the default view
     *   model.meta.viewClass.then(function(View) {
     *     var view = new View(document.getElementById("container"), model);
     *
     *     // ...
     *   });
     *
     * });
     *
     * @param {?pentaho.type.spec.UTypeReference} [typeRef] A type reference.
     * Defaults to type `"pentaho/type/string"`.
     *
     * @return {!Class.<pentaho.type.Value>} The instance constructor.
     *
     * @see pentaho.type.Context#getAsync
     */
    get: function(typeRef) {
      return this._get(typeRef, true);
    },

    /**
     * Gets, asynchronously, the **configured instance constructor** instance constructor of a type.
     *
     * For more information on the `typeRef` argument,
     * please see [UTypeReference]{@link pentaho.type.spec.UTypeReference}.
     *
     * This method can be used even if a generic type metadata specification references
     * non-standard types whose modules have not yet been loaded by the AMD module system.
     *
     * An error is thrown when:
     *
     * * the argument `typeRef` is of an unsupported JavaScript type: not a string, function, array or object
     *
     * * the argument `typeRef` is a value type's constructor (e.g. [Value.Meta]{@link pentaho.type.Value.Meta})
     *
     * * the argument `typeRef` is a value instance.
     *
     * The returned promise gets rejected with an error when:
     *
     * * the id of a type is not defined as a module in the AMD module system
     *   (specified directly in `typeRef`, or present in an generic type specification)
     *
     * * the value returned by a factory function is not a instance constructor of a subtype of _Value_
     *   (specified directly in `typeRef`, or obtained indirectly by loading a type's module given its id)
     *
     * * an instance constructor is from a different [context]{@link pentaho.type.Value.Meta#context}
     *   (directly specified in `typeRef`,
     *    or obtained indirectly by loading a type's module given its id, or from a factory function).
     *
     * @example
     * <caption>
     *   Getting a <b>configured</b> type instance constructor <b>asynchronously</b> for a specific container.
     * </caption>
     *
     * require(["pentaho/type/Context"], function(Context) {
     *
     *   var context = new Context({container: "data-explorer-101"})
     *
     *   context.getAsync("my/viz/chord")
     *     .then(function(VizChordModel) {
     *
     *       var model = new VizChordModel({outerRadius: 200});
     *
     *       // Render the model using the default view
     *       model.meta.viewClass.then(function(View) {
     *         var view = new View(document.getElementById("container"), model);
     *
     *         // ...
     *       });
     *     });
     *
     * });
     *
     * @param {?pentaho.type.spec.UTypeReference} [typeRef] A type reference.
     * Defaults to type `"pentaho/type/string"`.
     *
     * @return {!Promise.<!Class.<pentaho.type.Value>>} A promise for the instance constructor.
     *
     * @see pentaho.type.Context#get
     */
    getAsync: function(typeRef) {
      return this._get(typeRef, false);
    },

    /**
     * Gets a promise for the **configured instance constructors** of
     * all of the types that are subtypes of a given base type.
     *
     * @example
     * <caption>
     *   Getting all <code>"my/component"</code> sub-types browsable
     *   in the container <code>"data-explorer-101"</code>.
     * </caption>
     *
     * require(["pentaho/type/Context"], function(Context) {
     *
     *   var context = new Context({container: "data-explorer-101"});
     *
     *   context.getAllAsync("my/component", {browsable: true})
     *     .then(function(ComponentModels) {
     *
     *       ComponentModels.forEach(function(ComponentModel) {
     *
     *         console.log("will display menu entry for: " + ComponentModel.meta.label);
     *
     *       });
     *     });
     *
     * });
     *
     * @param {string} [baseTypeId] The id of the base type. Defaults to `"pentaho/type/value"`.
     * @param {object} [keyArgs] Keyword arguments.
     * @param {?boolean} [keyArgs.browsable=null] Indicates that only types with the specified
     *   [browsable]{@link pentaho.type.Value.Meta#browsable} value are returned.
     *
     * @return {Promise.<Array.<!Class.<pentaho.type.Value>>>} A promise for instance classes.
     *
     * @see pentaho.type.Context#get
     * @see pentaho.type.Context#getAsync
     */
    getAllAsync: function(baseTypeId, keyArgs) {
      if(!baseTypeId) baseTypeId = "pentaho/type/value";

      var predicate = F.predicate(keyArgs);
      var me = this;
      return promise.require(["pentaho/service!" + baseTypeId])
          .then(function(factories) {
            return Promise.all(factories.map(me.getAsync, me));
          })
          .then(function(InstCtors) {
            return predicate
                ? InstCtors.filter(function(InstCtor) { return predicate(InstCtor.meta); })
                : InstCtors;
          });
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
     * @param {?pentaho.type.spec.UTypeReference} [typeRef] A type reference.
     * Defaults to type `"pentaho/type/string"`.
     *
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     * @return {!Promise.<!Class.<pentaho.type.Value>>|!Class.<pentaho.type.Value>} When sync,
     *   returns the instance constructor, while, when async, returns a promise for it.
     *
     * @private
     * @ignore
     */
    _get: function(typeRef, sync) {
      // Default property type is "string".
      if(!typeRef) typeRef = _defaultTypeMid;

      switch(typeof typeRef) {
        case "string":   return this._getById (typeRef, sync);
        case "function": return this._getByFun(typeRef, sync);
        case "object":   return Array.isArray(typeRef)
            ? this._getByListSpec(typeRef, sync)
            : this._getByObjectSpec(typeRef, sync);
      }

      throw error.argInvalid("typeRef");
    },

    /**
     * Gets the instance constructor of a type given its id.
     *
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
     * @param {string} id A type reference.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Value>>|!Class.<pentaho.type.Value>} When sync,
     *   returns the instance constructor, while, when async, returns a promise for it.
     *
     * @private
     * @ignore
     */
    _getById: function(id, sync) {
      id = toAbsTypeId(id);

      // Check if id is already present.
      var Type = O.getOwn(this._byTypeId, id);
      if(Type) return this._return(Type, sync);

      return sync
          // `require` fails if a module with the id in the `typeSpec` var
          // is not already _loaded_.
          ? this._get(require(id), true)
          : promise.require([id]).then(this._get.bind(this));
    },

    /**
     * Gets the instance constructor of a type given a function that represents it.
     *
     * The function can be:
     *
     * 1. An instance constructor (Mesa)
     * 2. A type constructor (Meta)
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
     * @return {!Promise.<!Class.<pentaho.type.Value>>|!Class.<pentaho.type.Value>} When sync,
     *   returns the instance constructor, while, when async, returns a promise for it.
     *
     * @private
     * @ignore
     */
    _getByFun: function(fun, sync) {
      var proto = fun.prototype;

      if(proto instanceof Item     ) return this._getByType(fun, sync);
      if(proto instanceof Item.Meta) throw error.argInvalid("typeRef", "Type constructor is not supported.");

      // Assume it's a factory function.
      return this._getByFactory(fun, sync);
    },

    /**
     * Gets a configured instance constructor of a type,
     * given the instance constructor of that type.
     *
     * An error is thrown if, for the given instance constructor,
     * {@link pentaho.type.Value.Meta#context} is not `this` -
     * the instance constructor must have been created by a factory called with this context,
     * and have captured the context as the value of its `context` property,
     * or, have been extended from a type that had this context.
     *
     * This method works for anonymous types as well -
     * that have no [id]{@link pentaho.type.Value.Meta#id} -
     * cause it uses the types' [uid]{@link pentaho.type.Value.Meta#uid}
     * to identify types.
     *
     * A map of already configured types is kept in `_byTypeUid`.
     *
     * An error is thrown in the pathological case of a different instance constructor,
     * with the same `uid` is already registered.
     *
     * If the type not yet in the map, and it is not anonymous,
     * configuration is requested for it, and, if any exists,
     * it is applied. Configuration may create a sub-classed instance constructor.
     *
     * The configured type is stored by _uid_ and _id_ (if not anonymous)
     * and `factoryUid` (when specified) in corresponding maps,
     * and is returned immediately (modulo sync).
     *
     * @param {!Class.<pentaho.type.Value>} Type An instance constructor.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     * @param {?number} [factoryUid] The factory unique id, when `Type` was created by one.
     *
     * @return {!Promise.<!Class.<pentaho.type.Value>>|!Class.<pentaho.type.Value>} When sync,
     *   returns the instance constructor, while, when async, returns a promise for it.
     *
     * @private
     * @ignore
     */
    _getByType: function(Type, sync, factoryUid) {
      var meta = Type.meta;
      if(meta.context !== this)
        throw error.argInvalid("typeRef", "Type is from a different context.");

      // Check if already present, by uid.
      var TypeExisting = O.getOwn(this._byTypeUid, meta.uid);
      if(!TypeExisting) {
        // Not present yet.
        var id = meta.id;
        if(id) {
          // TODO: configuration may need to subclass Type
          // TODO: configuration is Meta only?
          var config = this._getConfig(id);
          if(config) meta.constructor.implement(config);

          this._byTypeId[id] = Type;
        }

        this._byTypeUid[meta.uid] = Type;

      } else if(Type !== TypeExisting) {
        // Pathological case, only possible if the result of an exploit.
        throw error.argInvalid("typeRef", "Duplicate type class uid.");
      }

      if(factoryUid != null) {
        this._byFactoryUid[factoryUid] = Type;
      }

      return this._return(Type, sync);
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
     * An error is thrown if the factory function does not return an instance constructor
     * derived from `Value`.
     *
     * The returned instance constructor is passed to `_getType`,
     * for registration and configuration,
     * and then returned immediately (module sync).
     *
     * @param {!pentaho.type.Factory.<pentaho.type.Value>} typeFactory A factory of a type's instance constructor.
     * @param {boolean} [sync=false] Whether to perform a synchronous get.
     *
     * @return {!Promise.<!Class.<pentaho.type.Value>>|!Class.<pentaho.type.Value>} When sync,
     *   returns the instance constructor, while, when async, returns a promise for it.
     *
     * @private
     * @ignore
     */
    _getByFactory: function(typeFactory, sync) {
      var factoryUid = getFactoryUid(typeFactory);

      var Type = O.getOwn(this._byFactoryUid, factoryUid);
      if(Type)
        return this._return(Type, sync);

      Type = typeFactory(this);
      if(!F.is(Type) || !(Type.prototype instanceof Item))
        throw error.operInvalid("Type factory must return a sub-class of 'pentaho/type/Item'.");

      return this._getByType(Type, sync, factoryUid);
    },

    // Inline type spec: {[base: "complex", ] ... }
    _getByObjectSpec: function(typeSpec, sync) {
      if(typeSpec instanceof Item.Meta) return this._getByType(typeSpec.mesa.constructor, sync);
      if(typeSpec instanceof Item) throw error.argInvalid("typeRef", "Value instance is not supported.");

      var baseTypeSpec = typeSpec.base || _defaultBaseTypeMid,
          resolveSync = (function() {
              var BaseType = this._get(baseTypeSpec, /*sync:*/true),
                  Type = BaseType.extend({meta: typeSpec});
              return this._getByType(Type, /*sync:*/true);
            }).bind(this);

      // When sync, it should be the case that every referenced id is already loaded,
      // or an error will be thrown when requiring these.
      if(sync) return resolveSync();

      // Collect the module ids of all custom types used within typeSpec.
      var customTypeIds = collectTypeIds(typeSpec);
      return customTypeIds.length
          // Require them all and only then invoke the synchronous BaseMeta.extend method.
          ? promise.require(customTypeIds).then(resolveSync)
          // All types are standard and can be assumed to be already loaded.
          // However, we should behave asynchronously as requested.
          : promise.call(resolveSync);
    },

    /*
     * Example: a list of complex type elements
     *
     *  [{props: { ...}}]
     *  <=>
     *  {base: "list", of: {props: { ...}}}
     */
    _getByListSpec: function(typeSpec, sync) {
      if(typeSpec.length > 1)
        throw error.argInvalid("typeSpec", "List type specification should have at most one child element type spec.");

      // Expand compact list type spec syntax and delegate to the generic handler.
      var elemTypeSpec = (typeSpec.length && typeSpec[0]) || _defaultTypeMid;
      return this._getByObjectSpec({base: "list", of: elemTypeSpec}, sync);
    },

    _getConfig: function(id) {
      // TODO: link to configuration service
      return null;
    },
    //endregion

    _return: function(Type, sync) {
      return sync ? Type : Promise.resolve(Type);
    }
  });

  return Context;

  function getCurrentContainer() {
    // TODO: should try to find webcontext.js in scripts collection?
    return null;
  }

  function getCurrentUser() {
    return typeof SESSION_NAME !== "undefined" ? SESSION_NAME : null;
  }

  function getCurrentTheme() {
    return typeof active_theme !== "undefined" ? active_theme : null;
  }

  function getCurrentLocale() {
    return typeof SESSION_LOCALE !== "undefined" ? SESSION_LOCALE : null;
  }

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

        if(typeSpec.props) typeSpec.props.forEach(function(propSpec) {
          collectTypeIdsRecursive(propSpec && propSpec.type, outIds);
        });

        // These are not ids of types but only of mixin AMD modules.
        if(typeSpec.facets) typeSpec.facets.forEach(function(facetIdOrClass) {
          if(typeof facetIdOrClass === "string") {
            if(facetIdOrClass.indexOf("/") < 0)
              facetIdOrClass = _baseFacetsMid + facetIdOrClass;

            collectTypeIdsRecursive(facetIdOrClass, outIds);
          }
        });
        return;
    }
  }
});
