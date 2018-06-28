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

  describe("pentaho.module", function() {

    var localRequire;
    var moduleUtil;
    var moduleService;
    var plugin;
    var callModuleService;
    var callModuleServiceValue;

    var name;
    var requesterRequire;
    var requesterModuleId;
    var config;

    beforeEach(function() {
      name = "abc";
      requesterRequire = function() {};
      requesterModuleId = "xyz";
      config = {};
      callModuleServiceValue = {};

      localRequire = require.new();

      moduleUtil = createModuleUtilMock();
      moduleService = createModuleServiceMock();

      localRequire.define("pentaho/module/util", function() {
        return moduleUtil;
      });

      localRequire.define("pentaho/module/service", function() {
        return moduleService;
      });

      callModuleService = jasmine.createSpy("callModuleService").and.returnValue(Promise.resolve());
    });

    afterEach(function() {
      localRequire.dispose();
    });

    function createModuleUtilMock() {

      var moduleUtil = jasmine.createSpyObj("moduleUtil", ["getId", "absolutizeIdRelativeToSibling"]);
      moduleUtil.getId.and.returnValue(requesterModuleId);
      moduleUtil.absolutizeIdRelativeToSibling.and.returnValue(function(a, b) {
        return b + "/" + a;
      });
      return moduleUtil;
    }

    function createModuleServiceMock() {
      var moduleService = jasmine.createSpyObj("moduleService", [
        "getSubtypesOfAsync", "getSubtypeOfAsync", "getInstancesOfAsync", "getInstanceOfAsync"
      ]);

      moduleService.getSubtypesOfAsync.and.returnValue(Promise.resolve(callModuleServiceValue));
      moduleService.getInstancesOfAsync.and.returnValue(Promise.resolve(callModuleServiceValue));

      moduleService.getSubtypeOfAsync.and.returnValue(Promise.resolve(callModuleServiceValue));
      moduleService.getInstanceOfAsync.and.returnValue(Promise.resolve(callModuleServiceValue));

      return moduleService;
    }

    function createOnLoad(done, isResolve, expectFun) {

      var onLoad = jasmine.createSpy("onLoad").and.callFake(function(value) {
        if(isResolve) {
          if(expectFun) {
            expectFun(value);
          }
          done();
        } else {
          done.fail("should have been rejected");
        }
      });

      onLoad.error = jasmine.createSpy().and.callFake(function(error) {
        if(!isResolve) {
          if(expectFun) {
            expectFun(error);
          }
          done();
        } else {
          done.fail(error);
        }
      });

      return onLoad;
    }

    describe("impl.ServicePlugin", function() {

      beforeEach(function() {

        return localRequire.promise(["pentaho/module/impl/ServicePlugin"])
          .then(function(deps) {

            var ServicePlugin = deps[0];

            plugin = new ServicePlugin(callModuleService);
          });
      });

      it("should have a load method", function() {
        expect(plugin instanceof Object).toBe(true);
        expect(typeof plugin.load).toBe("function");
      });

      it("should call onLoad with undefined if config.isBuild is true", function(done) {

        var onLoad = createOnLoad(done, true, function() {
          expect(onLoad).toHaveBeenCalledTimes(1);
          expect(onLoad).toHaveBeenCalledWith();
        });

        config.isBuild = true;

        plugin.load(name, requesterRequire, onLoad, config);
      });

      it("should obtain the id of the requester module", function(done) {

        var onLoad = createOnLoad(done, true, function() {
          expect(moduleUtil.getId).toHaveBeenCalledTimes(1);
          expect(moduleUtil.getId).toHaveBeenCalledWith(requesterRequire);
        });

        plugin.load(name, requesterRequire, onLoad, config);
      });

      it("should absolutize the given name with the id of the requester module", function(done) {

        var onLoad = createOnLoad(done, true, function() {
          expect(moduleUtil.absolutizeIdRelativeToSibling).toHaveBeenCalledTimes(1);
          expect(moduleUtil.absolutizeIdRelativeToSibling).toHaveBeenCalledWith(name, requesterModuleId);
        });

        plugin.load(name, requesterRequire, onLoad, config);
      });

      it("should call callModuleService with the moduleService and the moduleId", function(done) {

        var onLoad = createOnLoad(done, true, function() {
          expect(callModuleService).toHaveBeenCalledTimes(1);

          var absoluteId = moduleUtil.absolutizeIdRelativeToSibling.calls.first().returnValue;
          expect(callModuleService).toHaveBeenCalledWith(moduleService, absoluteId);
        });

        plugin.load(name, requesterRequire, onLoad, config);
      });

      it("should call onLoad with the result of the promise, when successful", function(done) {

        var moduleValues = [];
        callModuleService.and.returnValue(Promise.resolve(moduleValues));

        var onLoad = createOnLoad(done, true, function(value) {
          expect(value).toBe(moduleValues);
        });

        plugin.load(name, requesterRequire, onLoad, config);
      });

      it("should call onLoad.error with the result of the promise, when unsuccessful", function(done) {
        var error = new Error();
        callModuleService.and.returnValue(Promise.reject(error));

        var onLoad = createOnLoad(done, false, function(result) {
          expect(result).toBe(error);
        });

        plugin.load(name, requesterRequire, onLoad, config);
      });
    });

    describe("subtypesOf", function() {

      beforeEach(function() {

        return localRequire.promise(["pentaho/module/subtypesOf"])
          .then(function(deps) {
            plugin = deps[0];
          });
      });

      it("should get the subtype modules of the given id", function(done) {

        var onLoad = createOnLoad(done, true, function() {

          expect(moduleService.getSubtypesOfAsync).toHaveBeenCalledTimes(1);

          var absoluteId = moduleUtil.absolutizeIdRelativeToSibling.calls.first().returnValue;

          expect(moduleService.getSubtypesOfAsync).toHaveBeenCalledWith(absoluteId);

          expect(onLoad).toHaveBeenCalledWith(callModuleServiceValue);
        });

        plugin.load(name, requesterRequire, onLoad, config);
      });
    });

    describe("subtypeOf", function() {

      beforeEach(function() {

        return localRequire.promise(["pentaho/module/subtypeOf"])
          .then(function(deps) {
            plugin = deps[0];
          });
      });

      it("should get the subtype module of the given id", function(done) {

        var onLoad = createOnLoad(done, true, function() {

          expect(moduleService.getSubtypeOfAsync).toHaveBeenCalledTimes(1);

          var absoluteId = moduleUtil.absolutizeIdRelativeToSibling.calls.first().returnValue;

          expect(moduleService.getSubtypeOfAsync).toHaveBeenCalledWith(absoluteId);

          expect(onLoad).toHaveBeenCalledWith(callModuleServiceValue);
        });

        plugin.load(name, requesterRequire, onLoad, config);
      });
    });

    describe("instancesOf", function() {

      beforeEach(function() {

        return localRequire.promise(["pentaho/module/instancesOf"])
          .then(function(deps) {
            plugin = deps[0];
          });
      });

      it("should get the instance modules of the given id", function(done) {

        var onLoad = createOnLoad(done, true, function() {

          expect(moduleService.getInstancesOfAsync).toHaveBeenCalledTimes(1);

          var absoluteId = moduleUtil.absolutizeIdRelativeToSibling.calls.first().returnValue;

          expect(moduleService.getInstancesOfAsync).toHaveBeenCalledWith(absoluteId);

          expect(onLoad).toHaveBeenCalledWith(callModuleServiceValue);
        });

        plugin.load(name, requesterRequire, onLoad, config);
      });
    });

    describe("instanceOf", function() {

      beforeEach(function() {

        return localRequire.promise(["pentaho/module/instanceOf"])
          .then(function(deps) {
            plugin = deps[0];
          });
      });

      it("should get the instance module of the given id", function(done) {

        var onLoad = createOnLoad(done, true, function() {

          expect(moduleService.getInstanceOfAsync).toHaveBeenCalledTimes(1);

          var absoluteId = moduleUtil.absolutizeIdRelativeToSibling.calls.first().returnValue;

          expect(moduleService.getInstanceOfAsync).toHaveBeenCalledWith(absoluteId);

          expect(onLoad).toHaveBeenCalledWith(callModuleServiceValue);
        });

        plugin.load(name, requesterRequire, onLoad, config);
      });
    });
  });
});
