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
  "pentaho/module!../False",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    var _false = null;

    /**
     * @name pentaho.data.filter.FalseType
     * @class
     * @extends pentaho.data.filter.AbstractType
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
     * @amd pentaho/data/filter/True
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
      _compile: function() {
        return function() { return false; };
      },

      /** @inheritDoc */
      negate: function() {
        return filter.True.instance;
      },

      $type: /** @lends pentaho.data.filter.FalseType# */{
        id: module.id
      }
    }, /** @lends pentaho.data.filter.False */{
      /**
       * Gets the _false_ filter instance.
       *
       * @type {pentaho.data.filter.False}
       * @readOnly
       */
      get instance() {
        return _false || (_false = new this());
      }
    });
  };
});
