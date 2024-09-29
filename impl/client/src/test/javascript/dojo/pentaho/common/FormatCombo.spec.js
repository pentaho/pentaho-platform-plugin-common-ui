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

define( ["pentaho/common/FormatCombo"], function( FormatCombo ) {

  describe( "Format Combo tests", function() {

    it( "should set proper values when using constructor", function() {
      var fc = new FormatCombo( { name: "test name", dataType: "numeric" } );
      expect( fc.dataType).toEqual( "numeric" );
      expect( fc.baseClass).toContain( "pentahoFormatCombo" );
      expect( fc.query ).toEqual( { type: "numeric" } );
      expect( fc.name).toEqual( "test name" );
      expect( fc.store.data.length).toBeGreaterThan(0);

      fc.setDataType("date");
      expect( fc.dataType ).toEqual( "date" );
      expect( fc.query ).toEqual( { type: "date" } )
    } );

    it( "should set accept formats as part of the constructor that override defaults", function() {
      var fc = new FormatCombo( { name: "test name", dataType: "numeric", formats: [ { name: "one", type: "numeric" } ] } );
      expect( fc.dataType).toEqual( "numeric" );
      expect( fc.baseClass).toContain( "pentahoFormatCombo" );
      expect( fc.query ).toEqual( { type: "numeric" } );
      expect( fc.name).toEqual( "test name" );
      expect( fc.store.data.length).toEqual(1);

      fc.setDataType("date");
      expect( fc.dataType ).toEqual( "date" );
      expect( fc.query ).toEqual( { type: "date" } )
    } );

  } );

} );
