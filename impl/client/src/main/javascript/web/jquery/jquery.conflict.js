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
  "common-ui/jquery-clean"
], function($) {

  "use strict";

  /* globals window */

  // Republish in global scope.

  return (window.$ = window.jQuery = $);
});
