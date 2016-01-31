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
  "../i18n!types",
  "./standard",
  "../lang/Base",
  "../util/promise",
  "../util/arg",
  "../util/error",
  "../util/object",
  "../util/fun"
], function(module, bundle, standard, Base, promise, arg, error, O, F) {

  "use strict";

  /*global SESSION_NAME:false, SESSION_LOCALE:false, active_theme:false*/

  var _nextUid = 1,

      _baseMid = module.id.replace(/Context$/, ""), // e.g.: "pentaho/type/"

      _baseFacetsMid = _baseMid + "facets/",

      // Default type, in a type specification.
      _defaultTypeMid = "string",

      // Default `base` type in a type specification.
      _defaultBaseTypeMid = "complex",

      // Standard types which can be assumed to already be loaded.
      _standardTypeMids = {},

      Item = standard.Item;

  Object.keys(standard).forEach(function(name) {
    if(name !== "facets") _standardTypeMids[_baseMid + name] = 1;
  });
  Object.keys(standard.facets).forEach(function(name) {
    _standardTypeMids[_baseFacetsMid + name] = 1;
  });

  /**
   * @name pentaho.type.Context
   * @class
   * @implements pentaho.type.IContext
   * @classDesc The `Context` class contains `Value` classes _configured_ for a particular _context_.
   *
   * @constructor
   * @description Creates a `Context` whose variables default to the Pentaho thin-client state variables.
   * @param {object} [spec] The context specification.
   * @param {string?} [spec.container] The id of the container application.
   * @param {string?} [spec.user] The id of the user. Defaults to the current user.
   * @param {string?} [spec.theme] The id of the theme. Defaults to the current theme.
   * @param {string?} [spec.locale] The id of the locale. Defaults to the current locale.
   */
  var Context = Base.extend(/** @lends pentaho.type.Context# */{

    constructor: function(spec) {
      this._container = arg.optional(spec, "container") || getCurrentContainer();
      this._user      = arg.optional(spec, "user")      || getCurrentUser();
      this._theme     = arg.optional(spec, "theme")     || getCurrentTheme();
      this._locale    = arg.optional(spec, "locale")    || getCurrentLocale();

      // factory uid : Class.<pentaho.type.Value>
      this._byFactoryUid = {};

      // type uid : Class.<pentaho.type.Value>
      this._byTypeUid = {};

      // non-anonymous types
      // type id : Class.<pentaho.type.Value>
      this._byTypeId = {};
    },

    //region context variables
    get container() {
      return this._container;
    },

    get user() {
      return this._user;
    },

    get theme() {
      return this._theme;
    },

    get locale() {
      return this._locale;
    },
    //endregion

    get: function(typeRef) {
      return this._get(typeRef, true);
    },

    getAsync: function(typeRef) {
      return this._get(typeRef, false);
    },

    /**
     * Obtains a promise for all type classes that inherit
     * from a base `Value` type, given its _id_.
     *
     * @param {string} [baseTypeId] The id of the base type. Defaults to `"pentaho/type/value"`.
     * @param {object} [ka] The keyword arguments.
     * @param {?boolean} [ka.browsable=null] Indicates that only types with the specified
     *   {@link pentaho.type.Value.Meta#browsable} are returned.
     *
     * @return {Promise.<Array.<!Class.<pentaho.item.Value>>>} The promise for the requested `Value` types.
     */
    getAllAsync: function(baseTypeId, ka) {
      if(!baseTypeId) baseTypeId = "pentaho/type/value";

      var predicate = F.predicate(ka);
      var me = this;
      return promise.require(["pentaho/service!" + baseTypeId])
          .then(function(factories) {
            return Promise.all(factories.map(me.getAsync, me));
          })
          .then(function(Mesas) {
            return predicate
                ? Mesas.filter(function(Mesa) { return predicate(Mesa.meta); })
                : Mesas;
          });
    },

    //region Value creation
    /*
     * typeReference = "typeId" | ITypeSpec | typeFactory | Meta | Mesa ...
     *
     * A. Value fragment specification with Inline Type Metadata
     *
     *   key is { _: ... }
     *
     *   {
     *     _: typeExpression,
     *
     *     // remaining properties are defined by each type
     *
     *     ...
     *   }
     *
     *   typeExpression ::=
     *
     *     "typeId" |
     *
     *     {}       | // type extend spec
     *
     *     [          // list type spec
     *
     *        "elementTypeId" |
     *        { element-type-spec }
     *     ]
     *
     * B. Within _list_ typed property
     *
     *   [ValueSpec]
     *
     * C. Within _element_ typed property
     *
     *   ValueSpec
     */

    /**
     * Creates a value given its specification.
     *
     * When the specification is {@link Nully}, `null` is returned.
     *
     * When the specification doesn't state its type, using inline metadata,
     * and `defaultType` is specified, it is used to create a value instance,
     * otherwise, if `defaultType` isn't specified, an error is thrown.
     *
     * When `baseType` is specified,
     * it is used to validate a type stated in inline metadata.
     *
     * It is assumed, but not validated,
     * that if both `defaultType` and `baseType` are specified,
     * the former is either equal to, or a sub-type of, the latter.
     *
     * @param {?any} valueSpec A value specification.
     * @param {?any} [defaultType] A type expression of the _non-abstract_ type
     *   to use for value specifications that don't specify a type.
     * @param {?any} [baseType] A type expression of the _expected_ base type.
     *
     * @return {?pentaho.type.Value} A `Value` or `null`.
     */
    create: function(valueSpec, defaultType, baseType) {
      if(valueSpec == null) return null;

      // TODO: Should load default type immediately? Or only if actually needed...
      var DefaultType = defaultType ? this.get(defaultType) : null;
      var BaseType    = baseType    ? this.get(baseType)    : null;

      if(BaseType && BaseType.meta.is(valueSpec)) return valueSpec;

      // If it is a plain Object, does it have the inline, metadata property, "_"?
      var Type, inlineTypeMetadata;
      if(typeof valueSpec === "object" &&
         valueSpec.constructor === Object &&
         (inlineTypeMetadata = valueSpec._) != null) {

        Type = this.get(inlineTypeMetadata);

        if(BaseType && !(Type.prototype instanceof BaseType))
          throw error.operInvalid(
              bundle.format(bundle.structured.errors.context.valueNotOfExpectedBaseType, [
                BaseType.meta.id || "anonymous"
              ]));

        delete valueSpec._;
      } else if(!(Type = DefaultType)) {
        throw error.operInvalid(bundle.structured.errors.context.cannotCreateValueOfUnknownType);
      }// else assume DefaultType extends BaseType.

      return new Type(valueSpec);
    },
    //endregion

    _get: function(typeRef, sync) {
      // Default property type is "string".
      if(!typeRef) typeRef = _defaultTypeMid;

      switch(typeof typeRef) {
        case "string":   return this._getById(typeRef, sync);
        case "function": return this._getByFun(typeRef, sync);
        case "object":   return Array.isArray(typeRef)
            ? this._getByListSpec(typeRef, sync)
            : this._getByObjectSpec(typeRef, sync);
      }

      throw error.argInvalid("typeRef");
    },

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

    _getByFun: function(fun, sync) {
      var proto = fun.prototype;

      if(proto instanceof Item     ) return this._getByType(fun, sync);
      if(proto instanceof Item.Meta) return this._getByType(fun.Mesa, sync);

      // Assume it's a factory function.
      return this._getByFactory(fun, sync);
    },

    _getByType: function(Type, sync) {
      // Don't use Value.meta, to not invoke the Meta constructor before configuration is performed, below.
      var meta = Type.Meta.prototype;
      if(meta.context !== this)
        throw error.argInvalid("typeRef", "Type is from a different context.");

      // Check if already present, by uid.
      var TypeExisting = O.getOwn(this._byTypeUid, meta.uid);
      if(!TypeExisting) {
        // Not present yet.
        var id = meta.id;
        if(id) {
          var config = this._getConfig(id);
          if(config) Type.Meta.implement(config);

          this._byTypeId[id] = Type;
        }

        this._byTypeUid[meta.uid] = Type;

      } else if(Type !== TypeExisting) {
        throw error.argInvalid("typeRef", "Duplicate type class uid.");
      }

      return this._return(Type, sync);
    },

    _getByFactory: function(typeFactory, sync) {
      var factoryUid = getFactoryUid(typeFactory),
          Type = O.getOwn(this._byFactoryUid, factoryUid);

      if(Type) return this._return(Type, sync);

      Type = typeFactory(this);

      if(!F.is(Type) || !(Type.prototype instanceof Item))
        throw error.operInvalid("Type factory must return a sub-class of 'pentaho/type/value'.");

      // Errors are thrown synchronously.
      var result = this._getByType(Type, sync);

      this._byFactoryUid[factoryUid] = Type;

      return result;
    },

    // Inline type spec: {[base: "complex", ] ... }
    _getByObjectSpec: function(typeSpec, sync) {

      if(typeSpec instanceof Item     ) return this._getByType(typeSpec.constructor, sync);
      if(typeSpec instanceof Item.Meta) return this._getByType(typeSpec.constructor.Mesa, sync);

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
    return factory.uid || (factory.uid = _nextUid++);
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
    return typeSpec;
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
