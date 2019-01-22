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
  "./Abstract"
], function(module, AbstractAction) {

  "use strict";

  var GenericAction = AbstractAction.extend(module.id, /** @lends pentaho.action.Generic# */{

    /**
     * @alias Generic
     * @memberOf pentaho.action
     * @class
     * @extends pentaho.action.Abstract
     * @abstract
     *
     * @amd pentaho/action/Generic
     *
     * @constructor
     * @param {pentaho.action.spec.IBase} [spec] An action specification.
     *
     */
    constructor: function(spec) {
      // Let mixins take part.
      this._init(spec);
    },

    /**
     * Initializes an action instance given its specification.
     *
     * @param {pentaho.action.spec.IBase} [spec] An action specification.
     * @protected
     */
    _init: function(spec) {
    },

    /** @inheritDoc */
    clone: function() {
      return new this.constructor(this.toSpec());
    },

    /**
     * @abstract
     *
     * @param {pentaho.action.spec.IBase} [spec] An action specification.
     * @protected
     */
    _fillSpec: function(spec) {
    },

    // region serialization
    /** @inheritDoc */
    toSpec: function() {
      var spec = {};

      this._fillSpec(spec);

      return spec;
    }
    // endregion
  });

  return GenericAction;
});
