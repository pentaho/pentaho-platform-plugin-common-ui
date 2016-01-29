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

  /*global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  var context = new Context();
  var Value = context.get("pentaho/type/value");
  var Complex = context.get("pentaho/type/complex");

  describe("pentaho/type/complex - Validation -", function() {
    var Derived;

    beforeEach(function() {
      Derived = Complex.extend({
        meta: {
          label: "Derived",
          props: [
            "x",
            "y",
            "z"
          ]
        }
      });
    });

    describe("this.validate()", function() {
      it("should return null", function() {
        var derived = new Derived();
        expect(derived.validate()).toBe(null);
      });

      it("should call validate of its instanciated properties", function() {
        var derived = new Derived({x: 5, y: 2, z: 4});

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
    });// end #validate

    describe("Complex.validate(value)", function() {
      it("should return errors when given an invalid `Value`", function() {
        expect(Complex.meta.validate(new Value())).not.toBe(null);
      });

      it("should return `null` when given a subclass", function() {
        expect(Complex.meta.validate(new Derived())).toBe(null);
      });
    });// end #validate
  }); // pentaho/type/complex
});
