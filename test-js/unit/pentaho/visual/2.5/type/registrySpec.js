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
define(["pentaho/visual/type/registry"], function(singletonTypeRegistry) {
  var TypeRegistry = singletonTypeRegistry && singletonTypeRegistry.constructor;

  describe("TypeRegistry class -", function() {
    it("is defined", function() {
      expect(typeof TypeRegistry).toBe("function");
    });

    describe("#new() -", function() {
      var typeRegistry;

      beforeEach(function() {
        typeRegistry = new TypeRegistry();
      });

      it("should return an instance of TypeRegistry", function() {
        expect(typeRegistry instanceof TypeRegistry).toBe(true);
      });

      it("#getAll() should return an empty array", function() {
        var types = typeRegistry.getAll();
        expect(types instanceof Array).toBe(true);
        expect(types.length).toBe(0);
      });
    });

    describe("#add(.) -", function() {
      var typeRegistry;

      beforeEach(function() {
        typeRegistry = new TypeRegistry();
      });

      it("should throw an error when given no argument or a nully argument", function() {
        expect(function() {
          typeRegistry.add();
        }).toThrow();

        expect(function() {
          typeRegistry.add(null);
        }).toThrow();

        expect(function() {
          typeRegistry.add(undefined);
        }).toThrow();
      });

      it("should add the visualType, if its `id` is not yet defined", function() {
        var type = {
          id: "foo"
        };
        typeRegistry.add(type);

        var typeGet = typeRegistry.get("foo");
        expect(typeGet).toBe(type);
      });

      it("should do nothing if the same visualType is re-added", function() {
        var type = {
          id: "foo"
        };
        typeRegistry.add(type);
        typeRegistry.add(type);

        expect(typeRegistry.getAll().length).toBe(1);
      });

      it("should throw if its `id` is already defined", function() {
        var type = {
          id: "foo"
        };
        typeRegistry.add(type);

        expect(function() {
          typeRegistry.add({
            id: "foo"
          });
        }).toThrow();
      });

      it("should return `this`", function() {
        var result = typeRegistry.add({id: "foo"});

        expect(result).toBe(typeRegistry);
      });
    });

    describe("#getAll() -", function() {
      var typeRegistry,
          typeList = [
            {id: "A"},
            {id: "B"},
            {id: "C"}
          ];

      beforeEach(function() {
        typeRegistry = new TypeRegistry();

        typeRegistry.add(typeList[0]);
        typeRegistry.add(typeList[1]);
        typeRegistry.add(typeList[2]);
      });

      it("should return all of the registered visualtypes, in order", function() {
        var types = typeRegistry.getAll();

        expect(types instanceof Array).toBe(true);

        expect(types.length).toBe(3);

        expect(types[0]).toBe(typeList[0]);
        expect(types[1]).toBe(typeList[1]);
        expect(types[2]).toBe(typeList[2]);
      });
    });

    describe("#get() -", function() {
      var typeRegistry,
          typeList = [
            {id: "A"},
            {id: "B"},
            {id: "C"}
          ];

      beforeEach(function() {
        typeRegistry = new TypeRegistry();

        typeRegistry.add(typeList[0]);
        typeRegistry.add(typeList[1]);
        typeRegistry.add(typeList[2]);
      });

      it("should return a registered visualtype when given its id", function() {
        expect(typeRegistry.get("A")).toBe(typeList[0]);
        expect(typeRegistry.get("B")).toBe(typeList[1]);
        expect(typeRegistry.get("C")).toBe(typeList[2]);
      });

      it("should return null, when given a missing visualtype `id`", function() {
        expect(typeRegistry.get("F")).toBeNull();
      });
    });
  });

  describe("typeRegistry -", function() {
    it("is defined", function() {
      expect(singletonTypeRegistry).toBeTruthy();
      expect(singletonTypeRegistry instanceof TypeRegistry).toBe(true);
    });

    describe("pre-loaded visualtypes", function() {
      beforeEach(function() {
        requirejs.undef("pentaho/visual/type/registry");
        requirejs.undef("pentaho/service!IVisualTypeProvider");
        requirejs.undef("pentaho/service!IVisualApiConfiguration");
        requirejs.undef("pentaho/service");

        requirejs.undef("foo");
        requirejs.undef("bar");
      });

      it("should be pre-loaded with visualTypes obtained from all registered 'IVisualTypeProvider' services", function(done) {
        var typeA = {id: "A"},
            typeB = {id: "B"},
            typeC = {id: "C"},
            typeD = {id: "D"},
            typeE = {id: "E"},
            typeF = {id: "F"},
            fooModule = {
              getAll: function() {
                return [typeA, typeB, typeC];
              }
            },
            barModule = {
              getAll: function() {
                return [typeD, typeE, typeF];
              }
            };

        define("foo", fooModule);
        define("bar", barModule);

        // Reset current service configuration
        require.config({
          config: {"pentaho/service": null}
        });

        // Configure foo and bar
        require.config({
          config: {
            "pentaho/service": {
              "foo": "IVisualTypeProvider",
              "bar": "IVisualTypeProvider"
            }
          }
        });

        require(["pentaho/visual/type/registry"], function(typeRegistry) {
          var types = typeRegistry.getAll();

          expect(types.length).toBe(6);

          done();
        });
      });

    });
  });
});
