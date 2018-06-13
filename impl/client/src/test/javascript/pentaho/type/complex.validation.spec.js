/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/Complex"
], function(Complex) {

  "use strict";

  describe("pentaho.type.Complex", function() {

    describe("#validate()", function() {

      it("should call each property's validateOn with the owner complex instance", function() {

        var Derived = Complex.extend({
          $type: {
            props: [
              {name: "x", valueType: "number"},
              {name: "y", valueType: "string"},
              {name: "z", valueType: "boolean"}
            ]
          }
        });

        var derived = new Derived({x: 5, y: "a", z: true});

        var xPropType = derived.$type.get("x");
        var yPropType = derived.$type.get("y");
        var zPropType = derived.$type.get("z");

        spyOn(xPropType, "validateOn");
        spyOn(yPropType, "validateOn");
        spyOn(zPropType, "validateOn");

        derived.validate();

        expect(xPropType.validateOn).toHaveBeenCalledWith(derived);
        expect(yPropType.validateOn).toHaveBeenCalledWith(derived);
        expect(zPropType.validateOn).toHaveBeenCalledWith(derived);
      });
    });
  });
});
