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
  "pentaho/module/metaService"
], function(module, SyncAnnotation, moduleMetaService) {

  var DefaultViewAnnotation = SyncAnnotation.extend(module.id, /** @lends pentaho.visual.DefaultViewAnnotation# */{
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
     * @extend pentaho.module.SyncAnnotation
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
     * @return {pentaho.visual.DefaultViewAnnotation} A default view annotation.
     * @override
     */
    create: function(forModule, annotSpec) {

      var moduleId = annotSpec && annotSpec.module;

      moduleId = forModule.resolveId(moduleId || "./View");

      var defaultViewModule = moduleMetaService.get(moduleId, {createIfUndefined: true});

      return new DefaultViewAnnotation(forModule, defaultViewModule);
    }
  });

  return DefaultViewAnnotation;
});
