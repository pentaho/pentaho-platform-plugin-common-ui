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
  "module",
  "../../typeInfo",
  "pentaho/lang/Base",
  "pentaho/util/object",
  "pentaho/lang/ArgumentRequiredError",
  "pentaho/lang/ArgumentInvalidError"
], function(module, typeInfo, Base, O, ArgumentRequiredError, ArgumentInvalidError) {

  "use strict";

  // TODO: This class does not have unit tests.

  return Base.extend(module.id, /** @lends pentaho.instanceInfo.impl.Service# */{

    /**
     * @classDesc Implementation of the `instanceInfo.IService` interface.
     *
     * @alias Service
     * @memberOf pentaho.instanceInfo.impl
     * @class
     * @implements pentaho.instanceInfo.IService
     * @private
     */
    constructor: function() {
      /**
       * A map of instance declarations by instance id.
       *
       * @type {Object.<string, pentaho.instanceInfo.spec.IDeclaration>}
       * @private
       */
      this.__declById = {};

      /**
       * A map of instance declarations by type id.
       *
       * @type {Object.<string, Array.<pentaho.instanceInfo.spec.IDeclaration>>}
       * @private
       */
      this.__declsByTypeId = {};
    },

    /** @inheritDoc */
    configure: function(spec) {

      O.eachOwn(spec, function(decl, id) {
        if(decl) {
          this.declare(id, decl);
        }
      }, this);
    },

    /** @inheritDoc */
    declare: function(id, decl) {
      if(!id)
        throw new ArgumentRequiredError("id");

      if(O.hasOwn(this.__declById, id))
        throw new ArgumentInvalidError("id", "An instance with the id '" + id + "' is already defined.");

      var type = decl.type;
      if(!type)
        throw new ArgumentInvalidError("spec", "The instance with the id '" + id + "' does not declare its type.");

      type = typeInfo.getIdOf(type) || type;

      var declLocal = {
        id: id,
        type: type
      };

      this.__declById[id] = declLocal;
      (O.getOwn(this.__declsByTypeId, type) || (this.__declsByTypeId[type] = [])).push(declLocal);
    },

    /** @inheritDoc */
    getTypeOf: function(instanceId) {
      var decl = O.getOwn(this.__declById, instanceId);
      if(decl) return decl.type;
    },

    /** @inheritDoc */
    getAllByType: function(typeIdOrAlias, keyArgs) {

      var instances = [];

      if(typeIdOrAlias) {
        var typeIds = typeInfo.getSubtypesOf(typeIdOrAlias, keyArgs) || [typeIdOrAlias];

        typeIds.forEach(function(typeId) {
          var instancesOfType = O.getOwn(this.__declsByTypeId, typeId);
          if(instancesOfType) {
            instancesOfType.forEach(function(inst) {
              instances.push(inst.id);
            });
          }
        }, this);
      } else {
        O.eachOwn(this.__declById, function(decl) {
          instances.push(decl.id);
        });
      }

      return instances;
    }
  });
});
