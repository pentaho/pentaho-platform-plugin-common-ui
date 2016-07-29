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
  "pentaho/util/text"
], function(text) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.util.text -", function() {
    it("is an object", function() {
      expect(typeof text).toBe("object");
    });

    describe("firstUpperCase(text)", function() {
      it("should ensure the first letter of a string is upper case", function() {
        expect(text.firstUpperCase("text")).toBe("Text");
      });

      it("should preserve an already uppercase string", function() {
        expect(text.firstUpperCase("TEXT")).toBe("TEXT");
      });

      it("should ensure (for multiple words) the first letter of the first string is upper case", function() {
        expect(text.firstUpperCase("text text")).toBe("Text text");
      });
    });

    describe("titleFromName(text)", function() {
      it("should ensure the first letter of a sentence is upper case", function() {
        expect(text.titleFromName("productFamilyId")).toBe("Product Family Id");
      });

      it("should return empty string if given empty string", function() {
        expect(text.titleFromName("")).toBe("");
      });

      it("should return null if given null", function() {
        expect(text.titleFromName(null)).toBe(null);
      });

      it("should return undefined if given undefined", function() {
        expect(text.titleFromName(undefined)).toBe(undefined);
        expect(text.titleFromName()).toBe(undefined);
      });
    });

    describe("toSnakeCase(text)", function() {
      it("should split when case changes and join with an hyphen", function() {
        expect(text.toSnakeCase("productFamilyId").toLowerCase()).toBe("product-family-id");
      });

      it("should convert the result to lower case", function() {
        expect(text.toSnakeCase("Product")).toBe("product");
      });

      it("should convert spaces to hyphen", function() {
        expect(text.toSnakeCase("product family")).toBe("product-family");
      });

      it("should convert backward and forward slashes to hyphens", function() {
        expect(text.toSnakeCase("product/family\\id")).toBe("product-family-id");
      });

      it("should convert underscores to hyphens", function() {
        expect(text.toSnakeCase("product_family")).toBe("product-family");
      });

      it("should convert consecutive spaces, underscores or slashes to a single hyphen", function() {
        expect(text.toSnakeCase("product__family")).toBe("product-family");
        expect(text.toSnakeCase("product  family")).toBe("product-family");
        expect(text.toSnakeCase("product//family")).toBe("product-family");
        expect(text.toSnakeCase("product\\\\family")).toBe("product-family");
      });

      it("should return empty string if given empty string", function() {
        expect(text.toSnakeCase("")).toBe("");
      });

      it("should return null if given null", function() {
        expect(text.toSnakeCase(null)).toBe(null);
      });

      it("should return undefined if given undefined", function() {
        expect(text.toSnakeCase(undefined)).toBe(undefined);
        expect(text.toSnakeCase()).toBe(undefined);
      });
    });
  }); // pentaho.util.text
});