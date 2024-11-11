/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

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
