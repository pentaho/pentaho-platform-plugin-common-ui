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
  "pentaho/lang/Base",
  "../ThemeAnnotation",
  "pentaho/module/metaService",
  "pentaho/module/util",
  "pentaho/util/text",
  "pentaho/lang/ArgumentRequiredError",
  "pentaho/shim/es6-promise"
], function(module, Base, ThemeAnnotation, metaService, moduleUtil, text, ArgumentRequiredError) {

  /**
   * @classDesc The main implementation of `pentaho.theme.IService`.
   *
   * @name Service
   * @memberOf pentaho.theme.impl
   * @class
   * @extend pentaho.lang.Base
   * @implements {pentaho.theme.IService}
   *
   * @description Creates a service instance.
   * @constructor
   */

  return Base.extend(module.id, /** @lends pentaho.theme.impl.Service# */{

    loadModuleThemeAsync: function(moduleOrIdOrArrayOf) {
      if(!moduleOrIdOrArrayOf) {
        throw new ArgumentRequiredError("moduleOrIdOrArrayOf");
      }

      if(!Array.isArray(moduleOrIdOrArrayOf)) {
        moduleOrIdOrArrayOf = [moduleOrIdOrArrayOf];
      }

      var modules = moduleOrIdOrArrayOf
        .map(function(moduleOrId) {
          return typeof moduleOrId === "string" ? metaService.get(moduleOrId) : moduleOrId;
        })
        .filter(function(module) {
          return module !== null;
        });

      if(modules.length === 0) {
        return Promise.resolve();
      }

      return Promise.all(modules.map(loadModuleThemeAsync));
    },

    classifyDomAsModule: function(domElement, moduleOrId) {
      var moduleId = getModuleId(moduleOrId);
      var classList = domElement.classList;
      if(classList) {
        classList.add(getModuleNameCssClass(moduleId));
        // NOOP if duplicate.
        classList.add(getModuleUniqueCssClass(moduleId));
      }
    },

    getModuleNameCssSelector: function(moduleOrId) {
      var moduleId = getModuleId(moduleOrId);
      return "." + getModuleNameCssClass(moduleId);
    },

    getModuleUniqueCssSelector: function(moduleOrId) {
      var moduleId = getModuleId(moduleOrId);
      return "." + getModuleUniqueCssClass(moduleId);
    },

    getModuleCssClasses: function(moduleOrId) {
      var moduleId = getModuleId(moduleOrId);

      var cssClasses = [
        getModuleNameCssClass(moduleId),
        getModuleUniqueCssClass(moduleId)
      ]; // TODO avoid duplicates?

      return cssClasses.join(" ");
    }
  });

  /**
   * Gets the identifier of a module, given the module or an identifier.
   *
   * @param {pentaho.module.IMeta|string} moduleOrId - The module or identifier.
   * @return {string} The module identifier.
   */
  function getModuleId(moduleOrId) {
    return typeof moduleOrId === "string" ? moduleOrId : moduleOrId.id;
  }

  /**
   * Loads the theme resources of a given module, if any.
   *
   * Determines if the module has an associated
   * [ThemeAnnotation]{@link pentaho.theme.ThemeAnnotation},
   * in which case its
   * [main]{@link pentaho.theme.ThemeAnnotation#main} and
   * [extensions]{@link pentaho.theme.ThemeAnnotation#extensions} resource modules
   * are loaded.
   *
   * If module is a type module,
   * any theme resources of ascendant modules are also loaded.
   *
   * @param {pentaho.module.IMeta} module - The module object.
   * @return {Promise} A promise which is resolved when the themes are loaded.
   */
  function loadModuleThemeAsync(module) {
    // Load any base modules first, so that it is more likely
    // that CSS order precedence based on link tag document order is in effect.
    var baseModule = (module.kind === "type") ? module.ancestor : null;
    if(baseModule !== null) {
      return loadModuleThemeAsync(baseModule).then(loadLocalThemeAsync);
    }

    return loadLocalThemeAsync();

    /**
     * Loads any local theme resources according to an existing ThemeAnnotation.
     *
     * @return {Promise} A promise which is resolved when the local themes are loaded.
     */
    function loadLocalThemeAsync() {
      var annotation = module.getAnnotation(ThemeAnnotation);
      if(annotation !== null) {
        return loadThemeAnnotationAsync(annotation);
      }

      // NOOP
      return Promise.resolve();
    }
  }

  /**
   * Loads any local theme resources of a given ThemeAnnotation.
   *
   * @param {pentaho.theme.ThemeAnnotation} annotation - The theme annotation.
   * @return {Promise} A promise which is resolved when the local themes are loaded.
   */
  function loadThemeAnnotationAsync(annotation) {
    // Again, main should be loaded before extensions :-(.
    return annotation.main.loadAsync().then(function() {
      if(annotation.extensions !== null) {
        return Promise.all(annotation.extensions.map(function(extension) {
          return extension.loadAsync();
        }));
      }
    });
  }

  /**
   * Gets a CSS class that selects all versions of a given module.
   *
   * @param {string} id - The module identifier.
   * @return {string} The CSS class.
   */
  function getModuleNameCssClass(id) {
    return sanitizeCssClass(moduleUtil.parseId(id).name);
  }

  /**
   * Gets a CSS class that selects a given module.
   *
   * @param {string} id - The module identifier.
   * @return {string} The CSS class.
   */
  function getModuleUniqueCssClass(id) {
    return sanitizeCssClass(id);
  }

  /**
   * Sanitizes a module identifier for use as a CSS class name.
   *
   * @param {string} id - The module identifier.
   * @return {string} The CSS class.
   */
  function sanitizeCssClass(id) {
    return text.toSnakeCase(id);
  }
});
