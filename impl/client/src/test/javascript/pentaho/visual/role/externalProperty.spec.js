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
  "pentaho/type/changes/Transaction",
  "pentaho/visual/base/Model",
  "pentaho/visual/base/ModelAdapter",
  "pentaho/data/Table",
  "pentaho/type/SpecificationScope",
  "./adaptationUtil"
], function(Transaction, Model, ModelAdapter, Table, SpecificationScope, adaptationUtil) {

  "use strict";

  describe("pentaho.visual.role.ExternalProperty", function() {

    describe(".Type", function() {

      var buildAdapter = adaptationUtil.buildAdapter;
      var DerivedModel;
      var CustomModel;
      var ModelWithStringRole;
      var ModelWithStringListRole;

      var NullStrategy;
      var ListIdentityStrategy;
      var ElementIdentityStrategy;

      beforeAll(function() {
        DerivedModel = Model.extend({
          $type: {
            props: {
              "stringKeyRole": {
                base: "pentaho/visual/role/Property",
                isVisualKey: true,
                modes: [{dataType: "string"}]
              },
              "numberRole": {
                base: "pentaho/visual/role/Property",
                isVisualKey: false,
                modes: [{dataType: "number"}]
              },
              "elementKeyRole": {
                base: "pentaho/visual/role/Property",
                isVisualKey: true,
                modes: [{dataType: "element"}]
              },
              "stringAndNumberRole": {
                base: "pentaho/visual/role/Property",
                isVisualKey: false,
                modes: [
                  {dataType: "string"},
                  {dataType: "number"}
                ]
              }
            }
          }
        });

        var mocks = adaptationUtil.createMocks();

        ModelWithStringRole = mocks.ModelWithStringRole;
        ModelWithStringListRole = mocks.ModelWithStringListRole;

        NullStrategy = mocks.NullStrategy;
        ListIdentityStrategy = mocks.ListIdentityStrategy;
        ElementIdentityStrategy = mocks.ElementIdentityStrategy;
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
            {c: ["Portugal", "fish", 100, "2016-01-01"]},
            {c: ["Ireland", "beer", 200, "2016-01-02"]}
          ]
        };
      }

      function buildCustomModel(Model, propSpec) {
        return Model.extend({
          $type: { props: [propSpec || {}] }
        });
      }
      // endregion

      describe("#category", function() {
        var category;

        beforeEach(function() {
          category = "foo category";

          CustomModel = buildCustomModel(ModelWithStringRole, {
            name: "roleA", category: category
          })
        });

        it("should import category value correctly from '_internalProperty", function() {
          var DerivedModelAdapter = buildAdapter(CustomModel);

          var propType = DerivedModelAdapter.type.get("roleA");

          expect(propType.category).toBe(category);
        });

        it("should override the category value that was imported from '_internalProperty", function() {
          var override = category + " override";
          var DerivedModelAdapter = buildAdapter(CustomModel, {
            name: "roleA", category: override
          });

          var propType = DerivedModelAdapter.type.get("roleA");

          expect(propType.category).not.toBe(category);
          expect(propType.category).toBe(override);
        });
      });

      describe("#ordinal", function() {
        var ordinal;

        beforeEach(function() {
          ordinal = 9000;

          CustomModel = buildCustomModel(ModelWithStringRole, {
            name: "roleA", ordinal: ordinal
          });
        });

        it("should import ordinal value correctly from '_internalProperty", function () {
          var DerivedModelAdapter = buildAdapter(CustomModel);

          var propType = DerivedModelAdapter.type.get("roleA");
          expect(propType.ordinal).toBe(ordinal);
        });

        it("should override the ordinal value that was imported from '_internalProperty", function() {
          var override = 10000;
          var DerivedModelAdapter = buildAdapter(CustomModel, {
            name: "roleA", ordinal: override
          });

          var propType = DerivedModelAdapter.type.get("roleA");

          expect(propType.ordinal).not.toBe(ordinal);
          expect(propType.ordinal).toBe(override);
        });
      });

      describe("#label", function() {
        var label;

        beforeEach(function() {
          label = "foo label";

          CustomModel = buildCustomModel(ModelWithStringRole, {
            name: "roleA", label: label
          });
        });

        it("should import label value correctly from '_internalProperty", function () {
          var DerivedModelAdapter = buildAdapter(CustomModel);

          var propType = DerivedModelAdapter.type.get("roleA");
          expect(propType.label).toBe(label);
        });

        it("should override the label value that was imported from '_internalProperty", function() {
          var override = label + " override";
          var DerivedModelAdapter = buildAdapter(CustomModel, {
            name: "roleA", label: override
          });

          var propType = DerivedModelAdapter.type.get("roleA");

          expect(propType.label).not.toBe(label);
          expect(propType.label).toBe(override);
        });
      });

      describe("#description", function() {
        var description;

        beforeEach(function() {
          description = "foo description";

          CustomModel = buildCustomModel(ModelWithStringRole, {
            name: "roleA", description: description
          });
        });

        it("should import description value correctly from '_internalProperty", function () {
          var DerivedModelAdapter = buildAdapter(CustomModel);

          var propType = DerivedModelAdapter.type.get("roleA");
          expect(propType.description).toBe(description);
        });

        it("should override the description value that was imported from '_internalProperty", function() {
          var override = description + " override";
          var DerivedModelAdapter = buildAdapter(CustomModel, {
            name: "roleA", description: override
          });

          var propType = DerivedModelAdapter.type.get("roleA");

          expect(propType.description).not.toBe(description);
          expect(propType.description).toBe(override);
        });
      });

      describe("#helpUrl", function() {
        var helpUrl;

        beforeEach(function() {
          helpUrl = "http://foo.help.com";

          CustomModel = buildCustomModel(ModelWithStringRole, {
            name: "roleA", helpUrl: helpUrl
          });
        });

        it("should import helpUrl value correctly from '_internalProperty", function () {
          var DerivedModelAdapter = buildAdapter(CustomModel);

          var propType = DerivedModelAdapter.type.get("roleA");
          expect(propType.helpUrl).toBe(helpUrl);
        });

        it("should override the helpUrl value that was imported from '_internalProperty", function() {
          var override = helpUrl + "/override";
          var DerivedModelAdapter = buildAdapter(CustomModel, {
            name: "roleA", helpUrl: override
          });

          var propType = DerivedModelAdapter.type.get("roleA");

          expect(propType.helpUrl).not.toBe(helpUrl);
          expect(propType.helpUrl).toBe(override);
        });
      });

      describe("#isBrowsable", function() {
        var isBrowsable;

        beforeEach(function() {
          isBrowsable = false;

          CustomModel = buildCustomModel(ModelWithStringRole, {
            name: "roleA", isBrowsable: isBrowsable
          });
        });

        it("should import isBrowsable value correctly from '_internalProperty", function() {
          var DerivedModelAdapter = buildAdapter(CustomModel);

          var propType = DerivedModelAdapter.type.get("roleA");
          expect(propType.isBrowsable).toBe(isBrowsable);
        });

        it("should override the isBrowsable value that was imported from '_internalProperty", function() {
          var override = true;
          var DerivedModelAdapter = buildAdapter(CustomModel, {
            name: "roleA", isBrowsable: override
          });

          var propType = DerivedModelAdapter.type.get("roleA");

          expect(propType.isBrowsable).not.toBe(isBrowsable);
          expect(propType.isBrowsable).toBe(override);
        });
      });

      describe("#isVisualKey", function() {

        it("should be `true` if the internal property is a visual key", function() {

          var DerivedModelAdapter = buildAdapter(DerivedModel);

          var propType = DerivedModelAdapter.type.get("stringKeyRole");

          expect(propType.isVisualKey).toBe(true);
        });

        it("should be `false` if the internal property is not a visual key", function() {

          var DerivedModelAdapter = buildAdapter(DerivedModel);

          var propType = DerivedModelAdapter.type.get("numberRole");

          expect(propType.isVisualKey).toBe(false);
        });
      });

      describe("#strategies and #modes", function() {

        it("should default #strategies to the registered strategy instances if a root property", function() {

          function configAmd(localRequire) {

            localRequire.define("CustomStrategyA", ["pentaho/visual/role/adaptation/Strategy"], function(Strategy) {
              return Strategy.extend({
                $type: {
                  getInputTypeFor: function() { return null; }
                }
              });
            });

            localRequire.define("CustomStrategyB", ["pentaho/visual/role/adaptation/Strategy"], function(Strategy) {
              return Strategy.extend({
                $type: {
                  getInputTypeFor: function() { return null; }
                }
              });
            });

            localRequire.config({
              config: {
                "pentaho/modules": {
                  "CustomStrategyA": {base: "pentaho/visual/role/adaptation/Strategy"},
                  "CustomStrategyB": {base: "pentaho/visual/role/adaptation/Strategy"}
                }
              }
            });
          }

          return require.using([
            "pentaho/visual/base/Model",
            "pentaho/visual/base/modelAdapter",
            "pentaho/visual/role/ExternalProperty",
            "CustomStrategyA",
            "CustomStrategyB"
          ], configAmd, function(Model, ModelAdapter, ExternalProperty, CustomStrategyA, CustomStrategyB) {

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  "stringKeyRole": {
                    base: "pentaho/visual/role/Property",
                    isVisualKey: true,
                    modes: [{dataType: "string"}]
                  }
                }
              }
            });

            spyOn(ExternalProperty.type, "__setStrategyTypes");

            var DerivedModelAdapter = buildAdapter(DerivedModel);

            var propType = DerivedModelAdapter.type.get("stringKeyRole");

            var strategyTypes = propType.__setStrategyTypes.calls.argsFor(0)[0];

            expect(strategyTypes).toEqual(jasmine.arrayContaining([
              CustomStrategyA.type,
              CustomStrategyB.type
            ]));
          });
        });

        it("should default #strategies to the registered and " +
          "browsable strategy instances if a root property", function() {

          function configAmd(localRequire) {

            localRequire.define("CustomStrategyA", ["pentaho/visual/role/adaptation/Strategy"], function(Strategy) {
              return Strategy.extend({
                $type: {
                  getInputTypeFor: function() { return null; }
                }
              });
            });

            localRequire.define("my/configModule", function() {
              return {
                rules: [{
                  select: {type: "CustomStrategyA"},
                  apply: {
                    isBrowsable: false
                  }
                }]
              };
            });

            localRequire.config({
              config: {
                "pentaho/modules": {
                  "CustomStrategyA": {base: "pentaho/visual/role/adaptation/Strategy"},
                  "my/configModule": {type: "pentaho/config/spec/IRuleSet"}
                }
              }
            });
          }

          return require.using([
            "pentaho/visual/base/Model",
            "pentaho/visual/base/modelAdapter",
            "pentaho/visual/role/externalProperty",
            "CustomStrategyA"
          ], configAmd, function(Model, ModelAdapter, ExternalProperty, CustomStrategyA) {

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  "stringKeyRole": {
                    base: "pentaho/visual/role/Property",
                    isVisualKey: true,
                    modes: [{dataType: "string"}]
                  }
                }
              }
            });

            spyOn(ExternalProperty.type, "__setStrategyTypes");

            var DerivedModelAdapter = buildAdapter(DerivedModel);

            var propType = DerivedModelAdapter.type.get("stringKeyRole");

            var strategyTypes = propType.__setStrategyTypes.calls.argsFor(0)[0];

            expect(strategyTypes).not.toEqual(jasmine.arrayContaining([
              CustomStrategyA.type
            ]));
          });
        });

        it("should respect the specified #strategies", function() {

          var NullStrategy2 = NullStrategy.extend();

          var strategies = [NullStrategy.type, NullStrategy2.type];

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "stringKeyRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("stringKeyRole");

          expect(externalPropType.strategies).toEqual(strategies);
        });

        it("should generate an empty #modes list when there are no strategies", function() {

          var strategies = [];

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "stringKeyRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("stringKeyRole");

          expect(externalPropType.modes.count).toBe(0);
        });

        it("should generate an empty #modes list when no strategy methods are selected", function() {

          var strategies = [NullStrategy.type];

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "stringKeyRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("stringKeyRole");

          expect(externalPropType.modes.count).toBe(0);
        });

        it("should generate an external mode when an element identity strategy method is selected", function() {

          var strategies = [ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "stringKeyRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("stringKeyRole");

          expect(externalPropType.modes.count).toBe(1);
        });

        it("should generate an external mode distinct from the internal mode", function() {

          var strategies = [ElementIdentityStrategy.type];
          var internalPropType = DerivedModel.type.get("stringKeyRole");

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "stringKeyRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("stringKeyRole");

          expect(externalPropType.modes.at(0)).not.toBe(internalPropType.modes.at(0));
        });

        it("should generate a categorical external mode if the internal mode is categorical", function() {

          var strategies = [ElementIdentityStrategy.type];
          var internalPropType = DerivedModel.type.get("stringKeyRole");

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "stringKeyRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("stringKeyRole");

          expect(externalPropType.modes.at(0).isContinuous).toBe(false);
        });

        it("should generate a continuous external mode if the internal mode is continuous", function() {

          var strategies = [ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "numberRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("numberRole");

          expect(externalPropType.modes.at(0).isContinuous).toBe(true);
        });

        it("should generate external modes in order of internal modes", function() {

          var strategies = [ElementIdentityStrategy.type];

          var internalPropType = DerivedModel.type.get("stringAndNumberRole");

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "stringAndNumberRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("stringAndNumberRole");

          expect(externalPropType.modes.count).toBe(2);
          expect(externalPropType.modes.at(0).equals(internalPropType.modes.at(0))).toBe(true);
          expect(externalPropType.modes.at(1).equals(internalPropType.modes.at(1))).toBe(true);
        });

        it("should generate distinct external modes", function() {

          var strategies = [ElementIdentityStrategy.type, ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "numberRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("numberRole");

          expect(externalPropType.modes.count).toBe(1);
        });
      });

      describe("#fields", function() {

        describe(".countRangeOn(modelAdapter)", function() {

          describe("when there is no current mode", function() {

            it("should have countRange.min = 1 if internal role is required", function() {

              CustomModel = buildCustomModel(ModelWithStringRole, {
                name: "roleA", fields: { isRequired: true }
              });

              var DerivedModelAdapter = buildAdapter(CustomModel);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter();

              expect(modelAdapter.roleA.mode).toBe(null);
              expect(modelAdapter.model.roleA.modeFixed).toBe(null);

              var range = externalPropType.fields.countRangeOn(modelAdapter);

              expect(range.min).toBe(1);
            });

            it("should have countRange.min = 0 if internal role is not required", function() {

              var DerivedModelAdapter = buildAdapter(ModelWithStringRole);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter();

              expect(modelAdapter.roleA.mode).toBe(null);
              expect(modelAdapter.model.roleA.modeFixed).toBe(null);

              var range = externalPropType.fields.countRangeOn(modelAdapter);

              expect(range.min).toBe(0);
            });

            it("should have countRange.max = 1 if there are only element modes", function() {

              var strategies = [ElementIdentityStrategy.type];

              var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
                {
                  name: "roleA",
                  strategies: strategies
                }
              ]);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter();

              expect(modelAdapter.roleA.mode).toBe(null);
              expect(modelAdapter.model.roleA.modeFixed).toBe(null);

              var range = externalPropType.fields.countRangeOn(modelAdapter);

              expect(range.max).toBe(1);
            });

            it("should have countRange.max = Infinity if there is at least one list mode", function() {

              var strategies = [ElementIdentityStrategy.type, ListIdentityStrategy.type];

              var DerivedModelAdapter = buildAdapter(ModelWithStringListRole, [
                {
                  name: "roleA",
                  strategies: strategies
                }
              ]);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter();

              expect(modelAdapter.roleA.mode).toBe(null);
              expect(modelAdapter.model.roleA.modeFixed).toBe(null);

              var range = externalPropType.fields.countRangeOn(modelAdapter);

              expect(range.max).toBe(Infinity);
            });
          });

          describe("when there is a current mode", function() {

            it("should have countRange.min = 1 if internal role is required", function() {

              var strategies = [ElementIdentityStrategy.type];

              var CustomModel = Model.extend({
                $type: {
                  props: {
                    roleA: {
                      base: "pentaho/visual/role/Property",
                      modes: ["string"],
                      fields: {isRequired: true}
                    }
                  }
                }
              });

              var DerivedModelAdapter = buildAdapter(CustomModel, [
                {
                  name: "roleA",
                  strategies: strategies
                }
              ]);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter({
                data: new Table(getDataSpec1()),
                roleA: {
                  fields: ["country"]
                }
              });

              expect(modelAdapter.roleA.mode).not.toBe(null);
              expect(modelAdapter.model.roleA.modeFixed).not.toBe(null);

              var range = externalPropType.fields.countRangeOn(modelAdapter);

              expect(range.min).toBe(1);
            });

            it("should have countRange.min = 0 if internal role is not required", function() {

              var strategies = [ElementIdentityStrategy.type];

              var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
                {
                  name: "roleA",
                  strategies: strategies
                }
              ]);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter({
                data: new Table(getDataSpec1()),
                roleA: {
                  fields: ["country"]
                }
              });

              expect(modelAdapter.roleA.mode).not.toBe(null);
              expect(modelAdapter.model.roleA.modeFixed).not.toBe(null);

              var range = externalPropType.fields.countRangeOn(modelAdapter);

              expect(range.min).toBe(0);
            });

            it("should have countRange.max = 1 if the current mode is an element mode", function() {

              var strategies = [ElementIdentityStrategy.type];

              var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
                {
                  name: "roleA",
                  strategies: strategies
                }
              ]);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter({
                data: new Table(getDataSpec1()),
                roleA: {
                  fields: ["country"]
                }
              });

              expect(modelAdapter.roleA.mode).not.toBe(null);
              expect(modelAdapter.roleA.mode.dataType.isElement).toBe(true);
              expect(modelAdapter.model.roleA.modeFixed).not.toBe(null);

              var range = externalPropType.fields.countRangeOn(modelAdapter);

              expect(range.max).toBe(1);
            });

            it("should have countRange.max = Infinity if the current mode is a list mode", function() {

              var strategies = [ListIdentityStrategy.type];

              var DerivedModelAdapter = buildAdapter(ModelWithStringListRole, [
                {
                  name: "roleA",
                  strategies: strategies
                }
              ]);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter({
                data: new Table(getDataSpec1()),
                roleA: {
                  fields: ["country", "product"]
                }
              });

              expect(modelAdapter.roleA.mode).not.toBe(null);
              expect(modelAdapter.roleA.mode.dataType.isList).toBe(true);
              expect(modelAdapter.model.roleA.modeFixed).not.toBe(null);

              var range = externalPropType.fields.countRangeOn(modelAdapter);

              expect(range.max).toBe(Infinity);
            });
          });
        });
      });

      describe("#isApplicableOn(modelAdapter)", function() {
        var externalPropType;
        var internalProperty;
        var modelAdapter;

        beforeEach(function() {
          var DerivedModelAdapter = buildAdapter(DerivedModel);

          externalPropType = DerivedModelAdapter.type.get("elementKeyRole");
          internalProperty = externalPropType._internalProperty;

          modelAdapter = new DerivedModelAdapter({
            data: new Table(getDataSpec1())
          });
        });

        it("should call `isApplicableOn` from its ancestor and from `_internalProperty`.", function() {
          spyOn(externalPropType, "base").and.returnValue(true);
          spyOn(internalProperty, "isApplicableOn").and.callFake(function(model) {
            expect(model).toBe(modelAdapter.model);

            return true;
          });

          var isApplicableOn = externalPropType.isApplicableOn(modelAdapter);

          expect(internalProperty.isApplicableOn).toHaveBeenCalled();
          expect(isApplicableOn).toBe(true);
        });

        it("should only call `isApplicableOn` from its ancestor and not from `_internalProperty`.", function() {
          spyOn(externalPropType, "base").and.returnValue(false);
          spyOn(internalProperty, "isApplicableOn").and.callThrough();

          var isApplicableOn = externalPropType.isApplicableOn(modelAdapter);

          expect(internalProperty.isApplicableOn).not.toHaveBeenCalled();
          expect(isApplicableOn).toBe(false);
        });
      });

      describe("#selectAdaptationStrategyOn(modelAdapter)", function() {

        it("should return null if the role is not mapped", function() {

          var strategies = [ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "numberRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("numberRole");

          var modelAdapter = new DerivedModelAdapter({
            data: new Table(getDataSpec1())
          });

          var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

          expect(strategyApplication).toBe(null);
        });

        it("should return null if the model has no data", function() {

          var strategies = [ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "stringKeyRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("stringKeyRole");

          var modelAdapter = new DerivedModelAdapter({
            stringKeyRole: {fields: ["country"]}
          });

          var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

          expect(strategyApplication).toBe(null);
        });

        it("should return null if one of the mapped fields is not defined", function() {

          var strategies = [ElementIdentityStrategy.type];

          var DerivedModelAdapter = buildAdapter(DerivedModel, [
            {
              name: "stringKeyRole",
              strategies: strategies
            }
          ]);

          var externalPropType = DerivedModelAdapter.type.get("stringKeyRole");

          var modelAdapter = new DerivedModelAdapter({
            data: new Table(getDataSpec1()),
            stringKeyRole: {fields: ["foo"]}
          });

          var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

          expect(strategyApplication).toBe(null);
        });

        describe("mapping has a specified isCategoricalFixed", function() {

          it("should return null if there is no compatible mode (isCategoricalFixed=true)", function() {

            var strategies = [ElementIdentityStrategy.type];

            var CustomModel = Model.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/Property",
                    modes: [
                      {dataType: "string", isContinuous: true},
                      {dataType: "number", isContinuous: true}
                    ]
                  }
                }
              }
            });

            var DerivedModelAdapter = buildAdapter(CustomModel, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var modelAdapter = new DerivedModelAdapter({
              data: new Table(getDataSpec1()),
              roleA: {
                isCategoricalFixed: true,
                fields: ["country"]
              }
            });

            var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

            expect(strategyApplication).toBe(null);
          });

          it("should return a method selection if there are compatible modes " +
            "(isCategoricalFixed=false)", function() {

            var strategies = [ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var modelAdapter = new DerivedModelAdapter({
              data: new Table(getDataSpec1()),
              roleA: {
                isCategoricalFixed: false,
                fields: ["country"]
              }
            });

            var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

            expect(strategyApplication).not.toBe(null);
            expect(strategyApplication.internalMode).toBe(ModelWithStringRole.type.get("roleA").modes.at(0));
            expect(strategyApplication.externalMode).toBe(externalPropType.modes.at(0));
          });

          it("should return a method selection if there are compatible modes " +
            "(isCategoricalFixed=true)", function() {

            var strategies = [ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var modelAdapter = new DerivedModelAdapter({
              data: new Table(getDataSpec1()),
              roleA: {
                isCategoricalFixed: true,
                fields: ["country"]
              }
            });

            var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

            expect(strategyApplication).not.toBe(null);
            expect(strategyApplication.internalMode).toBe(ModelWithStringRole.type.get("roleA").modes.at(0));
            expect(strategyApplication.externalMode).toBe(externalPropType.modes.at(0));
          });
        });

        describe("mapping has no isCategoricalFixed", function() {

          it("should return null if there is more than one field and the mode data type is not list", function() {

            var strategies = [ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var modelAdapter = new DerivedModelAdapter({
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country", "product"]
              }
            });

            var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

            expect(strategyApplication).toBe(null);
          });

          it("should return null if the field data type is not a subtype of the mode data type", function() {

            var strategies = [ElementIdentityStrategy.type];

            var CustomModel = Model.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/Property",
                    modes: [
                      {dataType: "string", isContinuous: true}
                    ]
                  }
                }
              }
            });

            var DerivedModelAdapter = buildAdapter(CustomModel, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var modelAdapter = new DerivedModelAdapter({
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["sales"]
              }
            });

            var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

            expect(strategyApplication).toBe(null);
          });

          it("should return null if one the fields' data type is not a subtype of the mode data type", function() {

            var strategies = [ListIdentityStrategy.type];

            var CustomModel = Model.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/Property",
                    modes: [
                      {dataType: ["string"], isContinuous: true}
                    ]
                  }
                }
              }
            });

            var DerivedModelAdapter = buildAdapter(CustomModel, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var modelAdapter = new DerivedModelAdapter({
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["product", "sales"]
              }
            });

            var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

            expect(strategyApplication).toBe(null);
          });

          it("should return a method selection for a list mode and multiple fields " +
            "of compatible data type", function() {

            var strategies = [ListIdentityStrategy.type];

            var CustomModel = Model.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/Property",
                    modes: [
                      {dataType: ["string"], isContinuous: true}
                    ]
                  }
                }
              }
            });

            var DerivedModelAdapter = buildAdapter(CustomModel, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var modelAdapter = new DerivedModelAdapter({
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country", "product"]
              }
            });

            var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

            expect(strategyApplication).not.toBe(null);
          });

          it("should call the #validateApplication method of each compatible strategy method", function() {

            var strategies = [ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var modelAdapter = new DerivedModelAdapter({
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country"]
              }
            });

            spyOn(ElementIdentityStrategy.Type.prototype, "validateApplication").and.returnValue({isValid: false});

            externalPropType.selectAdaptationStrategyOn(modelAdapter);

            var fieldsIndexes = [0];
            expect(ElementIdentityStrategy.Type.prototype.validateApplication).toHaveBeenCalledWith(
              modelAdapter.data,
              fieldsIndexes
            );
          });

          it("should return the method selection for the first compatible strategy", function() {

            var strategies = [ListIdentityStrategy.type, ElementIdentityStrategy.type, ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var modelAdapter = new DerivedModelAdapter({
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country"]
              }
            });

            var strategyApplication = externalPropType.selectAdaptationStrategyOn(modelAdapter);

            expect(strategyApplication).not.toBe(null);
            expect(strategyApplication.strategyType).toBe(strategies[1]);
          });
        });
      });

      describe("#validateOn(model)", function() {

        doValidateTests(false);
        doValidateTests(true);

        function doValidateTests(useTxn) {

          describe(useTxn ? "ambient" : "direct", function() {

            var txnScope;

            beforeEach(function() {
              if(useTxn) txnScope = Transaction.enter();
            });

            afterEach(function() {
              if(txnScope) txnScope.dispose();
            });

            it("should stop validation if base validation returns errors", function() {

              var strategies = [ElementIdentityStrategy.type];

              var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
                {
                  name: "roleA",
                  strategies: strategies
                }
              ]);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter({
                data: new Table(getDataSpec1()),
                roleA: {
                  fields: [{ /* field name is missing */ }]
                }
              });

              expect(modelAdapter.roleA.fields.count).toBe(1);

              // Assumptions
              var errors = externalPropType.validateOn(modelAdapter);
              expect(Array.isArray(errors)).toBe(true);
              expect(errors.length).toBe(1);
            });

            it("should be invalid, when there is no selected strategy method", function() {

              var strategies = [];

              var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
                {
                  name: "roleA",
                  strategies: strategies
                }
              ]);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter({
                data: new Table(getDataSpec1()),
                roleA: {
                  fields: ["country"]
                }
              });

              expect(modelAdapter.roleA.fields.count).toBe(1);

              // Assumptions
              var errors = externalPropType.validateOn(modelAdapter);
              expect(Array.isArray(errors)).toBe(true);
              expect(errors.length).toBe(1);
            });

            it("should be valid, when there is a selected strategy method", function() {

              var strategies = [ElementIdentityStrategy.type];

              var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
                {
                  name: "roleA",
                  strategies: strategies
                }
              ]);

              var externalPropType = DerivedModelAdapter.type.get("roleA");

              var modelAdapter = new DerivedModelAdapter({
                data: new Table(getDataSpec1()),
                roleA: {
                  fields: ["country"]
                }
              });

              expect(modelAdapter.roleA.fields.count).toBe(1);

              // Assumptions
              var errors = externalPropType.validateOn(modelAdapter);
              expect(errors).toBe(null);
            });
          });
        }
      });

      describe("#_fillSpecInContext(spec, keyArgs)", function() {

        describe("#strategies", function() {

          it("should not serialize strategies when not locally specified", function() {

            var scope = new SpecificationScope();

            var DerivedModelAdapter = buildAdapter(ModelWithStringRole);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var spec = {};
            var ka = {};
            var any = externalPropType._fillSpecInContext(spec, ka);

            scope.dispose();

            // any can still be true because of the `base` attribute and of the base implementation.

            expect("strategies" in spec).toBe(false);
          });

          it("should serialize strategies when locally specified", function() {

            var scope = new SpecificationScope();

            var strategies = [ElementIdentityStrategy.type];

            var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
              {
                name: "roleA",
                strategies: strategies
              }
            ]);

            var externalPropType = DerivedModelAdapter.type.get("roleA");

            var spec = {};
            var ka = {};
            var any = externalPropType._fillSpecInContext(spec, ka);

            scope.dispose();

            expect(any).toBe(true);
            expect(spec.strategies.length).toBe(1);
          });
        });
      });
    });
  });
});
