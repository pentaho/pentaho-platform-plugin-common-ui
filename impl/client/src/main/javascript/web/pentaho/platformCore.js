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
  "pentaho/config/service",
  "pentaho/config/impl/Service",
  "pentaho/module/service",
  "pentaho/module/metaService",
  "pentaho/module/metaOf",
  "pentaho/module/subtypeOf",
  "pentaho/module/subtypesOf",
  "pentaho/module/instanceOf",
  "pentaho/module/instancesOf",

  "pentaho/i18n/MessageBundle",
  "pentaho/i18n/LoadConfigAnnotation",

  "pentaho/theme/main",
  "pentaho/theme/LoadThemeAnnotation",

  "pentaho/csrf/service",

  "pentaho/lang/UserError",
  "pentaho/lang/RuntimeError",
  "pentaho/lang/Event",
  "pentaho/lang/EventSource",
  "pentaho/lang/Collection",
  "pentaho/util/date"
], function() {
  // Function must be here, or r.js generates a bundle whose last module, this one, is anonymous...
  "use strict";
});
