/*!
 * Copyright 2017 Pentaho Corporation. All rights reserved.
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
  "pentaho/util/object",
  "../ValidationError",
  "../../i18n!../i18n/types"
], function(module, O, ValidationError, bundle) {

  "use strict";

  return function(context) {

    /**
     * @name pentaho.type.mixins.DiscreteDomain.Type
     *
     * @class
     * @extends pentaho.type.Type
     *
     * @classDesc The type class of the [DiscreteDomain]{@link pentaho.type.mixins.DiscreteDomain} type.
     */

    /**
     * @name pentaho.type.mixins.DiscreteDomain
     *
     * @class
     * @extends pentaho.type.Instance
     * @abstract
     * @amd {pentaho.type.Factory<pentaho.type.mixins.DiscreteDomain>} pentaho/type/mixins/discreteDomain
     *
     * @classDesc A mixin type that adds to properties the ability to specify a discrete set of values
     * that are valid as property values.
     *
     * When the property's [value type]{@link pentaho.type.Property.Type#valueType} is an
     * [enumeration]{@link pentaho.type.mixins.Enum}, and the property also specifies a domain,
     * the combined domain is the intersection of both.
     *
     * A domain can be specified by using the [domain]{@link pentaho.type.mixins.DiscreteDomain.Type#domain} attribute.
     * The effective, resulting domain is obtained by calling the
     * [domainOn]{@link pentaho.type.mixins.DiscreteDomain.Type#domainOn} method.
     *
     * @description This class was not designed to be constructed directly.
     */

    // This should be Property, however, because the mixin is applied to Property itself,
    // we have to derive from Instance instead (or a cycle would be formed).
    var Instance = context.get("instance");

    return Instance.extend(/** @lends pentaho.type.mixins.DiscreteDomain# */{
      type: /** @lends pentaho.type.mixins.DiscreteDomain.Type# */{
        id: module.id,

        dynamicAttributes: {
          /**
           * Evaluates the value of the `domain` attribute of a property of this type
           * on a given owner complex value.
           *
           * @name domainOn
           * @memberOf pentaho.type.mixins.DiscreteDomain.Type#
           * @param {!pentaho.type.Complex} owner - The complex value that owns a property of this type.
           * @return {Array.<pentaho.type.Element>} The evaluated value of the `domain` attribute.
           *
           * @see pentaho.type.Property.Type#domain
           */

          /**
           * Gets or sets the list of valid values (or a function that evaluates to these)
           * of properties of this type.
           *
           * ### This attribute is *Dynamic*
           *
           * When a _dynamic_ attribute is set to a function,
           * it can evaluate to a different value for each complex instance.
           *
           * When a _dynamic_ attribute is set to a value other than a function,
           * its value is the same for every complex instance.
           *
           * ### This attribute is *Monotonic*
           *
           * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
           *
           * In this case, the list of valid values can only be successfully reduced.
           *
           * When the [valueType]{@link pentaho.type.Property#valueType} is an
           * [enumeration]{@link pentaho.type.mixins.DiscreteDomain},
           * the initial list of valid values is its
           * [domain]{@link pentaho.type.mixins.DiscreteDomain.Type#domain}.
           *
           * Because this attribute is also _dynamic_,
           * the actual `domain` values are only known
           * when evaluated for specific complex instances.
           * This behavior ensures that monotonic changes are deferred until evaluation.
           * No errors are thrown; non-monotonic changes simply do not take any effect.
           *
           * ### This attribute is *Inherited*
           *
           * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
           *
           * The first set local value must respect the _monotonicity_ property with the inherited value.
           *
           * ### Other characteristics
           *
           * The value got by the attribute is the **last set local, value**, if any -
           * a function, a constant value; or, `undefined`, when unset.
           *
           * When set to a {@link Nully} value, the set operation is ignored.
           *
           * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
           * an error is thrown.
           *
           * When the [valueType]{@link pentaho.type.Property#valueType} is an
           * [enumeration]{@link pentaho.type.mixins.DiscreteDomain},
           * the values intersection preserves those which have a
           * [formatted]{@link pentaho.type.Simple#formatted} value.
           * When both instances have a formatted value, the one specified last wins.
           *
           * The last specified domain determines the order.
           *
           * @name domain
           * @memberOf pentaho.type.Property.Type#
           * @type {undefined | Array.<pentaho.type.Element> |
           *        pentaho.type.PropertyDynamicAttribute.<Array.<pentaho.type.Element>>}
           *
           * @see pentaho.type.Complex#domainOf
           * @see pentaho.type.mixins.spec.IDiscreteDomainTypeProto#domain
           */
          "domain": {

            /* @type pentaho.type.PropertyDynamicAttribute */
            value: function(propType) {

              // The initial domain is that of the property's valueType's domain, if any.

              // TODO: Check for Enum mixin.
              var elems = propType.elemType.domain;
              return elems ? elems.toArray() : null;
            },

            cast: function(domain) {
              // `this` is `Property.type`

              if(!Array.isArray(domain)) domain = [domain];

              return domain.map(function(v) {
                return this.to(v);
              }, this.elemType);
            },

            combine: function(baseEval, localEval) {

              return function(propType) {
                // localEval is skipped if baseDomain is empty.
                var baseDomain = baseEval.call(this, propType);
                if(baseDomain && !baseDomain.length)
                  return baseDomain; // []

                var localDomain = localEval.call(this, propType);
                if(!localDomain) // any value
                  return baseDomain;

                if(!baseDomain || !localDomain.length)
                  return localDomain;

                return propType.elemType.__intersect(baseDomain, localDomain);
              };
            },

            toSpec: function(value, keyArgs) {

              keyArgs.declaredType = this.valueType;

              return value.map(function(elem) { return elem.toSpecInContext(keyArgs); });
            }
          }
        },

        /** @inheritDoc */
        _collectElementValidators: function(addValidator, owner) {

          this.base.apply(this, arguments);

          var domain = this.domainOn(owner);
          if(domain) {
            var domainByKey = {};
            domain.forEach(function(elem) {
              domainByKey[elem.$key] = elem;
            });

            var propType = this;

            addValidator(function(owner, element) {
              if(!O.hasOwn(domainByKey, element.$key)) {
                return new ValidationError(
                    bundle.get("errors.discreteDomain.notInDomain", [element.toString(), propType.label]));
              }
            });
          }
        }
      }
    });
  };
});
