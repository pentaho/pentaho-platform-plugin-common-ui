/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
   * The `InformationLevels` enum is the class of names of well known _information levels_.
   *
   * @memberOf pentaho.util.debug
   * @enum {number}
   * @readonly
   * @private
   */
  var InformationLevels = {
    /**
     * The `none` information level represents the absence of information or not wanting to receive any.
     * @default
     */
    none: 0,

    /**
     * The `error` information level represents error events.
     * @default
     */
    error: 1,

    /**
     * The `exception` is an alias for the [error]{@link pentaho.util.debug.InformationLevels#error} level.
     * @default
     */
    exception: 1,

    /**
     * The `warn` information level represents events situations that might be a problem or not.
     * @default
     */
    warn: 2,

    /**
     * The `info` information level represents general information.
     * @default
     */
    info: 3,

    /**
     * The `debug` information level represents information that is relevant to **debug** an application.
     * @default
     */
    debug: 4,

    /**
     * The `log` is an alias for the [debug]{@link pentaho.util.debug.InformationLevels#debug} level.
     * @default
     */
    log: 4,

    /**
     * The `trace` information level represents information with the same character as
     * the [debug]{@link pentaho.util.debug.InformationLevels#debug} level, but more detailed.
     *
     * @default
     */
    trace: 5,

    /**
     * The `all` information level represents _all_ information.
     * @default
     */
    all: Infinity
  };

  return Object.freeze(InformationLevels);
});
