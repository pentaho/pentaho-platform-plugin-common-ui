/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  // so that r.js sees otherwise invisible dependencies.
  "./abstractModel",
  "../role/property"
], function() {

  "use strict";

  return [
    "./abstractModel",
    "../role/property",
    function(AbstractModel) {

      /**
       * @name pentaho.visual.base.Model.Type
       * @class
       * @extends pentaho.visual.base.AbstractModel.Type
       *
       * @classDesc The base class of visual model types.
       *
       * For more information see {@link pentaho.visual.base.Model}.
       */

      /**
       * @name Model
       * @memberOf pentaho.visual.base
       * @class
       * @extends pentaho.visual.base.AbstractModel
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.base.Model>} pentaho/visual/base/model
       *
       * @classDesc The `Model` class is the base class of internal models of visualizations.
       *
       * @constructor
       * @description Creates a `Model` instance.
       * @param {pentaho.visual.base.spec.IAbstractModel} [modelSpec] A plain object containing the
       * internal model specification.
       */
      var Model = AbstractModel.extend(/** @lends pentaho.visual.base.Model# */{
        $type: /** @lends pentaho.visual.base.Model.Type# */{
          defaultView: "./view",
          isAbstract: true
        }
      });

      return Model;
    }
  ];
});
