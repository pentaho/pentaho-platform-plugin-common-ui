/*!
 * Copyright 2019 Hitachi Vantara. All rights reserved.
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
  "pentaho/module/metaService",
  "./DefaultViewAnnotation",
  "pentaho/theme/service",
  "pentaho/type/loader",
  "pentaho/util/object",
  "pentaho/util/promise",
  "pentaho/util/error"
], function(localRequire, moduleMetaService, DefaultViewAnnotation, themeService, typeLoader, O, promiseUtil, error) {

  /**
   * The `pentaho/visual/util` contains utilities for dealing with visualizations.
   *
   * @namespace pentaho.visual.util
   * @amd pentaho/visual/util
   */

  return /** @lends pentaho.visual.util */{
    /**
     * Gets the module of the default view class of a visualization, given its identifier.
     *
     * The default view class is determined by the
     * {@link pentaho.visual.DefaultViewAnnotation} annotation
     * associated to the visualization's model class.
     *
     * This method is only reliable to determine the default view module if the
     * {@link pentaho.visual.DefaultViewAnnotation} annotation can be got synchronously.
     * This will be the case if the visualization type module has already been loaded (or prepared)
     * or if the annotation has already been read asynchronously at least once.
     *
     * @param {string} vizTypeId - The visualization identifier.
     * @param {object} [keyArgs] - The keyword arguments object.
     * @param {boolean} [keyArgs.assertResult=true] - Indicates that an error should be thrown
     *  if a default view is not defined or cannot be obtained synchronously for the given visualization.
     *
     * @param {boolean} [keyArgs.inherit=false] - Indicates that the {@link pentaho.visual.DefaultViewAnnotation}
     * annotation can be obtained from an ancestor visualization type.
     *
     * @throws {pentaho.lang.ArgumentRequiredError} When `vizTypeId` is not specified.
     * @throws {pentaho.lang.OperationInvalidError} When `keyArgs.assertResult` is true
     * and a default view is not defined or cannot be obtained synchronously for the given visualization.
     *
     * @return {?pentaho.module.IMeta} The module of the default view; `null` if not available.
     */
    getDefaultViewModule: function(vizTypeId, keyArgs) {
      if(!vizTypeId) {
        throw error.argRequired("vizTypeId");
      }

      var modelModule = moduleMetaService.get(vizTypeId, {createIfUndefined: true});

      keyArgs = O.assignOwn({assertResult: true}, keyArgs);

      var defaultAnnotation = modelModule.getAnnotation(DefaultViewAnnotation, keyArgs);

      return defaultAnnotation && defaultAnnotation.module;
    },

    /**
     * Gets a promise for the model and default view classes, given a visualization type identifier.
     *
     * @param {string} vizTypeId - The identifier of the visualization type.
     * @param {object} [keyArgs] - The keyword arguments object.
     * @param {boolean} [keyArgs.assertResult=true] - Indicates that the promise should be rejected with an error
     *  if the specified visualization type is not annotated with a
     *  {@link pentaho.visual.DefaultViewAnnotation} annotation.
     * @param {boolean} [keyArgs.inherit=false] - Indicates that the {@link pentaho.visual.DefaultViewAnnotation}
     * annotation can be obtained from an ancestor visualization type.
     * @return {Promise.<({
     *     Model: Class.<pentaho.visual.Model>,
     *     View:  ?Class.<pentaho.visual.IView>,
     *     viewTypeId: ?string
     *  })>} A promise that resolves to an object containing the model and default view classes,
     *  as well as the identifier of the view class.
     */
    getModelAndDefaultViewClassesAsync: function(vizTypeId, keyArgs) {

      if(!vizTypeId) {
        return Promise.reject(error.argRequired("vizTypeId"));
      }

      return new Promise(function(resolve, reject) {

        var modelModule = moduleMetaService.get(vizTypeId, {createIfUndefined: true});
        var modelClassPromise = modelModule.loadAsync();

        keyArgs = O.assignOwn({assertResult: true}, keyArgs);

        var viewInfoPromise = modelModule.getAnnotationAsync(DefaultViewAnnotation, keyArgs)
          .then(loadDefaultViewInfo);

        Promise
          .all([modelClassPromise, viewInfoPromise])
          .then(function(results) {
            var Model = results[0];
            var viewInfo = results[1];

            resolve({
              Model: Model,
              View: viewInfo && viewInfo.Class,
              viewTypeId: viewInfo && viewInfo.id
            });
          }, reject);
      });
    },

    /**
     * Marks a DOM element as the container element of a visualization.
     *
     * Classes are added to the DOM element so that any themes
     * associated with either the model or the view classes are applied to it.
     *
     * @param {HTMLElement} domElement - The DOM element.
     * @param {?string} [vizTypeId] - The identifier of the visualization type.
     * @param {?string} [viewTypeId] - The identifier of the view type.
     *
     * @see pentaho.theme.IService#classifyDomAsModule
     */
    classifyDom: function(domElement, vizTypeId, viewTypeId) {

      if(vizTypeId) {
        themeService.classifyDomAsModule(domElement, vizTypeId);
      }

      if(viewTypeId) {
        themeService.classifyDomAsModule(domElement, viewTypeId);
      }
    },

    /**
     *
     * @param {?string} [vizTypeId] - The identifier of the visualization type.
     * @param {?string} [viewTypeId] - The identifier of the view type.
     *
     * @return {string} The Css Classes
     */
    getCssClasses: function(vizTypeId, viewTypeId) {
      var cssClasses = [];

      if(vizTypeId) {
        cssClasses.push(themeService.getModuleCssClasses(vizTypeId));
      }

      if(viewTypeId) {
        cssClasses.push(themeService.getModuleCssClasses(viewTypeId));
      }

      return cssClasses.join(" ");
    }
  };

  /**
   * Gets a promise for the view information of a given default view annotation.
   *
   * @param {?pentaho.visual.DefaultViewAnnotation} defaultAnnotation - The default view annotation.
   *
   * @return {?Promise.<({Class: Class.<pentaho.visual.IView>, id: string})>} A promise for the default view
   * information, if the annotation is defined; `null`, otherwise.
   */
  function loadDefaultViewInfo(defaultAnnotation) {
    if(defaultAnnotation !== null) {
      var viewModule = defaultAnnotation.module;
      return viewModule.loadAsync().then(function(View) {
        return {Class: View, id: viewModule.id};
      });
    }

    return null;
  }
});
