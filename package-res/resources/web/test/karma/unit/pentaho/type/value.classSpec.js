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
  "pentaho/type/Item",
  "pentaho/type/Context",
  "pentaho/type/value"
], function(Abstract, Context, valueFactory) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Value = context.get(valueFactory);

  describe("pentaho/type/value -", function() {

    it("should be a function", function() {
      expect(typeof Value).toBe("function");
    });

    it("should be a sub-class of `Abstract`", function() {
      expect(Value.prototype instanceof Abstract).toBe(true);
    });

    describe(".Meta -", function() {
      var ValueMeta = Value.Meta;

      it("should be a function", function() {
        expect(typeof ValueMeta).toBe("function");
      });

      it("should be a sub-class of `Abstract.Meta`", function() {
        expect(ValueMeta.prototype instanceof Abstract.Meta).toBe(true);
      });

      it("should have an `uid`", function() {
        expect(ValueMeta.prototype.uid != null).toBe(true);
        expect(typeof ValueMeta.prototype.uid).toBe("number");
      });
    }); // ".Meta -"

    describe(".extend({...}) returns a value that -", function() {

      it("should be a function", function() {
        var Derived = Value.extend();
        expect(typeof Derived).toBe("function");
      });

      it("should be a sub-class of Value", function() {
        var Derived = Value.extend();
        expect(Derived).not.toBe(Value);
        expect(Derived.prototype instanceof Value).toBe(true);
      });

      describe("has a .Meta property that -", function() {

        it("should be a function", function() {
          var Derived = Value.extend();
          expect(typeof Derived.Meta).toBe("function");
        });

        it("should be a sub-class of Value.Meta", function() {
          var Derived = Value.extend();
          expect(Derived.Meta).not.toBe(Value.Meta);
          expect(Derived.meta instanceof Value.Meta).toBe(true);
        });

        // =====

        describe("#label -", function() {

          describe("when `label` is falsy -", function() {
            it("should inherit `label`", function() {
              function expectIt(derivedSpec) {
                var Derived = Value.extend({meta: derivedSpec});
                expect(Derived.meta.label).toBe(Value.meta.label);
              }

              expectIt({});
              expectIt({label: undefined});
              expectIt({label: null});
              expectIt({label: ""});
            });
          }); // when `label` is falsy

          describe("when `label` is truthy", function() {
            // Can change the label
            it("should respect the `label`", function() {
              var Derived = Value.extend({meta: {label: "Foo"}});
              expect(Derived.meta.label).toBe("Foo");
            });
          });
        }); // #label

        // =====

        describe("#id -", function() {
          describe("when `id` is falsy -", function() {
            it("should have `null` as a default `id`", function() {
              function expectIt(spec) {
                var Derived = Value.extend({meta: spec});
                expect(Derived.meta.id).toBe(null);
              }

              expectIt({});
              expectIt({id: undefined});
              expectIt({id: null});
              expectIt({id: null});
            });
          });

          describe("when `id` is truthy -", function() {
            it("should respect it", function() {
              var Derived = Value.extend({
                meta: {id: "foo/bar"}
              });

              expect(Derived.meta.id).toBe("foo/bar");
            });
          });
        }); // #id

        // =====

        describe("#description -", function() {
          describe("when not specified -", function() {
            it("should inherit the base description", function() {
              function expectIt(spec) {
                var Derived = Value.extend({meta: spec});

                expect(Derived.meta.description).toBe(Value.meta.description);
              }

              expectIt({});
              expectIt({description: undefined});
            });
          });

          describe("when specified as `null` or an empty string -", function() {
            it("should set the description to `null`", function() {
              function expectIt(spec) {
                var Derived = Value.extend({meta: spec});

                expect(Derived.meta.description).toBe(null);
              }

              expectIt({description: null});
              expectIt({description: ""});
            });
          });

          describe("when specified as a non-empty string -", function() {
            it("should respect it", function() {
              var Derived = Value.extend({meta: {description: "Foo"}});

              expect(Derived.meta.description).toBe("Foo");
            });
          });
        }); // #description

        // ====

        describe("#category -", function() {
          describe("when not specified -", function() {
            it("should inherit the base category", function() {
              function expectIt(spec) {
                var Derived = Value.extend({meta: spec});

                expect(Derived.meta.category).toBe(Value.meta.category);
              }

              expectIt({});
              expectIt({category: undefined});
            });
          });

          describe("when specified as `null` or an empty string -", function() {
            it("should set the category to `null`", function() {
              function expectIt(spec) {
                var Derived = Value.extend({meta: spec});

                expect(Derived.meta.category).toBe(null);
              }

              expectIt({category: null});
              expectIt({category: ""});
            });
          });

          describe("when specified as a non-empty string", function() {
            it("should respect it", function() {
              var Derived = Value.extend({meta: {category: "Foo"}});

              expect(Derived.meta.category).toBe("Foo");
            });
          });
        }); // #category

        // ====

        describe("#helpUrl -", function() {
          describe("when not specified", function() {
            it("should inherit the base helpUrl", function() {
              function expectIt(spec) {
                var Derived = Value.extend({meta: spec});

                expect(Derived.meta.helpUrl).toBe(Value.meta.helpUrl);
              }

              expectIt({});
              expectIt({helpUrl: undefined});
            });
          });

          describe("when specified as `null` or an empty string -", function() {
            it("should set the helpUrl to `null`", function() {
              function expectIt(spec) {
                var Derived = Value.extend({meta: spec});

                expect(Derived.meta.helpUrl).toBe(null);
              }

              expectIt({helpUrl: null});
              expectIt({helpUrl: ""});
            });
          });

          describe("when specified as a non-empty string -", function() {
            it("should respect it", function() {
              var Derived = Value.extend({meta: {helpUrl: "Foo"}});

              expect(Derived.meta.helpUrl).toBe("Foo");
            });
          });
        }); // #helpUrl

        // ====

        describe("#uid -", function() {
          it("should not be inherited", function() {
            var Derived = Value.extend();
            expect(Derived.meta.uid).not.toBe(Value.meta.uid);
          });

          it("should be unique", function() {
            var DerivedA = Value.extend(),
                DerivedB = Value.extend();
            expect(DerivedA.meta.uid).not.toBe(DerivedB.meta.uid);
            expect(DerivedA.meta.uid).not.toBe(Value.meta.uid);
          });
        }); // #uid
      });

      // TODO: remaining properties: value, format, domain, abstract browsable, annotations...

    }); // .extend({...})

  });

});