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
  "module",
  "./AbstractTransactionScope"
], function(module, AbstractTransactionScope) {

  "use strict";

  return AbstractTransactionScope.extend(module.id, /** @lends pentaho.type.action.CommittedScope# */{
    /**
     * @alias CommittedScope
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.type.action.AbstractTransactionScope
     *
     * @classDesc The `CommittedScope` class provides a way for a certain region of code to
     * read the committed values of instances.
     *
     * @constructor
     * @description Creates a `CommittedScope`.
     */
    constructor: function() {
      this.base(null);
    }
  });
});
