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
  "./SelectionModes",
  "pentaho/util/object",
  "pentaho/util/fun",
  "pentaho/lang/ArgumentInvalidError",
  "pentaho/lang/ArgumentInvalidTypeError"
], function(SelectionModes, O, F, ArgumentInvalidError, ArgumentInvalidTypeError) {

  "use strict";

  return [
    "./base",
    "./mixins/data",
    "./mixins/positioned",
    "pentaho/type/function",
    function(BaseAction, DataActionMixin, PositionedActionMixin, PenFunction) {

      /**
       * @name pentaho.visual.action.Select.Type
       * @class
       * @extends pentaho.visual.action.Base.Type
       * @extends pentaho.visual.action.mixins.Data.Type
       * @extends pentaho.visual.action.mixins.Positioned.Type
       *
       * @classDesc The type class of {@link pentaho.visual.action.Select}.
       */

      return BaseAction.extend(/** @lends pentaho.visual.action.Select# */{
        $type: /** @lends pentaho.visual.action.Select.Type# */{

          mixins: [DataActionMixin, PositionedActionMixin],

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
           * @throws {pentaho.lang.ArgumentInvalidTypeError} When set to a value which is not a `string`
           * or a `function`.
           */
          get defaultSelectionMode() {

            var fun = this.__defaultSelectionMode;
            return fun ? fun.valueOf() : SelectionModes.replace;
          },

          set defaultSelectionMode(value) {

            this.__defaultSelectionMode = __getSelectionMode(value, "defaultSelectionMode");
          },
          // endregion

          // region serialization
          /** @inheritDoc */
          _fillSpecInContext: function(spec, keyArgs) {

            var any = this.base(spec, keyArgs);

            if(this.__defaultSelectionMode) {
              spec.defaultSelectionMode = __serializeSelectionMode(this.__defaultSelectionMode, keyArgs);
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
         * @extends pentaho.visual.action.Base
         * @extends pentaho.visual.action.mixins.Data
         * @extends pentaho.visual.action.mixins.Positioned
         *
         * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.action.Select>} pentaho/visual/action/select
         *
         * @classDesc The `Select` action is a synchronous, data and positioned  action that
         * is performed when the user interacts with a visual element,
         * typically by clicking on it.

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
         * @throws {pentaho.lang.ArgumentInvalidError} When set to a `string` which is not one of the
         * standard selection mode names, [SelectionModes]{@link pentaho.visual.action.SelectionModes}.
         *
         * @throws {pentaho.lang.ArgumentInvalidTypeError} When set to a value which is not a `string` or a `function`.
         */
        get selectionMode() {
          var fun = this.__selectionMode;
          return fun ? fun.valueOf() : this.$type.defaultSelectionMode;
        },

        set selectionMode(value) {
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
          this.__selectionMode = __getSelectionMode(value, "selectionMode");
        },

        // region serialization
        /** @inheritDoc */
        toSpecInContext: function(keyArgs) {

          var spec = this.base(keyArgs);

          if(this.__selectionMode) {
            spec.selectionMode = __serializeSelectionMode(this.__selectionMode, keyArgs);
          }

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
      function __getSelectionMode(value, argName) {
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
       * Serializes a simple function value constructed by `__getSelectionMode`.
       *
       * @param {!pentaho.type.Function} fun - A selection mode function wrapped in a simple function value.
       * @param {?object} keyArgs - The serialization keyword arguments.
       * @return {string} The function serialization.
       * @private
       */
      function __serializeSelectionMode(fun, keyArgs) {

        if(fun.selectionModeName) return fun.selectionModeName;

        keyArgs = keyArgs ? Object.create(keyArgs) : {};

        keyArgs.declaredType = PenFunction.type;

        return fun.toSpecInContext(keyArgs);
      }
    }
  ];
});
