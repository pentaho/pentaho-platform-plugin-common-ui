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
define(["common-ui/vizapi/vizTypeRegistry"], function(singletonVizTypeRegistry) {
  var VizTypeRegistry = singletonVizTypeRegistry && singletonVizTypeRegistry.constructor;

  describe("VizTypeRegistry class -", function() {
    it("is defined", function() {
      expect(typeof VizTypeRegistry).toBe("function");
    });

    describe("#new() -", function() {
      var vizTypeRegistry;

      beforeEach(function() {
        vizTypeRegistry = new VizTypeRegistry();
      });

      it("should return an instance of VizTypeRegistry", function() {
        expect(vizTypeRegistry instanceof VizTypeRegistry).toBe(true);
      });

      it("#getAll() should return an empty array", function() {
        var vizTypes = vizTypeRegistry.getAll();
        expect(vizTypes instanceof Array).toBe(true);
        expect(vizTypes.length).toBe(0);
      });
    });

    describe("#add(.) -", function() {
      var vizTypeRegistry;

      beforeEach(function() {
        vizTypeRegistry = new VizTypeRegistry();
      });

      it("should throw an error when given no argument or a nully argument", function() {
        expect(function() {
          vizTypeRegistry.add();
        }).toThrow();

        expect(function() {
          vizTypeRegistry.add(null);
        }).toThrow();

        expect(function() {
          vizTypeRegistry.add(undefined);
        }).toThrow();
      });

      it("should add the viztype, if its `id` does is not yet defined", function() {
        var vizType = {
          id: "foo"
        };
        vizTypeRegistry.add(vizType);

        var vizTypeGet = vizTypeRegistry.get("foo");
        expect(vizTypeGet).toBe(vizType);
      });

      it("should do nothing if the same viztype is re-added", function() {
        var vizType = {
          id: "foo"
        };
        vizTypeRegistry.add(vizType);
        vizTypeRegistry.add(vizType);

        expect(vizTypeRegistry.getAll().length).toBe(1);
      });

      it("should throw if its `id` is already defined", function() {
        var vizType = {
          id: "foo"
        };
        vizTypeRegistry.add(vizType);

        expect(function() {
          vizTypeRegistry.add({
            id: "foo"
          });
        }).toThrow();
      });

      it("should return `this`", function() {
        var result = vizTypeRegistry.add({id: "foo"});

        expect(result).toBe(vizTypeRegistry);
      });
    });

    describe("#getAll() -", function() {
      var vizTypeRegistry,
          vizTypeList = [
            {id: "A"},
            {id: "B"},
            {id: "C"}
          ];

      beforeEach(function() {
        vizTypeRegistry = new VizTypeRegistry();

        vizTypeRegistry.add(vizTypeList[0]);
        vizTypeRegistry.add(vizTypeList[1]);
        vizTypeRegistry.add(vizTypeList[2]);
      });

      it("should return all of the registered viztypes, in order", function() {
        var vizTypes = vizTypeRegistry.getAll();

        expect(vizTypes instanceof Array).toBe(true);

        expect(vizTypes.length).toBe(3);

        expect(vizTypes[0]).toBe(vizTypeList[0]);
        expect(vizTypes[1]).toBe(vizTypeList[1]);
        expect(vizTypes[2]).toBe(vizTypeList[2]);
      });
    });

    describe("#get() -", function() {
      var vizTypeRegistry,
          vizTypeList = [
            {id: "A"},
            {id: "B"},
            {id: "C"}
          ];

      beforeEach(function() {
        vizTypeRegistry = new VizTypeRegistry();

        vizTypeRegistry.add(vizTypeList[0]);
        vizTypeRegistry.add(vizTypeList[1]);
        vizTypeRegistry.add(vizTypeList[2]);
      });

      it("should return a registered viztype when given its id", function() {
        expect(vizTypeRegistry.get("A")).toBe(vizTypeList[0]);
        expect(vizTypeRegistry.get("B")).toBe(vizTypeList[1]);
        expect(vizTypeRegistry.get("C")).toBe(vizTypeList[2]);
      });

      it("should return null, when given a missing viztype `id`", function() {
        expect(vizTypeRegistry.get("F")).toBeNull();
      });
    });
  });

  describe("vizTypeRegistry -", function() {
    it("is defined", function() {
      expect(singletonVizTypeRegistry).toBeTruthy();
      expect(singletonVizTypeRegistry instanceof VizTypeRegistry).toBe(true);
    });

    describe("pre-loaded viztypes", function() {
      beforeEach(function() {
        requirejs.undef("common-ui/vizapi/vizTypeRegistry");
        requirejs.undef("service!IVizTypeProvider");
        requirejs.undef("service");

        requirejs.undef("foo");
        requirejs.undef("bar");
      });

      it("should be pre-loaded with viztypes obtained from all registered 'IVizTypeProvider' services", function(done) {
        var vizTypeA = {id: "A"},
            vizTypeB = {id: "B"},
            vizTypeC = {id: "C"},
            vizTypeD = {id: "D"},
            vizTypeE = {id: "E"},
            vizTypeF = {id: "F"},
            fooModule = {
              getAll: function() {
                return [vizTypeA, vizTypeB, vizTypeC];
              }
            },
            barModule = {
              getAll: function() {
                return [vizTypeD, vizTypeE, vizTypeF];
              }
            };

        define("foo", fooModule);
        define("bar", barModule);

        // Reset current service configuration
        require.config({
          config: {service: null}
        });

        // Configure foo and bar
        require.config({
          config: {
            service: {
              "foo": "IVizTypeProvider",
              "bar": "IVizTypeProvider"
            }
          }
        });

        require(["common-ui/vizapi/vizTypeRegistry"], function(vizTypeRegistry) {
          var vizTypes = vizTypeRegistry.getAll();

          expect(vizTypes.length).toBe(6);

          done();
        });
      });

    });
  });
});
