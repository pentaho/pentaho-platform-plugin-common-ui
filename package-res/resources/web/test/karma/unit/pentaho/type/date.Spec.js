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
  "pentaho/type/date",
  "pentaho/type/Context",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function (dateFactory, Context, bundle) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Date -", function () {

    it("is a function", function () {
      expect(typeof dateFactory).toBe("function");
    });

    describe("new Date()", function () {
      var PentahoDate;

      beforeEach(function () {
        PentahoDate = dateFactory(new Context());
      });

      it("should be a function", function () {
        expect(typeof PentahoDate).toBe("function");
      });

      it("should return an object", function () {
        expect(typeof new PentahoDate(new Date())).toBe("object");
      });

      it("should accept a javascript Date()", function () {
        var today =  new Date();
        expect(new PentahoDate(today).value).toBe(today);
      });

      it("should accept an ISO string", function () {
        var testDate = new Date("1960-01-25");
        expect(new PentahoDate(testDate.toISOString()).value.toString()).toBe(testDate.toString());
      });

      it("should not accept nothing", function () {
        expect(function () {
          new PentahoDate()
        }).toThrowError(bundle.structured.errors.value.isNull);
      });

      it("should not accept null", function () {
        expect(function () {
          new PentahoDate(null)
        }).toThrowError(bundle.structured.errors.value.isNull);
      });

      it("should not accept undefined", function () {
        expect(function () {
          new PentahoDate(undefined)
        }).toThrowError(bundle.structured.errors.value.isNull);
      });
    });
  }); // pentaho.type.Date
});
