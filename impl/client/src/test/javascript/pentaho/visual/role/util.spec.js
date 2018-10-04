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
  "pentaho/visual/role/util",
  "pentaho/visual/base/Model",
  "pentaho/visual/role/Property",
  "tests/pentaho/util/errorMatch",
  "pentaho/type/ValidationError",
  "pentaho/data/Table"
], function(roleUtil, BaseModel, RoleProperty, errorMatch, ValidationError, Table) {

  "use strict";

  describe("pentaho.visual.role.util", function() {

    function getDataSpec1() {
      return {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "product", type: "string", label: "Product"},
          {name: "date", type: "date", label: "Date"},
          {name: "sales", type: "number", label: "Sales"}
        ],
        rows: [
          {c: ["Portugal", "fish", "2016-01-01", 100]},
          {c: ["Ireland", "beer", "2016-01-02", 200]}
        ]
      };
    }

    var Model;

    beforeAll(function() {
      Model = BaseModel.extend({
        $type: {
          props: [
            {
              name: "roleKeyMany",
              base: RoleProperty,
              modes: [{dataType: "list"}]
            },
            {
              name: "roleKeyManyCountMax2",
              base: RoleProperty,
              modes: [{dataType: "list"}],
              fields: {
                countMax: 2
              }
            },
            {
              name: "roleKeyStringMany",
              base: RoleProperty,
              modes: [{dataType: ["string"]}]
            },
            {
              name: "roleMeasure",
              base: RoleProperty,
              modes: [{dataType: "number"}]
            }
          ]
        }
      });
    });

    describe("testAddField(vizModel, roleName, fieldName, keyArgs)", function() {

      var vizModel;

      beforeEach(function() {
        vizModel = new Model({
          data: new Table(getDataSpec1())
        });
      });

      // region Helpers
      function spyMapping(roleName) {
        spyOn(vizModel[roleName].fields, "removeAt").and.callThrough();
        spyOn(vizModel[roleName].fields, "move").and.callThrough();
        spyOn(vizModel[roleName].fields, "insert").and.callThrough();
      }

      function expectSuccessBaseline(roleUsage, roleName, fieldName) {

        expect(roleUsage).not.toBe(null);
        expect(roleUsage.name).toBe(roleName);
        expect(roleUsage.fieldName).toBe(fieldName);
        expect(roleUsage.propType).toBe(Model.type.get(roleName));
        expect(roleUsage.mode).not.toBe(null);
      }

      function expectSuccess(roleUsage, roleName, fieldName) {

        expectSuccessBaseline(roleUsage, roleName, fieldName);
      }

      function expectNoSpiesCalled(roleName) {

        var fields = vizModel[roleName].fields;
        expect(fields.insert).not.toHaveBeenCalled();
        expect(fields.removeAt).not.toHaveBeenCalled();
        expect(fields.move).not.toHaveBeenCalled();
      }

      function expectOnlyInsertToHaveBeenCalled(roleUsage) {

        var roleName = roleUsage.propType.name;
        var fields = vizModel[roleName].fields;

        expect(fields.removeAt).not.toHaveBeenCalled();
        expect(fields.move).not.toHaveBeenCalled();
        expect(fields.insert).toHaveBeenCalledTimes(1);
        expect(fields.insert).toHaveBeenCalledWith(roleUsage.fieldName, roleUsage.fieldPosition);
      }

      function expectOnlyMoveToHaveBeenCalled(roleUsage, initialPosition) {

        var roleName = roleUsage.propType.name;
        var fields = vizModel[roleName].fields;

        expect(fields.removeAt).not.toHaveBeenCalled();
        expect(fields.insert).not.toHaveBeenCalled();
        expect(fields.move).toHaveBeenCalledTimes(1);
        expect(fields.move).toHaveBeenCalledWith(fields.at(initialPosition), roleUsage.fieldPosition);
      }

      function expectReplaceToHaveBeenCalled(roleUsage) {

        var roleName = roleUsage.propType.name;
        var fields = vizModel[roleName].fields;

        expect(fields.move).not.toHaveBeenCalled();

        expect(fields.removeAt).toHaveBeenCalledTimes(1);
        expect(fields.removeAt).toHaveBeenCalledWith(roleUsage.fieldPosition, 1);

        expect(fields.insert).toHaveBeenCalledTimes(1);
        expect(fields.insert).toHaveBeenCalledWith(roleUsage.fieldName, roleUsage.fieldPosition);
      }
      // endregion

      describe("when keyArgs.fieldPosition is not specified", function() {

        function expectSuccess(roleUsage, roleName, fieldName) {

          expectSuccessBaseline(roleUsage, roleName, fieldName);

          expect(roleUsage.replaceTarget).toBe(false);
        }

        describe("when field is unmapped", function() {

          it("should add it to the end position when the vr is empty", function() {
            var roleName =  "roleKeyMany";
            var fieldName =  "country";

            spyMapping(roleName);

            var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName);

            expectSuccess(roleUsage, roleName, fieldName);

            expect(roleUsage.fieldPosition).toBe(0);

            expectOnlyInsertToHaveBeenCalled(roleUsage);
          });

          it("should add it to the end position when the vr is not empty", function() {

            var roleName =  "roleKeyMany";
            var fieldName =  "country";

            spyMapping(roleName);

            vizModel[roleName].fields = ["product"];

            var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName);

            expectSuccess(roleUsage, roleName, fieldName);

            expect(roleUsage.fieldPosition).toBe(1);

            expectOnlyInsertToHaveBeenCalled(roleUsage);
          });
        });

        describe("when field is mapped", function() {

          it("should move it to the end position when the vr is not empty", function() {

            var roleName =  "roleKeyMany";
            var fieldName =  "country";

            spyMapping(roleName);

            vizModel[roleName].fields = [fieldName, "product"];

            var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName);

            expectSuccess(roleUsage, roleName, fieldName);

            expect(roleUsage.fieldPosition).toBe(2);

            expectOnlyMoveToHaveBeenCalled(roleUsage, /* intialFieldPosition: */0);
          });

          it("should return null if it is already at the end position when the vr is not empty", function() {

            var roleName =  "roleKeyMany";
            var fieldName =  "country";

            spyMapping(roleName);

            vizModel[roleName].fields = ["product", fieldName];

            var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName);

            expect(roleUsage).toBe(null);

            expectNoSpiesCalled(roleName);
          });
        });
      });

      describe("when keyArgs.fieldPosition is specified", function() {

        it("should default replaceTarget to false", function() {

          var roleName =  "roleKeyMany";
          var fieldName =  "country";

          vizModel[roleName].fields = [fieldName, "product"];

          var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
            fieldPosition: 2
          });

          expectSuccess(roleUsage, roleName, fieldName);

          expect(roleUsage.replaceTarget).toBe(false);
        });

        describe("when the field is not yet mapped", function() {

          describe("when replaceTarget is false", function() {

            it("should add it to the specified 0 position when the vr is empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 0,
                replaceTarget: false
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(0);

              expectOnlyInsertToHaveBeenCalled(roleUsage);
            });

            it("should add it to the 0 position when the vr is empty and fieldPosition is > 0", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 3,
                replaceTarget: false
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(0);

              expectOnlyInsertToHaveBeenCalled(roleUsage);
            });

            it("should add it to the specified final position when the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              vizModel[roleName].fields = ["product"];

              spyMapping(roleName);

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 1,
                replaceTarget: false
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(1);

              expectOnlyInsertToHaveBeenCalled(roleUsage);
            });

            it("should add it field to the specified non-final position when the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product"];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 0,
                replaceTarget: false
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(0);

              expectOnlyInsertToHaveBeenCalled(roleUsage);
            });
          });

          describe("when replaceTarget is true", function() {

            it("should add it to the specified 0 position when the vr is empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 0,
                replaceTarget: true
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(0);

              expectOnlyInsertToHaveBeenCalled(roleUsage);
            });

            it("should add it to the 0 position when the vr is empty and fieldPosition is > 0", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 3,
                replaceTarget: true
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(0);

              expectOnlyInsertToHaveBeenCalled(roleUsage);
            });

            it("should add it to the specified 'length' position when the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product"];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 1,
                replaceTarget: true
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(1);

              expectOnlyInsertToHaveBeenCalled(roleUsage);
            });

            it("should replace the specified non-final position when the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product"];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 0,
                replaceTarget: true
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(true);
              expect(roleUsage.fieldPosition).toBe(0);

              expectReplaceToHaveBeenCalled(roleUsage);
            });
          });

          describe("when replaceTarget is 'auto'", function() {

            it("should replace the specified position if the vr is full", function() {

              var roleName =  "roleKeyManyCountMax2";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", "date"];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 0,
                replaceTarget: "auto"
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(true);
              expect(roleUsage.fieldPosition).toBe(0);

              expectReplaceToHaveBeenCalled(roleUsage);
            });

            it("should add to the specified position if the vr is not full", function() {

              var roleName =  "roleKeyManyCountMax2";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product"];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 0,
                replaceTarget: "auto"
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(0);

              expectOnlyInsertToHaveBeenCalled(roleUsage);
            });
          });
        });

        describe("when the field is mapped", function() {

          describe("when replaceTarget is false", function() {

            it("should move it to the specified 'length' position if the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = [fieldName, "product"];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 2,
                replaceTarget: false
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(2);

              expectOnlyMoveToHaveBeenCalled(roleUsage, /* initialFieldPosition: */0);
            });

            it("should move it to the specified 0 position if the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", fieldName];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 0,
                replaceTarget: false
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(0);

              expectOnlyMoveToHaveBeenCalled(roleUsage, /* initialFieldPosition: */1);
            });

            it("should move it to the specified intermediate position if the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", "date", fieldName];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 1,
                replaceTarget: false
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(1);

              expectOnlyMoveToHaveBeenCalled(roleUsage, /* initialFieldPosition: */2);
            });
          });

          describe("when replaceTarget is true", function() {

            it("should move it to the specified 'length' position if the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["country", "product"];

              var roleUsage = roleUtil.testAddField(vizModel, "roleKeyMany", "country", {
                fieldPosition: 2,
                replaceTarget: true
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(2);
            });

            it("should move-to/replace the specified 0 position if the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", "country"];

              var roleUsage = roleUtil.testAddField(vizModel, "roleKeyMany", "country", {
                fieldPosition: 0,
                replaceTarget: true
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(true);
              expect(roleUsage.fieldPosition).toBe(0);
            });

            it("should move-to/replace the specified intermediate position if the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", "date", fieldName];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 1,
                replaceTarget: true
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(true);
              expect(roleUsage.fieldPosition).toBe(1);
            });
          });

          describe("when replaceTarget is 'auto'", function() {

            // Because it is a move, there's always space to do it without replacing.

            it("should move to the specified 0 position if the vr is not empty", function() {

              var roleName =  "roleKeyManyCountMax2";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", fieldName];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 0,
                replaceTarget: "auto"
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(0);

              expectOnlyMoveToHaveBeenCalled(roleUsage, /* initialFieldPosition: */1);
            });

            it("should move to the specified intermediate position if the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", "date", fieldName];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 1,
                replaceTarget: "auto"
              });

              expectSuccess(roleUsage, roleName, fieldName);

              expect(roleUsage.replaceTarget).toBe(false);
              expect(roleUsage.fieldPosition).toBe(1);

              expectOnlyMoveToHaveBeenCalled(roleUsage, /* initialFieldPosition: */2);
            });
          });

          describe("whe staying at the same position", function() {

            it("should return null if the specified position is 'length' and the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", fieldName];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 2,
                replaceTarget: false
              });

              expect(roleUsage).toBe(null);

              expectNoSpiesCalled(roleName);
            });

            it("should return null if the specified position is the last one and the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", fieldName];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 1,
                replaceTarget: false
              });

              expect(roleUsage).toBe(null);

              expectNoSpiesCalled(roleName);
            });

            it("should return null if it the specified position is 0 and the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = [fieldName, "product"];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 0,
                replaceTarget: false
              });

              expect(roleUsage).toBe(null);

              expectNoSpiesCalled(roleName);
            });

            it("should return null if the specified position is intermediate and the vr is not empty", function() {

              var roleName =  "roleKeyMany";
              var fieldName =  "country";

              spyMapping(roleName);

              vizModel[roleName].fields = ["product", fieldName, "date"];

              var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, {
                fieldPosition: 1,
                replaceTarget: false
              });

              expect(roleUsage).toBe(null);

              expectNoSpiesCalled(roleName);
            });
          });
        });
      });
    });

    describe("testAddFieldAtAutoPosition(vizModel, roleName, fieldName, keyArgs)", function() {

      var vizModel;

      beforeEach(function() {

        vizModel = new Model({
          data: new Table(getDataSpec1())
        });

        spyOn(roleUtil, "testAddField").and.returnValue(null);
      });

      it("should call testAddField M + 1 times from end to start " +
         "(where M is the number of mapped fields)", function() {

        var roleName = "roleKeyMany";
        var fieldName = "country";

        vizModel[roleName].fields = ["product", "date"];

        var fieldPositions = [];

        // Because the keyArgs argument is mutated on each call, there's no way to test this with toHaveBeenCalledWith.
        roleUtil.testAddField.and.callFake(function(vizModel_, roleName_, fieldName_, keyArgs) {
          expect(vizModel_).toBe(vizModel);
          expect(roleName_).toBe(roleName);
          expect(fieldName_).toBe(fieldName);
          expect(keyArgs).not.toBe(null);
          expect(typeof keyArgs).toBe("object");
          fieldPositions.push(keyArgs.fieldPosition);

          return null;
        });

        var result = roleUtil.testAddFieldAtAutoPosition(vizModel, roleName, fieldName);

        expect(result).toBe(null);

        expect(roleUtil.testAddField).toHaveBeenCalledTimes(3);

        expect(fieldPositions).toEqual([2, 1, 0]);
      });

      it("should return null if all of the testAddField calls returns null", function() {

        var roleName = "roleKeyMany";
        var fieldName = "country";

        vizModel[roleName].fields = ["product", "date"];

        var result = roleUtil.testAddFieldAtAutoPosition(vizModel, roleName, fieldName);

        expect(result).toBe(null);
      });

      it("should stop calling testAddField and return its result as soon as it returns non-null", function() {

        var roleName = "roleKeyMany";
        var fieldName = "country";

        vizModel[roleName].fields = ["product", "date"];

        var roleUsage = {};
        roleUtil.testAddField.and.returnValue(roleUsage);

        var result = roleUtil.testAddFieldAtAutoPosition(vizModel, roleName, fieldName);

        expect(roleUtil.testAddField).toHaveBeenCalledTimes(1);
        expect(result).toBe(roleUsage);
      });
    });

    describe("getValidRolesForAddingField(vizModel, fieldName, keyArgs)", function() {

      var vizModel;

      beforeEach(function() {

        vizModel = new Model({
          data: new Table(getDataSpec1())
        });
      });

      it("should return an empty array when it is not possible to " +
         "add the field to any of the visual roles", function() {

        spyOn(roleUtil, "testAddFieldAtAutoPosition").and.returnValue(null);

        var fieldName = "country";
        var result = roleUtil.getValidRolesForAddingField(vizModel, fieldName);

        expect(result).not.toBe(null);
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
      });

      it("should return all possible visual role usages for the given field (i)", function() {

        var fieldName = "country";
        var result = roleUtil.getValidRolesForAddingField(vizModel, fieldName);

        expect(result).not.toBe(null);
        expect(result.length).toBe(3);
        expect(result).toEqual(jasmine.arrayContaining([
          jasmine.objectContaining({
            name: "roleKeyStringMany"
          }),
          jasmine.objectContaining({
            name: "roleKeyMany"
          }),
          jasmine.objectContaining({
            name: "roleKeyManyCountMax2"
          })
        ]));
      });

      it("should return all possible visual role usages for the given field (ii)", function() {

        var fieldName = "date";
        var result = roleUtil.getValidRolesForAddingField(vizModel, fieldName);

        expect(result).not.toBe(null);
        expect(result.length).toBe(2);
        expect(result).toEqual(jasmine.arrayContaining([
          jasmine.objectContaining({
            name: "roleKeyMany"
          }),
          jasmine.objectContaining({
            name: "roleKeyManyCountMax2"
          })
        ]));
      });

      it("should return all possible visual role usages for the given field (iii)", function() {

        var fieldName = "sales";
        var result = roleUtil.getValidRolesForAddingField(vizModel, fieldName);

        expect(result).not.toBe(null);
        expect(result.length).toBe(3);
        expect(result).toEqual(jasmine.arrayContaining([
          // ----
          // Not taking isVisualKey / isKey coherence into account yet...
          jasmine.objectContaining({
            name: "roleKeyMany"
          }),
          jasmine.objectContaining({
            name: "roleKeyManyCountMax2"
          }),
          // ----

          jasmine.objectContaining({
            name: "roleMeasure"
          })
        ]));
      });
    });

    describe("#getBestRoleForAddingField(vizModel, fieldName, keyArgs)", function() {

      function createModel(config) {

        return BaseModel.extend({
          $type: {
            props: config.map(function(propConfig) {
              var propTypeSpec = {
                name: propConfig.name,
                base: RoleProperty,
                ordinal: propConfig.ordinal
              };

              if(propConfig.modes) {
                propTypeSpec.modes = propConfig.modes;
              }

              if(propConfig.fields) {
                propTypeSpec.fields = propConfig.fields;
              }

              return propTypeSpec;
            })
          }
        });
      }

      function expectSuccess(roleUsage, roleName) {

        expect(roleUsage).toEqual(jasmine.objectContaining({
          name: roleName
        }));
      }

      var ModelListList;
      var ModelListListRequired;
      var ModelNumberList;
      var ModelListListOrdinals;

      beforeAll(function() {
        ModelListList = BaseModel.extend({
          $type: {
            props: [
              {
                name: "R1",
                base: RoleProperty,
                modes: ["list"]
              },
              {
                name: "R2",
                base: RoleProperty,
                modes: ["list"]
              }
            ]
          }
        });

        ModelListListRequired = BaseModel.extend({
          $type: {
            props: [
              {
                name: "R1",
                base: RoleProperty,
                modes: ["list"],
                fields: {countMin: 1}
              },
              {
                name: "R2",
                base: RoleProperty,
                modes: ["list"],
                fields: {countMin: 1}
              }
            ]
          }
        });

        ModelNumberList = BaseModel.extend({
          $type: {
            props: [
              {
                name: "R1",
                base: RoleProperty,
                modes: ["number"]
              },
              {
                name: "R2",
                base: RoleProperty,
                modes: ["list"]
              }
            ]
          }
        });

        ModelListListOrdinals = BaseModel.extend({
          $type: {
            props: [
              {
                name: "R1",
                base: RoleProperty,
                modes: ["list"],
                ordinal: 2
              },
              {
                name: "R2",
                base: RoleProperty,
                modes: ["list"],
                ordinal: 1
              }
            ]
          }
        });
      });

      describe("generic tests", function() {

        it("should call #getValidRolesForAddingField to determine the visual roles that " +
           "the field can be mapped to", function() {

          var Model = BaseModel.extend({
            $type: {
              props: [
                {
                  name: "columns",
                  base: RoleProperty,
                  modes: [{dataType: "list"}]
                }
              ]
            }
          });

          var dataTable = new Table({
            model: [
              {name: "A", type: "string"},
              {name: "B", type: "number"},
              {name: "C", type: "boolean"}
            ]
          });

          var model = new Model({
            data: dataTable
          });

          spyOn(roleUtil, "getValidRolesForAddingField").and.returnValue([]);

          roleUtil.getBestRoleForAddingField(model, "A");

          expect(roleUtil.getValidRolesForAddingField).toHaveBeenCalledTimes(1);
        });

        it("should not return visual roles for which the mapping would be invalid", function() {

          var Model = BaseModel.extend({
            $type: {
              props: [
                {
                  name: "R1",
                  base: RoleProperty,
                  modes: ["element"]
                },
                {
                  name: "R2",
                  base: RoleProperty,
                  modes: ["list"],
                  fields: {countMin: 1}
                }
              ]
            }
          });

          var dataTable = new Table({
            model: [
              {name: "A", type: "string"},
              {name: "B", type: "string"}
            ]
          });

          // R1 cannot take anymore fields.
          var model = new Model({
            "data": dataTable,
            "R1": {fields: ["A"]}
          });

          var fieldNameToAdd = "B";
          var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

          expectSuccess(roleUsage, "R2");
        });
      });

      describe("by individual criterion", function() {

        describe("by satisfaction", function() {

          it("should prefer mapping to an unsatisfied required visual role than to a satisfied one, " +
            "all other things equal", function() {

            var dataTable = new Table({
              model: [
                {name: "A", type: "string"},
                {name: "B", type: "string"}
              ]
            });

            var model = new ModelListListRequired({
              "R1": {fields: ["A"]},
              "data": dataTable
            });

            var fieldNameToAdd = "B";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R2");
          });

          // TODO: This unit test identified an issue that cannot be resolved now.
          // Issue is registered under BACKLOG-11143. Test will be activated when the issue is addressed.
          xit("should not consider the level of satisfaction of required visual roles, " +
              "but only if they're satisfied or not, all other things equal", function() {

            var Model = BaseModel.extend({
              $type: {
                props: [
                  {
                    // Mapped to A. Hunger: 2
                    name: "R1",
                    base: RoleProperty,
                    modes: ["list"],
                    fields: {countMin: 3}
                  },
                  {
                    // Not mapped. Hunger: 1
                    name: "R2",
                    base: RoleProperty,
                    modes: ["list"],
                    fields: {countMin: 1}
                  }
                ]
              }
            });

            var dataTable = new Table({
              model: [
                {name: "A", type: "string"},
                {name: "B", type: "string"}
              ]
            });

            var model = new Model({
              "R1": {fields: ["A"]},
              "data": dataTable
            });

            var fieldNameToAdd = "B";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R2");
          });
        }); // by satisfaction

        describe("by measurement level distance", function() {

          var dataTable;

          describe("with field of type 'string'", function() {

            beforeEach(function() {
              dataTable = new Table({
                model: [
                  {name: "A", type: "string"}
                ]
              });
            });

            it("should prefer mapping to a non-required visual role, with less distance " +
              "to the field level (categorical), all other things equal", function() {

              var model = new ModelNumberList({
                "data": dataTable
              });

              var roleUsage = roleUtil.getBestRoleForAddingField(model, "A");
              expectSuccess(roleUsage, "R2");
            });
          });

          describe("with field of type 'number'", function() {

            beforeEach(function() {
              dataTable = new Table({
                model: [
                  {name: "A", type: "number"}
                ]
              });
            });

            it("should prefer mapping to a required visual role, with less distance " +
              "to the field level (continuous, categorical), all other things equal", function() {

              var Model = BaseModel.extend({
                $type: {
                  props: [
                    {
                      name: "R1",
                      base: RoleProperty,
                      modes: ["list"],
                      fields: {countMin: 1}
                    },
                    {
                      name: "R2",
                      base: RoleProperty,
                      modes: ["number"],
                      fields: {countMin: 1}
                    }
                  ]
                }
              });

              var model = new Model({
                "data": dataTable
              });

              var roleUsage = roleUtil.getBestRoleForAddingField(model, "A");
              expectSuccess(roleUsage, "R2");
            });

            it("should prefer mapping to a non-required visual role, with less distance " +
              "to the field level (continuous, categorical), all other things equal", function() {

              var Model = BaseModel.extend({
                $type: {
                  props: [
                    {
                      name: "R1",
                      base: RoleProperty,
                      modes: ["list"]
                    },
                    {
                      name: "R2",
                      base: RoleProperty,
                      modes: ["number"]
                    }
                  ]
                }
              });

              var model = new Model({
                "data": dataTable
              });

              var roleUsage = roleUtil.getBestRoleForAddingField(model, "A");
              expectSuccess(roleUsage, "R2");
            });
          });
        }); // by measurement level distance

        describe("by attribute count", function() {

          it("should prefer mapping to a visual role that has fewer fields assigned to it " +
            "all other things equal", function() {

            var dataTable = new Table({
              model: [
                {name: "A", type: "string"},
                {name: "B", type: "string"}
              ]
            });

            var model = new ModelListList({
              "R1": {fields: ["A"]},
              "data": dataTable
            });

            var fieldNameToAdd = "B";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R2");
          });
        }); // by attribute count

        describe("by ordinal", function() {

          it("should prefer mapping to categorical visual roles with the lowest ordinal, " +
            "all other things equal", function() {

            var dataTable = new Table({
              model: [
                {name: "A", type: "string"}
              ]
            });

            var model = new ModelListListOrdinals({
              "data": dataTable
            });
            var fieldNameToAdd = "A";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R2");
          });

          it("should prefer mapping to continuous visual roles with the lowest ordinal, " +
             "all other things equal", function() {

            var Model = BaseModel.extend({
              $type: {
                props: [
                  {
                    name: "R1",
                    base: RoleProperty,
                    modes: ["number"],
                    ordinal: 2
                  },
                  {
                    name: "R2",
                    base: RoleProperty,
                    modes: ["number"],
                    ordinal: 1
                  }
                ]
              }
            });

            var dataTable = new Table({
              model: [
                {name: "A", type: "number"}
              ]
            });

            var model = new Model({
              "data": dataTable
            });
            var fieldNameToAdd = "A";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R2");
          });
        }); // by ordinal

        describe("by definition order", function() {

          it("should prefer mapping to visual roles with the lowest definition order, " +
            "all other things equal", function() {

            var dataTable = new Table({
              model: [
                {name: "A", type: "string"}
              ]
            });

            var model = new ModelListList({
              "data": dataTable
            });
            var fieldNameToAdd = "A";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R1");
          });
        }); // by definition order
      }); // by individual criterion

      describe("criteria order", function() {

        describe("satisfaction overrules measurement level distance", function() {

          it("should prefer a visual role that is not satisfied and is of a lower measurement level to " +
            "one that is satisfied and has the same measurement level, all other things equal, " +
            "downcast continuous -> categorical", function() {

            var Model = BaseModel.extend({
              $type: {
                props: [
                  {
                    // Satisfied and of same measurement level
                    name: "R1",
                    base: RoleProperty,
                    modes: ["number"]
                  },
                  {
                    // Unsatisfied and of lower measurement level
                    name: "R2",
                    base: RoleProperty,
                    modes: ["list"],
                    fields: {countMin: 1}
                  }
                ]
              }
            });

            var dataTable = new Table({
              model: [
                {name: "A", type: "number"} // level = quantitative
              ]
            });

            var model = new Model({
              "data": dataTable
            });
            var fieldNameToAdd = "A";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R2");
          });
        });

        describe("measurement level distance overrules attribute count", function() {

          it("should prefer a visual role that is the same measurement level and is mapped to one attribute " +
            "to one that is of a lower measurement level and is unmapped, " +
            "all other things equal", function() {

            var Model = BaseModel.extend({
              $type: {
                props: [
                  {
                    // Unmapped and of a lower level
                    name: "R1",
                    base: RoleProperty,
                    modes: ["list"]
                  },
                  {
                    // Mapped and of the same level
                    name: "R2",
                    base: RoleProperty,
                    modes: [["number"]]
                  }
                ]
              }
            });

            var dataTable = new Table({
              model: [
                {name: "A", type: "number"}, // level = quantitative
                {name: "B", type: "number"}
              ]
            });

            var model = new Model({
              "R2": {fields: ["A"]},
              "data": dataTable
            });
            var fieldNameToAdd = "B";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R2");
          });
        });

        xdescribe("attribute count overrules ordinal", function() {

          it("should prefer a visual role that is unmapped and has ordinal 2" +
            "to one that is mapped to one attribute and has ordinal 1, all other things equal", function() {

            var Model = BaseModel.extend({
              $type: {
                props: [
                  {
                    // Mapped to one attribute.
                    name: "R1",
                    base: RoleProperty,
                    modes: ["list"],
                    ordinal: 1
                  },
                  {
                    // Unmapped.
                    name: "R2",
                    base: RoleProperty,
                    modes: ["list"],
                    ordinal: 2
                  }
                ]
              }
            });

            var dataTable = new Table({
              model: [
                {name: "A", type: "string"}, // level = ordinal
                {name: "B", type: "string"}
              ]
            });

            var model = new Model({
              "R1": {fields: ["A"]},
              "data": dataTable
            });
            var fieldNameToAdd = "B";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R2");
          });
        });

        describe("ordinal overrules definition order", function() {

          it("should prefer a visual role with ordinal 1 that is defined last " +
            "to one with ordinal 2 that is defined first, all other things equal", function() {

            var dataTable = new Table({
              model: [
                {name: "A", type: "string"} // level = ordinal
              ]
            });

            var model = new ModelListListOrdinals({
              "data": dataTable
            });
            var fieldNameToAdd = "A";
            var roleUsage = roleUtil.getBestRoleForAddingField(model, fieldNameToAdd);

            expectSuccess(roleUsage, "R2");
          });
        });
      });

      describe("mixed, assorted cases", function() {

        var SampleBubbleModel;
        var dataTable;

        beforeAll(function() {
          SampleBubbleModel = BaseModel.extend({
            $type: {
              props: [
                {name: "rows", base: RoleProperty, modes: ["list"], ordinal: 3, fields: {countMin: 1}},
                {name: "x", base: RoleProperty, modes: ["number"], ordinal: 1, fields: {isRequired: true}},
                {name: "y", base: RoleProperty, modes: ["number"], ordinal: 2, fields: {isRequired: true}},
                {name: "color", base: RoleProperty, modes: ["number", ["string"]], ordinal: 4},
                {name: "size", base: RoleProperty, modes: ["number"], ordinal: 5}
              ]
            }
          });

          dataTable = new Table({
            model: [
              {name: "Sales", type: "number"},
              {name: "PriceEach", type: "number"},
              {name: "QuantityOrdered", type: "number"},
              {name: "OtherMeasure", type: "number"},
              {name: "Status", type: "string"},
              {name: "Account", type: "string"},
              {name: "Territory", type: "string"}
            ]
          });
        });

        describe("Bubble Chart: Sample Interaction", function() {

          it("1. should prefer mapping to a required continuous visual role first, " +
             "for a 'continuous' field, when no visual role is mapped", function() {

            var model = new SampleBubbleModel({
              "data": dataTable
            });

            var roleUsage = roleUtil.getBestRoleForAddingField(model, "Sales");

            expectSuccess(roleUsage, "x"); // "y", "rows", "color", "size"
          });

          it("2. should prefer mapping to a required continuous visual roles first, " +
             "for a continuous field, ignoring any visual role already satisfied", function() {

            var model = new SampleBubbleModel({
              "x": {fields: ["Sales"]},
              "data": dataTable
            });

            var roleUsage = roleUtil.getBestRoleForAddingField(model, "PriceEach");
            expectSuccess(roleUsage, "y"); // "rows", "color", "size"
          });

          it("3. should prefer mapping to a required ordinal visual roles first, " +
             "for a 'ordinal' field, ignoring any visual role already satisfied", function() {

            var model = new SampleBubbleModel({
              "x": {fields: ["Sales"]},
              "y": {fields: ["PriceEach"]},
              "data": dataTable
            });

            var roleUsage = roleUtil.getBestRoleForAddingField(model, "Status");
            expectSuccess(roleUsage, "rows"); // "color"
          });

          it("4. should prefer mapping to the visual role with least field count, " +
             "ignoring any visual role already satisfied", function() {

            var model = new SampleBubbleModel({
              "x": {fields: ["Sales"]},
              "y": {fields: ["PriceEach"]},
              "rows": {fields: ["Status"]},
              "data": dataTable
            });

            var roleUsage = roleUtil.getBestRoleForAddingField(model, "QuantityOrdered");
            expectSuccess(roleUsage, "color"); // "size", "rows"
          });

          it("5a. should prefer mapping a numeric field to the continuous visual role with least field count, " +
             "ignoring any visual role already satisfied", function() {

            var model = new SampleBubbleModel({
              "x": {fields: ["Sales"]},
              "y": {fields: ["PriceEach"]},
              "rows": {fields: ["Status"]},
              "color": {fields: ["QuantityOrdered"]},
              "data": dataTable
            });

            var roleUsage = roleUtil.getBestRoleForAddingField(model, "OtherMeasure");
            expectSuccess(roleUsage, "size"); // "rows"
          });

          it("5b. should prefer mapping a string field to the categorical visual role with least field count, " +
             "ignoring any visual role already satisfied", function() {

            var model = new SampleBubbleModel({
              "x": {fields: ["Sales"]},
              "y": {fields: ["PriceEach"]},
              "rows": {fields: ["Status"]},
              "color": {fields: ["QuantityOrdered"]},
              "data": dataTable
            });

            var roleUsage = roleUtil.getBestRoleForAddingField(model, "Account");
            expectSuccess(roleUsage, "rows");
          });
        });
      });
    });
  });
});
