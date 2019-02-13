/*!
 * Copyright 2018 - 2019 Hitachi Vantara. All rights reserved.
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
  "pentaho/lang/Base",
  "pentaho/module/metaService",
  "../SpecificationContext",
  "pentaho/util/requireJS",
  "pentaho/util/object"
], function(module, Base, moduleMetaService, SpecificationContext, requireJSUtil, O) {

  "use strict";

  /**
   * @classDesc The `SpecificationProcessor` represents an object which can process specifications
   * of subtypes of and instances of the [Instance]{@link pentaho.type.Instance} type.
   *
   * @name SpecificationProcessor
   * @memberOf pentaho.type.impl
   *
   * @amd pentaho/type/impl/SpecificationProcessor
   *
   * @class
   * @extends pentaho.lang.Base
   * @private
   */

  return Base.extend(module.id, /** @lends pentaho.type.impl.SpecificationProcessor# */{

    /**
     * Loads the type dependencies of a given type specification.
     *
     * @param {object} typeSpec - The specification.
     *
     * @return {Promise} A promise that gets resolved when all dependencies have been loaded.
     */
    loadTypeDependenciesAsync: function(typeSpec) {
      return this.__loadDependenciesAsync(typeSpec, true);
    },

    /**
     * Loads the type dependencies of a given instance specification.
     *
     * @param {object} instSpec - The specification.
     *
     * @return {Promise} A promise that gets resolved when all dependencies have been loaded.
     */
    loadInstanceDependenciesAsync: function(instSpec) {
      return this.__loadDependenciesAsync(instSpec, false);
    },

    /**
     * Loads the dependencies of a given specification.
     *
     * @param {object} spec - The specification.
     * @param {boolean} isType - Indicates that the specification is a type specification.
     *
     * @return {Promise} A promise that gets resolved when all dependencies have been loaded.
     *
     * @private
     */
    __loadDependenciesAsync: function(spec, isType) {
      if(spec == null) {
        return Promise.resolve(spec);
      }

      var depPromises = [];
      var depIdSet = Object.create(null);

      if(isType) {
        this.eachTypeDependency(spec, collectDependency);
      } else {
        this.eachInstanceDependency(spec, collectDependency);
      }

      return Promise.all(depPromises).then(function() { return null; });

      function collectDependency(depIdOrAlias) {
        var depId = moduleMetaService.getId(depIdOrAlias) || depIdOrAlias;
        if(!O.hasOwn(depIdSet, depId)) {
          depIdSet[depId] = 1;
          depPromises.push(requireJSUtil.promise(depId));
        }
      }
    },

    /**
     * Traverses a type specification and calls a function for each found (type) dependency.
     *
     * @param {object} typeRef - The specification.
     * @param {function(string)} depFun - The iteratee function,
     * which is called with id (or alias) of each found dependency.
     */
    eachTypeDependency: function(typeRef, depFun) {

      if(typeRef == null) return;

      /* eslint default-case: 0 */
      switch(typeof typeRef) {
        case "string":
          if(!SpecificationContext.isIdTemporary(typeRef)) {
            depFun(typeRef);
          }

          return;

        case "object":
          if(Array.isArray(typeRef)) {
            // Shorthand list type notation.
            // Example: [{props: { ...}}]
            if(typeRef.length > 0) {
              this.eachTypeDependency(typeRef[0], depFun);
            }

            return;
          }

          if(typeRef.constructor === Object) {
            this.__eachTypeDependencyGeneric(typeRef, depFun);
          }

          return;
      }
    },

    /**
     * Traverses an instance specification and calls a function for each found (type) dependency.
     *
     * @param {object} instRef - The specification.
     * @param {function(string)} depFun - The iteratee function,
     * which is called with id (or alias) of each found dependency.
     */
    eachInstanceDependency: function(instRef, depFun) {

      if(instRef && typeof instRef === "object") {

        if(Array.isArray(instRef)) {

          instRef.forEach(function(elemRef) {
            this.eachInstanceDependency(elemRef, depFun);
          }, this);

        } else if(instRef.constructor === Object) {
          // A generic object instance specification.
          Object.keys(instRef).forEach(function(name) {
            // Inline type.
            if(name === "_") {
              this.eachTypeDependency(instRef[name], depFun);
            } else {
              this.eachInstanceDependency(instRef[name], depFun);
            }
          }, this);
        }
      }
    },

    /**
     * Calls `depFun` for each dependency of a generic object specification of a type, `typeSpec`.
     *
     * @param {pentaho.type.spec.IType} typeSpec - A generic object type specification.
     *
     * @param {function(string)} depFun - A function that is called for each found module dependency.
     *
     * @private
     */
    __eachTypeDependencyGeneric: function(typeSpec, depFun) {
      // TODO: this method only supports deserialization of standard types.
      //   Custom types with own type attributes would need special handling.
      //   Something like a two phase protocol?

      // TODO: visual.role.PropertyType#modes -> visual.role.Mode#dataType is not being collected.

      // {[base: "complex", ] [of: "..."] , [props: []]}
      this.eachTypeDependency(typeSpec.base, depFun);

      // List only
      this.eachTypeDependency(typeSpec.of, depFun);

      // Complex only
      var props = typeSpec.props;
      if(props) {
        if(Array.isArray(props)) {
          props.forEach(function(propSpec) {
            if(propSpec) {
              this.eachInstanceDependency(propSpec.defaultValue, depFun);

              this.eachTypeDependency(propSpec.valueType, depFun);
              this.eachTypeDependency(propSpec.base, depFun);
            }
          }, this);
        } else {
          Object.keys(props).forEach(function(propName) {
            var propSpec = props[propName];
            if(propSpec) {
              this.eachInstanceDependency(propSpec.defaultValue, depFun);

              this.eachTypeDependency(propSpec.valueType, depFun);
              this.eachTypeDependency(propSpec.base, depFun);
            }
          }, this);
        }
      }

      // These are either ids of AMD modules of type mixins or, directly, type mixins.
      var mixins = typeSpec.mixins;
      if(mixins) {
        if(!(Array.isArray(mixins))) {
          mixins = [mixins];
        }

        mixins.forEach(function(mixinIdOrClass) {
          if(typeof mixinIdOrClass === "string") {
            this.eachTypeDependency(mixinIdOrClass, depFun);
          }
        }, this);
      }
    }
  });
});
