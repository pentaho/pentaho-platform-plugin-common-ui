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
  "pentaho/visual/role/AbstractProperty",
  "pentaho/type/action/Transaction",
  "tests/pentaho/util/errorMatch",
  "pentaho/visual/base/AbstractModel",
  "pentaho/visual/base/KeyTypes",
  "pentaho/type/ValidationError",
  "pentaho/data/Table"
], function(AbstractProperty, Transaction, errorMatch, AbstractModel, VisualKeyTypes, ValidationError, Table) {

  "use strict";

  /* globals describe, it, beforeAll, beforeEach, afterEach, spyOn */

  describe("pentaho.visual.role.AbstractProperty", function() {

    describe(".Type", function() {

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

      function createFullValidQualitativeMapping() {

        var DerivedVisualModel = AbstractModel.extend({
          $type: {
            props: {
              propRole: {
                base: "pentaho/visual/role/AbstractProperty"
              }
            }
          }
        });

        var data = new Table(getDataSpec1());

        var model = new DerivedVisualModel({
          data: data,
          propRole: {fields: ["country", "product"]}
        });

        assertIsValid(model);

        return model;
      }

      function assertIsValid(complex) {
        // this way, errors are shown in the console...
        expect(complex.validate()).toBe(null);
      }
      // endregion

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

            function assertIsInvalid(model) {
              if(txnScope) txnScope.acceptWill();

              expect(model.$type.get("propRole").validateOn(model) != null).toBe(true);
            }

            it("should stop validation if base validation returns errors", function() {

              var Model = AbstractModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/AbstractProperty"
                    }
                  }
                }
              });

              var rolePropType = Model.type.get("propRole");

              var model = new Model({
                propRole: {fields: [{}]}
              });

              expect(model.propRole.fields.count).toBe(1);

              // Assumptions
              var errors = rolePropType.validateOn(model);
              expect(Array.isArray(errors)).toBe(true);
              expect(errors.length).toBe(1);
            });

            it("should be invalid, when there are fields and the model has no data", function() {

              var model = createFullValidQualitativeMapping();

              model.data = null;

              assertIsInvalid(model);
            });

            it("should be invalid, when the name of a mapping field is not defined in the model data", function() {

              var model = createFullValidQualitativeMapping();
              model.propRole.fields.add({name: "mugambo"});

              assertIsInvalid(model);
            });
          });
        }
      });

      describe("#isVisualKeyEffective", function() {

        it("should return undefined when there is not associated model type", function() {

          var rolePropType = AbstractProperty.type;

          var result = rolePropType.isVisualKeyEffective;
          expect(result).toBe(undefined);
        });

        it("should return undefined when the associated model type does not have visualKeyType=dataKey", function() {

          var Model = AbstractModel.extend({
            $type: {
              visualKeyType: VisualKeyTypes.dataOrdinal,
              props: {
                propRole: {
                  base: "pentaho/visual/role/AbstractProperty"
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          var result = rolePropType.isVisualKeyEffective;
          expect(result).toBe(undefined);
        });

        it("should return true if the property has isVisualKey=true", function() {

          var Model = AbstractModel.extend({
            $type: {
              visualKeyType: VisualKeyTypes.dataKey,
              props: {
                propRole: {
                  base: "pentaho/visual/role/AbstractProperty",
                  isVisualKey: true
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          var result = rolePropType.isVisualKeyEffective;
          expect(result).toBe(true);
        });

        it("should return true if the property has isVisualKey=true", function() {

          var Model = AbstractModel.extend({
            $type: {
              visualKeyType: VisualKeyTypes.dataKey,
              props: {
                propRole: {
                  base: "pentaho/visual/role/AbstractProperty",
                  isVisualKey: false
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          var result = rolePropType.isVisualKeyEffective;
          expect(result).toBe(false);
        });
      });
    });
  });
});
