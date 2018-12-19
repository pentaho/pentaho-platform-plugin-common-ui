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
  "pentaho/lang/Base",
  "../SpecificationScope",
  "../SpecificationContext",
  "./SpecificationProcessor",
  "pentaho/module/metaService",
  "pentaho/module/util",
  "pentaho/util/object",
  "pentaho/util/promise",
  "pentaho/util/error",
  "pentaho/util/fun"
], function(localRequire, module, Base, SpecificationScope, SpecificationContext, SpecificationProcessor,
            moduleMetaService, moduleUtil, O, promiseUtil, error, F) {

  "use strict";

  /* eslint dot-notation: 0 */

  var TYPE_NAMESPACE = "pentaho/type/";
  var TYPE_DEFAULT_BASE = TYPE_NAMESPACE + "Complex";
  var TYPE_INSTANCE = TYPE_NAMESPACE + "Instance";
  var TYPE_STRING = TYPE_NAMESPACE + "String";
  var TYPE_BOOLEAN = TYPE_NAMESPACE + "Boolean";
  var TYPE_NUMBER = TYPE_NAMESPACE + "Number";
  var TYPE_LIST = TYPE_NAMESPACE + "List";

  var __classCache = Object.create(null);
  var __specProcessor = new SpecificationProcessor();

  /**
   * @classDesc The `ILoader` implementation.
   *
   * @name Loader
   * @memberOf pentaho.type.impl
   *
   * @class
   * @extends pentaho.lang.Base
   * @implements {pentaho.type.ILoader}
   * @private
   *
   * @constructor
   * @description Creates a loader instance.
   */

  var Loader = Base.extend(module.id, /** @lends pentaho.type.impl.Loader# */ {
    /** @inheritDoc */
    resolveType: function(typeRef, keyArgs) {
      return Loader.__resolveTypeSync(typeRef, O.getOwn(keyArgs, "defaultBase"));
    },

    /** @inheritDoc */
    resolveTypeAsync: function(typeRef, keyArgs) {
      return Loader.__resolveTypeAsync(typeRef, O.getOwn(keyArgs, "defaultBase"));
    },

    /** @inheritDoc */
    resolveInstance: function(instSpec, instKeyArgs, baseType) {
      return Loader.__resolveInstanceSync(instSpec, instKeyArgs, baseType);
    },

    /** @inheritDoc */
    resolveInstanceAsync: function(instSpec, instKeyArgs, baseType) {

      return __specProcessor.loadInstanceDependenciesAsync(instSpec)
        .then(function() {
          return Loader.__resolveInstanceSync(instSpec, instKeyArgs, baseType);
        });
    }
  }, {
    // Published for testing purposes

    // region Type support
    __resolveTypeSync: function(typeRef, defaultBase) {
      return __resolveTypeCore(typeRef, defaultBase, true);
    },

    __resolveTypeAsync: function(typeRef, defaultBase) {
      try {
        return __resolveTypeCore(typeRef, defaultBase, false);
      } catch(ex) {
        return Promise.reject(ex);
      }
    },
    // endregion

    // region Instance support
    __resolveInstanceSync: function(instSpec, instKeyArgs, baseType) {

      var InstCtor = null;
      var typeRef;

      // 1. Type in inline type property {_: "type"} ?
      if(instSpec != null &&
         typeof instSpec === "object" &&
         instSpec.constructor === Object &&
         (typeRef = instSpec._)) {

        InstCtor = Loader.__resolveTypeSync(typeRef);

        var type = InstCtor.type;
        if(baseType != null) {
          baseType.__assertSubtype(type);
        }

        if(type.isAbstract) {
          type.__throwAbstractType();
        }
      } else if(baseType == null || baseType.isAbstract) {
        // 2. Default the type from one of String, Number, or Boolean,
        //    if one of these is the type of `instRef` and baseType is respected.

        /* eslint default-case: 0 */
        switch(typeof instSpec) {
          case "string": InstCtor = __getModuleCached(TYPE_STRING); break;
          case "number": InstCtor = __getModuleCached(TYPE_NUMBER); break;
          case "boolean": InstCtor = __getModuleCached(TYPE_BOOLEAN); break;
        }

        // Must still respect the base type.
        if(InstCtor !== null && baseType != null && !InstCtor.type.isSubtypeOf(baseType)) {
          InstCtor = null;
        }

        if(InstCtor === null) {
          if(baseType == null) {
            throw error.operInvalid("Cannot create instance of unspecified type.");
          }

          baseType.__throwAbstractType();
        }
        // else These types are never abstract

      } else {
        InstCtor = baseType.instance.constructor;
      }

      // assert InstCtor

      return new InstCtor(instSpec, instKeyArgs);
    }
    // endregion
  });

  return Loader;

  /**
   * Gets a module's value given its identifier.
   *
   * Some modules such as Instance, String, Boolean and Number must be obtained lazily,
   * to break the cyclic dependency.
   * The `Loader` must be used from a context where `Instance` has been loaded.
   *
   * @param {string} id - The identifier of the module.
   * @memberOf pentaho.type.impl.Loader~
   *
   * @return {Class.<pentaho.type.Instance>} An instance constructor.
   *
   * @private
   */
  function __getModuleCached(id) {
    if(O.hasOwn(__classCache, id)) {
      return __classCache[id];
    }

    return (__classCache[id] = localRequire(id));
  }

  /**
   * Resolves a type reference.
   *
   * Internal get method shared by `resolveType` and `resolveTypeAsync`.
   * Uses `sync` argument to distinguish between the two modes.
   *
   * Main dispatcher according to the type and class of `typeRef`:
   * string, function or array or object.
   *
   * @memberOf pentaho.type.impl.Loader~
   *
   * @param {pentaho.type.spec.TypeReference} typeRef - A type reference.
   * @param {pentaho.type.spec.TypeReference} defaultBase - A reference to the default base type.
   * @param {boolean} [sync=false] Whether to perform a synchronous get.
   *
   * @return {Promise.<Class.<pentaho.type.Instance>>|Class.<pentaho.type.Instance>} When sync,
   *   returns the instance constructor; while, when async, returns a promise for it.
   *
   * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is of an unsupported JavaScript type:
   * not a string, function, array or object.
   *
   * @private
   */
  function __resolveTypeCore(typeRef, defaultBase, sync) {
    if(typeRef == null || typeRef === "") {
      return promiseUtil.error(error.argRequired("typeRef"), sync);
    }

    /* eslint default-case: 0 */
    switch(typeof typeRef) {
      case "string": return __resolveTypeById(typeRef, sync);
      case "function": return __resolveTypeByFun(typeRef, sync);
      case "object": return Array.isArray(typeRef)
        ? __resolveTypeByListSpec(typeRef, sync)
        : __resolveTypeByObject(typeRef, defaultBase, sync);
    }

    return promiseUtil.error(error.argInvalid("typeRef"), sync);
  }

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
   * its result is passed on, _recursively_, to `__resolveTypeCore`,
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
   * @memberOf pentaho.type.impl.Loader~
   *
   * @param {string} id - The identifier of a type. It can be a temporary or permanent identifier.
   * In the latter case, it can be relative or absolute.
   *
   * @param {boolean} [sync=false] Whether to perform a synchronous get.
   *
   * @return {Promise.<Class.<pentaho.type.Instance>>|Class.<pentaho.type.Instance>} When sync,
   *   returns the instance constructor; while, when async, returns a promise for it.
   *
   * @private
   */
  function __resolveTypeById(id, sync) {

    if(SpecificationContext.isIdTemporary(id)) {
      var currentSpecContext = SpecificationContext.current;
      if(!currentSpecContext) {
        return promiseUtil.error(
          error.argInvalid("typeRef", "Temporary id '" + id + "' occurs outside of a generic type specification."),
          sync);
      }

      // Id must exist in the specification context, or it's invalid.
      var type = currentSpecContext.get(id);
      if(!type) {
        return promiseUtil.error(
          error.argInvalid("typeRef", "Temporary id '" + id + "' is not defined."),
          sync);
      }

      return promiseUtil["return"](type.instance.constructor, sync);
    }

    id = moduleMetaService.getId(id) || id;

    // Load.

    if(sync) {
      return __validateLoadedType(id, sync, localRequire(id));
    }

    return promiseUtil.require(id, localRequire).then(__validateLoadedType.bind(null, id, sync));
  }

  /**
   * Validates that the given instance constructor is in fact one.
   *
   * @param {string} id - The module identifier from which the instance constructor was loaded.
   * @param {boolean} sync Whether to perform a synchronous get.
   * @param {*} InstCtor - The module 's value.
   *
   * @return {Promise.<Class.<pentaho.type.Instance>>|Class.<pentaho.type.Instance>} When sync,
   *   returns the instance constructor; while, when async, returns a promise for it.
   *
   * @throws {pentaho.lang.ArgumentInvalidError} When `InstCtor` is not an `Instance` constructor.
   *
   * @memberOf pentaho.type.impl.Loader~
   * @private
   */
  function __validateLoadedType(id, sync, InstCtor) {

    if(!F.is(InstCtor) || !__isSubtypeOfInstanceCtor(InstCtor)) {
      return promiseUtil.error(
        error.operInvalid("typeRef", "The value of module '" + id + "' is not a '" + TYPE_INSTANCE + "' constructor."),
        sync);
    }

    return promiseUtil["return"](InstCtor, sync);
  }

  /**
   * Validates that the given function is the instance constructor of a type,
   * and returns it or rejects it.
   *
   * @memberOf pentaho.type.impl.Loader~
   *
   * @param {function} fun - A function.
   * @param {boolean} [sync=false] Whether to perform a synchronous get.
   *
   * @return {Promise.<Class.<pentaho.type.Instance>>|Class.<pentaho.type.Instance>} When sync,
   *   returns the instance constructor; while, when async, returns a promise for it.
   *
   * @throws {pentaho.lang.ArgumentInvalidError} When `fun` is not an `Instance` constructor.
   *
   * @private
   */
  function __resolveTypeByFun(fun, sync) {

    if(!__isSubtypeOfInstanceCtor(fun)) {
      return promiseUtil.error(
        error.argInvalid("typeRef", "Function is not a '" + TYPE_INSTANCE + "' constructor."),
        sync);
    }

    return promiseUtil["return"](fun, sync);
  }

  /**
   * Gets a value that indicates if a constructor is of a subtype of `Instance`.
   *
   * @param {function} OtherCtor - A constructor.
   *
   * @return {boolean} `true` if is of a subtype; `false`, otherwise.
   *
   * @memberOf pentaho.type.impl.Loader~
   * @private
   */
  function __isSubtypeOfInstanceCtor(OtherCtor) {
    var BaseInstCtor = __getModuleCached(TYPE_INSTANCE);
    return (OtherCtor === BaseInstCtor) || (OtherCtor.prototype instanceof BaseInstCtor);
  }

  /**
   * Resolves a type given by an array-shorthand specification.
   *
   * Example: a list of complex type elements
   *
   *  [{props: { ...}}]
   *  <=>
   *  {base: "list", of: {props: { ...}}}
   *
   * @memberOf pentaho.type.impl.Loader~
   * @param {Array} typeSpec - The list specification.
   * @param {boolean} [sync=false] Whether to perform a synchronous resolve.
   *
   * @return {Promise.<Class.<pentaho.type.Instance>>|Class.<pentaho.type.Instance>} When sync,
   *   returns the instance constructor; while, when async, returns a promise for it.
   *
   * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is, or contains, an array-shorthand,
   * list type specification that has more than one child element type specification.
   *
   * @private
   */
  function __resolveTypeByListSpec(typeSpec, sync) {

    var elemTypeSpec;
    if(typeSpec.length !== 1 || !(elemTypeSpec = typeSpec[0]))
      return promiseUtil.error(
        error.argInvalid("typeRef", "List type specification must have a single child element type spec."),
        sync);

    // Expand compact list type spec syntax and delegate to the generic handler.
    return __resolveTypeByObjectSpec({base: TYPE_LIST, of: elemTypeSpec}, null, sync);
  }

  /**
   * Resolves a type given by an object: either a type object or
   * a generic object specification.
   *
   * @memberOf pentaho.type.impl.Loader~
   * @param {pentaho.type.spec.TypeReference} typeRef - A type reference.
   * @param {pentaho.type.spec.TypeReference} defaultBase - The default base type
   * of `typeRef` when it is a generic object specification.
   *
   * @param {boolean} [sync=false] Whether to perform a synchronous resolve.
   *
   * @return {Promise.<Class.<pentaho.type.Instance>>|Class.<pentaho.type.Instance>} When sync,
   *   returns the instance constructor; while, when async, returns a promise for it.
   *
   * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is an instance of `pentaho.type.Instance`.
   *
   * @private
   */
  function __resolveTypeByObject(typeRef, defaultBase, sync) {

    return typeRef.constructor === Object
      ? __resolveTypeByObjectSpec(typeRef, defaultBase, sync)
      : __resolveTypeByTypeObject(typeRef, sync);
  }

  /**
   * Resolves a type given by a type object.
   *
   * @memberOf pentaho.type.impl.Loader~
   * @param {pentaho.type.spec.TypeReference} typeRef - A type reference.
   * @param {boolean} [sync=false] Whether to perform a synchronous resolve.
   *
   * @return {Promise.<Class.<pentaho.type.Instance>>|Class.<pentaho.type.Instance>} When sync,
   *   returns the instance constructor; while, when async, returns a promise for it.
   *
   * @throws {pentaho.lang.ArgumentInvalidError} When `typeRef` is an instance of `pentaho.type.Instance`.
   *
   * @private
   */
  function __resolveTypeByTypeObject(typeRef, sync) {

    var Instance = __getModuleCached(TYPE_INSTANCE);

    // An instance of Type ?
    if(typeRef instanceof Instance.Type) {
      return promiseUtil["return"](typeRef.instance.constructor, sync);
    }

    if(typeRef instanceof Instance) {
      return promiseUtil.error(
        error.argInvalid("typeRef", "Instances are not supported as type references."), sync);
    }

    return promiseUtil.error(
      error.argInvalid(
        "typeRef",
        "Object is not a 'pentaho.type.Type' instance or a plain object."),
      sync);
  }

  /**
   * Resolves a type given a generic object specification of it.
   *
   * If the type specification contains an identifier,
   * then it must be a temporary identifier, and one which is not yet registered
   * with the ambient specification context.
   *
   * Example generic object type specification:
   *
   * ```json
   * {
   *   "id": "_:1",
   *   "base": "complex",
   *   ...
   * }
   * ```
   *
   * @memberOf pentaho.type.impl.Loader~
   *
   * @param {pentaho.type.spec.IType} typeSpec - A type specification.
   * @param {pentaho.type.spec.TypeReference} defaultBase - The default base type.
   * @param {boolean} [sync=false] Whether to perform a synchronous resolve.
   *
   * @return {Promise.<Class.<pentaho.type.Instance>>|Class.<pentaho.type.Instance>} When sync,
   *   returns the instance constructor; while, when async, returns a promise for it.
   *
   * @throws {pentaho.lang.ArgumentInvalidError} When `typeSpec` has a permanent identifier.
   *
   * @throws {pentaho.lang.ArgumentInvalidError} When `typeSpec` has a temporary identifier
   * which is already defined.
   *
   * @private
   */
  function __resolveTypeByObjectSpec(typeSpec, defaultBase, sync) {

    var temporaryId = typeSpec.id || null;
    if(temporaryId !== null) {

      // Ensure this is a new temporary id.

      if(!SpecificationContext.isIdTemporary(temporaryId)) {
        return promiseUtil.error(
          error.argInvalid("typeRef", "Generic type specifications cannot have a permanent id."),
          sync);
      }

      var currentSpecContext = SpecificationContext.current;
      if(currentSpecContext !== null && currentSpecContext.get(temporaryId) !== null) {
        return promiseUtil.error(
          error.argInvalid("typeRef", "Temporary id '" + temporaryId + "' is already defined."),
          sync);
      }
    }

    if(sync) {
      // Throws if any referenced id is not already loaded.
      return __createTypeByObjectSpec(temporaryId, typeSpec, defaultBase);
    }

    // Get the referenced dependencies first and only then create the type.
    return __specProcessor.loadTypeDependenciesAsync(typeSpec)
      .then(function() {
        return __createTypeByObjectSpec(temporaryId, typeSpec, defaultBase);
      });
  }

  /**
   * Synchronously creates a type with a given temporary identifier,
   * generic object reference and default base type.
   *
   * All dependencies must have been loaded.
   *
   * Ensures that an ambient specification context exists,
   * creating one if not.
   *
   * Note the switch to sync mode here, whatever the outer `sync` value.
   * Only the outermost __resolveTypeByObjectSpec call may be async.
   * All types created within a root type given by a generic object type specification
   * will use the ambient specification context installed by it.
   *
   * @memberOf pentaho.type.impl.Loader~
   *
   * @param {?string} temporaryId - The temporary identifier of the type, if any.
   * @param {pentaho.type.spec.IType} typeSpec - A type specification.
   * @param {pentaho.type.spec.TypeReference} [defaultBase] - The default base type.
   *
   * @return {pentaho.type.Instance} The type's instance constructor.
   *
   * @private
   */
  function __createTypeByObjectSpec(temporaryId, typeSpec, defaultBase) {

    return O.using(new SpecificationScope(), function(specScope) {

      // Resolve the base type.
      var baseTypeSpec = typeSpec.base || defaultBase || TYPE_DEFAULT_BASE;

      var BaseInstCtor = Loader.__resolveTypeSync(baseTypeSpec);

      // Extend the base type.
      var InstCtor = BaseInstCtor.extend({$type: typeSpec});

      // Register the new type in the specification context.
      if(temporaryId !== null) {
        specScope.specContext.add(InstCtor.type, temporaryId);
      }

      return InstCtor;
    });
  }
});
