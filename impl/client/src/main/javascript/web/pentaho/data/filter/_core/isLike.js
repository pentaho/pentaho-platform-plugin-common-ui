/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!../IsLike",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.IsLikeType
     * @class
     * @extends pentaho.data.filter.PropertyType
     *
     * @classDesc The type class of the is-like filter type.
     *
     * For more information see {@link pentaho.data.filter.IsLike}.
     */

    /**
     * @name pentaho.data.filter.IsLike
     * @class
     * @extends pentaho.data.filter.Property
     * @amd pentaho/data/filter/IsLike
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
        var isCaseInsensitive = this.isCaseInsensitive;
        var referenceFormatted = this.getf("value") || this.value.toString();

        if(isCaseInsensitive) {
          referenceFormatted = referenceFormatted.toLowerCase();
        }

        return function isLikeContains(elem) {

          var formatted;
          if((formatted = elem.getf(property, true)) == null &&
             (formatted = elem.getv(property, true)) == null) {
            return false;
          }

          var firstOccurrence;

          if(isCaseInsensitive) {
            firstOccurrence = formatted.toLowerCase().indexOf(referenceFormatted);
          } else {
            firstOccurrence = formatted.indexOf(referenceFormatted);
          }

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
        var ci = this.get("isCaseInsensitive");
        return (this.property || "") + " " +
          (v ? (v.$type.isSimple ? v.$contentKey : v.$key) : "") + " " +
          (s ? s.$key : "") + " " +
          (e ? e.$key : "") + " " +
          (ci ? ci.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsLikeType# */{
        id: module.id,
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
          },
          {
            name: "isCaseInsensitive",
            nameAlias: "ci",
            valueType: "boolean",
            defaultValue: false
          }
        ]
      }
    });
  };
});
