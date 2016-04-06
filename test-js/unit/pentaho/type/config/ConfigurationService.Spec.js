/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
define([
  "pentaho/type/config/ConfigurationService"
], function(ConfigurationService) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, beforeAll:false */

  describe("pentaho.type.config.ConfigurationService -", function() {

    it("should be defined.", function() {
      expect(ConfigurationService).toBeDefined();
    });

    // Should we refactor the tests so they don't depend on the "private" property _ruleStore?

    describe("adding", function() {
      describe("types", function() {
        var ruleNoId;
        var ruleShortId;
        var ruleMultiIds;

        var configurationService;

        beforeAll(function() {
          ruleNoId = {select: {user: "1", theme: "1", locale: "1", application: "1"}};
          ruleShortId = {select: {type: "A", user: "1", theme: "1", locale: "1", application: "1"}};
          ruleMultiIds = {
            select: {
              type: ["test/type", "test/type2", "A2"],
              user: "1",
              theme: "1",
              locale: "1",
              application: "1"
            }
          };

          configurationService = new ConfigurationService();

          configurationService.add({
            rules: [
              ruleNoId,
              ruleShortId,
              ruleMultiIds
            ]
          });
        });

        it("should default to pentaho/type/value", function() {
          expect(configurationService._ruleStore["pentaho/type/value"]).toBeDefined();
          expect(configurationService._ruleStore["pentaho/type/value"][0]).toBe(ruleNoId);
        });

        it("should convert from short IDs to full IDs", function() {
          expect(configurationService._ruleStore["A"]).toBeUndefined();
          expect(configurationService._ruleStore["pentaho/type/A"]).toBeDefined();

          expect(configurationService._ruleStore["A2"]).toBeUndefined();
          expect(configurationService._ruleStore["pentaho/type/A2"]).toBeDefined();
        });
      });

      describe("order", function() {
        // notice that _ruleStore stores rules in the order they should be merged
        // with the more specific having higher indexes

        describe("priority", function() {
          var ruleHighPriority1;
          var ruleLowPriority1;

          var testTypeRuleStore;

          beforeAll(function() {
            ruleHighPriority1 = {priority: 50, select: {type: "test/type"}};
            ruleLowPriority1 = {priority: -50, select: {type: "test/type"}};

            var configurationService = new ConfigurationService();

            configurationService.add({
              rules: [
                ruleHighPriority1,
                ruleLowPriority1
              ]
            });

            testTypeRuleStore = configurationService._ruleStore["test/type"];
          });

          it("higher priority before", function() {
            expect(testTypeRuleStore[1]).toBe(ruleHighPriority1);
          });

          it("lower priority after", function() {
            expect(testTypeRuleStore[0]).toBe(ruleLowPriority1);
          });
        });

        describe("specificity", function() {
          var ruleNotSpecific1;
          var ruleApplicationSpecific1;
          var ruleLocaleSpecific1;
          var ruleThemeSpecific1;
          var ruleUserSpecific1;
          var ruleVerySpecific1;

          var testTypeRuleStore;

          beforeAll(function() {
            ruleNotSpecific1 = {select: {type: "test/type"}};
            ruleVerySpecific1 = {select: {type: "test/type", user: "1", theme: "1", locale: "1", application: "1"}};
            ruleUserSpecific1 = {select: {type: "test/type", user: "1"}};
            ruleThemeSpecific1 = {select: {type: "test/type", theme: "1"}};
            ruleLocaleSpecific1 = {select: {type: "test/type", locale: "1"}};
            ruleApplicationSpecific1 = {select: {type: "test/type", application: "1"}};

            var configurationService = new ConfigurationService();

            configurationService.add({
              rules: [
                ruleVerySpecific1,
                ruleApplicationSpecific1,
                ruleLocaleSpecific1,
                ruleThemeSpecific1,
                ruleUserSpecific1,
                ruleNotSpecific1
              ]
            });

            testTypeRuleStore = configurationService._ruleStore["test/type"];
          });

          it("more specific before", function() {
            expect(testTypeRuleStore[5]).toBe(ruleVerySpecific1);
          });

          it("user specific before others", function() {
            expect(testTypeRuleStore[4]).toBe(ruleUserSpecific1);
          });

          it("theme specific after user specific", function() {
            expect(testTypeRuleStore[3]).toBe(ruleThemeSpecific1);
          });

          it("locale specific after theme specific", function() {
            expect(testTypeRuleStore[2]).toBe(ruleLocaleSpecific1);
          });

          it("application specific after locale specific", function() {
            expect(testTypeRuleStore[1]).toBe(ruleApplicationSpecific1);
          });

          it("less specific after", function() {
            expect(testTypeRuleStore[0]).toBe(ruleNotSpecific1);
          });
        });

        describe("ordinality", function() {
          var ruleVerySpecific1;
          var ruleVerySpecific2;

          var testTypeRuleStore;

          beforeAll(function() {
            ruleVerySpecific1 = {select: {type: "test/type", user: "1", theme: "1", locale: "1", application: "1"}};
            ruleVerySpecific2 = {select: {type: "test/type", user: "1", theme: "1", locale: "1", application: "1"}};

            var configurationService = new ConfigurationService();

            configurationService.add({
              rules: [
                ruleVerySpecific1,
                ruleVerySpecific2
              ]
            });

            testTypeRuleStore = configurationService._ruleStore["test/type"];
          });

          it("later before", function() {
            expect(testTypeRuleStore[1]).toBe(ruleVerySpecific2);
          });

          it("earlier after", function() {
            expect(testTypeRuleStore[0]).toBe(ruleVerySpecific1);
          });
        });
      });
    });

    describe("selecting", function() {
      describe("types", function() {
      var configurationService;

      beforeEach(function() {
        configurationService = new ConfigurationService();

        configurationService.add(
          {
            rules: [
              {
                select: {
                  type: "A"
                },
                apply: {
                  testId: "A"
                }
              },
              {
                select: {
                  type: "B"
                },
                apply: {
                  testId: "B"
                }
              }
            ]
          }
        );
      });

        it("should return null if no rule applies to type", function() {
        expect(configurationService.select("C")).toBeNull();
      });

        it("should return config if rule applies to type", function() {
        expect(configurationService.select("A").testId).toEqual("A");
      });

      it("should convert from short IDs to full IDs", function() {
        expect(configurationService.select("A").testId).toEqual(configurationService.select("pentaho/type/A").testId);
      });
    });

      describe("filtering", function() {
        var configurationService;

        beforeEach(function() {
          configurationService = new ConfigurationService();

          configurationService.add(
            {
              rules: [
                {
                  select: {
                    type: "A",
                    user: "1"
                  },
                  apply: {
                    testId: "A1"
                  }
                },
                {
                  select: {
                    type: "A",
                    user: "2"
                  },
                  apply: {
                    testId: "A2"
                  }
                },
                {
                  select: {
                    type: "A",
                    user: ["3", "4"]
                  },
                  apply: {
                    testId: "A3"
                  }
                },
                {
                  select: {
                    type: "A",
                    user: ["4", "5"],
                    theme: "white"
                  },
                  apply: {
                    testId: "A4"
                  }
                },
                {
                  select: {
                    type: "B"
                  },
                  apply: {
                    testId: "B"
                  }
                }
              ]
            }
          );
        });

        it("should return null if no select rule applies to criteria", function() {
          expect(configurationService.select("A", {user: "-1", theme: "white"})).toBeNull();
        });

        it("should return config if single-value select rule applies to criteria", function() {
          expect(configurationService.select("A", {user: "2", theme: "white"})).not.toBeNull();
        });

        it("should return config if multi-value select rule applies to criteria", function() {
          expect(configurationService.select("A", {user: "3", theme: "white"})).not.toBeNull();
        });
      });
    });

  });

});
