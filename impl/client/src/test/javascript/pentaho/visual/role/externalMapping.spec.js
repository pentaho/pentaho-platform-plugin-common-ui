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
  "pentaho/type/Context",
  "pentaho/data/Table"
], function(Context, Table) {

  "use strict";

  /* globals describe, it, beforeEach, afterEach, beforeAll, spyOn */

  xdescribe("pentaho.visual.role.ExternalMapping", function() {

    var context;
    var VisualModel;
    var IdentityStrategy;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(_context) {

            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/visual/base/model",
              "pentaho/visual/role/adaptation/identity",
              "pentaho/visual/role/mapping"
            ], function(_Model, _IdentityStrategy) {
              VisualModel = _Model;
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

    describe("#adapter", function() {

      describe("when not under a transaction", function() {

        it("should call prop.getAdapterOn(model) and return its result", function() {

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
          var adapter = {};
          spyOn(propType, "getAdapterOn").and.returnValue(adapter);

          var model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {fields: ["country"]}
          });
          var mapping = model.propRoleA;

          var result = mapping.adapter;

          expect(result).toBe(adapter);
          expect(propType.getAdapterOn).toHaveBeenCalledTimes(1);
          expect(propType.getAdapterOn).toHaveBeenCalledWith(model);
        });

        it("should cache and return the adapter instance of the first prop.getAdapterOn call", function() {

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
          var adapter = {};
          spyOn(propType, "getAdapterOn").and.returnValue(adapter);

          var model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {fields: ["country"]}
          });
          var mapping = model.propRoleA;

          var result1 = mapping.adapter;
          var result2 = mapping.adapter;

          expect(result1).toBe(adapter);
          expect(result2).toBe(adapter);
          expect(propType.getAdapterOn).toHaveBeenCalledTimes(1);
        });

        it("should cache and return a returned null adapter", function() {

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
          var adapter = null;
          spyOn(propType, "getAdapterOn").and.returnValue(adapter);

          var model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {fields: ["country"]}
          });
          var mapping = model.propRoleA;

          var result1 = mapping.adapter;
          var result2 = mapping.adapter;

          expect(result1).toBe(adapter);
          expect(result2).toBe(adapter);
          expect(propType.getAdapterOn).toHaveBeenCalledTimes(1);
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
            propRoleA: {fields: ["country"]}
          });

          propType = CustomModel.type.get("propRoleA");

          // Cache the adapter.
          mapper0 = model.propRoleA.adapter;

          // Start the transaction.
          txnScope = context.enterChange();
        });

        afterEach(function() {
          txnScope.dispose();
        });

        it("should ignore the cached value and call prop.getAdapterOn again", function() {

          var adapter = {};
          spyOn(propType, "getAdapterOn").and.returnValue(adapter);

          var result = model.propRoleA.adapter;

          expect(result).toBe(adapter);
          expect(propType.getAdapterOn).toHaveBeenCalledTimes(1);
        });

        it("should not cache values and call prop.getAdapterOn each time", function() {

          var adapter = {};
          spyOn(propType, "getAdapterOn").and.returnValue(adapter);

          var result1 = model.propRoleA.adapter;
          var result2 = model.propRoleA.adapter;

          expect(propType.getAdapterOn).toHaveBeenCalledTimes(2);
        });

        it("should return the original cached value if the transaction causes no changes", function() {

          var adapter = {};
          spyOn(propType, "getAdapterOn").and.returnValue(adapter);

          txnScope.accept();

          var result = model.propRoleA.adapter;

          expect(result).toBe(mapper0);
          expect(propType.getAdapterOn).not.toHaveBeenCalled();
        });

        it("should return a new value if the transaction changes the `data` property", function() {

          var adapter = {};
          spyOn(propType, "getAdapterOn").and.returnValue(adapter);

          model.data = new Table(getDataSpec1());

          txnScope.accept();

          var result = model.propRoleA.adapter;

          expect(result).toBe(adapter);
          expect(result).not.toBe(mapper0);
          expect(propType.getAdapterOn).toHaveBeenCalledTimes(1);
        });

        it("should return a new value if the transaction changes a visual role property", function() {

          var adapter = {};
          spyOn(propType, "getAdapterOn").and.returnValue(adapter);

          model.propRoleA.fields = ["product"];

          txnScope.accept();

          var result = model.propRoleA.adapter;

          expect(result).toBe(adapter);
          expect(result).not.toBe(mapper0);
          expect(propType.getAdapterOn).toHaveBeenCalledTimes(1);
        });

        it("should return the original cached value if the transaction changes normal properties", function() {

          var adapter = {};
          spyOn(propType, "getAdapterOn").and.returnValue(adapter);

          model.propNormal = "new-value";

          txnScope.accept();

          var result = model.propRoleA.adapter;

          expect(result).toBe(mapper0);
          expect(propType.getAdapterOn).not.toHaveBeenCalled();
        });
      });
    });
  });
});
