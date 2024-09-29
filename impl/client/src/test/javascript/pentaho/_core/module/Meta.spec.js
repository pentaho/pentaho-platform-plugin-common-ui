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

  describe("pentaho._core.module.Meta", function() {

    var id = "test/foo/bar";
    var id2 = "test/foo/dudu";

    var localRequire;
    var DebugLevels;
    var Promise;
    var moduleUtil;

    beforeEach(function() {
      localRequire = require.new();

      localRequire
        .define("pentaho/debug", function() { return createDebugMgrMock(); })
        .define("pentaho/util/logger", function() { return createLoggerMock(); });

      return localRequire.promise([
        "pentaho/debug/Levels",
        "pentaho/shim/es6-promise",
        "pentaho/module/util"
      ])
      .then(function(deps) {
        DebugLevels = deps[0];
        Promise = deps[1];
        moduleUtil = deps[2];
      });
    });

    afterEach(function() {
      localRequire.dispose();
    });

    function createCoreMock() {

      var core = {
        configService: jasmine.createSpyObj("configService", [
          "selectAsync",
          "getAnnotationsIds",
          "addRule",
          "hasAnnotation"
        ]),
        moduleMetaService: jasmine.createSpyObj("moduleMetaService", [
          "get"
        ])
      };

      core.configService.selectAsync.and.returnValue(Promise.resolve(null));
      core.configService.getAnnotationsIds.and.returnValue(null);
      core.configService.hasAnnotation.and.returnValue(false);

      core.moduleMetaService.get.and.returnValue(null);

      return core;
    }

    function createDebugMgrMock() {

      return {
        __level: 0,

        testLevel: function(level) {
          return this.__level >= level;
        }
      };
    }

    function createLoggerMock() {
      return jasmine.createSpyObj("logger", ["info", "error"]);
    }

    describe("new Meta(id, spec)", function() {

      var Meta;
      var core;

      beforeEach(function() {
        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            core = createCoreMock();
            Meta = metaFactory(core);
          });
      });

      describe("#id", function() {
        it("should respect the specified `id` value", function() {
          var spec = {};
          var meta = new Meta(id, spec);

          expect(meta.id).toBe(id);
        });
      });

      describe("#__index", function() {
        it("should respect the specified `spec.index` value", function() {
          var spec = {index: 2};
          var meta = new Meta(id, spec);

          expect(meta.__index).toBe(spec.index);
        });

        it("should default `spec.index` to 0", function() {
          var spec = {};
          var meta = new Meta(id, spec);

          expect(meta.__index).toBe(0);
        });
      });

      describe("#alias", function() {

        it("should respect the specified `spec.alias` value", function() {
          var spec = {alias: "dudu"};
          var meta = new Meta(id, spec);

          expect(meta.alias).toBe(spec.alias);
        });

        it("should convert the specified `spec.alias` value to string", function() {
          var alias = "dudu";
          var spec = {alias: {toString: function() { return alias; }}};
          var meta = new Meta(id, spec);

          expect(meta.alias).toBe(alias);
        });

        it("should default `spec.alias` value to null", function() {
          var spec = {};
          var meta = new Meta(id, spec);

          expect(meta.alias).toBe(null);
        });

        it("should ignore the specified `spec.alias` value if equal to the id", function() {
          var spec = {alias: id};
          var meta = new Meta(id, spec);

          expect(meta.alias).toBe(null);
        });
      });

      describe("#ranking", function() {

        it("should respect the specified `spec.ranking` value", function() {
          var spec = {ranking: 2};
          var meta = new Meta(id, spec);

          expect(meta.ranking).toBe(spec.ranking);
        });

        it("should convert the specified `spec.ranking` value to number", function() {
          var spec = {ranking: "2"};
          var meta = new Meta(id, spec);

          expect(meta.ranking).toBe(2);
        });

        it("should default `spec.ranking` value to 0", function() {
          var spec = {};
          var meta = new Meta(id, spec);

          expect(meta.ranking).toBe(0);
        });
      });

      describe("#config and #isPrepared", function() {

        it("should have #config default to `null`", function() {
          var spec = {};
          var meta = new Meta(id, spec);

          expect(meta.config).toBe(null);
        });

        it("should have #isPrepared be `false`", function() {
          var spec = {};
          var meta = new Meta(id, spec);

          expect(meta.isPrepared).toBe(false);
        });
      });

      describe("#value and #isLoaded", function() {

        it("should default #value to `undefined` and #isLoaded to false", function() {
          var spec = {};
          var meta = new Meta(id, spec);

          expect(meta.value).toBe(undefined);
          expect(meta.isLoaded).toBe(false);
        });

        it("should not immediately expose a specified #value", function() {
          var value = {};
          var spec = {value: value};
          var meta = new Meta(id, spec);

          expect(meta.value).toBe(undefined);
          expect(meta.isLoaded).toBe(false);
        });

        it("should register a corresponding AMD module whose value is the specified value", function(done) {

          var value = {};
          var spec = {value: value};
          var meta = new Meta(id, spec);

          // Do not call localRequire immediately,
          // to not shadow the behavior that the code is expected to have.
          setTimeout(function() {
            localRequire([id], function(result) {
              expect(result).toBe(value);
              done();
            }, done.fail);
          }, 0);
        });

        it("should call a value factory function with the module as argument", function(done) {

          var value = {};
          var valueFun = jasmine.createSpy("factoryValue").and.returnValue(value);
          var spec = {value: valueFun};
          var meta = new Meta(id, spec);

          // Do not call localRequire immediately,
          // to not shadow the behavior that the code is expected to have.
          setTimeout(function() {
            localRequire([id], function(result) {

              expect(result).toBe(value);

              expect(valueFun).toHaveBeenCalledTimes(1);
              expect(valueFun).toHaveBeenCalledWith(jasmine.objectContaining({id: meta.id}));

              done();
            }, done.fail);
          }, 0);
        });
      });

      describe("spec.annotations", function() {

        it("should register one rule per annotation", function() {
          var spec = {
            annotations: {
              "FooAnnotation": {foo: "a"},
              "BarAnnotation": {bar: "b"}
            }
          };

          var meta = new Meta(id, spec);

          expect(core.configService.addRule).toHaveBeenCalledTimes(2);
          expect(core.configService.addRule.calls.argsFor(0)).toEqual([{
            priority: -Infinity,
            select: {
              module: id,
              annotation: "FooAnnotation"
            },
            apply: {foo: "a"}
          }]);
          expect(core.configService.addRule.calls.argsFor(1)).toEqual([{
            priority: -Infinity,
            select: {
              module: id,
              annotation: "BarAnnotation"
            },
            apply: {bar: "b"}
          }]);
        });
      });
    });

    describe("#loadAsync()", function() {

      var moduleValue;
      var moduleFactory;
      var Meta;

      beforeEach(function() {
        moduleValue = {};
        moduleFactory = jasmine.createSpy().and.returnValue(moduleValue);

        localRequire.define(id, moduleFactory);

        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(createCoreMock());
          });
      });

      it("should return a promise", function() {

        var spec = {};
        var meta = new Meta(id, spec);

        var result = meta.loadAsync();
        expect(result instanceof Promise).toBe(true);

        // Wait for load to finish.
        return result.then(function() {}, function() {});
      });

      it("should load the module having the same id", function() {

        var spec = {};
        var meta = new Meta(id, spec);

        return meta.loadAsync()
          .then(function() {
            expect(moduleFactory).toHaveBeenCalled();
          });
      });

      it("should return a promise that resolves to the module value", function() {

        var spec = {};
        var meta = new Meta(id, spec);

        return meta.loadAsync()
          .then(function(result) {
            expect(result).toBe(moduleValue);
          });
      });

      it("should make the module's value available through #value", function() {

        var spec = {};
        var meta = new Meta(id, spec);

        return meta.loadAsync()
          .then(function() {
            expect(meta.value).toBe(moduleValue);
          });
      });

      it("should have #isPrepared return true", function() {

        var spec = {};
        var meta = new Meta(id, spec);

        return meta.loadAsync()
          .then(function() {
            expect(meta.isPrepared).toBe(true);
          });
      });

      it("should have #isLoaded return true", function() {

        var spec = {};
        var meta = new Meta(id, spec);

        return meta.loadAsync()
          .then(function() {
            expect(meta.isLoaded).toBe(true);
          });
      });

      it("should reject the promise if the module id is not defined as an AMD module " +
        "(and spec.value is not specified)", function() {

        var spec = {};
        var meta = new Meta("test/missing", spec);

        return meta.loadAsync()
          .then(function() {
            return Promise.reject(new Error("Expected a rejected promise."));
          }, function(ex) {
            expect(ex).toEqual(jasmine.any(Error));
            expect(meta.isLoaded).toBe(false);
            expect(meta.isRejected).toBe(true);
          });
      });

      it("should throw when value is got and loading failed", function() {

        var spec = {};
        var meta = new Meta("test/missing", spec);

        return meta.loadAsync()
          .then(function() {
            return Promise.reject(new Error("Expected a rejected promise."));
          }, function(ex) {
            expect(function() {
              var value = meta.value;
            }).toThrow(ex);
          });
      });

      it("should allow being called again", function() {

        var spec = {};
        var meta = new Meta(id, spec);

        return meta.loadAsync()
          .then(function(result) {
            return meta.loadAsync();
          })
          .then(function(result) {
            expect(result).toBe(moduleValue);
          });
      });

      it("should allow being called in parallel", function() {

        var spec = {};
        var meta = new Meta(id, spec);

        return Promise.all([meta.loadAsync(), meta.loadAsync()])
          .then(function(results) {
            expect(results[0]).toBe(moduleValue);
            expect(results[1]).toBe(moduleValue);
          });
      });

      it("should log an info message when the module loads successfully and the log level is info", function() {

        return localRequire.promise([
          "pentaho/util/logger",
          "pentaho/debug"
        ]).then(function(deps) {

          var logger = deps[0];
          var debugMgr = deps[1];

          var spec = {};
          var meta = new Meta(id, spec);

          debugMgr.__level = DebugLevels.info;

          return meta.loadAsync()
            .then(function() {
              expect(logger.info).toHaveBeenCalledTimes(1);
              expect(logger.info.calls.argsFor(0)[0]).toContain(id);
            });
        });
      });

      it("should not log an info message when the module loads successfully and the log level is none", function() {

        return localRequire.promise([
          "pentaho/util/logger"
        ]).then(function(deps) {

          var logger = deps[0];

          var spec = {};
          var meta = new Meta(id, spec);

          return meta.loadAsync()
            .then(function() {

              expect(logger.info).not.toHaveBeenCalled();
            });
        });
      });

      it("should log an error message when the module fails to load and the log level is error", function() {

        return localRequire.promise([
          "pentaho/util/logger",
          "pentaho/debug"
        ]).then(function(deps) {

          var logger = deps[0];
          var debugMgr = deps[1];

          var spec = {};
          var meta = new Meta("test/missing", spec);

          debugMgr.__level = DebugLevels.error;

          return meta.loadAsync()
            // eslint-disable-next-line dot-notation,no-unexpected-multiline
            ["catch"](function() {
              expect(logger.error).toHaveBeenCalledTimes(1);
              expect(logger.error.calls.argsFor(0)[0]).toContain("test/missing");
            });
        });
      });

      it("should not log an error message when the module fails to load and the log level is none", function() {

        return localRequire.promise([
          "pentaho/util/logger"
        ]).then(function(deps) {

          var logger = deps[0];

          var spec = {};
          var meta = new Meta("test/missing", spec);

          return meta.loadAsync()
            // eslint-disable-next-line dot-notation,no-unexpected-multiline
            ["catch"](function() {
              expect(logger.error).not.toHaveBeenCalled();
            });
        });
      });
    });

    describe("#prepareAsync()", function() {

      var Annotation;
      var core;
      var meta;

      beforeEach(function() {
        core = createCoreMock();

        return localRequire.promise(["pentaho/_core/module/Meta", "pentaho/module/Annotation"])
          .then(function(deps) {
            var metaFactory = deps[0];
            var Meta = metaFactory(core);

            Annotation = deps[1];

            var spec = {};

            meta = new Meta(id, spec);
          });
      });

      it("should return a promise", function() {

        var result = meta.prepareAsync();

        expect(result instanceof Promise).toBe(true);

        // Wait for load to finish.
        return result.then(function() {}, function() {});
      });

      it("should request the configuration to the configuration service", function() {

        return meta.prepareAsync()
          .then(function() {
            expect(core.configService.selectAsync).toHaveBeenCalledTimes(1);
            expect(core.configService.selectAsync).toHaveBeenCalledWith(id);
          });
      });

      it("should return a promise that resolves to undefined", function() {

        return meta.prepareAsync()
          .then(function(result) {
            expect(result).toBe(undefined);
          });
      });

      it("should support the configuration service returning a null configuration", function() {

        core.configService.selectAsync.and.returnValue(Promise.resolve(null));
        return meta.prepareAsync();
      });

      it("should load the configuration and make it available in #config", function() {
        var moduleConfig = {};

        core.configService.selectAsync.and.returnValue(Promise.resolve(moduleConfig));

        return meta.prepareAsync()
          .then(function() {
            expect(meta.config).toBe(moduleConfig);
          });
      });

      it("should make #isPrepared return true", function() {

        expect(meta.isPrepared).toBe(false);

        return meta.prepareAsync()
          .then(function() {
            expect(meta.isPrepared).toBe(true);
          });
      });

      it("should only call the configuration service the first time", function() {

        return meta.prepareAsync()
          .then(function() {
            expect(core.configService.selectAsync).toHaveBeenCalledTimes(1);

            return meta.prepareAsync()
              .then(function() {
                expect(core.configService.selectAsync).toHaveBeenCalledTimes(1);
              });
          });
      });

      it("should create all annotations", function() {
        var moduleConfig = {};
        var annotationAConfig = {};
        var annotationBConfig = {};

        core.configService.getAnnotationsIds.and.returnValue([
          "test/AnnotationA", "test/AnnotationB"
        ]);
        core.configService.hasAnnotation.and.returnValue(true);
        core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
          if(annotationId == null) {
            return Promise.resolve(moduleConfig);
          }

          switch(annotationId) {
            case "test/AnnotationA": return Promise.resolve(annotationAConfig);
            case "test/AnnotationB": return Promise.resolve(annotationBConfig);
            default: return null;
          }
        });

        var AnnotationA = Annotation.extend({}, {
          get id() {
            return "test/AnnotationA";
          }
        });
        var AnnotationB = Annotation.extend({}, {
          get id() {
            return "test/AnnotationB";
          }
        });

        core.moduleMetaService.get.and.callFake(function(id) {
          switch(id) {
            case "test/AnnotationA": return {
              loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
            };
            case "test/AnnotationB": return {
              loadAsync: jasmine.createSpy("AnnotationB.loadAsync").and.returnValue(Promise.resolve(AnnotationB))
            };
            default: return null;
          }
        });

        return meta.prepareAsync()
          .then(function() {
            expect(core.configService.selectAsync).toHaveBeenCalledTimes(3);
            expect(core.configService.selectAsync).toHaveBeenCalledWith(id);
            expect(core.configService.selectAsync).toHaveBeenCalledWith(id, "test/AnnotationA");
            expect(core.configService.selectAsync).toHaveBeenCalledWith(id, "test/AnnotationB");
          });
      });

      it("should return a rejected promise if creating an annotation fails", function() {
        var moduleConfig = {};
        var annotationAConfig = {};

        core.configService.getAnnotationsIds.and.returnValue([
          "test/AnnotationA"
        ]);
        core.configService.hasAnnotation.and.returnValue(true);
        core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
          if(annotationId == null) {
            return Promise.resolve(moduleConfig);
          }

          switch(annotationId) {
            case "test/AnnotationA": return Promise.resolve(annotationAConfig);
            default: return null;
          }
        });

        var error = new Error("Annotation creation failed.");

        var AnnotationA = Annotation.extend({}, {
          get id() {
            return "test/AnnotationA";
          },

          createAsync: function() {
            return Promise.reject(error);
          }
        });

        core.moduleMetaService.get.and.callFake(function(id) {
          switch(id) {
            case "test/AnnotationA": return {
              loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
            };
            default: return null;
          }
        });

        return meta.prepareAsync()
          .then(function() {
            return Promise.reject("Rejection expected.");
          }, function(reason) {
            expect(reason).toBe(error);
          });
      });
    });

    describe("#__configure(configSpec)", function() {

      var Meta;
      var core;

      beforeEach(function() {
        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            core = createCoreMock();
            Meta = metaFactory(core);
          });
      });

      it("should respect the specified `configSpec.ranking` value", function() {
        var spec = {ranking: 2};
        var meta = new Meta(id, spec);
        var configSpec = {ranking: 1};

        meta.__configure(configSpec);

        expect(meta.ranking).toBe(1);
      });

      it("should convert the specified `configSpec.ranking` to a number", function() {
        var spec = {ranking: 2};
        var meta = new Meta(id, spec);
        var configSpec = {ranking: "1"};

        meta.__configure(configSpec);

        expect(meta.ranking).toBe(1);
      });

      it("should default a specified `configSpec.ranking` to 0 when NaN", function() {
        var spec = {ranking: 2};
        var meta = new Meta(id, spec);
        var configSpec = {ranking: "foo"};

        meta.__configure(configSpec);

        expect(meta.ranking).toBe(0);
      });

      it("should leave the current ranking if `configSpec.ranking` is not present", function() {
        var spec = {ranking: 2};
        var meta = new Meta(id, spec);
        var configSpec = {};

        meta.__configure(configSpec);

        expect(meta.ranking).toBe(2);
      });

      it("should register one rule per annotation in `configSpec.annotations`", function() {
        var configSpec = {
          annotations: {
            "FooAnnotation": {foo: "a"},
            "BarAnnotation": {bar: "b"}
          }
        };

        var meta = new Meta(id, {});

        meta.__configure(configSpec);

        expect(core.configService.addRule).toHaveBeenCalledTimes(2);
        expect(core.configService.addRule.calls.argsFor(0)).toEqual([{
          priority: -Infinity,
          select: {
            module: id,
            annotation: "FooAnnotation"
          },
          apply: {foo: "a"}
        }]);
        expect(core.configService.addRule.calls.argsFor(1)).toEqual([{
          priority: -Infinity,
          select: {
            module: id,
            annotation: "BarAnnotation"
          },
          apply: {bar: "b"}
        }]);
      });
    });

    describe("#resolveId(moduleId)", function() {

      var Meta;

      beforeEach(function() {
        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(createCoreMock());
          });
      });

      it("should call moduleUtil.resolveModuleId", function() {
        var spec = {};
        var meta = new Meta(id, spec);

        spyOn(moduleUtil, "resolveModuleId").and.returnValue("test/xyz");

        var result = meta.resolveId("./dudu");

        expect(moduleUtil.resolveModuleId).toHaveBeenCalledTimes(1);
        expect(moduleUtil.resolveModuleId).toHaveBeenCalledWith("./dudu", id);
        expect(result).toBe("test/xyz");
      });
    });

    describe("#isVirtual", function() {

      var Meta;

      beforeEach(function() {

        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(createCoreMock());
          });
      });

      it("should default to false", function() {
        var spec = {};
        var meta = new Meta(id, spec);

        expect(meta.isVirtual).toBe(false);
      });

      it("should respect the specified `spec.isAbstract` value", function() {
        var spec = {isVirtual: true};
        var meta = new Meta(id, spec);

        expect(meta.isVirtual).toBe(true);

        spec = {isVirtual: false};
        meta = new Meta(id, spec);

        expect(meta.isVirtual).toBe(false);
      });

      it("should convert the specified `spec.isVirtual` to a boolean", function() {
        var spec = {isVirtual: 1};
        var meta = new Meta(id, spec);

        expect(meta.isVirtual).toBe(true);
      });
    });

    describe("#isSubtypeOf(baseMeta)", function() {

      var Meta;

      beforeEach(function() {

        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(createCoreMock());
          });
      });

      it("should return false", function() {
        var spec = {};
        var meta = new Meta(id, spec);
        var meta2 = new Meta(id2, spec);

        expect(meta.isSubtypeOf(meta2)).toBe(false);
      });
    });

    describe("#isInstanceOf(typeMeta)", function() {

      var Meta;

      beforeEach(function() {

        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(createCoreMock());
          });
      });

      it("should return false", function() {
        var spec = {};
        var meta = new Meta(id, spec);
        var meta2 = new Meta(id2, spec);

        expect(meta.isInstanceOf(meta2)).toBe(false);
      });
    });

    describe("#getAnnotationAsync(Annotation, {assertResult})", function() {

      var Annotation;
      var AnnotationA;
      var core;
      var Meta;
      var errorMatch;

      beforeEach(function() {

        core = createCoreMock();

        return localRequire.promise([
          "pentaho/_core/module/Meta",
          "pentaho/module/Annotation",
          "tests/pentaho/util/errorMatch"
        ])
        .then(function(deps) {
          var metaFactory = deps[0];
          Meta = metaFactory(core);

          Annotation = deps[1];
          errorMatch = deps[2];

          AnnotationA = Annotation.extend({}, {
            get id() {
              return "test/AnnotationA";
            }
          });
        });
      });

      it("should return a rejected promise if Annotation is null", function() {

        var meta = new Meta(id, {});

        return meta.getAnnotationAsync(null).then(function() {
          return Promise.reject("Expected rejection.");
        }, function(error) {
          expect(error).toEqual(errorMatch.argRequired("Annotation"));
        });
      });

      describe("when module is not yet prepared", function() {

        describe("when given a string identifier", function() {

          it("should return a rejected promise when the identifier is not of a defined annotation", function() {

            var error = new Error("Does not exist.");
            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync")
                    .and.returnValue(Promise.reject(error))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync("test/AnnotationA").then(function(annotation) {
              return Promise.reject("Rejection expected.");
            }, function(reason) {
              expect(reason).toBe(error);
            });
          });

          it("should return a promise that resolves to null " +
            "when the identifier is of a non-existing annotation", function() {

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync("test/AnnotationA").then(function(annotation) {
              expect(annotation).toBe(null);
            });
          });

          it("should return a rejected promise when the identifier is of a non-existing annotation and" +
            "assertResult is true", function() {

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync("test/AnnotationA", {assertResult: true})
              .then(function() {
                return Promise.reject("Rejection expected.");
              }, function(error) {
                expect(error).toEqual(errorMatch.operInvalid());
              });
          });

          it("should return a promise that resolves to the requested annotation, " +
            "when the identifier is of an existing annotation", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync("test/AnnotationA").then(function(annotation) {
              expect(annotation instanceof AnnotationA).toBe(true);
            });
          });

          it("should return a promise that resolves to the requested annotation, " +
            "when the annotation had been requested before", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync("test/AnnotationA").then(function(annotation) {
              expect(annotation instanceof AnnotationA).toBe(true);

              return meta.getAnnotationAsync("test/AnnotationA").then(function(annotation2) {
                expect(annotation).toBe(annotation2);
              });
            });
          });
        });

        describe("when given an annotation constructor", function() {

          it("should return a rejected promise if the function has no id", function() {

            var meta = new Meta(id, {});
            var NotAnAnnotation = function() {};

            return meta.getAnnotationAsync(NotAnAnnotation).then(function() {
              return Promise.reject("Expected rejection.");
            }, function(error) {
              expect(error).toEqual(errorMatch.argRequired("Annotation.id"));
            });
          });

          it("should return a promise that resolves to null " +
            "when the module is not annotated with that annotation", function() {

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync(AnnotationA).then(function(annotation) {
              expect(annotation).toBe(null);
            });
          });

          it("should return a rejected promise when the module is not annotated with that annotation and " +
            "assertResult is true", function() {

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync(AnnotationA, {assertResult: true})
              .then(function() {
                return Promise.reject("Rejection expected.");
              }, function(error) {
                expect(error).toEqual(errorMatch.operInvalid());
              });
          });

          it("should return a promise that resolves to the requested annotation, " +
            "when the module is annotated with that annotation", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync(AnnotationA).then(function(annotation) {
              expect(annotation instanceof AnnotationA).toBe(true);
            });
          });

          it("should return a promise that resolves to the requested annotation, " +
            "when the annotation had been requested before", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync(AnnotationA).then(function(annotation) {
              expect(annotation instanceof AnnotationA).toBe(true);

              return meta.getAnnotationAsync(AnnotationA).then(function(annotation2) {
                expect(annotation).toBe(annotation2);
              });
            });
          });

          it("should return a rejected promise when creating the requested annotation fails", function() {
            var error = new Error("Annotation failed createAsync");
            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            AnnotationA.createAsync = function() {
              return Promise.reject(error);
            };

            return meta.getAnnotationAsync(AnnotationA).then(function() {
              return Promise.reject("Rejection expected.");
            }, function(reason) {
              expect(reason).toBe(error);
            });
          });

          it("should return a rejected promise with the same error by " +
            "which the annotation creating previously failed", function() {
            var error = new Error("Annotation failed createAsync");
            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            AnnotationA.createAsync = function() {
              return Promise.reject(error);
            };

            return meta.getAnnotationAsync(AnnotationA).then(function() {
              return Promise.reject("Rejection expected.");
            }, function(reason) {

              expect(reason).toBe(error);

              return meta.getAnnotationAsync(AnnotationA).then(function() {
                return Promise.reject("Rejection expected.");
              }, function(reason2) {
                expect(reason).toBe(reason2);
              });
            });
          });
        });
      });

      describe("when module is prepared", function() {

        it("should return a promise that resolves to the requested annotation, " +
          "when the module is annotated with that annotation", function() {

          var moduleConfig = {};
          var annotationAConfig = {};

          core.configService.getAnnotationsIds.and.returnValue([
            "test/AnnotationA"
          ]);
          core.configService.hasAnnotation.and.returnValue(true);
          core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {

            if(annotationId == null) {
              return Promise.resolve(moduleConfig);
            }

            switch(annotationId) {
              case "test/AnnotationA": return Promise.resolve(annotationAConfig);
              default: return null;
            }
          });

          core.moduleMetaService.get.and.callFake(function(id) {
            switch(id) {
              case "test/AnnotationA": return {
                loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
              };
              default: return null;
            }
          });

          var meta = new Meta(id, {});

          return meta.prepareAsync().then(function() {

            return meta.getAnnotationAsync(AnnotationA).then(function(annotation) {
              expect(annotation instanceof AnnotationA).toBe(true);
            });
          });
        });

        it("should return a rejected promise when requesting an annotation whose creation had failed", function() {
          var error = new Error("Annotation failed createAsync");
          var moduleConfig = {};
          var annotationAConfig = {};

          core.configService.getAnnotationsIds.and.returnValue([
            "test/AnnotationA"
          ]);
          core.configService.hasAnnotation.and.returnValue(true);
          core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {

            if(annotationId == null) {
              return Promise.resolve(moduleConfig);
            }

            switch(annotationId) {
              case "test/AnnotationA": return Promise.resolve(annotationAConfig);
              default: return null;
            }
          });

          core.moduleMetaService.get.and.callFake(function(id) {
            switch(id) {
              case "test/AnnotationA": return {
                loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
              };
              default: return null;
            }
          });

          var meta = new Meta(id, {});

          AnnotationA.createAsync = function() {
            return Promise.reject(error);
          };

          return meta.prepareAsync().then(function() {

            return Promise.reject("Rejection expected.");
          }, function() {

            return meta.getAnnotationAsync(AnnotationA).then(function() {

              return Promise.reject("Rejection expected.");
            }, function(reason) {
              expect(reason).toBe(error);
            });
          });
        });
      });
    });

    describe("#getAnnotation(Annotation, {assertResult})", function() {

      var Annotation;
      var AnnotationA;
      var core;
      var Meta;
      var errorMatch;

      beforeEach(function() {

        core = createCoreMock();

        return localRequire.promise([
          "pentaho/_core/module/Meta",
          "pentaho/module/Annotation",
          "tests/pentaho/util/errorMatch"
        ])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(core);

            Annotation = deps[1];
            errorMatch = deps[2];

            AnnotationA = Annotation.extend({}, {
              get id() {
                return "test/AnnotationA";
              }
            });
          });
      });

      it("should throw if Annotation is null", function() {

        var meta = new Meta(id, {});

        expect(function() {
          meta.getAnnotation(null);
        }).toThrow(errorMatch.argRequired("Annotation"));
      });

      describe("when module is not yet prepared", function() {

        describe("when given a string identifier", function() {

          it("should return null when the identifier is of a non-existing annotation", function() {

            core.configService.hasAnnotation.and.returnValue(false);

            var meta = new Meta(id, {});

            var annotation = meta.getAnnotation("test/AnnotationA");

            expect(annotation).toBe(null);
          });

          it("should throw when the identifier is of a non-existing annotation and assertResult is true", function() {

            core.configService.hasAnnotation.and.returnValue(false);

            var meta = new Meta(id, {});

            expect(function() {
              meta.getAnnotation("test/AnnotationA", {assertResult: true});
            }).toThrow(errorMatch.operInvalid());
          });

          it("should return null when the identifier is of an existing annotation " +
            "which has not yet been loaded", function() {

            core.configService.hasAnnotation.and.returnValue(true);

            var meta = new Meta(id, {});

            var annotation = meta.getAnnotation("test/AnnotationA");

            expect(annotation).toBe(null);
          });

          it("should throw when the identifier is of an existing annotation which has not yet been loaded " +
            "and assertResult is true", function() {

            core.configService.hasAnnotation.and.returnValue(true);

            var meta = new Meta(id, {});

            expect(function() {
              meta.getAnnotation("test/AnnotationA", {assertResult: true});
            }).toThrow(errorMatch.operInvalid());
          });

          it("should return the requested annotation, if it exists and had been previously obtained", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync("test/AnnotationA").then(function(annotation) {

              var annotationA = meta.getAnnotation("test/AnnotationA");

              expect(annotationA instanceof AnnotationA).toBe(true);
              expect(annotationA).toBe(annotation);
            });
          });
        });

        describe("when given an annotation constructor", function() {

          it("should throw an error if the function has no id", function() {

            var meta = new Meta(id, {});
            var NotAnAnnotation = function() {};

            expect(function() {
              meta.getAnnotation(NotAnAnnotation);
            }).toThrow(errorMatch.argRequired("Annotation.id"));
          });

          it("should return null when the module is not annotated with that annotation", function() {

            core.configService.hasAnnotation.and.returnValue(false);

            var meta = new Meta(id, {});

            var annotation = meta.getAnnotation(AnnotationA);
            expect(annotation).toBe(null);
          });

          it("should throw when the module is not annotated with the requested annotation " +
            "and assertResult is true", function() {

            core.configService.hasAnnotation.and.returnValue(false);

            var meta = new Meta(id, {});

            expect(function() {
              meta.getAnnotation(AnnotationA, {assertResult: true});
            }).toThrow(errorMatch.operInvalid());
          });

          it("should return the requested annotation, if it exists and had been previously obtained", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync(AnnotationA).then(function(annotation) {

              var annotationA = meta.getAnnotation(AnnotationA);

              expect(annotationA instanceof AnnotationA).toBe(true);
              expect(annotationA).toBe(annotation);
            });
          });

          it("should throw when the module is annotated with the requested annotation but has not yet been loaded " +
            "and assertResult is true", function() {

            core.configService.hasAnnotation.and.returnValue(true);

            var meta = new Meta(id, {});

            expect(function() {
              meta.getAnnotation(AnnotationA, {assertResult: true});
            }).toThrow(errorMatch.operInvalid());
          });

          it("should throw when creating the requested annotation had previously failed", function() {
            var error = new Error("Annotation failed createAsync");
            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            AnnotationA.createAsync = function() {
              return Promise.reject(error);
            };

            return meta.getAnnotationAsync(AnnotationA).then(function() {

              return Promise.reject("Rejection expected.");
            }, function(reason) {

              expect(function() {
                meta.getAnnotation(AnnotationA);
              }).toThrow(error);
            });
          });

          it("should return null if the annotation exists and is still loading", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            var promise = meta.getAnnotationAsync(AnnotationA);

            var annotationA = meta.getAnnotation(AnnotationA);

            expect(annotationA).toBe(null);

            return promise;
          });

          it("should throw when if the annotation exists and is still loading but assertResult is true", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            var promise = meta.getAnnotationAsync(AnnotationA);

            expect(function() {
              meta.getAnnotation(AnnotationA, {assertResult: true});
            }).toThrow(errorMatch.operInvalid());

            return promise;
          });
        });
      });

      describe("when module is prepared", function() {

        it("should return null when the module is not annotated with that annotation", function() {

          core.configService.hasAnnotation.and.returnValue(false);

          var meta = new Meta(id, {});

          return meta.prepareAsync().then(function() {

            var annotation = meta.getAnnotation(AnnotationA);

            expect(annotation).toBe(null);
          });
        });

        it("should throw when the module is not annotated with the requested annotation " +
          "and assertResult is true", function() {

          core.configService.hasAnnotation.and.returnValue(false);

          var meta = new Meta(id, {});

          return meta.prepareAsync().then(function() {

            expect(function() {
              meta.getAnnotation(AnnotationA, {assertResult: true});
            })
            .toThrow(errorMatch.operInvalid());
          });
        });

        it("should return the requested annotation, if it exists", function() {

          var moduleConfig = {};
          var annotationAConfig = {};

          core.configService.getAnnotationsIds.and.returnValue([
            "test/AnnotationA"
          ]);
          core.configService.hasAnnotation.and.returnValue(true);
          core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {

            if(annotationId == null) {
              return Promise.resolve(moduleConfig);
            }

            switch(annotationId) {
              case "test/AnnotationA": return Promise.resolve(annotationAConfig);
              default: return null;
            }
          });

          core.moduleMetaService.get.and.callFake(function(id) {
            switch(id) {
              case "test/AnnotationA": return {
                loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
              };
              default: return null;
            }
          });

          var meta = new Meta(id, {});

          return meta.prepareAsync().then(function() {

            var annotationA = meta.getAnnotation(AnnotationA);

            expect(annotationA instanceof AnnotationA).toBe(true);
          });
        });

        it("should throw when creating the requested annotation had previously failed", function() {
          var error = new Error("Annotation failed createAsync");
          var moduleConfig = {};
          var annotationAConfig = {};

          core.configService.getAnnotationsIds.and.returnValue([
            "test/AnnotationA"
          ]);
          core.configService.hasAnnotation.and.returnValue(true);
          core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {

            if(annotationId == null) {
              return Promise.resolve(moduleConfig);
            }

            switch(annotationId) {
              case "test/AnnotationA": return Promise.resolve(annotationAConfig);
              default: return null;
            }
          });

          core.moduleMetaService.get.and.callFake(function(id) {
            switch(id) {
              case "test/AnnotationA": return {
                loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
              };
              default: return null;
            }
          });

          var meta = new Meta(id, {});

          AnnotationA.createAsync = function() {
            return Promise.reject(error);
          };

          return meta.prepareAsync().then(function() {

            return Promise.reject("Rejection expected.");
          }, function(reason) {

            expect(function() {
              meta.getAnnotation(AnnotationA);
            }).toThrow(error);
          });
        });
      });
    });

    describe("#hasAnnotation(Annotation, keyArgs)", function() {

      var Annotation;
      var AnnotationA;
      var core;
      var Meta;
      var errorMatch;

      beforeEach(function() {

        core = createCoreMock();

        return localRequire.promise([
          "pentaho/_core/module/Meta",
          "pentaho/module/Annotation",
          "tests/pentaho/util/errorMatch"
        ])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(core);

            Annotation = deps[1];
            errorMatch = deps[2];

            AnnotationA = Annotation.extend({}, {
              get id() {
                return "test/AnnotationA";
              }
            });
          });
      });

      it("should throw if Annotation is null", function() {

        var meta = new Meta(id, {});

        expect(function() {
          meta.hasAnnotation(null);
        }).toThrow(errorMatch.argRequired("Annotation"));
      });

      describe("when module is not yet prepared", function() {

        describe("when given a string identifier", function() {

          it("should return false when the identifier is of a non-existing annotation", function() {

            core.configService.hasAnnotation.and.returnValue(false);

            var meta = new Meta(id, {});

            var result = meta.hasAnnotation("test/AnnotationA");

            expect(result).toBe(false);
          });

          it("should return true when the identifier is of an existing annotation " +
            "which has not yet been loaded", function() {

            core.configService.hasAnnotation.and.returnValue(true);

            var meta = new Meta(id, {});

            var result = meta.hasAnnotation("test/AnnotationA");

            expect(result).toBe(true);
          });

          it("should return true if it exists and had been previously obtained", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync("test/AnnotationA").then(function(annotation) {

              var result = meta.hasAnnotation("test/AnnotationA");

              expect(result).toBe(true);
            });
          });
        });

        describe("when given an annotation constructor", function() {

          it("should throw an error if the function has no id", function() {

            var meta = new Meta(id, {});
            var NotAnAnnotation = function() {};

            expect(function() {
              meta.hasAnnotation(NotAnAnnotation);
            }).toThrow(errorMatch.argRequired("Annotation.id"));
          });

          it("should return false when the module is not annotated with the requested annotation", function() {

            core.configService.hasAnnotation.and.returnValue(false);

            var meta = new Meta(id, {});

            var result = meta.hasAnnotation(AnnotationA);

            expect(result).toBe(false);
          });

          it("should return true when the identifier is of an existing annotation " +
            "which has not yet been loaded", function() {

            core.configService.hasAnnotation.and.returnValue(true);

            var meta = new Meta(id, {});

            var result = meta.hasAnnotation(AnnotationA);

            expect(result).toBe(true);
          });

          it("should return true if it exists and had been previously obtained", function() {

            var annotationAConfig = {};

            core.configService.getAnnotationsIds.and.returnValue([
              "test/AnnotationA"
            ]);
            core.configService.hasAnnotation.and.returnValue(true);
            core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
              switch(annotationId) {
                case "test/AnnotationA": return Promise.resolve(annotationAConfig);
                default: return null;
              }
            });

            core.moduleMetaService.get.and.callFake(function(id) {
              switch(id) {
                case "test/AnnotationA": return {
                  loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
                };
                default: return null;
              }
            });

            var meta = new Meta(id, {});

            return meta.getAnnotationAsync(AnnotationA).then(function() {

              var result = meta.hasAnnotation(AnnotationA);

              expect(result).toBe(true);
            });
          });
        });
      });

      describe("when module is prepared", function() {

        it("should return false when the module is not annotated with that annotation", function() {

          core.configService.hasAnnotation.and.returnValue(false);

          var meta = new Meta(id, {});

          return meta.prepareAsync().then(function() {

            var result = meta.hasAnnotation(AnnotationA);

            expect(result).toBe(false);
          });
        });

        it("should return true if the module is annotated with that annotation", function() {

          var moduleConfig = {};
          var annotationAConfig = {};

          core.configService.getAnnotationsIds.and.returnValue([
            "test/AnnotationA"
          ]);
          core.configService.hasAnnotation.and.returnValue(true);
          core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {

            if(annotationId == null) {
              return Promise.resolve(moduleConfig);
            }

            switch(annotationId) {
              case "test/AnnotationA": return Promise.resolve(annotationAConfig);
              default: return null;
            }
          });

          core.moduleMetaService.get.and.callFake(function(id) {
            switch(id) {
              case "test/AnnotationA": return {
                loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
              };
              default: return null;
            }
          });

          var meta = new Meta(id, {});

          return meta.prepareAsync().then(function() {

            var result = meta.hasAnnotation(AnnotationA);

            expect(result).toBe(true);
          });
        });

        it("should return true if the module is annotated with that annotation and " +
          "its creation had previously failed", function() {
          var error = new Error("Annotation failed createAsync");
          var moduleConfig = {};
          var annotationAConfig = {};

          core.configService.getAnnotationsIds.and.returnValue([
            "test/AnnotationA"
          ]);
          core.configService.hasAnnotation.and.returnValue(true);
          core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {

            if(annotationId == null) {
              return Promise.resolve(moduleConfig);
            }

            switch(annotationId) {
              case "test/AnnotationA": return Promise.resolve(annotationAConfig);
              default: return null;
            }
          });

          core.moduleMetaService.get.and.callFake(function(id) {
            switch(id) {
              case "test/AnnotationA": return {
                loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
              };
              default: return null;
            }
          });

          var meta = new Meta(id, {});

          AnnotationA.createAsync = function() {
            return Promise.reject(error);
          };

          return meta.prepareAsync().then(function() {

            return Promise.reject("Rejection expected.");
          }, function(reason) {

            var result = meta.hasAnnotation(AnnotationA);
            expect(result).toBe(true);
          });
        });
      });
    });

    describe("#getAnnotationsIds(keyArgs)", function() {

      var Annotation;
      var AnnotationA;
      var AnnotationB;
      var core;
      var Meta;

      beforeEach(function() {

        core = createCoreMock();

        return localRequire.promise([
          "pentaho/_core/module/Meta",
          "pentaho/module/Annotation"
        ])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(core);

            Annotation = deps[1];

            AnnotationA = Annotation.extend({}, {
              get id() {
                return "test/AnnotationA";
              }
            });

            AnnotationB = Annotation.extend({}, {
              get id() {
                return "test/AnnotationB";
              }
            });
          });
      });

      describe("when module is not yet prepared", function() {

        it("should return null when there is no config service", function() {

          core.configService = null;

          var meta = new Meta(id, {});

          var result = meta.getAnnotationsIds();

          expect(result).toBe(null);
        });

        it("should return the array returned by the config service", function() {

          core.configService.getAnnotationsIds.and.returnValue([
            "test/AnnotationA", "test/AnnotationB"
          ]);

          var meta = new Meta(id, {});

          var result = meta.getAnnotationsIds();

          expect(result).toEqual(["test/AnnotationA", "test/AnnotationB"]);
        });

        it("should return null if the config service returns null", function() {

          core.configService.getAnnotationsIds.and.returnValue(null);

          var meta = new Meta(id, {});

          var result = meta.getAnnotationsIds();

          expect(result).toBe(null);
        });
      });

      describe("when module is prepared", function() {

        it("should return the existing annotation ids when there are annotations", function() {

          var moduleConfig = {};
          var annotationAConfig = {};
          var annotationBConfig = {};

          core.configService.getAnnotationsIds.and.returnValue([
            "test/AnnotationA", "test/AnnotationB"
          ]);
          core.configService.hasAnnotation.and.returnValue(true);
          core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
            if(annotationId == null) {
              return Promise.resolve(moduleConfig);
            }

            switch(annotationId) {
              case "test/AnnotationA": return Promise.resolve(annotationAConfig);
              case "test/AnnotationB": return Promise.resolve(annotationBConfig);
              default: return null;
            }
          });

          core.moduleMetaService.get.and.callFake(function(id) {
            switch(id) {
              case "test/AnnotationA": return {
                loadAsync: jasmine.createSpy("AnnotationA.loadAsync").and.returnValue(Promise.resolve(AnnotationA))
              };
              case "test/AnnotationB": return {
                loadAsync: jasmine.createSpy("AnnotationB.loadAsync").and.returnValue(Promise.resolve(AnnotationB))
              };
              default: return null;
            }
          });

          var meta = new Meta(id, {});

          return meta.prepareAsync()
            .then(function() {
              var result = meta.getAnnotationsIds();

              expect(result).toEqual(["test/AnnotationA", "test/AnnotationB"]);
            });
        });

        it("should return null when there are no annotations", function() {

          var moduleConfig = {};

          core.configService.getAnnotationsIds.and.returnValue(null);
          core.configService.hasAnnotation.and.returnValue(false);
          core.configService.selectAsync.and.callFake(function(moduleId, annotationId) {
            if(annotationId == null) {
              return Promise.resolve(moduleConfig);
            }
          });

          var meta = new Meta(id, {});

          return meta.prepareAsync()
            .then(function() {
              var result = meta.getAnnotationsIds();

              expect(result).toBe(null);
            });
        });
      });
    });
  });
});
