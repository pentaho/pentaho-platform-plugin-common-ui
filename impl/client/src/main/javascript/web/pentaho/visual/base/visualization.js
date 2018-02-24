/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/i18n!model",
  // so that r.js sees otherwise invisible dependencies.
  "./abstractModel",
  "./model"
], function(bundle) {

  "use strict";

  return [
    "./abstractModel",
    "./model",
    function(AbstractModel, Model) {

      /**
       * @name pentaho.visual.base.Visualization.Type
       * @class
       * @extends pentaho.visual.base.Model.Type
       *
       * @classDesc The base class of visual model types.
       *
       * For more information see {@link pentaho.visual.base.Visualization}.
       */

      /**
       * @name Visualization
       * @memberOf pentaho.visual.base
       * @class
       * @extends pentaho.visual.base.Model
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.base.Visualization>} pentaho/visual/base/visualization
       *
       * @classDesc The `Visualization` class is the abstract base class of visualizations.
       *
       * @constructor
       * @description Creates a `Visualization` instance.
       * @param {pentaho.visual.base.spec.IVisualization} [vizSpec] A plain object containing the visualization
       * specification.
       */
      var Visualization = AbstractModel.extend(/** @lends pentaho.visual.base.Visualization# */{

        // region serialization
        /** @inheritDoc */
        toSpecInContext: function(keyArgs) {

          // TODO: implement custom serialization

          return this.base(keyArgs);
        },
        // endregion

        $type: /** @lends pentaho.visual.base.Visualization.Type# */{
          isAbstract: true,

          props: [
            {
              /**
               * Gets or sets the internal model.
               *
               * This property can only be specified at construction time.
               * When not specified,
               * an empty model of the property's [valueType]{@link pentaho.type.Property.Type#valueType}
               * is attempted to be created.
               *
               * @name model
               * @memberOf pentaho.visual.base.Visualization#
               * @type {pentaho.visual.base.Model}
               */
              name: "model",
              valueType: Model,
              isRequired: true,
              isReadOnly: true,
              // Create a new instance each time.
              defaultValue: function() { return {}; }
            }
          ]
        }
      })
      .implement({$type: bundle.structured.visualization});

      return Visualization;
    }
  ];
});
