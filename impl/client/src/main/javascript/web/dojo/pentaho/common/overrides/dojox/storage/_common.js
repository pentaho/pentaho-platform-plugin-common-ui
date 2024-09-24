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
define("dojox/storage/_common", [
  "dojox/storage/Provider",
  "dojox/storage/manager",
  "dojox/storage/LocalStorageProvider"
], function(Provider, manager){
  manager.initialize();
});

