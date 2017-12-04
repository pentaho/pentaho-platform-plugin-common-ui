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
  "module",
  "pentaho/lang/OperationInvalidError",
  "pentaho/util/object"
],
function(module, OperationInvalidError, O) {

  "use strict";

  return ["element", function(Element) {

    var actionType;

    /**
     * @name pentaho.type.action.Base.Type
     * @class
     * @extends pentaho.type.Element.Type
     *
     * @classDesc The base class of action types.
     *
     * For more information see {@link pentaho.type.action.Base}.
     */

    // override the documentation to specialize the argument types.
    /**
     * Creates a subtype of this one.
     *
     * For more information on class extension, in general,
     * see {@link pentaho.lang.Base.extend}.
     *
     * @name extend
     * @memberOf pentaho.type.action.Base
     * @method
     *
     * @param {string} [name] The name of the created class; used for debugging purposes.
     * @param {pentaho.type.action.spec.IBaseProto} [instSpec] The instance specification.
     * @param {Object} [classSpec] The static specification.
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * @return {!Class.<pentaho.type.Value>} The new value instance subclass.
     *
     * @see pentaho.type.Instance.extend
     */

    var Action = Element.extend(/** @lends pentaho.type.action.Base# */{

      $type: /** @lends pentaho.type.action.Base.Type# */{

        isAbstract: true,

        /** @inheritDoc */
        _init: function(spec, keyArgs) {

          this.base(spec, keyArgs);

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
       * @amd {pentaho.type.spec.UTypeModule<pentaho.type.action.Base>} pentaho/type/action/base
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
       * {@link pentaho.type.action.Base.Type#isSync}.
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
       * @see pentaho.type.action.spec.IBaseProto
       * @see pentaho.type.action.spec.IBaseTypeProto
       */
      constructor: function(spec) {
        /**
         * The label of the action instance.
         *
         * @type {nonEmptyString}
         * @private
         */
        this.__label = __nonEmptyString(spec && spec.label);

        /**
         * The description of the action instance.
         *
         * @type {!nonEmptyString}
         * @private
         */
        this.__description = __nonEmptyString(spec && spec.description);

        // Let mixins take part.
        this._init(spec);
      },

      /**
       * Initializes a data action instance given its specification.
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
        this.__label = __nonEmptyString(value);
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
        this.__description = __nonEmptyString(value);
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

        if(includeType) spec._ = this.$type.toRefInContext(keyArgs);
        if(this.label) spec.label = this.label;
        if(this.description) spec.description = this.description;

        return spec;
      }
      // endregion
    });

    actionType = Action.type;

    return Action;
  }];

  function __nonEmptyString(value) {
    return value == null ? null : (String(value) || null);
  }
});
