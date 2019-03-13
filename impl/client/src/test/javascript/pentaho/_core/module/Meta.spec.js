/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
        configService: jasmine.createSpyObj("configService", ["selectAsync", "getAnnotationsIds"])
      };

      core.configService.selectAsync.and.returnValue(Promise.resolve(null));
      core.configService.getAnnotationsIds.and.returnValue(null);
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

      beforeEach(function() {
        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(createCoreMock());
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

      var config;
      var core;
      var meta;

      beforeEach(function() {
        config = {};

        core = createCoreMock();
        core.configService.selectAsync.and.returnValue(Promise.resolve(config));

        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            var Meta = metaFactory(core);

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

        return meta.prepareAsync()
          .then(function() {
            expect(meta.config).toBe(config);
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
    });

    describe("#__configure(configSpec)", function() {

      var Meta;

      beforeEach(function() {
        return localRequire.promise(["pentaho/_core/module/Meta"])
          .then(function(deps) {
            var metaFactory = deps[0];
            Meta = metaFactory(createCoreMock());
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
  });
});
