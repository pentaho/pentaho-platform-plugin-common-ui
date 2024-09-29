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
  "pentaho/util/text"
], function(text) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.util.text -", function() {
    it("is an object", function() {
      expect(typeof text).toBe("object");
    });

    describe("nonEmptyString(value)", function() {
      it("should return a non-empty string unaffected", function() {
        expect(text.nonEmptyString("text")).toBe("text");
      });

      it("should return null when given null", function() {
        expect(text.nonEmptyString(null)).toBe(null);
      });

      it("should return null when given undefined", function() {
        expect(text.nonEmptyString(undefined)).toBe(null);
      });

      it("should return null when given an empty string", function() {
        expect(text.nonEmptyString("")).toBe(null);
      });

      it("should convert a non-string to a string and return null if it is the empty string", function() {
        expect(text.nonEmptyString({toString: function() { return ""; }})).toBe(null);
      });

      it("should convert a non-string to a string and return it if it is not the empty string", function() {
        expect(text.nonEmptyString({toString: function() { return "foo"; }})).toBe("foo");
      });
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
        expect(text.toSnakeCase("productFamilyId")).toBe("product-Family-Id");
      });

      it("should convert the result to lower case", function() {
        expect(text.toSnakeCase("Product")).toBe("Product");
      });

      it("should convert spaces to hyphen", function() {
        expect(text.toSnakeCase("product family")).toBe("product-family");
      });

      it("should convert periods to hyphen", function() {
        expect(text.toSnakeCase("product.family")).toBe("product-family");
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

      it("should convert resulting consecutive hyphens to a single hyphen", function() {
        expect(text.toSnakeCase("product_-_family")).toBe("product-family");
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

    describe("escapeForHtmlElement(value)", function() {

      it("should convert null to an empty string", function() {
        expect(text.escapeForHtmlElement(null)).toBe("");
      });

      it("should convert undefined to an empty string", function() {
        expect(text.escapeForHtmlElement(undefined)).toBe("");
      });

      it("should convert an empty string to an empty string", function() {
        expect(text.escapeForHtmlElement("")).toBe("");
      });

      // ---

      it("should convert a < character to a &lt; entity", function() {
        expect(text.escapeForHtmlElement("a<b")).toBe("a&lt;b");
      });

      it("should convert a < character to a &lt; entity more than once", function() {
        expect(text.escapeForHtmlElement("a<b<c")).toBe("a&lt;b&lt;c");
      });

      it("should convert a < character to a &lt; entity across multiple lines", function() {
        expect(text.escapeForHtmlElement("a\n<b")).toBe("a\n&lt;b");
      });

      // ---

      it("should convert a > character to a &gt; entity", function() {
        expect(text.escapeForHtmlElement("a>b")).toBe("a&gt;b");
      });

      it("should convert a > character to a &gt; entity more than once", function() {
        expect(text.escapeForHtmlElement("a>b>c")).toBe("a&gt;b&gt;c");
      });

      it("should convert a > character to a &gt; entity across multiple lines", function() {
        expect(text.escapeForHtmlElement("a\n>b")).toBe("a\n&gt;b");
      });

      // ---

      it("should convert a & character to a &amp; entity", function() {
        expect(text.escapeForHtmlElement("a&b")).toBe("a&amp;b");
      });

      it("should convert a & character to a &amp; entity more than once", function() {
        expect(text.escapeForHtmlElement("a&b&c")).toBe("a&amp;b&amp;c");
      });

      it("should convert a & character to a &amp; entity across multiple lines", function() {
        expect(text.escapeForHtmlElement("a\n&b")).toBe("a\n&amp;b");
      });

      // ---

      it("should convert a \" character to a &quot; entity", function() {
        expect(text.escapeForHtmlElement("a\"b")).toBe("a&quot;b");
      });

      it("should convert a \" character to a &quot; entity more than once", function() {
        expect(text.escapeForHtmlElement("a\"b\"c")).toBe("a&quot;b&quot;c");
      });

      it("should convert a \" character to a &quot; entity across multiple lines", function() {
        expect(text.escapeForHtmlElement("a\n\"b")).toBe("a\n&quot;b");
      });
    });

  }); // pentaho.util.text
});
