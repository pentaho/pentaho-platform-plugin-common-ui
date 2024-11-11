/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

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
