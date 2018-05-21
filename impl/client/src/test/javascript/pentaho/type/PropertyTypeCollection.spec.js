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
  "pentaho/type/Property",
  "pentaho/type/Boolean",
  "pentaho/type/Complex",
  "pentaho/type/String",
  "pentaho/type/PropertyTypeCollection",
  "tests/pentaho/util/errorMatch"
], function(Property, PentahoBoolean, Complex, PentahoString, PropertyTypeCollection, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho/type/PropertyTypeCollection -", function() {

    var PostalCode;
    var Derived;

    beforeAll(function() {
      PostalCode = PentahoString.extend();
      Derived = Complex.extend({
        $type: {
          props: ["foo", "guru"]
        }
      });
    });

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

      it("should convert an array of pentaho.type.spec.PropertyType", function() {

        var props = PropertyTypeCollection.to(["foo", "bar"], Derived.type);

        expect(props.length).toBe(2);
        expect(props[0].name).toBe("foo");
        expect(props[0].valueType).toBe(PentahoString.type);
        expect(props[1].name).toBe("bar");
        expect(props[1].valueType).toBe(PentahoString.type);
      });

      describe("Adding, removing, and replacing a PropertyType to the PropertyTypeCollection", function() {

        it("should add object to the collection", function() {

          props.add({name: "foo1", valueType: "boolean"});

          expect(props.length).toBe(1);
          expect(props[0].valueType).toBe(PentahoBoolean.type);
        });

        it("should use List.add() to replace an object with the same name in the collection " +
          "with updated attributes.", function() {
          props.add({name: "foo", valueType: "boolean", isRequired: false});
          props.add({name: "foo2", valueType: "string"});

          props.add({name: "foo", isRequired: true});

          expect(props.length).toBe(2);
          expect(props[0].isRequired).toBe(true);
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

        it("should use List.replace() to replace an object with the same name in the collection " +
          "with updated type, ...", function() {
          props.add({name: "foo", valueType: "boolean"});
          props.add({name: "foo2", valueType: "string"});

          props.replace({name: "foo", valueType: "boolean"}, 0);

          expect(props.length).toBe(2);
          expect(props[0].valueType).toBe(PentahoBoolean.type);
        });

        it("should throw when attempting to replace a non-existent property", function() {

          props.add({name: "foo", valueType: "boolean"});

          expect(function() {
            props.replace({name: "bar", valueType: "string"}, 0);
          }).toThrow(errorMatch.argInvalid("props[i]"));
        });

        it("should throw when calling replace with no arguments", function() {
          expect(function() {
            props.replace();
          }).toThrow(errorMatch.argRequired("props[i]"));
        });

        it("should respect the property type specified in the `base` attribute", function() {

          var DerivedProperty = Property.extend();

          props.add({base: DerivedProperty, name: "foo", valueType: "boolean"});

          expect(props[0] instanceof DerivedProperty.Type).toBe(true);
        });

        it("should throw is the property type specified in " +
            "the `base` attribute is not a subtype of property", function() {

          expect(function() {
            props.add({base: Complex, name: "foo", valueType: "boolean"});
          }).toThrow(errorMatch.argInvalid("props[i]"));

        });
      });

      describe("Configuring the PropertyTypeCollection", function() {

        it("should throw if invoked with no arguments", function() {
          expect(function() {
            props.configure();
          }).toThrow(errorMatch.argRequired("config"));
        });

        it("should accept an array of pentaho.type.spec.PropertyType", function() {
          props.configure(["foo", "bar"]);

          expect(props.length).toBe(2);
          expect(props[0].name).toBe("foo");
          expect(props[0].valueType).toBe(PentahoString.type);
          expect(props[1].name).toBe("bar");
          expect(props[1].valueType).toBe(PentahoString.type);
        });

        it("should accept an array of pentaho.type.spec.PropertyType whose elements " +
          "were previously defined", function() {
          var props = PropertyTypeCollection.to(["foo", {name: "eggs", valueType: "boolean"}], Derived.type);

          props.configure(["foo", "bar"]);

          expect(props.length).toBe(3);
          expect(props[0].name).toBe("foo");
          expect(props[0].valueType).toBe(PentahoString.type);
          expect(props[1].name).toBe("eggs");
          expect(props[1].valueType).toBe(PentahoBoolean.type);
          expect(props[2].name).toBe("bar");
          expect(props[2].valueType).toBe(PentahoString.type);
        });

        it("should accept an object whose keys are the property names and the values are " +
           "pentaho.type.spec.PropertyType", function() {

          props.configure({
            foo:  {name: "foo", valueType: "boolean"},
            guru: {name: "guru", valueType: "boolean"}
          });

          expect(props.length).toBe(2);
          expect(props[0].valueType).toBe(PentahoBoolean.type);
          expect(props[1].name).toBe("guru");
          expect(props[1].valueType).toBe(PentahoBoolean.type);
        });

        it("should throw when attempting to configure with key that does not match its property name", function() {
          expect(function() {
            props.configure({foo: {name: "bar", valueType: "boolean"}});
          }).toThrow(errorMatch.argInvalid("config"));
        });

        it("should use the key as property name if the property spec does not include a name", function() {
          props.configure({foo: {valueType: "boolean"}});

          expect(props.length).toBe(1);
          expect(props[0].name).toBe("foo");
        });

        it("should replace any existing configurations of the same name and update attributes", function() {

          props.configure(["foo", "bar"]);

          expect(props.length).toBe(2);

          expect(props[0].name).toBe("foo");
          expect(props[0].isRequired).toBe(undefined);

          expect(props[1].name).toBe("bar");
          expect(props[1].isRequired).toBe(undefined);

          props.configure({
            foo:  {name: "foo", isRequired: true},
            guru: {name: "guru", isRequired: true}
          });

          expect(props.length).toBe(3);

          expect(props[0].isRequired).toBe(true);

          expect(props[2].name).toBe("guru");
          expect(props[2].isRequired).toBe(true);
        });

        it("should preserve the type when reconfiguring the property without specifying the type", function() {

          props.configure({foo: {name: "foo", valueType: "boolean"}});

          props.configure(["foo"]);

          expect(props.length).toBe(1);
          expect(props[0].valueType).toBe(PentahoBoolean.type);
        });

        it("should configure an existing property, but bailout if the spec is solely its name", function() {

          props.configure({foo: {name: "foo", valueType: "boolean"}});
          var propType = props[0];

          spyOn(propType, "extend");

          props.replace("foo", 0);

          expect(propType.extend).not.toHaveBeenCalled();
        });
      });
    });

    describe("property inheritance", function() {
      var MoreDerived;

      var props;

      beforeAll(function() {
        MoreDerived = Derived.extend({
          $type: {
            label: "MoreDerived",
            props: ["bar"]
          }
        });
      });

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

        it("should throw if using List.add() to override a inherited property's 'valueType' to something that " +
           "isn't a subtype of the base property's 'valueType'", function() {
          expect(function() {
            props.add({name: "foo", valueType: "boolean"});
          }).toThrow(errorMatch.argInvalid("valueType"));
        });

        it("should use List.replace() to override a inherited property with the same name", function() {
          expect(props[0].declaringType).toBe(Derived.type);
          props.replace({name: "foo"}, 0);
          expect(props[0].declaringType).toBe(MoreDerived.type);

          expect(props.length).toBe(2);
        });

        it("should throw if using List.replace() to override a inherited property's 'valueType' to something that " +
           "isn't a subtype of the base property's 'type'", function() {
          expect(function() {
            props.replace({name: "foo", valueType: "boolean"}, 0);
          }).toThrow(errorMatch.argInvalid("valueType"));
        });
      });
    });
  }); // pentaho/type/PropertyTypeCollection
});
