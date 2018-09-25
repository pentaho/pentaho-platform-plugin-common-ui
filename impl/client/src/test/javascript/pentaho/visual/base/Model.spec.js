/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/visual/base/Model",
  "pentaho/data/Table",
  "tests/pentaho/util/errorMatch"
], function(Model, Table, errorMatch) {

  "use strict";

  describe("pentaho.visual.base.Model", function() {

    var dataSpec;

    beforeEach(function() {
      var data = {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "sales", type: "number", label: "Sales"}
        ],
        rows: [
          {c: [{v: "Portugal"}, {v: 12000}]},
          {c: [{v: "Ireland"}, {v: 6000}]}
        ]
      };

      dataSpec = {
        v: new Table(data)
      };
    });

    it("can be instantiated with a well-formed spec", function() {
      expect(function() {
        return new Model({
          data: dataSpec
        });
      }).not.toThrowError();
    });

    it("can be instantiated without arguments", function() {
      expect(function() {
        return new Model();
      }).not.toThrowError();
    });

    it("should pre-load all standard visual role related modules", function() {

      require.using(["require", "pentaho/visual/base/Model"], function(localRequire) {
        localRequire("pentaho/visual/role/Property");
        localRequire("pentaho/visual/role/Mode");
      });
    });

    describe("ModelType#visualKeyType", function() {

      it("should be undefined in the base.Model class", function() {

        expect(Model.type.visualKeyType).toBe(undefined);
      });

      it("should remain undefined in an abstract sub-class", function() {

        var SubModel = Model.extend({
          $type: {isAbstract: true}
        });

        expect(SubModel.type.visualKeyType).toBe(undefined);
      });

      it("should default to 'dataKey' in a non-abstract sub-class", function() {

        var SubModel = Model.extend();

        expect(SubModel.type.visualKeyType).toBe("dataKey");
      });

      it("should be specifiable in an abstract class if not yet defined", function() {

        var SubModel = Model.extend({
          $type: {
            isAbstract: true,
            visualKeyType: "dataOrdinal"
          }
        });

        expect(SubModel.type.visualKeyType).toBe("dataOrdinal");

        SubModel = Model.extend({
          $type: {
            isAbstract: true,
            visualKeyType: "dataKey"
          }
        });

        expect(SubModel.type.visualKeyType).toBe("dataKey");
      });

      it("should preserve the inherited specified value from an abstract base class " +
        "in an abstract subclass", function() {

        var SubModel = Model.extend({
          $type: {
            isAbstract: true,
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend({
          $type: {
            isAbstract: true
          }
        });

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });

      it("should preserve the inherited specified value from an abstract base class " +
        "in a non-abstract subclass", function() {

        var SubModel = Model.extend({
          $type: {
            isAbstract: true,
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend();

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });

      it("should preserve the inherited specified value from a non-abstract base class " +
        "in a non-abstract subclass", function() {

        var SubModel = Model.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend();

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });

      it("should preserve the inherited specified value from a non-abstract base class " +
        "in an abstract subclass", function() {

        var SubModel = Model.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend({
          $type: {
            isAbstract: true
          }
        });

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });

      it("should throw if an invalid value is specified", function() {

        expect(function() {

          Model.extend({
            $type: {
              visualKeyType: "dataFoo"
            }
          });
        }).toThrow(errorMatch.argRange("visualKeyType"));
      });

      it("should throw if specifying a value different from the inherited, specified value", function() {

        var SubModel = Model.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        expect(function() {
          SubModel.extend({
            $type: {
              visualKeyType: "dataKey"
            }
          });
        }).toThrow(errorMatch.operInvalid());
      });

      it("should accept specifying a value equal to the inherited, specified value", function() {

        var SubModel = Model.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        var SubModel2 = SubModel.extend({
          $type: {
            visualKeyType: "dataOrdinal"
          }
        });

        expect(SubModel2.type.visualKeyType).toBe("dataOrdinal");
      });
    });
  });
});
