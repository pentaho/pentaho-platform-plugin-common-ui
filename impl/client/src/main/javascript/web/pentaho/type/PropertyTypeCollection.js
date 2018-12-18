/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "./Property",
  "./_baseLoader",
  "pentaho/lang/Collection",
  "pentaho/util/arg",
  "pentaho/util/error",
  "pentaho/util/object"
], function(module, Property, baseLoader, Collection, arg, error, O) {

  "use strict";

  var __propertyType = Property.type;

  /**
   * @name PropertyTypeCollection
   * @memberOf pentaho.type
   * @class
   * @extends pentaho.lang.Collection
   * @implements {pentaho.lang.IConfigurable}
   *
   * @classDesc A collection of properties.
   *
   * @description Initializes a property collection.
   * This constructor is used internally by the `pentaho/type` package and should not be used directly.
   *
   * @see pentaho.type.Property
   * @private
   */
  return Collection.extend(module.id, /** @lends pentaho.type.PropertyTypeCollection# */{
    /**
     * Initializes a property collection.
     *
     * @param {pentaho.type.ComplexType} declaringType - The declaring complex type.
     * @ignore
     */
    constructor: function(declaringType) {
      if(!declaringType) throw error.argRequired("declaringType");

      this.__cachedKeyArgs = {
        declaringType: declaringType,
        index:  -1,
        isRoot: false
      };

      /**
       * Map of property types by nameAlias.
       * @type {Object.<string, pentaho.type.PropertyType>}
       * @private
       */
      this.__propTypesByAlias = Object.create(null);

      // Copy the declaring complex type's ancestor's properties.
      var ancestorType = declaringType.ancestor;
      var colBase = ancestorType.isComplex ? ancestorType.__getProps() : null;
      if(colBase) {
        // Backup any provided specs.
        var newProps;
        if(this.length) {
          newProps = this.slice();
          this.length = 0;
        }

        this.base();

        // All base properties. Preserve original positions.
        colBase.copyTo(this);

        // Create/Override properties.
        if(newProps) this.addMany(newProps);
      } else {
        // Default: calls `addMany` on contained specs.
        this.base();
      }
    },

    // @override
    copyTo: function(col) {
      this.base(col);
      O.assignOwn(col.__propTypesByAlias, this.__propTypesByAlias);
    },

    /**
     * Gets a property type having a given name alias.
     *
     * @param {string} nameAlias - The name alias.
     * @return {pentaho.type.PropertyType} The property type or `null`.
     */
    getByAlias: function(nameAlias) {
      return O.getOwn(this.__propTypesByAlias, nameAlias, null);
    },

    /**
     * The declaring complex type
     *
     * @type {pentaho.type.ComplexType}
     * @readOnly
     * @private
     */
    get __declaringType() {
      return this.__cachedKeyArgs.declaringType;
    },

    // region List implementation
    // elemClass: Property.Type, // Not really used.

    /**
     * Add a {@link pentaho.type.spec.PropertyType} to the properties collection.
     *
     * This method allows adding elements to the collection using custom options (keyword arguments).
     *
     * @param {string} spec - The name of the property.
     * @param {number} index - The location of the property in the collection.
     * @param {?object} ka - The keyword arguments.
     * @return {pentaho.type.PropertyType} The property type to add.
     * @protected
     * @override
     */
    _adding: function(spec, index, ka) {
      if(!spec) throw error.argRequired("props[i]");

      var name = __getSpecName(spec);
      var existing;
      if(name && (existing = this.get(name))) {
        // An object spec? Otherwise it's a noop - nothing to configure or override.
        // Configure existing local property or override inherited one.
        if(spec !== name) {
          if(existing.declaringType === this.__declaringType) {
            existing.extend(spec);
          } else {
            this.replace(spec, this.indexOf(existing), ka);
          }
        }

        // And cancel add property.
        return;
      }

      return this.base.apply(this, arguments);
    },

    /**
     * Replace a {@link pentaho.type.spec.PropertyType} in the properties collection.
     *
     * This method allows replacing elements in the collection using custom options (keyword arguments).
     *
     * @param {string} spec - The specification of the property.
     * @param {number} index - The location of the property in the collection.
     * @param {pentaho.type.PropertyType} existing - The existing property type.
     * @param {?object} keyArgs - The keyword arguments.
     * @return {pentaho.type.PropertyType} The replacement property type.
     * @protected
     * @override
     */
    _replacing: function(spec, index, existing, keyArgs) {
      if(!spec) throw error.argRequired("props[i]");

      var name = __getSpecName(spec);
      if(name !== existing.name)
        throw error.argInvalid("props[i]", "Incorrect property name.");

      if(existing.declaringType === this.__declaringType) {
        // Configure existing local property and cancel replace.
        // If spec is not an object, then it's a noop.
        if(spec !== name) {
          existing.extend(spec);
        }

        return;
      }

      var ka;
      if(keyArgs) {
        ka = Object.create(keyArgs);
        ka.declaringType = this.__declaringType;
      } else {
        ka = this.__cachedKeyArgs;
      }

      // Replace with overridden property.
      var Existing = existing.instance.constructor;
      var Replacement = Existing.extend({
        $type: spec
      }, null, ka);

      return Replacement.type;
    },

    _added: function(elem) {

      this.base.apply(this, arguments);

      var nameAlias = elem.nameAlias;
      if(nameAlias !== null) {
        this.__propTypesByAlias[nameAlias] = elem;
      }
    },

    _replaced: function(elem) {

      this.base.apply(this, arguments);

      var nameAlias = elem.nameAlias;
      if(nameAlias !== null) {
        this.__propTypesByAlias[nameAlias] = elem;
      }
    },

    /**
     * Cast a property from the collection.
     *
     * The cast is called to convert specs of properties that are new (not an override) into a PropertyType instance
     *
     * @param {string} spec - The name of the property.
     * @param {string} index - The location of the property in the collection.
     * @param {?object} [keyArgs] - The keyword arguments.
     * @return {pentaho.type.PropertyType} The new property type.
     * @protected
     */
    _cast: function(spec, index, keyArgs) {
      // For new, root, local properties.

      // A singular string property with the specified name.
      if(typeof spec === "string") spec = {name: spec};

      // Resolve base Property Type
      var basePropType;
      var baseId = spec.base;
      if(!baseId) {
        basePropType = __propertyType;
      } else {
        basePropType = baseLoader.resolveType(baseId).type;
        if(!basePropType.isSubtypeOf(__propertyType))
          throw error.argInvalid("props[i]", "Property base type does not extend Property.");
      }

      var ka;
      if(keyArgs) {
        ka = Object.create(keyArgs);
        ka.declaringType = this.__declaringType;
      } else {
        ka = this.__cachedKeyArgs;
      }

      ka.index = index;
      ka.isRoot = true;

      var BaseProp = basePropType.instance.constructor;
      var Prop = BaseProp.extend({$type: spec}, null, ka);

      if(!keyArgs) {
        ka.index = -1;
        ka.isRoot = false;
      }

      return Prop.type;
    },
    // endregion

    // region IConfigurable implementation
    /**
     * Configures the properties collection.
     *
     * The configuration can be:
     * 1. an array of {@link pentaho.type.spec.PropertyType}, or
     * 2. an object whose keys are the property names and the values are {@link pentaho.type.spec.PropertyType},
     *    having no name or a name equal to the key.
     *
     * @param {?object} config - The properties configuration.
     * @param {?object} [keyArgs] - The keyword arguments.
     */
    configure: function(config, keyArgs) {
      if(!config) throw error.argRequired("config");

      if(Array.isArray(config)) {
        this.addMany(config, keyArgs);
      } else {
        O.eachOwn(config, function(propConfig, name) {
          if(propConfig && typeof propConfig === "object") {
            var name2 = propConfig.name;
            if(name2) {
              if(name2 !== name) throw error.argInvalid("config", "Property name does not match object key.");
            } else {
              propConfig.name = name;
            }

            this.add(propConfig, keyArgs);
          }
        }, this);
      }
    }
    // endregion
  });

  function __getSpecName(spec) {
    return typeof spec === "string" ? spec : spec.name;
  }
});
