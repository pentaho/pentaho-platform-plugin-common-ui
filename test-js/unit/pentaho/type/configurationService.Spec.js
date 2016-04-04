/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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

// Must be executed out of strict scope
var __global__ = this;

define([
  "tests/test-utils"
], function(testUtils) {
  "use strict";

  /* global describe:false, expect:false */

  var it = testUtils.itAsync;

  describe("pentaho.type.configurationService -", function() {

    it("returns the instance of the configured service", function() {
      var mod1 = function() { return 0; };

      return require.using(["pentaho/type/configurationService"], function(localRequire) {
        localRequire.config({
          config: {
            "pentaho/service": {
              "testModule": "pentaho.type.IConfigurationService"
            }
          }
        });

        localRequire.define("testModule", function() { return mod1; });
      }, function(configurationService) {
        expect(configurationService instanceof mod1).toBe(true);
      });
    });

    it("returns a single instance of the configured service even when more than one service is available", function() {
      var mod1 = function() { return 1; };
      var mod2 = function() { return 2;};
      var mod3 = function() { return 3;};

      return require.using(["pentaho/type/configurationService"], function(localRequire) {
        localRequire.config({
          config: {
            "pentaho/service": {
              "testModule3": "pentaho.type.IConfigurationService",
              "testModule1": "pentaho.type.IConfigurationService",
              "testModule2": "pentaho.type.IConfigurationService"
            }
          }
        });

        localRequire.define("testModule1", function() { return mod1; });
        localRequire.define("testModule2", function() { return mod2; });
        localRequire.define("testModule3", function() { return mod3; });
      }, function(configurationService) {
        expect([mod1, mod2, mod3]).toContain(configurationService.constructor);
      });
    });

    it("returns by default a instance of ConfigurationService when no service is configured", function() {

      return require.using(["pentaho/type/configurationService", "pentaho/type/config/ConfigurationService"], function(configurationService, ConfigurationService) {
        expect(configurationService.constructor).toBe(ConfigurationService);
      });
    });

  });

});
