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
  "../../util/object",
  "../../util/fun",
  "../../lang/ArgumentInvalidError",
  "../../lang/ArgumentInvalidTypeError"
], function(module, dataActionFactory, SelectionModes, O, F, ArgumentInvalidError, ArgumentInvalidTypeError) {

  "use strict";

  return function(context) {

    /**
     * @name pentaho.visual.action.Select.Type
     * @class
     * @extends pentaho.visual.action.Data.Type
     *
     * @classDesc The type class of "select" actions.
     *
     * For more information see {@link pentaho.visual.action.Select}.
     */

    var DataAction = context.get(dataActionFactory);

    return DataAction.extend(/** @lends  pentaho.visual.action.Select# */{
      type: {
        id: module.id,
        alias: "select",

        /**
         * Applies the action's `selectionMode` to the view's current `selectionFilter` and
         * the action's `dataFilter` to obtain the new view's `selectionFilter`,
         * which is then updated in the view.
         *
         * @param {pentaho.visual.action.Select} action - The "select" action.
         *
         * @return {?Promise} - The value `null`.
         */
        defaultAction: function(action) {

          var view = action.target;

          view.selectionFilter = action.selectionMode.call(view, view.selectionFilter, action.dataFilter);

          return null;
        }
      },

      /**
       * @alias Select
       * @memberOf pentaho.visual.action
       * @class
       * @extends pentaho.visual.action.Data
       *
       * @amd {pentaho.type.Factory<pentaho.visual.action.Select>} pentaho/visual/action/select
       *
       * @classDesc The `Select` action is performed when the user interacts with a visual element,
       * normally by clicking on it.
       *
       * This action has the *alias* `"select"`, which can be used to listen for its events on
       * action targets.
       *
       * See also the default action performed by this action type,
       * [defaultAction]{@link pentaho.visual.action.Select.Type#defaultAction}.
       *
       * @description Creates a data action instance given its specification.
       * @param {pentaho.visual.action.spec.IData} [spec] A data action specification.
       * @constructor
       */
      constructor: function(spec) {

        this.base(spec);

        this.dataFilter = spec && spec.dataFilter;
      },

      /**
       * Gets or sets the _selection mode_ of this action.
       *
       * Can only be set while the action is in an [editable]{@link pentaho.type.action.Base#isEditable} state.
       *
       * The default selection mode is {@link pentaho.visual.action.SelectionModes.replace}.
       *
       * Setting to a {@link Nully} value assumes the default selection mode.
       *
       * @type {!pentaho.visual.action.SelectionMode}
       *
       * @throws {pentaho.lang.OperationInvalidError} When set and the action is not in an editable state.
       */
      get selectionMode() {

        return this.__selectionMode || SelectionModes.replace;
      },

      set selectionMode(value) {

        this._assertEditable();

        if(value != null) {
          if(typeof value === "string") {
            if(!O.hasOwn(SelectionModes, value)) {
              throw new ArgumentInvalidError("selectionMode", "Not one of the standard selection mode names.");
            }
            value = SelectionModes[value];

          } else if(!F.is(value)) {
            throw new ArgumentInvalidTypeError("selectionMode", ["string", "function"], typeof value);
          }
        }

        /**
         * The selection mode of the action.
         *
         * @type {?pentaho.visual.action.SelectionMode}
         * @private
         */
        this.__selectionMode = value;
      }
    });
  };
});
