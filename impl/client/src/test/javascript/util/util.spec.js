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

define([ "common-ui/util/util" ], function( Util ) {

  describe("util", function() {

    describe("normalizeDojoLocale", function() {
		
      it("should return correctly formatted locale", function() {
        expect( Util.normalizeDojoLocale( 'en' ) ).toBe( 'en' );
        expect( Util.normalizeDojoLocale( 'EN' ) ).toBe( 'en' );
        expect( Util.normalizeDojoLocale( 'en-us' ) ).toBe( 'en-us' );
        expect( Util.normalizeDojoLocale( 'en-US' ) ).toBe( 'en-us' );
        expect( Util.normalizeDojoLocale( 'xy-zt' ) ).toBe( 'xy-zt' );
        expect( Util.normalizeDojoLocale( 'XY-ZT' ) ).toBe( 'xy-zt' );
        expect( Util.normalizeDojoLocale( 'XY_ZT' ) ).toBe( 'xy-zt' );
        expect( Util.normalizeDojoLocale( 'XY-ZT-UV' ) ).toBe( 'xy-zt-uv' );
        expect( Util.normalizeDojoLocale( 'XY-ZT_UV' ) ).toBe( 'xy-zt-uv' );
        expect( Util.normalizeDojoLocale( 'XY_ZT-UV' ) ).toBe( 'xy-zt-uv' );
        expect( Util.normalizeDojoLocale( 'XY_ZT_UV' ) ).toBe( 'xy-zt-uv' );
        expect( Util.normalizeDojoLocale( 'xy_zt_uv' ) ).toBe( 'xy-zt-uv' );
        expect( Util.normalizeDojoLocale( '' ) ).toBe( 'en' );
        expect( Util.normalizeDojoLocale( 'x' ) ).toBe( 'en' );
        expect( Util.normalizeDojoLocale( 'xyz' ) ).toBe( 'en' );
        expect( Util.normalizeDojoLocale( '-xy' ) ).toBe( 'en' );
        expect( Util.normalizeDojoLocale( 'xy-' ) ).toBe( 'en' );
        expect( Util.normalizeDojoLocale( 'xy-z' ) ).toBe( 'en' );
        expect( Util.normalizeDojoLocale( 'xy-zt-' ) ).toBe( 'en' );
      });
    });
  });

  describe("convertTimezoneToStandardFormat", function() {

    it("should return correctly formatted timezone", function() {
      expect( Util.convertTimezoneToStandardFormat( '+0500' ) ).toBe( '+05:00' );
      expect( Util.convertTimezoneToStandardFormat( '-0545' ) ).toBe( '-05:45' );
      expect( Util.convertTimezoneToStandardFormat( '+600' ) ).toBe( '+6:00' );
      expect( Util.convertTimezoneToStandardFormat( '+0000' ) ).toBe( '+00:00' );
      expect( Util.convertTimezoneToStandardFormat( '+00:00' ) ).toBe( '+00:00' );
      expect( Util.convertTimezoneToStandardFormat( '+00' ) ).toBe( '+00' );
      expect( Util.convertTimezoneToStandardFormat( '+00567' ) ).toBe( '+00567' );
      expect( Util.convertTimezoneToStandardFormat( 'something' ) ).toBe( 'something' );
      expect( Util.convertTimezoneToStandardFormat( '2020-11-01T00:00:00.000' ) ).toBe( '2020-11-01T00:00:00.000' );
      expect( Util.convertTimezoneToStandardFormat( '2020-11-01T00:00:00.000-0700' ) ).toBe( '2020-11-01T00:00:00.000-07:00' );
      expect( Util.convertTimezoneToStandardFormat( '2020-11-01T00:00:00.000+600' ) ).toBe( '2020-11-01T00:00:00.000+6:00' );
      expect( Util.convertTimezoneToStandardFormat( '2020-11-01T00:00:00.000+07456' ) ).toBe( '2020-11-01T00:00:00.000+07456' );
      expect( Util.convertTimezoneToStandardFormat( '2020-11-01T00:00:00.0000700' ) ).toBe( '2020-11-01T00:00:00.0000700' );
      expect( Util.convertTimezoneToStandardFormat( '2020-11-01T00:00:00.000+07:30' ) ).toBe( '2020-11-01T00:00:00.000+07:30' );
    });
  });

});
