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
  "pentaho/visual/data/Attribute"
], function(Model, Attribute) {

  describe("visual/data/Model -", function() {

    it("should be a function", function() {
      expect(typeof Model).toBe("function");
    });

    describe("new()", function() {
      it("should not throw", function() {
        new Model();
      });

      it("should return a model instance", function() {
        expect(new Model() instanceof Model).toBe(true);
      });

      it("should return a model instance with an attributes array", function() {
        var model = new Model();
        expect(model.attributes instanceof Array).toBe(true);
      });

      it("should return a model instance with no attributes", function() {
        var model = new Model();
        expect(model.attributes.length).toBe(0);
      });
    });

    describe("new(attributes:Array)", function() {
      it("should not throw when given an empty array", function() {
        new Model([]);
      });

      it("should return a model instance when given an empty array", function() {
        expect(new Model([]) instanceof Model).toBe(true);
      });

      it("should return a model with one attribute when given an array with one string", function() {
        var model = new Model(["test"]);
        expect(model.attributes.length).toBe(1);

        var attr = model.attributes[0];
        expect(attr instanceof Attribute).toBe(true);
        expect(attr.name).toBe("test");
      });
    });

    describe("new(spec:Object)", function() {
      it("should not throw when given an empty spec", function() {
        new Model({});
      });

      it("should return a model instance when given an empty spec", function() {
        expect(new Model({}) instanceof Model).toBe(true);
      });

      it("should return a model instance when given a spec with an empty `attrs` array", function() {
        expect(new Model({attrs: []}) instanceof Model).toBe(true);
      });

      it("should return a model with one attribute when given a spec with an array with one string", function() {
        var model = new Model({attrs: ["test"]});

        expect(model.attributes.length).toBe(1);

        var attr = model.attributes[0];
        expect(attr instanceof Attribute).toBe(true);
        expect(attr.name).toBe("test");
      });
    });

    describe("#attributes -", function() {
      it("should have length 3 when there are 3 attributes", function() {
        var model = new Model([
          {name: "A", type: "string"},
          {name: "B", type: "number"},
          {name: "C", type: "boolean"}
        ]);

        expect(model.attributes.length).toBe(3);
      });

      it("should contain Attribute instances in each index", function() {
        var model = new Model([
            {name: "A", type: "string"},
            {name: "B", type: "number"},
            {name: "C", type: "boolean"}
          ]);

        var attrs = model.attributes;
        expect(attrs[0] instanceof Attribute).toBe(true);
        expect(attrs[1] instanceof Attribute).toBe(true);
        expect(attrs[2] instanceof Attribute).toBe(true);
      });

      it("should contain attribute instances in the same position as in the input JSON", function() {
        var model = new Model([
          {name: "A", type: "string"},
          {name: "B", type: "number"},
          {name: "C", type: "boolean"}
        ]);

        var attrs = model.attributes;
        expect(attrs[0].name).toBe("A");
        expect(attrs[1].name).toBe("B");
        expect(attrs[2].name).toBe("C");
      });

      it("should contain attribute instances with `ordinal` matching their position", function() {
        var model = new Model([
          {name: "A", type: "string"},
          {name: "B", type: "number"},
          {name: "C", type: "boolean"}
        ]);

        var attrs = model.attributes;
        expect(attrs[0].ordinal).toBe(0);
        expect(attrs[1].ordinal).toBe(1);
        expect(attrs[2].ordinal).toBe(2);
      });

      describe("#get(name)", function() {
        it("should return the attribute with the specified name", function() {
          var model = new Model([
              {name: "A", type: "string"},
              {name: "B", type: "number"},
              {name: "C", type: "boolean"}
            ]);

          expect(model.attributes.get("B")).toBe(model.attributes[1]);
        });

        it("should return `null` if the specified name is not the name of a defined attribute", function() {
          var model = new Model([
            {name: "A", type: "string"},
            {name: "B", type: "number"},
            {name: "C", type: "boolean"}
          ]);

          expect(model.attributes.get("Z")).toBe(null);
        });
      });

      describe("#get(name, assertExists)", function() {
        it("should throw if assertExists is `true` and the specified name is not the name of a defined attribute", function() {
          var model = new Model([
            {name: "A", type: "string"},
            {name: "B", type: "number"},
            {name: "C", type: "boolean"}
          ]);

          expect(function() {
            model.attributes.get("Z", true);
          }).toThrowError("A attribute with name 'Z' is not defined.");
        });
      });
    });
  });
});