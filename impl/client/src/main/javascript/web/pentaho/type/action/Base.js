/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/lang/Base"
], function(module, Base) {

  "use strict";

  var Action = Base.extend(module.id, /** @lends pentaho.type.action.Base# */{

    /**
     * @alias Base
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.lang.Base
     * @abstract
     *
     * @amd pentaho/type/action/Base
     *
     * @classDesc The `action.Base` class represents a certain model of actions.
     *
     * It is expected that the associated type class is used to
     * configure metadata information about actions.
     * Metadata properties such as
     * [label]{@link pentaho.type.Type#label},
     * [description]{@link pentaho.type.Type#description} and
     * [styleClass]{@link pentaho.type.Type#styleClass}
     * can be used in graphical user interfaces to offer the action to the user.
     *
     * ##### Synchronous or Asynchronous
     *
     * An action can be synchronous or asynchronous, as determined by the type property,
     * {@link pentaho.type.action.BaseType#isSync}.
     * The execution of a synchronous action is completed synchronously,
     * while that of an asynchronous action only completes asynchronously.
     *
     * #### Execution
     *
     * Actions are executed at and by target objects,
     * which implement the interface [ITarget]{@link pentaho.type.action.ITarget},
     * by being passed as the argument to the [ITarget#act]{@link pentaho.type.action.ITarget#act} method.
     *
     * Targets control the exact implementation of the execution of an action,
     * which is returned from the `act` method,
     * in the form of an [Execution]{@link pentaho.type.action.Execution}.
     * However, it is the action that imposes whether execution is synchronous or not,
     * and the phases by which execution goes through, which are, for all action types:
     *
     * 1. "init" - the execution is being initialized and a chance is given to mutate
     *    the action and change what will be done;
     * 2. "will" - action is now frozen and the action can be canceled based on what wil be done;
     * 3. "do" - the action is executed;
     * 4. "finally" - the action execution has finished successfully or not.
     *
     * For more information, see [Execution]{@link pentaho.type.action.Execution}.
     *
     * @description Creates an action instance given its specification.
     *
     * @constructor
     * @param {pentaho.type.action.spec.IBase} [spec] An action specification.
     *
     * @see pentaho.type.action.spec.IBase
     * @see pentaho.type.action.spec.IBaseType
     */
    constructor: function(spec) {
      // Let mixins take part.
      this._init(spec);
    },

    /**
     * Initializes an action instance given its specification.
     *
     * @param {pentaho.type.action.spec.IBase} [spec] An action specification.
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
     */
    get type() {
      return null;
    },

    /**
     * @abstract
     */
    validate: function() {
      return null;
    },

    /**
     * @abstract
     *
     * @param {pentaho.type.action.spec.IBase} [spec] An action specification.
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
  }, {
    get isSync() {
      return true;
    }
  });

  return Action;
});
