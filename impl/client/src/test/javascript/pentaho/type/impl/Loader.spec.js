/*!
 * Copyright 2018 Hitachi Vantara.  All rights reserved.
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
define(function() {

  "use strict";

  describe("pentaho.type.impl.Loader", function() {

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();
    });

    function getLoaderAsync(otherDeps) {

      var deps = [
        "pentaho/type/impl/Loader",

        "tests/pentaho/util/errorMatch",

        // These need to be loaded for proper use of a loader instance...
        "pentaho/type/Instance",
        "pentaho/type/Complex",
        "pentaho/type/String",
        "pentaho/type/Boolean",
        "pentaho/type/Number"
      ];

      if(otherDeps) {
        deps.push.apply(deps, otherDeps);
      }

      return localRequire.promise(deps).then(function(values) {
        var Loader = values[0];
        return new Loader();
      });
    }

    function getErrorMatch() {
      return localRequire("tests/pentaho/util/errorMatch");
    }

    function createSpecificationScope() {
      var SpecificationScope = localRequire("pentaho/type/SpecificationScope");
      return new SpecificationScope();
    }

    afterEach(function() {
      localRequire.dispose();
    });

    describe("#resolveType(typeRef, {defaultBase})", function() {

      describe("when `typeRef` is a string - a type identifier or alias", function() {

        it("should throw if the given id is not that of a defined module", function() {

          return getLoaderAsync().then(function(loader) {

            expect(function() {
              loader.resolveType("test/Missing");
            }).toThrow({
              asymmetricMatch: function(error) {
                return error instanceof Error && error.message.indexOf("test/Missing") >= 0;
              }
            });
          });
        });

        it("should throw if the given id exists but hasn't been loaded yet", function() {

          var ExistingYetUnloaded;

          localRequire.define("test/ExistingYetUnloaded", ["pentaho/type/Value"], function(Value) {

            return ExistingYetUnloaded = Value.extend();
          });

          return getLoaderAsync().then(function(loader) {

            expect(function() {
              loader.resolveType("test/ExistingYetUnloaded");
            }).toThrow({
              asymmetricMatch: function(error) {
                return error instanceof Error && error.message.indexOf("test/ExistingYetUnloaded") >= 0;
              }
            });
          });
        });

        it("should resolve an already loaded type given its id", function() {

          var ExistingAndLoaded;

          localRequire.define("test/ExistingAndLoaded", ["pentaho/type/Value"], function(Value) {
            return ExistingAndLoaded = Value.extend();
          });

          return getLoaderAsync(["test/ExistingAndLoaded"]).then(function(loader) {

            var result = loader.resolveType("test/ExistingAndLoaded");

            expect(result).toBe(ExistingAndLoaded);
          });
        });

        it("should resolve an already loaded type given its alias", function() {

          localRequire.config({
            config: {
              "pentaho/modules": {
                "test/ExistingAndLoaded": {base: null, alias: "testAlias1"}
              }
            }
          });

          var ExistingAndLoaded;

          localRequire.define("test/ExistingAndLoaded", ["pentaho/type/Value"], function(Value) {
            return ExistingAndLoaded = Value.extend();
          });

          return getLoaderAsync(["test/ExistingAndLoaded"]).then(function(loader) {

            var result = loader.resolveType("testAlias1");

            expect(result).toBe(ExistingAndLoaded);
          });
        });

        describe("temporary ids", function() {

          it("should throw if the given id is temporary and there is no specification context", function() {

            return getLoaderAsync().then(function(loader) {

              expect(function() {
                loader.resolveType("_:1");
              }).toThrow(getErrorMatch().argInvalid("typeRef"));
            });
          });

          it("should throw if the given id is temporary and is not defined in " +
            "the current specification context", function() {

            return getLoaderAsync().then(function(loader) {

              var specScope = createSpecificationScope();

              expect(function() {
                loader.resolveType("_:1");
              }).toThrow(getErrorMatch().argInvalid("typeRef"));

              specScope.dispose();
            });
          });

          it("should resolve a temporary id defined in the current specification context", function() {

            return getLoaderAsync().then(function(loader) {

              var CustomInstanceCtor = function() {};
              var customType = {uid: "a", instance: new CustomInstanceCtor()};

              var specScope = createSpecificationScope();
              var tempId = specScope.specContext.add(customType);
              var result = loader.resolveType(tempId);

              expect(result).toBe(CustomInstanceCtor);

              specScope.dispose();
            });
          });
        });
      });

      describe("when `typeRef` is an Instance-derived constructor", function() {

        it("should be able to resolve an Instance constructor", function() {

          var InstanceCtor;

          localRequire.define("test/InstanceCtor", ["pentaho/type/Instance"], function(Instance) {

            InstanceCtor = Instance.extend({
              $type: {id: "test/InstanceCtor"}
            });

            return InstanceCtor;
          });

          return getLoaderAsync(["test/InstanceCtor"]).then(function(loader) {

            var result = loader.resolveType(InstanceCtor);

            expect(result).toBe(InstanceCtor);
          });
        });
      });

      describe("when `typeRef` is an instanceof Type", function() {

        it("should be able to resolve to the corresponding Instance constructor", function() {

          var InstanceCtor;

          localRequire.define("test/InstanceCtor", ["pentaho/type/Instance"], function(Instance) {

            InstanceCtor = Instance.extend({
              $type: {id: "test/InstanceCtor"}
            });

            return InstanceCtor;
          });

          return getLoaderAsync(["test/InstanceCtor"]).then(function(loader) {

            var result = loader.resolveType(InstanceCtor.type);

            expect(result).toBe(InstanceCtor);
          });
        });
      });

      describe("when `typeRef` is a plain Object specification", function() {

        describe("when `typeRef.id` is specified", function() {

          it("should throw if it is a permanent id", function() {

            var InstanceCtor;

            localRequire.define("test/PermanentId", ["pentaho/type/Instance"], function(Instance) {

              InstanceCtor = Instance.extend({
                $type: {id: "test/PermanentId"}
              });

              return InstanceCtor;
            });

            return getLoaderAsync(["test/PermanentId"]).then(function(loader) {

              var spec = {id: "test/PermanentId"};
              expect(function() {
                loader.resolveType(spec);
              }).toThrow(getErrorMatch().argInvalid("typeRef"));
            });
          });

          it("should throw if it is a temporary id which is already defined in " +
            "the current specification context", function() {

            return getLoaderAsync().then(function(loader) {

              var CustomInstanceCtor = function() {};
              var customType = {uid: "a", instance: new CustomInstanceCtor()};

              var specScope = createSpecificationScope();
              var tempId = specScope.specContext.add(customType);

              var spec = {id: tempId};
              expect(function() {
                loader.resolveType(spec);
              }).toThrow(getErrorMatch().argInvalid("typeRef"));

              specScope.dispose();
            });
          });

          // Because we do not (yet?) support recursive types, this is not useful, though...
          it("should accept a top-level temporary id (there is no specification context)", function() {

            return getLoaderAsync().then(function(loader) {

              var spec = {id: "_:1"};
              var result = loader.resolveType(spec);
              expect(typeof result).toBe("function");
            });
          });
        });

        describe("when `typeRef.base` is not specified", function() {

          describe("when `keyArgs.defaultBase` is specified", function() {

            it("should resolve the provided defaultBase and use it as base type", function() {

              return getLoaderAsync().then(function(loader) {

                var Simple = loader.resolveType("pentaho/type/Simple");

                spyOn(loader.constructor, "__resolveTypeSync").and.callThrough();

                var spec = {cast: String};

                var InstCtor = loader.resolveType(spec, {defaultBase: Simple});

                expect(InstCtor.type.ancestor).toBe(Simple.type);

                expect(loader.constructor.__resolveTypeSync).toHaveBeenCalledWith(Simple);
              });
            });
          });

          describe("when `keyArgs.defaultBase` is not specified", function() {

            it("should use 'Complex' as base type", function() {

              return getLoaderAsync().then(function(loader) {

                var Complex = loader.resolveType("pentaho/type/Complex");

                var spec = {};

                var InstCtor = loader.resolveType(spec);

                expect(InstCtor.type.ancestor).toBe(Complex.type);
              });
            });
          });
        });

        describe("when `typeRef.base` is specified", function() {

          it("should resolve the specified base type", function() {

            var ExistingAndLoaded;

            localRequire.define("test/ExistingAndLoaded", ["pentaho/type/Value"], function(Value) {
              return ExistingAndLoaded = Value.extend();
            });

            return getLoaderAsync(["test/ExistingAndLoaded"]).then(function(loader) {

              var BaseCtor = loader.resolveType("test/ExistingAndLoaded");

              spyOn(loader.constructor, "__resolveTypeSync").and.callThrough();

              var spec = {base: "test/ExistingAndLoaded"};

              var InstCtor = loader.resolveType(spec);

              expect(InstCtor.type.ancestor).toBe(BaseCtor.type);

              expect(loader.constructor.__resolveTypeSync).toHaveBeenCalledWith("test/ExistingAndLoaded");
            });
          });
        });

        it("should be possible to create a type derived from 'Complex'", function() {

          return getLoaderAsync().then(function(loader) {

            var Complex = loader.resolveType("pentaho/type/Complex");

            var spec = {base: Complex, props: ["a", "b"]};

            var InstCtor = loader.resolveType(spec);

            expect(InstCtor.type.ancestor).toBe(Complex.type);
            expect(InstCtor.type.has("a")).toBe(true);
            expect(InstCtor.type.has("b")).toBe(true);
          });
        });

        it("should be possible to create a type derived from 'List'", function() {

          return getLoaderAsync().then(function(loader) {

            var List = loader.resolveType("pentaho/type/List");
            var PentahoBoolean = loader.resolveType("pentaho/type/Boolean");

            var spec = {base: List, of: PentahoBoolean};

            var InstCtor = loader.resolveType(spec);

            expect(InstCtor.type.ancestor).toBe(List.type);
            expect(InstCtor.type.elementType).toBe(PentahoBoolean.type);
          });
        });

        describe("temporary ids", function() {

          it("should allow creating a type that contains a temporary type id", function() {

            return getLoaderAsync().then(function(loader) {

              var spec = {
                props: [
                  {name: "a", valueType: {id: "_:ab1", base: "number", label: "My Number"}},
                  {name: "b", valueType: "_:ab1"}
                ]
              };

              var InstCtor = loader.resolveType(spec);

              var type = InstCtor.type;
              var myNumberType = type.get("a").valueType;

              expect(myNumberType.ancestor.shortId).toBe("number");
              expect(myNumberType.label).toBe("My Number");

              expect(type.get("b").valueType).toBe(myNumberType);
            });
          });

          it("should use the same type instance for all temporary type id references", function() {

            return getLoaderAsync().then(function(loader) {

              var spec = {
                props: [
                  {name: "a", valueType: {id: "_:1", base: "number", label: "My Number"}},
                  {name: "b", valueType: "_:1"}
                ]
              };

              var InstCtor = loader.resolveType(spec);

              var type = InstCtor.type;

              expect(type.get("a").valueType).toBe(type.get("b").valueType);
            });
          });

          it("should throw if two generic type specifications have the same temporary id", function() {

            return getLoaderAsync().then(function(loader) {

              var spec = {
                props: [
                  {name: "a", valueType: {id: "_:1", base: "string"}},
                  {name: "b", valueType: {id: "_:1", base: "number"}}
                ]
              };

              expect(function() {
                loader.resolveType(spec);
              }).toThrow(getErrorMatch().argInvalid("typeRef"));
            });
          });
        });
      });

      describe("when `typeRef` is an Array", function() {

        it("should be possible to define a list type using list short-hand notation", function() {

          return getLoaderAsync().then(function(loader) {

            var List = loader.resolveType("pentaho/type/List");
            var PentahoBoolean = loader.resolveType("pentaho/type/Boolean");

            var spec = [PentahoBoolean];

            var InstCtor = loader.resolveType(spec);

            expect(InstCtor.type.ancestor).toBe(List.type);
            expect(InstCtor.type.elementType).toBe(PentahoBoolean.type);
          });
        });

        it("should throw if the array does not have exactly one entry", function() {

          return getLoaderAsync().then(function(loader) {

            var PentahoBoolean = loader.resolveType("pentaho/type/Boolean");

            var spec = [PentahoBoolean, PentahoBoolean];

            expect(function() {
              loader.resolveType(spec);
            }).toThrow(getErrorMatch().argInvalid("typeRef"));
          });
        });
      });

      describe("when `typeRef` is ...", function() {

        it("should throw if it is a Type constructor", function() {

          var InstanceCtor;

          localRequire.define("test/InstanceCtor", ["pentaho/type/Instance"], function(Instance) {

            InstanceCtor = Instance.extend({
              $type: {id: "test/InstanceCtor"}
            });

            return InstanceCtor;
          });

          return getLoaderAsync(["test/InstanceCtor"]).then(function(loader) {

            expect(function() {
              loader.resolveType(InstanceCtor.type.constructor);
            }).toThrow(getErrorMatch().argInvalid("typeRef"));
          });
        });

        it("should throw if it is some other function", function() {

          function NormalCtor() {
          }

          return getLoaderAsync().then(function(loader) {

            expect(function() {
              loader.resolveType(NormalCtor);
            }).toThrow(getErrorMatch().argInvalid("typeRef"));
          });
        });

        it("should throw if it is null", function() {

          return getLoaderAsync().then(function(loader) {

            expect(function() {
              loader.resolveType(null);
            }).toThrow(getErrorMatch().argRequired("typeRef"));
          });
        });

        it("should throw if it is undefined", function() {

          return getLoaderAsync().then(function(loader) {

            expect(function() {
              loader.resolveType(undefined);
            }).toThrow(getErrorMatch().argRequired("typeRef"));
          });
        });

        it("should throw if it is ''", function() {

          return getLoaderAsync().then(function(loader) {

            expect(function() {
              loader.resolveType("");
            }).toThrow(getErrorMatch().argRequired("typeRef"));
          });
        });

        it("should throw if given an Instance prototype", function() {

          return getLoaderAsync().then(function(loader) {
            var Value = localRequire("pentaho/type/Value");
            expect(function() {
              loader.resolveType(Value.prototype);
            }).toThrow(getErrorMatch().argInvalid("typeRef"));
          });
        });

        it("should throw if not given a function, string or object", function() {

          return getLoaderAsync().then(function(loader) {
            expect(function() {
              loader.resolveType(1);
            }).toThrow(getErrorMatch().argInvalid("typeRef"));
          });
        });

        it("should throw if the module's value is not an Instance-derived constructor", function() {

          function NotAnInstanceCtor() {
          }

          localRequire.define("test/NotAnInstanceCtor", function() {
            return NotAnInstanceCtor;
          });

          return getLoaderAsync(["test/NotAnInstanceCtor"]).then(function(loader) {
            expect(function() {
              loader.resolveType("test/NotAnInstanceCtor");
            }).toThrow(getErrorMatch().operInvalid());
          });
        });
      });
    });

    describe("#resolveTypeAsync(typeRef, {defaultBase})", function() {

      describe("when `typeRef` is a type identifier or alias", function() {

        it("should reject if typeRef is not the id or alias of a defined module", function() {

          return getLoaderAsync()
            .then(function(loader) {

              return loader.resolveTypeAsync("test/Missing");
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(error) {
              expect(error instanceof Error).toBe(true);
              expect(error.message).toContain("test/Missing");
            });
        });

        it("should be able to load an existing module that hasn't been loaded yet, given its id", function() {

          var ExistingYetUnloaded;

          localRequire.define("test/ExistingYetUnloaded", ["pentaho/type/Value"], function(Value) {
            return ExistingYetUnloaded = Value.extend();
          });

          return getLoaderAsync()
            .then(function(loader) {
              return loader.resolveTypeAsync("test/ExistingYetUnloaded");
            })
            .then(function(result) {
              expect(result).toBe(ExistingYetUnloaded);
            });
        });

        it("should be able to load an existing module that hasn't been loaded yet, given its alias", function() {

          localRequire.config({
            config: {
              "pentaho/modules": {
                "test/ExistingYetUnloaded": {base: null, alias: "testAlias1"}
              }
            }
          });

          var ExistingYetUnloaded;

          localRequire.define("test/ExistingYetUnloaded", ["pentaho/type/Value"], function(Value) {
            return ExistingYetUnloaded = Value.extend();
          });

          return getLoaderAsync()
            .then(function(loader) {
              return loader.resolveTypeAsync("testAlias1");
            })
            .then(function(result) {
              expect(result).toBe(ExistingYetUnloaded);
            });
        });

        it("should be able to load an already loaded type, given its id", function() {

          var ExistingAndLoaded;

          localRequire.define("test/ExistingAndLoaded", ["pentaho/type/Value"], function(Value) {
            return ExistingAndLoaded = Value.extend();
          });

          return getLoaderAsync(["test/ExistingAndLoaded"])
            .then(function(loader) {
              return loader.resolveTypeAsync("test/ExistingAndLoaded");
            })
            .then(function(result) {
              expect(result).toBe(ExistingAndLoaded);
            });
        });

        it("should be able to load an already loaded type, given its alias", function() {

          localRequire.config({
            config: {
              "pentaho/modules": {
                "test/ExistingAndLoaded": {base: null, alias: "testAlias1"}
              }
            }
          });

          var ExistingAndLoaded;

          localRequire.define("test/ExistingAndLoaded", ["pentaho/type/Value"], function(Value) {
            return ExistingAndLoaded = Value.extend();
          });

          return getLoaderAsync(["test/ExistingAndLoaded"])
            .then(function(loader) {
              return loader.resolveTypeAsync("testAlias1");
            })
            .then(function(result) {
              expect(result).toBe(ExistingAndLoaded);
            });
        });

        describe("temporary ids", function() {

          // The temporary ids are evaluated synchronously and only the result is
          // returned asynchronously.

          it("should reject if the given id is temporary and there is no specification context", function() {

            return getLoaderAsync()
              .then(function(loader) {
                return loader.resolveTypeAsync("_:1");
              })
              .then(function() {
                return Promise.reject("Expected to have been rejected.");
              }, function(error) {
                expect(error).toEqual(getErrorMatch().argInvalid("typeRef"));
              });
          });

          it("should reject if the given id is temporary and is not defined in " +
            "the current specification context", function() {

            var specScope;

            return getLoaderAsync()
              .then(function(loader) {

                specScope = createSpecificationScope();

                return loader.resolveTypeAsync("_:1");
              })
              .then(function() {

                specScope.dispose();

                return Promise.reject("Expected to have been rejected.");
              }, function(error) {

                specScope.dispose();

                expect(error).toEqual(getErrorMatch().argInvalid("typeRef"));
              });
          });

          it("should be able to load a temporary id defined in the current specification context", function() {

            var specScope;
            var CustomInstanceCtor;

            return getLoaderAsync()
              .then(function(loader) {

                CustomInstanceCtor = function() {};
                var customType = {uid: "a", instance: new CustomInstanceCtor()};

                specScope = createSpecificationScope();

                var tempId = specScope.specContext.add(customType);

                return loader.resolveTypeAsync(tempId);
              })
              .then(function(result) {

                specScope.dispose();

                expect(result).toBe(CustomInstanceCtor);
              }, function(error) {

                specScope.dispose();

                throw error;
              });
          });
        });
      });

      describe("when `typeRef` is an Instance-derived constructor", function() {

        it("should be able to load an Instance constructor", function() {

          var InstanceCtor;

          localRequire.define("test/InstanceCtor", ["pentaho/type/Instance"], function(Instance) {

            InstanceCtor = Instance.extend({
              $type: {id: "test/InstanceCtor"}
            });

            return InstanceCtor;
          });

          return getLoaderAsync(["test/InstanceCtor"])
            .then(function(loader) {
              return loader.resolveTypeAsync(InstanceCtor);
            })
            .then(function(result) {
              expect(result).toBe(InstanceCtor);
            });
        });
      });

      describe("when `typeRef` is an instanceof Type", function() {

        it("should be able to resolve to the corresponding Instance constructor", function() {

          var InstanceCtor;

          localRequire.define("test/InstanceCtor", ["pentaho/type/Instance"], function(Instance) {

            InstanceCtor = Instance.extend({
              $type: {id: "test/InstanceCtor"}
            });

            return InstanceCtor;
          });

          return getLoaderAsync(["test/InstanceCtor"])
            .then(function(loader) {
              return loader.resolveTypeAsync(InstanceCtor.type);
            })
            .then(function(result) {
              expect(result).toBe(InstanceCtor);
            });
        });
      });

      describe("when `typeRef` is a plain Object specification", function() {

        describe("when `typeRef.id` is specified", function() {

          // Temporary ids are evaluated synchronously and only the result is
          // returned asynchronously.

          it("should reject if it is a permanent id", function() {

            var InstanceCtor;

            localRequire.define("test/PermanentId", ["pentaho/type/Instance"], function(Instance) {

              InstanceCtor = Instance.extend({
                $type: {id: "test/PermanentId"}
              });

              return InstanceCtor;
            });

            return getLoaderAsync(["test/PermanentId"]).then(function(loader) {

              var spec = {id: "test/PermanentId"};
              return loader.resolveTypeAsync(spec);
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(error) {
              expect(error).toEqual(getErrorMatch().argInvalid("typeRef"));
            });
          });

          it("should reject if it is a temporary id which is already defined in " +
            "the current specification context", function() {

            var specScope;

            return getLoaderAsync().then(function(loader) {

              var CustomInstanceCtor = function() {};
              var customType = {uid: "a", instance: new CustomInstanceCtor()};

              specScope = createSpecificationScope();
              var tempId = specScope.specContext.add(customType);

              var spec = {id: tempId};
              return loader.resolveTypeAsync(spec);
            })
            .then(function() {
              specScope.dispose();

              return Promise.reject("Expected to have been rejected.");
            }, function(error) {

              specScope.dispose();

              expect(error).toEqual(getErrorMatch().argInvalid("typeRef"));
            });
          });

          // Because we do not (yet?) support recursive types, this is not useful, though...
          it("should accept a top-level temporary id (there is no specification context)", function() {

            return getLoaderAsync().then(function(loader) {

              var spec = {id: "_:1"};
              return loader.resolveTypeAsync(spec);
            })
            .then(function(result) {
              expect(typeof result).toBe("function");
            });
          });
        });

        describe("when `typeRef.base` is not specified", function() {

          describe("when `keyArgs.defaultBase` is specified", function() {

            it("should resolve the provided defaultBase synchronously and use it as base type", function() {

              var Simple;
              var loader;

              return getLoaderAsync().then(function(_loader) {

                loader = _loader;

                Simple = loader.resolveType("pentaho/type/Simple");

                spyOn(loader.constructor, "__resolveTypeSync").and.callThrough();

                var spec = {cast: String};

                return loader.resolveTypeAsync(spec, {defaultBase: Simple});
              })
              .then(function(InstCtor) {

                expect(InstCtor.type.ancestor).toBe(Simple.type);

                expect(loader.constructor.__resolveTypeSync).toHaveBeenCalledWith(Simple);
              });
            });

            it("should reject if the provided defaultBase has not been loaded yet", function() {

              localRequire.define("test/ExistingYetUnloaded", ["pentaho/type/Value"], function(Value) {

                return Value.extend();
              });

              return getLoaderAsync().then(function(loader) {

                var spec = {};

                return loader.resolveTypeAsync(spec, {defaultBase: "test/ExistingYetUnloaded"});
              })
              .then(function() {
                return Promise.reject("Expected to have been rejected.");
              }, function(error) {
                expect(error).toEqual({
                  asymmetricMatch: function(error) {
                    return error instanceof Error && error.message.indexOf("test/ExistingYetUnloaded") >= 0;
                  }
                });
              });
            });
          });

          describe("when `keyArgs.defaultBase` is not specified", function() {

            it("should use 'Complex' as base type", function() {

              var Complex;

              return getLoaderAsync().then(function(loader) {

                Complex = loader.resolveType("pentaho/type/Complex");

                var spec = {};

                return loader.resolveTypeAsync(spec);
              })
              .then(function(InstCtor) {
                expect(InstCtor.type.ancestor).toBe(Complex.type);
              });
            });
          });
        });

        describe("when `typeRef.base` is specified", function() {

          it("should resolve the specified base type synchronously", function() {

            var loader;
            var ExistingAndLoaded;

            localRequire.define("test/ExistingAndLoaded", ["pentaho/type/Value"], function(Value) {
              return ExistingAndLoaded = Value.extend();
            });

            return getLoaderAsync(["test/ExistingAndLoaded"]).then(function(_loader) {

              loader = _loader;

              loader.resolveType("test/ExistingAndLoaded");

              spyOn(loader.constructor, "__resolveTypeSync").and.callThrough();

              var spec = {base: "test/ExistingAndLoaded"};

              return loader.resolveTypeAsync(spec);
            })
            .then(function(InstCtor) {

              expect(InstCtor.type.ancestor).toBe(ExistingAndLoaded.type);

              expect(loader.constructor.__resolveTypeSync).toHaveBeenCalledWith("test/ExistingAndLoaded");
            });
          });
        });

        it("should be possible to create a type derived from 'Complex'", function() {

          var Complex;

          return getLoaderAsync().then(function(loader) {

            Complex = loader.resolveType("pentaho/type/Complex");

            var spec = {base: Complex, props: ["a", "b"]};

            return loader.resolveTypeAsync(spec);
          })
          .then(function(InstCtor) {

            expect(InstCtor.type.ancestor).toBe(Complex.type);
            expect(InstCtor.type.has("a")).toBe(true);
            expect(InstCtor.type.has("b")).toBe(true);
          });
        });

        it("should be possible to create a type derived from 'List'", function() {

          var List;
          var PentahoBoolean;

          return getLoaderAsync().then(function(loader) {

            List = loader.resolveType("pentaho/type/List");
            PentahoBoolean = loader.resolveType("pentaho/type/Boolean");

            var spec = {base: List, of: PentahoBoolean};

            return loader.resolveTypeAsync(spec);
          })
          .then(function(InstCtor) {

            expect(InstCtor.type.ancestor).toBe(List.type);
            expect(InstCtor.type.elementType).toBe(PentahoBoolean.type);
          });
        });

        describe("temporary ids", function() {

          // Temporary ids are evaluated synchronously and only the result is
          // returned asynchronously.

          it("should allow creating a type that contains a temporary type id", function() {

            return getLoaderAsync().then(function(loader) {

              var spec = {
                props: [
                  {name: "a", valueType: {id: "_:ab1", base: "number", label: "My Number"}},
                  {name: "b", valueType: "_:ab1"}
                ]
              };

              return loader.resolveTypeAsync(spec);
            })
            .then(function(InstCtor) {

              var type = InstCtor.type;
              var myNumberType = type.get("a").valueType;

              expect(myNumberType.ancestor.shortId).toBe("number");
              expect(myNumberType.label).toBe("My Number");

              expect(type.get("b").valueType).toBe(myNumberType);
            });
          });

          it("should use the same type instance for all temporary type id references", function() {

            return getLoaderAsync().then(function(loader) {

              var spec = {
                props: [
                  {name: "a", valueType: {id: "_:1", base: "number", label: "My Number"}},
                  {name: "b", valueType: "_:1"}
                ]
              };

              return loader.resolveTypeAsync(spec);
            })
            .then(function(InstCtor) {

              var type = InstCtor.type;

              expect(type.get("a").valueType).toBe(type.get("b").valueType);
            });
          });

          it("should throw if two generic type specifications have the same temporary id", function() {

            return getLoaderAsync().then(function(loader) {

              var spec = {
                props: [
                  {name: "a", valueType: {id: "_:1", base: "string"}},
                  {name: "b", valueType: {id: "_:1", base: "number"}}
                ]
              };

              return loader.resolveTypeAsync(spec);
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(error) {
              expect(error).toEqual(getErrorMatch().argInvalid("typeRef"));
            });
          });
        });

        it("should collect and resolve all type ids", function() {

          function defineTempModule(mid) {
            localRequire.define(mid, ["pentaho/type/Simple"], function(Simple) {
              return Simple.extend({
                $type: {id: mid}
              });
            });
          }

          function defineTempMixin(mid) {
            localRequire.define(mid, ["pentaho/type/Value"], function(Value) {
              return Value.extend({
                $type: {id: mid}
              });
            });
          }

          function defineTempProp(mid) {
            localRequire.define(mid, ["pentaho/type/Property"], function(Property) {
              return Property.extend({
                $type: {id: mid}
              });
            });
          }

          defineTempModule("pentaho/test/type1");
          defineTempModule("pentaho/test/type2");
          defineTempModule("pentaho/test/type3");
          defineTempModule("pentaho/test/type4");
          defineTempMixin("pentaho/test/mixins/Mixin1");
          defineTempProp("pentaho/test/prop1");

          var loader;

          return getLoaderAsync().then(function(_loader) {

            loader = _loader;

            var spec = {
              base: "complex",
              props: [
                {name: "prop1", valueType: "pentaho/test/type1"},
                {name: "prop2", valueType: {base: "pentaho/test/type2"}},
                {name: "prop3", valueType: {base: "list", of: "pentaho/test/type3"}},
                {name: "prop4", valueType: ["pentaho/test/type3"]},
                {name: "prop5", valueType: {
                  props: {
                    a: {valueType: "pentaho/test/type4"},
                    b: {valueType: "pentaho/test/type3"}
                  }
                }},
                {name: "prop6", valueType: {
                  base: "pentaho/test/type1",
                  mixins: ["pentaho/test/mixins/Mixin1"]
                }},
                {name: "prop7", base: "pentaho/test/prop1", valueType: "string"}
              ]
            };
            return loader.resolveTypeAsync(spec);
          })
          .then(function(InstCtor) {

            var mixin1Type = loader.resolveType("pentaho/test/mixins/Mixin1").type;
            var prop1Type = loader.resolveType("pentaho/test/prop1").type;

            expect(InstCtor.type.get("prop1").valueType.id).toBe("pentaho/test/type1");
            expect(InstCtor.type.get("prop2").valueType.ancestor.id).toBe("pentaho/test/type2");
            expect(InstCtor.type.get("prop3").valueType.elementType.id).toBe("pentaho/test/type3");
            expect(InstCtor.type.get("prop4").valueType.elementType.id).toBe("pentaho/test/type3");
            expect(InstCtor.type.get("prop5").valueType.get("a").valueType.id).toBe("pentaho/test/type4");
            expect(InstCtor.type.get("prop6").valueType.mixins[0]).toBe(mixin1Type);
            expect(InstCtor.type.get("prop7").isSubtypeOf(prop1Type)).toBe(true);
          });
        });
      });

      describe("when `typeRef` is an Array", function() {

        it("should be possible to define a list type using list short-hand notation", function() {

          var List;
          var PentahoBoolean;

          return getLoaderAsync().then(function(loader) {

            List = loader.resolveType("pentaho/type/List");
            PentahoBoolean = loader.resolveType("pentaho/type/Boolean");

            var spec = [PentahoBoolean];

            return loader.resolveTypeAsync(spec);
          })
          .then(function(InstCtor) {

            expect(InstCtor.type.ancestor).toBe(List.type);
            expect(InstCtor.type.elementType).toBe(PentahoBoolean.type);
          });
        });

        it("should throw if the array does not have exactly one entry", function() {

          return getLoaderAsync().then(function(loader) {

            var PentahoBoolean = loader.resolveType("pentaho/type/Boolean");

            var spec = [PentahoBoolean, PentahoBoolean];

            return loader.resolveTypeAsync(spec);
          })
          .then(function() {
            return Promise.reject("Expected to have been rejected.");
          }, function(error) {
            expect(error).toEqual(getErrorMatch().argInvalid("typeRef"));
          });
        });
      });

      describe("when `typeRef` is ...", function() {

        it("should reject if it is a Type constructor", function() {

          var InstanceCtor;

          localRequire.define("test/InstanceCtor", ["pentaho/type/Instance"], function(Instance) {

            InstanceCtor = Instance.extend({
              $type: {id: "test/InstanceCtor"}
            });

            return InstanceCtor;
          });

          return getLoaderAsync(["test/InstanceCtor"])
            .then(function(loader) {
              return loader.resolveTypeAsync(InstanceCtor.type.constructor);
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(result) {
              expect(result).toEqual(getErrorMatch().argInvalid("typeRef"));
            });
        });

        it("should reject if it is some other function", function() {

          function NormalCtor() {
          }

          return getLoaderAsync()
            .then(function(loader) {
              return loader.resolveType(NormalCtor);
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(result) {
              expect(result).toEqual(getErrorMatch().argInvalid("typeRef"));
            });
        });

        it("should reject if it is null", function() {

          return getLoaderAsync()
            .then(function(loader) {
              return loader.resolveType(null);
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(result) {
              expect(result).toEqual(getErrorMatch().argRequired("typeRef"));
            });
        });

        it("should reject if it is undefined", function() {

          return getLoaderAsync()
            .then(function(loader) {
              return loader.resolveType(undefined);
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(result) {
              expect(result).toEqual(getErrorMatch().argRequired("typeRef"));
            });
        });

        it("should reject if it is ''", function() {

          return getLoaderAsync()
            .then(function(loader) {
              return loader.resolveType("");
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(result) {
              expect(result).toEqual(getErrorMatch().argRequired("typeRef"));
            });
        });

        it("should reject if given an Instance prototype", function() {

          return getLoaderAsync()
            .then(function(loader) {
              var Value = localRequire("pentaho/type/Value");

              return loader.resolveType(Value.prototype);
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(result) {
              expect(result).toEqual(getErrorMatch().argInvalid("typeRef"));
            });
        });

        it("should reject if not given a function, string or object", function() {

          return getLoaderAsync()
            .then(function(loader) {
              return loader.resolveType(1);
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(result) {
              expect(result).toEqual(getErrorMatch().argInvalid("typeRef"));
            });
        });

        it("should reject if the module's value is not an Instance-derived constructor", function() {

          function NotAnInstanceCtor() {
          }

          localRequire.define("test/NotAnInstanceCtor", function() {
            return NotAnInstanceCtor;
          });

          return getLoaderAsync(["test/NotAnInstanceCtor"])
            .then(function(loader) {
              return loader.resolveType("test/NotAnInstanceCtor");
            })
            .then(function() {
              return Promise.reject("Expected to have been rejected.");
            }, function(result) {
              expect(result).toEqual(getErrorMatch().operInvalid());
            });
        });
      });
    });

    describe("#resolveInstance(instSpec, instKeyArgs, baseType)", function() {

      it("should return a new instance when given (null, null, pentaho.type.Instance)", function() {

        return getLoaderAsync().then(function(loader) {

          var Instance = loader.resolveType("pentaho/type/Instance");

          var result = loader.resolveInstance(null, null, Instance.type);

          expect(result).toEqual(jasmine.any(Instance));
        });
      });

      it("should return a new instance when given (nully, null, MyComplex)", function() {

        return getLoaderAsync().then(function(loader) {

          var Complex = loader.resolveType("pentaho/type/Complex");
          var MyComplex = Complex.extend();

          var result = loader.resolveInstance(null, null, MyComplex.type);

          expect(result).toEqual(jasmine.any(MyComplex));

          result = loader.resolveInstance(undefined, null, MyComplex.type);

          expect(result).toEqual(jasmine.any(MyComplex));
        });
      });

      it("should create a number instance when given (2, null, null)", function() {

        return getLoaderAsync().then(function(loader) {

          var PentahoNumber = loader.resolveType("pentaho/type/Number");

          var result = loader.resolveInstance(2);

          expect(result).toEqual(jasmine.any(PentahoNumber));
          expect(result.value).toBe(2);
        });
      });

      it("should create a boolean instance when given (true, null, null)", function() {

        return getLoaderAsync().then(function(loader) {

          var PentahoBoolean = loader.resolveType("pentaho/type/Boolean");

          var result = loader.resolveInstance(true);

          expect(result).toEqual(jasmine.any(PentahoBoolean));
          expect(result.value).toBe(true);
        });
      });

      it("should create an object instance when given ({v: {}}, null, Object)", function() {

        return getLoaderAsync().then(function(loader) {

          var PentahoObject = loader.resolveType("pentaho/type/Object");
          var primitive = {};

          var result = loader.resolveInstance({v: primitive}, null, PentahoObject.type);

          expect(result).toEqual(jasmine.any(PentahoObject));
          expect(result.value).toBe(primitive);
        });
      });

      it("should create an an instance given ({_: '', ...}, null, null)", function() {

        return getLoaderAsync().then(function(loader) {

          var PentahoNumber = loader.resolveType("pentaho/type/Number");

          var result = loader.resolveInstance({_: "pentaho/type/Number", v: 1});

          expect(result).toEqual(jasmine.any(PentahoNumber));
          expect(result.value).toBe(1);
        });
      });

      it("should throw if given a type-annotated value that does not extend from the baseType", function() {

        return getLoaderAsync().then(function(loader) {

          var PentahoString = loader.resolveType("pentaho/type/String");

          expect(function() {
            loader.resolveInstance({_: "pentaho/type/Number", v: 1}, null, PentahoString.type);
          }).toThrow(getErrorMatch().operInvalid());
        });
      });

      it("should not throw if given a type-annotated value that does extend from the given baseType", function() {

        return getLoaderAsync().then(function(loader) {

          var Simple = loader.resolveType("pentaho/type/Simple");
          var PentahoNumber = loader.resolveType("pentaho/type/Number");

          var result = loader.resolveInstance({_: "pentaho/type/Number", v: 1}, null, Simple.type);

          expect(result).toEqual(jasmine.any(PentahoNumber));
          expect(result.value).toBe(1);
        });
      });

      it("should throw if given a type annotated value of an abstract type", function() {

        return getLoaderAsync().then(function(loader) {

          var Instance = loader.resolveType("pentaho/type/Instance");
          var Complex = loader.resolveType("pentaho/type/Complex");
          var MyAbstract = Complex.extend({$type: {isAbstract: true}});

          expect(function() {
            loader.resolveInstance({_: MyAbstract}, null, Instance.type);
          }).toThrow(getErrorMatch().operInvalid());
        });
      });

      it("should throw if given a value and an abstract type typeBase", function() {

        return getLoaderAsync().then(function(loader) {

          var Complex = loader.resolveType("pentaho/type/Complex");
          var MyAbstract = Complex.extend({$type: {isAbstract: true}});

          expect(function() {
            loader.resolveInstance({}, null, MyAbstract.type);
          }).toThrow(getErrorMatch().operInvalid());
        });
      });

      // ---

      it("should be able to create a type-annotated value of a list type", function() {

        return getLoaderAsync().then(function(loader) {

          var NumberList = loader.resolveType({base: "list", of: "number"});

          var value = loader.resolveInstance({_: NumberList, d: [1, 2]});

          expect(value instanceof NumberList).toBe(true);
          expect(value.count).toBe(2);
          expect(value.at(0).value).toBe(1);
          expect(value.at(1).value).toBe(2);
        });
      });

      it("should be able to create a type-annotated value of an inline list type", function() {

        return getLoaderAsync().then(function(loader) {

          var value = loader.resolveInstance({
            _: {base: "list", of: "number"},
            d: [1, 2]
          });

          var List = loader.resolveType("pentaho/type/List");

          expect(value instanceof List).toBe(true);
          expect(value.count).toBe(2);
          expect(value.at(0).value).toBe(1);
          expect(value.at(1).value).toBe(2);
        });
      });

      it("should be able to create a type-annotated value of an inline complex type", function() {

        return getLoaderAsync().then(function(loader) {

          var value = loader.resolveInstance({
            _: {
              props: ["a", "b"]
            },
            "a": 1,
            "b": 2
          });

          var Complex = loader.resolveType("pentaho/type/Complex");

          expect(value instanceof Complex).toBe(true);
          expect(value.get("a").value).toBe("1");
          expect(value.get("b").value).toBe("2");
        });
      });

      it("should be able to create a type-annotated value of an inline list complex type", function() {

        return getLoaderAsync().then(function(loader) {

          var value = loader.resolveInstance({
            _: [
              {
                props: [
                  {name: "a"},
                  "b"
                ]
              }
            ],
            d: [
              {a: 1, b: 2}
            ]
          });

          var List = loader.resolveType("pentaho/type/List");

          expect(value instanceof List).toBe(true);
          expect(value.count).toBe(1);
        });
      });

      it("should be able to create a type-annotated value of an inline list complex type in array form", function() {

        return getLoaderAsync().then(function(loader) {

          var value = loader.resolveInstance({
            _: [{
              props: ["a", "b"]
            }],
            d: [
              [1, 2],
              [3, 4]
            ]
          });

          var List = loader.resolveType("pentaho/type/List");

          expect(value instanceof List).toBe(true);
          expect(value.count).toBe(2);
        });
      });
    });

    describe("#resolveInstanceAsync(instSpec, instKeyArgs, baseType)", function() {

      it("should return a new instance when given (null, null, pentaho.type.Instance)", function() {

        var Instance;

        return getLoaderAsync().then(function(loader) {

          Instance = loader.resolveType("pentaho/type/Instance");

          return loader.resolveInstanceAsync(null, null, Instance.type);
        })
        .then(function(result) {
          expect(result).toEqual(jasmine.any(Instance));
        });
      });

      it("should return a new instance when given (nully, null, MyComplex)", function() {

        var loader;
        var MyComplex;

        return getLoaderAsync().then(function(_loader) {

          loader = _loader;

          var Complex = loader.resolveType("pentaho/type/Complex");
          MyComplex = Complex.extend();

          return loader.resolveInstanceAsync(null, null, MyComplex.type);
        })
        .then(function(result) {

          expect(result).toEqual(jasmine.any(MyComplex));

          result = loader.resolveInstance(undefined, null, MyComplex.type);

          expect(result).toEqual(jasmine.any(MyComplex));
        });
      });

      it("should create a number instance when given (2, null, null)", function() {

        var PentahoNumber;

        return getLoaderAsync().then(function(loader) {

          PentahoNumber = loader.resolveType("pentaho/type/Number");

          return loader.resolveInstanceAsync(2);
        })
        .then(function(result) {
          expect(result).toEqual(jasmine.any(PentahoNumber));
          expect(result.value).toBe(2);
        });
      });

      it("should create a boolean instance when given (true, null, null)", function() {

        var PentahoBoolean;

        return getLoaderAsync().then(function(loader) {

          PentahoBoolean = loader.resolveType("pentaho/type/Boolean");

          return loader.resolveInstanceAsync(true);
        })
        .then(function(result) {
          expect(result).toEqual(jasmine.any(PentahoBoolean));
          expect(result.value).toBe(true);
        });
      });

      it("should create an object instance when given ({v: {}}, null, Object)", function() {

        var PentahoObject;
        var primitive;

        return getLoaderAsync().then(function(loader) {

          PentahoObject = loader.resolveType("pentaho/type/Object");
          primitive = {};

          return loader.resolveInstanceAsync({v: primitive}, null, PentahoObject.type);
        })
        .then(function(result) {
          expect(result).toEqual(jasmine.any(PentahoObject));
          expect(result.value).toBe(primitive);
        });
      });

      it("should create an an instance given ({_: '', ...}, null, null)", function() {

        var PentahoNumber;

        return getLoaderAsync().then(function(loader) {

          PentahoNumber = loader.resolveType("pentaho/type/Number");

          return loader.resolveInstanceAsync({_: "pentaho/type/Number", v: 1});
        })
        .then(function(result) {
          expect(result).toEqual(jasmine.any(PentahoNumber));
          expect(result.value).toBe(1);
        });
      });

      it("should reject if given a type-annotated value that does not extend from the baseType", function() {

        return getLoaderAsync().then(function(loader) {

          var PentahoString = loader.resolveType("pentaho/type/String");

          return loader.resolveInstanceAsync({_: "pentaho/type/Number", v: 1}, null, PentahoString.type);
        })
        .then(function() {
          return Promise.reject("Expected to have been rejected.");
        }, function(error) {
          expect(error).toEqual(getErrorMatch().operInvalid());
        });
      });

      it("should not throw if given a type-annotated value that does extend from the given baseType", function() {

        var PentahoNumber;

        return getLoaderAsync().then(function(loader) {

          var Simple = loader.resolveType("pentaho/type/Simple");
          PentahoNumber = loader.resolveType("pentaho/type/Number");

          return loader.resolveInstanceAsync({_: "pentaho/type/Number", v: 1}, null, Simple.type);
        })
        .then(function(result) {
          expect(result).toEqual(jasmine.any(PentahoNumber));
          expect(result.value).toBe(1);
        });
      });

      it("should throw if given a type annotated value of an abstract type", function() {

        return getLoaderAsync().then(function(loader) {

          var Instance = loader.resolveType("pentaho/type/Instance");
          var Complex = loader.resolveType("pentaho/type/Complex");
          var MyAbstract = Complex.extend({$type: {isAbstract: true}});

          return loader.resolveInstanceAsync({_: MyAbstract}, null, Instance.type);
        })
        .then(function() {
          return Promise.reject("Expected to have been rejected.");
        }, function(error) {
          expect(error).toEqual(getErrorMatch().operInvalid());
        });
      });

      it("should throw if given a value and an abstract type typeBase", function() {

        return getLoaderAsync().then(function(loader) {

          var Complex = loader.resolveType("pentaho/type/Complex");
          var MyAbstract = Complex.extend({$type: {isAbstract: true}});

          return loader.resolveInstanceAsync({}, null, MyAbstract.type);
        })
        .then(function() {
          return Promise.reject("Expected to have been rejected.");
        }, function(error) {
          expect(error).toEqual(getErrorMatch().operInvalid());
        });
      });

      // ---

      it("should be able to create a type-annotated value of a list type", function() {

        return getLoaderAsync().then(function(loader) {

          var NumberList = loader.resolveType({base: "list", of: "number"});

          var value = loader.resolveInstance({_: NumberList, d: [1, 2]});

          expect(value instanceof NumberList).toBe(true);
          expect(value.count).toBe(2);
          expect(value.at(0).value).toBe(1);
          expect(value.at(1).value).toBe(2);
        });
      });

      it("should be able to create a type-annotated value of an inline list type", function() {

        var loader;

        return getLoaderAsync().then(function(_loader) {

          loader = _loader;

          return loader.resolveInstanceAsync({
            _: {base: "list", of: "number"},
            d: [1, 2]
          });
        })
        .then(function(result) {

          var List = loader.resolveType("pentaho/type/List");

          expect(result instanceof List).toBe(true);
          expect(result.count).toBe(2);
          expect(result.at(0).value).toBe(1);
          expect(result.at(1).value).toBe(2);
        });
      });

      it("should be able to create a type-annotated value of an inline complex type", function() {

        var loader;

        return getLoaderAsync().then(function(_loader) {

          loader = _loader;

          return loader.resolveInstanceAsync({
            _: {
              props: ["a", "b"]
            },
            "a": 1,
            "b": 2
          });
        })
        .then(function(result) {
          var Complex = loader.resolveType("pentaho/type/Complex");

          expect(result instanceof Complex).toBe(true);
          expect(result.get("a").value).toBe("1");
          expect(result.get("b").value).toBe("2");
        });
      });

      it("should be able to create a type-annotated value of an inline list complex type", function() {

        var loader;

        return getLoaderAsync().then(function(_loader) {

          loader = _loader;

          return loader.resolveInstanceAsync({
            _: [
              {
                props: [
                  {name: "a"},
                  "b"
                ]
              }
            ],
            d: [
              {a: 1, b: 2}
            ]
          });
        })
        .then(function(result) {
          var List = loader.resolveType("pentaho/type/List");

          expect(result instanceof List).toBe(true);
          expect(result.count).toBe(1);
        });
      });

      it("should be able to create a type-annotated value of an inline list complex type in array form", function() {

        var loader;

        return getLoaderAsync().then(function(_loader) {

          loader = _loader;

          return loader.resolveInstanceAsync({
            _: [{
              props: ["a", "b"]
            }],
            d: [
              [1, 2],
              [3, 4]
            ]
          });
        })
        .then(function(result) {

          var List = loader.resolveType("pentaho/type/List");

          expect(result instanceof List).toBe(true);
          expect(result.count).toBe(2);
        });
      });

      it("should be able to create a type-annotated value of an inline list " +
        "complex type having dependencies", function() {

        localRequire.define("test/foo/a", ["pentaho/type/Complex"], function(Complex) {

          return Complex.extend({
            $type: {
              id: "test/foo/a",
              props: {
                a: {valueType: "string"}
              }
            }
          });
        });

        localRequire.define("test/foo/b", ["pentaho/type/Complex"], function(Complex) {

          return Complex.extend({
            $type: {
              id: "test/foo/b",
              props: {
                b: {valueType: "string"}
              }
            }
          });
        });

        localRequire.define("test/foo/c", ["test/foo/b"], function(TestFooB) {

          return TestFooB.extend({
            $type: {
              id: "test/foo/c",
              props: {
                c: {valueType: "string"}
              }
            }
          });
        });

        var loader;

        return getLoaderAsync().then(function(_loader) {

          loader = _loader;

          return loader.resolveInstanceAsync({
            _: [
              {
                props: [
                  {name: "x", valueType: "test/foo/a"},
                  {name: "y", valueType: "test/foo/b"}
                ]
              }
            ],
            d: [
              {x: {a: "1"}, y: {b: "2"}},
              {x: {a: "2"}, y: {_: "test/foo/c", b: "3"}}
            ]
          });
        })
        .then(function(result) {

          var List = loader.resolveType("pentaho/type/List");

          expect(result instanceof List).toBe(true);
          expect(result.count).toBe(2);
        });
      });
    });
  });
});
