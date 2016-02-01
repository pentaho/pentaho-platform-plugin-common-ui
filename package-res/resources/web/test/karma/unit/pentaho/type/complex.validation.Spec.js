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
  "pentaho/type/Property",
  "pentaho/type/PropertyMetaCollection",
  "pentaho/util/error"
], function(Context) {
  "use strict";

  /* global describe:false, it:false, expect:false, spyOn:false */

  var context = new Context();
  var Value = context.get("pentaho/type/value");
  var Complex = context.get("pentaho/type/complex");

  describe("pentaho/type/complex - Validation -", function() {
    var Derived = Complex.extend({
      meta: {
        label: "Derived",
        props: [
          {name: "x", type: "string", required: true},
          {name: "y", type: ["string"], countMin: 2},
          {name: "z", type: ["string"], countMin: 1, countMax: 2}
        ]
      }
    });

    describe("this.validate()", function() {
      it("should return null", function() {
        var derived = new Derived({x: "1", y: ["1", "2", "3"], z: ["1", "2"]});
        expect(derived.validate()).toBe(null);
      });

      it("should call validate of its instanciated properties", function() {
        var derived = new Derived({x: "1", y: ["1", "2", "3"], z: ["1", "2"]});

        var x = derived.get("x");
        spyOn(x, "validate");
        var y = derived.get("y");
        spyOn(y, "validate");
        var z = derived.get("z");
        spyOn(z, "validate");

        derived.validate();

        expect(x.validate).toHaveBeenCalled();
        expect(y.validate).toHaveBeenCalled();
        expect(z.validate).toHaveBeenCalled();
      });

      it("should return one error if missing required property", function() {
        var derived = new Derived({y: ["1", "2", "3"], z: ["1", "2"]});
        expect(derived.validate().length).toBe(1);
      });

      it("should return one error if nully required property", function() {
        var derived = new Derived({x: null, y: ["1", "2", "3"], z: ["1", "2"]});
        expect(derived.validate().length).toBe(1);
      });

      it("should return one error if countMin isn't respected", function() {
        var derived = new Derived({x: "1", y: ["1"], z: ["1", "2"]});
        expect(derived.validate().length).toBe(1);
      });

      it("should return one error if countMax isn't respected", function() {
        var derived = new Derived({x: "1", y: ["1", "2", "3"], z: ["1", "2", "3"]});
        expect(derived.validate().length).toBe(1);
      });

      it("should aggregate three errors", function() {
        var derived = new Derived({y: ["1"], z: ["1", "2", "3"]});

        expect(derived.validate().length).toBe(3);
      });
    });// end #validate

    describe("Complex.validate(value)", function() {
      it("should return errors when given an invalid `Value`", function() {
        expect(Complex.meta.validate(new Value())).not.toBe(null);
      });

      it("should return `null` when given a subclass", function() {
        expect(Complex.meta.validate(new Derived({x: "1", y: ["1", "2", "3"], z: ["1", "2"]}))).toBe(null);
      });
    });// end #validate
  }); // pentaho/type/complex
});
