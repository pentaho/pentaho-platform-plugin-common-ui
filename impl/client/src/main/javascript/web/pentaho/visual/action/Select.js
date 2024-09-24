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
  "./Interaction",
  "./mixins/Data",
  "./mixins/Positioned",
  "./SelectionModes",
  "pentaho/type/Function",
  "pentaho/util/object",
  "pentaho/util/fun",
  "pentaho/lang/ArgumentInvalidError",
  "pentaho/lang/ArgumentInvalidTypeError"
], function(module, Interaction, DataActionMixin, PositionedActionMixin, SelectionModes, PenFunction,
            O, F, ArgumentInvalidError, ArgumentInvalidTypeError) {

  "use strict";

  return Interaction.extend(module.id, /** @lends pentaho.visual.action.Select# */{

    /**
     * @alias Select
     * @memberOf pentaho.visual.action
     * @class
     * @extends pentaho.visual.action.Interaction
     * @extends pentaho.visual.action.mixins.Data
     * @extends pentaho.visual.action.mixins.Positioned
     *
     * @amd pentaho/visual/action/Select
     *
     * @classDesc The `Select` action is a synchronous, data and positioned action that
     * is performed when the user interacts with a visual element,
     * typically by clicking on it.

     * @description Creates a _select_ action given its specification.
     * @param {pentaho.visual.action.spec.ISelect} [spec] A _select_ action specification.
     * @constructor
     *
     * @see pentaho.visual.action.spec.ISelect
     * @see pentaho.visual.action.spec.ISelectConfig
     */
    constructor: function(spec) {

      this.base(spec);

      this.selectionMode = spec && spec.selectionMode;
    },

    /**
     * Gets or sets the _selection mode_ of this action.
     *
     * The default value is the value of
     * [defaultSelectionMode]{@link pentaho.visual.action.SelectType#defaultSelectionMode}.
     *
     * Setting to a {@link Nully} value assumes the default value.
     *
     * Can be set to the name of one of the standard selection modes,
     * [SelectionModes]{@link pentaho.visual.action.SelectionModes},
     * to assume the corresponding selection mode function.
     *
     * @type {pentaho.visual.action.SelectionMode}
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When set to a `string` which is not one of the
     * standard selection mode names, [SelectionModes]{@link pentaho.visual.action.SelectionModes}.
     *
     * @throws {pentaho.lang.ArgumentInvalidTypeError} When set to a value which is not a `string` or a `function`.
     */
    get selectionMode() {
      var fun = this.__selectionMode;
      return fun ? fun.valueOf() : __getDefaultSelectionMode();
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
    _fillSpec: function(spec) {

      this.base(spec);

      if(this.__selectionMode) {
        spec.selectionMode = this.__selectionMode;
      }
    }
    // endregion
  }, /** @lends pentaho.visual.action.Select */{
    /** @inheritDoc */
    get id() {
      return module.id;
    }
  })
  .mix(DataActionMixin)
  .mix(PositionedActionMixin);

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

      if(typeof value === "string") {
        if(!O.hasOwn(SelectionModes, value)) {
          throw new ArgumentInvalidError(argName, "Not one of the standard selection mode names.");
        }

        value = SelectionModes[value];
      } else if(!F.is(value)) {
        throw new ArgumentInvalidTypeError(argName, ["string", "function"], typeof value);
      }

      return value;
    }

    return __getDefaultSelectionMode();
  }

  /**
   * The default selection mode of actions of this [Action]{@link pentaho.action.Base}.
   *
   * The default value is {@link pentaho.visual.action.SelectionModes#replace}.
   *
   * When specified as a {@link Nully} value, the default value is assumed.
   *
   * @return {pentaho.type.Function} A selection mode function wrapped in a simple function value.
   * @private
   */
  function __getDefaultSelectionMode() {
    var config = module.config || {};

    var value = config.defaultSelectionMode || SelectionModes.replace;

    return __getSelectionMode(value, "defaultSelectionMode");
  }
});
