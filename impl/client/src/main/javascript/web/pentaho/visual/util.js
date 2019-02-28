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
  "pentaho/util/promise",
  "pentaho/util/error"
], function(localRequire, moduleMetaService, DefaultViewAnnotation, themeService, typeLoader, promiseUtil, error) {

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
     * @param {string} vizTypeId - The visualization identifier.
     *
     * @throws {pentaho.lang.ArgumentRequiredError} When `vizTypeId` is not specified.
     * @throws {pentaho.lang.OperationInvalidError} When the model class of the given visualization is not annotated
     *   with {@link pentaho.visual.DefaultViewAnnotation}.
     *
     * @return {pentaho.module.IMeta} The module of the default view.
     *
     * @see pentaho.visual.util.getModelAndDefaultViewModules
     */
    getDefaultViewModule: function(vizTypeId) {
      return this.getModelAndDefaultViewModules(vizTypeId).view;
    },

    /**
     * Gets the modules of the model class and of the default view class of a visualization,
     * given its identifier.
     *
     * The default view class is determined by the
     * {@link pentaho.visual.DefaultViewAnnotation} annotation
     * associated to the visualization's model class.
     *
     * @param {string} vizTypeId - The visualization identifier.
     *
     * @throws {pentaho.lang.ArgumentRequiredError} When `vizTypeId` is not specified.
     * @throws {pentaho.lang.OperationInvalidError} When the model class of the given visualization is not annotated
     *   with {@link pentaho.visual.DefaultViewAnnotation}.
     *
     * @return {({model: pentaho.module.IMeta, view: pentaho.module.IMeta})} An object
     * containing the modules of the model class and the default view class.
     */
    getModelAndDefaultViewModules: function(vizTypeId) {
      if(!vizTypeId) {
        throw error.argRequired("vizTypeId");
      }

      var modelModule = moduleMetaService.get(vizTypeId, {createIfUndefined: true});

      var viewModule = modelModule.getAnnotation(DefaultViewAnnotation, {assertExists: true}).module;

      return {model: modelModule, view: viewModule};
    },

    /**
     * Gets a promise for the model and default view classes, given a visualization type identifier.
     *
     * @param {string} vizTypeId - The identifier of the visualization type.
     *
     * @return {Promise.<({
     *     Model: Class.<pentaho.visual.Model>,
     *     View:  Class.<pentaho.visual.IView>,
     *     viewTypeId: string
     *  })>} A promise that resolves to an object containing the model and default view classes,
     *  as well as the identifier of the view class.
     */
    getModelAndDefaultViewClassesAsync: function(vizTypeId) {
      var utils = this;

      return new Promise(function(resolve, reject) {

        var modules = utils.getModelAndDefaultViewModules(vizTypeId);

        Promise
          .all([modules.model.loadAsync(), modules.view.loadAsync()])
          .then(function(Classes) {
            var Model = Classes[0];
            var View = Classes[1];

            resolve({
              Model: Model,
              View: View,
              viewTypeId: modules.view.id
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
});
