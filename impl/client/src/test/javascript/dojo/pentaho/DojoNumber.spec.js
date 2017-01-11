/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
define([
  "dojo/number",
  "dojo/i18n!dojo/cldr/nls/number"
], function( DojoNumber ) {

  "use strict";

  /* global describe: false, it: false, expect: false */

  describe("Dojo i18n tests", function() {

    it("Number.parse(..) should accept default locale", function() {
      expect( DojoNumber.parse( "1234", {} ) ).toEqual( 1234 );
    });

    // Must include i18n resource in the test require dependencies to avoid TypeError when parsing the string
    it("Dojo Number.parse(..) should accept correct locale", function() {
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
