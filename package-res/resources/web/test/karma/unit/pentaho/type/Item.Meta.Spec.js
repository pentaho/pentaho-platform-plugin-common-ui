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
  "pentaho/type/Item"
], function(Item) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true, afterEach:true, spyOn: true, jasmine: true*/


  describe("pentaho/type/Item.Meta", function() {

    describe("#view -", function() {
      it("should default to `null`", function() {
        var Derived = Item.extend({meta: {id: "fake/id"}});

        expect(Derived.meta.view).toBe(null);
      });

      it("should leave absolute ids intact", function() {
        var Derived = Item.extend({meta: {id: "fake/id", view: "/foo"}});

        expect(Derived.meta.view).toBe("/foo");

        // ---

        Derived = Item.extend({meta: {view: "foo:"}});

        expect(Derived.meta.view).toBe("foo:");

        // ---

        Derived = Item.extend({meta: {view: "bar.js"}});

        expect(Derived.meta.view).toBe("bar.js");
      });

      it("should convert relative ids to absolute", function() {
        var Derived = Item.extend({meta: {id: "fake/id", view: "foo"}});

        expect(Derived.meta.view).toBe("fake/id/foo");

        // ---

        Derived = Item.extend({meta: {id: "fake/id", view: "foo/bar"}});

        expect(Derived.meta.view).toBe("fake/id/foo/bar");

        // ---

        Derived = Item.extend({meta: {id: "fake/id", view: "./bar"}});

        expect(Derived.meta.view).toBe("fake/id/./bar");

        // ---

        Derived = Item.extend({meta: {id: "fake/id", view: "../bar"}});

        expect(Derived.meta.view).toBe("fake/id/../bar");

        // ---
        // no base folder..

        Derived = Item.extend({meta: {id: "id", view: "../bar"}});

        expect(Derived.meta.view).toBe("id/../bar");

        // ---

        Derived = Item.extend({meta: {view: "../bar"}});

        expect(Derived.meta.view).toBe("../bar");
      });

      it("should inherit the base type's view, when unspecified", function() {
        var A = Item.extend({meta: {view: "foo"}});

        expect(A.meta.view).toBe("foo");

        var B = A.extend();

        expect(B.meta.view).toBe("foo");
      });

      it("should inherit the base type's view, when spec is undefined", function() {
        var A = Item.extend({meta: {view: "foo"}});

        expect(A.meta.view).toBe("foo");

        var B = A.extend({meta: {view: undefined}});

        expect(B.meta.view).toBe("foo");
      });

      it("should respect a null spec value", function() {
        var A = Item.extend({meta: {view: "foo"}});

        expect(A.meta.view).toBe("foo");

        var B = A.extend({meta: {view: null}});

        expect(B.meta.view).toBe(null);
      });

      it("should convert an empty string value to null", function() {
        var A = Item.extend({meta: {view: "foo"}});

        expect(A.meta.view).toBe("foo");

        var B = A.extend({meta: {view: ""}});

        expect(B.meta.view).toBe(null);
      });

      it("should respect a specified non-empty string", function() {
        var A = Item.extend({meta: {view: "foo"}});

        expect(A.meta.view).toBe("foo");

        var B = A.extend({meta: {id: "baba/dudu", view: "bar"}});

        expect(B.meta.view).toBe("baba/dudu/bar");
      });

      it("should inherit a base function", function() {
        var FA = function() {
        };
        var A  = Item.extend({meta: {view: FA}});

        expect(A.meta.view).toBe(FA);

        var B = A.extend({meta: {id: "baba/dudu"}});

        expect(B.meta.view).toBe(FA);
      });

      it("should respect a specified function", function() {
        var FA = function() {
        };
        var A  = Item.extend({meta: {view: FA}});

        expect(A.meta.view).toBe(FA);

        var FB = function() {
        };
        var B  = A.extend({meta: {id: "baba/dudu", view: FB}});

        expect(B.meta.view).toBe(FB);
      });

      it("should preserve the default value", function() {
        Item.meta.view = undefined;
        // The default value is still there (did not delete)
        expect(Item.meta.view).toBe(null);
      });
    }); // end #view

    describe("#viewClass -", function() {

      afterEach(function() {
        require.undef("foo/bar");
        require.undef("foo/dude");
      });

      it("should return `null` when view is `null`", function() {
        var A = Item.extend();

        expect(A.meta.viewClass).toBe(null);
      });

      it("should return a Promise, when view is a function, and resolve to it", function(done) {
        var View = function() {
        };
        var A    = Item.extend({meta: {view: View}});
        var p    = A.meta.viewClass;

        expect(p instanceof Promise).toBe(true);

        p.then(function(V) {
          expect(V).toBe(View);
          done();
        });
      });

      it("should return a Promise, when view is an object, and resolve to it", function(done) {
        var View = {};
        var A    = Item.extend({meta: {view: View}});
        var p    = A.meta.viewClass;

        expect(p instanceof Promise).toBe(true);

        p.then(function(V) {
          expect(V).toBe(View);
          done();
        });
      });

      it("should return a Promise, when view is a string, and resolve to that module", function(done) {

        var View = function() {};

        define("foo/bar", function() {
          return View;
        });

        var A = Item.extend({meta: {view: "foo/bar"}});

        var p = A.meta.viewClass;

        expect(p instanceof Promise).toBe(true);

        p.then(function(V) {
          expect(V).toBe(View);

          done();
        });
      });

      it("should return a Promise even if view is inherited from the base class", function(done) {

        var View = function() {};

        define("foo/bar", function() {
          return View;
        });

        var A = Item.extend({meta: {view: "foo/bar"}});

        var B = A.extend();

        var pb = B.meta.viewClass;

        var pa = A.meta.viewClass;

        expect(pa).toBe(pb);
        expect(pa instanceof Promise).toBe(true);

        pa.then(function(V) {
          expect(V).toBe(View);

          done();
        });
      });

      it("should return the same Promise multiple times", function(done) {

        var View = function() {};

        define("foo/bar", function() {
          return View;
        });

        var A = Item.extend({meta: {view: "foo/bar"}});

        var pa = A.meta.viewClass;

        expect(pa).toBe(A.meta.viewClass);

        pa.then(function(V) {
          expect(V).toBe(View);
          expect(pa).toBe(A.meta.viewClass);
          done();
        });
      });

      it("should return an new Promise and resolve to the new View when the view changes", function(done) {

        var ViewBar  = function() {};
        var ViewDude = function() {};

        define("foo/bar", function() {
          return ViewBar;
        });
        define("foo/dude", function() {
          return ViewDude;
        });

        var A = Item.extend({meta: {view: "foo/bar"}});

        var pa = A.meta.viewClass;

        A.meta.view = "foo/dude";

        var pb = A.meta.viewClass;

        expect(pb instanceof Promise).toBe(true);

        expect(pa).not.toBe(pb);

        Promise.all([pa, pb]).then(function(views) {

          expect(views[0]).toBe(ViewBar);
          expect(views[1]).toBe(ViewDude);

          done();
        });
      });

      it("should preserve the default value", function() {
        Item.meta.view = undefined;
        // The default value is still there (did not delete)
        expect(Item.meta.view).toBe(null);
      });

    }); // end #viewClass

    describe("#label -", function() {

      describe("when `label` is falsy -", function() {
        it("should inherit `label`", function() {
          function expectIt(derivedSpec) {
            var Derived = Item.extend({meta: derivedSpec});
            expect(Derived.meta.label).toBe(Item.meta.label);
          }

          expectIt({});
          expectIt({label: undefined});
          expectIt({label: null});
          expectIt({label: ""});
        });

        it("should preserve the default value", function() {
          Item.meta.label = undefined;
          // The default value is still there (did not delete)
          expect(Item.meta.label).toBe(null);
        });

        it("subclasses should preserve the default value", function() {
          var FirstDerivative  = Item.extend({meta: {label: "Foo"}});
          var SecondDerivative = FirstDerivative.extend({meta: {label: "Bar"}});
          SecondDerivative.meta.label = undefined;
          // The default value is still there (did not delete)
          expect(SecondDerivative.meta.label).toBe("Foo");
        });
      }); // when `label` is falsy

      describe("when `label` is truthy", function() {
        // Can change the label
        it("should respect the `label`", function() {
          var Derived = Item.extend({meta: {label: "Foo"}});
          expect(Derived.meta.label).toBe("Foo");
        });
      });
    }); // #label

    describe("#id -", function() {
      describe("when `id` is falsy -", function() {
        it("should have `null` as a default `id`", function() {
          function expectIt(spec) {
            var Derived = Item.extend({meta: spec});
            expect(Derived.meta.id).toBe(null);
          }

          expectIt({});
          expectIt({id: undefined});
          expectIt({id: null});
          expectIt({id: null});
        });

        it("should preserve the default value", function() {
          Item.meta.id = undefined;
          // The default value is still there (did not delete)
          expect(Item.meta.id).toBe(null);
        });
      });

      describe("when `id` is truthy -", function() {
        it("should respect it", function() {
          var Derived = Item.extend({
            meta: {id: "foo/bar"}
          });

          expect(Derived.meta.id).toBe("foo/bar");
        });
      });
    }); // #id

    describe("#description -", function() {

      it("should preserve the default value", function() {
        Item.meta.description = undefined;
        // The default value is still there (did not delete)
        expect(Item.meta.description).toBe(null);
      });

      describe("when not specified -", function() {
        it("should inherit the base description", function() {
          function expectIt(spec) {
            var Derived = Item.extend({meta: spec});

            expect(Derived.meta.description).toBe(Item.meta.description);
          }

          expectIt({});
          expectIt({description: undefined});
        });
      });

      describe("when specified as `null` or an empty string -", function() {
        it("should set the description to `null`", function() {
          function expectIt(spec) {
            var Derived = Item.extend({meta: spec});

            expect(Derived.meta.description).toBe(null);
          }

          expectIt({description: null});
          expectIt({description: ""});
        });
      });

      describe("when specified as a non-empty string -", function() {
        it("should respect it", function() {
          var Derived = Item.extend({meta: {description: "Foo"}});

          expect(Derived.meta.description).toBe("Foo");
        });
      });
    }); // #description

    describe("#category -", function() {
      describe("when not specified -", function() {

        it("should preserve the default value", function() {
          Item.meta.category = undefined;
          // The default value is still there (did not delete)
          expect(Item.meta.category).toBe(null);
        });

        it("should inherit the base category", function() {
          function expectIt(spec) {
            var Derived = Item.extend({meta: spec});

            expect(Derived.meta.category).toBe(Item.meta.category);
          }

          expectIt({});
          expectIt({category: undefined});
        });
      });

      describe("when specified as `null` or an empty string -", function() {
        it("should set the category to `null`", function() {
          function expectIt(spec) {
            var Derived = Item.extend({meta: spec});

            expect(Derived.meta.category).toBe(null);
          }

          expectIt({category: null});
          expectIt({category: ""});
        });
      });

      describe("when specified as a non-empty string", function() {
        it("should respect it", function() {
          var Derived = Item.extend({meta: {category: "Foo"}});

          expect(Derived.meta.category).toBe("Foo");
        });
      });
    }); // #category

    describe("#helpUrl -", function() {
      it("should preserve the default value", function() {
        Item.meta.helpUrl = undefined;
        // The default value is still there (did not delete)
        expect(Item.meta.helpUrl).toBe(null);
      });

      describe("when not specified", function() {
        it("should inherit the base helpUrl", function() {
          function expectIt(spec) {
            var Derived = Item.extend({meta: spec});

            expect(Derived.meta.helpUrl).toBe(Item.meta.helpUrl);
          }

          expectIt({});
          expectIt({helpUrl: undefined});
        });
      });

      describe("when specified as `null` or an empty string -", function() {
        it("should set the helpUrl to `null`", function() {
          function expectIt(spec) {
            var Derived = Item.extend({meta: spec});

            expect(Derived.meta.helpUrl).toBe(null);
          }

          expectIt({helpUrl: null});
          expectIt({helpUrl: ""});
        });
      });

      describe("when specified as a non-empty string -", function() {
        it("should respect it", function() {
          var Derived = Item.extend({meta: {helpUrl: "Foo"}});

          expect(Derived.meta.helpUrl).toBe("Foo");
        });
      });
    }); // #helpUrl

    describe("#uid -", function() {
      it("should not be inherited", function() {
        var Derived = Item.extend();
        expect(Derived.meta.uid).not.toBe(Item.meta.uid);
      });

      it("should be unique", function() {
        var DerivedA = Item.extend(),
            DerivedB = Item.extend();
        expect(DerivedA.meta.uid).not.toBe(DerivedB.meta.uid);
        expect(DerivedA.meta.uid).not.toBe(Item.meta.uid);
      });
    }); // #uid

    describe("#styleClass -", function() {
      it("should preserve the default value", function() {
        Item.meta.styleClass = undefined;
        // The default value is still there (did not delete)
        expect(Item.meta.styleClass).toBe(null);
      });

      it("can be set on a derived class", function() {
        ["xpto", null].forEach(function(propValue) {
          var Derived = Item.extend({meta: {"styleClass": propValue}});
          expect(Derived.meta.styleClass).toBe(propValue);

          var item = new Derived();
          expect(item.meta.styleClass).toBe(propValue);
        });
      });

      it("casts to a string, or to `null` if it is nully or an object", function() {
        [
          [1 / 0, "Infinity"],
          [0, "0"], [1, "1"],
          [{}, "[object Object]"],
          [undefined, null],
          ["", null],
          [[], null]
        ].forEach(function(candidateAndFinal) {
          var candidate = candidateAndFinal[0];
          var final     = candidateAndFinal[1];
          var Derived = Item.extend({meta: {"styleClass": candidate}});
          expect(Derived.meta.styleClass).toBe(final);

          var item = new Derived();
          expect(item.meta.styleClass).toBe(final);
        });
      });
    }); // #styleClass

    describe("#advanced -", function() {
      it("should preserve the default value", function() {
        Item.meta.advanced = undefined;
        // The default value is still there (did not delete)
        expect(Item.meta.advanced).toBe(false);
      });

      it("can be set on a derived class", function() {
        [true, false].forEach(function(bool) {
          var Derived = Item.extend({meta: {"advanced": bool}});
          expect(Derived.meta.advanced).toBe(bool);

          var item = new Derived();
          expect(item.meta.advanced).toBe(bool);
        });
      });

      it("can be unset by passing a nully, thus delegating to the ancestor class", function() {
        [true, false].forEach(function(bool) {
          [null, undefined].forEach(function(value) {
            var FirstDerivative  = Item.extend({meta: {"advanced": bool}});
            var SecondDerivative = FirstDerivative.extend({meta: {"advanced": !bool}});

            SecondDerivative.meta.advanced = value;
            expect(SecondDerivative.meta.advanced).toBe(FirstDerivative.meta.advanced);
          });
        });
      });
    }); // #advanced

    describe("#browsable -", function() {
      it("should preserve the default value", function() {
        Item.meta.browsable = undefined;
        // The default value is still there (did not delete)
        expect(Item.meta.browsable).toBe(true);
      });

      it("can be set on a derived class", function() {
        [true, false].forEach(function(bool) {
          var Derived = Item.extend({meta: {"browsable": bool}});
          expect(Derived.meta.browsable).toBe(bool);

          var item = new Derived();
          expect(item.meta.browsable).toBe(bool);
        });
      });

      it("can be unset by passing a nully, thus delegating to the ancestor class", function() {
        [true, false].forEach(function(bool) {
          [null, undefined].forEach(function(value) {
            var FirstDerivative  = Item.extend({meta: {"browsable": bool}});
            var SecondDerivative = FirstDerivative.extend({meta: {"browsable": !bool}});

            SecondDerivative.meta.browsable = value;
            expect(SecondDerivative.meta.browsable).toBe(FirstDerivative.meta.browsable);
          });
        });
      });
    }); // #browsable

    describe("#ordinal -", function() {
      it("should preserve the default value", function() {
        Item.meta.ordinal = undefined;
        // The default value is still there (did not delete)
        expect(Item.meta.ordinal).toBe(0);
      });

      it("can be set on a derived class", function() {
        [1].forEach(function(someValue) {
          var Derived = Item.extend({meta: {"ordinal": someValue}});
          expect(Derived.meta.ordinal).toBe(someValue);

          var item = new Derived();
          expect(item.meta.ordinal).toBe(someValue);
        });
      });

      it("casts to an integer, using 0 as a fallback", function() {
        [
          [37, 37],
          [1 / 0, Infinity],
          [Math.sqrt(-1), 0],
          [[1], 1],
          ["0", 0], ["1", 1], ["3.1415", 3],
          [{}, 0], [{"foo": "bar"}, 0],
          ["", 0],
          [[], 0], [[1, 2], 0]
        ].forEach(function(candidateAndFinal) {
          var candidate = candidateAndFinal[0];
          var final     = candidateAndFinal[1];

          var FirstDerivative  = Item.extend({meta: {"ordinal": 42}});
          var SecondDerivative = FirstDerivative.extend({meta: {"ordinal": candidate}});
          expect(SecondDerivative.meta.ordinal).toBe(final);

          var item = new SecondDerivative();
          expect(item.meta.ordinal).toBe(final);
        });
      });

      it("can be unset by passing a nully, thus delegating to the ancestor class", function() {
        [1, 20].forEach(function(someValue) {
          [null, undefined].forEach(function(resetValue) {
            var FirstDerivative  = Item.extend({meta: {"ordinal": 42}});
            var SecondDerivative = FirstDerivative.extend({meta: {"ordinal": someValue}});

            SecondDerivative.meta.ordinal = resetValue;
            expect(SecondDerivative.meta.ordinal).toBe(FirstDerivative.meta.ordinal);
          });
        });
      });
    }); // #ordinal

    describe("#isRoot -", function() {
      it("can be set on a derived class", function() {
        [true, false].forEach(function(isRoot) {
          var Derived = Item.extend("", null, null, {isRoot: isRoot});
          expect(Derived.meta.isRoot).toBe(isRoot);

          var item = new Derived();
          expect(item.meta.isRoot).toBe(isRoot);
        });
      });
    }); // #isRoot

    describe("#ancestor -", function() {
      it("returns the immediate ancestor", function() {
        var FirstDerivative  = Item.extend({meta: {"firstDerivative": true}});
        var FirstSibling     = Item.extend({meta: {"firstSibling": true}});
        var SecondDerivative = FirstDerivative.extend({meta: {"secondDerivative": true}});

        expect(FirstDerivative.meta.ancestor).toBe(Item.meta);

        expect(FirstSibling.meta.ancestor).toBe(FirstDerivative.meta.ancestor);

        expect(SecondDerivative.meta.ancestor).toBe(FirstDerivative.meta);
        expect(SecondDerivative.meta.ancestor).not.toBe(Item.meta);
      });

      it("does not return an ancestor if this is a root class", function() {
        var Derived = Item.extend("", null, null, {isRoot: true});
        expect(Derived.meta.ancestor).toBeNull();

        Derived = Item.extend("", null, null, {isRoot: false});
        expect(Derived.meta.ancestor).not.toBeNull();
        expect(Derived.meta.ancestor).toBe(Item.meta);
      });
    }); // #ancestor

    describe("#create -", function() {
      it("returns a new instance of `pentaho.type.Item`", function() {
        expect(Item.meta.create() instanceof Item).toBe(true);
      });
    });

    describe("#is -", function() {
      it("detects an instance of `pentaho.type.Item` correctly", function() {
        expect(Item.meta.is(new Item())).toBe(true);
      });

      it("detects an instance of a sub-type correctly", function() {
        var SubItem = Item.extend();

        expect(Item.meta.is(new SubItem())).toBe(true);
        expect(SubItem.meta.is(new SubItem())).toBe(true);
      });

      it("detects that an instance of another Item class is not of the type ", function() {
        var SubItem1 = Item.extend();
        var SubItem2 = Item.extend();

        expect(SubItem1.meta.is(new SubItem2())).toBe(false);
      });

      it("detects that simple objects aren't instances of `pentaho.type.Item`", function() {
        [
          true, 1, "",
          null, undefined,
          {}, [],
          new Date(),
          (function() { return this; }()) // global object
        ].forEach(function(obj) {
          expect(Item.meta.is(obj)).toBe(false);
        });
      });
    });

    describe("#to -", function() {
      it("returns an instance of it directly", function() {
        var item = new Item();
        expect(Item.meta.to(item)).toBe(item);
      });

      it("calls #context.create(value) and returns its result " +
         "when value is not an instance and type has an own constructor", function() {
        var createSpy = jasmine.createSpy();
        var SubItem = Item.extend({
          meta: {
            get context() {
              return {
                create: createSpy
              };
            }
          }
        });

        spyOn(SubItem.meta, "create").and.callThrough();

        var value = {};
        SubItem.meta.to(value);

        expect(createSpy).toHaveBeenCalledWith(value, SubItem.meta, SubItem.meta);
        expect(SubItem.meta.create).not.toHaveBeenCalled();
      });

      it("calls #create(value) and returns its result " +
          "when value is not an instance and type does not have an own constructor", function() {
        var createSpy = jasmine.createSpy();
        var SubItem = Item.extend({
          meta: {
            get context() {
              return {
                create: createSpy
              };
            }
          }
        });

        var subSubMeta = SubItem.extendProto().meta;
        spyOn(subSubMeta, "create").and.callThrough();

        var value = {};
        subSubMeta.to(value);

        expect(createSpy).not.toHaveBeenCalled();
        expect(subSubMeta.create).toHaveBeenCalledWith(value);
      });

      it("casts a nully into `null`", function() {
        [null, undefined].forEach(function(value) {
          expect(Item.meta.to(value)).toBeNull();
        });
      });
    });
  });
});