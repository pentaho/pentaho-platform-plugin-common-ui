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
  "tests/test-utils"
], function(testUtils) {

  var it = testUtils.itAsync;

  describe("pentaho.service", function() {

    // region helpers
    // Foo1, Foo2 and Bar test modules.
    // IFoo and IBar are test services.
    var foo1 = "Foo 1";
    var foo2 = "Foo 2";
    var bar  = "Bar 1";

    function requireConfig(localRequire) {

      localRequire.define("Foo1", foo1);
      localRequire.define("Foo2", foo2);
      localRequire.define("Bar", bar);

      // Reset current service configuration
      localRequire.config({
        config: {"pentaho/service": null, "pentaho/instanceInfo": null}
      });
    }

    function requireConfigFoo1(localRequire) {

      requireConfig(localRequire);

      localRequire.config({
        config: {
          "pentaho/service": {
            "Foo1": "IFoo"
          }
        }
      });
    }

    function requireConfigFoos(localRequire) {

      requireConfigFoo1(localRequire);

      localRequire.config({
        config: {
          "pentaho/service": {
            "Foo2": "IFoo"
          }
        }
      });
    }

    function requireConfigFoosAndBar(localRequire) {

      requireConfigFoos(localRequire);

      localRequire.config({
        config: {
          "pentaho/service": {
            "Bar": "IBar"
          }
        }
      });
    }
    // endregion

    it("is defined", function() {
      return require.using(["pentaho/service"], function(singletonService) {
        expect(singletonService).toBeTruthy();
        expect(typeof singletonService).toBe("object");
      });
    });

    it("has a 'load' method", function() {
      return require.using(["pentaho/service"], function(singletonService) {
        expect(typeof singletonService.load).toBe("function");
      });
    });

    it("has a 'normalize' method", function() {
      return require.using(["pentaho/service"], function(singletonService) {
        expect(typeof singletonService.normalize).toBe("function");
      });
    });

    describe("resolve with no options", function() {

      it("should resolve a service with no registered providers as an empty array", function() {

        return require.using(["pentaho/service!IGugu"], requireConfigFoo1, function(gugus) {
          expect(gugus instanceof Array).toBe(true);
          expect(gugus.length).toBe(0);
        });
      });

      it("should resolve a service with one registered provider as an array with that registered module", function() {

        return require.using(["pentaho/service!IFoo"], requireConfigFoo1, function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(1);
          expect(foos[0]).toBe(foo1);
        });
      });

      it("should resolve a service with two registered providers as an array with those two registered modules",
      function() {

        return require.using(["pentaho/service!IFoo"], requireConfigFoos, function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(2);
          expect(foos.indexOf(foo1) >= 0).toBe(true);
          expect(foos.indexOf(foo2) >= 0).toBe(true);
        });
      });

      it("should resolve a service to the correct modules even when there are other registered services", function() {

        return require.using(["pentaho/service!IFoo", "pentaho/service!IBar"], requireConfigFoosAndBar,
        function(foos, bars) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(2);
          expect(foos.indexOf(foo1) >= 0).toBe(true);
          expect(foos.indexOf(foo2) >= 0).toBe(true);

          expect(bars instanceof Array).toBe(true);
          expect(bars.length).toBe(1);
          expect(bars[0]).toBe(bar);
        });
      });

      it("should ignore config entries with an empty module id and resolve the logical module as an empty array",
      function() {

        function requireConfigLocal(localRequire) {

          requireConfig(localRequire);

          localRequire.config({
            config: {
              "pentaho/service": {
                "": "IFoo"
              }
            }
          });
        }

        return require.using(["pentaho/service!IFoo"], requireConfigLocal, function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(0);
        });
      });

      it("should ignore config entries with an empty logical module and resolve it as an empty array", function() {

        function requireConfigLocal(localRequire) {

          requireConfig(localRequire);

          localRequire.config({
            config: {
              "pentaho/service": {
                "Foo": ""
              }
            }
          });
        }

        return require.using(["pentaho/service!"], requireConfigLocal, function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(0);
        });
      });
    });

    describe("with meta information", function() {

      it("should keep resolving a service with no registered providers as an empty array", function() {

        return require.using(["pentaho/service!IGugu?meta"], requireConfigFoo1, function(gugus) {
          expect(gugus instanceof Array).toBe(true);
          expect(gugus.length).toBe(0);
        });
      });

      it("should resolve a service with one registered provider as an array with that registered module+meta",
      function() {

        return require.using(["pentaho/service!IFoo?meta"], requireConfigFoo1, function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(1);
          expect(foos[0].moduleId).toBe("Foo1");
          expect(foos[0].value).toBe(foo1);
        });
      });

      it("should resolve a service with two registered providers as an array with those two registered modules+meta",
      function() {

        return require.using(["pentaho/service!IFoo?meta"], requireConfigFoos, function(foos) {
          expect(foos instanceof Array).toBe(true);
          expect(foos.length).toBe(2);

          if(foos[0].moduleId === "Foo1") {
            expect(foos[0].moduleId).toBe("Foo1");
            expect(foos[0].value).toBe(foo1);
            expect(foos[1].moduleId).toBe("Foo2");
            expect(foos[1].value).toBe(foo2);
          } else {
            expect(foos[0].moduleId).toBe("Foo2");
            expect(foos[0].value).toBe(foo2);
            expect(foos[1].moduleId).toBe("Foo1");
            expect(foos[1].value).toBe(foo1);
          }
        });
      });

      it("should resolve a service to the correct modules+meta even when there are other registered services",
      function() {

        return require.using(["pentaho/service!IFoo?meta", "pentaho/service!IBar"], requireConfigFoosAndBar,
            function(foos, bars) {
              expect(foos instanceof Array).toBe(true);
              expect(foos.length).toBe(2);
              if(foos[0].moduleId === "Foo1") {
                expect(foos[0].moduleId).toBe("Foo1");
                expect(foos[0].value).toBe(foo1);
                expect(foos[1].moduleId).toBe("Foo2");
                expect(foos[1].value).toBe(foo2);
              } else {
                expect(foos[0].moduleId).toBe("Foo2");
                expect(foos[0].value).toBe(foo2);
                expect(foos[1].moduleId).toBe("Foo1");
                expect(foos[1].value).toBe(foo1);
              }

              expect(bars instanceof Array).toBe(true);
              expect(bars.length).toBe(1);
              expect(bars[0]).toBe(bar);
            });
      });
    });

    describe("with single option", function() {

      it("should resolve a service with no registered providers as null", function() {

        return require.using(["pentaho/service!IGugu?single"], requireConfigFoo1, function(gugu) {
          expect(gugu).toBeNull();
        });
      });

      it("should resolve a service with one registered provider with that registered module", function() {

        return require.using(["pentaho/service!IFoo?single"], requireConfigFoo1, function(foo) {
          expect(foo).toBe(foo1);
        });
      });

      it("should resolve a service with two registered providers with one of those two registered modules", function() {

        return require.using(["pentaho/service!IFoo?single"], requireConfigFoos, function(foo) {
          expect([foo1, foo2]).toContain(foo);
        });
      });
    });

    describe("with ids option", function() {

      it("should resolve a service with one registered provider with that registered module's id", function() {

        return require.using(["pentaho/service!IFoo?ids"], requireConfigFoo1, function(foos) {
          expect(foos.length).toBe(1);
          expect(foos[0]).toBe("Foo1");
        });
      });

      it("should resolve a service with two registered providers with both the registered modules' ids", function() {

        return require.using(["pentaho/service!IFoo?ids"], requireConfigFoos, function(foos) {
          expect(foos.length).toBe(2);
          expect(foos).toContain("Foo1");
          expect(foos).toContain("Foo2");
        });
      });

      describe("with single", function() {
        it("should resolve a service with two registered providers with the id of one of those registered modules",
        function() {

          return require.using(["pentaho/service!IFoo?ids&single"], requireConfigFoos, function(foo) {

            expect(["Foo1", "Foo2"]).toContain(foo);
          });
        });
      });
    });

    describe("options handling", function() {
      it("should be independent of the order", function() {

        return require.using(["pentaho/service"], function(singletonService) {

          expect(singletonService.normalize("Foo?a=1&b=2&c=3")).toBe(singletonService.normalize("Foo?c=3&b=2&a=1"));
        });
      });

      it("should be overwrite repeated options", function() {

        return require.using(["pentaho/service"], function(singletonService) {

          expect(singletonService.normalize("Foo?a=1&a=2")).toBe(singletonService.normalize("Foo?a=2"));
        });
      });

      it("should ignore query string if no options", function() {
        return require.using(["pentaho/service"], function(singletonService) {

          expect(singletonService.normalize("Foo?")).toBe(singletonService.normalize("Foo"));
          expect(singletonService.normalize("Foo?&&&&")).toBe(singletonService.normalize("Foo"));
        });
      });
    });

    describe("build environment", function() {
      it("should call the onLoad callback synchronously, without args, when load is called in a build", function() {

        return require.using(["pentaho/service"], function(singletonService) {
          var onLoad = jasmine.createSpy();
          var config = {isBuild: true};

          singletonService.load("foo", require, onLoad, config);

          expect(onLoad).toHaveBeenCalled();

          expect(onLoad).toHaveBeenCalledWith();
        });
      });
    });
  });
});
