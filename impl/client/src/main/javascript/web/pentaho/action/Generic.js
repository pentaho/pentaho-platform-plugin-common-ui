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
  "pentaho/module!_",
  "./Base"
], function(module, ActionBase) {

  "use strict";

  var GenericAction = ActionBase.extend(module.id, /** @lends pentaho.action.Generic# */{

    /**
     * @alias Generic
     * @memberOf pentaho.action
     * @class
     * @extends pentaho.action.Base
     * @abstract
     *
     * @amd pentaho/action/Generic
     *
     * @classdesc The `action.Generic` class represents a generic model of actions.
     *
     * @description Creates an action instance given its specification.
     * @constructor
     *
     * @param {pentaho.action.spec.IGeneric} [spec] A generic action specification.
     *
     * @see pentaho.action.spec.IGeneric
     */
    constructor: function(spec) {
      // Let mixins take part.
      this._init(spec);
    },

    /**
     * Initializes an action instance given its specification.
     *
     * @param {pentaho.action.spec.IGeneric} [spec] A generic action specification.
     * @protected
     */
    _init: function(spec) {
    },

    /** @inheritDoc */
    clone: function() {
      return new this.constructor(this.toSpec());
    },

    /**
     * Creates a specification that describes this action.
     *
     * @return {pentaho.action.spec.IGeneric} A generic action specification.
     */
    toSpec: function() {
      var spec = {};

      this._fillSpec(spec);

      return spec;
    },

    /**
     * Fills the given specification with this action's attributes' local values,
     * and returns whether any attribute was actually added.
     *
     * @param {pentaho.action.spec.IGeneric} [spec] A generic action specification.
     *
     * @protected
     */
    _fillSpec: function(spec) {
    }
  });

  return GenericAction;
});
