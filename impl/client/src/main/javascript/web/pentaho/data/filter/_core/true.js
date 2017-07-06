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
  "../KnownFilterKind"
], function(KnownFilterKind) {

  "use strict";

  return function(filter) {

    var _true;

    /**
     * @name pentaho.data.filter.True.Type
     * @class
     * @extends pentaho.data.filter.Abstract.Type
     *
     * @classDesc The type class of the `True` filter type.
     *
     * For more information see {@link pentaho.data.filter.True}.
     */

    /**
     * @name pentaho.data.filter.True
     * @class
     * @extends pentaho.data.filter.Abstract
     *
     * @amd {pentaho.type.Factory<pentaho.data.filter.True>} pentaho/data/filter/true
     *
     * @classDesc The `True` type represents a filter that encompasses all and any data.
     *
     * In terms of set operations, the `True` filter corresponds to the _universal_ set.
     */

    filter.True = filter.Abstract.extend("pentaho.data.filter.True", /** @lends pentaho.data.filter.True# */{

      constructor: function() {
        if(_true) return _true;

        _true = this;

        this.base();
      },

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.True;
      },

      /** @inheritDoc */
      get isTerminal() {
        return true;
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        return "";
      },

      /** @inheritDoc */
      _contains: function(elem) {
        return true;
      },

      /** @inheritDoc */
      negate: function() {
        return filter.False.instance;
      },

      type: /** @lends pentaho.data.filter.True.Type# */{
        id: "pentaho/data/filter/true",
        alias: "true"
      }
    }, /** @lends pentaho.data.filter.True */{
      /**
       * Gets the _true_ filter instance.
       *
       * @type {!pentaho.data.filter.True}
       * @readOnly
       */
      get instance() {
        return _true || (_true = new this());
      }
    });
  };
});
