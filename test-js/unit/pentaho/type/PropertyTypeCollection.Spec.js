/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/Property",
  "pentaho/type/PropertyTypeCollection",
  "tests/pentaho/util/errorMatch"
], function(Context, Property, PropertyTypeCollection, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  var context = new Context();
  var PentahoBoolean = context.get("pentaho/type/boolean");
  var PentahoString = context.get("pentaho/type/string");
  var Complex = context.get("pentaho/type/complex");
  var PostalCode = PentahoString.extend();
  var Derived = Complex.extend({
    type: {
      props: ["foo", "guru"]
    }
  });

  describe("pentaho/type/PropertyTypeCollection -", function() {

    it("is a function", function() {
      expect(typeof PropertyTypeCollection).toBe("function");
    });

    describe("PropertyTypeCollection constructor()", function() {
      var props;

      beforeEach(function() {
        props = PropertyTypeCollection.to([], Derived.type);
      });

      it("should throw if constructor directly called without a declaring complex", function() {
        expect(function() {
          props = new PropertyTypeCollection();
        }).toThrow(errorMatch.argRequired("declaringType"));
      });

      it("should return an object", function() {
        expect(typeof props).toBe("object");
      });

      it("should return an array of length 0", function() {
        expect(props.length).toBe(0);
      });

      it("should convert an array of pentaho.type.UPropertyTypeProto", function() {
        var props = PropertyTypeCollection.to(["foo", "bar"], Derived.type);
        expect(props.length).toBe(2);
        expect(props[0].name).toBe("foo");
        expect(props[0].type).toBe(PentahoString.type);
        expect(props[1].name).toBe("bar");
        expect(props[1].type).toBe(PentahoString.type);
      });

      describe("Adding, removing, and replacing a PropertyType to the PropertyTypeCollection", function() {

        it("should add object to the collection", function() {
          props.add({name: "foo1", type: "boolean"});
          expect(props.length).toBe(1);
          expect(props[0].type).toBe(PentahoBoolean.type);
        });

        it("should use List.add() to replace an object with the same name in the collection with updated type, etc.",
            function() {

          var DerivedBoolean = PentahoBoolean.extend();
          props.add({name: "foo",  type: "boolean"});
          props.add({name: "foo2", type: "string"});
          props.add({name: "foo",  type: DerivedBoolean});
          expect(props.length).toBe(2);
          expect(props[0].type).toBe(DerivedBoolean.type);
        });

        it("should throw when attempting to add a property with a falsy name", function() {
          [
            null, undefined, false, 0, ""
          ].forEach(function(name) {
            expect(function() {
              props.add(name);
            }).toThrow(errorMatch.argRequired("props[i]"));
          });
        });

        it("should use List.replace() to replace an object with the same name in the collection with updated type, ...",
            function() {
          props.add({name: "foo", type: "boolean"});
          props.add({name: "foo2", type: "string"});
          props.replace({name: "foo", type: "boolean"}, 0);
          expect(props.length).toBe(2);
          expect(props[0].type).toBe(PentahoBoolean.type);
        });

        it("should throw when attempting to replace a non-existent property", function() {
          props.add({name: "foo", type: "boolean"});
          expect(function() {
            props.replace({name: "bar", type: "string"}, 0);
          }).toThrow(errorMatch.argInvalid("props[i]"));
        });

        it("should throw when calling replace with no arguments", function() {
          expect(function() {
            props.replace();
          }).toThrow(errorMatch.argRequired("props[i]"));
        });
      });

      describe("Configuring the PropertyTypeCollection", function() {
        it("should throw if invoked with no arguments", function() {
          expect(function() {
            props.configure();
          }).toThrow(errorMatch.argRequired("config"));
        });

        it("should accept an array of pentaho.type.UPropertyTypeProto", function() {
          props.configure(["foo", "bar"]);
          expect(props.length).toBe(2);
          expect(props[0].name).toBe("foo");
          expect(props[0].type).toBe(PentahoString.type);
          expect(props[1].name).toBe("bar");
          expect(props[1].type).toBe(PentahoString.type);
        });

        it("should accept an array of pentaho.type.UPropertyTypeProto whose elements were previously defined", function() {
          var props = PropertyTypeCollection.to(["foo", {name: "eggs", type: "boolean"}], Derived.type);
          props.configure(["foo", "bar"]);
          expect(props.length).toBe(3);
          expect(props[0].name).toBe("foo");
          expect(props[0].type).toBe(PentahoString.type);
          expect(props[1].name).toBe("eggs");
          expect(props[1].type).toBe(PentahoBoolean.type);
          expect(props[2].name).toBe("bar");
          expect(props[2].type).toBe(PentahoString.type);
        });

        it("should accept an object whose keys are the property names and the values are pentaho.type.UPropertyTypeProto",
            function() {
          props.configure({foo: {name: "foo", type: "boolean"}, guru: {name: "guru", type: "boolean"}});
          expect(props.length).toBe(2);
          expect(props[0].type).toBe(PentahoBoolean.type);
          expect(props[1].name).toBe("guru");
          expect(props[1].type).toBe(PentahoBoolean.type);
        });

        it("should throw when attempting to configure with key that does not match its property name", function() {
          expect(function() {
            props.configure({foo: {name: "bar", type: "boolean"}});
          }).toThrow(errorMatch.argInvalid("config"));
        });

        it("should use the key as property name if the property spec does not include a name", function() {
          props.configure({foo: {type: "boolean"}});
          expect(props.length).toBe(1);
          expect(props[0].name).toBe("foo");
        });

        it("should replace any existing configurations of the same name and update its type", function() {
          props.configure(["foo", "bar"]);

          expect(props.length).toBe(2);

          expect(props[0].name).toBe("foo");
          expect(props[0].type).toBe(PentahoString.type);

          expect(props[1].name).toBe("bar");
          expect(props[1].type).toBe(PentahoString.type);

          props.configure({
            foo:  {name: "foo",  type: PostalCode.type},
            guru: {name: "guru", type: PostalCode.type}
          });
          expect(props.length).toBe(3);

          expect(props[0].type).toBe(PostalCode.type);

          expect(props[2].name).toBe("guru");
          expect(props[2].type).toBe(PostalCode.type);
        });

        it("should preserve the type when reconfiguring the property without specifying the type", function() {
          props.configure({foo: {name: "foo", type: "boolean"}});
          props.configure(["foo"]);
          expect(props.length).toBe(1);
          expect(props[0].type).toBe(PentahoBoolean.type);
        });

      });
    });

    describe("property inheritance", function() {
      var MoreDerived = Derived.extend({
        type: {
          label: "MoreDerived",
          props: ["bar"]
        }
      });

      var props;

      beforeEach(function() {
        props = PropertyTypeCollection.to([], MoreDerived.type);
      });

      it("should inherit base properties and return an array of length 2", function() {
        expect(props.length).toBe(2);
      });

      describe("Adding, removing, and replacing a PropertyType to the PropertyTypeCollection", function() {
        it("should use List.add() to override a inherited property with the same name", function() {
          expect(props[0].declaringType).toBe(Derived.type);
          props.add({name: "foo"});
          expect(props[0].declaringType).toBe(MoreDerived.type);

          expect(props.length).toBe(2);
        });

        it("should throw if using List.add() to override a inherited property's 'type' to something that " +
           "isn't a subtype of the base property's 'type'", function() {
          expect(function() {
            props.add({name: "foo", type: "boolean"});
          }).toThrow(errorMatch.argInvalid("type"));
        });

        it("should use List.replace() to override a inherited property with the same name", function() {
          expect(props[0].declaringType).toBe(Derived.type);
          props.replace({name: "foo"}, 0);
          expect(props[0].declaringType).toBe(MoreDerived.type);

          expect(props.length).toBe(2);
        });

        it("should throw if using List.replace() to override a inherited property's 'type' to something that " +
           "isn't a subtype of the base property's 'type'", function() {
          expect(function() {
            props.replace({name: "foo", type: "boolean"}, 0);
          }).toThrow(errorMatch.argInvalid("type"));
        });
      });
    });
  }); // pentaho/type/PropertyTypeCollection
});
