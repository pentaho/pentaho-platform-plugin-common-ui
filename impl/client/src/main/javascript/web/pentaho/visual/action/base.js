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
  "pentaho/type/action/base",
  "pentaho/lang/ArgumentInvalidTypeError"
], function(module, baseActionFactory, ArgumentInvalidTypeError) {

  "use strict";

  return function(context) {

    // Cannot depend directly or an AMD dependency cycle would arise...
    var __baseViewType = null;

    /**
     * @name pentaho.visual.action.Base.Type
     * @class
     * @extends pentaho.type.action.Base.Type
     *
     * @classDesc The base type class of visual actions.
     *
     * For more information see {@link pentaho.visual.action.Base}.
     */

    var __ActionBase = context.get(baseActionFactory);

    return __ActionBase.extend(/** @lends pentaho.visual.action.Base# */{
      $type: /** @lends pentaho.visual.action.Base.Type# */{
        id: module.id,
        isAbstract: true
      },

      /**
       * @alias Base
       * @memberOf pentaho.visual.action
       * @class
       * @extends pentaho.type.action.Base
       * @abstract
       *
       * @amd {pentaho.type.Factory<pentaho.visual.action.Base>} pentaho/visual/action/base
       *
       * @classDesc The `visual.action.Base` class is the base class of action types
       * which are performed on a point whose [target]{@link pentaho.visual.action.Base#target}
       * is a [View]{@link pentaho.visual.base.View}.
       *
       * @description Creates a base action instance given its specification.
       * @param {pentaho.visual.action.spec.IBase} [spec] A base action specification.
       * @constructor
       */
      constructor: function(spec) {

        this.base(spec);

        this.position = spec && spec.position;
      },

      /**
       * Gets the target *view* where the action is executing or has executed.
       *
       * This property contains the value of the `target` argument passed to
       * [execute]{@link pentaho.type.action.Base#execute} or
       * [executeAsync]{@link pentaho.type.action.Base#executeAsync},
       * and is `null` before execution.
       *
       * @name target
       * @memberOf pentaho.visual.action.Base#
       * @type {pentaho.visual.base.View}
       * @readonly
       */

      /** @inheritDoc */
      _setTarget: function(target) {

        this.base(target);

        // If not yet loaded, then, surely target isn't a BaseView...
        if(!__baseViewType) __baseViewType = context.get("pentaho/visual/base/view").type;

        if(!__baseViewType.is(target))
          throw new ArgumentInvalidTypeError("target", [__baseViewType.id], typeof target);
      },

      /**
       * Gets or sets the _position_ where the action took place, in screen coordinates.
       *
       * Can only be set while the action is in an [editable]{@link pentaho.base.action.Base#isEditable} state.
       *
       * @type {pentaho.visual.spec.IPoint} The point object with the bi-dimensional view coordinates.
       *
       * @throws {pentaho.lang.OperationInvalidError} When set and the action is not in an editable state.
       */
      get position() {

        return this.__position;
      },

      set position(value) {

        this._assertEditable();

        this.__position = value || null;
      },

      // region serialization
      /** @inheritDoc */
      toSpecInContext: function(keyArgs) {

        var spec = this.base(keyArgs);

        if(this.__position) {
          spec.position = {x: this.__position.x, y: this.__position.y};
        }

        return spec;
      }
      // endregion
    });
  };
});
