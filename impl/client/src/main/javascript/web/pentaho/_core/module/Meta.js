/*!
 * Copyright 2018 - 2019 Hitachi Vantara. All rights reserved.
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
  "../../lang/Base",
  "../../debug",
  "../../debug/Levels",
  "../../util/object",
  "../../util/requireJS",
  "../../util/logger",
  "../../util/promise",
  "../../util/text",
  "../../util/fun",
  "../../util/spec",
  "../../util/arg",
  "../../module/util",
  "../../lang/ArgumentRequiredError",
  "../../lang/OperationInvalidError"
], function(module, Base, debugMgr, DebugLevels, O, requireJSUtil, logger, promiseUtil, textUtil, F,
            specUtil, argUtil, moduleUtil, ArgumentRequiredError, OperationInvalidError) {

  "use strict";

  var reFullAnnotationId = /Annotation$/;

  /**
   * Module is created, yet not loaded or prepared.
   * @type {number}
   * @default 0
   */
  var STATE_INIT = 0;

  /**
   * Module is prepared.
   *
   * Configuration and asynchronous annotations are loaded.
   *
   * @type {number}
   * @default 1
   */
  var STATE_PREPARED = 1;

  /**
   * Module is loaded.
   *
   * Module is prepared and its value has been loaded.
   *
   * @type {number}
   * @default 2
   */
  var STATE_LOADED = 2;

  /**
   * Module errored during preparation or loading.
   *
   * @type {number}
   * @default -1
   */
  var STATE_ERROR = -1;

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
       * @param {pentaho.module.spec.IMeta} spec - The specification of the metadata of the module.
       * @param {pentaho._core.module.Resolver} [resolver] - The module resolver function.
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

        this.ranking = 0;

        /**
         * The state of the module.
         *
         * @type {number}
         * @private
         */
        this.__state = STATE_INIT;

        /**
         * The value of the module, if it loaded successfully;
         * the preparation of loading error, if it failed loading;
         * `undefined`, otherwise.
         *
         * @type {*|Error|undefined}
         * @private
         */
        this.__result = undefined;

        /**
         * An object holding promises during the preparation and/or loading phases.
         *
         * @type {?({prepare: ?Promise, value: ?Promise})}
         * @private
         */
        this.__promisesControl = null;

        /**
         * Gets the configuration of the module.
         *
         * @memberOf pentaho.module.Meta#
         * @type {?object}
         * @private
         */
        this.__config = null;
        this.__configSpec = spec.config || null;

        /**
         * The store of annotations.
         *
         * @type {?({
         *   results: Object.<string, ({value: ?pentaho.module.Annotation, error: ?Error})>,
         *   specs: Object.<string, object>,
         *   promises: Object.<string, Promise.<?pentaho.module.Annotation>>
         * })}
         *
         * @private
         */
        this.__annotationsStore = null;

        this.__configure(spec);

        var value = spec.value;

        this.isVirtual = !!spec.isVirtual || value !== undefined;
        if(this.isVirtual) {
          this.__defineRequireJSValue(value);
        }
      },

      /**
       * Configures the module metadata.
       *
       * Currently, only the `ranking` and `annotations` options are supported.
       *
       * @param {pentaho.module.spec.IMeta} configSpec - The configuration specification.
       * @private
       * @internal
       */
      __configure: function(configSpec) {
        if("ranking" in configSpec) {
          this.ranking = +configSpec.ranking || 0;
        }

        var annotations = configSpec.annotations;
        if(annotations != null) {
          specUtil.merge(this.__getAnnotationsSpecs(), this.__rewriteAnnotationIds(annotations));
        }
      },

      /**
       * Rewrites the keys of an annotations specification so that they have the `Annotation` suffix.
       *
       * @param {Object.<string, ?object>} annotations - The annotations specification.
       * @return {Object.<string, ?object>} The rewritten annotations specification.
       * @private
       */
      __rewriteAnnotationIds: function(annotations) {

        var annotations2 = Object.create(null);

        Object.keys(annotations).forEach(function(annotationId) {
          annotations2[rewriteAnnotationId(annotationId)] = annotations[annotationId];
        });

        return annotations2;
      },

      /** @inheritDoc */
      resolveId: function(moduleId) {
        return moduleUtil.resolveModuleId(moduleId, this.id);
      },

      isSubtypeOf: function(baseIdOrAlias) {
        return false;
      },

      isInstanceOf: function(typeIdOrAlias) {
        return false;
      },

      // region State
      /** @inheritDoc */
      get isPrepared() {
        return this.__state >= STATE_PREPARED;
      },

      /** @inheritDoc */
      get isLoaded() {
        return this.__state >= STATE_LOADED;
      },

      /** @inheritDoc */
      get isRejected() {
        return this.__state === STATE_ERROR;
      },
      // endregion

      // region Preparation
      /** @inheritDoc */
      prepareAsync: function() {
        if(this.isPrepared) {
          return Promise.resolve();
        }

        if(this.isRejected) {
          return Promise.reject(this.__result);
        }

        // Load config.
        // Load all async annotations.
        var promisesControl = this.__getPromisesControl();
        if(promisesControl.prepare === null) {

          var promises = [];

          // 1. Configuration.
          if(core.configService !== null) {
            // RuleSet module and RuleSets themselves are initialized before the config service.
            core.configService.selectAsync(this.id).then(this.__setConfig.bind(this));
          }

          // 2. Annotations.
          var annotationsIds = this.__getAsyncAnnotationsIds();
          if(annotationsIds !== null) {
            promises.push(this.__loadAnnotationsAsync(annotationsIds));
          }

          promisesControl.prepare = Promise.all(promises)
            .then(this.__onPrepareResolved.bind(this), this.__onLoadRejected.bind(this));
        }

        return promisesControl.prepare;
      },

      /**
       * Marks a module as prepared.
       *
       * @private
       */
      __onPrepareResolved: function() {

        this.__state = STATE_PREPARED;

        // Release memory.
        if(this.__promisesControl !== null) {
          this.__promisesControl.prepare = null;
        }
      },
      // endregion

      // region Value
      /**
       * Registers the specified value of this module with the AMD module system.
       *
       * @param {(*|(function(pentaho.module.IMeta) : *))} value - The value or value factory function.
       * Possibly undefined.
       *
       * @private
       */
      __defineRequireJSValue: function(value) {
        requireJSUtil.define(this.id, ["pentaho/module!_"], F.is(value) ? value : F.constant(value));
      },

      /** @inheritDoc */
      get value() {
        if(this.isRejected) {
          throw this.__result;
        }

        // Will be undefined if not yet loaded.
        return this.__result;
      },

      /** @inheritDoc */
      get error() {
        return this.isRejected ? this.__result : null;
      },

      /** @inheritDoc */
      loadAsync: function() {
        if(this.isLoaded) {
          return Promise.resolve(this.__result);
        }

        if(this.isRejected) {
          return Promise.reject(this.__result);
        }

        // Promise preserves value or error!
        var promisesControl = this.__getPromisesControl();

        if(promisesControl.value === null) {

          promisesControl.value = Promise.all([requireJSUtil.promise(this.id), this.prepareAsync()])
            .then(
              function(results) { return this.__onLoadResolved(results[0]); }.bind(this),
              this.__onLoadRejected.bind(this));
        }

        return promisesControl.value;
      },

      /**
       * Gets the promises control. Creates the object if it isn't created yet.
       *
       * @return {({prepare: ?Promise, value: ?Promise})} The promises control.
       * @private
       */
      __getPromisesControl: function() {
        return this.__promisesControl || (this.__promisesControl = {prepare: null, value: null});
      },

      /**
       * Marks the module as loaded, given its value.
       *
       * @param {*} value - The module's value.
       * @return {*} The module's value.
       * @private
       */
      __onLoadResolved: function(value) {

        this.__state = STATE_LOADED;
        this.__result = value;

        // Release memory.
        this.__promisesControl = null;

        if(debugMgr.testLevel(DebugLevels.info, module)) {
          logger.info("Loaded module '" + this.id + "'.");
        }

        return value;
      },

      /**
       * Marks the module as rejected, given a preparation or loading error.
       *
       * @param {*} error - The module's preparation or loading error.
       * @return {Promise.<Error>} A rejected promise with an error.
       * @private
       */
      __onLoadRejected: function(error) {

        // May already have been rejected in the preparation catch and is now passing through the load catch.
        if(this.__state !== STATE_ERROR) {

          if(typeof error === "string") {
            error = new Error(error);
          }

          this.__state = STATE_ERROR;
          this.__result = error;

          // Release memory.
          this.__promisesControl = null;

          if(debugMgr.testLevel(DebugLevels.error, module)) {
            logger.error("Failed loading module '" + this.id + "'. Error: " + error.message);
          }
        }

        return Promise.reject(this.__result);
      },
      // endregion

      // region Configuration
      /** @inheritDoc */
      get config() {
        return this.__config;
      },

      /**
       * Sets the configuration of the module.
       *
       * @param {?object} config - The module's configuration or `null`.
       * @private
       */
      __setConfig: function(config) {
        this.__config = config;
      },
      // endregion

      // region Annotations
      /** @inheritDoc */
      hasAnnotation: function(Annotation) {

        var annotationId = getAnnotationId(Annotation);

        return this.__annotationsStore !== null && O.hasOwn(this.__annotationsStore.specs, annotationId);
      },

      /** @inheritDoc */
      getAnnotationsIds: function() {
        var annotationsStore = this.__annotationsStore;
        if(annotationsStore === null) {
          return null;
        }

        return Object.keys(annotationsStore.specs);
      },

      /** @inheritDoc */
      getAnnotation: function(Annotation, keyArgs) {

        var annotationId = getAnnotationId(Annotation);

        return this.__getAnnotationSync(Annotation, annotationId, keyArgs, true);
      },

      /** @inheritDoc */
      getAnnotationAsync: function(Annotation, keyArgs) {
        if(Annotation == null) {
          return Promise.reject(new ArgumentRequiredError("Annotation"));
        }

        var annotationId = Annotation.id;
        if(annotationId == null) {
          return Promise.reject(new ArgumentRequiredError("Annotation.id"));
        }

        if(Annotation.isSync) {
          return this.__getAnnotationSync(Annotation, annotationId, keyArgs, false);
        }

        var annotationsStore = this.__annotationsStore;

        // Is async and already loading/loaded?
        var annotationPromise = annotationsStore && O.getOwn(annotationsStore.promises, annotationId, null);
        if(annotationPromise !== null) {
          return annotationPromise;
        }

        var annotationSpec = annotationsStore && O.getOwn(annotationsStore.specs, annotationId, null);
        if(annotationSpec === null) {
          if(argUtil.optional(keyArgs, "assertPresent", false)) {
            return Promise.reject(createErrorAnnotationNotPresent(this.id, annotationId));
          }

          return Promise.resolve(null);
        }

        var me = this;

        annotationPromise = Annotation.createAsync(this, annotationSpec).then(function(annotation) {
          me.__setAnnotationResult(annotationId, annotation, null);
          return annotation;
        }, function(error) {
          me.__setAnnotationResult(annotationId, null, error);
          return Promise.reject(error);
        });

        return this.__setAnnotationPromise(annotationId, annotationPromise);
      },

      /**
       * Gets an annotation or a promise for one, if it is created already.
       *
       * @param {Class.<pentaho.module.Annotation>} Annotation - The annotation class.
       * @param {string} annotationId - The annotation identifier.
       * @param {?object} keyArgs - The keyword arguments object.
       * @param {boolean} [keyArgs.assertPresent=false] - Indicates that an error should be thrown
       *  if the module is not annotated with an annotation of the requested type or it is not loaded.
       * @param {boolean} sync - Indicates if the value should be returned directly and any errors thrown, or
       * if a promise should be returned.
       *
       * @return {pentaho.module.Annotation|Promise.<pentaho.module.Annotation>} The annotation or a promise for one.
       *
       * @private
       */
      __getAnnotationSync: function(Annotation, annotationId, keyArgs, sync) {

        var annotationsStore = this.__annotationsStore;

        var annotationResult = annotationsStore && O.getOwn(annotationsStore.results, annotationId, null);
        if(annotationResult === null) {
          var annotationSpec = annotationsStore && O.getOwn(annotationsStore.specs, annotationId, null);
          if(annotationSpec === null) {
            if(argUtil.optional(keyArgs, "assertPresent", false)) {
              return promiseUtil.error(createErrorAnnotationNotPresent(this.id, annotationId));
            }

            return promiseUtil.return(null, sync);
          }

          if(!Annotation.isSync) {
            return promiseUtil.error(new OperationInvalidError(
              "The asynchronous annotation '" + annotationId +
              "' has not yet been created in module '" + this.id + "'."), sync);
          }

          var annotation = null;
          var error = null;
          try {
            annotation = Annotation.create(this, annotationSpec);
          } catch(ex) {
            error = ex;
          }

          annotationResult = this.__setAnnotationResult(annotationId, annotation, error);
        }

        return annotationResult.error !== null
          ? promiseUtil.error(annotationResult.error, sync)
          : promiseUtil.return(annotationResult.value, sync);
      },

      // region Annotations' Helpers
      /**
       * Gets the annotations' store, creating it if not yet created.
       *
       * @return {?({
       *   results: Object.<string, ({value: ?pentaho.module.Annotation, error: ?Error})>,
       *   specs: Object.<string, object>,
       *   promises: Object.<string, Promise.<?pentaho.module.Annotation>>
       * })} The annotations' store.
       *
       * @private
       */
      __getAnnotationsStore: function() {
        return this.__annotationsStore ||
          (this.__annotationsStore = {results: null, specs: null, promises: null});
      },

      /**
       * Gets the annotations' specifications, from the annotations' store,
       * creating these, if not yet created.
       *
       * @return {?Object.<string, object>} The specifications of the annotations store.
       *
       * @private
       */
      __getAnnotationsSpecs: function() {

        var annotationsStore = this.__getAnnotationsStore();

        return annotationsStore.specs || (annotationsStore.specs = Object.create(null));
      },

      /**
       * Sets the result of creating an annotation and returns it.
       *
       * @param {string} annotationId - The type of annotation.
       * @param {?pentaho.module.Annotation} annotation - The annotation.
       * @param {?Error} error - The error.
       *
       * @return {({value: ?pentaho.module.Annotation, error: ?Error})} The annotation result.
       *
       * @private
       */
      __setAnnotationResult: function(annotationId, annotation, error) {

        var annotationsStore = this.__getAnnotationsStore();

        return (annotationsStore.results || (annotationsStore.results = Object.create(null)))[annotationId] = {
          value: annotation,
          error: error
        };
      },

      /**
       * Sets the promise for the creation of an asynchronous annotation and returns it.
       *
       * @param {string} annotationId - The type of annotation.
       * @param {Promise} promise - The annotation promise.
       *
       * @return {Promise} The annotation promise.
       * @private
       */
      __setAnnotationPromise: function(annotationId, promise) {

        var annotationsStore = this.__getAnnotationsStore();

        return (annotationsStore.promises || (annotationsStore.promises = Object.create(null)))[annotationId] = promise;
      },

      /**
       * Gets an array of asynchronous annotations identifiers, if any, or `null`, otherwise.
       *
       * @return {?Array.<string>} An array of module identifiers or `null`.
       * @private
       */
      __getAsyncAnnotationsIds: function() {
        var annotationsIds = this.getAnnotationsIds();
        if(annotationsIds !== null) {

          annotationsIds = annotationsIds.filter(isAsyncAnnotation);
          if(annotationsIds.length > 0) {
            return annotationsIds;
          }
        }

        return null;
      },

      /**
       * Loads existing annotations asynchronously, given their identifiers.
       *
       * @param {Array.<string>} annotationIds - The annotation identifiers.
       * @return {Promise.<Array.<pentaho.module.Annotation>>} A promise for an array of annotations.
       *
       * @private
       * @internal
       */
      __loadAnnotationsAsync: function(annotationIds) {

        var module = this;

        return Promise.all(annotationIds.map(function(annotationId) {
          return loadModuleByIdAsync(annotationId).then(function(Annotation) {
            return module.getAnnotationAsync(Annotation);
          });
        }));
      }
      // endregion

      // endregion
    });

    // region More annotation helpers
    /**
     * Creates an error for when an annotation is not present in a module.
     *
     * @param {string} moduleId - The module identifier.
     * @param {string} annotationId - The annotation identifier.
     *
     * @return {pentaho.lang.OperationInvalidError} The "not present" error.
     */
    function createErrorAnnotationNotPresent(moduleId, annotationId) {
      return new OperationInvalidError(
        "The annotation '" + annotationId + "' is not defined in module '" + moduleId + "'.");
    }

    /**
     * Gets the identifier of an annotation type.
     *
     * @param {Class.<pentaho.module.Annotation>} Annotation - The annotation class.
     *
     * @return {string} The annotation identifier.
     *
     * @throws {pentaho.lang.ArgumentRequiredError} When the `Annotation` argument is _nully_.
     * @throws {pentaho.lang.ArgumentRequiredError} When the `Annotation` argument does not have an `id` property.
     */
    function getAnnotationId(Annotation) {
      if(Annotation == null) {
        throw new ArgumentRequiredError("Annotation");
      }

      var annotationId = Annotation.id;
      if(annotationId == null) {
        throw new ArgumentRequiredError("Annotation.id");
      }

      return annotationId;
    }

    /**
     * Rewrites the identifier of an annotation type so it has the `Annotation` suffix.
     *
     * @param {string} annotationId - The annotation type identifier.
     * @return {string} The rewritten annotation type identifier.
     */
    function rewriteAnnotationId(annotationId) {
      return reFullAnnotationId.test(annotationId) ? annotationId : (annotationId + "Annotation");
    }

    /**
     * Determines if an annotation is asynchronous, given its identifier.
     *
     * @param {string} annotationId - The annotation identifier.
     * @return {boolean} `true` if it is asynchronous; `false`, otherwise.
     */
    function isAsyncAnnotation(annotationId) {
      if(core.asyncAnnotationModule === null) {
        return false;
      }

      var module = core.moduleMetaService.get(annotationId);
      return module !== null && module.isSubtypeOf(core.asyncAnnotationModule);
    }
    // endregion

    /**
     * Loads an existing module given its identifier.
     *
     * @param {string} moduleId - The module identifier.
     * @return {Promise} A promise for the module's value.
     */
    function loadModuleByIdAsync(moduleId) {
      return core.moduleMetaService.get(moduleId).loadAsync();
    }
  };
});
