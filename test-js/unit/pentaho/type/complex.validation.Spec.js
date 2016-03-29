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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  var context = new Context();
  var Complex = context.get("pentaho/type/complex");

  describe("pentaho.type.Complex", function() {

    describe("#validate()", function() {
      it("should call each property's validate with the owner complex instance", function() {
        var Derived = Complex.extend({
          type: {
            props: [
              {name: "x", type: "number" },
              {name: "y", type: "string" },
              {name: "z", type: "boolean"}
            ]
          }
        });

        var derived = new Derived({x: 5, y: "a", z: true});

        var xPropType = derived.type.get("x");
        var yPropType = derived.type.get("y");
        var zPropType = derived.type.get("z");

        spyOn(xPropType, "validate");
        spyOn(yPropType, "validate");
        spyOn(zPropType, "validate");

        derived.validate();

        expect(xPropType.validate).toHaveBeenCalledWith(derived);
        expect(yPropType.validate).toHaveBeenCalledWith(derived);
        expect(zPropType.validate).toHaveBeenCalledWith(derived);
      });

    });
  }); // pentaho.type.Complex
});
