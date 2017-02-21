/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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
  "pentaho/context/impl/Context"
], function(Context) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.context.impl.Context -", function() {

    var contextSpec = {
      application: "APP-1",
      theme: "THEME-1",
      locale: "LOCALE-1",
      user: {
        id:   "USER-1",
        home: "USER-HOME-1"
      },
      reservedChars: "RESERVED-CHARS-1",
      server: {
        url: "http://host:8888/path-1"
      }
    };

    var emptyContextSpec = {
      application: "",
      theme: "",
      locale: "",
      user: {
        id:   "",
        home: ""
      },
      reservedChars: "",
      server: {
        url: ""
      }
    };

    var nullContextSpec = {
      application: null,
      theme: null,
      locale: null,
      user: {
        id:   null,
        home: null
      },
      reservedChars: null,
      server: {
        url: null
      }
    };

    var defaultContextSpec = {
      application: "APP",
      theme: "THEME",
      locale: "LOCALE",
      user: {
        id:   "USER",
        home: "USER-HOME"
      },
      reservedChars: "RESERVED-CHARS",
      server: {
        url: "http://host:8888/path-2"
      }
    };

    function expectContextAndSpec(context, contextSpec) {
      expect(context.application).toBe(contextSpec.application);
      expect(context.theme).toBe(contextSpec.theme);
      expect(context.locale).toBe(contextSpec.locale);

      expect(context.user.id).toBe(contextSpec.user.id);
      expect(context.user.home).toBe(contextSpec.user.home);

      expect(context.server.url.href).toBe(contextSpec.server.url);

      expect(context.reservedChars).toBe(contextSpec.reservedChars);
    }

    function expectContextNullValues(context) {
      expect(context.application).toBe(null);
      expect(context.theme).toBe(null);
      expect(context.locale).toBe(null);

      expect(context.user.id).toBe(null);
      expect(context.user.home).toBe(null);

      expect(context.server.url).toBe(null);

      expect(context.reservedChars).toBe(null);
    }

    it("is a function", function() {
      expect(typeof Context).toBe("function");
    });

    describe("new Context(spec, [defaultSpec]) -", function() {

      it("should return a Context instance", function() {

        var context = new Context();
        expect(context instanceof Context).toBe(true);
      });

      it("should default properties to the default value specified", function() {

        var context = new Context(null, defaultContextSpec);

        expectContextAndSpec(context, defaultContextSpec);
      });

      it("should default properties to null when defaultSpec is not specified", function() {

        var context = new Context();

        expectContextNullValues(context);
      });

      it("should default properties to null when defaultSpec contains empty values", function() {

        var context = new Context(emptyContextSpec);

        expectContextNullValues(context);
      });

      it("should set properties to the value specified", function() {

        var context = new Context(contextSpec, defaultContextSpec);

        expectContextAndSpec(context, contextSpec);

        context = new Context(contextSpec);

        expectContextAndSpec(context, contextSpec);
      });
    });

    describe("#toSpec()", function() {

      it("should return an object with the same values", function() {
        var context = new Context(contextSpec);

        expect(context.toSpec()).toEqual(contextSpec);

        context = new Context();

        expect(context.toSpec()).toEqual(nullContextSpec);
      });

      it("should be the same method as toJSON", function() {
        var context = new Context();

        expect(context.toSpec).toBe(context.toJSON);
      });
    });

    describe("#createChild(childSpec)", function() {

      it("should return an instance of Context", function() {
        var context = new Context(contextSpec);
        var childContext = context.createChild();
        expect(childContext instanceof Context).toBe(true);
      });

      it("should be a different instance", function() {
        var context = new Context(contextSpec);
        var childContext = context.createChild();
        expect(childContext).not.toBe(context);
      });

      it("should have the same information as the parent when no spec is specified", function() {
        var context = new Context(contextSpec);
        var childContext = context.createChild();
        expect(childContext.toSpec()).toEqual(contextSpec);
      });

      it("should override the information specified in childSpec", function() {
        var context = new Context(defaultContextSpec);
        var childContext = context.createChild(contextSpec);
        expect(childContext.toSpec()).toEqual(contextSpec);
      });
    });
  }); // pentaho.context.impl.Context
});
