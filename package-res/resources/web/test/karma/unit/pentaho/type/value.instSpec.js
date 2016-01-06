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
  "pentaho/type/value"
], function(Value) {
  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  xdescribe("pentaho/type/value -", function() {
    // Although Value is abstract, we want to test the part that it implements.
    // So whenever needed, a class is derived from it.

    describe("new({...}) -", function() {
      it("returns an instance of `Value`", function() {
        var Derived = Value.extend(),
            derived = new Derived();

        expect(derived instanceof Derived).toBe(true);
      });

      it("returns an instance whose attributes' values are the class defaults", function() {
        var Derived = Value.extend({
              id: "my/derived",
              label: "Derived"
            }),
            derived = new Derived();

        expect(derived.id).toBe("my/derived");
        expect(derived.label).toBe("Derived");
      });

      describe("#label -", function() {
        describe("when set to a falsy value", function() {
          it("should restore the class default value", function() {
            function expectIt(label) {

              var Derived = Value.extend({
                  label: "Derived"
                }),
                derived = new Derived();

              derived.label = "MyDerived";

              expect(derived.label).toBe("MyDerived");

              derived.label = label;

              expect(derived.label).toBe("Derived");
            }

            expectIt(undefined);
            expectIt(null);
            expectIt("");
          });
        });

        describe("when set to a truthy value", function() {
          it("should respect it", function() {
            var Derived = Value.extend({
                  label: "Derived"
                }),
                derived = new Derived();

            expect(derived.label).toBe("Derived");

            derived.label = "MyDerived";

            expect(derived.label).toBe("MyDerived");
          });
        });
      }); // #label

      // ====

      describe("#description -", function() {
        describe("when specified as a non-empty string -", function() {
          it("should respect it", function() {
            var Derived = Value.extend({
                  description: "Hello"
                }),
                derived = new Derived();

            derived.description = "There";

            expect(derived.description).toBe("There");
          });
        });

        describe("when set to `undefined`", function() {
          it("should inherit the class default", function() {
            var Derived = Value.extend({
                  description: "Hello"
                }),
                derived = new Derived();

            expect(derived.description).toBe(Derived.prototype.description);

            derived.description = "There";

            expect(derived.description).toBe("There");

            derived.description = undefined;

            expect(derived.description).toBe(Derived.prototype.description);
          });
        });

        describe("when set to `null` or an empty string -", function() {
          it("should set to `null`", function() {
            var Derived = Value.extend({
                  description: "Hello"
                });

            function expectIt(value) {
              var derived = new Derived();
              derived.description = value;
              expect(derived.description).toBe(null);
            }

            expect(null);
            expect("");
          });
        });
      }); // #description

      // ====

      describe("#category -", function() {
        describe("when specified as a non-empty string -", function() {
          it("should respect it", function() {
            var Derived = Value.extend({
                  category: "Hello"
                }),
                derived = new Derived();

            derived.category = "There";

            expect(derived.category).toBe("There");
          });
        });

        describe("when set to `undefined`", function() {
          it("should inherit the class default", function() {
            var Derived = Value.extend({
                  category: "Hello"
                }),
                derived = new Derived();

            expect(derived.category).toBe(Derived.prototype.category);

            derived.category = "There";

            expect(derived.category).toBe("There");

            derived.category = undefined;

            expect(derived.category).toBe(Derived.prototype.category);
          });
        });

        describe("when set to `null` or an empty string -", function() {
          it("should set to `null`", function() {
            var Derived = Value.extend({
                  category: "Hello"
                });

            function expectIt(value) {
              var derived = new Derived();
              derived.category = value;
              expect(derived.category).toBe(null);
            }

            expectIt(null);
            expectIt("");
          });
        });
      }); // #category

      // ====

      describe("#helpUrl -", function() {
        describe("when specified as a non-empty string -", function() {
          it("should respect it", function() {
            var Derived = Value.extend({
                  helpUrl: "Hello"
                }),
                derived = new Derived();

            derived.helpUrl = "There";

            expect(derived.helpUrl).toBe("There");
          });
        });

        describe("when set to `undefined`", function() {
          it("should inherit the class default", function() {
            var Derived = Value.extend({
                  helpUrl: "Hello"
                }),
                derived = new Derived();

            expect(derived.helpUrl).toBe(Derived.prototype.helpUrl);

            derived.helpUrl = "There";

            expect(derived.helpUrl).toBe("There");

            derived.helpUrl = undefined;

            expect(derived.helpUrl).toBe(Derived.prototype.helpUrl);
          });
        });

        describe("when set to `null` or an empty string -", function() {
          it("should set to `null`", function() {
            var Derived = Value.extend({
                  helpUrl: "Hello"
                });

            function expectIt(value) {
              var derived = new Derived();
              derived.helpUrl = value;
              expect(derived.helpUrl).toBe(null);
            }

            expectIt(null);
            expectIt("");
          });
        });
      }); // #helpUrl

      // =====

      // TODO: remaining ppoperties: defaultValue, format, domain, ...
      // TODO: methods: isEmpty, getKey, ...

    });
  });

});