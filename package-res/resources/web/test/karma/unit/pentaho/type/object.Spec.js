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
    "pentaho/type/object",
    "pentaho/type/Context",
    "pentaho/i18n!/pentaho/type/i18n/types"
], function(objectFactory, Context, bundle) {

    "use strict";

    /*global describe:true, it:true, expect:true, beforeEach:true*/

    describe("pentaho/type/object -", function() {
        it("is a function", function() {
            expect(typeof objectFactory).toBe("function");
        });

        describe("new object()", function() {
            var PentahoObject;
            var emptyObj;
            var dateObj;
            beforeEach(function () {
                PentahoObject = objectFactory(new Context());
                emptyObj = {};
                dateObj = new Date();
            });
            it("should be a function", function () {
                expect(typeof PentahoObject).toBe("function");
            });
            it("should return an object", function () {
                expect(typeof new PentahoObject({v: emptyObj})).toBe("object");
            });
            it("should accept an empty object as an object", function () {
                expect(new PentahoObject({v: emptyObj}).value).toBe(emptyObj);
            });
            it("should accept a date object as an object", function () {
                expect(new PentahoObject({v: dateObj}).value).toBe(dateObj);
            });
            it("should not accept empt object literal", function () {
                expect(function () {
                    new PentahoObject({})
                }).toThrowError(bundle.structured.errors.value.isNull);
            });
            it("should not accept null", function () {
                expect(function () {
                    new PentahoObject(null)
                }).toThrowError(bundle.structured.errors.value.isNull);
            });
            it("should not accept undefined", function () {
                expect(function () {
                    new PentahoObject(undefined)
                }).toThrowError(bundle.structured.errors.value.isNull);
            });
        });
    }); // pentaho/type/object
});