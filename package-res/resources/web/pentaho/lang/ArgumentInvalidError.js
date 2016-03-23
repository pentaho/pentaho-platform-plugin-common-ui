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

define([
  "./ArgumentError",
  "../util/text"
], function(ArgumentError, textUtil) {

  "use strict";

  return ArgumentError.extend("pentaho.lang.ArgumentInvalidError", /** @lends pentaho.lang.ArgumentInvalidError# */{
    /**
     * @classDesc The `ArgumentInvalidError` class is the class of errors that
     * signals that a function argument has been specified, albeit with an invalid value.
     *
     * The name of the argument can be that of a nested property,
     * like, for example, `"keyArgs.description"`.
     *
     * An argument's value can be considered **invalid** because:
     * * it is not of one of the supported, documented types -
     *   use {@link pentaho.lang.ArgumentInvalidTypeError} instead
     * * the specific value is not supported, or is out of range -
     *   use {@link pentaho.lang.ArgumentRangeError} instead
     * * the value is not in an acceptable state
     * * the value refers to something which does not exist (like a dictionary _key_ which is undefined)
     * * ...
     *
     * You should use this error if none of the other more specific
     * invalid argument errors applies.
     *
     * @name ArgumentInvalidError
     * @memberOf pentaho.lang
     * @class
     * @extends pentaho.lang.ArgumentError
     * @amd pentaho/lang/ArgumentInvalidError
     *
     * @description Creates an invalid argument error object.
     * @constructor
     * @param {string} name The name of the argument.
     * @param {string} reason Text that explains the reason why the argument is considered invalid.
     * Can be useful when "being required" is a dynamic rule.
     */
    constructor: function(name, reason) {
      this.base(name, textUtil.andSentence("Argument " + name + " is invalid.", reason));
    },

    /**
     * The name of the type of error.
     *
     * @type {string}
     * @readonly
     * @default "ArgumentInvalidError"
     */
    name: "ArgumentInvalidError"
  });
});
