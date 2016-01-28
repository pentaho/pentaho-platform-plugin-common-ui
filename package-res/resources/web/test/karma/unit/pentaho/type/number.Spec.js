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
define([
  "pentaho/type/number",
  "pentaho/type/Context",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function (numberFactory, Context, bundle) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho/type/number -", function () {
    it("is a function", function () {
      expect(typeof numberFactory).toBe("function");
    });

    describe("new number()", function () {
      var PentahoNumber;
      beforeEach(function () {
        PentahoNumber = numberFactory(new Context());
      });
      it("should return an object", function () {
        expect(typeof new PentahoNumber(1)).toBe("object");
      });
      it("should return a function", function () {
        expect(typeof PentahoNumber).toBe("function");
      });
      it("should return 1", function () {
        expect(new PentahoNumber(1).value).toBe(1);
      });
      it("should return 1", function () {
        expect(new PentahoNumber('1').value).toBe(1);
      });
      it("should throw", function () {
        expect(function () {
          new PentahoNumber('one').value
        }).toThrowError(bundle.format(bundle.structured.errors.value.cannotConvertToType, ['Number']));
      });
    });
  }); // pentaho/type/number
});