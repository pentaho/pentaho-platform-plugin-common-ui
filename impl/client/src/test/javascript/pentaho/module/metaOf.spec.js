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

  describe("pentaho.module.metaOf", function() {

    var localRequire;
    var moduleUtil;
    var moduleMetaService;

    var name;
    var requesterRequire;
    var requesterModuleId;
    var config;
    var modulePlugin;

    var moduleMeta;

    beforeEach(function() {
      name = "abc";
      requesterRequire = function() {};
      requesterModuleId = "xyz";
      config = {};

      localRequire = require.new();

      moduleUtil = createModuleUtilMock();
      moduleMetaService = createModuleMetaServiceMock();
      moduleMeta = createMetaMock();

      localRequire.define("pentaho/module/util", function() {
        return moduleUtil;
      });

      localRequire.define("pentaho/module/metaService", function() {
        return moduleMetaService;
      });

      return localRequire.promise(["pentaho/module/metaOf"])
        .then(function(deps) {
          modulePlugin = deps[0];
        });
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

    function createModuleMetaServiceMock() {

      var moduleMetaService = jasmine.createSpyObj("moduleMetaService", ["get"]);

      moduleMetaService.get.and.callFake(function() { return moduleMeta; });

      return moduleMetaService;
    }

    function createMetaMock() {

      var moduleMeta = jasmine.createSpyObj("moduleMeta", ["prepareAsync"]);

      moduleMeta.prepareAsync.and.returnValue(Promise.resolve());

      return moduleMeta;
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

    it("should have a load method", function() {
      expect(modulePlugin instanceof Object).toBe(true);
      expect(typeof modulePlugin.load).toBe("function");
    });

    it("should call onLoad with undefined if config.isBuild is true", function(done) {

      var onLoad = createOnLoad(done, true, function() {
        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onLoad).toHaveBeenCalledWith();
      });

      config.isBuild = true;

      modulePlugin.load(name, requesterRequire, onLoad, config);
    });

    it("should obtain the id of the requester module", function(done) {

      var onLoad = createOnLoad(done, true, function() {
        expect(moduleUtil.getId).toHaveBeenCalledTimes(1);
        expect(moduleUtil.getId).toHaveBeenCalledWith(requesterRequire);
      });

      modulePlugin.load(name, requesterRequire, onLoad, config);
    });

    it("should absolutize a given name with the id of the requester module", function(done) {

      var onLoad = createOnLoad(done, true, function() {
        expect(moduleUtil.absolutizeIdRelativeToSibling).toHaveBeenCalledTimes(1);
        expect(moduleUtil.absolutizeIdRelativeToSibling).toHaveBeenCalledWith(name, requesterModuleId);
      });

      modulePlugin.load(name, requesterRequire, onLoad, config);
    });

    it("should not absolutize if name is not provided", function(done) {

      var onLoad = createOnLoad(done, true, function() {
        expect(moduleUtil.absolutizeIdRelativeToSibling).not.toHaveBeenCalled();
      });

      modulePlugin.load("", requesterRequire, onLoad, config);
    });

    it("should use the requester id, if name is not specified", function(done) {

      var onLoad = createOnLoad(done, true, function() {
        expect(moduleMetaService.get).toHaveBeenCalledTimes(1);
        expect(moduleMetaService.get).toHaveBeenCalledWith(requesterModuleId, jasmine.any(Object));
      });

      modulePlugin.load("", requesterRequire, onLoad, config);
    });

    it("should call moduleMetaService.get with the absolutized moduleId, if name is specified", function(done) {

      var onLoad = createOnLoad(done, true, function() {
        expect(moduleMetaService.get).toHaveBeenCalledTimes(1);

        var absoluteId = moduleUtil.absolutizeIdRelativeToSibling.calls.first().returnValue;

        expect(moduleMetaService.get)
          .toHaveBeenCalledWith(absoluteId, jasmine.objectContaining({createIfUndefined: true}));
      });

      modulePlugin.load(name, requesterRequire, onLoad, config);
    });

    it("should call prepareAsync of the obtained metadata object", function(done) {

      var onLoad = createOnLoad(done, true, function() {
        expect(moduleMeta.prepareAsync).toHaveBeenCalledTimes(1);
      });

      modulePlugin.load(name, requesterRequire, onLoad, config);
    });

    it("should call onLoad with the obtained metadata object", function(done) {

      var onLoad = createOnLoad(done, true, function(value) {
        expect(value).toBe(moduleMeta);
      });

      modulePlugin.load(name, requesterRequire, onLoad, config);
    });

    it("should call onLoad.error with the result of the promise, when prepareAsync is unsuccessful", function(done) {

      var error = new Error();
      moduleMeta.prepareAsync.and.returnValue(Promise.reject(error));

      var onLoad = createOnLoad(done, false, function(result) {
        expect(result).toBe(error);
      });

      modulePlugin.load(name, requesterRequire, onLoad, config);
    });

    it("should be the main module of the pentaho/module package", function() {
      return localRequire.promise(["pentaho/module"], function(deps) {
        expect(deps[0]).toBe(modulePlugin);
      });
    });
  });
});
