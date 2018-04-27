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
define([
  "pentaho/type/Context",
  "pentaho/data/Table",
  "../role/adaptationUtil",
  "tests/pentaho/util/errorMatch"
], function(Context, Table, adaptationUtil, errorMatch) {

  "use strict";

  /* globals jasmine, console, expect, it, describe, beforeEach */

  describe("pentaho.visual.base.ModelAdapter", function() {

    var context;
    var Model;
    var ModelAdapter;
    var ExternalProperty;

    var buildAdapter = adaptationUtil.buildAdapter;
    var ModelWithStringRole;
    var ElementIdentityStrategy;
    var CombineStrategy;

    beforeAll(function() {
      return Context.createAsync()
        .then(function(_context) {

          context = _context;

          return context.getDependencyApplyAsync([
            "pentaho/visual/base/model",
            "pentaho/visual/base/modelAdapter",
            "pentaho/visual/role/adaptation/strategy",
            "pentaho/visual/role/externalProperty"
          ], function(_Model, _ModelAdapter, _BaseStrategy, _ExternalProperty) {
            Model = _Model;
            ModelAdapter = _ModelAdapter;
            ExternalProperty = _ExternalProperty;

            var mocks = adaptationUtil.createMocks(Model, ModelAdapter, _BaseStrategy);

            ModelWithStringRole = mocks.ModelWithStringRole;
            ElementIdentityStrategy = mocks.ElementIdentityStrategy;
            CombineStrategy = mocks.CombineStrategy;
          });
        });
    });

    // region helper methods
    function getDataSpec1() {
      return {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "product", type: "string", label: "Product"},
          {name: "sales", type: "number", label: "Sales"},
          {name: "date", type: "date", label: "Date"}
        ],
        rows: [
          {c: [{v: "PT", f: "Portugal"}, "fish", 100, "2016-01-01"]},
          {c: ["Ireland", "beer", 200, "2016-01-02"]}
        ]
      };
    }

    function getDataSpec2() {
      return {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "product", type: "string", label: "Product"},
          {name: "sales", type: "number", label: "Sales"},
          {name: "date", type: "date", label: "Date"}
        ],
        rows: [
          {c: [{v: "PT", f: "Portugal"}, "fish", 100, "2016-01-01"]},
          {c: [{v: "PT", f: "Portugal"}, "potatoes", 200, "2015-02-03"]},
          {c: ["Ireland", "beer", 200, "2016-01-02"]}
        ]
      };
    }

    // endregion

    // ---

    function Cell(value, formatted) {
      this.value = value;
      this.formatted = formatted;
    }

    Cell.prototype.valueOf = function() {
      return this.value;
    };

    Cell.prototype.toString = function() {
      return this.formatted;
    };

    // ---

    describe(".extend(...)", function() {

      it("should define a model adapter subtype when no internal model is specified", function() {

        var DerivedModelAdapter = ModelAdapter.extend();
      });

      it("should define a model adapter subtype for an internal model type having no visual roles", function() {

        var DerivedModel = Model.extend();

        var DerivedModelAdapter = ModelAdapter.extend({
          $type: {
            props: {model: {valueType: DerivedModel}}
          }
        });
      });

      describe("when external visual role properties have no specification", function() {

        it("should define a model adapter subtype for an internal model type having visual roles", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: [
                {name: "x", base: "pentaho/visual/role/property"}
              ]
            }
          });

          var DerivedModelAdapter = ModelAdapter.extend({
            $type: {
              props: {model: {valueType: DerivedModel}}
            }
          });

          var internalPropType = DerivedModel.type.get("x");
          var externalPropType = DerivedModelAdapter.type.get("x");

          expect(externalPropType._internalProperty).toBe(internalPropType);

          expect(externalPropType instanceof ExternalProperty.Type).toBe(true);
        });

        it("should create an external visual role property for a new internal role", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: [
                {name: "x", base: "pentaho/visual/role/property"}
              ]
            }
          });

          var DerivedModelAdapter = ModelAdapter.extend({
            $type: {
              props: {model: {valueType: DerivedModel}}
            }
          });

          // ---

          var DerivedModel2 = DerivedModel.extend({
            $type: {
              props: [
                {name: "y", base: "pentaho/visual/role/property"}
              ]
            }
          });

          var DerivedModelAdapter2 = DerivedModelAdapter.extend({
            $type: {
              props: {model: {valueType: DerivedModel2}}
            }
          });

          var internalPropType = DerivedModel2.type.get("y");
          var externalPropType = DerivedModelAdapter2.type.get("y");

          expect(externalPropType._internalProperty).toBe(internalPropType);

          expect(externalPropType instanceof ExternalProperty.Type).toBe(true);
        });

        it("should override an external visual role property for an overridden internal role", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: [
                {name: "x", base: "pentaho/visual/role/property"}
              ]
            }
          });

          var DerivedModelAdapter = ModelAdapter.extend({
            $type: {
              props: {model: {valueType: DerivedModel}}
            }
          });

          // ---

          var DerivedModel2 = DerivedModel.extend({
            $type: {
              props: [
                {name: "x", fields: {isRequired: true}}
              ]
            }
          });

          var DerivedModelAdapter2 = DerivedModelAdapter.extend({
            $type: {
              props: {model: {valueType: DerivedModel2}}
            }
          });

          var internalPropType = DerivedModel2.type.get("x");
          var externalPropType = DerivedModelAdapter2.type.get("x");

          expect(externalPropType._internalProperty).toBe(internalPropType);
          expect(externalPropType instanceof ExternalProperty.Type).toBe(true);
        });
      });

      describe("when external visual role properties have a specification", function() {

        it("should define a model adapter subtype for an internal model type having visual roles", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: [
                {name: "x", base: "pentaho/visual/role/property"}
              ]
            }
          });

          var DerivedModelAdapter = ModelAdapter.extend({
            $type: {
              props: {
                model: {valueType: DerivedModel},
                x: {strategies: []}
              }
            }
          });

          var internalPropType = DerivedModel.type.get("x");
          var externalPropType = DerivedModelAdapter.type.get("x");

          expect(externalPropType._internalProperty).toBe(internalPropType);

          expect(externalPropType instanceof ExternalProperty.Type).toBe(true);
        });

        it("should create an external visual role property for a new internal role", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: [
                {name: "x", base: "pentaho/visual/role/property"}
              ]
            }
          });

          var DerivedModelAdapter = ModelAdapter.extend({
            $type: {
              props: {model: {valueType: DerivedModel}}
            }
          });

          // ---

          var DerivedModel2 = DerivedModel.extend({
            $type: {
              props: [
                {name: "y", base: "pentaho/visual/role/property"}
              ]
            }
          });

          var DerivedModelAdapter2 = DerivedModelAdapter.extend({
            $type: {
              props: {
                model: {valueType: DerivedModel2},
                y: {strategies: []}
              }
            }
          });

          var internalPropType = DerivedModel2.type.get("y");
          var externalPropType = DerivedModelAdapter2.type.get("y");

          expect(externalPropType._internalProperty).toBe(internalPropType);

          expect(externalPropType instanceof ExternalProperty.Type).toBe(true);
        });

        it("should override an external visual role property for an overridden internal role", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: [
                {name: "x", base: "pentaho/visual/role/property"}
              ]
            }
          });

          var DerivedModelAdapter = ModelAdapter.extend({
            $type: {
              props: {model: {valueType: DerivedModel}}
            }
          });

          // ---

          var DerivedModel2 = DerivedModel.extend({
            $type: {
              props: [
                {name: "x", fields: {isRequired: true}}
              ]
            }
          });

          var DerivedModelAdapter2 = DerivedModelAdapter.extend({
            $type: {
              props: {
                model: {valueType: DerivedModel2},
                x: {strategies: []}
              }
            }
          });

          var internalPropType = DerivedModel2.type.get("x");
          var externalPropType = DerivedModelAdapter2.type.get("x");

          expect(externalPropType._internalProperty).toBe(internalPropType);
          expect(externalPropType instanceof ExternalProperty.Type).toBe(true);
        });
      });
    });

    describe("update internal model and external adapters", function() {

      describe("when constructed", function() {

        describe("Mapping#modeFixed", function() {

          it("should update the modeFixed of the internal mapping", function() {

            var strategies = [ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var model = new ModelWithStringRole();
            var modelAdapter = new DerivedModelAdapter({
              model: model,
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country"]
              }
            });

            var internalPropType = ModelWithStringRole.type.get("roleA");

            expect(modelAdapter.model.roleA.modeFixed).toBe(internalPropType.modes.at(0));
          });
        });

        describe("Mapping#fields", function() {

          it("should update the fields of the internal mapping (identity strategy)", function() {

            var strategies = [ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var model = new ModelWithStringRole();
            var modelAdapter = new DerivedModelAdapter({
              model: model,
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country"]
              }
            });

            var fields = modelAdapter.model.roleA.fields;
            expect(fields.count).toBe(1);
            expect(fields.at(0).name).toBe("country");
          });

          it("should update the fields of the internal mapping (many to one strategy)", function() {

            var strategies = [CombineStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var model = new ModelWithStringRole();

            var modelAdapter = new DerivedModelAdapter({
              model: model,
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country", "product"]
              }
            });

            var fields = modelAdapter.model.roleA.fields;
            expect(fields.count).toBe(1);
            expect(fields.at(0).name).toBe(CombineStrategy.columnName);
          });
        });

        describe("Model#data", function() {

          it("should update the data of the internal model with the external data (identity strategy)", function() {

            var strategies = [ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var model = new ModelWithStringRole();

            var modelAdapter = new DerivedModelAdapter({
              model: model,
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country"]
              }
            });

            var internalData = modelAdapter.model.data;
            expect(internalData).not.toBe(null);
            expect(internalData).toBe(modelAdapter.data);
          });

          it("should update the data of the internal model with a copy (many to one strategy)", function() {

            var strategies = [CombineStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var model = new ModelWithStringRole();

            var modelAdapter = new DerivedModelAdapter({
              model: model,
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country", "product"]
              }
            });

            var internalData = modelAdapter.model.data;
            expect(internalData).not.toBe(null);
            expect(internalData).not.toBe(modelAdapter.data);
          });
        });

        describe("Model#selectionFilter", function() {

          it("should update the selectionFilter of the internal model (identity strategy)", function() {

            var strategies = [ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var model = new ModelWithStringRole();

            spyOn(ElementIdentityStrategy.prototype, "map").and.callFake(function() {
              return [new Cell("PT2", "Portugal")];
            });

            var modelAdapter = new DerivedModelAdapter({
              model: model,
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country"]
              },
              selectionFilter: {_: "=", p: "country", v: "PT"}
            });

            var selectionFilter = modelAdapter.model.selectionFilter;
            expect(selectionFilter).not.toBe(null);

            var expectedFilter = context.instances.get({_: "=", p: "country", v: "PT2"});
            expect(selectionFilter.equals(expectedFilter)).toBe(true);
          });

          it("should update the selectionFilter of the internal model (many to one strategy)", function() {

            var strategies = [CombineStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var model = new ModelWithStringRole();

            spyOn(CombineStrategy.prototype, "map").and.callFake(function() {
              return [new Cell("PT~fish", "Portugal ~ Fish")];
            });

            var modelAdapter = new DerivedModelAdapter({
              model: model,
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country", "product"]
              },
              selectionFilter: {
                _: "and",
                o: [
                  {_: "=", p: "country", v: "PT"},
                  {_: "=", p: "product", v: "fish"}
                ]
              }
            });

            var selectionFilter = modelAdapter.model.selectionFilter;
            expect(selectionFilter).not.toBe(null);

            var expectedFilter = context.instances.get({
              _: "and",
              o: [ {_: "=", p: CombineStrategy.columnName, v: "PT~fish"} ]
            });
            expect(selectionFilter.equals(expectedFilter)).toBe(true);
          });
        });
      });

      describe("when external fields change", function() {

        var CustomModel;
        var DerivedModelAdapter;
        var internalPropType;
        var modelAdapter;

        beforeAll(function() {
          CustomModel = Model.extend({
            $type: {
              props: {
                roleA: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string"},
                    {dataType: "number"}
                  ]
                }
              }
            }
          });

          var strategies = [ElementIdentityStrategy.type];

          DerivedModelAdapter = buildAdapter(ModelAdapter, CustomModel, [
            {
              name: "roleA",
              strategies: strategies
            }
          ]);

          internalPropType = CustomModel.type.get("roleA");
        });

        beforeEach(function() {

          var model = new ModelWithStringRole();

          modelAdapter = new DerivedModelAdapter({
            model: model,
            data: new Table(getDataSpec1()),
            roleA: {
              fields: ["country"]
            }
          });
        });

        it("should update the modeFixed of the internal mapping", function() {

          expect(modelAdapter.model.roleA.modeFixed).toBe(internalPropType.modes.at(0));

          modelAdapter.roleA.fields = ["sales"];

          expect(modelAdapter.model.roleA.modeFixed).toBe(internalPropType.modes.at(1));
        });

        it("should update the fields of the internal mapping", function() {

          var internalFields = modelAdapter.model.roleA.fields;

          expect(internalFields.count).toBe(1);
          expect(internalFields.at(0).name).toBe("country");

          modelAdapter.roleA.fields = ["sales"];

          expect(internalFields.count).toBe(1);
          expect(internalFields.at(0).name).toBe("sales");
        });

        it("should update the strategy even if the same strategy type is being used", function() {

          var strategy1 = modelAdapter.roleA.strategy;
          var strategyType1 = modelAdapter.__adaptationModel.roleInfoMap.roleA.strategyApplication.strategyType;

          expect(strategy1).not.toBe(null);

          // ---

          modelAdapter.roleA.fields = ["sales"];

          // ---

          var strategy2 = modelAdapter.roleA.adapter;
          var strategyType2 = modelAdapter.__adaptationModel.roleInfoMap.roleA.strategyApplication.strategyType;

          expect(strategy2).not.toBe(null);

          expect(strategyType2).toBe(strategyType1);
          expect(strategy2).not.toBe(strategy1);
        });

        it("should not update the data of the internal model if the new strategies " +
          "are still identity", function() {

          var internalData = modelAdapter.model.data;

          modelAdapter.roleA.fields = ["sales"];

          expect(modelAdapter.model.data).toBe(internalData);
        });
      });

      describe("when external data changes (same metadata)", function() {

        var DerivedModelAdapter;
        var modelAdapter;

        beforeAll(function() {

          var strategies = [ElementIdentityStrategy.type];

          DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
            {
              name: "roleA",
              strategies: strategies
            }
          ]);
        });

        beforeEach(function() {

          var model = new ModelWithStringRole();

          modelAdapter = new DerivedModelAdapter({
            model: model,
            data: new Table(getDataSpec1()),
            roleA: {
              fields: ["country"]
            }
          });
        });

        it("should update the strategy even if the same strategy type is being used", function() {

          var strategy1 = modelAdapter.roleA.strategy;
          expect(strategy1).not.toBe(null);

          // ---

          modelAdapter.data = new Table(getDataSpec1());

          // ---

          var strategy2 = modelAdapter.roleA.strategy;
          expect(strategy2).not.toBe(null);

          expect(strategy2).not.toBe(strategy1);
        });

        it("should update the strategy even if the fields have also changed, but to the same value", function() {

          var strategy1 = modelAdapter.roleA.strategy;
          expect(strategy1).not.toBe(null);

          modelAdapter.$type.context.enterChange().using(function(scope) {

            // Create a changeset, but with no changes...
            modelAdapter.roleA.fields = modelAdapter.roleA.fields.toArray(function(mappingField) {
              return mappingField.name;
            });

            expect(modelAdapter.$changeset.getChange("roleA")).not.toBe(null);

            // ---

            modelAdapter.data = new Table(getDataSpec1());

            scope.accept();
          });

          // ---

          var strategy2 = modelAdapter.roleA.strategy;
          expect(strategy2).not.toBe(null);

          expect(strategy2).not.toBe(strategy1);
        });

        it("should not update the modeFixed of the internal mapping", function() {

          var internalMode1 = modelAdapter.model.roleA.modeFixed;
          expect(internalMode1).not.toBe(null);

          // ---

          modelAdapter.data = new Table(getDataSpec1());

          // ---

          var internalMode2 = modelAdapter.model.roleA.modeFixed;
          expect(internalMode2).not.toBe(null);

          expect(internalMode2).toBe(internalMode1);
        });

        it("should not update the fields of the internal mapping", function() {

          var internalFields = modelAdapter.model.roleA.fields;

          expect(internalFields.count).toBe(1);
          expect(internalFields.at(0).name).toBe("country");

          // ---

          modelAdapter.data = new Table(getDataSpec1());

          // ---

          internalFields = modelAdapter.model.roleA.fields;

          expect(internalFields.count).toBe(1);
          expect(internalFields.at(0).name).toBe("country");
        });
      });

      describe("when external selectionFilter changes", function() {

        it("should update the selectionFilter of the internal model", function() {

          var strategies = [ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
            {
              name: "roleA",
              strategies: strategies
            }
          ]);

          var model = new ModelWithStringRole();

          spyOn(ElementIdentityStrategy.prototype, "map").and.callFake(function() {
            return [new Cell("PT2", "Portugal")];
          });

          var modelAdapter = new DerivedModelAdapter({
            model: model,
            data: new Table(getDataSpec1()),
            roleA: {
              fields: ["country"]
            },
            selectionFilter: {_: "=", p: "country", v: "PT"}
          });

          var selectionFilter1 = modelAdapter.model.selectionFilter;

          expect(selectionFilter1).not.toBe(null);

          ElementIdentityStrategy.prototype.map.and.callFake(function() {
            return [new Cell("PT4", "Portugal")];
          });

          // ---

          modelAdapter.selectionFilter = {_: "=", p: "country", v: "PT3"};

          // ---

          var selectionFilter2 = modelAdapter.model.selectionFilter;

          expect(selectionFilter2).not.toBe(null);

          expect(selectionFilter2).not.toBe(selectionFilter1);
        });

        it("should not change the strategy", function() {

          var strategies = [ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
            {
              name: "roleA",
              strategies: strategies
            }
          ]);

          var model = new ModelWithStringRole();

          spyOn(ElementIdentityStrategy.prototype, "map").and.callFake(function() {
            return [new Cell("PT2", "Portugal")];
          });

          var modelAdapter = new DerivedModelAdapter({
            model: model,
            data: new Table(getDataSpec1()),
            roleA: {
              fields: ["country"]
            },
            selectionFilter: {_: "=", p: "country", v: "PT"}
          });

          ElementIdentityStrategy.prototype.map.and.callFake(function() {
            return [new Cell("PT4", "Portugal")];
          });

          var strategy1 = modelAdapter.roleA.strategy;
          expect(strategy1).not.toBe(null);

          // ---

          modelAdapter.selectionFilter = {_: "=", p: "country", v: "PT3"};

          // ---

          var strategy2 = modelAdapter.roleA.strategy;
          expect(strategy2).not.toBe(null);

          expect(strategy2).toBe(strategy1);
        });

        it("should not change the data of the internal model", function() {

          var strategies = [ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
            {
              name: "roleA",
              strategies: strategies
            }
          ]);

          var model = new ModelWithStringRole();

          spyOn(ElementIdentityStrategy.prototype, "map").and.callFake(function() {
            return [new Cell("PT2", "Portugal")];
          });

          var modelAdapter = new DerivedModelAdapter({
            model: model,
            data: new Table(getDataSpec1()),
            roleA: {
              fields: ["country"]
            },
            selectionFilter: {_: "=", p: "country", v: "PT"}
          });

          ElementIdentityStrategy.prototype.map.and.callFake(function() {
            return [new Cell("PT4", "Portugal")];
          });

          var internalData1 = modelAdapter.model.data;
          expect(internalData1).not.toBe(null);

          // ---

          modelAdapter.selectionFilter = {_: "=", p: "country", v: "PT3"};

          // ---

          var internalData2 = modelAdapter.model.data;
          expect(internalData2).not.toBe(null);

          expect(internalData2).toBe(internalData1);
        });
      });

      describe("when internal selectionFilter changes", function() {

        it("should update the selectionFilter of the external model (identity strategy)", function() {
          var strategies = [ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
            {
              name: "roleA",
              strategies: strategies
            }
          ]);

          var model = new ModelWithStringRole();

          spyOn(ElementIdentityStrategy.prototype, "map").and.callFake(function() {
            return [new Cell("PT2", "Portugal")];
          });

          var modelAdapter = new DerivedModelAdapter({
            model: model,
            data: new Table(getDataSpec1()),
            roleA: {
              fields: ["country"]
            },
            selectionFilter: {_: "=", p: "country", v: "PT"}
          });

          var selectionFilter1 = modelAdapter.selectionFilter;

          expect(selectionFilter1).not.toBe(null);

          spyOn(ElementIdentityStrategy.prototype, "invert").and.callFake(function() {
            return [new Cell("PT4", "Portugal")];
          });

          // ---

          modelAdapter.model.selectionFilter = {_: "=", p: "country", v: "PT3"};

          // ---

          var selectionFilter2 = modelAdapter.selectionFilter;

          expect(selectionFilter2).not.toBe(null);

          expect(selectionFilter2).not.toBe(selectionFilter1);

          var expectedFilter = context.instances.get({_: "=", p: "country", v: "PT4"});
          expect(selectionFilter2.equals(expectedFilter)).toBe(true);
        });

        it("should update the selectionFilter of the external model (many to one strategy)", function() {
          var strategies = [CombineStrategy.type];

          var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
            {
              name: "roleA",
              strategies: strategies
            }
          ]);

          var model = new ModelWithStringRole();

          spyOn(CombineStrategy.prototype, "map").and.callFake(function() {
            return [new Cell("PT~fish", "Portugal ~ Fish")];
          });

          var modelAdapter = new DerivedModelAdapter({
            model: model,
            data: new Table(getDataSpec1()),
            roleA: {
              fields: ["country", "product"]
            },
            selectionFilter: {
              _: "and",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "=", p: "product", v: "fish"}
              ]
            }
          });

          var selectionFilter1 = modelAdapter.model.selectionFilter;
          expect(selectionFilter1).not.toBe(null);

          spyOn(CombineStrategy.prototype, "invert").and.callFake(function() {
            return [new Cell("PT4", "Portugal"), new Cell("bird", "Bird")];
          });
          // ---

          modelAdapter.model.selectionFilter = {_: "=", p: CombineStrategy.columnName, v: "PT4~bird"};

          // ---

          var selectionFilter2 = modelAdapter.selectionFilter;

          expect(selectionFilter2).not.toBe(null);

          expect(selectionFilter2).not.toBe(selectionFilter1);

          var expectedFilter = context.instances.get({
            _: "and",
            o: [
              {_: "=", p: "country", v: "PT4"},
              {_: "=", p: "product", v: "bird"}
            ]
          });
          expect(selectionFilter2.equals(expectedFilter)).toBe(true);
        });
      });
    });

    describe("#_convertFilterToExternal", function() {

      it("should convert the filter's internal model namespace to " +
        "the external model namespace (many to one strategy)", function() {
        var strategies = [CombineStrategy.type];

        var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
          {
            name: "roleA",
            strategies: strategies
          }
        ]);

        var model = new ModelWithStringRole();

        spyOn(CombineStrategy.prototype, "map").and.callFake(function() {
          return [new Cell("PT~fish", "Portugal ~ Fish")];
        });

        var modelAdapter = new DerivedModelAdapter({
          model: model,
          data: new Table(getDataSpec1()),
          roleA: {
            fields: ["country", "product"]
          },
          selectionFilter: {
            _: "and",
            o: [
              {_: "=", p: "country", v: "PT"},
              {_: "=", p: "product", v: "fish"}
            ]
          }
        });

        var selectionFilter1 = modelAdapter.selectionFilter;
        expect(selectionFilter1).not.toBe(null);

        var selectionInternalFilter1 = modelAdapter.model.selectionFilter;
        expect(selectionInternalFilter1).not.toBe(null);

        spyOn(CombineStrategy.prototype, "invert").and.callFake(function() {
          return [new Cell("PT4", "Portugal"), new Cell("bird", "Bird")];
        });
        // ---

        var filterToConvert = context.instances.get({_: "=", p: CombineStrategy.columnName, v: "PT4~bird"});
        var translatedFilter = modelAdapter._convertFilterToExternal(filterToConvert);

        // ---

        var selectionFilter2 = modelAdapter.selectionFilter;
        expect(selectionFilter2).not.toBe(null);

        var selectionInternalFilter2 = modelAdapter.model.selectionFilter;
        expect(selectionInternalFilter2).not.toBe(null);

        // filter conversion does not affect selection
        expect(selectionFilter2).toBe(selectionFilter1);
        expect(selectionInternalFilter2).toBe(selectionInternalFilter1);

        expect(translatedFilter).not.toBe(null);

        var expectedFilter = context.instances.get({
          _: "and",
          o: [
            {_: "=", p: "country", v: "PT4"},
            {_: "=", p: "product", v: "bird"}
          ]
        });
        expect(translatedFilter.equals(expectedFilter)).toBe(true);
      });
    });

    describe("#_convertFilterToInternal", function() {

      describe("using identity strategy", function() {
        var modelAdapter;
        var strategies;

        beforeEach(function() {
          strategies = [ElementIdentityStrategy.type];

          spyOn(ElementIdentityStrategy.prototype, "map").and.callFake(function (inputValues) {
            return [new Cell(inputValues[0], "")];
          });
        });

        describe("and one visual role", function() {

          beforeEach(function() {
            var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var model = new ModelWithStringRole();

            modelAdapter = new DerivedModelAdapter({
              model: model,
              data: new Table(getDataSpec2()),
              roleA: {
                fields: ["country"]
              }
            });
          });

          describe("should convert the filter's external model namespace to " +
            "the internal model namespace ", function() {

            it("when filtering with a top isEquals", function() {

              var externalFilter = context.instances.get({_: "=", p: "country", v: "PT"});

              var actualInternalFilter = modelAdapter._convertFilterToInternal(externalFilter);

              // ---
              var expectedInternalFilter = context.instances.get({_: "=", p: "country", v: "PT"});
              expect(actualInternalFilter.equals(expectedInternalFilter)).toBe(true);
            });

            it("when filtering a top Or", function() {
              var externalFilter = context.instances.get({
                _: "or",
                o: [
                  {_: "=", p: "country", v: "PT"},
                  {_: "=", p: "country", v: "Ireland"}
                ]
              });

              var actualInternalFilter = modelAdapter._convertFilterToInternal(externalFilter);

              // ---
              var expectedInternalFilter = context.instances.get({
                _: "or",
                o: [
                  {_: "=", p: "country", v: "PT"},
                  {_: "=", p: "country", v: "Ireland"}
                ]
              });
              expect(actualInternalFilter.equals(expectedInternalFilter)).toBe(true);

            });

            it("when filtering a top And of mismatching values", function() {
              var externalFilter = context.instances.get({
                _: "and",
                o: [
                  {_: "=", p: "country", v: "PT"},
                  {_: "=", p: "country", v: "Ireland"}
                ]
              });

              var actualInternalFilter = modelAdapter._convertFilterToInternal(externalFilter);

              // ---
              var expectedInternalFilter = context.instances.get({_: "false"});
              expect(actualInternalFilter.equals(expectedInternalFilter)).toBe(true);
            });

          });

        });

        describe("and two visual roles", function() {
          beforeEach(function() {
            var TwoVisualRolesModel = Model.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string"},
                      {dataType: "number"}
                    ]
                  },
                  roleB: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string"},
                      {dataType: "number"}
                    ]
                  }
                }
              }
            });

            var DerivedModelAdapter = buildAdapter(ModelAdapter, TwoVisualRolesModel, [
              {
                name: "roleA",
                strategies: strategies
              },
              {
                name: "roleB",
                strategies: strategies
              }
            ]);

            var model = new TwoVisualRolesModel();

            modelAdapter = new DerivedModelAdapter({
              model: model,
              data: new Table(getDataSpec2()),
              roleA: {
                fields: ["country"]
              },
              roleB: {
                fields: ["product"]
              }
            });
          });

          it("when filtering a top And of different properties", function() {
            var externalFilter = context.instances.get({
              _: "and",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "=", p: "product", v: "fish"}
              ]
            });

            var actualInternalFilter = modelAdapter._convertFilterToInternal(externalFilter);

            // ---
            var expectedInternalFilter = context.instances.get({
              _: "and",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "=", p: "product", v: "fish"}
              ]
            });
            expect(actualInternalFilter.equals(expectedInternalFilter)).toBe(true);
          });

          it("when filtering nested Ands they are flattened ", function() {
            var externalFilter = context.instances.get({
              _: "and",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "and",
                  o: [{_: "=", p: "product", v: "fish"}]}
              ]
            });

            var actualInternalFilter = modelAdapter._convertFilterToInternal(externalFilter);

            // ---
            var expectedInternalFilter = context.instances.get({
              _: "and",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "=", p: "product", v: "fish"}
              ]
            });
            expect(actualInternalFilter.equals(expectedInternalFilter)).toBe(true);
          });

          it("when filtering nested Ors they are flattened ", function() {
            var externalFilter = context.instances.get({
              _: "or",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "or",
                  o: [{_: "=", p: "product", v: "fish"}]}
              ]
            });

            var actualInternalFilter = modelAdapter._convertFilterToInternal(externalFilter);

            // ---
            var expectedInternalFilter = context.instances.get({
              _: "or",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "=", p: "product", v: "fish"}
              ]
            });
            expect(actualInternalFilter.equals(expectedInternalFilter)).toBe(true);
          });

        });

      });

      describe("using combine strategy with one visual role", function() {

        var modelAdapter;

        beforeEach(function() {
          var strategies = [CombineStrategy.type];

          spyOn(CombineStrategy.prototype, "map").and.callFake(function (inputValues) {
            if( inputValues[0] === undefined || inputValues[1] === undefined ) {
              return null;
            }
            return [new Cell( inputValues[0] +"~" + inputValues[1], "")];
          });

          var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
            {
              name: "roleA",
              strategies: strategies
            }
          ]);

          var model = new ModelWithStringRole();

          modelAdapter = new DerivedModelAdapter({
            model: model,
            data: new Table(getDataSpec2()),
            roleA: {
              fields: ["country", "product"]
            }
          });
        });

        describe("should convert the filter's external model namespace to " +
          "the internal model namespace ", function() {

          it("when filtering with an And of isEquals", function() {

            var externalFilter = context.instances.get({
              _: "and",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "=", p: "product", v: "fish"}
              ]
            });

            var actualInternalFilter = modelAdapter._convertFilterToInternal(externalFilter);

            // ---
            var expectedInternalFilter = context.instances.get({
              _: "and",
              o: [ { _: "=", p: CombineStrategy.columnName, v: "PT~fish"}]
            });
            expect(actualInternalFilter.equals(expectedInternalFilter)).toBe(true);
          });

          it("when filtering with an And of isEquals and other operands supported operands", function() {

            var externalFilter = context.instances.get({
              _: "and",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "=", p: "product", v: "fish"},
                {_: "or", o:[{_: "true"}]}
              ]
            });

            var actualInternalFilter = modelAdapter._convertFilterToInternal(externalFilter);

            // ---

            var expectedInternalFilter = context.instances.get({
              _: "and",
              o: [
                {_: "=", p: CombineStrategy.columnName, v: "PT~fish"},
                {_: "or", o:[{_: "true"}]}
              ]
            });


            expect(actualInternalFilter.equals(expectedInternalFilter)).toBe(true);
          });

          it("when filtering with an Or of And of isEquals", function() {

            // (C=PT & P=fish) | (C=Ireland & P=beer)
            var externalFilter = context.instances.get({
              _: "or",
              o: [
                { _: "and",
                  o: [
                    {_: "=", p: "country", v: "PT"},
                    {_: "=", p: "product", v: "fish"}
                  ]
                },
                { _: "and",
                  o: [
                    {_: "=", p: "country", v: "Ireland"},
                    {_: "=", p: "product", v: "beer"}
                  ]
                }
              ]
            });

            var actualInternalFilter = modelAdapter._convertFilterToInternal(externalFilter);

            // ---
            var expectedInternalFilter = context.instances.get({
              _: "or",
              o: [
                {_: "and",
                 o: [{_: "=", p: CombineStrategy.columnName, v: "PT~fish"}]},
                {_: "and",
                  o: [{_: "=", p: CombineStrategy.columnName, v: "Ireland~beer"}]}
                  ]
            });
            expect(actualInternalFilter.equals(expectedInternalFilter)).toBe(true);
          });
        });

        describe("should throw when the filter doesn't provide sufficient information for conversion.", function() {
          it("Using an isEqual filter", function() {

            var externalFilter = context.instances.get(
              {_: "=", p: "country", v: "PT"}
            );

            var act = function() {
              modelAdapter._convertFilterToInternal(externalFilter);
            };

            // ---
            expect( act ).toThrow(errorMatch.argInvalid("originalValuesMap"));
          });

          it("Using an Or of isEqual filter", function() {

            var externalFilter = context.instances.get({
              _: "or",
              o: [
                {_: "=", p: "country", v: "PT"},
                {_: "=", p: "product", v: "fish"}
              ]
            });

            var act = function() {
              modelAdapter._convertFilterToInternal(externalFilter);
            };

            // ---
            expect( act ).toThrow(errorMatch.argInvalid("originalValuesMap"));
          });
        });
      });

      describe("should throw when converting unsupported filter", function() {
        var modelAdapter;
        var strategies;

        beforeEach(function() {
          strategies = [ElementIdentityStrategy.type];

          spyOn(ElementIdentityStrategy.prototype, "map").and.callFake(function (inputValues) {
            return [new Cell(inputValues[0], "")];
          });

          var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
            {
              name: "roleA",
              strategies: strategies
            }
          ]);

          var model = new ModelWithStringRole();

          modelAdapter = new DerivedModelAdapter({
            model: model,
            data: new Table(getDataSpec2()),
            roleA: {
              fields: ["country"]
            }
          });
        });

        it("And with > filter", function() {
          var externalFilter = context.instances.get({
            _: "and",
            o: [ {_: ">", p: "something", v: 5 } ]
          });

          var act = function() {
            modelAdapter._convertFilterToInternal(externalFilter);
          };

          // ---
          expect(act).toThrow(errorMatch.argInvalid("filter"));
        });

      });
    });
  });
});
