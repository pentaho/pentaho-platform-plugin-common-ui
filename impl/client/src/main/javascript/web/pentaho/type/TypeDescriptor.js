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
  "pentaho/module!_",
  "./Simple",
  "./_baseLoader",
  "pentaho/i18n!types"
], function(module, Simple, baseLoader, bundle) {

  "use strict";

  // TODO: Using TypeDescriptor is not safe w.r.t. to asynchronous loading of types from the loader (getAsync).
  // Some means to register spec scanners for type ids would need to be devised.
  // See __collectDependencyRefsRecursive.

  /**
   * @name pentaho.type.TypeDescriptor
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/TypeDescriptor
   *
   * @classDesc The class that wraps a {@link pentaho.type.Type} object as a Type API simple value.
   *
   * @description Creates a type descriptor object.
   * @constructor
   * @param {pentaho.type.spec.ITypeDescriptor|
   *         pentaho.type.Type|
   *         Class.<pentaho.type.Instance>|
   *         nonEmptyString} [spec] A type descriptor specification,
   *         a [Type]{@link pentaho.type.Type} object,
   *         an [Instance]{@link pentaho.type.Instance} constructor or
   *         a (permanent) type identifier.
   */
  return Simple.extend(/** @lends pentaho.type.TypeDescriptor# */{
    /**
     * Gets the underlying type object.
     *
     * @name pentaho.type.TypeDescriptor#value
     * @type {pentaho.type.Type}
     * @readonly
     */

    /**
     * Gets the unique key of the type descriptor.
     *
     * @type {string}
     * @readonly
     */
    get $key() {
      return String(this.value.uid);
    },

    // region serialization
    /** @inheritDoc */
    _toJSONValue: function(keyArgs) {
      return this.value.toSpecInContext(keyArgs);
    },
    // endregion

    $type: /** @lends pentaho.type.TypeDescriptorType# */{
      id: module.id,

      cast: function(value) {
        return baseLoader.resolveType(value).type;
      }
    }
  })
  .localize({$type: bundle.structured.TypeDescriptor})
  .configure({$type: module.config});
});
