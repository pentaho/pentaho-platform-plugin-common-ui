/*!
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2016 Pentaho Corporation. All rights reserved.
 */

/**
 * Test environment AMD/RequireJS configuration and overrides.
 *
 * The AMD configuration of the source code and dependencies
 * is loaded by `build-res/requireCfg-raw.js`, **before** this file.
 */
(function() {
  "use strict";

  /*global requireCfg:false, window:false, KARMA_DEBUG:false*/

  // Karma serves files from '/base'

  requireCfg.baseUrl = "/base/build-res/module-scripts/";

  // ---

  requireCfg.paths["angular-mocks"] = "/base/test-js/unit/angular/angular-mocks";
  requireCfg.shim["angular-mocks"] = {deps: ["common-ui/angular-resource"]};

  requireCfg.paths["angular-scenario"] = "/base/package-res/resources/web/angular/angular-scenario";

  requireCfg.paths["dojo"]  = "/base/dev-res/dojo/dojo-release-1.9.2-src/dojo";
  requireCfg.paths["dojox"] = "/base/dev-res/dojo/dojo-release-1.9.2-src/dojox";
  requireCfg.paths["dijit"] = "/base/dev-res/dojo/dojo-release-1.9.2-src/dijit";

  requireCfg.paths["pentaho/visual/type/registryMock"] = "/base/test-js/unit/pentaho/visual/2.5/type/registryMock";

  requireCfg.paths["common-ui/jquery-clean"] = "/base/package-res/resources/web/jquery/jquery-1.9.1";
  requireCfg.shim["common-ui/jquery-clean"] = {
    exports: "$",
    init: function() {
      /*global $:false*/
      return $.noConflict(true);
    }
  };

  requireCfg.paths["pentaho/i18n"] = "/base/test-js/unit/pentaho/i18nMock";

  // Reset "pentaho/service" module configuration.
  requireCfg.config["pentaho/service"] = {};

}());