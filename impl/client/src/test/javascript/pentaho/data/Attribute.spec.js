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
  "pentaho/data/Model",
  "pentaho/data/Attribute",
  "pentaho/data/Member",
  "tests/pentaho/util/errorMatch"
], function(Model, Attribute, Member, errorMatch) {

  function expectAttribute(attrSpec) {
    var model = new Model([attrSpec]);

    expect(model.attributes.length).toBe(1);

    var attr = model.attributes[0];
    expect(attr instanceof Attribute).toBe(true);

    return attr;
  }

  describe("data/Attribute -", function() {
    describe("spec -", function() {
      describe("when a string", function() {
        var attr;
        beforeEach(function() {
          attr = expectAttribute("test");
        });

        it("should create an attribute with that name", function() {
          expect(attr.name).toBe("test");
        });

        it("should create an attribute with type string", function() {
          expect(attr.type).toBe("string");
        });

        it("should create an attribute whose label is undefined", function() {
          expect(attr.label).toBeUndefined();
        });

        it("should create an attribute whose format is null", function() {
          expect(attr.format).toBeNull();
        });

        it("should create an attribute with an empty members array", function() {
          expect(attr.members instanceof Array).toBe(true);
          expect(attr.members.length).toBe(0);
        });
      });

      describe("when an object", function() {
        it("should create an attribute with the name in the property `name`", function() {
          var attr = expectAttribute({name: "test"});
          expect(attr.name).toBe("test");
        });

        it("should create an attribute with the type in property `type`", function() {
          var attr = expectAttribute({name: "test", type: "number"});
          expect(attr.type).toBe("number");
        });

        it("should create an attribute with the label in property `label`", function() {
          var attr = expectAttribute({name: "test", label: "foo"});
          expect(attr.label).toBe("foo");
        });

        it("should create an attribute with the format in property `format`", function() {
          var format = {};
          var attr = expectAttribute({name: "test", format: format});
          expect(attr.format).toBe(format);
        });

        it("should create an attribute with the value in property `isKey`", function() {
          var attr = expectAttribute({name: "test", isKey: true});
          expect(attr.isKey).toBe(true);

          attr = expectAttribute({name: "test", isKey: false});
          expect(attr.isKey).toBe(false);
        });

        it("should create an attribute with the value in property `hierarchyName`", function() {
          var attr = expectAttribute({name: "test", hierarchyName: "Foo"});
          expect(attr.hierarchyName).toBe("Foo");

          attr = expectAttribute({name: "test"});
          expect(attr.hierarchyName).toBe(null);

          attr = expectAttribute({name: "test", type: "number", hierarchyName: "Foo"});
          expect(attr.hierarchyName).toBe(null);
        });

        it("should create an attribute with the value in property `hierarchyOrdinal`", function() {
          var attr = expectAttribute({name: "test", hierarchyName: "Foo", hierarchyOrdinal: 1});
          expect(attr.hierarchyOrdinal).toBe(1);

          attr = expectAttribute({name: "test", hierarchyName: "Foo"});
          expect(attr.hierarchyOrdinal).toBe(0);

          attr = expectAttribute({name: "test", hierarchyOrdinal: 1});
          expect(attr.hierarchyOrdinal).toBe(null);

          attr = expectAttribute({name: "test", type: "number", hierarchyName: "Foo", hierarchyOrdinal: 3});
          expect(attr.hierarchyOrdinal).toBe(null);
        });
      });
    });

    describe("#type", function() {
      it("should allow arbitrary types", function() {
        var attr = expectAttribute({name: "test", type: "foo"});
        expect(attr.type).toBe("foo");
      });

      it("should normalize arbitrary types to lower case", function() {
        var attr = expectAttribute({name: "test", type: "Foo"});
        expect(attr.type).toBe("foo");
      });

      it("should normalize known types to lower case", function() {
        var attr = expectAttribute({name: "test", type: "STRING"});
        expect(attr.type).toBe("string");

        attr = expectAttribute({name: "test", type: "Number"});
        expect(attr.type).toBe("number");

        attr = expectAttribute({name: "test", type: "DaTE"});
        expect(attr.type).toBe("date");

        attr = expectAttribute({name: "test", type: "booLean"});
        expect(attr.type).toBe("boolean");
      });

      it("should convert datetime to date", function() {
        var attr = expectAttribute({name: "test", type: "DateTime"});
        expect(attr.type).toBe("date");
      });
    });

    describe("#isContinuous", function() {

      it("should be `true` when type is 'number'", function() {
        var attr = expectAttribute({name: "test", type: "number"});
        expect(attr.isContinuous).toBe(true);
      });

      it("should be `true` when type is 'date'", function() {
        var attr = expectAttribute({name: "test", type: "date"});
        expect(attr.isContinuous).toBe(true);
      });

      it("should be `true` when type is 'Date' — unaffected by non-lower case", function() {
        var attr = expectAttribute({name: "test", type: "Date"});
        expect(attr.isContinuous).toBe(true);
      });

      it("should be `false` when type is 'string'", function() {
        var attr = expectAttribute({name: "test", type: "string"});
        expect(attr.isContinuous).toBe(false);
      });

      it("should be `false` when type is 'boolean'", function() {
        var attr = expectAttribute({name: "test", type: "boolean"});
        expect(attr.isContinuous).toBe(false);
      });

      it("should be `false` when type is 'foo'", function() {
        var attr = expectAttribute({name: "test", type: "foo"});
        expect(attr.isContinuous).toBe(false);
      });
    });

    describe("#isKey", function() {

      describe("default value", function() {

        it("should default to `false` when type is 'number'", function() {
          var attr = expectAttribute({name: "test", type: "number"});
          expect(attr.isKey).toBe(false);
        });

        it("should default to `false` when type is 'date'", function() {
          var attr = expectAttribute({name: "test", type: "date"});
          expect(attr.isKey).toBe(false);
        });

        it("should default to `false` when type is 'string'", function() {
          var attr = expectAttribute({name: "test", type: "string"});
          expect(attr.isKey).toBe(false);
        });

        it("should default to `false` when type is 'boolean'", function() {
          var attr = expectAttribute({name: "test", type: "boolean"});
          expect(attr.isKey).toBe(false);
        });

        it("should default to `false` when type is 'foo'", function() {
          var attr = expectAttribute({name: "test", type: "foo"});
          expect(attr.isKey).toBe(false);
        });
      });

      describe("specified value", function() {
        it("should be `false` when type is 'number' and isKey is specified as false", function() {
          var attr = expectAttribute({name: "test", type: "number", isKey: false});
          expect(attr.isKey).toBe(false);
        });

        it("should be `true` when type is 'number' and isKey is specified as true", function() {
          var attr = expectAttribute({name: "test", type: "number", isKey: true});
          expect(attr.isKey).toBe(true);
        });

        it("should be `false` when type is 'string' and isKey is specified as false", function() {
          var attr = expectAttribute({name: "test", type: "string", isKey: false});
          expect(attr.isKey).toBe(false);
        });

        it("should be `true` when type is 'string' and isKey is specified as true", function() {
          var attr = expectAttribute({name: "test", type: "string", isKey: true});
          expect(attr.isKey).toBe(true);
        });
      });
    });

    describe("#isPercent", function() {
      it("should be undefined for categorical attributes", function() {
        var attr = expectAttribute({name: "test", type: "string"});
        expect(attr.isPercent).toBe(undefined);

        attr = expectAttribute({name: "test", type: "foo", isContinuous: false});
        expect(attr.isPercent).toBe(undefined);
      });

      it("should be false when unspecified for a continuous attribute", function() {
        var attr = expectAttribute({name: "test", type: "number"});
        expect(attr.isPercent).toBe(false);
      });

      it("should be false when specified false for a continuous attribute", function() {
        var attr = expectAttribute({name: "test", type: "number", isPercent: false});
        expect(attr.isPercent).toBe(false);
      });

      it("should be true when specified true for a continuous attribute", function() {
        var attr = expectAttribute({name: "test", type: "number", isPercent: true});
        expect(attr.isPercent).toBe(true);
      });
    });

    describe("#members", function() {
      it("should be undefined for continuous attributes", function() {
        var attr = expectAttribute({name: "test", type: "number"});
        expect(attr.members).toBe(null);
      });

      it("should be an empty array for categorical attributes, when unspecified", function() {
        var attr = expectAttribute({name: "test", type: "string"});
        expect(attr.members instanceof Array).toBe(true);
        expect(attr.members.length).toBe(0);
      });

      it("should create a specified member for a categorical attribute", function() {
        var attr = expectAttribute({
          name: "test",
          type: "string",
          members: [{
            v: "a",
            f: "A"
          }]
        });
        expect(attr.members.length).toBe(1);
        expect(attr.members[0] instanceof Member).toBe(true);
      });

      it("should create specified members on the correct positions", function() {
        var attr = expectAttribute({
          name: "test",
          type: "string",
          members: [
            {v: "a", f: "A"},
            {v: "b", f: "B"},
            {v: "c", f: "C"}
          ]
        });

        expect(attr.members.length).toBe(3);

        expect(attr.members[0] instanceof Member).toBe(true);
        expect(attr.members[0].value).toBe("a");

        expect(attr.members[1] instanceof Member).toBe(true);
        expect(attr.members[1].value).toBe("b");

        expect(attr.members[2] instanceof Member).toBe(true);
        expect(attr.members[2].value).toBe("c");
      });

      it("should create specified members with `ordinal` matching their position", function() {
        var attr = expectAttribute({
          name: "test",
          type: "string",
          members: [
            {v: "a", f: "A"},
            {v: "b", f: "B"},
            {v: "c", f: "C"}
          ]
        });

        expect(attr.members[0].ordinal).toBe(0);
        expect(attr.members[1].ordinal).toBe(1);
        expect(attr.members[2].ordinal).toBe(2);
      });
    });

    describe("#property(name) -", function() {
      it("should return the value of the specified attribute property", function() {
        var foo = {},
            bar = {},
            model = new Model([
                {name: "A", p: {foo: foo}},
                {name: "B", p: {bar: bar}}
              ]);

        expect(model.attributes[0].property("foo")).toBe(foo);
        expect(model.attributes[1].property("bar")).toBe(bar);
      });

      it("should return `undefined` for an attribute property which is not defined", function() {
        var model = new Model([
            {name: "A"}
          ]);

        expect(model.attributes[0].property("foo")).toBe(undefined);
      });
    });

    describe("#property(name, value) -", function() {
      it("should set the value of the specified attribute property, given the attribute index", function() {
        var foo = {},
            bar = {},
            model = new Model([
                {name: "A"},
                {name: "B"}
              ]);

        model.attributes[0].property("foo", foo);
        model.attributes[1].property("bar", bar);

        expect(model.attributes[0].property("foo")).toBe(foo);
        expect(model.attributes[1].property("bar")).toBe(bar);
      });
    });

    describe("#name", function() {
      it("should throw if the attribute name is empty", function() {
        expect(function() {
          expectAttribute({attr: ""});
        }).toThrow(errorMatch.argRequired("spec.name"));

        expect(function() {
          expectAttribute("");
        }).toThrow(errorMatch.argRequired("spec.name"));
      });
    });
  });
});
