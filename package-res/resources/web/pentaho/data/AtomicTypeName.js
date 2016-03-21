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

  // In the current JsDocs3 version (3.3.2), enums are not showing default values (see #689).
  // So I added the default values in the text, explicitly.
  // Also, had to use the "var" syntax for it to correctly capture the enum's properties...

  /**
   * The `AtomicTypeName` enum is the
   * class of names of the possible {@link pentaho.data.Atomic} types.
   *
   * #### AMD
   *
   * To obtain this enumeration object,
   * require the module `"pentaho/data/AtomicTypeName"`.
   *
   * @memberOf pentaho.data
   * @enum {string}
   * @readonly
   * @see pentaho.data.Atomic
   */
  var AtomicTypeName = {
    /**
     * The {@link string} type name: `"string"`.
     * @default
     */
    STRING: "string",

    /**
     * The {@link number} type name: `"number"`.
     * @default
     */
    NUMBER: "number",

    /**
     * The {@link boolean} type name: `"boolean"`.
     * @default
     */
    BOOLEAN: "boolean",

    /**
     * The {@link Date} type name: `"date"`.
     * @default
     */
    DATE: "date"
  };

  return AtomicTypeName;
});
