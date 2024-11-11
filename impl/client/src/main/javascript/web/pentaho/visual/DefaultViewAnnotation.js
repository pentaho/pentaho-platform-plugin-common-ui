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
  "pentaho/module/metaService"
], function(module, Annotation, moduleMetaService) {

  var DefaultViewAnnotation = Annotation.extend(module.id, /** @lends pentaho.visual.DefaultViewAnnotation# */{
    /**
     * @classDesc The `DefaultViewAnnotation` marks the existence of a View module
     * and makes it be the default view to use for the annotated model.
     *
     * By default, the default view is the sibling of the annotated module which is named `View`.
     * This can be overridden with
     * {@link pentaho.visual.spec.IDefaultViewAnnotation#module}.
     *
     * @name DefaultViewAnnotation
     * @memberOf pentaho.visual
     * @class
     * @extend pentaho.module.Annotation
     * @see pentaho.visual.IView
     *
     * @description Creates a default view annotation associated with a given module.
     * @constructor
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     * @param {pentaho.module.IMeta} defaultViewModule - The default view module.
     */
    constructor: function(forModule, defaultViewModule) {
      this.base(forModule);

      this._module = defaultViewModule;
    },

    /**
     * Gets the associated default view module.
     *
     * @type {pentaho.module.IMeta}
     * @readOnly
     */
    get module() {
      return this._module;
    }
  }, /** @lends pentaho.visual.DefaultViewAnnotation */{
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
     * Creates a default view annotation, given the annotated module and the annotation specification.
     *
     * @param {pentaho.module.IMeta} forModule - The annotated module.
     * @param {pentaho.visual.spec.IDefaultViewAnnotation} annotSpec - The annotation specification.
     * @return {Promise.<pentaho.visual.DefaultViewAnnotation>} A default view annotation.
     * @override
     */
    createAsync: function(forModule, annotSpec) {

      var moduleId = annotSpec && annotSpec.module;

      moduleId = forModule.resolveId(moduleId || "./View");

      var defaultViewModule = moduleMetaService.get(moduleId, {createIfUndefined: true});

      return Promise.resolve(new DefaultViewAnnotation(forModule, defaultViewModule));
    }
  });

  return DefaultViewAnnotation;
});
