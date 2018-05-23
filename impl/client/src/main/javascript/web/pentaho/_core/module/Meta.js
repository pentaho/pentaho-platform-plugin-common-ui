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
  "require",
  "module",
  "../../lang/Base",
  "../../debug",
  "../../debug/Levels",
  "../../util/logger",
  "../../util/promise",
  "../../util/text",
  "../../util/fun"
], function(localRequire, module, Base, debugMgr, DebugLevels, logger, promiseUtil, textUtil, F) {

  "use strict";

  return function(core) {

    return Base.extend("pentaho._core.module.Meta", /** @lends pentaho._core.module.Meta# */{

      /**
       * @classDesc The `Meta` class implements the `module.IMeta` interface.
       *
       * @alias Meta
       * @memberOf pentaho._core.module
       * @class
       * @implements {pentaho.module.IMeta}
       * @abstract
       *
       * @description Constructs the metadata of a module.
       * @constructor
       * @param {nonEmptyString} id - The identifier of the module.
       * @param {!pentaho.module.spec.IMeta} spec - The specification of the metadata of the module.
       * @param {!pentaho._core.module.Resolver} [resolver] - The module resolver function.
       */
      constructor: function(id, spec, resolver) {

        this.id = id;

        /**
         * The index of definition order.
         *
         * Used to build a global order of modules (ranking descending + index ascending).
         *
         * @type {number}
         * @readOnly
         * @private
         * @internal
         */
        this.__index = spec.index || 0;

        this.alias = textUtil.nonEmptyString(spec.alias);
        if(this.alias === id) {
          this.alias = null;
        }

        this.ranking = +spec.ranking || 0;

        /**
         * The value of the module, if it has been loaded already,
         * or `undefined`, otherwise.
         *
         * @type {any}
         * @private
         */
        this.__value = undefined;
        this.__valuePromise = null;

        // NOTE: TypeMeta changes this to true, when isAbstract.
        /**
         * Indicates the value has been loaded or was specified.
         * @type {boolean}
         * @protected
         */
        this._isLoaded = false;

        /**
         * Gets the configuration of the module.
         *
         * When not yet loaded, the value is `undefined`.
         *
         * @memberOf pentaho.module.Meta#
         * @type {Object}
         * @private
         */
        this.__config = undefined;
        this.__configPromise = null;

        // this.browsingInfo;

        var value = spec.value;
        if(value !== undefined) {
          this.__defineAmdModuleAsync(value);
        }
      },

      /**
       * Configures the module metadata.
       *
       * Currently, only the `ranking` option is supported.
       *
       * @param {!pentaho.module.spec.IMeta} configSpec - The configuration specification.
       * @private
       * @internal
       */
      __configure: function(configSpec) {
        if("ranking" in configSpec) {
          this.ranking = +configSpec.ranking || 0;
        }
      },

      // region Value
      get value() {
        return this.__value;
      },

      get isLoaded() {
        return this._isLoaded;
      },

      loadAsync: function() {
        // Promise preserves value or error!
        var promise = this.__valuePromise;
        if(promise === null) {
          if(this._isLoaded) {
            promise = Promise.resolve(this.__value);
          } else {

            var me = this;

            promise = promiseUtil.require(this.id, localRequire)
              .then(function(value) {
                me.__value = value;
                me._isLoaded = true;

                if(debugMgr.testLevel(DebugLevels.info, module)) {
                  logger.info("Loaded module '" + me.id + "'.");
                }

                return value;
              }, function(error) {

                if(debugMgr.testLevel(DebugLevels.error, module)) {
                  logger.error("Failed loading module '" + me.id + "'. Error: " + error);
                }

                return Promise.reject(error);
              });
          }

          this.__valuePromise = promise;
        }

        return promise;
      },

      /**
       * Registers the specified value of this module with the AMD module system.
       * @param {any|(function(!pentaho.module.IMeta) : any)} value - The value or value factory function.
       *
       * @return {!Promise} A promise for the value of the module.
       *
       * @private
       */
      __defineAmdModuleAsync: function(value) {

        if(F.is(value)) {
          define(this.id, ["pentaho/module!"], value);
        } else {
          define(this.id, F.constant(value));
        }

        // Capture the just defined module in the AMD context of localRequire.
        // Not calling this, would end up defining the module in the default AMD context.
        return this.loadAsync();
      },
      // endregion

      // region Configuration
      get config() {
        return this.__config || null;
      },

      get isConfigLoaded() {
        return this.__config !== undefined;
      },

      loadConfigAsync: function() {

        var promise = this.__configPromise;
        if(promise === null) {
          this.__configPromise = promise = core.configService.selectAsync(this.id)
            .then(function(config) {
              return (this.__config = config);
            }.bind(this));
        }

        return promise;
      }
      // endregion
    });
  };
});
