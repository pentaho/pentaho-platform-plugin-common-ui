/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/module!_",
  "pentaho/visual/action/Interaction"
], function(module, Interaction) {

  "use strict";

  /**
   * @name Positioned
   * @memberOf pentaho.visual.action.mixins
   * @class
   * @extends pentaho.visual.action.Interaction
   * @abstract
   *
   * @amd pentaho/visual/action/mixins/Positioned
   *
   * @classDesc The `visual.action.mixins.Positioned` class is a mixin class for visual actions
   * which are triggered at a specific user interface position.
   *
   * The position is given by the
   * [position]{@link pentaho.visual.action.mixins.Positioned#position} property.
   *
   * The mixin adds [spec.IPositioned]{@link pentaho.visual.action.mixins.spec.IPositioned}
   * to the specification of an action.
   *
   * @description This class was not designed to be constructed directly.
   * It was designed to be used as a **mixin**.
   * @constructor
   */

  return Interaction.extend(module.id, /** @lends pentaho.visual.action.mixins.Positioned# */{

    // @override
    _init: function(spec) {

      this.base(spec);

      this.position = spec && spec.position;
    },

    /**
     * Gets or sets the _position_ where the action took place, in screen coordinates.
     *
     * @type {pentaho.visual.spec.IPoint}
     */
    get position() {
      return this.__position;
    },

    set position(value) {
      this.__position = value || null;
    },

    // region serialization
    _fillSpec: function(spec) {

      this.base(spec);

      if(this.__position) {
        spec.position = {x: this.__position.x, y: this.__position.y};
      }
    }
    // endregion
  });
});
