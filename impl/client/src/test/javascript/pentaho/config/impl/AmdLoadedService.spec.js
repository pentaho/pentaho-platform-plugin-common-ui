/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.config.impl.AmdLoadedService -", function() {

    // Should we refactor the tests so they don't depend on the "private" property __ruleStore?

    describe("configuration loading", function() {
      var localRequire;
      var config1;
      var config2;
      var config3;

      beforeEach(function() {
        localRequire = require.new();

        config3 = {
          rules: [
            {
              select: {
                type: "A"
              },
              apply: {
                testId: 4
              }
            },
            {
              select: {
                type: "A"
              },
              apply: {
                testId: 5
              }
            },
            {
              select: {
                type: "A"
              },
              apply: {
                testId: 6
              }
            }
          ]
        };
        localRequire.define("test/config/3", config3);

        config1 = {
          rules: [
            {
              select: {
                type: "A"
              },
              apply: {
                testId: 1
              }
            }
          ]
        };
        localRequire.define("test/config/1", config1);

        config2 = {
          rules: [
            {
              select: {
                type: "A"
              },
              apply: {
                testId: 2
              }
            },
            {
              select: {
                type: "A"
              },
              apply: {
                testId: 3
              }
            }
          ]
        };
        localRequire.define("test/config/2", config2);

        // Reset current service configuration
        localRequire.config({
          config: {
            "pentaho/instanceInfo": {
              "test/config/3": {type: "pentaho.config.spec.IRuleSet"},
              "test/config/2": {type: "pentaho.config.spec.IRuleSet"},
              "test/config/1": {type: "pentaho.config.spec.IRuleSet"}
            }
          }
        });
      });

      afterEach(function() {
        localRequire.dispose();
      });

      it("should add loaded rules", function(done) {
        localRequire(["pentaho/config/impl/AmdLoadedService"], function(ConfigService) {
          var cf = new ConfigService();
          expect(cf.__ruleStore["type:A"].length).toBe(6);
          done();
        });
      });

      it("natural rule order follows moduleId alphabetic order and each config rules order", function(done) {
        localRequire(["pentaho/config/impl/AmdLoadedService"], function(ConfigService) {
          var cf = new ConfigService();

          var Ids = cf.__ruleStore["type:A"].map(function(rule) {
            return rule.apply.testId;
          });

          expect(Ids).toEqual([1, 2, 3, 4, 5, 6]);
          done();
        });
      });
    });
  });
});
