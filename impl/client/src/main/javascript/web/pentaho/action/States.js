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

define(function() {

  "use strict";

  /**
   * The `States` enum is the class of names of _action execution states_.
   *
   * @memberOf pentaho.type.action
   * @enum {number}
   * @readonly
   */
  var States = {
    /**
     * The `unstarted` action execution state.
     * @default
     */
    unstarted: 1,

    /**
     * The `init` action execution state.
     * @default
     */
    init: 2,

    /**
     * The `will` action execution state.
     * @default
     */
    will: 4,

    /**
     * The `do` action execution state.
     * @default
     */
    "do": 8,

    /**
     * The `did` action execution state.
     * @default
     */
    did: 16,

    /**
     * The `canceled` action execution state.
     * @default
     */
    canceled: 32,

    /**
     * The `failed` action execution state.
     * @default
     */
    failed: 64,

    /**
     * The `finished` action execution state bit.
     *
     * Can be on when
     * one of
     * [did]{@link pentaho.type.action.States.did},
     * [failed]{@link pentaho.type.action.States.failed} or
     * [canceled]{@link pentaho.type.action.States.canceled}
     * is also on.
     *
     * Indicates that all finalization tasks have been completed.
     * @default
     */
    finished: 128
  };

  return Object.freeze(States);
});
