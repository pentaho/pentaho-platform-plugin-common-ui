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
  "../util/spec"
], function(module, Base, specUtil) {

  var UIInfo = Base.extend(module.id, /** @lends pentaho.module.UIInfo# */{

    /**
     * @classDesc A UI information class for modules.
     * @alias UIInfo
     * @memberOf pentaho.module
     * @class
     * @extends pentaho.lang.Base
     * @implements {pentaho.IUIInfo}
     *
     * @description Creates a UI information object.
     * @constructor
     * @param {pentaho.IUIInfo} spec - A UI information specification.
     */
    constructor: function(spec) {
      this.label = spec.label;
      this.description = spec.description || null;
      this.helpUrl = spec.helpUrl || null;
      this.category = spec.category || null;
      this.ordinal = +spec.ordinal || 0;

      var value = spec.isBrowsable;
      this.isBrowsable = value == null || !!value;

      value = spec.isAdvanced;
      this.isAdvanced = value == null || !!value;

      Object.freeze(this);
    }
  }, /** @lends pentaho.module.UIInfo */{
    /**
     * Creates a UI information object.
     *
     * @param {pentaho.module.IMeta} infoModuleMeta - The UI information module.
     * @param {object} [infoSpec] - The UI information specification.
     * @param {object} [i18nBundle] - The i18n message bundle.
     *
     * @return {pentaho.module.UIInfo} A UI information object.
     */
    create: function(infoModuleMeta, infoSpec, i18nBundle) {
      var spec = {};

      var config = infoModuleMeta.config;
      if(config != null) {
        specUtil.merge(spec, spec);
      }

      if(infoSpec != null) {
        specUtil.merge(spec, infoSpec);
      }

      if(i18nBundle != null) {
        specUtil.merge(spec, i18nBundle);
      }

      return new UIInfo(spec);
    }
  });

  return UIInfo;
});