/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
