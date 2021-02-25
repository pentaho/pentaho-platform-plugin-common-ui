/*!
 * Copyright 2010 - 2021 Hitachi Vantara.  All rights reserved.
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
 *
 */
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

  describe("updateTimezoneFormat", function() {

    it("should return correctly formatted timezone", function() {
      expect( Util.updateTimezoneFormat( '+0500' ) ).toBe( '+05:00' );
      expect( Util.updateTimezoneFormat( '-0545' ) ).toBe( '-05:45' );
      expect( Util.updateTimezoneFormat( '+600' ) ).toBe( '+6:00' );
      expect( Util.updateTimezoneFormat( '+0000' ) ).toBe( '+00:00' );
      expect( Util.updateTimezoneFormat( '+00' ) ).toBe( '+00' );
    });
  });

});
