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
  "pentaho/type/boolean",
  "pentaho/type/string",
  "pentaho/type/PropertyMetaCollection",
  "pentaho/type/complex"
], function (Context, Property, booleanFactory, stringFactory, PropertyMetaCollection, complexFactory) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Boolean = context.get(booleanFactory),
      String = context.get(stringFactory),
      Complex = context.get(complexFactory),
      Derived= Complex.extend({
        meta: {
          label: "Derived",
          props: ["foo", "guru"]
        }
      });

  describe("pentaho/type/PropertyMetaCollection -", function () {

    it("is a function", function () {
      expect(typeof PropertyMetaCollection).toBe("function");
    });

    describe("PropertyMetaCollection constructor()", function () {
      var props;

      beforeEach(function () {
        props = PropertyMetaCollection.to([], Derived.meta);
      });

      it("should return an object", function () {
        expect(typeof props).toBe("object");
      });

      it("should return an array of length 0", function () {
        expect(props.length).toBe(0);
      });

      it("should convert an array of pentaho.type.UPropertyMeta", function () {
        var props = PropertyMetaCollection.to(["foo", "bar"], Derived.meta);
        expect(props.length).toBe(2);
        expect(props[0].name).toBe("foo");
        expect(props[0].type).toBe(String.meta);
        expect(props[1].name).toBe("bar");
        expect(props[1].type).toBe(String.meta);
      });

      describe("Adding, removing, and replacing a PropertyMeta to the PropertyMetaCollection", function () {

        it("should add object to the collection", function () {
          props.add({name: "foo1", type: "boolean"});
          expect(props.length).toBe(1);
          expect(props[0].type).toBe(Boolean.meta);
        });

        it("should use List.add() to replace an object with the same name in the collection with updated type, etc.", function () {
          props.add({name: "foo", type: "boolean"});
          props.add({name: "foo2", type: "string"});
          props.add({name: "foo", type: "string"});
          expect(props.length).toBe(2);
          expect(props[0].type).toBe(String.meta);
        });

        it("should throw when attempting to add a property with a falsy name", function () {
          [
            null, undefined, false, 0, ""
          ].forEach(function(name){
            expect(function(){
              props.add(name);
            }).toThrowError(/required/);
          });
        });

        it("should use List.replace() to replace an object with the same name in the collection with updated type, etc.", function () {
          props.add({name: "foo", type: "boolean"});
          props.add({name: "foo2", type: "string"});
          props.replace({name: "foo", type: "boolean"}, 0);
          expect(props.length).toBe(2);
          expect(props[0].type).toBe(Boolean.meta);
        });

        it("should throw when attempting to replace a non-existent property", function () {
          props.add({name: "foo", type: "boolean"});
          expect(function(){
            props.replace({name: "bar", type: "string"}, 0);
          }).toThrowError(/invalid/);
        });
      });

      describe("Configuring the PropertyMetaCollection", function () {
        it("should throw if invoked with no arguments", function () {
          expect(function(){
            props.configure();
          }).toThrowError(/config/);
        });

        it("should accept an array of pentaho.type.UPropertyMeta", function () {
          props.configure(["foo", "bar"]);
          expect(props.length).toBe(2);
          expect(props[0].name).toBe("foo");
          expect(props[0].type).toBe(String.meta);
          expect(props[1].name).toBe("bar");
          expect(props[1].type).toBe(String.meta);
        });

        it("should accept an array of pentaho.type.UPropertyMeta whose elements were previously defined", function () {
          var props = PropertyMetaCollection.to(["foo", {name: "eggs", type: "boolean"}], Derived.meta);
          props.configure(["foo", "bar"]);
          expect(props.length).toBe(3);
          expect(props[0].name).toBe("foo");
          expect(props[0].type).toBe(String.meta);
          expect(props[1].name).toBe("eggs");
          expect(props[1].type).toBe(Boolean.meta);
          expect(props[2].name).toBe("bar");
          expect(props[2].type).toBe(String.meta);
        });

        it("should accept an object whose keys are the property names and the values are pentaho.type.UPropertyMeta", function () {
          props.configure({foo: {name: "foo", type: "boolean"}, guru: {name: "guru", type: "boolean"}});
          expect(props.length).toBe(2);
          expect(props[0].type).toBe(Boolean.meta);
          expect(props[1].name).toBe("guru");
          expect(props[1].type).toBe(Boolean.meta);
        });

        it("should throw when attempting to configure with key that does not match its property name", function () {
          expect(function(){
            props.configure({foo: {name: "bar", type: "boolean"}});
          }).toThrowError(/config/);
        });

        it("should use the key as property name if the property spec does not include a name", function () {
          props.configure({foo: {type: "boolean"}});
          expect(props.length).toBe(1);
          expect(props[0].name).toBe("foo");
        });

        it("should replace any existing configurations of the same name and update its type", function () {
          props.configure(["foo", "bar"]);
          expect(props.length).toBe(2);
          expect(props[0].name).toBe("foo");
          expect(props[0].type).toBe(String.meta);
          expect(props[1].name).toBe("bar");
          expect(props[1].type).toBe(String.meta);
          props.configure({foo: {name: "foo", type: "boolean"}, guru: {name: "guru", type: "boolean"}});
          expect(props.length).toBe(3);
          expect(props[0].type).toBe(Boolean.meta);
          expect(props[2].name).toBe("guru");
          expect(props[2].type).toBe(Boolean.meta);
        });

        it("should preserve the type when reconfiguring the property without specifying the type", function () {
          props.configure({foo: {name: "foo", type: "boolean"}});
          props.configure(["foo"]);
          expect(props.length).toBe(1);
          expect(props[0].type).toBe(Boolean.meta);
        });

      });
    });
  }); // pentaho/type/PropertyMetaCollection
});
