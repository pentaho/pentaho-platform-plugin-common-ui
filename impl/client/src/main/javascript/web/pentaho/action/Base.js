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

  /**
   * @alias Base
   * @memberOf pentaho.action
   * @class
   * @extends pentaho.lang.Base
   * @abstract
   *
   * @amd pentaho/action/Base
   *
   * @classDesc The `action.Base` class represents a certain model of actions.
   *
   * ##### Synchronous or Asynchronous
   *
   * An action can be synchronous or asynchronous, as determined by the type property,
   * {@link pentaho.action.Base.isSync}.
   * The execution of a synchronous action is completed synchronously,
   * while that of an asynchronous action only completes asynchronously.
   *
   * #### Execution
   *
   * Actions are executed at and by target objects,
   * which implement the interface [ITarget]{@link pentaho.action.ITarget},
   * by being passed as the argument to the [ITarget#act]{@link pentaho.action.ITarget#act} method.
   *
   * Targets control the exact implementation of the execution of an action,
   * which is returned from the `act` method,
   * in the form of an [Execution]{@link pentaho.action.Execution}.
   * However, it is the action that imposes whether execution is synchronous or not,
   * and the phases by which execution goes through, which are, for all action types:
   *
   * 1. "init" - the execution is being initialized and a chance is given to mutate
   *             the action and change what will be done;
   * 2. "will" - action is now frozen and the action can be canceled based on what will be done;
   * 3. "do" - the action is executed;
   * 4. "finally" - the action execution has finished successfully or not.
   *
   * For more information, see [Execution]{@link pentaho.action.Execution}.
   */
  var Action = Base.extend(module.id, /** @lends pentaho.action.Base# */{

    /**
     * Gets the type of action.
     *
     * @name type
     * @memberOf pentaho.action.Base#
     * @type {string}
     * @readonly
     *
     * @abstract
     */

    /**
     * Gets the event name of the action.
     *
     * The base implementation returns the value of {@link pentaho.action.Base#type}.
     *
     * @type {string}
     * @readonly
     */
    get eventName() {
      return this.type;
    },

    /**
     * Determines if the given action is valid.
     *
     * The default implementation does nothing and considers the instance valid.
     * Override to implement an action's specific validation logic.
     *
     * @return {?Array.<pentaho.lang.UserError>} A non-empty array of errors or `null`.
     */
    validate: function() {
      return null;
    },

    /**
     * Creates a shallow clone of this action.
     *
     * @return {pentaho.action.Base} The action clone.
     */
    clone: function() {
      return new this.constructor();
    }
  }, /** @lends pentaho.action.Base */{

    /**
     * Indicates if the action is synchronous.
     *
     * @type {boolean}
     * @default true
     * @readonly
     */
    get isSync() {
      return true;
    }
  });

  return Action;
});
