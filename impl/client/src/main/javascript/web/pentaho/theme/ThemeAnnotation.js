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
  "pentaho/module/SyncAnnotation",
  "pentaho/module/metaService",
  "pentaho/lang/ArgumentRequiredError"
], function(module, SyncAnnotation, metaService, ArgumentRequiredError) {

  var createIfUndefinedKeyArgs = Object.freeze({createIfUndefined: true});

  var ThemeAnnotation = SyncAnnotation.extend(module.id, /** @lends pentaho.theme.ThemeAnnotation# */{
    /**
     * @classDesc The theme annotation associates theming resources with a module.
     *
     * This annotation does not cause the resources to be loaded, but merely defines them.
     *
     * To cause a module's theme, if any is defined by this annotation,
     * to be loaded when a module is loaded,
     * use the [LoadThemeAnnotation]{@link pentaho.theme.LoadThemeAnnotation} annotation.
     * Alternatively,
     * load a module's theme explicitly by using the {@link pentaho.theme.IService#loadModuleThemeAsync} method.
     *
     * A theme is constituted by a main resource module,
     * given by {@link pentaho.theme.ThemeAnnotation#main} and which is required,
     * and by any number of extension resource modules,
     * given by {@link pentaho.theme.ThemeAnnotation#extensions}.
     *
     * The resource module identifiers are relative to the annotated module,
     * [forModule]{@link pentaho.module.Annotation#forModule}.
     *
     * Theme resource modules can have a function as a value,
     * in which case the function is called to actually "instantiate" the theme.
     * The function receives the identifier of the annotated module and the current environment
     * and can optionally return a promise, in which case it is awaited for.
     * This allows for _CSS in JS_ stylesheets to be generated for a specific version of a module,
     * by enabling the generation of rules which use a module's
     * [unique CSS selector]{@link pentaho.theme.IService#getModuleUniqueCssSelector}.
     *
     * @alias ThemeAnnotation
     * @memberOf pentaho.theme
     * @class
     * @extend pentaho.module.SyncAnnotation
     *
     * @description Creates a theme annotation associated with a given module.
     * @constructor
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     * @param {pentaho.theme.spec.IThemeAnnotation} annotSpec - The theme annotation specification.
     *
     * @see pentaho.theme.LoadThemeAnnotation
     */
    constructor: function(forModule, annotSpec) {

      this.base(forModule);

      var mainId = annotSpec && annotSpec.main;
      if(!mainId) {
        throw new ArgumentRequiredError("main");
      }

      this._main = metaService.get(forModule.resolveId(mainId), createIfUndefinedKeyArgs);

      var extensionIds = annotSpec.extensions;
      if(extensionIds != null) {
        this._extensions = extensionIds.map(function(extensionId) {
          return metaService.get(forModule.resolveId(extensionId), createIfUndefinedKeyArgs);
        });
      } else {
        this._extensions = null;
      }
    },

    /**
     * Gets the theme's _main_ module.
     *
     * @type {pentaho/module/IMeta}
     * @readOnly
     */
    get main() {
      return this._main;
    },

    /**
     * Gets the theme's _extension_ modules.
     *
     * When not `null`, the array is not empty.
     *
     * @type {?(pentaho/module/IMeta[])}
     * @readOnly
     */
    get extensions() {
      return this._extensions;
    }
  });

  /**
   * Creates a theme annotation, given the annotated module and the theme specification.
   *
   * @name create
   * @memberOf pentaho.theme.ThemeAnnotation
   * @method
   * @param {pentaho.module.IMeta} forModule - The annotated module.
   * @param {pentaho.theme.spec.IThemeAnnotation} annotSpec - The theme specification.
   * @return {pentaho.module.ThemeAnnotation} The theme annotation.
   * @override
   */

  return ThemeAnnotation;
});