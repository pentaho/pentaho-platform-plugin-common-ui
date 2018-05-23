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
  "pentaho/_core/module/MetaService",
  "pentaho/lang/ArgumentInvalidError",
  "tests/pentaho/util/errorMatch",
  "pentaho/shim/es6-promise"
], function(metaServiceFactory, ArgumentInvalidError, errorMatch) {

  "use strict";

  /* eslint max-nested-callbacks:0 */

  describe("pentaho._core.module.MetaService", function() {

    var core;
    var MetaService;

    beforeAll(function() {
      core = createCoreMock();
    });

    beforeEach(function() {
      MetaService = metaServiceFactory(core);
    });

    function createCoreMock() {

      function Meta(id, spec) {
        this.id = id;
        this.alias = spec.alias;
        this.__index = spec.index;
        this.ranking = spec.ranking || 0;
      }

      function TypeMeta(id, spec, moduleResolver) {

        Meta.call(this, id, spec);
        this.kind = "type";

        var ancestorId = spec.ancestor || spec.base || null;
        this.ancestor = ancestorId ? moduleResolver(ancestorId, "type") : null;
        this.isAbstract = !!spec.isAbstract;
        this.subtypes = [];
        this.instances = [];

        if(this.ancestor) {
          this.ancestor.subtypes.push(this);
        }
      }

      function InstanceMeta(id, spec, moduleResolver) {

        Meta.call(this, id, spec);
        this.kind = "instance";

        this.type = spec.type ? moduleResolver(spec.type, "type") : null;

        if(this.type) {
          this.type.instances.push(this);
        }
      }

      var core = {
        TypeModuleMeta: TypeMeta,
        InstanceModuleMeta: InstanceMeta
      };

      return core;
    }

    function createClassHierarchyModulesMap() {
      var moduleSpecMap = {
        "region": {
          ancestor: null
        },
        // types
        "animal": {
          ancestor: null,
          alias: "living"
        },
        "dog": {
          ancestor: "animal",
          ranking: 2
        },
        "cat": {
          ancestor: "animal",
          ranking: 3
        },
        "mouse": {
          ancestor: "animal"
        },

        // instances
        "animal1": {
          type: "animal"
        },
        "dog1": {
          type: "dog"
        },
        "dog2": {
          type: "dog",
          ranking: 2
        },
        "cat1": {
          type: "cat",
          ranking: 3
        },
        "cat2": {
          type: "cat"
        }
      };

      return moduleSpecMap;
    }

    describe("new MetaService()", function() {

      it("should return an instance", function() {

        var metaService = new MetaService();

        expect(metaService instanceof MetaService).toBe(true);
      });
    });

    describe("#configure(moduleSpecMap)", function() {

      it("should do nothing if moduleSpecMap is not specified", function() {

        var metaService = new MetaService();
        metaService.configure();
      });

      it("should return itself", function() {

        var metaService = new MetaService();
        var result = metaService.configure();

        expect(result).toBe(metaService);
      });

      it("should throw if given a moduleSpecMap with an empty key", function() {

        var metaService = new MetaService();
        var moduleSpecMap = {
          "": {}
        };

        expect(function() {
          metaService.configure(moduleSpecMap);
        }).toThrow(errorMatch.argInvalid("moduleSpecMap"));
      });

      it("should throw if given a moduleSpecMap with a falsy value", function() {

        var metaService = new MetaService();
        var moduleSpecMap = {
          "foo": null
        };

        expect(function() {
          metaService.configure(moduleSpecMap);
        }).toThrow(errorMatch.argInvalid("moduleSpecMap"));
      });

      it("should call __configure(config) on an existing module", function() {

        var metaService = new MetaService();

        var existingMeta = jasmine.createSpyObj("existingMeta", ["__configure"]);
        spyOn(metaService, "__get").and.returnValue(existingMeta);

        var moduleSpecMap = {
          "foo": {}
        };

        metaService.configure(moduleSpecMap);

        expect(existingMeta.__configure).toHaveBeenCalledTimes(1);
        expect(existingMeta.__configure).toHaveBeenCalledWith(moduleSpecMap.foo);
      });

      describe("when the specified modules are not defined", function() {

        describe("aliases", function() {

          it("should throw if the alias of a module is already the id or alias of an existing module", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newId": {
                alias: "existingIdOrAlias"
              }
            };
            var existingMeta = {};

            spyOn(metaService, "__get").and.callFake(function(idOrAlias) {
              if(idOrAlias === "existingIdOrAlias") {
                return existingMeta;
              }

              return null;
            });

            expect(function() {
              metaService.configure(moduleSpecMap);
            }).toThrow(errorMatch.argInvalid("moduleSpecMap"));
          });

          it("should throw if the alias of a module is the id of module being defined afterwards", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                alias: "newIdB"
              },
              "newIdB": {
              }
            };

            expect(function() {
              metaService.configure(moduleSpecMap);
            }).toThrow(errorMatch.argInvalid("moduleSpecMap"));
          });

          it("should throw if the alias of a module is the id of module being defined, but before", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
              },
              "newIdB": {
                alias: "newIdA"
              }
            };

            expect(function() {
              metaService.configure(moduleSpecMap);
            }).toThrow(errorMatch.argInvalid("moduleSpecMap"));
          });
        });

        describe("kind detection and consistency", function() {

          it("should assume it is a 'type' module when `ancestor` is present with a null value", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                ancestor: null
              }
            };

            metaService.configure(moduleSpecMap);

            var metaA = metaService.get("newIdA");

            expect(metaA.kind).toBe("type");
          });

          it("should assume it is a 'type' module when `ancestor` is present with a proper value", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                ancestor: null
              },
              "newIdB": {
                ancestor: "newIdA"
              }
            };

            metaService.configure(moduleSpecMap);

            var metaB = metaService.get("newIdB");

            expect(metaB.kind).toBe("type");
          });

          it("should assume it is a 'type' module when `base` is present with a null value", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                base: null
              }
            };

            metaService.configure(moduleSpecMap);

            var metaA = metaService.get("newIdA");

            expect(metaA.kind).toBe("type");
          });

          it("should assume it is a 'type' module when `base` is present with a proper value", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                base: null
              },
              "newIdB": {
                base: "newIdA"
              }
            };

            metaService.configure(moduleSpecMap);

            var metaB = metaService.get("newIdB");

            expect(metaB.kind).toBe("type");
          });

          it("should ignore `type` when `ancestor` is present", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                ancestor: null,
                type: "foo"
              }
            };

            metaService.configure(moduleSpecMap);

            var metaA = metaService.get("newIdA");

            expect(metaA.kind).toBe("type");
          });

          it("should ignore `type` when `base` is present", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                base: null,
                type: "foo"
              }
            };

            metaService.configure(moduleSpecMap);

            var metaA = metaService.get("newIdA");

            expect(metaA.kind).toBe("type");
          });

          it("should assume it is an 'instance' module when neither `ancestor` nor `base` are present", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                ancestor: null
              },

              "newIdB": {
              }
            };

            metaService.configure(moduleSpecMap);

            var metaB = metaService.get("newIdB");

            expect(metaB.kind).toBe("instance");
          });

          // ---

          it("should throw if the `ancestor` module is not a module of the 'type' kind", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                ancestor: null
              },
              "newIdB": {
                type: "newIdA"
              },
              "newIdC": {
                ancestor: "newIdB"
              }
            };

            expect(function() {
              metaService.configure(moduleSpecMap);
            }).toThrow(errorMatch.argInvalid("moduleSpecMap"));
          });

          it("should throw if the `base` module is not a module of the 'type' kind", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                ancestor: null
              },
              "newIdB": {
                type: "newIdA"
              },
              "newIdC": {
                base: "newIdB"
              }
            };

            expect(function() {
              metaService.configure(moduleSpecMap);
            }).toThrow(errorMatch.argInvalid("moduleSpecMap"));
          });

          it("should throw if the `type` module is not a module of the 'type' kind", function() {

            var metaService = new MetaService();
            var moduleSpecMap = {
              "newIdA": {
                ancestor: null
              },
              "newIdB": {
                type: "newIdA"
              },
              "newIdC": {
                type: "newIdB"
              }
            };

            expect(function() {
              metaService.configure(moduleSpecMap);
            }).toThrow(errorMatch.argInvalid("moduleSpecMap"));
          });
        });
      });
    });

    describe("#get(idOrAlias, {createIfUndefined, assertDefined})", function() {

      describe("undefined modules", function() {

        it("should return `null` when requested an undefined module and " +
          "keyArgs.assertDefined is not specified", function() {

          var metaService = new MetaService();
          var result = metaService.get("undefinedModule");

          expect(result).toBe(null);
        });

        it("should return `null` when requested an undefined module and keyArgs.assertDefined is false", function() {

          var metaService = new MetaService();
          var result = metaService.get("undefinedModule", {assertDefined: false});

          expect(result).toBe(null);
        });

        it("should throw when requested an undefined module and keyArgs.assertDefined is true", function() {

          var metaService = new MetaService();

          expect(function() {
            metaService.get("undefinedModule", {assertDefined: true});
          }).toThrow(errorMatch.argInvalid("idOrAlias"));
        });

        it("should create an instance module of null type when requested an undefined module and " +
          "keyArgs.createIfUndefined is true", function() {

          var metaService = new MetaService();
          var result = metaService.get("undefinedModule", {createIfUndefined: true});

          expect(result).not.toBe(null);
          expect(result.kind).toBe("instance");
          expect(result.type).toBe(null);
        });
      });

      describe("defined modules", function() {

        var metaService;

        beforeEach(function() {
          metaService = new MetaService();

          var moduleSpecMap = {
            "newIdA": {
              ancestor: null
            },
            "newIdB": {
              type: "newIdA",
              alias: "altB"
            }
          };

          metaService.configure(moduleSpecMap);
        });

        it("should return an existing module given its identifier", function() {

          var result = metaService.get("newIdA");
          expect(result.id).toBe("newIdA");
        });

        it("should return the same module each time when given its identifier", function() {

          var result1 = metaService.get("newIdA");
          var result2 = metaService.get("newIdA");
          expect(result1).toBe(result2);
        });

        it("should return an existing module given its alias", function() {

          var result = metaService.get("altB");
          expect(result.id).toBe("newIdB");
        });

        it("should return the same module each time when given its alias", function() {

          var result1 = metaService.get("altB");
          var result2 = metaService.get("altB");
          expect(result1).toBe(result2);
        });
      });
    });

    describe("#getInstancesOf(typeIdOrAlias)", function() {

      var metaService;

      beforeEach(function() {
        metaService = new MetaService();
        metaService.configure(createClassHierarchyModulesMap());
      });

      it("should return an empty array when given an undefined type", function() {
        var result = metaService.getInstancesOf("undefinedType");
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
      });

      it("should throw when given type module which is not of kind 'type'", function() {
        expect(function() {
          metaService.getInstancesOf("cat1");
        }).toThrow(errorMatch.argInvalid("typeIdOrAlias"));
      });

      it("should return an empty array when a defined type has no instances", function() {

        var result = metaService.getInstancesOf("region");
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
      });

      it("should return the instances of a leaf type, ordered by descending value of ranking", function() {

        var result = metaService.getInstancesOf("dog");
        expect(result.slice()).toEqual([
          jasmine.objectContaining({id: "dog2"}),
          jasmine.objectContaining({id: "dog1"})
        ]);
      });

      it("should return all instances of the given type and of its descendant types, " +
        "ordered by descending value of ranking and then by ascending definition order", function() {

        var result = metaService.getInstancesOf("animal");
        expect(result[0].id).toBe("cat1");
        expect(result[1].id).toBe("dog2");

        // Because object enumeration is still not stable in PhantomJS,
        // we need to do it this way.
        // On a new JS engine. Modules defined earlier would come first.
        var rest = result.slice(2);
        expect(rest.length).toBe(3);
        expect(rest).toEqual(jasmine.arrayContaining([
          jasmine.objectContaining({id: "animal1"}),
          jasmine.objectContaining({id: "dog1"}),
          jasmine.objectContaining({id: "cat2"})
        ]));
      });

      it("should return the instances of a type when given its alias", function() {

        var result = metaService.getInstancesOf("living");
        expect(result.slice()).toEqual(jasmine.arrayContaining([
          jasmine.objectContaining({id: "cat1"}),
          jasmine.objectContaining({id: "dog2"}),
          jasmine.objectContaining({id: "animal1"}),
          jasmine.objectContaining({id: "dog1"}),
          jasmine.objectContaining({id: "cat2"})
        ]));
      });
    });

    describe("#getInstanceOf(typeIdOrAlias)", function() {

      var metaService;

      beforeEach(function() {
        metaService = new MetaService();
        metaService.configure(createClassHierarchyModulesMap());
      });

      it("should return null when given an undefined type", function() {
        var result = metaService.getInstanceOf("undefinedType");
        expect(result).toBe(null);
      });

      it("should throw when given type module which is not of kind 'type'", function() {
        expect(function() {
          metaService.getInstanceOf("cat1");
        }).toThrow(errorMatch.argInvalid("typeIdOrAlias"));
      });

      it("should return null when a defined type has no instances", function() {

        var result = metaService.getInstanceOf("region");
        expect(result).toBe(null);
      });

      it("should return the highest ranking instance of a type", function() {

        var result = metaService.getInstanceOf("animal");
        expect(result.id).toBe("cat1");
      });

      it("should return the highest ranking instance of a type, when given its alias", function() {

        var result = metaService.getInstanceOf("living");
        expect(result.id).toBe("cat1");
      });
    });

    describe("#getSubtypesOf(baseTypeIdOrAlias)", function() {

      var metaService;

      beforeEach(function() {
        metaService = new MetaService();
        metaService.configure(createClassHierarchyModulesMap());
      });

      it("should return an empty array when given an undefined type", function() {
        var result = metaService.getSubtypesOf("undefinedType");
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
      });

      it("should throw when given type module which is not of kind 'type'", function() {
        expect(function() {
          metaService.getSubtypesOf("cat1");
        }).toThrow(errorMatch.argInvalid("baseTypeIdOrAlias"));
      });

      it("should return an empty array when a defined type has no subtypes", function() {

        var result = metaService.getSubtypesOf("cat");
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
      });

      it("should return all subtypes of the given type excluding the base type, " +
        "ordered by descending value of ranking and then by ascending definition order", function() {

        var result = metaService.getSubtypesOf("animal");
        expect(result[0].id).toBe("cat");
        expect(result[1].id).toBe("dog");

        // Because object enumeration is still not stable in PhantomJS,
        // we need to do it this way.
        // On a new JS engine. Modules defined earlier would come first.
        var rest = result.slice(2);
        expect(rest.length).toBe(1);
        expect(rest).toEqual(jasmine.arrayContaining([
          jasmine.objectContaining({id: "mouse"})
        ]));
      });

      it("should return the subtypes of a type when given its alias", function() {

        var result = metaService.getSubtypesOf("living");
        expect(result.slice()).toEqual(jasmine.arrayContaining([
          jasmine.objectContaining({id: "cat"}),
          jasmine.objectContaining({id: "dog"}),
          jasmine.objectContaining({id: "mouse"})
        ]));
      });
    });

    describe("#getSubtypeOf(baseTypeIdOrAlias)", function() {

      var metaService;

      beforeEach(function() {
        metaService = new MetaService();
        metaService.configure(createClassHierarchyModulesMap());
      });

      it("should return null when given an undefined type", function() {
        var result = metaService.getSubtypeOf("undefinedType");
        expect(result).toBe(null);
      });

      it("should throw when given type module which is not of kind 'type'", function() {
        expect(function() {
          metaService.getSubtypeOf("cat1");
        }).toThrow(errorMatch.argInvalid("baseTypeIdOrAlias"));
      });

      it("should return null when a defined type has no subtypes", function() {

        var result = metaService.getSubtypeOf("region");
        expect(result).toBe(null);
      });

      it("should return the highest ranking subtype of a type", function() {

        var result = metaService.getSubtypeOf("animal");
        expect(result.id).toBe("cat");
      });

      it("should return the highest ranking instance of a type, when given its alias", function() {

        var result = metaService.getSubtypeOf("living");
        expect(result.id).toBe("cat");
      });
    });
  });
});
