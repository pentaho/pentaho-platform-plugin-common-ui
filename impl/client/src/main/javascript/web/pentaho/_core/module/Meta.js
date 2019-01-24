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
  "require",
  "module",
  "../../lang/Base",
  "../../debug",
  "../../debug/Levels",
  "../../util/object",
  "../../util/logger",
  "../../util/promise",
  "../../util/text",
  "../../util/fun",
  "../../util/spec",
  "../../util/arg",
  "../../module/util",
  "../../lang/ArgumentRequiredError",
  "../../lang/OperationInvalidError"
], function(localRequire, module, Base, debugMgr, DebugLevels, O, logger, promiseUtil, textUtil, F,
            specUtil, argUtil, moduleUtil, ArgumentRequiredError, OperationInvalidError) {

  "use strict";

  var reFullAnnotationId = /Annotation$/;

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
         * The value of the module, if it has been loaded already,
         * or `undefined`, otherwise.
         *
         * @type {*}
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
         * @type {?object}
         * @private
         */
        this.__config = undefined;
        this.__configSpec = spec.config || null;
        this.__configPromise = null;

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
        if(value !== undefined) {
          this.__defineAmdModuleAsync(value);
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

      // region Value
      /** @inheritDoc */
      get value() {
        return this.__value;
      },

      /** @inheritDoc */
      get isLoaded() {
        return this._isLoaded;
      },

      /** @inheritDoc */
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
       * @param {(*|(function(pentaho.module.IMeta) : *))} value - The value or value factory function.
       *
       * @return {Promise} A promise for the value of the module.
       *
       * @private
       */
      __defineAmdModuleAsync: function(value) {

        if(F.is(value)) {
          define(this.id, ["pentaho/module!_"], value);
        } else {
          define(this.id, F.constant(value));
        }

        // Capture the just defined module in the AMD context of localRequire.
        // Not calling this, would end up defining the module in the default AMD context.
        return this.loadAsync();
      },
      // endregion

      // region Configuration
      /** @inheritDoc */
      get config() {
        return this.__config || null;
      },

      /** @inheritDoc */
      get isConfigLoaded() {
        return this.__config !== undefined;
      },

      /** @inheritDoc */
      loadConfigAsync: function() {

        var promise = this.__configPromise;
        if(promise === null) {
          this.__configPromise = promise = core.configService.selectAsync(this.id)
            .then(function(config) {
              return (this.__config = config);
            }.bind(this));
        }

        return promise;
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

      /**
       * Gets an annotation, or a promise for one, if it is created already.
       *
       * @param {Class.<pentaho.module.Annotation>} Annotation - The annotation class.
       * @param {string} annotationId - The annotation identifier.
       * @param {?object} keyArgs - The keyword arguments object.
       * @param {boolean} [keyArgs.assertPresent=false] - Indicates that an error should be thrown
       *  if the module is not annotated with an annotation of the requested type or it is not loaded.
       * @param {boolean} sync - Indicates if the value should be returned directly and any errors thrown, or
       * if a promise should be returned.
       *
       * @return {pentaho.module.Annotation} The annotation or a promise for one.
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
              return promiseUtil.error(createErrorNotPresent(this.id, annotationId));
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
            return Promise.reject(createErrorNotPresent(this.id, annotationId));
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
      }
      // endregion

      // endregion
    });

    /**
     * Creates an error for when an annotation is not present in a module.
     *
     * @param {string} moduleId - The module identifier.
     * @param {string} annotationId - The annotation identifier.
     *
     * @return {pentaho.lang.OperationInvalidError} The "not present" error.
     */
    function createErrorNotPresent(moduleId, annotationId) {
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
  };
});
