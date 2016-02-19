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
  "./Refinement",
  "../../i18n!types",
  "../../util/error",
  "../../util/object"
], function(RefinementFacet, bundle, error, O) {

  "use strict";

  /**
   * @name pentaho.type.facets.DiscreteDomain
   * @amd pentaho/type/facets/DiscreteDomain
   * @class
   * @extends pentaho.type.facets.RefinementFacet
   * @classDesc The _discrete domain_ refinement facet limits the domain of a representation type
   * to a discrete set of its instances.
   *
   * @description The constructor is not used, as a mixin.
   */
  return RefinementFacet.extend("pentaho.type.facets.DiscreteDomain", /** @lends pentaho.type.facets.DiscreteDomain# */{

    //region domain

    // TODO: Also defines the default natural ordering of the values?
    // When inherited, specified values must be a subset of those in the base class.
    // Although they can be in a different order...?
    _domain: null,
    _isDomainRoot: true,

    /**
     * Gets the fixed domain of the type, if any, or `null`.
     *
     * The domain attribute refines a type to a set of discrete values
     * whose type is that of the representation type,
     * {@link pentaho.type.Refinement.Meta#of}.
     *
     * If the ancestor refinement type has `domain` set,
     * the specified set of values must be a subset of those.
     *
     * Setting to a {@link Nully} value,
     * clears the local value and inherits the ancestor's domain.
     *
     * Setting to an empty array, effectively creates an _empty refinement type_.
     *
     * @type {?pentaho.type.List}
     * @readonly
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When the specified values are not a subset of those
     * of the ancestor refinement type.
     */
    get domain() {
      return this._domain;
    },

    set domain(value) {
      var isRoot = O.hasOwn(this, "_isDomainRoot"),
          localDomain;

      // TODO: Either ancestors should be locked when deriving,
      //  or direct changes to domain should propagate downwards...
      if(value == null) {
        if(!isRoot) {
          // Inherit base list.
          delete this._domain;
          // localDomain = baseDomain && baseDomain.clone();
          return;
        }

        // At the root, resetting is setting to null.
        localDomain = null;
      } else {
        // An Array, a List, ...

        // Convert value to ListType.
        // A list of the refines type.
        var ListType = this.context.get([this.of]);
        localDomain = new ListType(value);

        if(!isRoot) {
          var baseDomain = this.ancestor._domain;
          if(baseDomain) {
            // Validate that all elements exist in the base domain
            var i = localDomain.count, v0, v1;
            while(i--) {
              v1 = localDomain.at(i);
              v0 = baseDomain.get(v1.key);
              if(!v0)
                throw error.argInvalid("domain", bundle.structured.errors.refinement.domain.notSubsetOfBase);

              // Prefer using the base instances.
              if(v0 !== v1) {
                // TODO: Should be a single replace operation...
                localDomain.removeAt(i);
                localDomain.insert(v0, i);
              }
            }
          }
        }
      }

      // May be an empty list.
      this._domain = localDomain;
    }
  }, {
    validate: function(value) {
      var domain = this.domain;
      if(domain && !domain.has(value.key))
        return new Error(bundle.structured.errors.value.notInDomain);
      return null;
    }
  });
});