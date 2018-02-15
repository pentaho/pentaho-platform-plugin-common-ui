/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/data/Table"
], function(Context, Table) {

  "use strict";

  /* globals describe, it, beforeEach, afterEach, beforeAll, spyOn */

  describe("pentaho.visual.role.Mapping", function() {

    var context;
    var VisualModel;
    var Mapping;
    var IdentityStrategy;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(_context) {

            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/visual/base/model",
              "pentaho/visual/role/mapping",
              "pentaho/visual/role/strategies/identity"
            ], function(_Model, _Mapping, _IdentityStrategy) {
              VisualModel = _Model;
              Mapping = _Mapping;
              IdentityStrategy = _IdentityStrategy;
            });
          })
          .then(done, done.fail);

    });

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

    describe("#isMapped", function() {

      it("should be false when it has zero attributes", function() {

        var mapping = new Mapping();
        expect(mapping.isMapped).toBe(false);
      });

      it("should be true when it has one attribute", function() {

        var mapping = new Mapping({attributes: ["foo"]});
        expect(mapping.isMapped).toBe(true);
      });

      it("should be true when it has two attributes", function() {

        var mapping = new Mapping({attributes: ["foo", "bar"]});
        expect(mapping.isMapped).toBe(true);
      });
    });

    describe("#model", function() {

      it("should return the container model", function() {

        var Derived = VisualModel.extend({
          $type: {
            props: [
              {name: "foo", base: "pentaho/visual/role/property"}
            ]
          }
        });

        var derived = new Derived();
        var mapping = derived.foo;

        expect(mapping.model).toBe(derived);
      });
    });

    describe("#mapper", function() {

      describe("when not under a transaction", function() {

        it("should call prop.getMapperOn(model) and return its result", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "propRoleA",
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string"}
                  ],
                  strategies: [
                    new IdentityStrategy()
                  ]
                }
              ]
            }
          });

          var propType = CustomModel.type.get("propRoleA");
          var mapper = {};
          spyOn(propType, "getMapperOn").and.returnValue(mapper);

          var model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {attributes: ["country"]}
          });
          var mapping = model.propRoleA;

          var result = mapping.mapper;

          expect(result).toBe(mapper);
          expect(propType.getMapperOn).toHaveBeenCalledTimes(1);
          expect(propType.getMapperOn).toHaveBeenCalledWith(model);
        });

        it("should cache and return the mapper instance of the first prop.getMapperOn call", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "propRoleA",
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string"}
                  ],
                  strategies: [
                    new IdentityStrategy()
                  ]
                }
              ]
            }
          });

          var propType = CustomModel.type.get("propRoleA");
          var mapper = {};
          spyOn(propType, "getMapperOn").and.returnValue(mapper);

          var model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {attributes: ["country"]}
          });
          var mapping = model.propRoleA;

          var result1 = mapping.mapper;
          var result2 = mapping.mapper;

          expect(result1).toBe(mapper);
          expect(result2).toBe(mapper);
          expect(propType.getMapperOn).toHaveBeenCalledTimes(1);
        });

        it("should cache and return a returned null mapper", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "propRoleA",
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "number"}
                  ],
                  strategies: [
                    new IdentityStrategy()
                  ]
                }
              ]
            }
          });

          var propType = CustomModel.type.get("propRoleA");
          var mapper = null;
          spyOn(propType, "getMapperOn").and.returnValue(mapper);

          var model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {attributes: ["country"]}
          });
          var mapping = model.propRoleA;

          var result1 = mapping.mapper;
          var result2 = mapping.mapper;

          expect(result1).toBe(mapper);
          expect(result2).toBe(mapper);
          expect(propType.getMapperOn).toHaveBeenCalledTimes(1);
        });
      });

      describe("when under a transaction", function() {

        var txnScope;
        var mapper0;
        var propType;
        var model;

        beforeEach(function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: [
                {
                  name: "propNormal",
                  valueType: "string"
                },
                {
                  name: "propRoleA",
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string"}
                  ],
                  strategies: [
                    new IdentityStrategy()
                  ]
                }
              ]
            }
          });

          model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {attributes: ["country"]}
          });

          propType = CustomModel.type.get("propRoleA");

          // Cache the mapper.
          mapper0 = model.propRoleA.mapper;

          // Start the transaction.
          txnScope = context.enterChange();
        });

        afterEach(function() {
          txnScope.dispose();
        });

        it("should ignore the cached value and call prop.getMapperOn again", function() {

          var mapper = {};
          spyOn(propType, "getMapperOn").and.returnValue(mapper);

          var result = model.propRoleA.mapper;

          expect(result).toBe(mapper);
          expect(propType.getMapperOn).toHaveBeenCalledTimes(1);
        });

        it("should not cache values and call prop.getMapperOn each time", function() {

          var mapper = {};
          spyOn(propType, "getMapperOn").and.returnValue(mapper);

          var result1 = model.propRoleA.mapper;
          var result2 = model.propRoleA.mapper;

          expect(propType.getMapperOn).toHaveBeenCalledTimes(2);
        });

        it("should return the original cached value if the transaction causes no changes", function() {

          var mapper = {};
          spyOn(propType, "getMapperOn").and.returnValue(mapper);

          txnScope.accept();

          var result = model.propRoleA.mapper;

          expect(result).toBe(mapper0);
          expect(propType.getMapperOn).not.toHaveBeenCalled();
        });

        it("should return a new value if the transaction changes the `data` property", function() {

          var mapper = {};
          spyOn(propType, "getMapperOn").and.returnValue(mapper);

          model.data = new Table(getDataSpec1());

          txnScope.accept();

          var result = model.propRoleA.mapper;

          expect(result).toBe(mapper);
          expect(result).not.toBe(mapper0);
          expect(propType.getMapperOn).toHaveBeenCalledTimes(1);
        });

        it("should return a new value if the transaction changes a visual role property", function() {

          var mapper = {};
          spyOn(propType, "getMapperOn").and.returnValue(mapper);

          model.propRoleA.attributes = ["product"];

          txnScope.accept();

          var result = model.propRoleA.mapper;

          expect(result).toBe(mapper);
          expect(result).not.toBe(mapper0);
          expect(propType.getMapperOn).toHaveBeenCalledTimes(1);
        });

        it("should return the original cached value if the transaction changes normal properties", function() {

          var mapper = {};
          spyOn(propType, "getMapperOn").and.returnValue(mapper);

          model.propNormal = "new-value";

          txnScope.accept();

          var result = model.propRoleA.mapper;

          expect(result).toBe(mapper0);
          expect(propType.getMapperOn).not.toHaveBeenCalled();
        });
      });
    });
  });
});
