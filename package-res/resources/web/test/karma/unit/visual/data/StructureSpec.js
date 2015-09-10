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
define([
  "pentaho/visual/data/Model",
  "pentaho/visual/data/Structure",
  "pentaho/visual/data/StructurePosition",
  "pentaho/visual/data/Attribute",
  "pentaho/visual/_utils"
], function(Model, Structure, StructurePosition, Attribute, utils) {

  describe("visual/data/Structure -", function() {
    var model;

    function expectStructurePosition(posSpec, keyArgs) {
      if(keyArgs != null) {
        keyArgs = utils.setBase({model: model}, keyArgs || {});
      } else {
        keyArgs = {model: model};
      }

      var structure = Structure.to([posSpec], keyArgs);
      expect(structure instanceof Array).toBe(true);
      expect(structure instanceof Structure).toBe(true);
      expect(structure.length).toBe(1);

      var structPos = structure[0];
      expect(structPos instanceof StructurePosition).toBe(true);

      return structPos;
    }

    beforeEach(function() {
      model = new Model([
        {name: "A", type: "string"},
        {name: "B", type: "number"},
        {name: "C", type: "boolean"}
      ]);
    });

    describe("Structure#to(posSpecs, keyArgs) -", function() {
      it("should create a structure with no positions when `posSpecs` is nully", function() {
        var structure = Structure.to(null, {model: model});
        expect(structure instanceof Array).toBe(true);
        expect(structure instanceof Structure).toBe(true);
        expect(structure.length).toBe(0);
      });

      it("should throw if `posSpecs` is not nully and is not an array", function() {
        expect(function() {
          Structure.to(1, {model: model});
        }).toThrowError("Argument invalid: 'structSpec'. Not an array.");
      });

      it("should create a structure with one position when `posSpecs` is an array with a string, " +
          "the name of an existing attribute", function() {
        expectStructurePosition("A");
      });

      it("should create a structure with 3 positions when `posSpecs` is an array with 3 strings, " +
          "the name of existing attributes", function() {
        var structure = Structure.to(["A", "B", "C"], {model: model});
        expect(structure instanceof Array).toBe(true);
        expect(structure instanceof Structure).toBe(true);
        expect(structure.length).toBe(3);

        expect(structure[0] instanceof StructurePosition).toBe(true);
        expect(structure[1] instanceof StructurePosition).toBe(true);
        expect(structure[2] instanceof StructurePosition).toBe(true);
      });

      it("should create a structure position with correct `ordinal` values", function() {
        var structure = Structure.to(["A", "B", "C"], {model: model});
        expect(structure[0].ordinal).toBe(0);
        expect(structure[1].ordinal).toBe(1);
        expect(structure[2].ordinal).toBe(2);
      });
    });

    describe("StructurePosition -", function() {
      it("should have the attribute whose name is a specified `posSpec` string", function() {
        var structPos = expectStructurePosition("A");
        expect(structPos.attribute).toBe(model.attributes.get("A"));
      });

      it("should throw when a specified `posSpec` string is not the name of an attribute", function() {
        expect(function() {
          expectStructurePosition("Z");
        }).toThrowError("A attribute with name 'Z' is not defined.");
      });

      it("should have the attribute whose name is the `attr` property of the specified `posSpec` object", function() {
        var structPos = expectStructurePosition({attr: "A"});
        expect(structPos.attribute).toBe(model.attributes.get("A"));
      });


      it("should have the attribute specified as an Attribute instance in `posSpec`", function() {
        var attr = model.attributes.get("A");
        var structPos = expectStructurePosition(attr);
        expect(structPos.attribute).toBe(attr);
      });

      it("should have the attribute specified as an Attribute instance in `posSpec.attr`", function() {
        var attr = model.attributes.get("A");
        var structPos = expectStructurePosition({attr: attr});
        expect(structPos.attribute).toBe(attr);
      });
    });
  });

});