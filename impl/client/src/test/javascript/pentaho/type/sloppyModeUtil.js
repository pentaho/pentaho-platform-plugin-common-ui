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

define(function() {
  "use strict";

  /* global it:false, expect:false*/

  return {
    itShouldBehaveStrictlyUnlessSloppyIsTrue: itShouldBehaveStrictlyUnlessSloppyIsTrue,
    itShouldReturnValueWhateverTheSloppyValue: itShouldReturnValueWhateverTheSloppyValue,
    itShouldThrowWhateverTheSloppyValue: itShouldThrowWhateverTheSloppyValue
  };

  function itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, args, sloppyResult, strictError) {

    it("should throw when sloppy is unspecified, false, null or undefined", function() {
      expect(function() { getter(args); }).toThrow(strictError);

      function expectIt(sloppy) {
        expect(function() { getter(args.concat(sloppy)); }).toThrow(strictError);
      }

      expectIt(false);
      expectIt(null);
      expectIt(undefined);
    });

    it("should return `" + sloppyResult + "` when sloppy is true", function() {
      var sloppy = true;
      expect(getter(args.concat(sloppy))).toBe(sloppyResult);
    });
  }

  function itShouldReturnValueWhateverTheSloppyValue(getter, args, result) {

    it("should return `" + result + "` when sloppy is unspecified or has any other value", function() {
      expect(getter(args)).toBe(result);

      function expectIt(sloppy) {
        expect(getter(args.concat(sloppy))).toBe(result);
      }

      expectIt(false);
      expectIt(null);
      expectIt(undefined);
      expectIt(true);
    });
  }

  function itShouldThrowWhateverTheSloppyValue(getter, args, strictError) {

    it("should throw when sloppy is unspecified or has any other value", function() {
      expect(function() { getter(args); }).toThrow(strictError);

      function expectIt(sloppy) {
        expect(function() { getter(args.concat(sloppy)); }).toThrow(strictError);
      }

      expectIt(false);
      expectIt(null);
      expectIt(undefined);
      expectIt(true);
    });
  }
});
