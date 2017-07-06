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
   * The `KnownFilterKind` enum is the
   * class of names of the standard, concrete [filter]{@link pentaho.data.filter.Abstract} types.
   *
   * @memberOf pentaho.data.filter
   * @enum {string}
   * @readonly
   * @see pentaho.data.filter.Abstract#kind
   */
  var KnownFilterKind = {
    /**
     * The [And]{@link pentaho.data.filter.And} filter kind.
     * @default
     */
    And: "and",

    /**
     * The [Or]{@link pentaho.data.filter.Or} filter kind.
     * @default
     */
    Or: "or",

    /**
     * The [Not]{@link pentaho.data.filter.And} filter kind.
     * @default
     */
    Not: "not",

    /**
     * The [IsEqual]{@link pentaho.data.filter.IsEqual} filter kind.
     * @default
     */
    IsEqual: "isEqual",

    /**
     * The [IsIn]{@link pentaho.data.filter.IsIn} filter kind.
     * @default
     * @private
     */
    IsIn: "isIn",

    /**
     * The [True]{@link pentaho.data.filter.True} filter kind.
     * @default
     */
    True: "true",

    /**
     * The [False]{@link pentaho.data.filter.False} filter kind.
     * @default
     */
    False: "false"
  };

  return KnownFilterKind;
});
