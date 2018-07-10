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

  describe("pentaho/theme!<target-id>", function() {

    var localRequire;
    var themePlugin;
    var requesterModuleId;
    var moduleUtil;
    var configService;

    beforeEach(function() {

      localRequire = require.new();
      requesterModuleId = "test/xyz";

      moduleUtil = createModuleUtilMock();
      configService = createConfigServiceMock();

      localRequire.define("pentaho/module/util", function() {
        return moduleUtil;
      });

      localRequire.define("pentaho/config/service", function() {
        return configService;
      });

      localRequire.define("test/themeA", function() {
      });

      localRequire.define("test/themeB", function() {
      });

      localRequire.define("test/themeC", function() {
      });

      return localRequire.promise(["pentaho/theme/main"])
        .then(function(deps) {
          themePlugin = deps[0];
        });
    });

    afterEach(function() {
      localRequire.dispose();
    });

    // region helpers
    function createModuleUtilMock() {

      var moduleUtil = jasmine.createSpyObj("moduleUtil", ["getId", "resolveModuleId"]);
      moduleUtil.getId.and.returnValue(requesterModuleId);
      moduleUtil.resolveModuleId.and.callFake(function(a, b) {
        if(a.charAt(0) === ".") {
          return b.substring(0, b.indexOf("/")) + "/" + a.substr(2);
        }

        return a;
      });
      return moduleUtil;
    }

    function createOnLoad(done, isSuccessExpected, expectFun) {

      var onLoad = jasmine.createSpy("onLoad").and.callFake(function(value) {
        if(isSuccessExpected) {
          if(expectFun) {
            expectFun(value);
          }
          done();
        } else {
          done.fail("should have been rejected");
        }
      });

      onLoad.error = jasmine.createSpy().and.callFake(function(error) {
        if(!isSuccessExpected) {
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

    function createConfigServiceMock() {

      var configService = jasmine.createSpyObj("configService", ["selectAsync"]);

      configService.selectAsync.and.returnValue(Promise.resolve(null));

      return configService;
    }
    // endregion

    it("should have a load method", function() {
      expect(themePlugin instanceof Object).toBe(true);
      expect(typeof themePlugin.load).toBe("function");
    });

    it("should have a normalize method", function() {
      expect(themePlugin instanceof Object).toBe(true);
      expect(typeof themePlugin.normalize).toBe("function");
    });

    describe("#normalize(name, normalize)", function() {

      it("should call `normalize` on any non-empty, non-_ argument", function() {

        var normalize = jasmine.createSpy("normalize").and.returnValue("abc");

        var name = "foo";
        var result = themePlugin.normalize(name, normalize);

        expect(normalize).toHaveBeenCalledTimes(1);
        expect(result).toBe("abc");
      });

      it("should return an automatic name on an empty argument", function() {

        var normalize = jasmine.createSpy("normalize").and.returnValue("abc");

        var name = "";
        var result = themePlugin.normalize(name, normalize);

        expect(normalize).not.toHaveBeenCalled();
        expect(/^\$_\$_/.test(result)).toBe(true);
      });

      it("should return an automatic name on an _ argument", function() {

        var normalize = jasmine.createSpy("normalize").and.returnValue("abc");

        var name = "_";
        var result = themePlugin.normalize(name, normalize);

        expect(normalize).not.toHaveBeenCalled();
        expect(/^\$_\$_/.test(result)).toBe(true);
      });

      it("should return different automatic names when called multiple times on _ arguments", function() {
        var normalize = function() {};

        var name = "_";
        var result1 = themePlugin.normalize(name, normalize);
        var result2 = themePlugin.normalize(name, normalize);

        expect(result1).not.toBe(result2);
      });
    });

    describe("#load(normalizedName, requesterRequire, onLoad, config)", function() {

      it("should call onLoad with undefined if config.isBuild is true", function(done) {

        var onLoad = createOnLoad(done, true, function() {
          expect(onLoad).toHaveBeenCalledTimes(1);
          expect(onLoad).toHaveBeenCalledWith();
        });

        var config = {isBuild: true};
        var requesterRequire = function() {};
        var name = "abc";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });

      it("should call moduleUtil.getId when normalizedName is an automatic name", function(done) {

        var config = {};
        var requesterRequire = function() {};

        var onLoad = createOnLoad(done, true, function() {
          expect(moduleUtil.getId).toHaveBeenCalledTimes(1);
          expect(moduleUtil.getId).toHaveBeenCalledWith(requesterRequire);
        });
        var name = "$_$_1";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });

      it("should not call moduleUtil.getId when normalizedName is not an automatic name", function(done) {

        var config = {};
        var requesterRequire = function() {};

        var onLoad = createOnLoad(done, true, function() {
          expect(moduleUtil.getId).not.toHaveBeenCalled();
        });
        var name = "abc";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });

      it("should call configService.selectAsync with the full module name (automatic name)", function(done) {

        var config = {};
        var requesterRequire = function() {};

        var onLoad = createOnLoad(done, true, function() {
          expect(configService.selectAsync).toHaveBeenCalledTimes(1);
          expect(configService.selectAsync).toHaveBeenCalledWith("pentaho/theme!test/xyz");
        });
        var name = "$_$_1";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });

      it("should call configService.selectAsync with the full module name (non-automatic name)", function(done) {

        var config = {};
        var requesterRequire = function() {};

        var onLoad = createOnLoad(done, true, function() {
          expect(configService.selectAsync).toHaveBeenCalledTimes(1);
          expect(configService.selectAsync).toHaveBeenCalledWith("pentaho/theme!test/abc");
        });
        var name = "test/abc";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });

      it("should load the main theme module", function(done) {

        var config = {};
        var requesterRequire = function() {};

        configService.selectAsync.and.returnValue(Promise.resolve({
          main: "test/themeA"
        }));

        var onLoad = createOnLoad(done, true, function() {
          expect(localRequire.defined("test/themeA")).toBe(true);
        });
        var name = "test/abc";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });

      it("should load relative main theme module", function(done) {

        var config = {};
        var requesterRequire = function() {};

        configService.selectAsync.and.returnValue(Promise.resolve({
          main: "./themeA"
        }));

        var onLoad = createOnLoad(done, true, function() {
          expect(moduleUtil.resolveModuleId).toHaveBeenCalledTimes(1);
          expect(moduleUtil.resolveModuleId).toHaveBeenCalledWith("./themeA", "test/abc");

          expect(localRequire.defined("test/themeA")).toBe(true);
        });
        var name = "test/abc";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });

      it("should load the extension theme modules", function(done) {

        var config = {};
        var requesterRequire = function() {};

        configService.selectAsync.and.returnValue(Promise.resolve({
          extensions: ["test/themeB", "test/themeC"]
        }));

        var onLoad = createOnLoad(done, true, function() {
          expect(localRequire.defined("test/themeB")).toBe(true);
          expect(localRequire.defined("test/themeC")).toBe(true);
        });
        var name = "test/abc";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });

      it("should load relative extension theme modules", function(done) {

        var config = {};
        var requesterRequire = function() {};

        configService.selectAsync.and.returnValue(Promise.resolve({
          extensions: ["./themeB", "./themeC"]
        }));

        var onLoad = createOnLoad(done, true, function() {
          expect(moduleUtil.resolveModuleId).toHaveBeenCalledTimes(2);
          expect(moduleUtil.resolveModuleId).toHaveBeenCalledWith("./themeB", "test/abc");
          expect(moduleUtil.resolveModuleId).toHaveBeenCalledWith("./themeC", "test/abc");

          expect(localRequire.defined("test/themeB")).toBe(true);
          expect(localRequire.defined("test/themeC")).toBe(true);
        });
        var name = "test/abc";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });

      it("should load both the main and extension theme modules", function(done) {

        var config = {};
        var requesterRequire = function() {};

        configService.selectAsync.and.returnValue(Promise.resolve({
          main: "test/themeA",
          extensions: ["test/themeB", "test/themeC"]
        }));

        var onLoad = createOnLoad(done, true, function() {
          expect(localRequire.defined("test/themeA")).toBe(true);
          expect(localRequire.defined("test/themeB")).toBe(true);
          expect(localRequire.defined("test/themeC")).toBe(true);
        });
        var name = "test/abc";

        themePlugin.load(name, requesterRequire, onLoad, config);
      });
    });
  });
});
