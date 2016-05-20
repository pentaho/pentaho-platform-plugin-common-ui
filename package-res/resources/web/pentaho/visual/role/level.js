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
  "pentaho/type/number",
  "pentaho/type/date"
], function(module, bundle, numberFactory, dateFactory) {

  "use strict";

  return function(context) {

    var Refinement = context.get("refinement");
    var orderedLevels = ["nominal", "ordinal", "quantitative"];

    var PentahoNumber = context.get(numberFactory);
    var PentahoDate = context.get(dateFactory);

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
     * Currently, the following levels of measurement are supported:
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

      type: /** @lends pentaho.visual.role.MeasurementLevel.Type# */{

        id: module.id,
        of: "string",
        facets: ["DiscreteDomain"],
        domain: orderedLevels,

        /**
         * Returns a value that indicates if a given level of measurement is
         * considered _quantitative_.
         *
         * The values of the quantitative levels of measurement are:
         * 1. `"quantitative"`.
         *
         * @param {string|pentaho.type.String} level The measurement level.
         *
         * @return {boolean} `true` if it is _quantitative_; `false`, otherwise.
         */
        isQuantitative: function(level) {
          level = this.to(level);
          return level.value === "quantitative";
        },

        /**
         * Returns a value that indicates if a given level of measurement is
         * considered _qualitative_.
         *
         * The values of the qualitative levels of measurement are:
         * 1. `"nominal"`
         * 2. `"ordinal"`.
         *
         * @param {string|pentaho.type.String} level The measurement level.
         *
         * @return {boolean} `true` if it is _qualitative_; `false`, otherwise.
         */
        isQualitative: function(level) {
          level = this.to(level);
          return level.value === "nominal" || level.value === "ordinal";
        },

        /**
         * Returns a value that indicates if a given type can only be associated with
         * a qualitative level of measurement.
         *
         * Any type that is not one of (or a subtype of)
         * [Number]{@link pentaho.type.Number} or [Date]{@link pentaho.type.Date}
         * can only be associated with a qualitative level of measurement.
         *
         * @return {boolean} `true` if it "is only qualitative"; `false`, otherwise.
         */
        isTypeQualitativeOnly: function(type) {
          return !(type.isSubtypeOf(PentahoNumber.type) || type.isSubtypeOf(PentahoDate.type));
        },

        /**
         * Compares two levels of measurement according to the order from _lowest_ to _highest_.
         *
         * A level of measurement that is not one of the
         * {@link pentaho.visual.role.MeasurementLevel} values
         * it considered lower than these.
         *
         * @param {string|pentaho.type.String} [a] The first level of measurement.
         * @param {string|pentaho.type.String} [b] The second level of measurement.
         *
         * @return {number} A negative number, if `a` is _lower_ than `b`;
         * a positive number, if `a` is _higher_ than `b`;
         * and, `0`, if these are same level of measurement.
         */
        compare: function(a, b) {
          var indexA = orderedLevels.indexOf(a.valueOf());
          var indexB = orderedLevels.indexOf(b.valueOf());
          return indexA === indexB ?  0 : // includes both negative
                 indexA < 0        ? -1 : // undefined is lowest
                 indexB < 0        ? +1 : // idem
                 indexA - indexB;         // compare two non-negative indexes
        }
      }
    })
    .implement({type: bundle.structured.level});
  };
});
