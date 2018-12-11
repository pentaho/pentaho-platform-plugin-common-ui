/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "../../util/object"
], function(O) {

  "use strict";

  return function(core) {

    return core.ModuleMeta.extend("pentaho._core.module.TypeMeta", /** @lends pentaho._core.module.TypeMeta# */{

      /**
       * @classDesc The `TypeMeta` class implements the `ITypeMeta` interface.
       *
       * @alias TypeMeta
       * @memberOf pentaho._core.module
       * @class
       * @extends pentaho._core.module.Meta
       * @implements {pentaho.module.ITypeMeta}
       *
       * @description Constructs the metadata of a type module.
       *
       * @constructor
       * @param {nonEmptyString} id - The identifier of the type module.
       * @param {pentaho.module.spec.ITypeMeta} spec - The specification of the metadata of the type module.
       * @param {pentaho._core.module.Resolver} resolver - The module resolver function.
       */
      constructor: function(id, spec, resolver) {

        this.base(id, spec, resolver);

        var ancestorId = spec.ancestor || spec.base || null;

        var ancestor = ancestorId !== null ? resolver(ancestorId, "type") : null;

        this.ancestor = ancestor;

        this.isAbstract = !!spec.isAbstract;
        if(this.isAbstract) {
          this._isLoaded = true;
        }

        if(ancestor !== null) {
          ancestor.__addSubtype(this);
        }
      },

      get kind() {
        return "type";
      },

      // region Subtypes
      /**
       * The array of subtype modules.
       *
       * @type {Array.<!pentaho.module.ITypeMeta>}
       * @private
       */
      __subtypes: Object.freeze([]),

      get subtypes() {
        return this.__subtypes;
      },

      /**
       * Adds a given subtype module.
       *
       * @param {pentaho.module.ITypeMeta} subtype - The subtype module.
       * @private
       * @internal
       */
      __addSubtype: function(subtype) {
        var subtypes = O.getOwn(this, "__subtypes", null);
        if(subtypes === null) {
          this.__subtypes = subtypes = [];
        }

        subtypes.push(subtype);
      },
      // endregion

      // region Instances
      /**
       * The array of instance modules.
       *
       * @type {Array.<!pentaho.module.IInstanceMeta>}
       * @private
       */
      __instances: Object.freeze([]),

      get instances() {
        return this.__instances;
      },

      /**
       * Adds a given instance module.
       *
       * @param {pentaho.module.InstanceMeta} instance - The instance module.
       * @private
       * @internal
       */
      __addInstance: function(instance) {
        var instances = O.getOwn(this, "__instances", null);
        if(instances === null) {
          this.__instances = instances = [];
        }

        instances.push(instance);
      }
      // endregion
    });
  };
});
