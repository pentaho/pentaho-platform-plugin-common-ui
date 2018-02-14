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
  "pentaho/visual/scene/util",
  "pentaho/type/Context",
  "pentaho/data/Table",
  "tests/pentaho/util/errorMatch"
], function(sceneUtil, Context, DataTable, errorMatch) {

  /* globals it, describe, beforeEach, beforeAll */

  function getDatasetDT1WithNoKeyColumns() {
    return {
      model: [
        {name: "country", type: "string", label: "Country"},
        {name: "sales", type: "number", label: "Sales"}
      ],
      rows: [
        {c: [{v: "Portugal"}, {v: 12000}]},
        {c: [{v: "Ireland"}, {v: 6000}]}
      ]
    };
  }

  function getDatasetDT2WithTwoKeyColumns() {
    return {
      model: [
        {name: "country", type: "string", label: "Country", isKey: true},
        {name: "city", type: "string", label: "City", isKey: true},
        {name: "sales", type: "number", label: "Sales"}
      ],
      rows: [
        {c: [{v: "Portugal", f: "Portucale"}, {v: "Lisbon", f: "Lisboa"}, {v: 12000}]},
        {c: [{v: "Ireland"}, "Edinburgh", {v: 6000}]}
      ]
    };
  }

  function getDatasetDT3WithTwoCategoricalColumns() {
    return {
      model: [
        {name: "country", type: "string", label: "Country"},
        {name: "city", type: "string", label: "City"},
        {name: "sales", type: "number", label: "Sales"}
      ],
      rows: [
        {c: [{v: "Portugal", f: "Portucale"}, {v: "Lisbon", f: "Lisboa"}, {v: 12000}]},
        {c: [{v: "Ireland"}, "Edinburgh", {v: 6000}]}
      ]
    };
  }

  // ---

  function Variable(value, formatted) {
    this.value = value;
    this.formatted = formatted;
  }

  Variable.prototype.valueOf = function() {
    return this.value;
  };

  Variable.prototype.toString = function() {
    return this.formatted;
  };

  // ---

  describe("pentaho.visual.scene.util", function() {

    var context;
    var AbstractFilter;
    var VisualModel;

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(_context) {

            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/data/filter/abstract",
              "pentaho/visual/base/model",
              // These need to be loaded for createFilterFromCellsMap to work.
              "pentaho/data/filter/isEqual",
              "pentaho/data/filter/and"
            ], function(_AbstractFilter, _VisualModel) {
              AbstractFilter = _AbstractFilter;
              VisualModel = _VisualModel;
            });
          })
          .then(done, done.fail);
    });

    describe(".invertVars(varsMap, model, keyArgs)", function() {

      it("should throw if the given model has a null data set", function() {

        var CustomModel = VisualModel.extend();

        var model = new CustomModel();
        var varsMap = {};

        expect(function() {
          sceneUtil.invertVars(varsMap, model);
        }).toThrow(errorMatch.argInvalid("model"));
      });

      it("should return an empty cells map if the given vars map is empty", function() {

        var CustomModel = VisualModel.extend();

        var model = new CustomModel({data: new DataTable(getDatasetDT1WithNoKeyColumns())});
        var varsMap = {};

        var cellsMap = sceneUtil.invertVars(varsMap, model);

        expect(cellsMap).toEqual({});
      });

      it("should return an empty cells map if the given vars map contains only undefined model properties", function() {

        var CustomModel = VisualModel.extend();

        var model = new CustomModel({data: new DataTable(getDatasetDT1WithNoKeyColumns())});

        var varsMap = {"category": new Variable("a", "A")};

        var cellsMap = sceneUtil.invertVars(varsMap, model);

        expect(cellsMap).toEqual({});
      });

      it("should return an empty cells map if the given vars map contains only model properties " +
          "which are not visual role properties", function() {

        var CustomModel = VisualModel.extend({
          $type: {
            props: [
              {name: "category", valueType: "string"}
            ]
          }
        });

        var model = new CustomModel({data: new DataTable(getDatasetDT1WithNoKeyColumns())});

        var varsMap = {"category": new Variable("a", "A")};

        var cellsMap = sceneUtil.invertVars(varsMap, model);

        expect(cellsMap).toEqual({});
      });

      it("should return an empty cells map if the given vars map contains only visual role model properties " +
          "which are not mapped", function() {

        var CustomModel = VisualModel.extend({
          $type: {
            props: [
              {
                name: "category",
                base: "pentaho/visual/role/property"
              }
            ]
          }
        });

        var model = new CustomModel({data: new DataTable(getDatasetDT2WithTwoKeyColumns())});

        var varsMap = {"category": new Variable("a", "A")};

        var cellsMap = sceneUtil.invertVars(varsMap, model);

        expect(cellsMap).toEqual({});
      });

      describe("when the data table has key columns", function() {

        it("should return a cells map with the inverted key column values " +
            "(one visual role with two attributes)", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "category",
                  base: "pentaho/visual/role/property"
                }
              ]
            }
          });

          var model = new CustomModel({
            data: new DataTable(getDatasetDT2WithTwoKeyColumns()),
            category: {attributes: ["country", "city"]}
          });

          // Must read at least once to be able to invert!
          model.category.mapper.getValue(0);

          // Row 0 combined data.
          var varsMap = {"category": new Variable("Portugal~Lisbon", "Portucale ~ Lisbon")};

          var cellsMap = sceneUtil.invertVars(varsMap, model);

          expect(Object.keys(cellsMap).length).toBe(2);

          var cell = cellsMap.country;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Portugal");
          expect(cell.formatted).toBe("Portucale");

          cell = cellsMap.city;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Lisbon");
          expect(cell.formatted).toBe("Lisboa");
        });

        it("should return a cells map with the inverted key column values " +
            "(one visual role with two attributes) (given direct valueOf/toString values)", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "category",
                  base: "pentaho/visual/role/property"
                }
              ]
            }
          });

          var model = new CustomModel({
            data: new DataTable(getDatasetDT2WithTwoKeyColumns()),
            category: {attributes: ["country", "city"]}
          });

          // Must read at least once to be able to invert!
          model.category.mapper.getValue(0);

          // Row 0 combined data.
          var varsMap = {
            "category": "Portugal~Lisbon"
          };

          var cellsMap = sceneUtil.invertVars(varsMap, model);

          expect(Object.keys(cellsMap).length).toBe(2);

          var cell = cellsMap.country;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Portugal");
          expect(cell.formatted).toBe("Portucale");

          cell = cellsMap.city;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Lisbon");
          expect(cell.formatted).toBe("Lisboa");
        });

        it("should return a cells map with the inverted key column values " +
            "(two visual roles each with one attribute)", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "category1",
                  base: "pentaho/visual/role/property"
                },
                {
                  name: "category2",
                  base: "pentaho/visual/role/property"
                }
              ]
            }
          });

          var model = new CustomModel({
            data: new DataTable(getDatasetDT2WithTwoKeyColumns()),
            category1: {attributes: ["country"]},
            category2: {attributes: ["city"]}
          });

          // Must read at least once to be able to invert!
          model.category1.mapper.getValue(0);
          model.category2.mapper.getValue(0);

          // Row 0 data.
          var varsMap = {
            "category1": new Variable("Portugal", "Portucale"),
            "category2": new Variable("Lisbon", "Lisbon")
          };

          var cellsMap = sceneUtil.invertVars(varsMap, model);

          expect(Object.keys(cellsMap).length).toBe(2);

          var cell = cellsMap.country;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Portugal");
          expect(cell.formatted).toBe("Portucale");

          cell = cellsMap.city;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Lisbon");
          expect(cell.formatted).toBe("Lisboa");
        });

        it("should return a cells map with the inverted key column values " +
            "(two visual roles each with one attribute, split across the varsMap prototype chain)", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "category1",
                  base: "pentaho/visual/role/property"
                },
                {
                  name: "category2",
                  base: "pentaho/visual/role/property"
                }
              ]
            }
          });

          var model = new CustomModel({
            data: new DataTable(getDatasetDT2WithTwoKeyColumns()),
            category1: {attributes: ["country"]},
            category2: {attributes: ["city"]}
          });

          // Must read at least once to be able to invert!
          model.category1.mapper.getValue(0);
          model.category2.mapper.getValue(0);

          // Row 0 data.
          var baseVarsMap = {
            "category1": new Variable("Portugal", "Portucale"),
            "category2": new Variable("Wrong", "Errado")
          };

          var varsMap = Object.create(baseVarsMap);
          // Shadows base category2
          varsMap.category2 = new Variable("Lisbon", "Lisbon");

          var cellsMap = sceneUtil.invertVars(varsMap, model);

          expect(Object.keys(cellsMap).length).toBe(2);

          var cell = cellsMap.country;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Portugal");
          expect(cell.formatted).toBe("Portucale");

          cell = cellsMap.city;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Lisbon");
          expect(cell.formatted).toBe("Lisboa");
        });

        it("should return a cells map with all column values (keyArgs.includeMeasureAttributes: true)", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "category",
                  base: "pentaho/visual/role/property"
                },
                {
                  name: "measure",
                  base: "pentaho/visual/role/property",
                  modes: [{valueType: "number"}]
                }
              ]
            }
          });

          var model = new CustomModel({
            data: new DataTable(getDatasetDT2WithTwoKeyColumns()),
            category: {attributes: ["country"]},
            measure: {attributes: ["sales"]}
          });

          // Must read at least once to be able to invert!
          model.category.mapper.getValue(1);
          model.measure.mapper.getValue(1);

          // Row 1 data.
          var varsMap = {
            "category": new Variable("Ireland"),
            "measure": new Variable(6000)
          };

          var keyArgs = {
            includeMeasureAttributes: true
          };

          var cellsMap = sceneUtil.invertVars(varsMap, model, keyArgs);

          expect(Object.keys(cellsMap).length).toBe(2);

          var cell = cellsMap.country;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Ireland");
          expect(cell.formatted).toBe(null);

          cell = cellsMap.sales;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe(6000);
          expect(cell.formatted).toBe(null);
        });
      });

      describe("when the data table has no key columns", function() {

        it("should return a cells map with the inverted category column values " +
            "(one visual role with two attributes)", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "category",
                  base: "pentaho/visual/role/property"
                }
              ]
            }
          });

          var model = new CustomModel({
            data: new DataTable(getDatasetDT3WithTwoCategoricalColumns()),
            category: {attributes: ["country", "city"]}
          });

          // Must read at least once to be able to invert!
          model.category.mapper.getValue(0);

          // Row 0 combined data.
          var varsMap = {"category": new Variable("Portugal~Lisbon", "Portucale ~ Lisbon")};

          var cellsMap = sceneUtil.invertVars(varsMap, model);

          expect(Object.keys(cellsMap).length).toBe(2);

          var cell = cellsMap.country;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Portugal");
          expect(cell.formatted).toBe("Portucale");

          cell = cellsMap.city;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Lisbon");
          expect(cell.formatted).toBe("Lisboa");
        });

        it("should return a cells map with the inverted category column values " +
            "(two visual role each with one attribute)", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "category1",
                  base: "pentaho/visual/role/property"
                },
                {
                  name: "category2",
                  base: "pentaho/visual/role/property"
                }
              ]
            }
          });

          var model = new CustomModel({
            data: new DataTable(getDatasetDT3WithTwoCategoricalColumns()),
            category1: {attributes: ["country"]},
            category2: {attributes: ["city"]}
          });

          // Must read at least once to be able to invert!
          model.category1.mapper.getValue(0);
          model.category2.mapper.getValue(0);

          // Row 0 combined data.
          var varsMap = {
            "category1": new Variable("Portugal", "Portucale"),
            "category2": new Variable("Lisbon", "Lisbon")
          };

          var cellsMap = sceneUtil.invertVars(varsMap, model);

          expect(Object.keys(cellsMap).length).toBe(2);

          var cell = cellsMap.country;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Portugal");
          expect(cell.formatted).toBe("Portucale");

          cell = cellsMap.city;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Lisbon");
          expect(cell.formatted).toBe("Lisboa");
        });

        it("should return a cells map with all column values (keyArgs.includeMeasureAttributes: true)", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "category",
                  base: "pentaho/visual/role/property"
                },
                {
                  name: "measure",
                  base: "pentaho/visual/role/property",
                  modes: [{valueType: "number"}]
                }
              ]
            }
          });

          var model = new CustomModel({
            data: new DataTable(getDatasetDT3WithTwoCategoricalColumns()),
            category: {attributes: ["country"]},
            measure: {attributes: ["sales"]}
          });

          // Must read at least once to be able to invert!
          model.category.mapper.getValue(1);
          model.measure.mapper.getValue(1);

          // Row 1 data.
          var varsMap = {
            "category": new Variable("Ireland"),
            "measure": new Variable(6000)
          };

          var keyArgs = {
            includeMeasureAttributes: true
          };

          var cellsMap = sceneUtil.invertVars(varsMap, model, keyArgs);

          expect(Object.keys(cellsMap).length).toBe(2);

          var cell = cellsMap.country;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe("Ireland");
          expect(cell.formatted).toBe(null);

          cell = cellsMap.sales;
          expect(cell != null).toBe(true);
          expect(cell.value).toBe(6000);
          expect(cell.formatted).toBe(null);
        });
      });
    });

    describe(".createFilterForVars(varsMap, model)", function() {

      it("should return a filter with the inverted key column values", function() {

        var CustomModel = VisualModel.extend({
          $type: {
            props: [
              {
                name: "category",
                base: "pentaho/visual/role/property"
              }
            ]
          }
        });

        var model = new CustomModel({
          data: new DataTable(getDatasetDT2WithTwoKeyColumns()),
          category: {attributes: ["country", "city"]}
        });

        // Must read at least once to be able to invert!
        model.category.mapper.getValue(0);

        // Row 0 combined data.
        var varsMap = {"category": new Variable("Portugal~Lisbon", "Portucale ~ Lisbon")};

        var filter = sceneUtil.createFilterForVars(varsMap, model);

        expect(filter instanceof AbstractFilter).toBe(true);
        expect(filter.kind).toBe("and");
        expect(filter.operands.count).toBe(2);

        var isEqual = filter.operands.at(0);
        expect(isEqual != null).toBe(true);
        expect(isEqual.kind).toBe("isEqual");
        expect(isEqual.property).toBe("country");
        expect(isEqual.getv("value")).toBe("Portugal");
        expect(isEqual.getf("value")).toBe("Portucale");

        isEqual = filter.operands.at(1);
        expect(isEqual != null).toBe(true);
        expect(isEqual.kind).toBe("isEqual");
        expect(isEqual.property).toBe("city");
        expect(isEqual.getv("value")).toBe("Lisbon");
        expect(isEqual.getf("value")).toBe("Lisboa");
      });
    });
  });
});
