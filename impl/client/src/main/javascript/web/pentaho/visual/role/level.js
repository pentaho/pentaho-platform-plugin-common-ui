/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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

  return [
    "string",
    "number",
    "date",
    "simple",
    "enum",
    function(PentahoString, PentahoNumber, PentahoDate, Simple, Enum) {

      var pentahoNumber = PentahoNumber.type;
      var pentahoDate = PentahoDate.type;
      var pentahoSimple = Simple.type;

      /**
       * @name pentaho.visual.role.Level.Type
       * @class
       * @extends pentaho.type.String.Type
       * @extends pentaho.type.mixins.DiscreteDomain.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.Level}.
       */

      /**
       * @name pentaho.visual.role.Level
       * @class
       * @extends pentaho.type.String
       * @extends pentaho.type.mixins.DiscreteDomain
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.Level>} pentaho/visual/role/level
       *
       * @classDesc The `Level` class is [String]{@link pentaho.type.String} based enumeration
       * that represents a **Level or Measurement**,
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

      var Level = PentahoString.extend({

        $type: /** @lends pentaho.visual.role.Level.Type# */{

          id: module.id,
          mixins: [Enum],
          domain: ["nominal", "ordinal", "quantitative"],

          /**
           * Returns a value that indicates if a given level of measurement is
           * considered _quantitative_.
           *
           * The values of the quantitative levels of measurement are:
           * 1. `"quantitative"`.
           *
           * @param {string|pentaho.type.String} level - The measurement level.
           *
           * @return {boolean} `true` if it is _quantitative_; `false`, otherwise.
           */
          isQuantitative: function(level) {
            level = this.to(level);
            return !!level && level.value === "quantitative";
          },

          /**
           * Returns a value that indicates if a given level of measurement is
           * considered _qualitative_.
           *
           * The values of the qualitative levels of measurement are:
           * 1. `"nominal"`
           * 2. `"ordinal"`.
           *
           * @param {string|pentaho.type.String} level - The measurement level.
           *
           * @return {boolean} `true` if it is _qualitative_; `false`, otherwise.
           */
          isQualitative: function(level) {
            level = this.to(level);
            return !!level && (level.value === "nominal" || level.value === "ordinal");
          },

          /**
           * Gets a value that indicates if a given type can only be associated with
           * a qualitative level of measurement.
           *
           * Any type that is not one of (or a subtype of)
           * [Number]{@link pentaho.type.Number} or [Date]{@link pentaho.type.Date},
           * and that is also not a super type of these,
           * can only be associated with a qualitative level of measurement.
           *
           * @param {pentaho.type.Type} type - The type to test.
           *
           * @return {boolean} `true` if it "is only qualitative"; `false`, otherwise.
           */
          isTypeQualitativeOnly: function(type) {
            return !type.isSubtypeOf(pentahoNumber) &&
                   !type.isSubtypeOf(pentahoDate) &&
                   !pentahoSimple.isSubtypeOf(type);
          }
        }
      })
      .implement({$type: bundle.structured.level});

      return Level;
    }
  ];
});
