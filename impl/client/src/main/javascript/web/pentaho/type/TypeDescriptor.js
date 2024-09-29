/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

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
  .configure();
});
