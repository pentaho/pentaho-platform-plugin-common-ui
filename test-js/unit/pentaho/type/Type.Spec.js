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
  "pentaho/type/SpecificationContext",
  "tests/pentaho/util/errorMatch"
], function(Context, SpecificationContext, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true, afterEach:true, spyOn: true, jasmine: true*/

  describe("pentaho.type.Type", function() {

    var context = new Context();
    var Instance = context.get("instance");

    describe("construction", function() {
      it("should allow specifying static type members", function() {
        var Derived = Instance.extend({}, {type: {foo: "bar"}});

        expect(Derived.Type.foo).toBe("bar");
      });
    });

    describe("#context()", function() {
      it("should have the context in which it was defined", function() {
        var myContext = new Context();
        var Instance2 = myContext.get("pentaho/type/instance");

        expect(Instance2.type.context).toBe(myContext);
      });
    }); // end #context

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

      // coverage
      it("should allow setting to the same string value", function() {
        var A = Instance.extend({type: {view: "foo"}});

        expect(A.type.view).toBe("foo");

        var B = A.extend({type: {id: "baba/dudu", view: "bar"}});

        B.type.view = "bar";

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

      // coverage
      it("should allow setting to the same function", function() {
        var FA = function() {
        };
        var A  = Instance.extend({type: {view: FA}});

        expect(A.type.view).toBe(FA);

        var FB = function() {
        };
        var B  = A.extend({type: {id: "baba/dudu", view: FB}});

        B.type.view = FB;

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
            type: {id: SpecificationContext.idTemporaryPrefix + "id"}
          });

          expect(Derived.type.id).toBe(null);
        });
      });
    }); // #id

    describe("#shortId -", function() {

      it("should be `null` when id is `null`", function() {
        var Derived = Instance.extend();
        expect(Derived.type.shortId).toBe(null);
      });

      it("should be equal to #id when it is not a standard, single-level id", function() {
        var Derived = Instance.extend({type: {id: "my/foo"}});
        expect(Derived.type.shortId).toBe(Derived.type.id);
      });

      it("should be equal to the last sub-module of #id when it is of a standard, single-level id", function() {
        var Derived = Instance.extend({type: {id: "pentaho/type/foo"}});
        expect(Derived.type.shortId).toBe("foo");
        expect(Derived.type.id).not.toBe("foo");
      });

      it("should be equal to #id when it is of a standard, multiple-level id", function() {
        var Derived = Instance.extend({type: {id: "pentaho/type/foo/bar"}});
        expect(Derived.type.shortId).toBe(Derived.type.id);
      });
    }); // #shortId

    describe("#isAbstract", function() {
      it("should respect a specified abstract spec value", function() {
        var Derived = Instance.extend({type: {isAbstract: true}});
        expect(Derived.type.isAbstract).toBe(true);

        Derived = Instance.extend({type: {isAbstract: false}});
        expect(Derived.type.isAbstract).toBe(false);
      });

      it("should default to `false` whe spec is unspecified and should not inherit the base value", function() {
        var Derived = Instance.extend();
        expect(Derived.type.isAbstract).toBe(false);

        var Abstract = Instance.extend({type: {isAbstract: true }});
        var Concrete = Instance.extend({type: {isAbstract: false}});

        var DerivedAbstract = Abstract.extend();
        var DerivedConcrete = Concrete.extend();

        expect(DerivedAbstract.type.isAbstract).toBe(false);
        expect(DerivedConcrete.type.isAbstract).toBe(false);
      });

      it("should respect a set non-nully value", function() {
        var Derived = Instance.extend();
        expect(Derived.type.isAbstract).toBe(false);

        Derived.type.isAbstract = true;
        expect(Derived.type.isAbstract).toBe(true);

        Derived.type.isAbstract = false;
        expect(Derived.type.isAbstract).toBe(false);
      });

      it("should set to the default value false when set to a nully value", function() {
        var Derived = Instance.extend({type: {isAbstract: true}});
        expect(Derived.type.isAbstract).toBe(true);
        Derived.type.isAbstract = null;
        expect(Derived.type.isAbstract).toBe(false);

        Derived = Instance.extend({type: {isAbstract: true}});
        expect(Derived.type.isAbstract).toBe(true);
        Derived.type.isAbstract = undefined;
        expect(Derived.type.isAbstract).toBe(false);
      });
    }); // #isAbstract

    describe("#description -", function() {

      it("should preserve the default value", function() {
        var value = Instance.type.description;

        expect(value).not.toBe(undefined);

        Instance.type.description = undefined;

        // The default value is still there (did not delete)
        expect(Instance.type.description).toBe(value);
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

        Derived.type.extendProto();
        expect(Derived.type.hasDescendants).toBe(true);
      });
    }); // #hasDescendants

    describe("#isList", function() {
      it("should have default `isList` equal to `false`", function () {
        expect(Instance.type.isList).toBe(false);
      });
    });

    describe("#isRefinement", function() {
      it("should have default `isRefinement` equal to `false`", function () {
        expect(Instance.type.isRefinement).toBe(false);
      });
    });

    describe("#isValue", function() {
      it("should have default `isValue` equal to `false`", function () {
        expect(Instance.type.isValue).toBe(false);
      });
    });

    describe("#isProperty", function() {
      it("should have default `isProperty` equal to `false`", function () {
        expect(Instance.type.isProperty).toBe(false);
      });
    });

    describe("#isElement", function() {
      it("should have default `isElement` equal to `false`", function () {
        expect(Instance.type.isElement).toBe(false);
      });
    });

    describe("#isComplex", function() {
      it("should have default `isComplex` equal to `false`", function () {
        expect(Instance.type.isComplex).toBe(false);
      });
    });

    describe("#isSimple", function() {
      it("should have default `isSimple` equal to `false`", function () {
        expect(Instance.type.isSimple).toBe(false);
      });
    });

    describe("#create(valueSpec, {defaultType: .}", function() {
      it("returns a new instance of `pentaho.type.Instance`", function() {
        expect(Instance.type.create() instanceof Instance).toBe(true);
      });

      it("should return an instance when given nully", function() {
        var Complex = context.get("pentaho/type/complex");
        var MyComplex = Complex.extend();
        var inst = MyComplex.type.create(null);
        expect(inst instanceof MyComplex).toBe(true);

        inst = MyComplex.type.create(undefined);
        expect(inst instanceof MyComplex).toBe(true);
      });

      it("should create an instance given a number value when called on a Number type", function() {
        var Number = context.get("pentaho/type/number");
        var number = Number.type.create(1);

        expect(number instanceof Number).toBe(true);
        expect(number.value).toBe(1);
      });

      it("should create an instance given a number value when called on Number", function() {
        var Number = context.get("pentaho/type/number");
        var number = Number.type.create(1);

        expect(number instanceof Number).toBe(true);
        expect(number.value).toBe(1);
      });

      it("should create an instance given a boolean value when called on Boolean", function() {
        var Boolean = context.get("pentaho/type/boolean");
        var value = Boolean.type.create(true);

        expect(value instanceof Boolean).toBe(true);
        expect(value.value).toBe(true);
      });

      it("should create an instance given an object value when called on Object", function() {
        var Object = context.get("pentaho/type/object");
        var primitive = {};
        var value = Object.type.create({v: primitive});

        expect(value instanceof Object).toBe(true);
        expect(value.value).toBe(primitive);
      });

      it("should create an instance given an object with a type annotation, '_'", function() {
        var Value = context.get("pentaho/type/value");
        var value = Value.type.create({_: "pentaho/type/number", v: 1});

        var Number = context.get("pentaho/type/number");
        expect(value instanceof Number).toBe(true);
        expect(value.value).toBe(1);
      });

      it("should throw if given a type-annotated value that does not extend from the this type", function() {
        var String = context.get("pentaho/type/string");

        expect(function() {
          String.type.create({_: "pentaho/type/number", v: 1});
        }).toThrow(errorMatch.operInvalid());
      });

      it("should not throw if given a type-annotated value that does extend from the given baseType", function() {
        var Simple = context.get("pentaho/type/simple");
        var Number = context.get("pentaho/type/number");

        var value = Simple.type.create({_: "pentaho/type/number", v: 1});

        expect(value instanceof Number).toBe(true);
        expect(value.value).toBe(1);
      });

      it("should throw if given a type annotated value of an abstract type", function() {
        var MyAbstract = context.get("pentaho/type/complex").extend({type: {isAbstract: true}});

        expect(function() {
          Instance.type.create({_: MyAbstract});
        }).toThrow(errorMatch.operInvalid());
      });

      it("should throw if given a value and called on an abstract type", function() {
        var MyAbstract = context.get("pentaho/type/complex").extend({type: {isAbstract: true}});

        expect(function() {
          MyAbstract.type.create({});
        }).toThrow(errorMatch.operInvalid());
      });

      // ---

      it("should be able to create a type-annotated value of a list type", function() {
        var NumberList = context.get({base: "list", of: "number"});

        var value = Instance.type.create({_: NumberList, d: [1, 2]});

        expect(value instanceof NumberList).toBe(true);
        expect(value.count).toBe(2);
        expect(value.at(0).value).toBe(1);
        expect(value.at(1).value).toBe(2);
      });

      it("should be able to create a type-annotated value of an inline list type", function() {
        var value = Instance.type.create({
          _: {base: "list", of: "number"},
          d: [1, 2]
        });

        expect(value instanceof context.get("list")).toBe(true);
        expect(value.count).toBe(2);
        expect(value.at(0).value).toBe(1);
        expect(value.at(1).value).toBe(2);
      });

      it("should be able to create a type-annotated value of an inline complex type", function() {
        var value = Instance.type.create({
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
        var value = Instance.type.create({
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
        var value = Instance.type.create({
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

        var subSubType = SubInstance.type.extendProto();
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

    describe("#extendProto(typeSpec, keyArgs)", function() {
      var derivedProto;
      beforeEach(function() {
        derivedProto = Instance.type.extendProto({}, {});
      });

      it("derived classes have the proper 'ancestor'", function() {
        expect(derivedProto).not.toBe(Instance.type);
        expect(derivedProto.ancestor).toBe(Instance.type);
      });

      it("can be invoked without arguments", function() {
        expect(Instance.type.extendProto().ancestor).toBe(Instance.type);
        expect(Instance.type.extendProto(null).ancestor).toBe(Instance.type);
        expect(Instance.type.extendProto(null, {}).ancestor).toBe(Instance.type);
      });

      it("does not return a constructor", function() {
        expect(typeof derivedProto).not.toBe("function");
      });

      it("returns an instance whose constructor is the same as the extended class", function() {
        expect(derivedProto.constructor).toBe(Instance.type.constructor);
      });

      it("accepts keyArgs", function() {
        var derivedType = Instance.type.extendProto({}, {
          isRoot: true
        });
        expect(Instance.type.isRoot).toBe(false);
        expect(derivedType.isRoot).toBe(true);
      });
    });
  });
});