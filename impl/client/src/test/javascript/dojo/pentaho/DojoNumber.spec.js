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
  "dojo/number"
], function( DojoNumber ) {

  "use strict";

  /* global describe: false, it: false, expect: false */

  describe("Dojo i18n tests", function() {

    it("Number.parse(..) should accept default locale", function() {
      expect( DojoNumber.parse( "1234", {} ) ).toEqual( 1234 );
    });

    xit("Dojo Number.parse(..) should accept correct locale", function() {
      expect( DojoNumber.parse( "1,234", {"locale" : "en-us"} ) ).toEqual( 1234 );
    });
    
    // This is a known dojo issue
    // See BISERVER-13154
    it("Dojo Number.parse(..) should safely accept even incorrect locale", function() {
      //expect( DojoNumber.parse( "1234", {"locale" : "en_us"} ) ).toEqual( 1234 );
      expectParseTypeError("1234", {"locale" : "en_us"});
    });

    // This is a known dojo issue
    // See BISERVER-13154
    it("Dojo Number.parse(..) should safely accept even abracadabra locale", function() {
      //expect( DojoNumber.parse( "1234", {"locale" : "abracadabra"} ) ).toEqual( 1234 );
      expectParseTypeError("1234", {"locale" : "abracadabra"});
    });

  });

  function expectParseTypeError(string, options) {
    expect(function() {
      DojoNumber.parse(string, options);
    }).toThrowError( TypeError );
  }

});
