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
  "./Property",
  "../lang/Collection",
  "../util/arg",
  "../util/error",
  "../util/object"
], function(Property, Collection, arg, error, O) {

  "use strict";

  /**
   * @name PropertyMetaCollection
   * @memberOf pentaho.type
   * @class
   * @extends pentaho.lang.Collection
   * @implements pentaho.lang.IConfigurable
   *
   * @classDesc A collection of properties.
   *
   * @description Initializes a property collection.
   * This constructor is used internally by the `pentaho/type` package and should not be used directly.
   *
   * @see pentaho.type.Property
   * @ignore
   */
  return Collection.extend("pentaho.type.PropertyMetaCollection",
      /** @lends pentaho.type.PropertyMetaCollection# */{

    /**
     * Initializes a property collection.
     *
     * @param {pentaho.type.Complex.Meta} declaringMeta The metadata of the declaring complex type.
     * @ignore
     */
    constructor: function(declaringMeta) {
      if(!declaringMeta) throw error.argRequired("declaringMeta");

      this._cachedKeyArgs = {
        declaringMeta: declaringMeta,
        index:  -1,
        isRoot: false
      };

      // Copy the declaring complex type's ancestor's properties.
      var ancestorMeta = declaringMeta.ancestor,
          colBase = ancestorMeta && ancestorMeta._getProps && ancestorMeta._getProps();

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

    //region List implementation
    elemClass: Property.Meta,

    /**
     * Add a pentaho.type.UPropertyMeta to the properties collection.
     *
     * This method allows adding elements to the collection using custom options (keyword arguments).
     *
     * @param {string} spec The name of the property.
     * @param {number} index The location of the property in the collection.
     * @param {Object} ka The keyword arguments.
     * @protected
     */
    _adding: function(spec, index, ka) {
      if(!spec) throw error.argRequired("props[i]");

      var name = getSpecName(spec), existing;
      if(name && (existing = this.get(name))) {
        // An object spec? Otherwise it's a noop - nothing to configure or override.
        // Configure existing local property or override inherited one.
        if(spec !== name) {
          if(existing.declaringType === this._cachedKeyArgs.declaringMeta)
            existing.extend(spec);
          else
            this.replace(spec, this.indexOf(existing));
        }

        // And cancel add property.
        return;
      }

      return this.base.apply(this, arguments);
    },

    /**
     * Replace a pentaho.type.UPropertyMeta in the properties collection.
     *
     * This method allows replacing elements in the collection using custom options (keyword arguments).
     *
     * @param {string} spec The name of the property.
     * @param {number} index The location of the property in the collection.
     * @param {Object} existing The keyword arguments.
     * @protected
     */
    _replacing: function(spec, index, existing) {
      if(!spec) throw error.argRequired("props[i]");

      var name = getSpecName(spec);
      if(name !== existing.name)
        throw error.argInvalid("props[i]", "Incorrect property name.");

      var ka = this._cachedKeyArgs;

      if(existing.declaringType === ka.declaringMeta) {
        // Configure existing local property and cancel replace.
        // If spec is not an object, then it's a noop.
        if(spec !== name) existing.extend(spec);
        return;
      }

      // Replace with overridden property.
      return Property.extendProto(existing.mesa, {meta: spec}, ka).meta;
    },

    /**
     * Cast a property from the collection.
     *
     * The cast is called to convert specs of properties which are new (not an override) into a Property.Meta instance
     *
     * @param {string} spec The name of the property.
     * @param {string} index The location of the property in the collection.
     * @protected
     */
    _cast: function(spec, index) {
      // For new, root, local properties.

      // A singular string property with the specified name.
      if(typeof spec === "string") spec = {name: spec};

      var ka = this._cachedKeyArgs;
      ka.index = index;
      ka.isRoot = true;

      var pm = Property.extendProto(null, {meta: spec}, ka).meta;

      ka.index = -1;
      ka.isRoot = false;

      return pm;
    },
    //endregion

    //region IConfigurable implementation
    /**
     * Configures the properties collection.
     *
     * The configuration can be:
     * 1. an array of {@link pentaho.type.UPropertyMeta}, or
     * 2. an object whose keys are the property names and the values are {@link pentaho.type.UPropertyMeta},
     *    having no name or a name equal to the key.
     *
     * @param {Object} config The properties configuration.
     */
    configure: function(config) {
      if(!config) throw error.argRequired("config");

      if(Array.isArray(config)) {
        this.addMany(config);
      } else {
        O.eachOwn(config, function(propConfig, name) {
          if(propConfig && typeof propConfig === "object") {
            var name2 = propConfig.name;
            if(name2) {
              if(name2 !== name) throw error.argInvalid("config", "Property name does not match object key.");
            } else {
              propConfig.name = name;
            }

            this.add(propConfig);
          }
        }, this);
      }
    }
    //endregion
  });

  function getSpecName(spec) {
    return typeof spec === "string" ? spec : spec.name;
  }
});
