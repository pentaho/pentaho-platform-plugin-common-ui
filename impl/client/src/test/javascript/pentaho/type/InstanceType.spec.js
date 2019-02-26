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
  "pentaho/type/_baseLoader",
  "pentaho/type/Instance",
  "pentaho/type/SpecificationContext",
  "tests/pentaho/util/errorMatch"
], function(typeLoader, Instance, SpecificationContext, errorMatch) {

  "use strict";

  describe("pentaho.type.Type", function() {

    describe("construction", function() {

      it("should allow specifying static type members", function() {
        var Derived = Instance.extend({}, {$type: {foo: "bar"}});

        expect(Derived.Type.foo).toBe("bar");
      });
    });

    describe("#label -", function() {

      describe("when `label` is falsy -", function() {
        it("should have a top-root label", function() {
          var label = Instance.type.label;
          expect(typeof label).toBe("string");
          expect(label.length > 0).toBe(true);
        });

        it("should not reset the top-root label", function() {

          return require.using(["pentaho/type/Instance"], function(Instance) {
            var topRootLabel = Instance.type.label;

            Instance.type.label = undefined;

            expect(Instance.type.label).toBe(topRootLabel);
          });
        });

        it("should inherit `label`", function() {
          function expectIt(derivedSpec) {
            var Derived = Instance.extend({$type: derivedSpec});
            expect(Derived.type.label).toBe(Instance.type.label);
          }

          expectIt({});
          expectIt({label: undefined});
          expectIt({label: null});
          expectIt({label: ""});
        });

        it("subclasses should preserve the default value", function() {
          var FirstDerivative  = Instance.extend({$type: {label: "Foo"}});
          var SecondDerivative = FirstDerivative.extend({$type: {label: "Bar"}});
          SecondDerivative.type.label = undefined;
          // The default value is still there (did not delete)
          expect(SecondDerivative.type.label).toBe("Foo");
        });
      }); // when `label` is falsy

      describe("when `label` is truthy", function() {
        // Can change the label
        it("should respect the `label`", function() {
          var Derived = Instance.extend({$type: {label: "Foo"}});
          expect(Derived.type.label).toBe("Foo");
        });
      });
    }); // #label

    describe("#id and #sourceId -", function() {

      describe("when `id` is falsy -", function() {
        it("should have `null` as a default `id`", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({$type: spec});
            expect(Derived.type.id).toBe(null);
          }

          expectIt({});
          expectIt({id: undefined});
          expectIt({id: null});
        });

        it("should default to `sourceId`, when the latter specified", function() {
          function expectIt(spec) {
            spec.sourceId = "foo";

            var Derived = Instance.extend({$type: spec});
            expect(Derived.type.id).toBe("foo");
          }

          expectIt({});
          expectIt({id: undefined});
          expectIt({id: null});
        });
      });

      describe("when `id` is truthy -", function() {
        it("should respect it", function() {
          var Derived = Instance.extend({
            $type: {id: "foo/bar"}
          });

          expect(Derived.type.id).toBe("foo/bar");
        });

        it("should convert it to a string", function() {
          var Derived = Instance.extend({
            $type: {id: {toString: function() { return "foo/bar"; }}}
          });

          expect(Derived.type.id).toBe("foo/bar");
        });

        it("should ignore it, if it is a temporary id", function() {
          var Derived = Instance.extend({
            $type: {id: SpecificationContext.idTemporaryPrefix + "id"}
          });

          expect(Derived.type.id).toBe(null);
        });
      });

      describe("when `sourceId` is falsy -", function() {

        it("should default to `id`, when the latter is specified", function() {
          function expectIt(spec) {
            spec.id = "foo";

            var Derived = Instance.extend({$type: spec});
            expect(Derived.type.sourceId).toBe("foo");
          }

          expectIt({});
          expectIt({sourceId: undefined});
          expectIt({sourceId: null});
        });
      });

      describe("when `sourceId` is truthy -", function() {
        it("should respect it", function() {
          var Derived = Instance.extend({
            $type: {sourceId: "foo/bar"}
          });

          expect(Derived.type.sourceId).toBe("foo/bar");
        });

        it("should convert it to a string", function() {
          var Derived = Instance.extend({
            $type: {sourceId: {toString: function() { return "foo/bar"; }}}
          });

          expect(Derived.type.sourceId).toBe("foo/bar");
        });
      });

      describe("when both `id` and `sourceId` are truthy and different -", function() {
        it("should respect both", function() {
          var Derived = Instance.extend({
            $type: {id: "bar/foo", sourceId: "foo/bar"}
          });

          expect(Derived.type.id).toBe("bar/foo");
          expect(Derived.type.sourceId).toBe("foo/bar");
        });
      });

    });

    describe("#alias", function() {

      it("should throw if assigned to an anonymous type", function() {
        expect(function() {
          var Derived = Instance.extend({$type: {label: "Foo", alias: "bar"}});
        }).toThrow(errorMatch.argInvalid("alias", "Anonymous types cannot have an alias"));
      });

      it("should be read only", function() {
        expect(function() {
          var Derived = Instance.extend({$type: {label: "Foo", id: "type/bar", alias: "bar"}});
          Derived.type.alias = "mux";
        }).toThrowError(TypeError);
      });

      it("should default from the module's alias, when id is specified", function() {

        function configAmd(localRequire) {

          localRequire.config({
            config: {
              "pentaho/modules": {
                "test/TypeWithAlias": {
                  base: null,
                  alias: "fooAlias"
                }
              }
            }
          });

          localRequire.define("test/TypeWithAlias", ["pentaho/type/Value"], function(Value) {
            return Value.extend({
              $type: {
                id: "test/TypeWithAlias"
              }
            });
          });
        }

        return require.using(["test/TypeWithAlias"], configAmd, function(TypeWithAlias) {
          expect(TypeWithAlias.type.alias).toBe("fooAlias");
        });
      });

      it("should ignore the module's alias, when alias is specified", function() {

        function configAmd(localRequire) {

          localRequire.config({
            config: {
              "pentaho/modules": {
                "test/TypeWithAlias": {
                  base: null,
                  alias: "fooAlias"
                }
              }
            }
          });

          localRequire.define("test/TypeWithAlias", ["pentaho/type/Value"], function(Value) {
            return Value.extend({
              $type: {
                id: "test/TypeWithAlias",
                alias: "barAlias"
              }
            });
          });
        }

        return require.using(["test/TypeWithAlias"], configAmd, function(TypeWithAlias) {
          expect(TypeWithAlias.type.alias).toBe("barAlias");
        });
      });
    });

    describe("#shortId -", function() {

      it("should be `null` when id is `null`", function() {
        var Derived = Instance.extend();
        expect(Derived.type.shortId).toBe(null);
      });

      it("should be equal to #id when no alias is defined", function() {
        var Derived = Instance.extend({$type: {id: "my/foo"}});
        expect(Derived.type.shortId).toBe(Derived.type.id);
      });

      it("should be equal to #alias when the alias is defined", function() {
        var Derived = Instance.extend({$type: {id: "my/foo", alias: "foo"}});
        expect(Derived.type.shortId).toBe(Derived.type.alias);
      });

    });

    describe("#isAbstract", function() {
      it("should respect a specified abstract spec value", function() {
        var Derived = Instance.extend({$type: {isAbstract: true}});
        expect(Derived.type.isAbstract).toBe(true);

        Derived = Instance.extend({$type: {isAbstract: false}});
        expect(Derived.type.isAbstract).toBe(false);
      });

      it("should default to `false` when spec is unspecified and should not inherit the base value", function() {
        var Derived = Instance.extend();
        expect(Derived.type.isAbstract).toBe(false);

        var Abstract = Instance.extend({$type: {isAbstract: true}});
        var Concrete = Instance.extend({$type: {isAbstract: false}});

        var DerivedAbstract = Abstract.extend();
        var DerivedConcrete = Concrete.extend();

        expect(DerivedAbstract.type.isAbstract).toBe(false);
        expect(DerivedConcrete.type.isAbstract).toBe(false);
      });
    });

    describe("#application -", function() {
      it("should have `{}` as the root value", function() {
        var value = Instance.type.application;

        expect(value).toEqual({});
      });

      describe("when not specified -", function() {
        it("should inherit the base application attribute", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({$type: spec});

            expect(Derived.type.application).toEqual({});
          }

          expectIt({});
          expectIt({application: undefined});
        });
      });

      describe("when specified -", function() {
        it("should clone the spec if there is no previous application attribute defined", function() {
          var spec = {foo: "bar"};
          var Derived = Instance.extend({$type: {application: spec}});

          expect(Derived.type.application).not.toBe(spec);
          expect(Derived.type.application.foo).toBe(spec.foo);
        });

        it("should merge the spec if there is a previous application attribute defined", function() {
          var Derived1 = Instance.extend({$type: {application: {foo: "foo"}}});
          var Derived2 = Instance.extend({$type: {application: {foo: "bar", bar: "foo"}}});
          expect(Derived1.type.application.foo).toBe("foo");
          expect(Derived2.type.application.foo).toBe("bar");
          expect(Derived2.type.application.bar).toBe("foo");
        });
      });
    });

    describe("#description -", function() {

      it("should preserve the default value", function() {
        return require.using(["pentaho/type/Instance"], function(Instance) {
          var value = Instance.type.description;

          expect(value).not.toBe(undefined);

          Instance.type.description = undefined;

          // The default value is still there (did not delete)
          expect(Instance.type.description).toBe(value);
        });
      });

      describe("when not specified -", function() {
        it("should inherit the base description", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({$type: spec});

            expect(Derived.type.description).toBe(Instance.type.description);
          }

          expectIt({});
          expectIt({description: undefined});
        });
      });

      describe("when specified as `null` or an empty string -", function() {
        it("should set the description to `null`", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({$type: spec});

            expect(Derived.type.description).toBe(null);
          }

          expectIt({description: null});
          expectIt({description: ""});
        });
      });

      describe("when specified as a non-empty string -", function() {
        it("should respect it", function() {
          var Derived = Instance.extend({$type: {description: "Foo"}});

          expect(Derived.type.description).toBe("Foo");
        });
      });
    });

    describe("#category -", function() {
      describe("when not specified -", function() {

        it("should preserve the default value", function() {
          return require.using(["pentaho/type/Instance"], function(Instance) {
            Instance.type.category = undefined;
            // The default value is still there (did not delete)
            expect(Instance.type.category).toBe(null);
          });
        });

        it("should inherit the base category", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({$type: spec});

            expect(Derived.type.category).toBe(Instance.type.category);
          }

          expectIt({});
          expectIt({category: undefined});
        });
      });

      describe("when specified as `null` or an empty string -", function() {
        it("should set the category to `null`", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({$type: spec});

            expect(Derived.type.category).toBe(null);
          }

          expectIt({category: null});
          expectIt({category: ""});
        });
      });

      describe("when specified as a non-empty string", function() {
        it("should respect it", function() {
          var Derived = Instance.extend({$type: {category: "Foo"}});

          expect(Derived.type.category).toBe("Foo");
        });
      });
    });

    describe("#helpUrl -", function() {
      it("should preserve the default value", function() {
        return require.using(["pentaho/type/Instance"], function(Instance) {
          Instance.type.helpUrl = undefined;
          // The default value is still there (did not delete)
          expect(Instance.type.helpUrl)
            .toBe(null);
        });
      });

      describe("when not specified", function() {
        it("should inherit the base helpUrl", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({$type: spec});

            expect(Derived.type.helpUrl).toBe(Instance.type.helpUrl);
          }

          expectIt({});
          expectIt({helpUrl: undefined});
        });
      });

      describe("when specified as `null` or an empty string -", function() {
        it("should set the helpUrl to `null`", function() {
          function expectIt(spec) {
            var Derived = Instance.extend({$type: spec});

            expect(Derived.type.helpUrl).toBe(null);
          }

          expectIt({helpUrl: null});
          expectIt({helpUrl: ""});
        });
      });

      describe("when specified as a non-empty string -", function() {
        it("should respect it", function() {
          var Derived = Instance.extend({$type: {helpUrl: "Foo"}});

          expect(Derived.type.helpUrl).toBe("Foo");
        });
      });
    });

    describe("#uid -", function() {
      it("should not be inherited", function() {
        var Derived = Instance.extend();
        expect(Derived.type.uid).not.toBe(Instance.type.uid);
      });

      it("should be unique", function() {
        var DerivedA = Instance.extend();
        var DerivedB = Instance.extend();
        expect(DerivedA.type.uid).not.toBe(DerivedB.type.uid);
        expect(DerivedA.type.uid).not.toBe(Instance.type.uid);
      });
    });

    describe("#styleClass -", function() {

      it("should be settable on the root type", function() {
        return require.using(["pentaho/type/Instance"], function(Instance) {
          Instance.type.styleClass = "foo";
          expect(Instance.type.styleClass).toBe("foo");
        });
      });

      it("should be defined on the root type", function() {
        expect(Instance.type.styleClass).toBe("pentaho-type-instance");
      });

      it("should default to the id of the type, in snake case, when the type is not anonymous", function() {
        var Derived = Instance.extend({
          $type: {
            id: "foo/bar"
          }
        });

        expect(Derived.type.styleClass).toBe("foo-bar");
      });

      it("should default to `null`, when the type is anonymous", function() {
        var Derived = Instance.extend();

        expect(Derived.type.styleClass).toBe(null);
      });

      it("should respect a specified styleClass upon extension", function() {
        var Derived = Instance.extend({
          $type: {
            id: "foo/bar",
            styleClass: "foo-bar-gugu"
          }
        });

        expect(Derived.type.styleClass).toBe("foo-bar-gugu");
      });

      it("should respect a specified styleClass equal to `null` upon extension", function() {
        var Derived = Instance.extend({
          $type: {
            id: "foo/bar",
            styleClass: null
          }
        });

        expect(Derived.type.styleClass).toBe(null);
      });

      it("should convert a specified styleClass equal to `''` to `null` upon extension", function() {
        var Derived = Instance.extend({
          $type: {
            id: "foo/bar",
            styleClass: ""
          }
        });

        expect(Derived.type.styleClass).toBe(null);
      });

      it("should default to the id of the type if specified as `undefined` upon extension", function() {
        var Derived = Instance.extend({
          $type: {
            id: "foo/bar",
            styleClass: undefined
          }
        });

        expect(Derived.type.styleClass).toBe("foo-bar");
      });

      it("should clear the value when set to '' after extension", function() {
        var Derived = Instance.extend({
          $type: {
            id: "foo/bar",
            styleClass: "abc"
          }
        });

        Derived.type.styleClass = "";

        expect(Derived.type.styleClass).toBe(null);
      });

      it("should clear the value when set to `null` after extension", function() {
        var Derived = Instance.extend({
          $type: {
            id: "foo/bar",
            styleClass: "abc"
          }
        });

        Derived.type.styleClass = null;

        expect(Derived.type.styleClass).toBe(null);
      });

      it("should default the value when set to `undefined` after extension", function() {
        var Derived = Instance.extend({
          $type: {
            id: "foo/bar",
            styleClass: "abc"
          }
        });

        Derived.type.styleClass = undefined;

        expect(Derived.type.styleClass).toBe("foo-bar");
      });
    });

    describe("#inheritedStyleClasses -", function() {

      var level1StyleClassName = "Level1StyleClass";
      var level2StyleClassName = "Level2StyleClass";
      var level3StyleClassName = "Level3StyleClass";

      var Instance;
      var DerivedLevel1;
      var DerivedLevel2;
      var DerivedLevel3;

      var localRequire;

      beforeEach(function(done) {
        localRequire = require.new();

        localRequire(["pentaho/type/Instance"], function(_Instance) {
          Instance = _Instance;

          Instance.type.styleClass = null;
          DerivedLevel1 = Instance.extend({$type: {styleClass: null}});
          DerivedLevel2 = DerivedLevel1.extend({$type: {styleClass: null}});
          DerivedLevel3 = DerivedLevel2.extend({$type: {styleClass: null}});

          done();
        }, done.fail);
      });

      afterEach(function() {
        localRequire.dispose();
      });

      it("should return empty array when no styleClass are defined", function() {
        expect(DerivedLevel3.type.inheritedStyleClasses instanceof Array).toBe(true);
        expect(DerivedLevel3.type.inheritedStyleClasses.length).toBe(0);
      });

      it("should return array with all the styleClass", function() {
        DerivedLevel1.type.styleClass = level1StyleClassName;
        DerivedLevel2.type.styleClass = level2StyleClassName;
        DerivedLevel3.type.styleClass = level3StyleClassName;

        expect(DerivedLevel3.type.inheritedStyleClasses instanceof Array).toBe(true);
        expect(DerivedLevel3.type.inheritedStyleClasses.length).toBe(3);

        expect(DerivedLevel3.type.inheritedStyleClasses).toContain(level1StyleClassName);
        expect(DerivedLevel3.type.inheritedStyleClasses).toContain(level2StyleClassName);
        expect(DerivedLevel3.type.inheritedStyleClasses).toContain(level3StyleClassName);
      });

      it("should ignore nully styleClasses", function() {
        [
          undefined, null, "", []
        ].forEach(function(nullyStyleClass) {
          DerivedLevel1.type.styleClass = "Level1StyleClass";
          DerivedLevel2.type.styleClass = nullyStyleClass;
          DerivedLevel3.type.styleClass = "Level3StyleClass";

          expect(DerivedLevel3.type.inheritedStyleClasses instanceof Array).toBe(true);
          expect(DerivedLevel3.type.inheritedStyleClasses.length).toBe(2);

          expect(DerivedLevel3.type.inheritedStyleClasses).toContain(level1StyleClassName);
          expect(DerivedLevel3.type.inheritedStyleClasses).toContain(level3StyleClassName);
        });
      });

    });

    describe("#isAdvanced -", function() {
      it("should preserve the default value", function() {
        return require.using(["pentaho/type/Instance"], function(Instance) {
          Instance.type.isAdvanced = undefined;
          // The default value is still there (did not delete)
          expect(Instance.type.isAdvanced).toBe(false);
        });
      });

      it("can be set on a derived class", function() {
        [true, false].forEach(function(bool) {
          var Derived = Instance.extend({$type: {"isAdvanced": bool}});
          expect(Derived.type.isAdvanced).toBe(bool);

          var inst = new Derived();
          expect(inst.$type.isAdvanced).toBe(bool);
        });
      });

      it("can be unset by passing a nully, thus delegating to the ancestor class", function() {
        [true, false].forEach(function(bool) {
          [null, undefined].forEach(function(value) {
            var FirstDerivative  = Instance.extend({$type: {"isAdvanced": bool}});
            var SecondDerivative = FirstDerivative.extend({$type: {"isAdvanced": !bool}});

            SecondDerivative.type.isAdvanced = value;
            expect(SecondDerivative.type.isAdvanced).toBe(FirstDerivative.type.isAdvanced);
          });
        });
      });
    }); // #isAdvanced

    describe("#isBrowsable -", function() {

      it("should preserve the default value", function() {
        return require.using(["pentaho/type/Instance"], function(Instance) {
          Instance.type.isBrowsable = undefined;
          // The default value is still there (did not delete)
          expect(Instance.type.isBrowsable).toBe(true);
        });
      });

      it("can be set on a derived class", function() {
        [true, false].forEach(function(bool) {
          var Derived = Instance.extend({$type: {"isBrowsable": bool}});
          expect(Derived.type.isBrowsable).toBe(bool);

          var inst = new Derived();
          expect(inst.$type.isBrowsable).toBe(bool);
        });
      });

      it("can be unset by passing a nully, thus delegating to the ancestor class", function() {
        [true, false].forEach(function(bool) {
          [null, undefined].forEach(function(value) {
            var FirstDerivative  = Instance.extend({$type: {"isBrowsable": bool}});
            var SecondDerivative = FirstDerivative.extend({$type: {"isBrowsable": !bool}});

            SecondDerivative.type.isBrowsable = value;
            expect(SecondDerivative.type.isBrowsable).toBe(FirstDerivative.type.isBrowsable);
          });
        });
      });
    });

    describe("#ordinal -", function() {
      it("should preserve the default value", function() {
        return require.using(["pentaho/type/Instance"], function(Instance) {
          Instance.type.ordinal = undefined;
          // The default value is still there (did not delete)
          expect(Instance.type.ordinal).toBe(0);
        });
      });

      it("can be set on a derived class", function() {
        [1].forEach(function(someValue) {
          var Derived = Instance.extend({$type: {"ordinal": someValue}});
          expect(Derived.type.ordinal).toBe(someValue);

          var inst = new Derived();
          expect(inst.$type.ordinal).toBe(someValue);
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

          var FirstDerivative  = Instance.extend({$type: {"ordinal": 42}});
          var SecondDerivative = FirstDerivative.extend({$type: {"ordinal": candidate}});
          expect(SecondDerivative.type.ordinal).toBe(final);

          var inst = new SecondDerivative();
          expect(inst.$type.ordinal).toBe(final);
        });
      });

      it("can be unset by passing a nully, thus delegating to the ancestor class", function() {
        [1, 20].forEach(function(someValue) {
          [null, undefined].forEach(function(resetValue) {
            var FirstDerivative  = Instance.extend({$type: {"ordinal": 42}});
            var SecondDerivative = FirstDerivative.extend({$type: {"ordinal": someValue}});

            SecondDerivative.type.ordinal = resetValue;
            expect(SecondDerivative.type.ordinal).toBe(FirstDerivative.type.ordinal);
          });
        });
      });
    });

    describe("#isRoot -", function() {
      it("can be set on a derived class", function() {
        [true, false].forEach(function(isRoot) {
          var Derived = Instance.extend("", null, null, {isRoot: isRoot});
          expect(Derived.type.isRoot).toBe(isRoot);

          var inst = new Derived();
          expect(inst.$type.isRoot).toBe(isRoot);
        });
      });
    }); // #isRoot

    describe("#ancestor -", function() {
      it("returns the immediate ancestor", function() {
        var FirstDerivative  = Instance.extend({$type: {"firstDerivative": true}});
        var FirstSibling     = Instance.extend({$type: {"firstSibling": true}});
        var SecondDerivative = FirstDerivative.extend({$type: {"secondDerivative": true}});

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
    }); // #hasDescendants

    describe("#isList", function() {
      it("should have default `isList` equal to `false`", function() {
        expect(Instance.type.isList).toBe(false);
      });
    });

    describe("#isValue", function() {
      it("should have default `false`", function() {
        expect(Instance.type.isValue).toBe(false);
      });
    });

    describe("#isProperty", function() {
      it("should have default `false`", function() {
        expect(Instance.type.isProperty).toBe(false);
      });
    });

    describe("#isElement", function() {
      it("should have default `false`", function() {
        expect(Instance.type.isElement).toBe(false);
      });
    });

    describe("#isComplex", function() {
      it("should have default `false`", function() {
        expect(Instance.type.isComplex).toBe(false);
      });
    });

    describe("#isSimple", function() {
      it("should have default `false`", function() {
        expect(Instance.type.isSimple).toBe(false);
      });
    });

    describe("#isContainer", function() {
      it("should have default `false`", function() {
        expect(Instance.type.isContainer).toBe(false);
      });
    });

    describe("#isContinuous", function() {
      it("should have default `false`", function() {
        expect(Instance.type.isContinuous).toBe(false);
      });
    });

    describe("#create(instRef, instKeyArgs)", function() {

      it("should call the instance container #resolveInstance with type as the base type", function() {

        var got = {};
        spyOn(typeLoader, "resolveInstance").and.returnValue(got);

        var instRef = {};
        var instKeyArgs = {};

        var result = Instance.type.create(instRef, instKeyArgs);

        expect(result).toBe(got);
        expect(typeLoader.resolveInstance).toHaveBeenCalledWith(instRef, instKeyArgs, Instance.type);
      });
    }); // #create

    describe("#createAsync(instSpec, instKeyArgs)", function() {

      it("should call the instance container #resolveInstanceAsync with type as the base type", function() {

        var got = {};
        spyOn(typeLoader, "resolveInstanceAsync").and.returnValue(Promise.resolve(got));

        var instRef = {};
        var instKeyArgs = {};

        return Instance.type.createAsync(instRef, instKeyArgs).then(function(result) {
          expect(result).toBe(got);
          expect(typeLoader.resolveInstanceAsync).toHaveBeenCalledWith(instRef, instKeyArgs, Instance.type);
        });
      });
    }); // #createAsync

    describe("#is -", function() {
      it("detects an instance of `pentaho.type.Instance` correctly", function() {
        expect(Instance.type.is(new Instance())).toBe(true);
      });

      it("detects an instance of a sub-type correctly", function() {
        var SubInstance = Instance.extend();

        expect(Instance.type.is(new SubInstance())).toBe(true);
        expect(SubInstance.type.is(new SubInstance())).toBe(true);
      });

      it("detects that an instance of another Instance class is not of the type", function() {
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
          (function() { return this; })() // global object
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

      it("calls #create(value) and returns its result when value is not an instance of the type", function() {
        var SubInstance = Instance.extend();

        spyOn(SubInstance.type, "create").and.callThrough();

        var value = {};
        var subInst = SubInstance.type.to(value);

        expect(subInst instanceof SubInstance).toBe(true);
        expect(SubInstance.type.create).toHaveBeenCalledWith(value, undefined);
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

    describe("#mixins", function() {

      function defineSampleMixins(localRequire) {

        localRequire.define("tests/mixins/A", ["pentaho/type/Value"], function(Value) {

          return Value.extend({
            testMethodAInst: function() {},
            $type: {
              id: "tests/mixins/A",
              testMethodA: function() {}
            }
          });
        });

        localRequire.define("tests/mixins/B", ["pentaho/type/Value"], function(Value) {

          return Value.extend({
            testMethodBInst: function() {},
            $type: {
              id: "tests/mixins/B",
              testMethodB: function() {}
            }
          });
        });

        localRequire.define("tests/mixins/C", ["pentaho/type/Value"], function(Value) {

          return Value.extend({
            $type: {
              id: "tests/mixins/C",
              _init: function(spec, ka) {
                spec = this.base(spec, ka) || spec;
                this.__hasBeenInInit = true;
                return spec;
              }
            }
          });
        });
      }

      it("should initially be an empty array", function() {

        return require.using(["pentaho/type/Value"], function(Value) {

          var DerivedValue = Value.extend();

          var mixins = DerivedValue.type.mixins;

          expect(Array.isArray(mixins)).toBe(true);
          expect(mixins.length).toBe(0);
        });
      });

      describe("when extending", function() {

        it("should apply a mixin specified as an [id]", function() {

          return require.using(["pentaho/type/Value", "tests/mixins/A"], defineSampleMixins, function(Value, MixinA) {

            var DerivedValue = Value.extend({
              $type: {
                mixins: [MixinA]
              }
            });

            var mixins = DerivedValue.type.mixins;

            expect(Array.isArray(mixins)).toBe(true);
            expect(mixins.length).toBe(1);

            var mixinType = mixins[0];

            expect(mixinType.instance.constructor).toBe(MixinA);
          });
        });

        it("should apply a mixin specified as an id", function() {

          return require.using(["pentaho/type/Value", "tests/mixins/A"], defineSampleMixins, function(Value, MixinA) {

            var DerivedValue = Value.extend({
              $type: {
                mixins: MixinA
              }
            });

            var mixins = DerivedValue.type.mixins;

            expect(Array.isArray(mixins)).toBe(true);
            expect(mixins.length).toBe(1);

            var mixinType = mixins[0];

            expect(mixinType.instance.constructor).toBe(MixinA);
          });
        });

        it("should apply a mixin specified as a [type factory]", function() {

          return require.using(["pentaho/type/Value", "tests/mixins/A"], defineSampleMixins, function(Value, MixinA) {

            var DerivedValue = Value.extend({
              $type: {
                mixins: [MixinA]
              }
            });

            var mixins = DerivedValue.type.mixins;

            expect(Array.isArray(mixins)).toBe(true);
            expect(mixins.length).toBe(1);

            var mixinType = mixins[0];

            expect(mixinType.instance.constructor).toBe(MixinA);
          });
        });

        it("should apply a mixin specified as the [Instance] constructor", function() {

          return require.using(["pentaho/type/Value", "tests/mixins/A"], defineSampleMixins, function(Value, MixinA) {

            var DerivedValue = Value.extend({
              $type: {
                mixins: [MixinA]
              }
            });

            var mixins = DerivedValue.type.mixins;

            expect(Array.isArray(mixins)).toBe(true);
            expect(mixins.length).toBe(1);

            var mixinType = mixins[0];
            expect(mixinType.instance.constructor).toBe(MixinA);
          });
        });

        it("should mix both instance and type methods", function() {

          return require.using(["pentaho/type/Value", "tests/mixins/A"], defineSampleMixins, function(Value, MixinA) {

            var DerivedValue = Value.extend({
              $type: {
                mixins: [MixinA]
              }
            });

            expect(typeof DerivedValue.prototype.testMethodAInst).toBe("function");
            expect(typeof DerivedValue.type.testMethodA).toBe("function");
          });
        });

        it("should leave the target type's id unchanged", function() {

          return require.using(["pentaho/type/Value", "tests/mixins/A"], defineSampleMixins, function(Value, MixinA) {

            var DerivedValue = Value.extend({
              $type: {
                id: "tests/type/target",
                mixins: [MixinA]
              }
            });

            expect(DerivedValue.type.id).toBe("tests/type/target");
          });
        });

        it("should get the local mixins only", function() {

          return require.using([
            "pentaho/type/Value",
            "tests/mixins/A",
            "tests/mixins/B"
          ], defineSampleMixins, function(Value, MixinA, MixinB) {

            var DerivedValue1 = Value.extend({
              $type: {
                mixins: [MixinA]
              }
            });

            var DerivedValue2 = DerivedValue1.extend({
              $type: {
                mixins: [MixinB]
              }
            });

            var mixins = DerivedValue1.type.mixins;

            expect(Array.isArray(mixins)).toBe(true);
            expect(mixins.length).toBe(1);

            var mixinType = mixins[0];
            expect(mixinType.instance.constructor).toBe(MixinA);
            expect(typeof DerivedValue1.prototype.testMethodAInst).toBe("function");
            expect(typeof DerivedValue1.type.testMethodA).toBe("function");

            // ---

            mixins = DerivedValue2.type.mixins;

            expect(Array.isArray(mixins)).toBe(true);
            expect(mixins.length).toBe(1);

            mixinType = mixins[0];
            expect(mixinType.instance.constructor).toBe(MixinB);

            expect(typeof DerivedValue2.prototype.testMethodAInst).toBe("function");
            expect(typeof DerivedValue2.type.testMethodA).toBe("function");
            expect(typeof DerivedValue2.prototype.testMethodBInst).toBe("function");
            expect(typeof DerivedValue2.type.testMethodB).toBe("function");
          });
        });

        it("should ignore duplicate mixins", function() {

          return require.using([
            "pentaho/type/Value",
            "tests/mixins/A",
            "tests/mixins/B"
          ], defineSampleMixins, function(Value, MixinA, MixinB) {

            var DerivedValue = Value.extend({
              $type: {
                mixins: [MixinA, MixinA, MixinB]
              }
            });

            var mixins = DerivedValue.type.mixins;

            expect(Array.isArray(mixins)).toBe(true);
            expect(mixins.length).toBe(2);

            expect(mixins[0].instance.constructor).toBe(MixinA);
            expect(mixins[1].instance.constructor).toBe(MixinB);
          });
        });

        it("should ignore a nully value", function() {

          return require.using(["pentaho/type/Value", "tests/mixins/A"], defineSampleMixins, function(Value, MixinA) {

            var DerivedValue = Value.extend({
              $type: {
                mixins: null
              }
            });

            expect(DerivedValue.type.mixins).toEqual([]);

            // ---

            DerivedValue = Value.extend({
              $type: {
                mixins: undefined
              }
            });

            expect(DerivedValue.type.mixins).toEqual([]);

            // ---

            DerivedValue = Value.extend({
              $type: {
                mixins: [MixinA]
              }
            });

            DerivedValue.type.mixins = null;

            expect(DerivedValue.type.mixins.length).toBe(1);

            // ---

            DerivedValue.type.mixins = undefined;

            expect(DerivedValue.type.mixins.length).toBe(1);
          });
        });

        it("should allow overriding the Type#_init method from a mixin", function() {

          return require.using(["pentaho/type/Value", "tests/mixins/C"], defineSampleMixins, function(Value, MixinC) {

            var DerivedValue = Value.extend({
              $type: {
                mixins: [MixinC]
              }
            });

            expect(DerivedValue.type.__hasBeenInInit).toBe(true);
          });
        });
      });
    });
  });
});
