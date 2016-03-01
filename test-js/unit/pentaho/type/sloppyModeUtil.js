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
 */
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
