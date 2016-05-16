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
  "pentaho/i18n!messages"
], function(module, bundle) {

  "use strict";

  return function(context) {

    var Refinement = context.get("refinement");
    var orderedLevels = ["nominal", "ordinal", "quantitative"];

    /**
     * @name pentaho.visual.role.MeasurementLevel
     * @class
     * @extends pentaho.type.String
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.MeasurementLevel>} pentaho/visual/role/level
     *
     * @classDesc The `MeasurementLevel` class is **a refinement of** the
     * [String]{@link pentaho.type.String} simple type that represents a **Level or Measurement**,
     * as understood by [S. S. Steven]{@link https://en.wikipedia.org/wiki/Level_of_measurement}.
     *
     * Currently, the following measurement levels are supported:
     *
     * * `nominal` - A _qualitative_ measurement level.
     *   The lowest in the hierarchy of levels of measurement.
     *   A **nominal** visual role represents data visually preserving the
     *   distinction between different things and also, possibly,
     *   enabling easy association of different, but somehow similar, things.
     *   However, a nominal visual role represents data in a way that conveys no
     *   preferential order between the various things.
     *
     *   An example nominal visual role would be one that used the _color hue_ of
     *   distinct visual marks for representing things.
     *
     *   Any data type can be represented by a nominal visual role.
     *
     * * `ordinal` - A _qualitative_ measurement level.
     *   An **ordinal** visual role adds to the characteristics of
     *   nominal visual roles the ability to convey order to the represented things.
     *
     *   An example ordinal visual role would be using 5 shades of a same color hue
     *   to represent the 5 distinct values of a qualitative data property.
     *
     *   Any data type can be represented by an ordinal visual role,
     *   even if order needs to be attributed by some external mechanism
     *   (natural/source order, alphabetic, order by other property,
     *    explicit given order of values).
     *
     * * `quantitative` - Aggregates the _interval_ and _ratio_ levels of measurement,
     *    the highest in the hierarchy of levels of measurement.
     *    A **quantitative** visual role adds to the characteristics of ordinal visual roles
     *    the ability to visually represent the proportion between quantities (ratios),
     *    or, at least, the proportion between differences of quantities (intervals).
     *
     *    Only the {@link pentaho.type.Number} and {@link pentaho.type.Date} data types
     *    can be (directly) represented by a quantitative visual role.
     */
    return Refinement.extend("pentaho.visual.role.MeasurementLevel", {
      type: {
        id: module.id,
        of: "string",
        facets: ["DiscreteDomain"],
        domain: ["nominal", "ordinal", "quantitative"],

        isQuantitative: function(level) {
          level = this.to(level);
          return level.value === "quantitative";
        },

        isQualitative: function(level) {
          level = this.to(level);
          return level.value === "nominal" || level.value === "ordinal";
        },

        compare: function(a, b) {
          return orderedLevels.indexOf(a) - orderedLevels.indexOf(b);
        }
      }
    })
    .implement({type: bundle.structured.level});
  };
});
