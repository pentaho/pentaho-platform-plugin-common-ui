/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "../value",
  "../list",
  "../util",
  "../ValidationError",
  "../../i18n!../i18n/types",
  "../../util/error",
  "../../util/object"
], function(module, valueTypeFactory, listTypeFactory, typeUtil, ValidationError, bundle, error, O) {

  "use strict";

  return function(context) {

    var Value = context.get(valueTypeFactory);

    /**
     * @name pentaho.type.facets.DiscreteDomain.Type
     * @class
     * @extends pentaho.type.Value.Type
     *
     * @classDesc The type class of the `DiscreteDomain` mixin type.
     *
     * For more information see {@link pentaho.type.facets.DiscreteDomain}.
     */

    /**
     * @name pentaho.type.facets.DiscreteDomain
     * @abstract
     * @class
     * @extends pentaho.type.Value
     * @amd pentaho/type/facets/discreteDomain
     *
     * @classDesc A mixin type that limits the domain of its base type to a discrete set of its essence instances.
     *
     * Any type can receive this mixin,
     * however, only accidental types can actually specify
     * the [domain]{@link pentaho.type.facets.DiscreteDomain.Type#domain} property.
     *
     * @see pentaho.type.facets.spec.IDiscreteDomainTypeProto
     */
    var DiscreteDomain = Value.extend(/** @lends pentaho.type.facets.DiscreteDomain# */{

      type: /** @lends pentaho.type.facets.DiscreteDomain.Type# */{

        id: module.id,
        alias: "discreteDomain",

        /** @inheritDoc */
        _init: function(spec, keyArgs) {

          this.base(spec, keyArgs);

          var baseDomain = this.ancestor._domain;
          if(baseDomain) {
            // Copy the elements into a list of the base type.
            this.__setDomain(baseDomain, false);
          }
        },

        /** @inheritDoc */
        _validate: function(value) {
          return typeUtil.combineErrors(
              this.base(value),
              this.__validateDomain(value));
        },

        /**
         * Validates a value w.r.t. the restricted domain.
         *
         * @param {!pentaho.type.Value} value - The value to validate.
         * @return {Nully|pentaho.type.ValidationError|Array.<!pentaho.type.ValidationError>} The error, errors or null.
         * @private
         */
        __validateDomain: function(value) {
          var domain = this._domain;
          return (!domain || domain.has(value.key))
              ? null
              : new ValidationError(bundle.structured.errors.discreteDomain.notInDomain);
        },

        /** @inheritDoc */
        _fillSpecInContext: function(spec, keyArgs) {

          var any = this.base(spec, keyArgs);

          // TODO: because _domain is created locally through the getter
          // this code cannot detect whether there are actual changes locally
          // and this will be serializing unchanged domain values.
          // Guess doing it right would require maintaining a flag to indicate local changes occurred.
          var domain = O.getOwn(this, "_domain");
          if(domain) {
            if(!keyArgs) keyArgs = {};
            any = true;
            keyArgs.declaredType = this.type;
            spec.domain = domain.toSpecInContext(keyArgs);
          }

          return any;
        },

        // region domain

        // TODO: Also defines the default natural ordering of the values?
        // When inherited, specified values must be a subset of those in the base class.
        // Although they can be in a different order...?
        _domain: null,
        _isDomainRoot: true,

        /**
         * Gets or sets the fixed domain of the type.
         *
         * When the domain is not set, getting the property returns `null`.
         *
         * The domain attribute refines a type to a set of discrete values
         * whose type is that of this type's [essence type]{@link pentaho.type.Type#essence}.
         *
         * If the ancestor type has `domain` set, the specified set of values must be a subset of those.
         *
         * Setting to a {@link Nully} value has no effect.
         *
         * An error is thrown if set on a type which is not an [accident]{@link pentaho.type.Type#isAccident}.
         *
         * @type {?pentaho.type.List}
         * @readonly
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting or modifying and the type already has
         * [subtypes]{@link pentaho.type.Type#hasDescendants}.
         *
         * @throws {pentaho.lang.OperationInvalidError} When set on a type which is not an
         * [accident]{@link pentaho.type.Type#isAccident}.
         *
         * @throws {pentaho.lang.OperationInvalidError} When the specified values are not a subset of those
         * of the ancestor type.
         *
         * @see pentaho.type.facets.spec.IDiscreteDomainTypeProto#domain
         */
        get domain() {
          return this._domain;
        },

        set domain(values) {

          if(values == null) return;

          var domain = this._domain;
          var handle = null;
          if(!domain) {

            // This situation can only happen on the root domain type, as extending an accident results in an accident.
            if(this.isEssence)
              throw error.operInvalid(bundle.structured.errors.discreteDomain.domainNotSetOnAccidentType);

            handle = this.__setDomain(null, true);
            domain = this._domain;
          }

          try {
            if(Array.isArray(values)) {
              domain.set(values);
            } else if(values instanceof this.context.get(listTypeFactory)) {
              domain.set(values.toArray());
            } else if(values.constructor === Object) {
              domain.configure(values);
            } else {
              throw error.argInvalidType("domain", ["Array", "pentaho.type.List", "Object"], typeof values);
            }
          } catch(ex) {
            // Validation error

            if(handle) {
              // Revert setting the initial domain
              handle.dispose();

              delete this._domain;
              delete this._isDomainRoot;
            }

            throw ex;
          }
        },

        /**
         * Creates the domain list with the given values.
         *
         * @param {Array} values - Initial values, or `Nully`.
         * @param {boolean} isRoot - Indicates if this is the root type where domain is being set.
         *
         * @return {pentaho.lang.IEventRegistrationHandle} The `will:change` registration handle.
         * @private
         */
        __setDomain: function(values, isRoot) {

          var ListType = this.context.get([this.ancestor]);

          var domain = new ListType(values);

          this._domain = domain;
          this._isDomainRoot = isRoot;

          return domain.on("will:change", this.__onDomainChangeWill.bind(this));
        },

        /**
         * Event handler for the domain list's `will:change`.
         *
         * Makes sure invariants are held.
         *
         * @param {pentaho.type.events.WillChange} event - The event object.
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting or modifying and the type already has
         * [subtypes]{@link pentaho.type.Type#hasDescendants}.
         *
         * @throws {pentaho.lang.OperationInvalidError} When the specified values are not a subset of those
         * of the ancestor type.
         *
         * @private
         */
        __onDomainChangeWill: function(event) {

          // Validation Rules
          // 1. Cannot change if already have descendants.
          // 2. If not initially empty, cannot add values.
          if(event.changeset.hasChanges) {
            if(this.hasDescendants) {
              event.cancel(
                  error.operInvalid(bundle.structured.errors.discreteDomain.domainLockedWhenTypeHasDescendants));
              return;
            }

            var scope = context.enterCommitted();
            var initialCount = this._domain.count;
            scope.dispose();

            if(initialCount > 0) {
              var changes = event.changeset.changes;
              var i = -1;
              var L = changes.length;
              while(++i < L) {
                var change = changes[i];
                if(change.type === "add") {
                  event.cancel(
                      error.operInvalid(bundle.structured.errors.discreteDomain.notEmptyCannotAddDomainValues));
                  return;
                }
              }
            }
          }
        }
      }
    });

    return DiscreteDomain;
  };
});
