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
  "module",
  "pentaho/module/Annotation",
  "./service"
], function(module, Annotation, themeService) {

  var LoadThemeAnnotation = Annotation.extend(module.id, /** @lends pentaho.theme.LoadThemeAnnotation# */{
    /**
     * @classDesc The `LoadThemeAnnotation` causes a module's associated theme resources, if any,
     * to be loaded when the module is loaded.
     *
     * @name LoadThemeAnnotation
     * @memberOf pentaho.theme
     * @class
     * @extend pentaho.module.Annotation
     *
     * @description Creates a _load theme_ annotation associated with a given module.
     * @constructor
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     */
  }, /** @lends pentaho.theme.LoadThemeAnnotation */{
    /**
     * Gets the type of annotation.
     *
     * @type {string}
     * @readOnly
     * @override
     */
    get id() {
      return module.id;
    },

    /**
     * Creates an asynchronous annotation, given the annotated module and the annotation specification.
     *
     * This method loads a module's theme explicitly by using the
     * {@link pentaho.theme.IService#loadModuleThemeAsync} method.
     *
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     * @param {object} annotSpec - The annotation specification.
     * @return {Promise.<pentaho.theme.LoadThemeAnnotation>} A promise that resolves to the created annotation.
     * @override
     */
    createAsync: function(forModule, annotSpec) {
      return themeService.loadModuleThemeAsync(forModule.id).then(function() {
        return new LoadThemeAnnotation(forModule);
      });
    }
  });

  return LoadThemeAnnotation;
});
