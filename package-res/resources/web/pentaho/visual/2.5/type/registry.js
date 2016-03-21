/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/service!IVisualTypeProvider",
  "pentaho/service!IVisualApiConfiguration",
  "pentaho/lang/Base",
  "pentaho/util/error",
  "pentaho/util/object",
  "pentaho/util/fun",
  "pentaho/shim/es6-promise"
], function(typeProviders, apiConfigs, Base, error, O, fun) {

  /*global Promise:true*/

  var prevConfigId = 0,

      // Properties that cannot be configured/copied from config to visualtype
      // (or are so in a special way, like args and enabled)
      lockedTypeProps = {
          // Config props added for internal management.
          "_id":       1,
          "_matchContainer": 1,
          "_matchGroupId": 1,

          // Part of config
          "priority":  1,
          "id":        1,
          "container": 1,

          // Handled in special way
          "args":      1,
          "enabled":   1,

          // Type
          "name":      1, // menu label - consider opening for config ? What about localization?
          "type":      1, // menu group - idem
          "source":    1,
          "dataReqs":  1
      },
      F_true = function () { return true; };

  /**
   * @module pentaho.visual
   */

  var VisualTypeRegistry = Base.extend("pentaho.visual.type.Registry", {

    /**
     * A singleton class where visual types and their configurations are registered.
     *
     * The singleton instance is pre-loaded with the AMD _services_:
     * 1. {{#crossLink "IVisualApiConfiguration"}}{{/crossLink}}
     * 2. {{#crossLink "IVisualTypeProvider"}}{{/crossLink}}
     *
     * Additional visual types and configurations may be loaded
     * dynamically by using the methods
     * {{#crossLink "VisualTypeRegistry/add:method"}}{{/crossLink}} and
     * {{#crossLink "VisualTypeRegistry/addConfig:method"}}{{/crossLink}},
     * respectively.
     *
     * #### AMD
     *
     * **Module Id**: `"pentaho/visual/type/registry"`
     *
     * **Module Type**: {{#crossLink "VisualTypeRegistry"}}{{/crossLink}}
     *
     * @class VisualTypeRegistry
     * @constructor
     */
    constructor: function VisualTypeRegistry() {
      // -- Container Entries --

      // Registry by container type id.
      // Each entry corresponds to a specific container type and
      // has a `list` and a `map` of visual types.

      // The unconfigured, base entry holds **all** registered VisualTypes.
      // They apply to any container type.
      this._typeClasses = {
        list: [], // @type IVisualType[]
        map:  {}  // @type Object.<string, IVisualType>  (the key is the id of the visual type)
      };

      // -- Configs --

      // Map of config levels by priority.
      // @type Object.<string, IVisualConfigLevel>
      this._configLevelsMap  = {};

      // List of config levels ordered from less to greater priority.
      // IVisualConfigLevel[]
      this._configLevelsList = [];

      /*
       * Each config level:
       * {
       *   // Individual VisualType configs
       *   //  (known to apply to a single visual type; their `id` is a string).
       *   // @type Object.<string, Array.<IVisualTypeConfig>>
       *   indiv: {},
       *
       *   // Group VisualType configs (apply to more than one visual type)
       *   // @type Array.<IVisualTypeConfig>
       *   group: []
       * }
       */

      // -- Configured VisualTypes Cache --

      // Holds cached, configured and filtered (enabled) VisualTypes.
      // Container id = "" contains the entry
      // corresponding to the cached, configured and filtered _baseEntry.
      this._containerCache = {};
    },

    /**
     * Adds a visual type.
     *
     * An error is thrown if a visual type having
     * the same _id_ is already registered.
     *
     * @method add
     * @param {IVisualType} type The visual type.
     * @chainable
     */
    add: function(type) {
      if(!type) throw error.argRequired("type");
      if(!type.id) throw error.argRequired("type.id");

      var baseEntry = this._typeClasses,
          type0  = O.getOwn(baseEntry.map, type.id, null);

      if(type0) {
        if(type0 === type) return this;

        throw error.argInvalid(
            "type",
            "A visual type with the id '" + type.id + "' is already registered.");
      }

      baseEntry.list.push(type);
      baseEntry.map[type.id] = type;

      // Invalidate cache
      invalidateContainerCache.call(this);

      return this;
    },

    /**
     * Gets an array with all of the registered and enabled visual types,
     * already configured.
     *
     * Optionally, the container type id that is to display the visual may be specified.
     *
     * Do **not** modify the returned array or any of its elements.
     *
     * @method getAll
     * @param {string} [containerTypeId] The container type id.
     *
     * @return {Array} An array of {{#crossLink "IVisualType"}}{{/crossLink}}.
     */
    getAll: function(containerTypeId) {
      return getContainerEntry.call(this, containerTypeId).list;
    },

    /**
     * Gets a visual type, already configured, given its id,
     * or `null` if one is not registered or is disabled.
     *
     * Optionally,
     * the container type id that is to display visuals of the given type,
     * may also be specified.
     *
     * Do **not** modify the returned object.
     *
     * @method get
     * @param {String} typeId The id of the visual type.
     * @param {string} [containerTypeId] The container type id.
     * @param {boolean} [assertAvailable=false] Indicates if an error should be thrown
     *    if the specified visual type is not registered or is disabled.
     *
     * @return {IVisualType} The visual type or `null`.
     */
    get: function(typeId, containerTypeId, assertAvailable) {
      if(!typeId) throw error.argRequired("typeId");

      var map = getContainerEntry.call(this, containerTypeId).map,
          type = O.getOwn(map, typeId, null);

      if(!type && assertAvailable)
        throw new Error(
          "A visual type with id '" + typeId + "' is not registered, or is disabled" +
          (containerTypeId ? (" for container '" +  containerTypeId + "'") : "") +
          ".");

      return type;
    },

    /**
     * Adds a visual type configuration.
     *
     * @method addConfig
     * @param {IVisualTypeConfig} config The visual type configuration.
     * @chainable
     */
    addConfig: function(config) {
      if(!config) throw error.argRequired("config");
      // Already added?
      if(config._id != null) return this;

      // Used to detect if a config has already been added and applied.
      // See #mapConfigs.
      config._id = ++prevConfigId;

      // Process the `priority` property.
      // May be +/-Infinity.
      var priority = +(config.priority || 0);
      if(isNaN(priority)) priority = 0;

      config.priority = priority;

      var _configLevel, me = this;

      function ensureConfigLevel() {
        return _configLevel || (_configLevel = getConfigLevel.call(me, priority));
      }

      // Process the `container` property.
      // Build a container predicate for it.
      var containerTypeIds = config.container;
      if(containerTypeIds) config._matchContainer = createContainerMatcher(containerTypeIds);

      // Process the visual type `id` property.
      var ids = config.id,
          reIds = [],
          hasAllGroup = false,
          processId = function(id) {
            if(id == null || id === "") {
              // All ids - like an all-group config.
              hasAllGroup = true;
              config._matchGroupId = F_true;
              ensureConfigLevel().group.push(config);
            } else {
              if(typeof id === "string") {
                var configLevel = ensureConfigLevel();

                // Individual id
                (configLevel.indiv[id] || (configLevel.indiv[id] = []))
                  .push(config);
              } else if(id instanceof RegExp) {
                // Group id
                if(!hasAllGroup) reIds.push(id);
              } else {
                throw new Error("Invalid 'id' configuration property: " + id);
              }
            }
          };

      if(ids instanceof Array)
        ids.forEach(processId, this);
      else
        processId.call(this, ids);

      if(!hasAllGroup && reIds.length) {
        config._matchGroupId = function(id) {
          return reIds.some(function(reId) { return reId.test(id); });
        };
        ensureConfigLevel().group.push(config);
      }

      // Invalidate cache
      invalidateContainerCache.call(this, containerTypeIds);

      return this;
    }
  });

  return createSingleton();

  // -------

  // @private
  function createSingleton() {
    var typeRegistry = new VisualTypeRegistry();

    // Auto-load the registry with IVisualApiConfiguration instances
    if(apiConfigs) apiConfigs.forEach(function(apiConfig) {
      if(apiConfig && apiConfig.types)
        apiConfig.types.forEach(function(typeConfig) {
        if(typeConfig)
          typeRegistry.addConfig(typeConfig);
      });
    });

    // Auto-load the registry with IVisualTypeProvider instances
    typeProviders.forEach(function(typeProvider) {
      typeProvider.getAll().forEach(function(type) {
        typeRegistry.add(type);
      });
    });

    return typeRegistry;
  }

  // @private
  // @static
  function createContainerMatcher(containerTypeIds) {
    return (containerTypeIds instanceof Array)
        ? function(c) { return containerTypeIds.indexOf(c) >= 0; } // string[]
        : function(c) { return c === containerTypeIds; }; // string
  }

  // Returns the configuration level corresponding to the given priority,
  // creating it, if necessary.
  // @private
  function getConfigLevel(priority) {
    var configLevel = O.getOwn(this._configLevelsMap, priority);
    if(!configLevel) {
      configLevel = this._configLevelsMap[priority] = { // @type IVisualConfigLevel
        priority: priority,
        // All individual type configs
        // typeId -> configs
        // @type Object.<string, IVisualConfigLevel[]>
        indiv: {},

        // All individual group configs
        // @type IVisualConfigLevel[]
        group: []
      };

      this._configLevelsList.push(configLevel);

      // Not as good as an insert-sort but...
      this._configLevelsList.sort(function(ca, cb) {
        return fun.compare(ca.priority, cb.priority);
      });
    }

    return configLevel;
  }

  // @private
  function getContainerEntry(containerTypeId) {
    var cache = this._containerCache;
    return (cache && O.getOwn(cache, containerTypeId || "")) ||
           createContainerEntry.call(this, containerTypeId);
  }

  // Container Entries hierarchy/order.
  // 1 - base entry, unconfigured (base <=> "any container type")
  //
  // Cached, configured, filtered, for specific container context:
  // 2 - base      entry, configured, filtered, cached (base <=> "any container type")
  // 2 - analyzer  entry, configured, filtered, cached (container = "analyzer")
  // 2 - container entry, ...

  // @private
  function createContainerEntry(containerTypeId) {
    var list = [], map = {};

    // For every base visual type...
    this._typeClasses.list.forEach(function(baseVisualType) {
      // Has specific configs for <type,container>?
      var type = applyContainerConfigs.call(this, containerTypeId, baseVisualType) ||
                 baseVisualType;

      if(type.enabled == null || type.enabled) {
        list.push(type);
        map[type.id] = type;
      }
    }, this);

    var cache = this._containerCache || (this._containerCache = {});
    return (cache[containerTypeId || ""] = {list: list, map: map});
  }

  // maps all applicable configurations to a given visual type id,
  // from lowest to highest precedence config.
  // @private
  function mapConfigs(typeId, fun) {
    var levels = this._configLevelsList,
        L = levels.length,
        i = -1;
    while(++i < L) mapConfigLevelConfigs.call(this, levels[i], typeId, fun);
  }

  // maps all applicable configurations of a given config level and visual type id,
  // from lowest to highest precedence config.
  // @private
  function mapConfigLevelConfigs(configLevel, typeId, fun) {
    var configsMap  = {},
        configsList = []; // from highest to lowest precedence.

    function mapConfigList(configs, fun2) {
      if(configs) {
        var i = configs.length;
        while(i--) if(configsMap[configs[i]._id] !== true) fun2.call(this, configs[i]);
      }
    }

    function addConfig(config) {
      configsMap[config._id] = true;
      configsList.push(config);
    }

    // We need to do this in two phases or a config that
    // matches both individually and as a group (an array of string and regexp)
    // could end up mapping that config in group position, loosing precedence.

    // Process Individual configurations
    mapConfigList.call(this, configLevel.indiv[typeId], addConfig);

    // Process Group configurations
    mapConfigList.call(this, configLevel.group, function(config) {
      if(!config._matchGroupId || config._matchGroupId(typeId)) addConfig(config);
    });

    // Finally, map (from lowest to highest precedence).
    var j = configsList.length;
    while(j--) fun.call(this, configsList[j]);
  }

  // @private
  function applyContainerConfigs(containerTypeId, baseVisualType) {
    var type;

    mapConfigs.call(this, baseVisualType.id, function(config) {
      var matches = !config._matchContainer || // any container type
                    (containerTypeId && config._matchContainer(containerTypeId)); // matches specific container type
      if(matches) {
        // If there's at least one configuration, clone the baseVisualType first.
        if(!type) type = cloneVisualType(baseVisualType);
        applyConfig.call(this, type, config);
      }
    });

    return type;
  }

  // @private
  // @static
  function cloneVisualType(baseVisualType) {
    var type = {};

    for(var p in baseVisualType) {
      if(O.hasOwn(baseVisualType, p)) {
        var v = baseVisualType[p];
        if(v && typeof v === "object") {
          // Array, Object
          switch(p) {
            // Not configurable, so reuse.
            case "dataReqs": break;
            default:
              // Shallow copy by default.
              v = O.cloneShallow(v);
              break;
          }
        }
        type[p] = v;
      }
    }

    return type;
  }

  // @private
  // @static
  function applyConfig(type, config) {
    // both `args` and `enabled`, below, are "locked".
    var v, p;
    for(p in config) {
      if(O.hasOwn(config,          p) && // an own property of config
         !O.hasOwn(lockedTypeProps, p) && // not locked
         (v = config[p]) !== undefined) {                  // not undefined

        // Replace, not merge.
        type[p] = O.cloneShallow(v);
      }
    }

    // Copy own defined properties of config.args.
    if(config.args) {
      if(!type.args) type.args = {};
      O.assignOwnDefined(type.args, config.args);
    }

    if(config.enabled != null)
      type.enabled = !!config.enabled;
  }

  // @private
  function invalidateContainerCache(containerTypeIds) {
    var cache = this._containerCache;
    if(!cache) return;

    if(!containerTypeIds) {
      // Affects every container type
      this._containerCache = null;
      return;
    }

    var anyDeleted = false;

    function invalidateOne(c) {
      if(!c) c = "";
      var entry = O.getOwn(cache, c);
      if(entry) delete cache[c];
    }

    if(containerTypeIds instanceof Array)
      containerTypeIds.forEach(invalidateOne);
    else
      invalidateOne(containerTypeIds);

    if(anyDeleted) {
      // If still some other container in the cache? Return
      for(var c1 in cache)
        if(O.hasOwn(cache, c1))
          return;

      // No containers left. Clear the field.
      this._containerCache = null;
    }
  }
});
