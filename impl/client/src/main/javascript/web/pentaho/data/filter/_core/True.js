/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/module!../True",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    var _true;

    /**
     * @name pentaho.data.filter.TrueType
     * @class
     * @extends pentaho.data.filter.AbstractType
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
     * @amd pentaho/data/filter/True
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
      _compile: function() {
        return function() { return true; };
      },

      /** @inheritDoc */
      negate: function() {
        return filter.False.instance;
      },

      $type: /** @lends pentaho.data.filter.TrueType# */{
        id: module.id
      }
    }, /** @lends pentaho.data.filter.True */{
      /**
       * Gets the _true_ filter instance.
       *
       * @type {pentaho.data.filter.True}
       * @readOnly
       */
      get instance() {
        return _true || (_true = new this());
      }
    });
  };
});
