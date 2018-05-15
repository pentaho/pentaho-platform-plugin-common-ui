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
  "pentaho/module!",
  "../Element",
  "pentaho/lang/OperationInvalidError",
  "pentaho/util/object",
  "pentaho/util/text",
  "pentaho/i18n!../i18n/types"
], function(module, Element, OperationInvalidError, O, textUtil, bundle) {

  "use strict";

  var actionType;

  /**
   * @name pentaho.type.action.BaseType
   * @class
   * @extends pentaho.type.ElementType
   *
   * @classDesc The base class of action types.
   *
   * For more information see {@link pentaho.type.action.Base}.
   */

  var Action = Element.extend(/** @lends pentaho.type.action.Base# */{

    $type: /** @lends pentaho.type.action.BaseType# */{

      id: module.id,

      isAbstract: true,
      label: null,
      description: null,

      /** @inheritDoc */
      _init: function(spec, keyArgs) {

        spec = this.base(spec, keyArgs) || spec;

        var isSync = spec && spec.isSync;
        isSync = isSync == null ? this.__isSync : !!isSync;

        O.setConst(this, "__isSync", isSync);
      },

      // region Attribute isSync
      /** @private */
      __isSync: true,

      /**
       * Gets a value that indicates if the action is synchronous.
       *
       * @type {boolean}
       * @readOnly
       */
      get isSync() {
        return this.__isSync;
      },
      // endregion

      // region serialization
      /** @inheritDoc */
      _fillSpecInContext: function(spec, keyArgs) {

        var any = this.base(spec, keyArgs);

        if(this !== actionType && this.isSync !== this.ancestor.isSync) {
          spec.isSync = this.isSync;
          any = true;
        }

        return any;
      }
      // endregion
    },

    /**
     * @alias Base
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.type.Element
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
     * 4. "finally" - the action execution has finished successfuly or not.
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
      /**
       * The label of the action instance.
       *
       * @type {nonEmptyString}
       * @private
       */
      this.label = spec && spec.label;

      /**
       * The description of the action instance.
       *
       * @type {!nonEmptyString}
       * @private
       */
      this.description = spec && spec.description;

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

    // region Action Description
    /**
     * Gets or sets the label of this action.
     *
     * When not set to a non-empty local value, the label of the action type,
     * {@link pentaho.type.Type#label} is returned.
     *
     * @type {nonEmptyString}
     */
    get label() {
      return this.__label || this.$type.label;
    },

    set label(value) {
      this.__label = textUtil.nonEmptyString(value);
    },

    /**
     * Gets or sets the description of this action.
     *
     * When not set to a non-empty local value, the description of the action type,
     * {@link pentaho.type.Type#description} is returned.
     *
     * @type {nonEmptyString}
     */
    get description() {
      return this.__description || this.$type.description;
    },

    set description(value) {
      this.__description = textUtil.nonEmptyString(value);
    },
    // endregion

    // region serialization
    /** @inheritDoc */
    toSpecInContext: function(keyArgs) {

      keyArgs = keyArgs ? Object.create(keyArgs) : {};

      var spec = {};

      var declaredType;
      var includeType = !!keyArgs.forceType ||
            (!!(declaredType = keyArgs.declaredType) && this.$type !== declaredType);

      if(includeType) spec._ = this.$type.toSpecInContext(keyArgs);
      if(this.__label !== null) spec.label = this.label;
      if(this.__description !== null) spec.description = this.description;

      return spec;
    }
    // endregion
  })
  .localize({$type: bundle.structured.Action})
  .configure({$type: module.config});

  actionType = Action.type;

  return Action;
});
