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
  "pentaho/type/Instance",
  "tests/pentaho/util/errorMatch"
], function(Instance, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true, afterEach:true, spyOn: true, jasmine: true*/


  describe("pentaho/type/Type", function() {

    describe("#view -", function() {
      it("should default to `null`", function() {
        var Derived = Instance.extend({type: {id: "fake/id"}});

        expect(Derived.type.view).toBe(null);
      });

      it("should leave absolute ids intact", function() {
        var Derived = Instance.extend({type: {id: "fake/id", view: "/foo"}});

        expect(Derived.type.view).toBe("/foo");

        // ---

        Derived = Instance.extend({type: {view: "foo:"}});

        expect(Derived.type.view).toBe("foo:");

        // ---

        Derived = Instance.extend({type: {view: "bar.js"}});

        expect(Derived.type.view).toBe("bar.js");
      });

      it("should convert relative ids to absolute", function() {
        var Derived = Instance.extend({type: {id: "fake/id", view: "foo"}});

        expect(Derived.type.view).toBe("fake/id/foo");

        // ---

        Derived = Instance.extend({type: {id: "fake/id", view: "foo/bar"}});

        expect(Derived.type.view).toBe("fake/id/foo/bar");

        // ---

        Derived = Instance.extend({type: {id: "fake/id", view: "./bar"}});

        expect(Derived.type.view).toBe("fake/id/./bar");

        // ---

        Derived = Instance.extend({type: {id: "fake/id", view: "../bar"}});

        expect(Derived.type.view).toBe("fake/id/../bar");

        // ---
        // no base folder..

        Derived = Instance.extend({type: {id: "id", view: "../bar"}});

        expect(Derived.type.view).toBe("id/../bar");

        // ---

        Derived = Instance.extend({type: {view: "../bar"}});

        expect(Derived.type.view).toBe("../bar");
      });

      it("should inherit the base type's view, when unspecified", function() {
        var A = Instance.extend({type: {view: "foo"}});

        expect(A.type.view).toBe("foo");

        var B = A.extend();

        expect(B.type.view).toBe("foo");
      });

      it("should inherit the base type's view, when spec is undefined", function() {
        var A = Instance.extend({type: {view: "foo"}});

        expect(A.type.view).toBe("foo");

        var B = A.extend({type: {view: undefined}});

        expect(B.type.view).toBe("foo");
      });

      it("should respect a null spec value", function() {
        var A = Instance.extend({type: {view: "foo"}});

        expect(A.type.view).toBe("foo");

        var B = A.extend({type: {view: null}});

        expect(B.type.view).toBe(null);
      });

      it("should convert an empty string value to null", function() {
        var A = Instance.extend({type: {view: "foo"}});

        expect(A.type.view).toBe("foo");

        var B = A.extend({type: {view: ""}});

        expect(B.type.view).toBe(null);
      });

      it("should respect a specified non-empty string", function() {
        var A = Instance.extend({type: {view: "foo"}});

        expect(A.type.view).toBe("foo");

        var B = A.extend({type: {id: "baba/dudu", view: "bar"}});

        expect(B.type.view).toBe("baba/dudu/bar");
      });

      it("should inherit a base function", function() {
        var FA = function() {
        };
        var A  = Instance.extend({type: {view: FA}});

        expect(A.type.view).toBe(FA);

        var B = A.extend({type: {id: "baba/dudu"}});

        expect(B.type.view).toBe(FA);
      });

      it("should respect a specified function", function() {
        var FA = function() {
        };
        var A  = Instance.extend({type: {view: FA}});

        expect(A.type.view).toBe(FA);

        var FB = function() {
        };
        var B  = A.extend({type: {id: "baba/dudu", view: FB}});

        expect(B.type.view).toBe(FB);
      });

      it("should preserve the default value", function() {
        Instance.type.view = undefined;
        // The default value is still there (did not delete)
        expect(Instance.type.view).toBe(null);
      });

      it("should throw when view is not a string, nully or a function", function() {
        expect(function() {
          Instance.extend({type: {view: {}}});
        }).toThrow(errorMatch.argInvalidType("view", ["nully", "string", "function"], "object"));
      });
    }); // end #view

    describe("#viewClass -", function() {

      afterEach(function() {
        require.undef("foo/bar");
        require.undef("foo/dude");
      });

      it("should return a Promise, when view is null, and resolve to null", function(done) {
        var A = Instance.extend();
        var p = A.type.viewClass;

        expect(p instanceof Promise).toBe(true);

        p.then(function(V) {
          expect(V).toBe(null);
          done();
        });
      });

      it("should return a Promise, when view is a function, and resolve to it", function(done) {
        var View = function() {
        };
        var A    = Instance.extend({type: {view: View}});
        var p    = A.type.viewClass;

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

        var A = Instance.extend({type: {view: "foo/bar"}});

        var p = A.type.viewClass;

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

        var A = Instance.extend({type: {view: "foo/bar"}});

        var B = A.extend();

        var pb = B.type.viewClass;

        var pa = A.type.viewClass;

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

        var A = Instance.extend({type: {view: "foo/bar"}});

        var pa = A.type.viewClass;

        expect(pa).toBe(A.type.viewClass);

        pa.then(function(V) {
          expect(V).toBe(View);
          expect(pa).toBe(A.type.viewClass);
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

        var A = Instance.extend({type: {view: "foo/bar"}});

        var pa = A.type.viewClass;

        A.type.view = "foo/dude";

        var pb = A.type.viewClass;

        expect(pb instanceof Promise).toBe(true);

        expect(pa).not.toBe(pb);

        Promise.all([pa, pb]).then(function(views) {

          expect(views[0]).toBe(ViewBar);
          expect(views[1]).toBe(ViewDude);

          done();
        });
      });

      it("should preserve the default value", function() {
        Instance.type.view = undefined;
        // The default value is still there (did not delete)
        expect(Instance.type.view).toBe(null);
      });

    }); // end #viewClass

    describe("#label -", function() {

      describe("when `label` is falsy -", function() {
        it("should have a top-root label", function() {
          var label = Instance.type.label;
          expect(typeof label).toBe("string");
          expect(label.length > 0).toBe(true);
        });

        it("should not reset the top-root label", function() {
          var topRootLabel = Instance.type.label;

          Instance.type.label = undefined;

          expect(Instance.type.label).toBe(topRootLabel);
        });

        it("should inherit `label`", function() {
          function expectIt(derivedSpec) {
            var Derived = Instance.extend({type: derivedSpec});
            expect(Derived.type.label).toBe(Instance.type.label);
          }

          expectIt({});
          expectIt({label: undefined});
          expectIt({label: null});
          expectIt({label: ""});
        });

        it("subclasses should preserve the default value", function() {
          var FirstDerivative  = Instance.extend({type: {label: "Foo"}});
          var SecondDerivative = FirstDerivative.extend({type: {label: "Bar"}});
          SecondDerivative.type.label = undefined;
          // The default value is still there (did not delete)
          expect(SecondDerivative.type.label).toBe("Foo");
        });
      }); // when `label` is falsy

      describe("when `label` is truthy", function() {
        // Can change the label
        it("should respect the `label`", function() {
          var Derived = Instance.extend({type: {label: "Foo"}});
          expect(Derived.type.label).toBe("Foo");
        });
      });
    }); // #label

    describe("#id -", function() {
      describe("when `id` is falsy -", function() {
        it("should have `null` as a default `id`", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({type: spec});
            expect(Derived.type.id).toBe(null);
          }

          expectIt({});
          expectIt({id: undefined});
          expectIt({id: null});
          expectIt({id: null});
        });

        it("should preserve the default value", function() {
          Instance.type.id = undefined;
          // The default value is still there (did not delete)
          expect(Instance.type.id).toBe(null);
        });
      });

      describe("when `id` is truthy -", function() {
        it("should respect it", function() {
          var Derived = Instance.extend({
            type: {id: "foo/bar"}
          });

          expect(Derived.type.id).toBe("foo/bar");
        });

        it("should convert it to a string", function() {
          var Derived = Instance.extend({
            type: {id: {toString: function() { return "foo/bar"; }}}
          });

          expect(Derived.type.id).toBe("foo/bar");
        });

        it("should ignore it, if it is a temporary id", function() {
          var Derived = Instance.extend({
            type: {id: "_id"}
          });

          expect(Derived.type.id).toBe(null);
        });
      });
    }); // #id

    describe("#description -", function() {

      it("should preserve the default value", function() {
        Instance.type.description = undefined;
        // The default value is still there (did not delete)
        expect(Instance.type.description).toBe(null);
      });

      describe("when not specified -", function() {
        it("should inherit the base description", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({type: spec});

            expect(Derived.type.description).toBe(Instance.type.description);
          }

          expectIt({});
          expectIt({description: undefined});
        });
      });

      describe("when specified as `null` or an empty string -", function() {
        it("should set the description to `null`", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({type: spec});

            expect(Derived.type.description).toBe(null);
          }

          expectIt({description: null});
          expectIt({description: ""});
        });
      });

      describe("when specified as a non-empty string -", function() {
        it("should respect it", function() {
          var Derived = Instance.extend({type: {description: "Foo"}});

          expect(Derived.type.description).toBe("Foo");
        });
      });
    }); // #description

    describe("#category -", function() {
      describe("when not specified -", function() {

        it("should preserve the default value", function() {
          Instance.type.category = undefined;
          // The default value is still there (did not delete)
          expect(Instance.type.category).toBe(null);
        });

        it("should inherit the base category", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({type: spec});

            expect(Derived.type.category).toBe(Instance.type.category);
          }

          expectIt({});
          expectIt({category: undefined});
        });
      });

      describe("when specified as `null` or an empty string -", function() {
        it("should set the category to `null`", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({type: spec});

            expect(Derived.type.category).toBe(null);
          }

          expectIt({category: null});
          expectIt({category: ""});
        });
      });

      describe("when specified as a non-empty string", function() {
        it("should respect it", function() {
          var Derived = Instance.extend({type: {category: "Foo"}});

          expect(Derived.type.category).toBe("Foo");
        });
      });
    }); // #category

    describe("#helpUrl -", function() {
      it("should preserve the default value", function() {
        Instance.type.helpUrl = undefined;
        // The default value is still there (did not delete)
        expect(Instance.type.helpUrl).toBe(null);
      });

      describe("when not specified", function() {
        it("should inherit the base helpUrl", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({type: spec});

            expect(Derived.type.helpUrl).toBe(Instance.type.helpUrl);
          }

          expectIt({});
          expectIt({helpUrl: undefined});
        });
      });

      describe("when specified as `null` or an empty string -", function() {
        it("should set the helpUrl to `null`", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({type: spec});

            expect(Derived.type.helpUrl).toBe(null);
          }

          expectIt({helpUrl: null});
          expectIt({helpUrl: ""});
        });
      });

      describe("when specified as a non-empty string -", function() {
        it("should respect it", function() {
          var Derived = Instance.extend({type: {helpUrl: "Foo"}});

          expect(Derived.type.helpUrl).toBe("Foo");
        });
      });
    }); // #helpUrl

    describe("#uid -", function() {
      it("should not be inherited", function() {
        var Derived = Instance.extend();
        expect(Derived.type.uid).not.toBe(Instance.type.uid);
      });

      it("should be unique", function() {
        var DerivedA = Instance.extend(),
            DerivedB = Instance.extend();
        expect(DerivedA.type.uid).not.toBe(DerivedB.type.uid);
        expect(DerivedA.type.uid).not.toBe(Instance.type.uid);
      });
    }); // #uid

    describe("#styleClass -", function() {
      it("should preserve the default value", function() {
        Instance.type.styleClass = undefined;
        // The default value is still there (did not delete)
        expect(Instance.type.styleClass).toBe(null);
      });

      it("can be set on a derived class", function() {
        ["xpto", null].forEach(function(propValue) {
          var Derived = Instance.extend({type: {"styleClass": propValue}});
          expect(Derived.type.styleClass).toBe(propValue);

          var inst = new Derived();
          expect(inst.type.styleClass).toBe(propValue);
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
          var Derived = Instance.extend({type: {"styleClass": candidate}});
          expect(Derived.type.styleClass).toBe(final);

          var inst = new Derived();
          expect(inst.type.styleClass).toBe(final);
        });
      });
    }); // #styleClass

    describe("#isAdvanced -", function() {
      it("should preserve the default value", function() {
        Instance.type.isAdvanced = undefined;
        // The default value is still there (did not delete)
        expect(Instance.type.isAdvanced).toBe(false);
      });

      it("can be set on a derived class", function() {
        [true, false].forEach(function(bool) {
          var Derived = Instance.extend({type: {"isAdvanced": bool}});
          expect(Derived.type.isAdvanced).toBe(bool);

          var inst = new Derived();
          expect(inst.type.isAdvanced).toBe(bool);
        });
      });

      it("can be unset by passing a nully, thus delegating to the ancestor class", function() {
        [true, false].forEach(function(bool) {
          [null, undefined].forEach(function(value) {
            var FirstDerivative  = Instance.extend({type: {"isAdvanced": bool}});
            var SecondDerivative = FirstDerivative.extend({type: {"isAdvanced": !bool}});

            SecondDerivative.type.isAdvanced = value;
            expect(SecondDerivative.type.isAdvanced).toBe(FirstDerivative.type.isAdvanced);
          });
        });
      });
    }); // #isAdvanced

    describe("#isBrowsable -", function() {
      it("should preserve the default value", function() {
        Instance.type.isBrowsable = undefined;
        // The default value is still there (did not delete)
        expect(Instance.type.isBrowsable).toBe(true);
      });

      it("can be set on a derived class", function() {
        [true, false].forEach(function(bool) {
          var Derived = Instance.extend({type: {"isBrowsable": bool}});
          expect(Derived.type.isBrowsable).toBe(bool);

          var inst = new Derived();
          expect(inst.type.isBrowsable).toBe(bool);
        });
      });

      it("can be unset by passing a nully, thus delegating to the ancestor class", function() {
        [true, false].forEach(function(bool) {
          [null, undefined].forEach(function(value) {
            var FirstDerivative  = Instance.extend({type: {"isBrowsable": bool}});
            var SecondDerivative = FirstDerivative.extend({type: {"isBrowsable": !bool}});

            SecondDerivative.type.isBrowsable = value;
            expect(SecondDerivative.type.isBrowsable).toBe(FirstDerivative.type.isBrowsable);
          });
        });
      });
    }); // #isBrowsable

    describe("#ordinal -", function() {
      it("should preserve the default value", function() {
        Instance.type.ordinal = undefined;
        // The default value is still there (did not delete)
        expect(Instance.type.ordinal).toBe(0);
      });

      it("can be set on a derived class", function() {
        [1].forEach(function(someValue) {
          var Derived = Instance.extend({type: {"ordinal": someValue}});
          expect(Derived.type.ordinal).toBe(someValue);

          var inst = new Derived();
          expect(inst.type.ordinal).toBe(someValue);
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

          var FirstDerivative  = Instance.extend({type: {"ordinal": 42}});
          var SecondDerivative = FirstDerivative.extend({type: {"ordinal": candidate}});
          expect(SecondDerivative.type.ordinal).toBe(final);

          var inst = new SecondDerivative();
          expect(inst.type.ordinal).toBe(final);
        });
      });

      it("can be unset by passing a nully, thus delegating to the ancestor class", function() {
        [1, 20].forEach(function(someValue) {
          [null, undefined].forEach(function(resetValue) {
            var FirstDerivative  = Instance.extend({type: {"ordinal": 42}});
            var SecondDerivative = FirstDerivative.extend({type: {"ordinal": someValue}});

            SecondDerivative.type.ordinal = resetValue;
            expect(SecondDerivative.type.ordinal).toBe(FirstDerivative.type.ordinal);
          });
        });
      });
    }); // #ordinal

    describe("#isRoot -", function() {
      it("can be set on a derived class", function() {
        [true, false].forEach(function(isRoot) {
          var Derived = Instance.extend("", null, null, {isRoot: isRoot});
          expect(Derived.type.isRoot).toBe(isRoot);

          var inst = new Derived();
          expect(inst.type.isRoot).toBe(isRoot);
        });
      });
    }); // #isRoot

    describe("#ancestor -", function() {
      it("returns the immediate ancestor", function() {
        var FirstDerivative  = Instance.extend({type: {"firstDerivative": true}});
        var FirstSibling     = Instance.extend({type: {"firstSibling": true}});
        var SecondDerivative = FirstDerivative.extend({type: {"secondDerivative": true}});

        expect(FirstDerivative.type.ancestor).toBe(Instance.type);

        expect(FirstSibling.type.ancestor).toBe(FirstDerivative.type.ancestor);

        expect(SecondDerivative.type.ancestor).toBe(FirstDerivative.type);
        expect(SecondDerivative.type.ancestor).not.toBe(Instance.type);
      });

      it("does not return an ancestor if this is a root class", function() {
        var Derived = Instance.extend("", null, null, {isRoot: true});
        expect(Derived.type.ancestor).toBeNull();

        Derived = Instance.extend("", null, null, {isRoot: false});
        expect(Derived.type.ancestor).not.toBeNull();
        expect(Derived.type.ancestor).toBe(Instance.type);
      });
    }); // #ancestor

    describe("#hasDescendants -", function() {
      it("returns false if the type has not been extended", function() {
        var Derived = Instance.extend();

        expect(Derived.type.hasDescendants).toBe(false);
      });

      it("returns true if the type has been extended using .extend(...)", function() {
        var Derived = Instance.extend();

        Derived.extend();
        expect(Derived.type.hasDescendants).toBe(true);
      });

      it("returns true if the type has been extended using .type.extendProto(...)", function() {
        var Derived = Instance.extend();

        Derived.extendProto();
        expect(Derived.type.hasDescendants).toBe(true);
      });
    }); // #hasDescendants

    describe("#create -", function() {
      it("returns a new instance of `pentaho.type.Instance`", function() {
        expect(Instance.type.create() instanceof Instance).toBe(true);
      });
    });

    describe("#is -", function() {
      it("detects an instance of `pentaho.type.Instance` correctly", function() {
        expect(Instance.type.is(new Instance())).toBe(true);
      });

      it("detects an instance of a sub-type correctly", function() {
        var SubInstance = Instance.extend();

        expect(Instance.type.is(new SubInstance())).toBe(true);
        expect(SubInstance.type.is(new SubInstance())).toBe(true);
      });

      it("detects that an instance of another Instance class is not of the type ", function() {
        var SubInstance1 = Instance.extend();
        var SubInstance2 = Instance.extend();

        expect(SubInstance1.type.is(new SubInstance2())).toBe(false);
      });

      it("detects that simple objects aren't instances of `pentaho.type.Instance`", function() {
        [
          true, 1, "",
          null, undefined,
          {}, [],
          new Date(),
          (function() { return this; }()) // global object
        ].forEach(function(obj) {
          expect(Instance.type.is(obj)).toBe(false);
        });
      });
    });

    describe("#to -", function() {
      it("returns an instance of it directly", function() {
        var inst = new Instance();
        expect(Instance.type.to(inst)).toBe(inst);
      });

      it("calls #create(value) and returns its result " +
          "when value is not an instance and type does not have an own constructor", function() {
        var createSpy = jasmine.createSpy();
        var SubInstance = Instance.extend({
          type: {
            get context() {
              return {
                create: createSpy
              };
            }
          }
        });

        var subSubType = SubInstance.extendProto().type;
        spyOn(subSubType, "create").and.callThrough();

        var value = {};
        subSubType.to(value);

        expect(createSpy).not.toHaveBeenCalled();
        expect(subSubType.create).toHaveBeenCalledWith(value);
      });

      it("casts a nully into `null`", function() {
        [null, undefined].forEach(function(value) {
          expect(Instance.type.to(value)).toBeNull();
        });
      });
    });

    describe("#isSubtypeOf(superType)", function() {
      it("should return false when superType is nully", function() {
        expect(Instance.type.isSubtypeOf(null)).toBe(false);
      });

      it("should return true when superType is itself", function() {
        expect(Instance.type.isSubtypeOf(Instance.type)).toBe(true);
      });

      it("should return true when this was extended from superType", function() {
        var SubType = Instance.extend();
        expect(SubType.type.isSubtypeOf(Instance.type)).toBe(true);
      });

      it("should return false when this was not extended from superType", function() {
        var SubType1 = Instance.extend();
        var SubType2 = Instance.extend();
        expect(SubType1.type.isSubtypeOf(SubType2.type)).toBe(false);
      });
    });
  });
});