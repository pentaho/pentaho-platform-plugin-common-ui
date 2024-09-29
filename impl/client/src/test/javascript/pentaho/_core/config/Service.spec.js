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
  "pentaho/shim/es6-promise"
], function() {

  "use strict";

  /* eslint dot-notation: 0 */

  describe("pentaho._core.config.Service", function() {

    var localRequire;
    var core;
    var ConfigurationService;
    var configServiceFactory;
    var errorMatch;

    beforeEach(function() {
      localRequire = require.new();

      return localRequire.promise([
        "pentaho/_core/config/Service",
        "tests/pentaho/util/errorMatch"
      ]).then(function(deps) {
        configServiceFactory = deps[0];
        errorMatch = deps[1];
      });
    });

    afterEach(function() {
      localRequire.dispose();
    });

    // ---

    // region Mocks
    function createCoreMock() {

      var core = {
        moduleMetaService: createMetaModuleServiceMock()
      };

      return core;
    }

    function createMetaModuleServiceMock() {

      var moduleMetaService = jasmine.createSpyObj("moduleMetaService", [
        "getId", "get"
      ]);

      moduleMetaService.getId.and.callFake(function(id) { return id; });
      moduleMetaService.get.and.callFake(function(id) { return null; });

      return moduleMetaService;
    }
    // endregion

    it("should be defined", function() {
      expect(configServiceFactory).toBeDefined();
    });

    // TODO: Should we refactor the tests so they don't depend on the "private" property __ruleStore?

    describe("adding", function() {

      beforeEach(function() {
        core = createCoreMock();
        ConfigurationService = configServiceFactory(core);
      });

      describe("select.module", function() {
        var ruleNoId;
        var ruleOneId1;
        var ruleOneId2;
        var ruleMultiIds;
        var ruleMultiIdsOneNull;

        var configurationService;

        beforeAll(function() {
          ruleNoId = {select: {user: "1", theme: "1", locale: "1", application: "1"}};
          ruleMultiIdsOneNull = {select: {module: ["A", null], user: "1", theme: "1", locale: "1", application: "1"}};

          ruleOneId1 = {select: {module: "A", user: "1", theme: "1", locale: "1", application: "1"}};
          ruleOneId2 = {select: {module: "B", user: "1", theme: "1", locale: "1", application: "1"}};

          ruleMultiIds = {
            select: {
              module: ["test/type", "test/type2", "A2"],
              user: "1",
              theme: "1",
              locale: "1",
              application: "1"
            }
          };
        });

        beforeEach(function() {
          configurationService = new ConfigurationService({application: "1"});
        });

        it("should define a rule that has one module id", function() {

          configurationService.add({rules: [ruleOneId1]});

          expect(configurationService.__ruleStore["A"]).toBeDefined();
        });

        it("should define a rule that has multiple module ids", function() {

          configurationService.add({rules: [ruleMultiIds]});

          expect(configurationService.__ruleStore["test/type"]).toBeDefined();
          expect(configurationService.__ruleStore["test/type2"]).toBeDefined();
          expect(configurationService.__ruleStore["A2"]).toBeDefined();
        });

        it("should define multiple rules given a rule-set with multiple rules", function() {

          configurationService.add({rules: [
            ruleOneId1,
            ruleOneId2
          ]});

          expect(configurationService.__ruleStore["A"]).toBeDefined();
          expect(configurationService.__ruleStore["B"]).toBeDefined();
        });

        it("should throw if given a rule with a module array having null elements", function() {

          expect(function() {
            configurationService.add({rules: [
              ruleMultiIdsOneNull
            ]});
          }).toThrow(errorMatch.argRequired("rule.select.module"));
        });
      });

      describe("order", function() {
        // Notice that __ruleStore stores rules in the order they should be merged
        // with the more specific having higher indexes

        describe("priority", function() {
          var ruleHighPriority1;
          var ruleLowPriority1;

          var testTypeRuleStore;

          beforeEach(function() {
            ruleHighPriority1 = {priority: 50, select: {module: "test/type"}};
            ruleLowPriority1 = {priority: -50, select: {module: "test/type"}};

            var configurationService = new ConfigurationService();

            configurationService.add({
              rules: [
                ruleHighPriority1,
                ruleLowPriority1
              ]
            });

            testTypeRuleStore = configurationService.__ruleStore["test/type"];
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

          beforeEach(function() {
            ruleNotSpecific1 = {select: {module: "test/type"}};
            ruleVerySpecific1 = {select: {module: "test/type", user: "1", theme: "1", locale: "1", application: "1"}};
            ruleUserSpecific1 = {select: {module: "test/type", user: "1"}};
            ruleThemeSpecific1 = {select: {module: "test/type", theme: "1"}};
            ruleLocaleSpecific1 = {select: {module: "test/type", locale: "1"}};
            ruleApplicationSpecific1 = {select: {module: "test/type", application: "1"}};

            var configurationService = new ConfigurationService();

            configurationService.__filterRule = function() { return true; };

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

            testTypeRuleStore = configurationService.__ruleStore["test/type"];
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

          beforeEach(function() {
            ruleVerySpecific1 = {select: {module: "test/type", user: "1", theme: "1", locale: "1", application: "1"}};
            ruleVerySpecific2 = {select: {module: "test/type", user: "1", theme: "1", locale: "1", application: "1"}};

            var configurationService = new ConfigurationService();

            configurationService.add({
              rules: [
                ruleVerySpecific1,
                ruleVerySpecific2
              ]
            });

            testTypeRuleStore = configurationService.__ruleStore["test/type"];
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

      describe("modules", function() {

        var configurationService;

        beforeEach(function() {

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          configurationService = new ConfigurationService();

          configurationService.add({
            rules: [
              {
                select: {
                  module: "A"
                },
                apply: {
                  testId: "A"
                }
              },
              {
                select: {
                  module: "B"
                },
                apply: {
                  testId: "B"
                }
              }
            ]
          });
        });

        it("should return null if no rule applies to module", function() {
          return configurationService.selectAsync("C").then(function(result) {
            expect(result).toBeNull();
          });
        });

        it("should return config if rule applies to module", function() {
          return configurationService.selectAsync("A").then(function(result) {
            expect(result.testId).toEqual("A");
          });
        });
      });

      describe("select.module resolution", function() {

        describe("relative mapping", function() {

          it("should return config if rule applies to module", function() {

            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.returnValue(null);

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService();

            configurationService.add({
              contextId: "test/B",
              rules: [
                {
                  select: {
                    module: "./A"
                  },
                  apply: {
                    testId: "A"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/A").then(function(result) {
              expect(result).not.toBe(null);
              expect(result.testId).toEqual("A");
            });
          });

          it("should throw if module id is relative and contextId is not specified", function() {

            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.returnValue(null);

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService();

            expect(function() {

              configurationService.add({
                rules: [
                  {
                    select: {
                      module: "../A"
                    },
                    apply: {
                      testId: "A"
                    }
                  }
                ]
              });
            }).toThrow(errorMatch.operInvalid());
          });
        });

        describe("AMD mapping", function() {

          it("should return config if rule applies to exactly mapped contextual module", function() {

            localRequire.config({
              map: {
                "test/B": {
                  "A": "test/D"
                }
              }
            });
            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.returnValue(null);

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService();

            configurationService.add({
              contextId: "test/B",
              rules: [
                {
                  select: {
                    module: "A" // is mapped to test/D
                  },
                  apply: {
                    testId: "D"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/D").then(function(result) {
              expect(result).not.toBe(null);
              expect(result.testId).toEqual("D");
            });
          });

          it("should return config if rule applies to ancestor mapped contextual module", function() {

            localRequire.config({
              map: {
                "test": {
                  "A": "test/D"
                }
              }
            });

            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.returnValue(null);

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService();

            configurationService.add({
              contextId: "test/B",
              rules: [
                {
                  select: {
                    module: "A" // is mapped to test/D
                  },
                  apply: {
                    testId: "D"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/D").then(function(result) {
              expect(result).not.toBe(null);
              expect(result.testId).toEqual("D");
            });
          });

          it("should return config if rule applies to ancestor mapped module", function() {

            localRequire.config({
              map: {
                "test/B": {
                  "A": "test"
                }
              }
            });

            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.returnValue(null);

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService();

            configurationService.add({
              contextId: "test/B",
              rules: [
                {
                  select: {
                    module: "A/D" // is mapped to test/D
                  },
                  apply: {
                    testId: "D"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/D").then(function(result) {
              expect(result).not.toBe(null);
              expect(result.testId).toEqual("D");
            });
          });
        });

        describe("module alias mapping", function() {
          it("should return config if rule applies to a module's alias", function() {

            // localRequire.config({
            //   config: {
            //     "pentaho/modules": {
            //       "test/D": {
            //         alias: "A"
            //       }
            //     }
            //   }
            // });

            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.callFake(function(idOrAlias) {
              if(idOrAlias === "A") {
                return "test/D";
              }

              return idOrAlias;
            });

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService();

            configurationService.add({
              rules: [
                {
                  select: {
                    module: "A" // is mapped to test/D
                  },
                  apply: {
                    testId: "D"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/D").then(function(result) {
              expect(result).not.toBe(null);
              expect(result.testId).toEqual("D");
            });
          });
        });
      });

      describe("select.application resolution", function() {

        describe("relative mapping", function() {

          it("should return config if rule applies to application", function() {

            var configurationService;

            core = createCoreMock();
            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService({
              application: "test/App"
            });

            configurationService.add({
              contextId: "test/B",
              rules: [
                {
                  select: {
                    module: "test/A",
                    application: "./App"
                  },
                  apply: {
                    testId: "A"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/A").then(function(result) {
              expect(result).not.toBe(null);
              expect(result.testId).toEqual("A");
            });
          });

          it("should throw if module id is relative and contextId is not specified", function() {

            var configurationService;

            core = createCoreMock();
            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService({
              application: "test/App"
            });

            expect(function() {

              configurationService.add({
                rules: [
                  {
                    select: {
                      module: "test/A",
                      application: "../App"
                    },
                    apply: {
                      testId: "A"
                    }
                  }
                ]
              });
            }).toThrow(errorMatch.operInvalid());
          });
        });

        describe("AMD mapping", function() {

          it("should return config if rule applies to exactly mapped contextual module", function() {

            localRequire.config({
              map: {
                "test/B": {
                  "App": "test/App"
                }
              }
            });
            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.returnValue(null);

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService({
              application: "test/App"
            });

            configurationService.add({
              contextId: "test/B",
              rules: [
                {
                  select: {
                    module: "test/A",
                    application: "App" // is mapped to test/App
                  },
                  apply: {
                    testId: "D"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/A").then(function(result) {
              expect(result).not.toBe(null);
              expect(result.testId).toEqual("D");
            });
          });
        });

        describe("module alias mapping", function() {

          it("should return config if rule applies to a module's alias", function() {

            // localRequire.config({
            //   config: {
            //     "pentaho/modules": {
            //       "test/App": {
            //         alias: "App"
            //       }
            //     }
            //   }
            // });

            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.callFake(function(idOrAlias) {
              if(idOrAlias === "App") {
                return "test/App";
              }

              return idOrAlias;
            });

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService({
              application: "test/App"
            });

            configurationService.add({
              rules: [
                {
                  select: {
                    module: "test/A",
                    application: "App" // is mapped to test/App
                  },
                  apply: {
                    testId: "D"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/A").then(function(result) {
              expect(result).not.toBe(null);
              expect(result.testId).toEqual("D");
            });
          });
        });
      });

      describe("select.annotation resolution", function() {

        describe("relative mapping", function() {

          it("should return resolved config", function() {

            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.returnValue(null);

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService();

            configurationService.add({
              contextId: "test/B",
              rules: [
                {
                  select: {
                    module: "test/A",
                    annotation: "./Info"
                  },
                  apply: {
                    testId: "A"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/A", "test/InfoAnnotation").then(function(result) {
              expect(result).not.toBe(null);
              expect(result).toEqual({
                testId: "A"
              });
            });
          });

          it("should throw if annotation id is relative and contextId is not specified", function() {

            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.returnValue(null);

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService({
              application: "test/App"
            });

            expect(function() {

              configurationService.add({
                rules: [
                  {
                    select: {
                      module: "test/A",
                      annotation: "../Info"
                    },
                    apply: {
                      testId: "A"
                    }
                  }
                ]
              });
            }).toThrow(errorMatch.operInvalid());
          });
        });

        describe("AMD mapping", function() {

          it("should return config if rule applies to exactly mapped contextual module", function() {

            localRequire.config({
              map: {
                "test/B": {
                  "InfoAnnotation": "test/InfoAnnotation"
                }
              }
            });
            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.returnValue(null);

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService();

            configurationService.add({
              contextId: "test/B",
              rules: [
                {
                  select: {
                    module: "test/A",
                    annotation: "Info" // is mapped to test/InfoAnnotation
                  },
                  apply: {
                    testId: "D"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/A", "test/InfoAnnotation").then(function(result) {
              expect(result).not.toBe(null);
              expect(result).toEqual({
                testId: "D"
              });
            });
          });
        });

        describe("module alias mapping", function() {

          it("should return config if rule applies to an annotation's alias", function() {

            // localRequire.config({
            //   config: {
            //     "pentaho/modules": {
            //       "test/InfoAnnotation": {
            //         alias: "Info"
            //       }
            //     }
            //   }
            // });

            var configurationService;

            core = createCoreMock();
            core.moduleMetaService.getId.and.callFake(function(idOrAlias) {
              if(idOrAlias === "Info") {
                return "test/InfoAnnotation";
              }

              return idOrAlias;
            });

            ConfigurationService = configServiceFactory(core);

            configurationService = new ConfigurationService();

            configurationService.add({
              rules: [
                {
                  select: {
                    module: "test/A",
                    annotation: "Info" // is mapped to test/InfoAnnotation
                  },
                  apply: {
                    testId: "D"
                  }
                }
              ]
            });

            return configurationService.selectAsync("test/A", "test/InfoAnnotation").then(function(result) {
              expect(result).not.toBe(null);
              expect(result).toEqual({
                testId: "D"
              });
            });
          });
        });
      });

      describe("filtering", function() {

        var ruleSet =  {
          rules: [
            {
              select: {
                module: "A",
                user: "1"
              },
              apply: {
                testId: "A1"
              }
            },
            {
              select: {
                module: "A",
                user: "2"
              },
              apply: {
                testId: "A2"
              }
            },
            {
              select: {
                module: "A",
                user: ["3", "4"]
              },
              apply: {
                testId: "A3"
              }
            },
            {
              select: {
                module: "A",
                user: ["4", "5"],
                theme: "white"
              },
              apply: {
                testId: "A4"
              }
            },
            {
              select: {
                module: "B"
              },
              apply: {
                testId: "B"
              }
            }
          ]
        };

        beforeEach(function() {
          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);
        });

        it("should return null if no select rule applies to criteria", function() {
          var configurationService = new ConfigurationService({user: "-1", theme: "white"});
          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function(result) {
            expect(result).toBeNull();
          });
        });

        it("should return config if single-value select rule applies to criteria", function() {
          var configurationService = new ConfigurationService({user: "2", theme: "white"});
          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function(result) {
            expect(result).not.toBeNull();
          });
        });

        it("should return config if multi-value select rule applies to criteria", function() {
          var configurationService = new ConfigurationService({user: "3", theme: "white"});
          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function(result) {
            expect(result).not.toBeNull();
          });
        });
      });

      describe("inheriting", function() {
        // type modules:
        //  - T1 > T2 > T3
        //  - T4
        //
        // instance modules:
        // - I1, of type T4
        //
        // modules with no own configuration:
        // - T2
        //
        // annotated modules:
        //

        var ruleSet =  {
          rules: [
            {
              select: {
                module: "T1"
              },
              apply: {
                propCommon: "T1",
                propT1: "T1"
              }
            },
            {
              select: {
                module: "T3"
              },
              apply: {
                propCommon: "T3",
                propT3: "T3"
              }
            },
            {
              select: {
                module: "T4"
              },
              apply: {
                propCommon: "T4",
                propT4: "T4"
              }
            },
            {
              select: {
                module: "I1"
              },
              apply: {
                propCommon: "I1",
                propI1: "I1"
              }
            }
          ]
        };

        var annotationsRuleSet =  {
          rules: [
            // A1 annotation applied to:
            // - T1, T3 (and T1 > T2 > T3)
            // - T4
            // - I1
            // A2 annotation applied to:
            // - T2 (and T1 > T2 > T3)
            {
              select: {
                module: "T1",
                annotation: "A1"
              },
              apply: {
                annotPropCommon: "A1@T1",
                annotPropT1A1: true
              }
            },
            {
              select: {
                module: "T2",
                annotation: "A2"
              },
              apply: {
                annotPropCommon: "A2@T2",
                annotPropT2A2: true
              }
            },
            {
              select: {
                module: "T3",
                annotation: "A1"
              },
              apply: {
                annotPropCommon: "A1@T3",
                annotPropT3A1: true
              }
            },
            {
              select: {
                module: "T4",
                annotation: "A1"
              },
              apply: {
                annotPropCommon: "A1@T4",
                annotPropT4A1: true
              }
            },
            {
              select: {
                module: "I1",
                annotation: "A1"
              },
              apply: {
                annotPropCommon: "A1@I1",
                annotPropI1A1: true
              }
            }
          ]
        };

        // Type Modules
        var moduleT1 = {id: "T1", kind: "type", ancestor: null};
        var moduleT2 = {id: "B", kind: "type", ancestor: moduleT1};
        var moduleT3 = {id: "T3", kind: "type", ancestor: moduleT2};
        var moduleT4 = {id: "T4", kind: "type", ancestor: null};

        // Instance Modules
        var moduleI1 = {id: "I1", kind: "instance", type: moduleT4};

        // No need to define Annotation Modules

        var modules = {
          "T1": moduleT1,
          "T2": moduleT2,
          "T3": moduleT3,
          "T4": moduleT4,
          "I1": moduleI1
        };

        var configurationService;

        beforeEach(function() {
          core = createCoreMock();

          core.moduleMetaService.get.and.callFake(function(id) {
            return modules[id] || null;
          });

          ConfigurationService = configServiceFactory(core);

          configurationService = new ConfigurationService();
          configurationService.add(ruleSet);
          configurationService.add(annotationsRuleSet);
        });

        describe("module resolution", function() {

          describe("when keyArgs.inherit: true", function() {

            it("should return the local configuration of a root type module, having descendants", function() {

              return configurationService.selectAsync("T1", null, {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  propCommon: "T1",
                  propT1: "T1"
                });
              });
            });

            it("should return the local configuration of a root type module, having no descendants", function() {

              return configurationService.selectAsync("T4", null, {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  propCommon: "T4",
                  propT4: "T4"
                });
              });
            });

            it("should return the local configuration of an instance module, ignoring that of its type module", function() {

              return configurationService.selectAsync("I1", null, {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  propCommon: "I1",
                  propI1: "I1"
                });
              });
            });

            it("should inherit the configuration of a type module's ancestors, even if it has no own/local configuration", function() {

              return configurationService.selectAsync("T2", null, {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  propCommon: "T1",
                  propT1: "T1"
                });
              });
            });

            it("should inherit and merge the configuration of a type module and that of its ancestors", function() {

              return configurationService.selectAsync("T3", null, {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  propCommon: "T3",
                  propT1: "T1",
                  // propT2: "T2" // T2 has no own config
                  propT3: "T3"
                });
              });
            });
          });

          describe("when keyArgs.inherit: false", function() {
            it("should return the configuration of a type module, ignoring that of its ancestors", function() {

              return configurationService.selectAsync("T3", null, {inherit: false}).then(function(result) {
                expect(result).toEqual({
                  propCommon: "T3",
                  propT3: "T3"
                });
              });
            });
          });

          describe("when keyArgs.inherit: unspecified (default value)", function() {
            it("should return the configuration of a type module, ignoring that of its ancestors", function() {

              return configurationService.selectAsync("T3").then(function(result) {
                expect(result).toEqual({
                  propCommon: "T3",
                  propT3: "T3"
                });
              });
            });
          });
        });

        describe("module and annotation resolution", function() {

          describe("when keyArgs.inherit: true", function() {

            it("should return the local configuration of a root type module annotation, having descendants", function() {

              return configurationService.selectAsync("T1", "A1", {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  annotPropCommon: "A1@T1",
                  annotPropT1A1: true
                });
              });
            });

            it("should return the local configuration of a root type module annotation, having no descendants", function() {

              return configurationService.selectAsync("T4", "A1", {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  annotPropCommon: "A1@T4",
                  annotPropT4A1: true
                });
              });
            });

            it("should return the local configuration of an instance module annotation, ignoring that of its type module", function() {

              return configurationService.selectAsync("I1", "A1", {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  annotPropCommon: "A1@I1",
                  annotPropI1A1: true
                });
              });
            });

            it("should return the local configuration of a type module annotation, when its ascendants have no configuration", function() {

              return configurationService.selectAsync("T2", "A2", {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  annotPropCommon: "A2@T2",
                  annotPropT2A2: true
                });
              });
            });

            it("should inherit the annotation configuration of a type module's ancestors, " +
               "even if it has no own/local annotation configuration", function() {

              return configurationService.selectAsync("T2", "A1", {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  annotPropCommon: "A1@T1",
                  annotPropT1A1: true
                });
              });
            });

            it("should inherit and merge the configuration of a type module annotation and that of its ancestors", function() {

              return configurationService.selectAsync("T3", "A1", {inherit: true}).then(function(result) {
                expect(result).toEqual({
                  annotPropCommon: "A1@T3",
                  annotPropT1A1: true,
                  // annotPropT2A1: true, // T2 has no own annotation config
                  annotPropT3A1: true
                });
              });
            });
          });

          describe("when keyArgs.inherit: false", function() {

            it("should return the configuration of a type module annotation, ignoring that of its ancestors", function() {

              return configurationService.selectAsync("T3", "A1", {inherit: false}).then(function(result) {
                expect(result).toEqual({
                  annotPropCommon: "A1@T3",
                  annotPropT3A1: true
                });
              });
            });
          });

          describe("when keyArgs.inherit: unspecified (default value)", function() {
            it("should return the configuration of a type module annotation, ignoring that of its ancestors", function() {

              return configurationService.selectAsync("T3", "A1").then(function(result) {
                expect(result).toEqual({
                  annotPropCommon: "A1@T3",
                  annotPropT3A1: true
                });
              });
            });
          });
        });
      });

      describe("dependencies and factories", function() {

        it("should resolve all dependencies", function() {

          var moduleBFactory = jasmine.createSpy("moduleB");
          var moduleCFactory = jasmine.createSpy("moduleC");

          localRequire.define("test/config/B", moduleBFactory);
          localRequire.define("test/config/C", moduleCFactory);

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                deps: ["test/config/B", "test/config/C"],
                apply: {}
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function() {

            expect(moduleBFactory).toHaveBeenCalled();
            expect(moduleCFactory).toHaveBeenCalled();
          });
        });

        it("should resolve all dependencies relative to contextId", function() {

          var moduleBFactory = jasmine.createSpy("moduleB");
          var moduleCFactory = jasmine.createSpy("moduleC");

          localRequire.define("test/config/B", moduleBFactory);
          localRequire.define("test/config/C", moduleCFactory);

          var ruleSet = {
            contextId: "test/config/D",
            rules: [
              {
                select: {module: "A"},
                deps: ["./B", "./C"],
                apply: {}
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function() {

            expect(moduleBFactory).toHaveBeenCalled();
            expect(moduleCFactory).toHaveBeenCalled();
          });
        });

        it("should resolve all dependencies with the AMD map configuration", function() {

          var moduleBFactory = jasmine.createSpy("moduleB");
          var moduleCFactory = jasmine.createSpy("moduleC");

          localRequire.define("test/configB", moduleBFactory);
          localRequire.define("test/configC", moduleCFactory);
          localRequire.config({
            map: {
              "test/config/D": {
                "B": "test/configB",
                "C": "test/configC"
              }
            }
          });

          var ruleSet = {
            contextId: "test/config/D",
            rules: [
              {
                select: {module: "A"},
                deps: ["B", "C"],
                apply: {}
              }
            ]
          };

          core = createCoreMock();
          core.moduleMetaService.getId.and.returnValue(null);
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function() {

            expect(moduleBFactory).toHaveBeenCalled();
            expect(moduleCFactory).toHaveBeenCalled();
          });
        });

        it("should resolve all dependencies with the module aliases", function() {

          var moduleBFactory = jasmine.createSpy("moduleB");
          var moduleCFactory = jasmine.createSpy("moduleC");

          localRequire.define("test/configB", moduleBFactory);
          localRequire.define("test/configC", moduleCFactory);

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                deps: ["B", "C"],
                apply: {}
              }
            ]
          };

          core = createCoreMock();
          core.moduleMetaService.getId.and.callFake(function(idOrAlias) {
            if(idOrAlias === "B") {
              return "test/configB";
            }
            if(idOrAlias === "C") {
              return "test/configC";
            }

            return idOrAlias;
          });

          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function() {

            expect(moduleBFactory).toHaveBeenCalled();
            expect(moduleCFactory).toHaveBeenCalled();
          });
        });

        it("should throw if there are relative dependencies and contextId is not specified", function() {

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                deps: ["../B", "../C"],
                apply: {}
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          expect(function() {
            configurationService.add(ruleSet);
          }).toThrow(errorMatch.operInvalid());
        });

        it("should resolve all dependencies and pass their values to the function factory", function() {

          var moduleB = {};
          var moduleC = {};

          var moduleBFactory = jasmine.createSpy("moduleB").and.returnValue(moduleB);
          var moduleCFactory = jasmine.createSpy("moduleC").and.returnValue(moduleC);

          localRequire.define("test/config/B", moduleBFactory);
          localRequire.define("test/config/C", moduleCFactory);

          var ruleConfigFactory = jasmine.createSpy("ruleConfigFactory").and.returnValue({});

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                deps: ["test/config/B", "test/config/C"],
                apply: ruleConfigFactory
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function() {

            expect(ruleConfigFactory).toHaveBeenCalledTimes(1);
            expect(ruleConfigFactory).toHaveBeenCalledWith(moduleB, moduleC);
          });
        });

        it("should resolve all dependencies and pass their values to the function factory, " +
          "even when there are multiple functional rules", function() {

          var moduleB = {};
          var moduleC = {};

          var moduleBFactory = jasmine.createSpy("moduleB").and.returnValue(moduleB);
          var moduleCFactory = jasmine.createSpy("moduleC").and.returnValue(moduleC);

          localRequire.define("test/config/B", moduleBFactory);
          localRequire.define("test/config/C", moduleCFactory);

          var ruleConfigFactory1 = jasmine.createSpy("ruleConfigFactory").and.returnValue({});
          var ruleConfigFactory2 = jasmine.createSpy("ruleConfigFactory").and.returnValue({});

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                deps: ["test/config/B", "test/config/C"],
                apply: ruleConfigFactory1
              },
              {
                select: {module: "A"},
                deps: ["test/config/C", "test/config/B"],
                apply: ruleConfigFactory2
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function() {

            expect(ruleConfigFactory1).toHaveBeenCalledTimes(1);
            expect(ruleConfigFactory1).toHaveBeenCalledWith(moduleB, moduleC);

            expect(ruleConfigFactory2).toHaveBeenCalledTimes(1);
            expect(ruleConfigFactory2).toHaveBeenCalledWith(moduleC, moduleB);
          });
        });

        it("should accept a function factory even when there are no dependencies", function() {

          var ruleConfigFactory = jasmine.createSpy("ruleConfigFactory").and.returnValue({});

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                apply: ruleConfigFactory
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function() {

            expect(ruleConfigFactory).toHaveBeenCalledTimes(1);
            expect(ruleConfigFactory).toHaveBeenCalledWith();
          });
        });

        it("should use the configuration returned by a function factory", function() {

          var ruleConfigFactory = jasmine.createSpy("ruleConfigFactory").and.returnValue({
            testConfig: "1"
          });

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                apply: ruleConfigFactory
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function(result) {

            expect(result).toEqual(jasmine.objectContaining({
              testConfig: "1"
            }));
          });
        });

        it("should ignore a null configuration returned by a function factory", function() {

          var ruleConfigFactory = jasmine.createSpy("ruleConfigFactory").and.returnValue(null);

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                apply: ruleConfigFactory
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function(result) {
            expect(result).toEqual({});
          });
        });

        it("should ignore an undefined configuration returned by a function factory", function() {

          var ruleConfigFactory = jasmine.createSpy("ruleConfigFactory").and.returnValue(undefined);

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                apply: ruleConfigFactory
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function(result) {
            expect(result).toEqual({});
          });
        });

        it("should accept mixed functional and object rules", function() {

          var ruleConfigFactory2 = jasmine.createSpy("ruleConfigFactory").and.returnValue({
            testConfig2: "2"
          });

          var ruleSet = {
            rules: [
              {
                select: {module: "A"},
                apply: {
                  testConfig1: "1"
                }
              },
              {
                select: {module: "A"},
                apply: ruleConfigFactory2
              }
            ]
          };

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          var configurationService = new ConfigurationService({});

          configurationService.add(ruleSet);

          return configurationService.selectAsync("A").then(function(result) {

            expect(result).toEqual(jasmine.objectContaining({
              testConfig1: "1",
              testConfig2: "2"
            }));
          });
        });
      });

      describe("external configuration", function() {

        var configurationService;

        beforeEach(function() {

          core = createCoreMock();
          ConfigurationService = configServiceFactory(core);

          configurationService = new ConfigurationService(null, selectExternalConfigsAsync);

          configurationService.add({
            rules: [
              {
                priority: -Infinity,
                select: {
                  module: "A"
                },
                apply: {
                  testId: "A"
                }
              },
              {
                priority: -Infinity,
                select: {
                  module: "test/DefaultExternalPriority"
                },
                apply: {
                  testId: "Internal"
                }
              },
              {
                priority: -Infinity,
                select: {
                  module: "test/GreaterExternalPriority"
                },
                apply: {
                  testId: "Internal"
                }
              }
            ]
          });

          function selectExternalConfigsAsync(moduleId) {
            if(moduleId === "C") {
              return Promise.resolve([
                {
                  priority: -Infinity,
                  config: {
                    testId: "C"
                  }
                }
              ]);
            }

            if(moduleId === "A") {
              return Promise.resolve([
                {
                  priority: -Infinity,
                  config: {
                    testId: "A"
                  }
                }
              ]);
            }

            if(moduleId === "test/DefaultExternalPriority") {
              return Promise.resolve([
                {
                  config: {
                    testId: "External"
                  }
                }
              ]);
            }

            if(moduleId === "test/GreaterExternalPriority") {
              return Promise.resolve([
                {
                  priority: 1,
                  config: {
                    testId: "External"
                  }
                }
              ]);
            }

            if(moduleId === "test/OnlyExternalConfig") {
              return Promise.resolve([
                {
                  config: {
                    testId: "External"
                  }
                }
              ]);
            }

            return Promise.resolve(null);
          }
        });

        it("should include the external configuration by default", function() {

          return configurationService.selectAsync("C").then(function(result) {
            expect(result.testId).toEqual("C");
          });
        });

        it("should give less priority by default to the external configuration", function() {

          return configurationService.selectAsync("test/DefaultExternalPriority").then(function(result) {
            expect(result.testId).toEqual("Internal");
          });
        });

        it("should have greater priority than internal configuration if priority = 1", function() {

          return configurationService.selectAsync("test/GreaterExternalPriority").then(function(result) {
            expect(result.testId).toEqual("External");
          });
        });

        it("should get the external configuration when there is no internal configuration", function() {

          return configurationService.selectAsync("test/OnlyExternalConfig").then(function(result) {
            expect(result.testId).toEqual("External");
          });
        });
      });
    });

    // TODO: All/Part of these tests should be moved to pentaho/util/spec.
    describe("merging", function() {

      var configurationService;
      var baseRule;

      beforeEach(function() {
        baseRule = {
          select: {
            module: "test/type"
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

        core = createCoreMock();
        ConfigurationService = configServiceFactory(core);

        configurationService = new ConfigurationService();

        configurationService.add({rules: [baseRule]});
      });

      describe("default merge handlers", function() {
        var otherRule;

        var config;

        beforeEach(function() {
          otherRule = {
            select: {
              module: "test/type"
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

          configurationService.add({rules: [otherRule]});

          return configurationService.selectAsync("test/type").then(function(result) {
            config = result;
          });
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

        beforeEach(function() {
          otherRule = {
            select: {
              module: "test/type"
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

          configurationService.add({rules: [otherRule]});

          return configurationService.selectAsync("test/type").then(function(result) {
            config = result;
          });
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

        beforeEach(function() {
          otherRule = {
            select: {
              module: "test/type"
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

          configurationService.add({rules: [otherRule]});

          return configurationService.selectAsync("test/type").then(function(result) {
            config = result;
          });
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

        beforeEach(function() {
          otherRule = {
            select: {
              module: "test/type"
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

          configurationService.add({rules: [otherRule]});

          return configurationService.selectAsync("test/type").then(function(result) {
            config = result;
          });
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

        beforeEach(function() {
          otherRule = {
            select: {
              module: "test/type"
            },
            apply: {
              simpleValue: {
                "$op": "INVALID",
                value: "ALT_S1"
              }
            }
          };

          configurationService.add({rules: [otherRule]});
        });

        it("should throw when merge operation is invalid", function() {
          return configurationService.selectAsync("test/type")
            .then(function() {
              throw new Error("Expected to be rejected");
            }, function(error) {
              expect(error).toEqual(errorMatch.operInvalid());
            });
        });
      });

      describe("handling inconsistent types", function() {
        describe("default merge handlers", function() {
          describe("with simple", function() {
            var otherRule;

            var config;

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
                },
                apply: {
                  arraySimpleValue: "ALT_AS1",
                  complexValue: "ALT_C1",
                  arrayComplexValue: "ALT_AC1"
                }
              };

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
                },
                apply: {
                  simpleValue: ["ALT_S1"],
                  complexValue: ["ALT_C1"],
                  arrayComplexValue: ["ALT_AC1"]
                }
              };

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
                },
                apply: {
                  simpleValue: {id: "ALT_S1"},
                  arraySimpleValue: {id: "ALT_AS1"},
                  arrayComplexValue: {id: "ALT_AC1"}
                }
              };

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
                },
                apply: {
                  simpleValue: [{id: "ALT_S1"}],
                  arraySimpleValue: [{id: "ALT_AS1"}],
                  complexValue: [{id: "ALT_C1"}]
                }
              };

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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

            beforeEach(function() {
              otherRule = {
                select: {
                  module: "test/type"
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

              configurationService.add({rules: [otherRule]});

              return configurationService.selectAsync("test/type").then(function(result) {
                config = result;
              });
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
