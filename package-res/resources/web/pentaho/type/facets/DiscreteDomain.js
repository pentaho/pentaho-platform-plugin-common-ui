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
  "../list",
  "../../i18n!../i18n/types",
  "../../util/error",
  "../../util/object",
  "../../util/fun"
], function(RefinementFacet, listFactory, bundle, error, O, fun) {

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
      var domain = O.getOwn(this, "_domain");
      if(domain === undefined) {
        // assert !O.hasOwn(this, "_isDomainRoot")
        var baseDomain;
        if((baseDomain = this.ancestor._domain)) {
          var ListType = baseDomain.constructor;
          var clones = baseDomain.toArray(function(elem) { return elem.clone(); });
          domain = new ListType(clones);
        } else {
          domain = null;
        }

        this._domain = domain;
      }

      return domain;
    },

    /**
     * Refines the current domain with the given domain values.
     */
    _refineDomain: function(values) {
      var domain = this._domain;
      var ListType = domain ? domain.constructor : this.context.get([this.of]);
      var valuesDomain = new ListType(values);

      // It's the first domain in the type hierarchy?
      if(!domain) {
        this._domain = valuesDomain;
        return;
      }

      // Already have a domain.
      // Is it local or inherited?
      if(O.hasOwn(this, "_domain")) {
        this._refineDomainLocal(domain, valuesDomain);
      } else {
        this._refineDomainInherited(domain, valuesDomain);
      }
    },

    _refineDomainInherited: function(domain, valuesDomain) {
      // Refining is a mixture of:
      // * ensuring that every element in values exists in base domain
      // * cloning the base domain elements that exist and configure them with the new one
      // * respecting the new order

      // Reuse valuesDomain as the new local list
      // No notifications needed as this is the initial state of the local domain
      // (and valuesDomain is still private)
      var i = valuesDomain.count;
      while(i--) {
        var v1 = valuesDomain.at(i);

        // Defined at base domain?
        var v0 = domain.get(v1.key);
        if(!v0)
          throw error.argInvalid("domain", bundle.structured.errors.refinement.domain.notSubsetOfBase);

        // If the two instances are different (the normal case),
        // the base one is cloned, so that all of its properties are the defaults.
        // Then, it the clone is configured with the just created `v1`.
        // Finally, the clone takes the position of v1.
        if(v0 !== v1) {
          valuesDomain.removeAt(i, /*silent:*/true);
          valuesDomain.insert(v0.clone().configure(v1), i, /*silent:*/true);
        }
      }

      this._domain = valuesDomain;
    },

    _refineDomainLocal: function(domain, valuesDomain) {
      // Refining is a mixture of:
      // * ensuring that every element in values exists in current domain
      // * configuring the ones that exist with the new elements?
      //   * preserves old elements even if the user gives an element directly
      // * removing the elements of current domain that are not in values
      // * swapping the order of the ones that exist
      var scope = domain.changeScope();
      try {
        // Validate existence and configure existing
        var i = valuesDomain.count;
        while(i--) {
          var v1 = valuesDomain.at(i);
          var v0 = domain.get(v1.key);

          // Not defined at the current domain?
          if(!v0)
            throw error.argInvalid("domain", bundle.structured.errors.refinement.domain.notSubsetOfBase);

          // If the two instances are different (the normal case)
          if(v1 !== v0) {
            // v0 is preserved and configured with v1
            v0.configure(v1);
          }
        }

        // Remove ones that are not in valuesDomain
        // Traversing forward, generates a single change set for contiguous removed elements.
        var C = domain.count;
        i = -1;
        while(++i < C) {
          if(!valuesDomain.get(domain.at(i).key)) {
            domain.removeAt(i);
            i--;
            C--;
          }
        }

        // Reorder
        // Sort one based on the other...
        domain.sort(function(a, b) {
          var va = valuesDomain.get(a.key);
          var vb = valuesDomain.get(b.key);
          return fun.compare(valuesDomain.indexOf(va), valuesDomain.indexOf(vb));
        });

      } finally {
        scope.dispose();
      }
    },

    _configureDomain: function(config) {
      var domain = this.domain;
      O.eachOwn(config, function(v, key) {
        var elem = domain.get(key);
        if(!elem) throw error.argInvalid("domain", "An element with key '" +  key + "' is not defined.");
        elem.configure(v);
      });
    },

    /**
     * Sets or configures the domain.
     * @ignore
     */
    set domain(values) {
      var isRoot = O.hasOwn(this, "_isDomainRoot");

      // TODO: Either ancestors should be locked when deriving,
      //  or direct changes to domain should propagate downwards...
      if(values == null) {
        if(!isRoot) {
          // Inherit base list.
          delete this._domain;
          // localDomain = baseDomain && baseDomain.clone();
          return;
        }

        // At the root, resetting is setting to null.
        this._domain = null;

      } else if(Array.isArray(values) || (values instanceof this.context.get(listFactory))) {
        // Array.<OfElement> | List.<OfElement>
        this._refineDomain(values);
      } else if(values.constructor === Object) {
        this._configureDomain(values);
      } else {
        throw error.argInvalidType("domain", ["Array", "pentaho.type.List", "Object"], typeof values);
      }
    }
  }, {
    validate: function(value) {
      var domain = this._domain;
      if(domain && !domain.has(value.key))
        return new Error(bundle.structured.errors.value.notInDomain);
      return null;
    }
  });
});