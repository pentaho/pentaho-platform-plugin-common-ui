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
   * @ignore
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
