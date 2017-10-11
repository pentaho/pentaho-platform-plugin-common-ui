/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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

    var _false = null;

    /**
     * @name pentaho.data.filter.False.Type
     * @class
     * @extends pentaho.data.filter.Abstract.Type
     *
     * @classDesc The type class of the `False` filter type.
     *
     * For more information see {@link pentaho.data.filter.False}.
     */

    /**
     * @name pentaho.data.filter.False
     * @class
     * @extends pentaho.data.filter.Abstract
     *
     * @amd {pentaho.type.spec.UTypeModule<pentaho.data.filter.False>} pentaho/data/filter/true
     *
     * @classDesc The `False` type represents a filter that encompasses no data.
     *
     * In terms of set operations, the `False` filter corresponds to the _empty_ set.
     */

    filter.False = filter.Abstract.extend("pentaho.data.filter.False", /** @lends pentaho.data.filter.False# */{

      constructor: function() {
        if(_false) return _false;

        _false = this;

        this.base();
      },

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.False;
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
      _contains: function() {
        return false;
      },

      /** @inheritDoc */
      negate: function() {
        return filter.True.instance;
      },

      $type: /** @lends pentaho.data.filter.False.Type# */{
        id: "pentaho/data/filter/false",
        alias: "false"
      }
    }, /** @lends pentaho.data.filter.False */{
      /**
       * Gets the _false_ filter instance.
       *
       * @type {!pentaho.data.filter.False}
       * @readOnly
       */
      get instance() {
        return _false || (_false = new this());
      }
    });
  };
});
