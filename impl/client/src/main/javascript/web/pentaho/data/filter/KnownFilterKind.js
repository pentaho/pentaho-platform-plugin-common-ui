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
     * The [IsGreater]{@link pentaho.data.filter.IsGreater} filter kind.
     * @default
     */
    IsGreater: "isGreater",

    /**
     * The [IsLess]{@link pentaho.data.filter.IsLess} filter kind.
     * @default
     */
    IsLess: "isLess",

    /**
     * The [IsGreaterOrEqual]{@link pentaho.data.filter.IsGreaterOrEqual} filter kind.
     * @default
     */
    IsGreaterOrEqual: "isGreaterOrEqual",

    /**
     * The [IsLessOrEqual]{@link pentaho.data.filter.IsLessOrEqual} filter kind.
     * @default
     */
    IsLessOrEqual: "isLessOrEqual",

    /**
     * The [IsLike]{@link pentaho.data.filter.IsLike} filter kind.
     * @default
     */
    IsLike: "isLike",

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
