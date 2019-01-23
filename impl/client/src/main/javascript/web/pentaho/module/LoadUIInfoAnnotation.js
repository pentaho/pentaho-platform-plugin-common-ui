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
  "pentaho/module/AsyncAnnotation",
  "./UIInfo",
  "./metaService"
], function(module, AsyncAnnotation, UIInfo, metaService) {

  var LoadUIInfoAnnotation = AsyncAnnotation.extend(module.id, /** @lends pentaho.module.LoadUIInfoAnnotation# */{
    /**
     * @classDesc The `LoadUIInfoAnnotation` marks the existence of an UI Info module
     * and causes it to be loaded when the annotated module is loaded.
     *
     * By default, the associated UI information module is named after the annotated module,
     * by appending `.info` to its identifier. This can be overridden with
     * {@link pentaho.module.spec.ILoadUIInfoAnnotation#module}.
     *
     * @name LoadUIInfoAnnotation
     * @memberOf pentaho.module
     * @class
     * @extend pentaho.module.AsyncAnnotation
     *
     * @description Creates a UI Info annotation associated with a given module.
     * @constructor
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     * @param {pentaho.IUIInfo} uiInfo - The UI Info.
     */
    constructor: function(forModule, uiInfo) {
      this._uiInfo = uiInfo;
    },

    /**
     * Gets the associated UI Info.
     *
     * @type {pentaho.IUIInfo}
     * @readOnly
     */
    get uiInfo() {
      return this._uiInfo;
    }
  }, /** @lends pentaho.module.LoadUIInfoAnnotation */{
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
     * Creates an asynchronous annotation,
     * given the annotated module and the annotation specification.
     *
     * This method loads the associated UI Info module.
     *
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     * @param {pentaho.module.spec.ILoadUIInfoAnnotation} annotSpec - The annotation specification.
     * @return {Promise.<pentaho.module.AsyncAnnotation>} A promise that resolves to the created annotation.
     * @override
     */
    createAsync: function(forModule, annotSpec) {

      var moduleId = annotSpec && annotSpec.module;
      if(!moduleId) {
        moduleId = forModule.id + ".info";
      } else {
        moduleId = forModule.resolveId(moduleId);
      }

      var uiInfoModule = metaService.get(moduleId, {createIfUndefined: true});
      return uiInfoModule.loadAsync().then(function(uiInfo) {

        if(!(uiInfo instanceof UIInfo)) {
          // Assume uiInfo is a specification.
          uiInfo = UIInfo.create(uiInfoModule, uiInfo);
        }

        return new LoadUIInfoAnnotation(forModule, uiInfo);
      });
    }
  });

  return LoadUIInfoAnnotation;
});
