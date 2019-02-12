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
  "pentaho/type/action/Transaction",
  "pentaho/visual/Model",
  "pentaho/visual/role/Mode",
  "pentaho/data/Table"
], function(Transaction, Model, Mode, Table) {

  "use strict";

  describe("pentaho.visual.role.Mapping", function() {

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

    // TODO: mode = modeFixed || prop.modes[0].
    // Uses cache except when under a transaction.
    describe("#mode", function() {

      describe("when not under a transaction", function() {

        it("should call prop.getModeEffectiveOn(model) and return its result", function() {

          var CustomModel = Model.extend({
            $type: {
              props: [
                {
                  name: "propRoleA",
                  base: "pentaho/visual/role/Property",
                  modes: [
                    {dataType: "string"}
                  ]
                }
              ]
            }
          });

          var propType = CustomModel.type.get("propRoleA");
          var mode = new Mode();
          spyOn(propType, "getModeEffectiveOn").and.returnValue(mode);

          var model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {fields: ["country"]}
          });
          var mapping = model.propRoleA;

          var result = mapping.mode;

          expect(result).toBe(mode);
          expect(propType.getModeEffectiveOn).toHaveBeenCalledTimes(1);
          expect(propType.getModeEffectiveOn).toHaveBeenCalledWith(model);
        });

        it("should cache and return the mode of the first prop.getModeEffectiveOn call", function() {

          var CustomModel = Model.extend({
            $type: {
              props: [
                {
                  name: "propRoleA",
                  base: "pentaho/visual/role/Property",
                  modes: [
                    {dataType: "string"}
                  ]
                }
              ]
            }
          });

          var propType = CustomModel.type.get("propRoleA");
          var mode = new Mode();
          spyOn(propType, "getModeEffectiveOn").and.returnValue(mode);

          var model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {fields: ["country"]}
          });
          var mapping = model.propRoleA;

          var result1 = mapping.mode;
          var result2 = mapping.mode;

          expect(result1).toBe(mode);
          expect(result2).toBe(mode);
          expect(propType.getModeEffectiveOn).toHaveBeenCalledTimes(1);
        });

        it("should cache and return a returned null mode", function() {

          var CustomModel = Model.extend({
            $type: {
              props: [
                {
                  name: "propRoleA",
                  base: "pentaho/visual/role/Property",
                  modes: [
                    {dataType: "number"}
                  ]
                }
              ]
            }
          });

          var propType = CustomModel.type.get("propRoleA");
          var mode = null;
          spyOn(propType, "getModeEffectiveOn").and.returnValue(mode);

          var model = new CustomModel({
            data: new Table(getDataSpec1()),
            propRoleA: {fields: ["country"]}
          });
          var mapping = model.propRoleA;

          var result1 = mapping.mode;
          var result2 = mapping.mode;

          expect(result1).toBe(mode);
          expect(result2).toBe(mode);
          expect(propType.getModeEffectiveOn).toHaveBeenCalledTimes(1);
        });
      });

      describe("when under a transaction", function() {

        var txnScope;
        var mode0;
        var propType;
        var model;

        beforeEach(function() {

          var CustomModel = Model.extend({
            $type: {
              props: [
                {
                  name: "propNormal",
                  valueType: "string"
                },
                {
                  name: "propRoleA",
                  base: "pentaho/visual/role/Property",
                  modes: [
                    {dataType: "string"}
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

          // Cache the mode.
          mode0 = model.propRoleA.mode;

          // Start the transaction.
          txnScope = Transaction.enter();
        });

        afterEach(function() {
          txnScope.dispose();
        });

        it("should ignore the cached value and call prop.getModeEffectiveOn again", function() {

          var mode = new Mode();
          spyOn(propType, "getModeEffectiveOn").and.returnValue(mode);

          var result = model.propRoleA.mode;

          expect(result).toBe(mode);
          expect(propType.getModeEffectiveOn).toHaveBeenCalledTimes(1);
        });

        it("should not cache values and call prop.getModeEffectiveOn each time", function() {

          var mode = new Mode();
          spyOn(propType, "getModeEffectiveOn").and.returnValue(mode);

          var result1 = model.propRoleA.mode;
          var result2 = model.propRoleA.mode;

          expect(propType.getModeEffectiveOn).toHaveBeenCalledTimes(2);
        });

        it("should return the original cached value if the transaction causes no changes", function() {

          var mode = new Mode();
          spyOn(propType, "getModeEffectiveOn").and.returnValue(mode);

          txnScope.accept();

          var result = model.propRoleA.mode;

          expect(result).toBe(mode0);
          expect(propType.getModeEffectiveOn).not.toHaveBeenCalled();
        });

        it("should return a new value if the transaction changes the `data` property", function() {

          var mode = new Mode();
          spyOn(propType, "getModeEffectiveOn").and.returnValue(mode);

          model.data = new Table(getDataSpec1());

          txnScope.accept();

          var result = model.propRoleA.mode;

          expect(result).toBe(mode);
          expect(result).not.toBe(mode0);
          expect(propType.getModeEffectiveOn).toHaveBeenCalledTimes(1);
        });

        it("should return a new value if the transaction changes a visual role property", function() {

          var mode = new Mode();
          spyOn(propType, "getModeEffectiveOn").and.returnValue(mode);

          model.propRoleA.fields = ["product"];

          txnScope.accept();

          var result = model.propRoleA.mode;

          expect(result).toBe(mode);
          expect(result).not.toBe(mode0);
          expect(propType.getModeEffectiveOn).toHaveBeenCalledTimes(1);
        });

        it("should return the original cached value if the transaction changes normal properties", function() {

          var mode = new Mode();
          spyOn(propType, "getModeEffectiveOn").and.returnValue(mode);

          model.propNormal = "new-value";

          txnScope.accept();

          var result = model.propRoleA.mode;

          expect(result).toBe(mode0);
          expect(propType.getModeEffectiveOn).not.toHaveBeenCalled();
        });
      });
    });
  });
});
