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
  "pentaho/type/loader",
  "pentaho/util/promise",
  "pentaho/util/error"
], function(localRequire, moduleMetaService, typeLoader, promiseUtil, error) {

  /**
   * The `pentaho/visual/util` contains utilities for dealing with visualizations.
   *
   * @namespace pentaho.visual.util
   * @amd pentaho/visual/util
   */

  return /** @lends pentaho.visual.util */{
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

      if(!vizTypeId) {
        return Promise.reject(error.argRequired("vizTypeId"));
      }

      var __Model = null;
      var __defaultViewTypeId;

      return typeLoader.resolveTypeAsync(vizTypeId)
        .then(function(Model) {

          __Model = Model;

          __defaultViewTypeId = Model.type.defaultViewAbs;
          if(!__defaultViewTypeId) {
            throw new Error("No registered default view.");
          }

          return promiseUtil.require(__defaultViewTypeId, localRequire);
        })
        .then(function(DefaultView) {
          return {
            Model: __Model,
            View: DefaultView,
            viewTypeId: __defaultViewTypeId
          };
        });
    }
  };
});
