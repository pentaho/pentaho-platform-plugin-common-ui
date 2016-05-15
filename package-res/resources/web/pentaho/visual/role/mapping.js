/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/i18n!messages",
  "./mappingAttribute",
  "./level"
], function(module, bundle) {

  "use strict";

  return function(context) {

    var Complex = context.get("complex");

    /**
     * @name pentaho.visual.role.Mapping.Type
     * @class
     * @extends pentaho.type.Complex.Type
     *
     * @classDesc The type class of {@link pentaho.visual.role.Mapping}.
     */

    /**
     * @name pentaho.visual.role.Mapping
     * @class
     * @extends pentaho.type.Complex
     * @abstract
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.Mapping>} pentaho/visual/role/mapping
     *
     * @classDesc The `Mapping` class represents the association between
     * a visual role and the data properties, here named _attributes_,
     * of a visualization's current dataset.
     *
     * A mapping holds two pieces of information:
     *
     * 1. a fixed [level of measurement]{@link pentaho.visual.role.Mapping#level}
     *    in which the visual role should operate
     * 2. a list of associations to data properties,
     *    [attrs]{@link pentaho.visual.role.Mapping#attrs},
     *    each of type {@link pentaho.visual.role.MappingAttribute}.
     *
     * @description Creates a visual role mapping instance.
     * @constructor
     * @param {pentaho.visual.role.spec.UMapping} [spec] A visual role mapping specification.
     */
    var VisualRoleMapping = Complex.extend("pentaho.visual.role.Mapping", /** @lends pentaho.visual.role.Mapping# */{

      /**
       * Gets the level of measurement in which the visual role will effectively be operating on,
       * according to the mapping's current state.
       *
       * When {@link pentaho.visual.role.Mapping#level} is not `null`,
       * that measurement level is returned.
       * Otherwise,
       * the value of {@link pentaho.visual.role.Mapping#levelAuto},
       * which can be `undefined`, is returned.
       *
       * A visualization should respect the value of this property and actually
       * operate the visual role in the corresponding mode.
       *
       * @type {!pentaho.visual.role.MeasurementLevel|undefined}
       * @readOnly
       */
      get levelEffective() {
        throw new Error("Implement me!");
      },

      /**
       * Gets or sets the fixed measurement level in which the visual role is to operate on.
       *
       * When `null`,
       * the visual role operates in the automatically determined measurement level,
       * as returned by {@link pentaho.visual.role.Mapping#levelAuto}.
       *
       * When specified,
       * it must be one of the measurement levels returned by
       * {@link pentaho.visual.role.Mapping.Type#levelsEffective},
       * or, otherwise, the mapping is considered _invalid_.
       *
       * This JS property is sugar for `this.get("level")` and `this.set("level", value)`.
       *
       * @type {pentaho.visual.role.MeasurementLevel}
       */
      get level() {
        return this.get("level");
      },

      set level(value) {
        this.set("level", value);
      },

      /**
       * Gets or sets the attributes of the visual role mapping.
       *
       * This JS property is sugar for
       * `this.get("attrs")` and `this.set("attrs", value)`.
       *
       * @type pentaho.type.List<pentaho.visual.role.MappingAttribute>
       */
      get attributes() {
        return this.get("attrs");
      },

      set attributes(value) {
        this.set("attrs", value);
      },

      /**
       * Gets the automatic measurement level.
       *
       * The automatic measurement level is determined based on the visual role's
       * [possible measurement levels]{@link pentaho.type.role.Mapping.Type#levelsEffective}
       * and the measurement levels supported by the currently mapped data properties.
       *
       * When the mapping is empty (has no mapped attributes),
       * `undefined` is returned.
       *
       * When the mapping is invalid, `undefined` is returned.
       *
       * When more than one measurement level could be used,
       * the _highest_ measurement level is preferred.
       *
       * @type {!pentaho.visual.role.MeasurementLevel|undefined}
       * @readOnly
       */
      get levelAuto() {
        throw new Error("Implement me!");
      },

      type: /** @lends pentaho.visual.role.Mapping.Type# */{
        id: module.id,

        props: [
          // TODO: discrete domain refinement
          {name: "level", type: "pentaho/visual/role/level"},

          {name: "attrs", type: ["pentaho/visual/role/mappingAttribute"]}
        ]
      }
    })
    .implement({type: bundle.structured.mapping});

    return VisualRoleMapping;
  };
});