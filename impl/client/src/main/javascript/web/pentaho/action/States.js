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
