/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "./data",
  "./SelectionModes",
  "../../type/function",
  "../../util/object",
  "../../util/fun",
  "../../lang/ArgumentInvalidError",
  "../../lang/ArgumentInvalidTypeError"
], function(module, dataActionFactory, SelectionModes, funFactory, O, F, ArgumentInvalidError, ArgumentInvalidTypeError) {

  "use strict";

  return function(context) {

    var PenFunction = context.get(funFactory);

    /**
     * @name pentaho.visual.action.Select.Type
     * @class
     * @extends pentaho.visual.action.Data.Type
     *
     * @classDesc The type class of selection actions.
     *
     * For more information see {@link pentaho.visual.action.Select}.
     */

    var DataAction = context.get(dataActionFactory);

    return DataAction.extend(/** @lends pentaho.visual.action.Select# */{
      type: /** @lends pentaho.visual.action.Select.Type# */{
        id: module.id,
        alias: "select",

        // region defaultSelectionMode
        __defaultSelectionMode: null,

        /**
         * Gets or sets the _default selection mode_ of actions of this type.
         *
         * The default value is {@link pentaho.visual.action.SelectionModes#replace}.
         *
         * When set to a {@link Nully} value, the default value is assumed.
         *
         * Can be set to the name of one of the standard selection modes,
         * [SelectionModes]{@link pentaho.visual.action.SelectionModes},
         * to assume the corresponding selection mode function.
         *
         * @type {!pentaho.visual.action.SelectionMode}
         *
         * @throws {pentaho.lang.ArgumentInvalidError} When set to a `string` which is not one of the
         * standard selection mode names, [SelectionModes]{@link pentaho.visual.action.SelectionModes}.
         *
         * @throws {pentaho.lang.ArgumentInvalidTypeError} When set to a value which is not a `string` or a `function`.
         */
        get defaultSelectionMode() {

          var fun = this.__defaultSelectionMode;
          return fun ? fun.valueOf() : SelectionModes.replace;
        },

        set defaultSelectionMode(value) {

          this.__defaultSelectionMode = getSelectionMode(value, "defaultSelectionMode");
        },
        // endregion

        // region serialization
        _fillSpecInContext: function(spec, keyArgs) {

          var any = this.base(spec, keyArgs);

          if(this.__defaultSelectionMode) {
            spec.defaultSelectionMode = serializeSelectionMode(this.__defaultSelectionMode, keyArgs);
            any = true;
          }

          return any;
        }
        // endregion
      },

      /**
       * @alias Select
       * @memberOf pentaho.visual.action
       * @class
       * @extends pentaho.visual.action.Data
       *
       * @amd {pentaho.type.Factory<pentaho.visual.action.Select>} pentaho/visual/action/select
       *
       * @classDesc The `Select` action is a synchronous action that
       * is performed when the user interacts with a visual element, typically by clicking on it.

       * This action has the *alias* `"select"`,
       * which can also be specified as the event name
       * when calling [on]{@link pentaho.lang,IEventSource#on} of action targets.
       *
       * See also the default action performed by this action type,
       * [_doDefault]{@link pentaho.visual.action.Select#_doDefault}.
       *
       * @description Creates a data action instance given its specification.
       * @param {pentaho.visual.action.spec.ISelect} [spec] A selection action specification.
       * @constructor
       *
       * @see pentaho.visual.action.spec.ISelect
       * @see pentaho.visual.action.spec.ISelectProto
       * @see pentaho.visual.action.spec.ISelectTypeProto
       */
      constructor: function(spec) {

        this.base(spec);

        this.selectionMode = spec && spec.selectionMode;
      },

      /**
       * Gets or sets the _selection mode_ of this action.
       *
       * Can only be set while the action is in an [editable]{@link pentaho.type.action.Base#isEditable} state.
       *
       * The default value is the value of
       * [defaultSelectionMode]{@link pentaho.visual.action.Select.Type#defaultSelectionMode}.
       *
       * Setting to a {@link Nully} value assumes the default value.
       *
       * Can be set to the name of one of the standard selection modes,
       * [SelectionModes]{@link pentaho.visual.action.SelectionModes},
       * to assume the corresponding selection mode function.
       *
       * @type {!pentaho.visual.action.SelectionMode}
       *
       * @throws {pentaho.lang.OperationInvalidError} When set and the action is not in an editable state.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When set to a `string` which is not one of the
       * standard selection mode names, [SelectionModes]{@link pentaho.visual.action.SelectionModes}.
       *
       * @throws {pentaho.lang.ArgumentInvalidTypeError} When set to a value which is not a `string` or a `function`.
       */
      get selectionMode() {

        var fun = this.__selectionMode;
        return fun ? fun.valueOf() : this.type.defaultSelectionMode;
      },

      set selectionMode(value) {

        this._assertEditable();

        /**
         * The selection mode of the action.
         *
         * A simple function value that wraps a {@link pentaho.visual.action.SelectionMode} function.
         *
         * @alias __selectionMode
         * @memberOf pentaho.visual.action.Select#
         * @type {?pentaho.type.Function}
         * @private
         */
        this.__selectionMode = getSelectionMode(value, "selectionMode");
      },

      /**
       * Applies the action's [selectionMode]{@link pentaho.visual.action.Select#selectionMode} function to
       * the [target view]{@link pentaho.visual.action.Select#target}'s
       * [selectionFilter]{@link pentaho.visual.base.View#selectionFilter} and
       * the action's [dataFilter]{@link pentaho.visual.action.Select#dataFilter}.
       *
       * The resulting data filter is set as the view's new `selectionFilter`.
       *
       * @return {?Promise} - The value `null`.
       */
      _doDefault: function() {

        var view = this.target;

        view.selectionFilter = this.selectionMode.call(view, view.selectionFilter, this.dataFilter);

        return null;
      },

      // region serialization
      toSpecInContext: function(keyArgs) {

        var spec = this.base(keyArgs);

        if(this.__selectionMode) spec.selectionMode = serializeSelectionMode(this.__selectionMode, keyArgs);

        return spec;
      }
      // endregion
    });

    /**
     * Gets a selection mode given its standard name and validates that, otherwise, it is a function.
     *
     * @param {string|pentaho.visual.action.SelectionMode} value - The selection mode designator.
     * @param {string} argName - The argument name, for error purposes.
     *
     * @return {pentaho.type.Function} A selection mode function wrapped in a simple function value.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `value` is a `string` which is not one of the
     * [standard selection mode names]{@link pentaho.visual.action.SelectionModes}.
     *
     * @throws {pentaho.lang.ArgumentInvalidTypeError} When `value` is neither a `string` nor a `function`.
     *
     * @private
     */
    function getSelectionMode(value, argName) {
      if(value != null) {

        var name;

        if(typeof value === "string") {
          if(!O.hasOwn(SelectionModes, value)) {
            throw new ArgumentInvalidError(argName, "Not one of the standard selection mode names.");
          }
          name = value;
          value = SelectionModes[value];
        } else if(!F.is(value)) {
          throw new ArgumentInvalidTypeError(argName, ["string", "function"], typeof value);
        }

        var fun = new PenFunction(value);

        // For serialization purposes
        fun.selectionModeName = name;

        return fun;
      }

      return null;
    }

    /**
     * Serializes a simple function value constructed by `getSelectionMode`.
     *
     * @param {!pentaho.type.Function} fun - A selection mode function wrapped in a simple function value.
     * @param {?object} keyArgs - The serialization keyword arguments.
     * @private
     */
    function serializeSelectionMode(fun, keyArgs) {

      if(fun.selectionModeName) return fun.selectionModeName;

      keyArgs = keyArgs ? Object.create(keyArgs) : {};

      keyArgs.declaredType = PenFunction.type;

      return this.__selectionMode.toSpecInContext(keyArgs);
    }
  };
});
