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
define([
  "pentaho/config/impl/Service",
  "tests/pentaho/util/errorMatch"
], function(ConfigurationService, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, beforeAll:false */

  /* eslint dot-notation: 0 */

  describe("pentaho.config.Service -", function() {

    it("should be defined.", function() {
      expect(ConfigurationService).toBeDefined();
    });

    // Should we refactor the tests so they don't depend on the "private" property __ruleStore?

    describe("adding", function() {

      describe("types and instances", function() {
        var ruleNoId;
        var ruleOneId1;
        var ruleOneId2;
        var ruleOneInstId1;
        var ruleMultiIds;
        var ruleMultiInstIds;
        var ruleMultiIdsOneNull;
        var ruleMultiInstIdsOneNull;
        var ruleInstAndTypeId;

        var configurationService;

        beforeAll(function() {
          ruleNoId = {select: {user: "1", theme: "1", locale: "1", application: "1"}};
          ruleMultiIdsOneNull = {select: {type: ["A", null], user: "1", theme: "1", locale: "1", application: "1"}};
          ruleMultiInstIdsOneNull =
              {select: {instance: ["A", null], user: "1", theme: "1", locale: "1", application: "1"}};

          ruleOneId1 = {select: {type: "A", user: "1", theme: "1", locale: "1", application: "1"}};
          ruleOneId2 = {select: {type: "B", user: "1", theme: "1", locale: "1", application: "1"}};
          ruleOneInstId1  = {select: {instance: "A", user: "1", theme: "1", locale: "1", application: "1"}};

          ruleMultiIds = {
            select: {
              type: ["test/type", "test/type2", "A2"],
              user: "1",
              theme: "1",
              locale: "1",
              application: "1"
            }
          };

          ruleMultiInstIds = {
            select: {
              instance: ["test/A", "test/B", "test/C"],
              user: "1",
              theme: "1",
              locale: "1",
              application: "1"
            }
          };

          ruleInstAndTypeId  = {
            select: {
              instance: "A",
              type: "B",
              user: "1",
              theme: "1",
              locale: "1",
              application: "1"
            }
          };

          configurationService = new ConfigurationService();
        });

        it("should define rules with one type id", function() {

          configurationService.add({rules: [ruleOneId1]});

          expect(configurationService.__ruleStore["type:A"]).toBeDefined();
        });

        it("should define rules with one instance id", function() {

          configurationService.add({rules: [ruleOneInstId1]});

          expect(configurationService.__ruleStore["instance:A"]).toBeDefined();
        });

        it("should define rules with multiple type ids", function() {

          configurationService.add({rules: [ruleMultiIds]});

          expect(configurationService.__ruleStore["type:test/type"]).toBeDefined();
          expect(configurationService.__ruleStore["type:test/type2"]).toBeDefined();
          expect(configurationService.__ruleStore["type:A2"]).toBeDefined();
        });

        it("should define rules with multiple instance ids", function() {

          configurationService.add({rules: [ruleMultiInstIds]});

          expect(configurationService.__ruleStore["instance:test/A"]).toBeDefined();
          expect(configurationService.__ruleStore["instance:test/B"]).toBeDefined();
          expect(configurationService.__ruleStore["instance:test/C"]).toBeDefined();
        });

        it("should ignore select.type if select.instance is specified", function() {

          configurationService.add({rules: [ruleInstAndTypeId]});

          expect(configurationService.__ruleStore["instance:A"]).toBeDefined();
          expect(configurationService.__ruleStore["type:B"]).not.toBeDefined();
        });

        it("should define rules with multiple rules", function() {

          configurationService.add({rules: [
            ruleOneId1,
            ruleOneId2,
            ruleOneInstId1
          ]});

          expect(configurationService.__ruleStore["type:A"]).toBeDefined();
          expect(configurationService.__ruleStore["type:B"]).toBeDefined();
          expect(configurationService.__ruleStore["instance:A"]).toBeDefined();
        });

        it("should throw if given a rule with no type or instance", function() {

          expect(function() {
            configurationService.add({rules: [
              ruleNoId
            ]});
          }).toThrow(errorMatch.argRequired("rule.select.type"));
        });

        it("should throw if given a rule with a type array having null elements", function() {

          expect(function() {
            configurationService.add({rules: [
              ruleMultiIdsOneNull
            ]});
          }).toThrow(errorMatch.argRequired("rule.select.type"));
        });

        it("should throw if given a rule with an instance array having null elements", function() {

          expect(function() {
            configurationService.add({rules: [
              ruleMultiInstIdsOneNull
            ]});
          }).toThrow(errorMatch.argRequired("rule.select.instance"));
        });
      });

      describe("order", function() {
        // notice that __ruleStore stores rules in the order they should be merged
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

            testTypeRuleStore = configurationService.__ruleStore["type:test/type"];
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

            testTypeRuleStore = configurationService.__ruleStore["type:test/type"];
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

            testTypeRuleStore = configurationService.__ruleStore["type:test/type"];
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

        var config;

        beforeEach(function(done) {
          var configurationService = new ConfigurationService();

          configurationService.add({
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
          });

          configurationService.getAsync()
              .then(function(_config) {
                config = _config;
              })
              .then(done, done.fail);
        });

        it("should return null if no rule applies to type", function() {
          expect(config.selectType("C")).toBeNull();
        });

        it("should return config if rule applies to type", function() {
          expect(config.selectType("A").testId).toEqual("A");
        });
      });

      describe("instances", function() {

        var config;

        beforeEach(function(done) {
          var configurationService = new ConfigurationService();

          configurationService.add({
            rules: [
              {
                select: {
                  instance: "A"
                },
                apply: {
                  testId: "A"
                }
              },
              {
                select: {
                  instance: "B"
                },
                apply: {
                  testId: "B"
                }
              },
              {
                select: {
                  type: "D"
                },
                apply: {
                  testId: "D"
                }
              }
            ]
          });

          configurationService.getAsync()
              .then(function(_config) {
                config = _config;
              })
              .then(done, done.fail);
        });

        it("should return null if no rule applies to instance", function() {
          expect(config.selectInstance("C")).toBeNull();
        });

        it("should return null if no rule applies to instance and there is a type with the same id", function() {
          expect(config.selectInstance("D")).toBeNull();
        });

        it("should return config if rule applies to instance", function() {
          expect(config.selectInstance("A").testId).toEqual("A");
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

        it("should return null if no select rule applies to criteria", function(done) {

          configurationService.getAsync({user: "-1", theme: "white"})
              .then(function(config) {
                expect(config.selectType("A")).toBeNull();
              })
              .then(done, done.fail);
        });

        it("should return config if single-value select rule applies to criteria", function(done) {

          configurationService.getAsync({user: "2", theme: "white"})
              .then(function(config) {
                expect(config.selectType("A")).not.toBeNull();
              })
              .then(done, done.fail);
        });

        it("should return config if multi-value select rule applies to criteria", function(done) {

          configurationService.getAsync({user: "3", theme: "white"})
              .then(function(config) {
                expect(config.selectType("A")).not.toBeNull();
              })
              .then(done, done.fail);
        });
      });
    });

    describe("merging", function() {
      var configurationService;

      var baseRule;

      beforeEach(function() {
        baseRule = {
          select: {
            type: "test/type"
          },
          apply: {
            simpleValue: "S1",
            arraySimpleValue: [
              "AS1",
              "AS2"
            ],
            complexValue: {
              id: "C1",
              otherProp: "OC1"
            },
            arrayComplexValue: [
              {
                id: "AC1",
                otherProp: "OAC1"
              },
              {
                id: "AC2",
                otherProp: "OAC2"
              }
            ]
          }
        };

        configurationService = new ConfigurationService();

        configurationService.add(
          {
            rules: [
              baseRule
            ]
          }
        );
      });

      describe("default merge handlers", function() {
        var otherRule;

        var config;

        beforeEach(function(done) {
          otherRule = {
            select: {
              type: "test/type"
            },
            apply: {
              simpleValue: "ALT_S1",
              arraySimpleValue: [
                "ALT_AS1"
              ],
              complexValue: {
                id: "ALT_C1"
              },
              arrayComplexValue: [
                {
                  id: "ALT_AC1"
                }
              ]
            }
          };

          configurationService.add(
            {
              rules: [
                otherRule
              ]
            }
          );

          configurationService.getAsync()
              .then(function(_config) {
                config = _config.selectType("test/type");
              })
              .then(done, done.fail);
        });

        it("should replace the value of the simple value property", function() {
          expect(config.simpleValue).toBe("ALT_S1");
        });

        it("should replace the value of the array of simple values property", function() {
          expect(config.arraySimpleValue.length).toBe(1);
          expect(config.arraySimpleValue[0]).toBe("ALT_AS1");
        });

        it("should merge the value of the complex value property", function() {
          expect(config.complexValue.id).toBe("ALT_C1");
          expect(config.complexValue.otherProp).toBe("OC1");
        });

        it("should replace the value of the array of complex values property", function() {
          expect(config.arrayComplexValue.length).toBe(1);
          expect(config.arrayComplexValue[0].id).toBe("ALT_AC1");
          expect(config.arrayComplexValue[0].otherProp).toBeUndefined();
        });

      });

      describe("replace merge handler", function() {
        var otherRule;

        var config;

        beforeEach(function(done) {
          otherRule = {
            select: {
              type: "test/type"
            },
            apply: {
              simpleValue: {
                "$op": "replace",
                value: "ALT_S1"
              },
              arraySimpleValue: {
                "$op": "replace",
                value: [
                  "ALT_AS1"
                ]
              },
              complexValue: {
                "$op": "replace",
                value: {
                  id: "ALT_C1"
                }
              },
              arrayComplexValue: {
                "$op": "replace",
                value: [
                  {
                    id: "ALT_AC1"
                  }
                ]
              }
            }
          };

          configurationService.add(
            {
              rules: [
                otherRule
              ]
            }
          );

          configurationService.getAsync()
              .then(function(_config) {
                config = _config.selectType("test/type");
              })
              .then(done, done.fail);
        });

        it("should replace the value of the simple value property", function() {
          expect(config.simpleValue).toBe("ALT_S1");
        });

        it("should replace the value of the array of simple values property", function() {
          expect(config.arraySimpleValue.length).toBe(1);
          expect(config.arraySimpleValue[0]).toBe("ALT_AS1");
        });

        it("should replace the value of the complex value property", function() {
          expect(config.complexValue.id).toBe("ALT_C1");
          expect(config.complexValue.otherProp).toBeUndefined();
        });

        it("should replace the value of the array of complex values property", function() {
          expect(config.arrayComplexValue.length).toBe(1);
          expect(config.arrayComplexValue[0].id).toBe("ALT_AC1");
          expect(config.arrayComplexValue[0].otherProp).toBeUndefined();
        });

      });

      describe("merge merge handler", function() {
        var otherRule;

        var config;

        beforeEach(function(done) {
          otherRule = {
            select: {
              type: "test/type"
            },
            apply: {
              simpleValue: {
                "$op": "merge",
                value: "ALT_S1"
              },
              arraySimpleValue: {
                "$op": "merge",
                value: [
                  "ALT_AS1"
                ]
              },
              complexValue: {
                "$op": "merge",
                value: {
                  id: "ALT_C1"
                }
              },
              arrayComplexValue: {
                "$op": "merge",
                value: [
                  {
                    id: "ALT_AC1"
                  }
                ]
              }
            }
          };

          configurationService.add(
            {
              rules: [
                otherRule
              ]
            }
          );

          configurationService.getAsync()
              .then(function(_config) {
                config = _config.selectType("test/type");
              })
              .then(done, done.fail);
        });

        it("should replace the value of the simple value property", function() {
          expect(config.simpleValue).toBe("ALT_S1");
        });

        it("should replace the value of the array of simple values property", function() {
          expect(config.arraySimpleValue.length).toBe(1);
          expect(config.arraySimpleValue[0]).toBe("ALT_AS1");
        });

        it("should merge the value of the complex value property", function() {
          expect(config.complexValue.id).toBe("ALT_C1");
          expect(config.complexValue.otherProp).toBe("OC1");
        });

        it("should replace the value of the array of complex values property", function() {
          expect(config.arrayComplexValue.length).toBe(1);
          expect(config.arrayComplexValue[0].id).toBe("ALT_AC1");
          expect(config.arrayComplexValue[0].otherProp).toBeUndefined();
        });

      });

      describe("add merge handler", function() {
        var otherRule;

        var config;

        beforeEach(function(done) {
          otherRule = {
            select: {
              type: "test/type"
            },
            apply: {
              simpleValue: {
                "$op": "add",
                value: "ALT_S1"
              },
              arraySimpleValue: {
                "$op": "add",
                value: [
                  "ALT_AS1"
                ]
              },
              complexValue: {
                "$op": "add",
                value: {
                  id: "ALT_C1"
                }
              },
              arrayComplexValue: {
                "$op": "add",
                value: [
                  {
                    id: "ALT_AC1"
                  }
                ]
              }
            }
          };

          configurationService.add(
            {
              rules: [
                otherRule
              ]
            }
          );

          configurationService.getAsync()
              .then(function(_config) {
                config = _config.selectType("test/type");
              })
              .then(done, done.fail);
        });

        it("should replace the value of the simple value property", function() {
          expect(config.simpleValue).toBe("ALT_S1");
        });

        it("should append values to the array of simple values property", function() {
          expect(config.arraySimpleValue.length).toBe(3);

          expect(config.arraySimpleValue[0]).toBe("AS1");
          expect(config.arraySimpleValue[1]).toBe("AS2");
          expect(config.arraySimpleValue[2]).toBe("ALT_AS1");
        });

        it("should replace the value of the complex value property", function() {
          expect(config.complexValue.id).toBe("ALT_C1");
          expect(config.complexValue.otherProp).toBeUndefined();
        });

        it("should append values to the array of complex values property", function() {
          expect(config.arrayComplexValue.length).toBe(3);

          expect(config.arrayComplexValue[0].id).toBe("AC1");
          expect(config.arrayComplexValue[0].otherProp).toBe("OAC1");

          expect(config.arrayComplexValue[1].id).toBe("AC2");
          expect(config.arrayComplexValue[1].otherProp).toBe("OAC2");

          expect(config.arrayComplexValue[2].id).toBe("ALT_AC1");
          expect(config.arrayComplexValue[2].otherProp).toBeUndefined();
        });

      });

      describe("invalid merge handler", function() {
        var otherRule;

        var config;

        beforeEach(function() {
          otherRule = {
            select: {
              type: "test/type"
            },
            apply: {
              simpleValue: {
                "$op": "INVALID",
                value: "ALT_S1"
              }
            }
          };

          configurationService.add(
            {
              rules: [
                otherRule
              ]
            }
          );
        });

        it("should throw when merge operation is invalid", function(done) {

          configurationService.getAsync()
              .then(function(_config) {
                expect(function() {
                  config = _config.selectType("test/type");
                }).toThrow(errorMatch.operInvalid());
              })
              .then(done, done.fail);
        });

      });

      describe("handling inconsistent types", function() {
        describe("default merge handlers", function() {
          describe("with simple", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  arraySimpleValue: "ALT_AS1",
                  complexValue: "ALT_C1",
                  arrayComplexValue: "ALT_AC1"
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue).toBe("ALT_AS1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue).toBe("ALT_C1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue).toBe("ALT_AC1");
            });
          });

          describe("with array of simple", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: ["ALT_S1"],
                  complexValue: ["ALT_C1"],
                  arrayComplexValue: ["ALT_AC1"]
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue[0]).toBe("ALT_S1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue[0]).toBe("ALT_C1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue[0]).toBe("ALT_AC1");
            });
          });

          describe("with complex", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {id: "ALT_S1"},
                  arraySimpleValue: {id: "ALT_AS1"},
                  arrayComplexValue: {id: "ALT_AC1"}
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue.id).toBe("ALT_S1");
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue.id).toBe("ALT_AS1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue.id).toBe("ALT_AC1");
            });
          });

          describe("with array of complex", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: [{id: "ALT_S1"}],
                  arraySimpleValue: [{id: "ALT_AS1"}],
                  complexValue: [{id: "ALT_C1"}]
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue[0].id).toBe("ALT_S1");
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue[0].id).toBe("ALT_AS1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue[0].id).toBe("ALT_C1");
            });
          });

        });

        describe("replace merge handler", function() {
          describe("with simple", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  arraySimpleValue: {
                    "$op": "replace",
                    value: "ALT_AS1"
                  },
                  complexValue: {
                    "$op": "replace",
                    value: "ALT_C1"
                  },
                  arrayComplexValue: {
                    "$op": "replace",
                    value: "ALT_AC1"
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue).toBe("ALT_AS1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue).toBe("ALT_C1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue).toBe("ALT_AC1");
            });
          });

          describe("with array of simple", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {
                    "$op": "replace",
                    value: ["ALT_S1"]
                  },
                  complexValue: {
                    "$op": "replace",
                    value: ["ALT_C1"]
                  },
                  arrayComplexValue: {
                    "$op": "replace",
                    value: ["ALT_AC1"]
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue[0]).toBe("ALT_S1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue[0]).toBe("ALT_C1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue[0]).toBe("ALT_AC1");
            });
          });

          describe("with complex", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {
                    "$op": "replace",
                    value: {id: "ALT_S1"}
                  },
                  arraySimpleValue: {
                    "$op": "replace",
                    value: {id: "ALT_AS1"}
                  },
                  arrayComplexValue: {
                    "$op": "replace",
                    value: {id: "ALT_AC1"}
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue.id).toBe("ALT_S1");
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue.id).toBe("ALT_AS1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue.id).toBe("ALT_AC1");
            });
          });

          describe("with array of complex", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {
                    "$op": "replace",
                    value: [{id: "ALT_S1"}]
                  },
                  arraySimpleValue: {
                    "$op": "replace",
                    value: [{id: "ALT_AS1"}]
                  },
                  complexValue: {
                    "$op": "replace",
                    value: [{id: "ALT_C1"}]
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue[0].id).toBe("ALT_S1");
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue[0].id).toBe("ALT_AS1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue[0].id).toBe("ALT_C1");
            });
          });

        });

        describe("merge merge handler", function() {
          describe("with simple", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  arraySimpleValue: {
                    "$op": "merge",
                    value: "ALT_AS1"
                  },
                  complexValue: {
                    "$op": "merge",
                    value: "ALT_C1"
                  },
                  arrayComplexValue: {
                    "$op": "merge",
                    value: "ALT_AC1"
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue).toBe("ALT_AS1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue).toBe("ALT_C1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue).toBe("ALT_AC1");
            });
          });

          describe("with array of simple", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {
                    "$op": "merge",
                    value: ["ALT_S1"]
                  },
                  complexValue: {
                    "$op": "merge",
                    value: ["ALT_C1"]
                  },
                  arrayComplexValue: {
                    "$op": "merge",
                    value: ["ALT_AC1"]
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue[0]).toBe("ALT_S1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue[0]).toBe("ALT_C1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue[0]).toBe("ALT_AC1");
            });
          });

          describe("with complex", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {
                    "$op": "merge",
                    value: {id: "ALT_S1"}
                  },
                  arraySimpleValue: {
                    "$op": "merge",
                    value: {id: "ALT_AS1"}
                  },
                  arrayComplexValue: {
                    "$op": "merge",
                    value: {id: "ALT_AC1"}
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue.id).toBe("ALT_S1");
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue.id).toBe("ALT_AS1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue.id).toBe("ALT_AC1");
            });
          });

          describe("with array of complex", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {
                    "$op": "merge",
                    value: [{id: "ALT_S1"}]
                  },
                  arraySimpleValue: {
                    "$op": "merge",
                    value: [{id: "ALT_AS1"}]
                  },
                  complexValue: {
                    "$op": "merge",
                    value: [{id: "ALT_C1"}]
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue[0].id).toBe("ALT_S1");
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue[0].id).toBe("ALT_AS1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue[0].id).toBe("ALT_C1");
            });
          });

        });

        describe("add merge handler", function() {
          describe("with simple", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  arraySimpleValue: {
                    "$op": "add",
                    value: "ALT_AS1"
                  },
                  complexValue: {
                    "$op": "add",
                    value: "ALT_C1"
                  },
                  arrayComplexValue: {
                    "$op": "add",
                    value: "ALT_AC1"
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue).toBe("ALT_AS1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue).toBe("ALT_C1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue).toBe("ALT_AC1");
            });
          });

          describe("with array of simple", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {
                    "$op": "add",
                    value: ["ALT_S1"]
                  },
                  complexValue: {
                    "$op": "add",
                    value: ["ALT_C1"]
                  },
                  arrayComplexValue: {
                    "$op": "add",
                    value: ["ALT_AC1"]
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue[0]).toBe("ALT_S1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue[0]).toBe("ALT_C1");
            });

            it("should append values to the array of complex values property", function() {
              expect(config.arrayComplexValue.length).toBe(3);

              expect(config.arrayComplexValue[0].id).toBe("AC1");
              expect(config.arrayComplexValue[0].otherProp).toBe("OAC1");

              expect(config.arrayComplexValue[1].id).toBe("AC2");
              expect(config.arrayComplexValue[1].otherProp).toBe("OAC2");

              expect(typeof config.arrayComplexValue[2]).not.toBe("object");
              expect(config.arrayComplexValue[2]).toBe("ALT_AC1");
            });
          });

          describe("with complex", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {
                    "$op": "add",
                    value: {id: "ALT_S1"}
                  },
                  arraySimpleValue: {
                    "$op": "add",
                    value: {id: "ALT_AS1"}
                  },
                  arrayComplexValue: {
                    "$op": "add",
                    value: {id: "ALT_AC1"}
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue.id).toBe("ALT_S1");
            });

            it("should replace the value of the array of simple values property", function() {
              expect(config.arraySimpleValue.id).toBe("ALT_AS1");
            });

            it("should replace the value of the array of complex values property", function() {
              expect(config.arrayComplexValue.id).toBe("ALT_AC1");
            });
          });

          describe("with array of complex", function() {
            var otherRule;

            var config;

            beforeEach(function(done) {
              otherRule = {
                select: {
                  type: "test/type"
                },
                apply: {
                  simpleValue: {
                    "$op": "add",
                    value: [{id: "ALT_S1"}]
                  },
                  arraySimpleValue: {
                    "$op": "add",
                    value: [{id: "ALT_AS1"}]
                  },
                  complexValue: {
                    "$op": "add",
                    value: [{id: "ALT_C1"}]
                  }
                }
              };

              configurationService.add(
                {
                  rules: [
                    otherRule
                  ]
                }
              );

              configurationService.getAsync()
                  .then(function(_config) {
                    config = _config.selectType("test/type");
                  })
                  .then(done, done.fail);
            });

            it("should replace the value of the simple value property", function() {
              expect(config.simpleValue[0].id).toBe("ALT_S1");
            });

            it("should append values to the array of simple values property", function() {
              expect(config.arraySimpleValue.length).toBe(3);

              expect(config.arraySimpleValue[0]).toBe("AS1");
              expect(config.arraySimpleValue[1]).toBe("AS2");

              expect(typeof config.arraySimpleValue[2]).toBe("object");
              expect(config.arraySimpleValue[2].id).toBe("ALT_AS1");
            });

            it("should replace the value of the complex value property", function() {
              expect(config.complexValue[0].id).toBe("ALT_C1");
            });
          });
        });
      });
    });
  });
});
