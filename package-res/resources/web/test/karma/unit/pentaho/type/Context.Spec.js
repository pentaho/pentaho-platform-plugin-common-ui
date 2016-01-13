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
  "pentaho/type/Context",
  "pentaho/util/error",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Context, error, bundle) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho/type/Context -", function() {

    it("is a function", function() {
      expect(typeof Context).toBe("function");
    });

    describe("new Context()", function() {
      it("should return a context instance", function() {
        var context = new Context();
        expect(context instanceof Context).toBe(true);
      });
    });

    describe("#get(type)", function() {
      it("should return a type metadata given any of the yet unloaded standard primitive types", function() {
        var context  = new Context();

        expect(context.get("pentaho/type/value"   ).meta.id).toBe("pentaho/type/value"   );
        expect(context.get("pentaho/type/simple"  ).meta.id).toBe("pentaho/type/simple"  );
        expect(context.get("pentaho/type/complex" ).meta.id).toBe("pentaho/type/complex" );
        expect(context.get("pentaho/type/string"  ).meta.id).toBe("pentaho/type/string"  );
        expect(context.get("pentaho/type/boolean" ).meta.id).toBe("pentaho/type/boolean" );
        expect(context.get("pentaho/type/number"  ).meta.id).toBe("pentaho/type/number"  );
        expect(context.get("pentaho/type/date"    ).meta.id).toBe("pentaho/type/date"    );
        expect(context.get("pentaho/type/object"  ).meta.id).toBe("pentaho/type/object"  );
        expect(context.get("pentaho/type/function").meta.id).toBe("pentaho/type/function");
      });

      it("should be able to create a list type using the shorthand list-type notation", function() {
        var context = new Context();
        var type = context.get([{props: ["a", "b"]}]);

        expect(type.prototype instanceof context.get("list")).toBe(true);

        var ofMeta = type.meta.of;
        expect(ofMeta.mesa instanceof context.get("complex")).toBe(true);
        expect(ofMeta.count).toBe(2);
        expect(ofMeta.has("a")).toBe(true);
        expect(ofMeta.has("b")).toBe(true);
      });
    }); // #get

    describe("#getAllAsync(baseTypeId, ka)", function() {
      //var

      beforeEach(function() {
        require.undef("pentaho/service");

        require.undef("exp/foo");
        require.undef("pentaho/service!exp/foo");

        // Reset current service configuration
        require.config({
          config: {"pentaho/service": null}
        });

        // ---

        define("exp/foo", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({meta: {id: "exp/foo"}});
          };
        });

        // ---

        require.undef("exp/bar");
        require.undef("pentaho/service!exp/bar");

        define("exp/bar", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({meta: {id: "exp/bar"}});
          };
        });

        // ---

        require.undef("exp/dude");
        require.undef("pentaho/service!exp/dude");

        define("exp/dude", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({meta: {id: "exp/dude"}});
          };
        });

        // ---

        require.config({
          config: {
            "pentaho/service": {
              "exp/foo": "exp/thing",
              "exp/bar": "exp/thing",
              "exp/dude": "pentaho/type/value"
            }
          }
        });
      });

      it("should return a promise", function() {
        var context  = new Context();
        var p = context.getAllAsync();
        expect(p instanceof Promise).toBe(true);
      });

      it("should return all registered Types under 'pentaho/type/value' by default", function(done) {
        var context  = new Context();

        context
            .getAllAsync()
            .then(function(Mesas) {
              expect(Mesas instanceof Array).toBe(true);
              expect(Mesas.length).toBe(1);
              expect(Mesas[0].meta.id).toBe("exp/dude");
              done();
            }, done.fail);
      });

      it("should return an empty array when the specified baseType has no registrations", function(done) {
        var context  = new Context();

        context
            .getAllAsync("abcdefgh")
            .then(function(Mesas) {
              expect(Mesas instanceof Array).toBe(true);
              expect(Mesas.length).toBe(0);
              done();
            }, done.fail);
      });

      it("should return all registered Types under a given base type id", function(done) {
        var context  = new Context();

        context
          .getAllAsync("exp/thing")
          .then(function(Mesas) {
            expect(Mesas instanceof Array).toBe(true);
            expect(Mesas.length).toBe(2);

            var metaIds = Mesas.map(function(Meta) { return Meta.meta.id; });
            var iFoo = metaIds.indexOf("exp/foo");
            var iBar = metaIds.indexOf("exp/bar");
            expect(iFoo).not.toBeLessThan(0);
            expect(iBar).not.toBeLessThan(0);
            expect(iFoo).not.toBe(iBar);

            done();
          }, done.fail);
      });
    }); // #getAll

    describe("#create(valueSpec, defaultType, baseType)", function() {

      it("should create an instance given a number value and the defaultType number", function() {
        var context = new Context();
        var Number  = context.get("pentaho/type/number");

        var number = context.create(1, Number);

        expect(number instanceof Number).toBe(true);
        expect(number.value).toBe(1);
      });

      it("should create an instance given a boolean value and the defaultType boolean", function() {
        var context = new Context();
        var Boolean  = context.get("pentaho/type/boolean");

        var value = context.create(true, Boolean);

        expect(value instanceof Boolean).toBe(true);
        expect(value.value).toBe(true);
      });

      it("should create an instance given an object value and the defaultType object", function() {
        var context = new Context();
        var Object  = context.get("pentaho/type/object");

        var primitive = {};
        var value = context.create({v: primitive}, Object);

        expect(value instanceof Object).toBe(true);
        expect(value.value).toBe(primitive);
      });

      it("should create an instance given an object with a type annotation, '_', and not defaultType", function() {
        var context = new Context();
        var Number = context.get("pentaho/type/number");

        var value = context.create({_: "pentaho/type/number", v: 1});

        expect(value instanceof Number).toBe(true);
        expect(value.value).toBe(1);
      });

      it("should throw if given a non-type-annotated and not given defaultType", function() {
        var context = new Context();
        expect(function() {
          context.create({v: 1});
        }).toThrowError(
            error.operInvalid(bundle.structured.errors.context.cannotCreateValueOfUnknownType).message);
      });

      it("should throw if given a type-annotated value that does not extend from the given baseType", function() {
        var context = new Context();
        expect(function() {
          context.create({_: "pentaho/type/number", v: 1}, null, "pentaho/type/string");
        }).toThrowError(
            error.operInvalid(
              bundle.format(
                bundle.structured.errors.context.valueNotOfExpectedBaseType,
                ["pentaho/type/string"])).message);
      });

      it("should not throw if given a type-annotated value that does extend from the given baseType", function() {
        var context = new Context();

        var value = context.create({_: "pentaho/type/number", v: 1}, null, "pentaho/type/simple");

        expect(value instanceof context.get("pentaho/type/number")).toBe(true);
        expect(value.value).toBe(1);
      });

      it("should be able to create a type-annotated value of a list type", function() {
        var context = new Context();
        var NumberList = context.get({base: "list", of: "number"});

        var value = context.create({_: NumberList, d: [1, 2]});

        expect(value instanceof NumberList).toBe(true);
        expect(value.count).toBe(2);
        expect(value.at(0).value).toBe(1);
        expect(value.at(1).value).toBe(2);
      });

      it("should be able to create a type-annotated value of an inline list type", function() {
        var context = new Context();

        var value = context.create({
          _: {base: "list", of: "number"},
          d: [1, 2]
        });

        expect(value instanceof context.get("list")).toBe(true);
        expect(value.count).toBe(2);
        expect(value.at(0).value).toBe(1);
        expect(value.at(1).value).toBe(2);
      });

      it("should be able to create a type-annotated value of an inline complex type", function() {
        var context = new Context();

        var value = context.create({
            _: {
              props: ["a", "b"]
            },
            "a": 1,
            "b": 2
          });

        expect(value instanceof context.get("complex")).toBe(true);
        expect(value.get("a").value).toBe("1");
        expect(value.get("b").value).toBe("2");
      });

      it("should be able to create a type-annotated value of an inline list complex type", function() {
        var context = new Context();

        var value = context.create({
          _: [
            {
              props: [
                {name: "a"},
                "b"
              ]
            }
          ],
          d: [
            {a: 1, b: 2}
          ]
        });

        expect(value instanceof context.get("list")).toBe(true);
        expect(value.count).toBe(1);
      });

      it("should be able to create a type-annotated value of an inline list complex type in array form", function() {
        var context = new Context();

        var value = context.create({
          _: [{
            props: ["a", "b"]
          }],
          d: [
            [1, 2],
            [3, 4]
          ]
        });

        expect(value instanceof context.get("list")).toBe(true);
        expect(value.count).toBe(2);
      });

    }); // #create
  }); // pentaho/type/Context
});