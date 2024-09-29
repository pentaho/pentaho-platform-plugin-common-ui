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
  "common-ui/vizapi/VizController"
], function() {

  describe("VizController", function() {

    describe("getRgbGradientFromMultiColorHex", function() {

      it("should return a proper color from gradient by value", function() {
        var min = 10;
        var max = 100;
        var colors = ["#FF0000","#FFBF3F","#FFFF00","#BFDF3F","#008000"];

        expect( pentaho.VizController.getRgbGradientFromMultiColorHex( 10, min, max, colors ) ).toBe( "RGB(255,0,0)" );
        expect( pentaho.VizController.getRgbGradientFromMultiColorHex( 11, min, max, colors ) ).toBe( "RGB(255,8,2)" );
        expect( pentaho.VizController.getRgbGradientFromMultiColorHex( 20, min, max, colors ) ).toBe( "RGB(255,84,28)" );
        expect( pentaho.VizController.getRgbGradientFromMultiColorHex( 50, min, max, colors ) ).toBe( "RGB(255,240,14)" );
        expect( pentaho.VizController.getRgbGradientFromMultiColorHex( 51, min, max, colors ) ).toBe( "RGB(255,243,11)" );
        expect( pentaho.VizController.getRgbGradientFromMultiColorHex( 99, min, max, colors ) ).toBe( "RGB(8,132,2)" );
        expect( pentaho.VizController.getRgbGradientFromMultiColorHex( 100, min, max, colors ) ).toBe( "RGB(0,128,0)" );
      });
    });
  });
});
