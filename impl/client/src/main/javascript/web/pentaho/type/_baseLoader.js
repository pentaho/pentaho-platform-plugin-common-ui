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
  "./impl/Loader"
], function(Loader) {

  "use strict";

  // `./_baseLoader` creates/contains the `ILoader` singleton instance and nothing more.

  // Request `./loader` instead to be sure that all standard types can be requested synchronously.

  // For convenience, requesting the `Complex` class (like, for example, when defining a new complex type)
  // also loads some of the other standard types.

  return new Loader();
});
