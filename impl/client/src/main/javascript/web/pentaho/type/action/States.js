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
define(function() {

  "use strict";

  /**
   * The `States` enum is the class of names of _action states_.
   *
   * @memberOf pentaho.type.action
   * @enum {number}
   * @readonly
   */
  var States = {
    /**
     * The `candidate` action state.
     * @default
     */
    candidate: 1,

    /**
     * The `init` action state.
     * @default
     */
    init: 2,

    /**
     * The `will` action state.
     * @default
     */
    will: 4,

    /**
     * The `do` action state.
     * @default
     */
    "do": 8,

    /**
     * The `did` action state.
     * @default
     */
    did: 16,

    /**
     * The `canceled` action state.
     * @default
     */
    canceled: 32,

    /**
     * The `failed` action state.
     * @default
     */
    failed: 64
  };

  return Object.freeze(States);
});
