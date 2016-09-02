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

  describe("TypeRegistry class - Configuration -", function() {
    describe("#addConfig(.) -", function() {
      var typeRegistry;

      beforeEach(function() {
        typeRegistry = new TypeRegistry();
      });

      it("should throw an error when given no argument or a nully argument", function() {
        expect(function() {
          typeRegistry.addConfig();
        }).toThrow();

        expect(function() {
          typeRegistry.addConfig(null);
        }).toThrow();

        expect(function() {
          typeRegistry.addConfig(undefined);
        }).toThrow();
      });

      it("should add the type configuration, if the same object hadn't been already added", function() {
        var typeConfig = {
          id: "foo",
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig);

        expect(typeRegistry._configLevelsList.length).toBe(1);

        var configLevel = typeRegistry._configLevelsList[0];

        expect(configLevel != null).toBe(true);

        var indiv = configLevel.indiv["foo"];
        expect(indiv instanceof Array).toBe(true);
        expect(indiv.length).toBe(1);
        expect(indiv[0]).toBe(typeConfig);
      });

      it("should do nothing if the same type configuration object is re-added", function() {
        var typeConfig = {
          id: "foo",
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig);
        typeRegistry.addConfig(typeConfig);

        expect(typeRegistry._configLevelsList.length).toBe(1);

        var configLevel = typeRegistry._configLevelsList[0];

        expect(configLevel != null).toBe(true);

        var indiv = configLevel.indiv["foo"];
        expect(indiv instanceof Array).toBe(true);
        expect(indiv.length).toBe(1);
        expect(indiv[0]).toBe(typeConfig);
      });

      it("should return `this`", function() {
        var result = typeRegistry.addConfig({id: "foo", container: "bar"});

        expect(result).toBe(typeRegistry);
      });

      it("should default the priority of type configurations to 0", function() {
        var typeConfig = {
          id: "foo",
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig);

        var configLevel = typeRegistry._configLevelsMap[0];
        expect(configLevel != null).toBe(true);

        expect(typeConfig.priority).toBe(0);
      });

      it("should group type configurations by priority", function() {
        var typeConfig1 = {
          id: "foo",
          container: "bar",
          priority:  1
        };
        var typeConfig2 = {
          id: "foo",
          container: "bar",
          priority: 2
        };
        typeRegistry.addConfig(typeConfig1);
        typeRegistry.addConfig(typeConfig2);

        expect(typeRegistry._configLevelsMap[1] != null).toBe(true);
        expect(typeRegistry._configLevelsMap[1].indiv["foo"][0]).toBe(typeConfig1);
        expect(typeRegistry._configLevelsMap[2] != null).toBe(true);
        expect(typeRegistry._configLevelsMap[2].indiv["foo"][0]).toBe(typeConfig2);
      });

      it("should recognize an id-individual type configuration", function() {
        var typeConfig = {
          id: "foo",
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig);

        expect(typeRegistry._configLevelsList[0] != null).toBe(true);
        expect(typeRegistry._configLevelsList[0].indiv["foo"][0]).toBe(typeConfig);
      });

      it("should recognize two id-individual type configurations", function() {
        var typeConfig1 = {
          id: "foo",
          container: "bar"
        };
        var typeConfig2 = {
          id: "foo",
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig1);
        typeRegistry.addConfig(typeConfig2);

        expect(typeRegistry._configLevelsList[0] != null).toBe(true);
        expect(typeRegistry._configLevelsList[0].indiv["foo"].length).toBe(2);
        expect(typeRegistry._configLevelsList[0].indiv["foo"][0]).toBe(typeConfig1);
        expect(typeRegistry._configLevelsList[0].indiv["foo"][1]).toBe(typeConfig2);
      });

      it("should recognize an id-group, regexp, type configuration", function() {
        var typeConfig = {
          id: /foo/,
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig);

        expect(typeRegistry._configLevelsList.length).toBe(1);
        var configLevel = typeRegistry._configLevelsList[0];
        expect(configLevel.group.length).toBe(1);
        expect(configLevel.group[0]).toBe(typeConfig);
      });

      it("should recognize an id-group, all, type configuration", function() {
        var typeConfig1 = {
          container: "bar"
        };
        var typeConfig2 = {
          id: null,
          container: "bar"
        };
        var typeConfig3 = {
          id: undefined,
          container: "bar"
        };
        var typeConfig4 = {
          id: "",
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig1);
        typeRegistry.addConfig(typeConfig2);
        typeRegistry.addConfig(typeConfig3);
        typeRegistry.addConfig(typeConfig4);

        expect(typeRegistry._configLevelsList.length).toBe(1);
        var configLevel = typeRegistry._configLevelsList[0];
        expect(configLevel.group.length).toBe(4);
        expect(configLevel.group[0]).toBe(typeConfig1);
        expect(configLevel.group[1]).toBe(typeConfig2);
        expect(configLevel.group[2]).toBe(typeConfig3);
        expect(configLevel.group[3]).toBe(typeConfig4);
        expect(typeConfig1._matchGroupId("foo")).toBe(true);
        expect(typeConfig1._matchGroupId("bar")).toBe(true);
        expect(typeConfig2._matchGroupId("foo")).toBe(true);
        expect(typeConfig2._matchGroupId("bar")).toBe(true);
        expect(typeConfig3._matchGroupId("foo")).toBe(true);
        expect(typeConfig3._matchGroupId("bar")).toBe(true);
        expect(typeConfig4._matchGroupId("foo")).toBe(true);
        expect(typeConfig4._matchGroupId("bar")).toBe(true);
      });

      it("should recognize a mixed id-indiv/group type configuration", function() {
        var typeConfig1 = {
          id: ["foo", /foo/],
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig1);

        expect(typeRegistry._configLevelsList.length > 0).toBe(true);
        var configLevel = typeRegistry._configLevelsList[0];
        expect(configLevel.indiv["foo"] != null).toBe(true);
        expect(configLevel.indiv["foo"].length).toBe(1);
        expect(configLevel.indiv["foo"][0]).toBe(typeConfig1);
        expect(configLevel.group.length).toBe(1);
        expect(configLevel.group[0]).toBe(typeConfig1);
      });

      it("should preserve an indiv in a mixed id-indiv/group type configuration that has an all group", function() {
        // indiv has != priority so if it were globbed by the all group it could result differently
        var typeConfig1 = {
          id: ["foo", null, /fuu/],
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig1);

        expect(typeRegistry._configLevelsList.length > 0).toBe(true);
        var configLevel = typeRegistry._configLevelsList[0];
        expect(configLevel.indiv["foo"] != null).toBe(true);
        expect(configLevel.indiv["foo"].length).toBe(1);
        expect(configLevel.indiv["foo"][0]).toBe(typeConfig1);
      });

      it("should preserve an indiv in a mixed id-indiv/group type configuration that has an all group", function() {
        // indiv has != priority so if it were globbed by the all group it could result differently
        var typeConfig1 = {
          id: ["foo", null, /fuu/],
          container: "bar"
        };
        typeRegistry.addConfig(typeConfig1);

        expect(typeRegistry._configLevelsList.length > 0).toBe(true);
        var configLevel = typeRegistry._configLevelsList[0];
        expect(configLevel.indiv["foo"] != null).toBe(true);
        expect(configLevel.indiv["foo"].length).toBe(1);
        expect(configLevel.indiv["foo"][0]).toBe(typeConfig1);
        expect(configLevel.group.length).toBe(1);
        expect(configLevel.group[0]).toBe(typeConfig1);
        expect(configLevel.group[0]._matchGroupId("foo")).toBe(true);
        expect(configLevel.group[0]._matchGroupId("fuu")).toBe(true);
        expect(configLevel.group[0]._matchGroupId("bar")).toBe(true);
        expect(configLevel.group[0]._matchGroupId("gugu")).toBe(true);
      });
    });

    describe("#get(type, container) -", function() {
      var typeRegistry,
          typeList = [
            {id: "A", args: {foo: {bar: "0"}, dada: 2}, lala: {buuu: 3}},
            {id: "B", args: {foo: {bar: "0"}, dada: 2}, lala: {buuu: 3}}
          ];

      beforeEach(function() {
        typeRegistry = new TypeRegistry();

        typeRegistry.add(typeList[0]);
        typeRegistry.add(typeList[1]);
      });

      describe("type config `enabled` -", function() {
        it("should consider visual types as enabled by default", function() {
          expect(typeRegistry.get("A") != null).toBe(true);
          expect(typeRegistry.get("A").id).toBe("A");

          expect(typeRegistry.get("A", "c1") != null).toBe(true);
          expect(typeRegistry.get("A", "c1").id).toBe("A");
        });

        it("should respect individually disabled for one container", function() {
          typeRegistry.addConfig({
            id: "A",
            container: "c1",
            enabled: false
          });

          expect(typeRegistry.get("A", "c1") == null).toBe(true);

          expect(typeRegistry.get("A", "c2") != null).toBe(true);
          expect(typeRegistry.get("A", "c2").id).toBe("A");

          expect(typeRegistry.get("A") != null).toBe(true);
          expect(typeRegistry.get("A").id).toBe("A");
        });

        it("should respect individually disabled for any container", function() {
          typeRegistry.addConfig({
            id: "A",
            enabled: false
          });

          expect(typeRegistry.get("A", "c1") == null).toBe(true);
          expect(typeRegistry.get("A", "c2") == null).toBe(true);
          expect(typeRegistry.get("A") == null).toBe(true);
        });

        it("should respect all-id-group disabled for one container", function() {
          typeRegistry.addConfig({
            container: "c1",
            enabled: false
          });

          expect(typeRegistry.get("A", "c1") == null).toBe(true);
          expect(typeRegistry.get("B", "c1") == null).toBe(true);

          expect(typeRegistry.get("A", "c2") != null).toBe(true);
          expect(typeRegistry.get("B", "c2").id).toBe("B");

          expect(typeRegistry.get("A") != null).toBe(true);
          expect(typeRegistry.get("A").id).toBe("A");
          expect(typeRegistry.get("B") != null).toBe(true);
          expect(typeRegistry.get("B").id).toBe("B");
        });

        it("should respect all-id-group disabled for any container (disabled by default)", function() {
          typeRegistry.addConfig({
            enabled: false
          });

          expect(typeRegistry.get("A", "c1") == null).toBe(true);
          expect(typeRegistry.get("B", "c1") == null).toBe(true);

          expect(typeRegistry.get("A", "c2") == null).toBe(true);

          expect(typeRegistry.get("A") == null).toBe(true);
          expect(typeRegistry.get("B") == null).toBe(true);
        });
      });

      describe("document order precedence -", function() {
        it("should the last win over the first (universal)", function() {
          typeRegistry.addConfig({
            enabled: false
          });
          typeRegistry.addConfig({
            enabled: true
          });

          expect(typeRegistry.get("A") != null).toBe(true);
          expect(typeRegistry.get("B") != null).toBe(true);
          expect(typeRegistry.get("A", "c1") != null).toBe(true);
          expect(typeRegistry.get("B", "c1") != null).toBe(true);
          expect(typeRegistry.get("A", "c2") != null).toBe(true);
          expect(typeRegistry.get("B", "c2") != null).toBe(true);
        });

        it("should the last win over the first (same priority, one container, all ids)", function() {
          typeRegistry.addConfig({
            container: "c1",
            enabled:   false
          });
          typeRegistry.addConfig({
            container: "c1",
            enabled:   true
          });

          expect(typeRegistry.get("A", "c1") != null).toBe(true);
          expect(typeRegistry.get("B", "c1") != null).toBe(true);
        });

        it("should the last win over the first (same priority, one container, one id)", function() {
          typeRegistry.addConfig({
            id: "A",
            container: "c1",
            enabled:   false
          });
          typeRegistry.addConfig({
            id: "A",
            container: "c1",
            enabled:   true
          });

          expect(typeRegistry.get("A", "c1") != null).toBe(true);
        });

        it("should the last win over the first (same priority, all containers, one id)", function() {
          typeRegistry.addConfig({
            id: "A",
            enabled: false
          });
          typeRegistry.addConfig({
            id: "A",
            enabled: true
          });

          expect(typeRegistry.get("A", "c1") != null).toBe(true);
          expect(typeRegistry.get("A", "c2") != null).toBe(true);
          expect(typeRegistry.get("A") != null).toBe(true);
        });
      });

      describe("individual then group precedence -", function() {
        it("should the individual win over the group (all id-group, all containers)", function() {
          typeRegistry.addConfig({
            id: "A",
            enabled: false
          });
          typeRegistry.addConfig({
            enabled: true
          });

          expect(typeRegistry.get("A") == null).toBe(true);
          expect(typeRegistry.get("A", "c1") == null).toBe(true);
        });

        it("should the individual win over the group (regexp id-group, all containers)", function() {
          typeRegistry.addConfig({
            id: "A",
            enabled: false
          });
          typeRegistry.addConfig({
            id: /A/,
            enabled: true
          });

          expect(typeRegistry.get("A") == null).toBe(true);
          expect(typeRegistry.get("A", "c1") == null).toBe(true);
        });

        it("should the individual win over the group (all id-group, one container)", function() {
          typeRegistry.addConfig({
            id: "A",
            enabled: false
          });
          typeRegistry.addConfig({
            container: "c1",
            enabled: true
          });

          expect(typeRegistry.get("A") == null).toBe(true);
          expect(typeRegistry.get("A", "c1") == null).toBe(true);
        });

        it("should the individual win over the group (regexp id-group, one container)", function() {
          typeRegistry.addConfig({
            id: "A",
            enabled: false
          });
          typeRegistry.addConfig({
            id: /A/,
            container: "c1",
            enabled: true
          });

          expect(typeRegistry.get("A") == null).toBe(true);
          expect(typeRegistry.get("A", "c1") == null).toBe(true);
        });
      });

      describe("greater priority has higher precedence -", function() {
        it("should 1 win over 0 (against indiv over group and document order, all containers)", function() {
          typeRegistry.addConfig({
            priority: 1,
            id: /A/,
            enabled: false
          });
          typeRegistry.addConfig({
            priority: 0,
            id: "A",
            enabled: true
          });

          expect(typeRegistry.get("A") == null).toBe(true);
          expect(typeRegistry.get("A", "c1") == null).toBe(true);
        });

        it("should 1 win over 0 (against indiv over group and document order, same container)", function() {
          typeRegistry.addConfig({
            priority: 1,
            id: /A/,
            container: "c1",
            enabled: false
          });
          typeRegistry.addConfig({
            priority: 0,
            id: "A",
            container: "c1",
            enabled: true
          });

          expect(typeRegistry.get("A", "c1") == null).toBe(true);
        });

        it("should 1 win over 0 (against document order, all ids, all containers)", function() {
          typeRegistry.addConfig({
            priority: 1,
            enabled: false
          });
          typeRegistry.addConfig({
            priority: 0,
            enabled: true
          });

          expect(typeRegistry.get("A") == null).toBe(true);
          expect(typeRegistry.get("A", "c1") == null).toBe(true);
          expect(typeRegistry.get("A", "c2") == null).toBe(true);
          expect(typeRegistry.get("B") == null).toBe(true);
          expect(typeRegistry.get("B", "c1") == null).toBe(true);
          expect(typeRegistry.get("B", "c2") == null).toBe(true);
        });
      });

      describe("type config `args` merge-copy -", function() {

        function doTest(typeConfig1, typeConfig2) {
          typeRegistry.addConfig(typeConfig1);
          typeRegistry.addConfig(typeConfig2);

          var type = typeRegistry.get("A", "c1");

          expect(type).not.toBe(typeList[0]);
          expect(type.args).not.toBe(typeList[0].args);
          expect(type.args).not.toBe(typeConfig1.args);
          expect(type.args).not.toBe(typeConfig2.args);

          expect(type.args.foo).not.toBe(typeList[0].args.foo);
          expect(type.args.foo).not.toBe(typeConfig1.args.foo);
          expect(type.args.foo).toBe(typeConfig2.args.foo);
          expect(type.args.foo.bar).toBe("2");
        }

        it("should do shallow merge (indiv id, one container)", function() {
          var typeConfig1 = {
            id: "A",
            container: "c1",
            args: {
              foo: {bar: "1"}
            }
          };

          var typeConfig2 = {
            id: "A",
            container: "c1",
            args: {
              foo: {bar: "2"}
            }
          };

          doTest(typeConfig1, typeConfig2);
        });

        it("should do shallow merge (group+indiv id, one container)", function() {
          var typeConfig1 = {
            container: "c1",
            args: {
              foo: {bar: "1"}
            }
          };

          var typeConfig2 = {
            id: "A",
            container: "c1",
            args: {
              foo: {bar: "2"}
            }
          };

          doTest(typeConfig1, typeConfig2);
        });

        it("should do shallow merge (group+indiv id, one+any container)", function() {
          var typeConfig1 = {
            container: "c1",
            args: {
              foo: {bar: "1"}
            }
          };

          var typeConfig2 = {
            id: "A",
            args: {
              foo: {bar: "2"}
            }
          };

          doTest(typeConfig1, typeConfig2);
        });

        it("should do shallow merge (group+indiv id, any container)", function() {
          var typeConfig1 = {
            args: {
              foo: {bar: "1"}
            }
          };

          var typeConfig2 = {
            id: "A",
            args: {
              foo: {bar: "2"}
            }
          };

          doTest(typeConfig1, typeConfig2);
        });

        it("should do shallow merge (group+group id, any container)", function() {
          var typeConfig1 = {
            id: /A/,
            args: {
              foo: {bar: "1"}
            }
          };

          var typeConfig2 = {
            id: /A|B/,
            args: {
              foo: {bar: "2"}
            }
          };

          doTest(typeConfig1, typeConfig2);
        });

        it("should preserve unshadowed props", function() {
          var typeConfig1 = {
            id: "A",
            args: {
              foo: {bar: "1"},
              gu1: 1
            }
          };

          var typeConfig2 = {
            id: "A",
            args: {
              foo: {bar: "2"},
              gu2: 2
            }
          };

          typeRegistry.addConfig(typeConfig1);
          typeRegistry.addConfig(typeConfig2);

          var type = typeRegistry.get("A", "c1");

          expect(type.args.dada).toBe(2);
          expect(type.args.gu1).toBe(1);
          expect(type.args.gu2).toBe(2);
        });
      });

      describe("type config top-level properties merge-clone -", function() {
        var typeConfigLocked = {
          "name":      1,
          "type":      1,
          "source":    1,
          "dataReqs":  1
        };

        it("should copy non-reserved config properties", function() {
          var typeConfig1 = {
            id: "A",
            foo: "bar1",
            bar: "dada1"
          };

          var typeConfig2 = {
            id: "A",
            foo: "bar2"
          };

          typeRegistry.addConfig(typeConfig1);
          typeRegistry.addConfig(typeConfig2);

          var type = typeRegistry.get("A");

          expect(type.foo).toBe("bar2");
          expect(type.bar).toBe("dada1");
        });

        it("should clone non-reserved config properties", function() {
          var typeConfig1 = {
            id: "A",
            foo: {a:1},
            bar: {b:2}
          };

          var typeConfig2 = {
            id: "A",
            foo: {c:3}
          };

          typeRegistry.addConfig(typeConfig1);
          typeRegistry.addConfig(typeConfig2);

          var type = typeRegistry.get("A");

          expect(type.foo).not.toBe(typeConfig1.foo);
          expect(type.foo).not.toBe(typeConfig2.foo);
          expect(type.foo).toEqual(typeConfig2.foo);
          expect(type.bar).not.toBe(typeConfig1.bar);
          expect(type.bar).toEqual(typeConfig1.bar);
        });

        it("should clone non-shadowed visual type properties", function() {
          var typeConfig1 = {
            id: "A"
          };

          typeRegistry.addConfig(typeConfig1);

          var type = typeRegistry.get("A");

          expect(type.lala).not.toBe(typeList[0].lala);
          expect(type.lala).toEqual(typeList[0].lala);
        });

        it("should ignore reserved config properties", function() {
          typeRegistry.addConfig(typeConfigLocked);

          var type = typeRegistry.get("A");

          for(var p in typeConfigLocked) {
            if(typeConfigLocked[p] === 1) {
              expect(type[p]).toBe(undefined);
            }
          }
        });
      });
    });

    describe("container cache -", function() {
      var typeRegistry,
          typeList = [
            {id: "A"},
            {id: "B"}
          ];

      beforeEach(function() {
        typeRegistry = new TypeRegistry();

        typeRegistry.add(typeList[0]);
        typeRegistry.add(typeList[1]);
      });

      it("should use cache and return the same configured visual type", function() {
        var typeConfig1 = {
            id: "A"
          };

        typeRegistry.addConfig(typeConfig1);

        var typeA1 = typeRegistry.get("A");

        expect(typeA1 != null).toBe(true);

        var typeA2 = typeRegistry.get("A");

        expect(typeA2).toBe(typeA1);
      });

      it("should clear a container's cache when a config is added for that container (any container)", function() {
        var typeConfig1 = {
            id: "A"
          };
        var typeConfig2 = {
            id: "A"
          };

        typeRegistry.addConfig(typeConfig1);

        var typeA1 = typeRegistry.get("A");

        typeRegistry.addConfig(typeConfig2);

        var typeA2 = typeRegistry.get("A");

        expect(typeA1).not.toBe(typeA2);
        expect(typeA1).toEqual(typeA2);
      });

      it("should clear a container's cache when a config is added for that container (specific container)", function() {
        var typeConfig1 = {
            id: "A"
          };
        var typeConfig2 = {
            id: "A",
            container: "c1"
          };

        typeRegistry.addConfig(typeConfig1);

        var typeA1 = typeRegistry.get("A", "c1");

        typeRegistry.addConfig(typeConfig2);

        var typeA2 = typeRegistry.get("A", "c1");

        expect(typeA1).not.toBe(typeA2);
        expect(typeA1).toEqual(typeA2);
      });

      it("should not clear the any-container cache when a config is added for a specific container", function() {
        var typeConfig1 = {
            id: "A"
          };
        var typeConfig2 = {
            id: "A",
            container: "c1"
          };

        typeRegistry.addConfig(typeConfig1);

        var typeA1 = typeRegistry.get("A");

        typeRegistry.addConfig(typeConfig2);

        var typeA2 = typeRegistry.get("A");

        expect(typeA1).toBe(typeA2);
      });

      it("should not clear a container's cache when a config is added for another specific container", function() {
        var typeConfig1 = {
            id: "A",
            container: "c1"
          };
        var typeConfig2 = {
            id: "A",
            container: "c2"
          };

        typeRegistry.addConfig(typeConfig1);

        var typeA1 = typeRegistry.get("A", "c1");

        typeRegistry.addConfig(typeConfig2);

        var typeA2 = typeRegistry.get("A", "c1");

        expect(typeA1).toBe(typeA2);
      });
    });

    describe("#getAll(container) -", function() {
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

      it("should return all of the registered visual types when asked for a specific container", function() {
        var types = typeRegistry.getAll("c1");

        expect(types instanceof Array).toBe(true);

        expect(types).toEqual(typeList);
      });

      it("should return all of the enabled visual types for a specific container", function() {
        typeRegistry.addConfig({
          id: "A",
          container: "c1",
          enabled: false
        });

        expect(typeRegistry.getAll().length).toBe(3);
        expect(typeRegistry.getAll("c1").length).toBe(2);
        expect(typeRegistry.getAll("c2").length).toBe(3);
      });
    });
  });

  describe("typeRegistry - Configuration -", function() {

    describe("pre-loaded configurations -", function() {
      beforeEach(function() {
        requirejs.undef("pentaho/visual/type/registry");
        requirejs.undef("pentaho/service!IVisualTypeProvider");
        requirejs.undef("pentaho/service!IVisualApiConfiguration");
        requirejs.undef("pentaho/service");

        requirejs.undef("foo");
        requirejs.undef("bar");
      });

      it("should be pre-loaded with visual types obtained from all registered 'IVisualTypeProvider' services", function(done) {
        var typeA = {id: "A"},
            typeB = {id: "B"},
            config1 = {id: "A", container: "c1", foo: 1},
            config2 = {id: "B", container: "c1", foo: 2},
            fooModule = {
              getAll: function() {
                return [typeA, typeB];
              }
            };

        define("foo", fooModule);
        define("bar", {
          types: [
            config1,
            config2
          ]
        });

        // Reset current service configuration
        require.config({
          config: {"pentaho/service": null}
        });

        // Configure foo and bar
        require.config({
          config: {
            "pentaho/service": {
              "foo": "IVisualTypeProvider",
              "bar": "IVisualApiConfiguration"
            }
          }
        });

        require(["pentaho/visual/type/registry"], function(typeRegistry) {
          var types = typeRegistry.getAll();

          expect(types.length).toBe(2);


          var type = typeRegistry.get("A", "c1");
          expect(type.foo).toBe(1);

          type = typeRegistry.get("B", "c1");
          expect(type.foo).toBe(2);

          done();
        });
      });
    });
  });
});
