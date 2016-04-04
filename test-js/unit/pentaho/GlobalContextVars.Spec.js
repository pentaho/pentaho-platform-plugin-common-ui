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
  "pentaho/GlobalContextVars"
], function(GlobalContextVars) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  // These should really be writable, i.e. globalVar: true
  /*global SESSION_NAME:true, active_theme:true, SESSION_LOCALE:true */

  // Use alternate, promise-aware version of `it`.

  describe("pentaho.GlobalContextVars -", function() {

    it("is a function", function() {
      expect(typeof GlobalContextVars).toBe("function");
    });

    describe("new GlobalContextVars(spec) -", function() {

      it("should return a GlobalContextVars instance", function() {
        var vars = new GlobalContextVars();
        expect(vars instanceof GlobalContextVars).toBe(true);
      });

      describe("application -", function() {

        it("should have a null value when unspecified and there is no current one", function() {
          var vars = new GlobalContextVars();
          expect(vars.application).toBe(null);
        });

        it("should have a null value when specified empty", function() {
          var vars = new GlobalContextVars({application: ""});
          expect(vars.application).toBe(null);
        });

        it("should respect a specified non-empty value", function() {
          var vars = new GlobalContextVars({application: "FOO"});
          expect(vars.application).toBe("FOO");
        });
      });

      describe("user -", function() {
        var _SESSION_NAME;

        beforeEach(function() {
          _SESSION_NAME = __global__.SESSION_NAME;
          __global__.SESSION_NAME = undefined;
        });

        afterEach(function() {
          __global__.SESSION_NAME = _SESSION_NAME;
        });

        it("should have a null value when unspecified and there is no current one", function() {
          var vars = new GlobalContextVars();
          expect(vars.user).toBe(null);
        });

        it("should have a null value when specified empty", function() {

          var vars = new GlobalContextVars({user: ""});
          expect(vars.user).toBe(null);
        });

        it("should respect a specified non-empty value", function() {
          var vars = new GlobalContextVars({user: "FOO"});
          expect(vars.user).toBe("FOO");
        });

        it("should default to the existing current one", function() {
          __global__.SESSION_NAME = "ABC";
          var vars = new GlobalContextVars();
          expect(vars.user).toBe("ABC");
        });
      });

      describe("theme -", function() {
        var _active_theme;
        beforeEach(function() {
          _active_theme = __global__.active_theme;
          __global__.active_theme = undefined;
        });

        afterEach(function() {
          __global__.active_theme = _active_theme;
        });

        it("should have a null value when unspecified and there is no current one", function() {
          var vars = new GlobalContextVars();
          expect(vars.theme).toBe(null);
        });

        it("should have a null value when specified empty", function() {
          var vars = new GlobalContextVars({theme: ""});
          expect(vars.theme).toBe(null);
        });

        it("should respect a specified non-empty value", function() {
          var vars = new GlobalContextVars({theme: "FOO"});
          expect(vars.theme).toBe("FOO");
        });

        it("should default to the existing current one", function() {
          __global__.active_theme = "ABC";
          var vars = new GlobalContextVars();
          expect(vars.theme).toBe("ABC");
        });
      });

      describe("locale -", function() {
        var _SESSION_LOCALE;
        beforeEach(function() {
          _SESSION_LOCALE = __global__.SESSION_LOCALE;
          __global__.SESSION_LOCALE = undefined;
        });

        afterEach(function() {
          SESSION_LOCALE = _SESSION_LOCALE;
        });

        it("should have a null value when unspecified and there is no current one", function() {
          var vars = new GlobalContextVars();
          expect(vars.locale).toBe(null);
        });

        it("should have a null value when specified empty", function() {
          var vars = new GlobalContextVars({locale: ""});
          expect(vars.locale).toBe(null);
        });

        it("should respect a specified non-empty value", function() {
          var vars = new GlobalContextVars({locale: "FOO"});
          expect(vars.locale).toBe("FOO");
        });

        it("should default to the existing current one", function() {
          __global__.SESSION_LOCALE = "ABC";
          var vars = new GlobalContextVars();
          expect(vars.locale).toBe("ABC");
        });
      });
    });
  }); // pentaho.GlobalContextVars
});
