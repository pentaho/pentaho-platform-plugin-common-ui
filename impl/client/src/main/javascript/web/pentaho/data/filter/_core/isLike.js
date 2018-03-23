/*!
 * Copyright 2017 Hitachi Vantara. All rights reserved.
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
  "../KnownFilterKind"
], function(KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.IsLike.Type
     * @class
     * @extends pentaho.data.filter.Property.Type
     *
     * @classDesc The type class of the is-like filter type.
     *
     * For more information see {@link pentaho.data.filter.IsLike}.
     */

    /**
     * @name pentaho.data.filter.IsLike
     * @class
     * @extends pentaho.data.filter.Property
     * @amd {pentaho.type.spec.UTypeModule<pentaho.data.filter.IsLike>} pentaho/data/filter/isLike
     *
     * @classDesc The `IsLike` class represents a simple string matching filter.
     * This filter selects elements having the formatted value match an affix
     * (ie prefix, suffix or infix) of a reference value: [value]{@link pentaho.data.filter.IsLike#value}.
     *
     * @description Creates an is-like filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsLike} [spec] - An is-like filter specification.
     */

    filter.IsLike = filter.Property.extend(/** @lends pentaho.data.filter.IsLike# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsLike;
      },

      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @name value
       * @memberOf pentaho.data.filter.IsLike#
       * @type {pentaho.type.Element}
       *
       * @readOnly
       */

      /** @inheritDoc */
      _compile: function() {

        var property = this.property;
        var anchorStart = this.anchorStart;
        var anchorEnd = this.anchorEnd;
        var referenceFormatted = this.getf("value") || this.value.toString();

        return function isLikeContains(elem) {

          var formatted;
          if((formatted = elem.getf(property, true)) == null &&
             (formatted = elem.getv(property, true)) == null) {
            return false;
          }

          var firstOccurrence = formatted.indexOf(referenceFormatted);

          return firstOccurrence > -1 &&
              (!anchorStart || firstOccurrence === 0) &&
              (!anchorEnd   || (firstOccurrence + referenceFormatted.length === formatted.length));
        };
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        var s = this.get("anchorStart");
        var e = this.get("anchorEnd");
        return (this.property || "") + " " +
          (v ? (v.$type.isSimple ? v.$contentKey : v.$key) : "") + " " +
          (s ? s.$key : "") + " " +
          (e ? e.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsLike.Type# */{
        id: "pentaho/data/filter/isLike",
        alias: "like",
        props: [
          {
            name: "value",
            nameAlias: "v",
            valueType: "element",
            isRequired: true,
            isBoundary: true
          },
          {
            name: "anchorStart",
            nameAlias: "s",
            valueType: "boolean",
            defaultValue: false
          },
          {
            name: "anchorEnd",
            nameAlias: "e",
            valueType: "boolean",
            defaultValue: false
          }
        ]
      }
    });
  };
});
