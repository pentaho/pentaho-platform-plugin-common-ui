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
  "pentaho/type/Value",
  "pentaho/type/Element",
  "pentaho/type/Number",
  "pentaho/type/Complex"
], function(Value, Element, PentahoNumber, Complex) {

  "use strict";

  describe("pentaho.type.Element -", function() {

    var ComplexEntity;
    var ComplexNonEntity;
    var ComplexNonEntityReadOnly;

    beforeAll(function() {

      ComplexEntity = Complex.extend({
        get $key() {
          return this.name;
        },
        $type: {
          isEntity: true,
          props: [
            "name",
            {name: "age", valueType: PentahoNumber}
          ]
        }
      });

      ComplexNonEntity = Complex.extend({
        $type: {
          props: [
            "name", {name: "age", valueType: PentahoNumber}
          ]
        }
      });

      ComplexNonEntityReadOnly = Complex.extend({
        $type: {
          isReadOnly: true,
          props: [
            "name", {name: "age", valueType: PentahoNumber}
          ]
        }
      });
    });

    it("should be a function", function() {
      expect(typeof Element).toBe("function");
    });

    it("should be a sub-class of `Value`", function() {
      expect(Element.prototype instanceof Value).toBe(true);
    });

    // region compare
    describe("compare(other)", function() {

      it("should return 1 if other is nully", function() {

        expect(new Element().compare(null)).toBe(1);
        expect(new Element().compare(undefined)).toBe(1);
      });

      it("should return 0 if other is identical to this", function() {
        var instance = new Element();
        var other = instance;
        expect(instance.compare(other)).toBe(0);
      });

      it("should return 0 if other has a different constructor than this", function() {
        var instance = new Element();

        var Element2 = Element.extend();
        var other = new Element2();

        expect(instance.compare(other)).toBe(0);
      });

      it("should return 0 if other is equals to this", function() {

        var instance = new Element();

        spyOn(instance, "_equals").and.returnValue(true);

        var other = new Element();

        expect(instance.compare(other)).toBe(0);
      });

      it("should delegate to _compare if other is distinct has the same constructor and is not equal", function() {

        var instance = new Element();

        spyOn(instance, "_equals").and.returnValue(false);
        spyOn(instance, "_compare").and.returnValue(-1);

        var other = new Element();

        expect(instance.compare(other)).toBe(-1);

        expect(instance._compare).toHaveBeenCalledWith(other);
      });
    });

    describe("_compare(other)", function() {

      it("should sort according to the elements' $key lexicographically", function() {
        var first = new Element();
        var second = new Element();

        var spyFirst = spyOnProperty(first, "$key", "get").and.returnValue(1);
        var spySecond = spyOnProperty(second, "$key", "get").and.returnValue(2);
        expect(first._compare(second)).toBe(-1);

        // ---

        spyFirst.and.returnValue("10");
        spySecond.and.returnValue("2");
        expect(first._compare(second)).toBe(-1);

        // ---

        spyFirst.and.returnValue("B");
        spySecond.and.returnValue("A");
        expect(first._compare(second)).toBe(1);
      });
    });
    // endregion

    // region configureOrCreate
    describe("#configureOrCreate(config)", function() {

      it("should call #_configureOrCreate if config is non-nully", function() {
        var va = new Element();

        spyOn(va, "_configureOrCreate");

        va.configureOrCreate({});

        expect(va._configureOrCreate).toHaveBeenCalled();
      });

      it("should call #_configureOrCreate with the given non-nully config", function() {
        var va = new Element();
        var config = {};
        spyOn(va, "_configureOrCreate");

        va.configureOrCreate(config);

        expect(va._configureOrCreate).toHaveBeenCalledWith(config);
      });

      it("should not call #_configureOrCreate if the given config is nully", function() {
        var va = new Element();
        spyOn(va, "_configureOrCreate");

        var config = null;
        va.configureOrCreate(config);
        expect(va._configureOrCreate).not.toHaveBeenCalled();

        config = undefined;
        va.configure(config);
        expect(va._configureOrCreate).not.toHaveBeenCalled();
      });

      it("should not call #_configureOrCreate if the given config is this", function() {
        var va = new Element();
        spyOn(va, "_configureOrCreate");

        var config = va;
        va.configureOrCreate(config);
        expect(va._configureOrCreate).not.toHaveBeenCalled();
      });

      it("should return what _configureOrCreate returns", function() {
        var va = new Element();

        var result = {};

        spyOn(va, "_configureOrCreate").and.returnValue(result);

        expect(va.configureOrCreate({})).toBe(result);
      });
    });

    describe("#_configureOrCreate(config)", function() {

      describe("when config is a Value", function() {

        describe("when the value type is isEntity", function() {

          describe("when config does not equals value", function() {

            it("should return config", function() {

              var value = new PentahoNumber(1);
              var config = new PentahoNumber(2);

              spyOn(value, "equals").and.returnValue(false);

              var result = value.configureOrCreate(config);

              expect(result).toBe(config);
            });
          });

          describe("when config equals value", function() {

            describe("when value type is read-only", function() {

              it("should return config if not content-equals value", function() {

                var value = new PentahoNumber(2);
                var config = new PentahoNumber(2);

                spyOn(value, "equals").and.returnValue(true);
                spyOn(value, "equalsContent").and.returnValue(false);

                var result = value.configureOrCreate(config);

                expect(result).toBe(config);
              });

              it("should return value if config content-equals value", function() {

                var value = new PentahoNumber(2);
                var config = new PentahoNumber(2);

                spyOn(value, "equals").and.returnValue(true);
                spyOn(value, "equalsContent").and.returnValue(true);

                var result = value.configureOrCreate(config);

                expect(result).toBe(value);
              });
            });

            describe("when value type is not read-only", function() {

              it("should call _configure and return value (even when content-equals)", function() {

                var value = new ComplexEntity({name: "John", age: 20});
                var config = new ComplexEntity({name: "John", age: 20});

                spyOn(value, "equals").and.returnValue(true);
                spyOn(value, "equalsContent").and.returnValue(true);

                spyOn(value, "_configure");

                var result = value.configureOrCreate(config);

                expect(value._configure).toHaveBeenCalledWith(config);
                expect(result).toBe(value);
              });

              it("should call _configure (even when not content-equals)", function() {

                var value = new ComplexEntity({name: "John", age: 20});
                var config = new ComplexEntity({name: "John", age: 30});

                spyOn(value, "equals").and.returnValue(true);
                spyOn(value, "equalsContent").and.returnValue(false);

                spyOn(value, "_configure");

                var result = value.configureOrCreate(config);

                expect(value._configure).toHaveBeenCalledWith(config);
                expect(result).toBe(value);
              });
            });
          });
        });

        describe("when the value type is not isEntity", function() {

          describe("when config does not have the same constructor as value", function() {

            it("should return config", function() {

              var value = new ComplexNonEntity();
              var config = new PentahoNumber(1);

              var result = value.configureOrCreate(config);

              expect(result).toBe(config);
            });
          });

          describe("when config has the same constructor as value", function() {

            describe("when value type is read-only", function() {

              it("should return config if not content-equals value", function() {

                var value = new ComplexNonEntityReadOnly({name: "John"});
                var config = new ComplexNonEntityReadOnly({name: "Sophia"});

                spyOn(value, "equalsContent").and.returnValue(false);

                var result = value.configureOrCreate(config);

                expect(result).toBe(config);
              });

              it("should return value if config content-equals value", function() {

                var value = new ComplexNonEntityReadOnly({name: "John"});
                var config = new ComplexNonEntityReadOnly({name: "John"});

                spyOn(value, "equalsContent").and.returnValue(true);

                var result = value.configureOrCreate(config);

                expect(result).toBe(value);
              });
            });

            describe("when value type is not read-only", function() {

              it("should call _configure and return value (even when content-equals)", function() {

                var value = new ComplexNonEntity({name: "John", age: 20});
                var config = new ComplexNonEntity({name: "John", age: 20});

                spyOn(value, "equalsContent").and.returnValue(true);

                spyOn(value, "_configure");

                var result = value.configureOrCreate(config);

                expect(value._configure).toHaveBeenCalledWith(config);
                expect(result).toBe(value);
              });

              it("should call _configure (even when not content-equals)", function() {

                var value = new ComplexNonEntity({name: "John", age: 20});
                var config = new ComplexNonEntity({name: "John", age: 30});

                spyOn(value, "equalsContent").and.returnValue(true);

                spyOn(value, "_configure");

                var result = value.configureOrCreate(config);

                expect(value._configure).toHaveBeenCalledWith(config);
                expect(result).toBe(value);
              });
            });
          });
        });
      });

      describe("when config is a specification", function() {

        it("should normalize the specification with value type", function() {

          var value = new Element();
          var config = {};

          spyOn(Element.type, "_normalizeInstanceSpec").and.callThrough();
          spyOn(value, "_configure");

          value.configureOrCreate(config);

          expect(Element.type._normalizeInstanceSpec).toHaveBeenCalledWith(config);
        });

        it("should use the normalized specification", function() {

          var value = new Element();
          var config = {};
          var normalizedConfig = {};
          spyOn(Element.type, "_normalizeInstanceSpec").and.returnValue(normalizedConfig);
          spyOn(value, "_configure");

          value.configureOrCreate(config);

          expect(value._configure).toHaveBeenCalledWith(normalizedConfig);
        });

        describe("when config has an inline type", function() {

          it("should create and return a config whose inline type is different from value type", function() {

            var value = new Element();
            var config = {_: "number", v: 1};

            var result = value.configureOrCreate(config);

            expect(result).not.toBe(value);
            expect(result instanceof PentahoNumber).toBe(true);
            expect(result.$type).toBe(PentahoNumber.type);
            expect(result.value).toBe(1);
          });

          it("should not create a config whose inline type is the same as value type", function() {

            var value = new Element();
            var config = {_: "element"};

            spyOn(value, "_configure");

            value.configureOrCreate(config);

            expect(value._configure).toHaveBeenCalledWith(config);
          });
        });

        describe("when the value type is isEntity", function() {

          describe("when config has key data", function() {

            it("should create the config and check if it equals value", function() {

              var value = new ComplexEntity();
              var config = {};

              spyOn(ComplexEntity.type, "hasNormalizedInstanceSpecKeyData").and.returnValue(true);
              spyOn(value, "equals").and.returnValue(false);

              value.configureOrCreate(config);

              expect(value.equals).toHaveBeenCalled();
            });

            describe("when the created config does not equals value", function() {

              it("should return the created config of type equal to value type", function() {

                var value = new ComplexEntity({name: "John", age: 10});
                var config = {name: "Sophia", age: 11};

                spyOn(ComplexEntity.type, "hasNormalizedInstanceSpecKeyData").and.returnValue(true);
                spyOn(value, "equals").and.returnValue(false);

                var result = value.configureOrCreate(config);

                expect(result).not.toBe(value);
                expect(result instanceof ComplexEntity).toBe(true);
                expect(result.name).toBe(config.name);
                expect(result.age).toBe(config.age);
              });
            });

            describe("when the created config equals value", function() {

              it("should go through and call _configure", function() {

                var value = new ComplexEntity({name: "John", age: 10});
                var config = {name: "Sophia", age: 11};

                spyOn(ComplexEntity.type, "hasNormalizedInstanceSpecKeyData").and.returnValue(true);
                spyOn(value, "equals").and.returnValue(true);
                spyOn(value, "_configure");

                var result = value.configureOrCreate(config);

                expect(result).toBe(value);
                expect(value._configure).toHaveBeenCalledWith(config);
              });
            });
          });

          describe("when config has no key data", function() {

            it("should go through and call _configure", function() {

              var value = new ComplexEntity({name: "John", age: 10});
              var config = {name: "Sophia", age: 11};

              spyOn(ComplexEntity.type, "hasNormalizedInstanceSpecKeyData").and.returnValue(false);
              spyOn(value, "_configure");

              var result = value.configureOrCreate(config);

              expect(result).toBe(value);
              expect(value._configure).toHaveBeenCalledWith(config);
            });
          });
        });

        describe("when the value type is read-only", function() {

          it("should call value type createLike with value and config", function() {

            var value = new ComplexNonEntityReadOnly();
            var config = {};

            spyOn(ComplexNonEntityReadOnly.type, "createLike");
            spyOn(value, "equalsContent").and.returnValue(true);

            value.configureOrCreate(config);

            expect(ComplexNonEntityReadOnly.type.createLike).toHaveBeenCalledWith(value, config);
          });

          describe("when the created config is equalsContent with value", function() {

            it("should return value", function() {

              var value = new ComplexNonEntityReadOnly();
              var config = {};

              spyOn(ComplexNonEntityReadOnly.type, "createLike");
              spyOn(value, "equalsContent").and.returnValue(true);

              var result = value.configureOrCreate(config);

              expect(result).toBe(value);
            });
          });

          describe("when the created config is not equalsContent with value", function() {

            it("should return the created config", function() {

              var value = new ComplexNonEntityReadOnly();
              var config = {};
              var created = new ComplexNonEntityReadOnly();

              spyOn(ComplexNonEntityReadOnly.type, "createLike").and.returnValue(created);
              spyOn(value, "equalsContent").and.returnValue(false);

              var result = value.configureOrCreate(config);

              expect(result).toBe(created);
            });
          });
        });

        describe("when the value type is not read-only", function() {

          it("should go through and call _configure", function() {

            var value = new Element();
            var config = {};

            spyOn(value, "_configure");

            var result = value.configureOrCreate(config);

            expect(value._configure).toHaveBeenCalledWith(config);
            expect(result).toBe(value);
          });
        });
      });
    }); // end #_configureOrCreate
    // endregion

    describe("Type -", function() {

      var ElemType;

      beforeAll(function() {
        ElemType = Element.Type;
      });

      it("should be a function", function() {
        expect(typeof ElemType).toBe("function");
      });

      it("should be a sub-class of `ValueType`", function() {
        expect(ElemType.prototype instanceof Value.Type).toBe(true);
      });

      describe("#isElement", function() {

        it("should return the value `true`", function() {
          expect(Element.type.isElement).toBe(true);
        });
      });

      describe("#compareElements(va, vb)", function() {

        it("should return 0 if both are nully", function() {

          expect(Element.type.compareElements(null, null)).toBe(0);
          expect(Element.type.compareElements(null, undefined)).toBe(0);
          expect(Element.type.compareElements(undefined, null)).toBe(0);
          expect(Element.type.compareElements(undefined, undefined)).toBe(0);
        });

        it("should return -1 if the first is nully and the second not", function() {

          expect(Element.type.compareElements(null, new Element())).toBe(-1);
          expect(Element.type.compareElements(undefined, new Element())).toBe(-1);
        });

        it("should delegate to the first value's compare method, " +
            "if the first is not nully but the second is", function() {
          var first = new Element();
          var second = null;

          spyOn(first, "compare").and.returnValue(1);

          var result = Element.type.compareElements(first, second);

          expect(result).toBe(1);

          expect(first.compare).toHaveBeenCalledWith(second);
        });

        it("should delegate to the first value's compare method, if both are not nully", function() {
          var first = new Element();
          var second = new Element();

          spyOn(first, "compare").and.returnValue(1);

          var result = Element.type.compareElements(first, second);

          expect(result).toBe(1);

          expect(first.compare).toHaveBeenCalledWith(second);
        });
      });

      describe("#createLike(value, config)", function() {

        it("should create another value of the same type and with the configuration applied", function() {

          var value = new ComplexEntity({name: "John", age: 12});
          var config = {age: 10};

          var result = Element.type.createLike(value, config);

          expect(result).not.toBe(value);
          expect(result).not.toBe(config);
          expect(result instanceof ComplexEntity).toBe(true);
          expect(result.age).toBe(10);
        });
      });

      // TODO: format
    });
  });
});
