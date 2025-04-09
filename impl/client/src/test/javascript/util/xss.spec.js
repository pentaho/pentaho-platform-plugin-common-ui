/*!
* Copyright 2024 Hitachi Vantara.  All rights reserved.
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

define(["common-ui/util/xss", "common-ui/jquery"], function(xssUtil, $) {

  describe("XssUtil", function() {
    const origin = "http://localhost:9876";
    const basePath = `${origin}/folder`;

    beforeEach(() => {
      spyOn(xssUtil, "_getLocationHref").and.returnValue(`${basePath}/context.html`);
    });

    describe("sanitizeHtml", function() {
      it("should return correctly formatted locale", function() {
        const unsafeHtml = "<div>Hello</div><script>alert(\"xss\")</script>";
        const expectedSanitizedHtml = "<div>Hello</div>";
        const result = xssUtil.sanitizeHtml(unsafeHtml);

        expect(result).toBe(expectedSanitizedHtml);
      });

      it("should return safe HTML unchanged", function() {
        const safeHtml = "<div><b>Hello</b></div>";
        const result = xssUtil.sanitizeHtml(safeHtml);

        expect(result).toBe(safeHtml);
      });

      it("should return an empty string when input is empty", function() {
        const result = xssUtil.sanitizeHtml("");
        expect(result).toBe("");
      });

      it("should return an empty string when input is null", function() {
        const result = xssUtil.sanitizeHtml(null);
        expect(result).toBe("");
      });

      it("should remove nested unsafe elements", function() {
        const unsafeHtml = "<div>Hello<script>alert(\"xss\")</script><p>World</p></div>";
        const expectedSanitizedHtml = "<div>Hello<p>World</p></div>";
        const result = xssUtil.sanitizeHtml(unsafeHtml);

        expect(result).toBe(expectedSanitizedHtml);
      });
    });

    describe("Encoding Functions", function() {
      describe("encodeTextForHtml", function() {
        it("should encode text for HTML", function() {
          const text = "<Hello & World>";
          const encodedText = xssUtil.encodeTextForHtml(text);

          expect(encodedText).toBe("&lt;Hello &amp; World&gt;");
        });
      });

      describe("encodeTextForHtmlAttribute", function() {
        it("should encode text for HTML attribute", function() {
          const text = "\"Hello & World\"";
          const encodedText = xssUtil.encodeTextForHtmlAttribute(text);

          expect(encodedText).toBe("&quot;Hello &amp; World&quot;");
        });
      });
    });

    describe("setHtml Functions", function() {
      describe("setHtml", function () {
        it("should set sanitized HTML to an element", function () {
          const elem = document.createElement("div");
          const unsafeHtml = "<script>alert(\"XSS\");</script><p>Safe Content</p>";

          xssUtil.setHtml(elem, unsafeHtml);
          expect(elem.innerHTML).toBe("<p>Safe Content</p>");
        });

        it("should set sanitized HTML to a jQuery object", function () {
          const elem = $("<div></div>");
          const unsafeHtml = "<script>alert(\"XSS\");</script><p>Safe Content</p>";

          xssUtil.setHtml(elem, unsafeHtml);
          expect(elem.html()).toBe("<p>Safe Content</p>");
        });

        it("should set sanitized HTML to an array-like object", function () {
          const elem1 = document.createElement("div");
          const elem2 = document.createElement("div");
          const elems = [elem1, elem2];
          const unsafeHtml = "<script>alert(\"XSS\");</script><p>Safe Content</p>";

          xssUtil.setHtml(elems, unsafeHtml);
          expect(elem1.innerHTML).toBe("<p>Safe Content</p>");
          expect(elem2.innerHTML).toBe("<p>Safe Content</p>");
        });

        it("should throw an error for invalid argument 'elem'", function () {
          const invalidElem = {};
          const unsafeHtml = "<script>alert(\"XSS\");</script><p>Safe Content</p>";
          expect(() => xssUtil.setHtml(invalidElem, unsafeHtml)).toThrowError("Invalid argument 'elem'.");
        });
      });
    });

    describe("setHtmlUnsafe", function() {
      it("should set unsanitized HTML to an element", function() {
        const elem = document.createElement("div");
        const unsafeHtml = "<div>Hello World</div>";

        xssUtil.setHtmlUnsafe(elem, unsafeHtml);
        expect(elem.innerHTML).toBe(unsafeHtml);
      });

      it("should set unsanitized HTML to a jQuery object", function() {
        const elem = $("<div></div>");
        const unsafeHtml = "<div>Hello World</div>";

        xssUtil.setHtmlUnsafe(elem, unsafeHtml);
        expect(elem.html()).toBe(unsafeHtml);
      });

      it("should set unsanitized HTML to an array-like object", function() {
        const elem1 = document.createElement("div");
        const elem2 = document.createElement("div");
        const elems = [elem1, elem2];
        const unsafeHtml = "<div>Hello World</div>";

        xssUtil.setHtmlUnsafe(elems, unsafeHtml);
        expect(elem1.innerHTML).toBe(unsafeHtml);
        expect(elem2.innerHTML).toBe(unsafeHtml);
      });

      it("should throw an error for invalid argument 'elem'", function() {
        const invalidElem = {};
        const unsafeHtml = "<div>Hello</div><script>alert('XSS');</script>";
        expect(() => xssUtil.setHtmlUnsafe(invalidElem, unsafeHtml)).toThrowError("Invalid argument 'elem'.");
      });
    });

    describe("sanitizeUrl", function() {
      it("should allow valid HTTP URL", function() {
        const result = xssUtil.sanitizeUrl("http://google.com");
        expect(result).toBe("http://google.com/");
      });

      it("should allow valid HTTPS URL", function() {
        const result = xssUtil.sanitizeUrl("https://google.com");
        expect(result).toBe("https://google.com/");
      });

      it("should sanitize JavaScript URL", function() {
        const result = xssUtil.sanitizeUrl("javascript:alert('XSS')");
        expect(result).toBe("about:blank");
      });

      it("should sanitize data URL", function() {
        const result = xssUtil.sanitizeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==");
        expect(result).toBe("about:blank");
      });

      it("should sanitize mailto URL", function() {
        const result = xssUtil.sanitizeUrl("mailto:someone@example.com");
        expect(result).toBe("about:blank");
      });

      it("should sanitize file URL", function() {
        const result = xssUtil.sanitizeUrl("file:///etc/passwd");
        expect(result).toBe("about:blank");
      });

      it("should sanitize absolute path", function() {
        const result = xssUtil.sanitizeUrl("/absolute-path");
        expect(result).toBe(`${origin}/absolute-path`);
      });

      it("should sanitize relative path", function() {
        const result = xssUtil.sanitizeUrl("relative-path");
        expect(result).toBe(`${basePath}/relative-path`);
      });

      it("should sanitize empty URL", function() {
        const result = xssUtil.sanitizeUrl("");
        expect(result).toBe("about:blank");
      });

      it("should sanitize disallowed protocol URL", function() {
        const result = xssUtil.sanitizeUrl("ftp://example.com");
        expect(result).toBe("about:blank");
      });

      it("should allow HTTP URL with a port", function() {
        const result = xssUtil.sanitizeUrl("http://example.com:8080");
        expect(result).toBe("http://example.com:8080/");
      });

      it("should sanitize malformed URL", function() {
        const result = xssUtil.sanitizeUrl("http:///example.com");
        expect(result).toBe("http://example.com/");
      });

      it("should allow URL with special characters", function() {
        const result = xssUtil.sanitizeUrl("https://example.com/path?query=<script>");
        expect(result).toBe("https://example.com/path?query=%3Cscript%3E");
      });
    });

    describe("open", function() {
      let windowOpenSpy;

      beforeEach(() => {
        windowOpenSpy = spyOn(window, "open");
      });

      it("should open a new window with a sanitized HTTP URL", function() {
        const url = "http://example.com";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("http://example.com/");
      });

      it("should open a new window with a sanitized HTTPS URL", function() {
        const url = "https://example.com";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("https://example.com/");
      });

      it("should open a new window with 'about:blank' for a JavaScript URL", function() {
        const url = "javascript:alert('XSS')";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with 'about:blank' for a data URL", function() {
        const url = "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with 'about:blank' for a mailto URL", function() {
        const url = "mailto:someone@example.com";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with 'about:blank' for a file URL", function() {
        const url = "file:///etc/passwd";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with a sanitized absolute path", function() {
        const url = "/relative-path";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("http://localhost:9876/relative-path");
      });

      it("should open a new window with 'about:blank' for an empty URL", function() {
        const url = "";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with 'about:blank' for a disallowed protocol URL", function() {
        const url = "ftp://example.com";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with a sanitized HTTP URL with a port", function() {
        const url = "http://example.com:8080";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("http://example.com:8080/");
      });

      it("should open a new window with a sanitized malformed URL", function() {
        const url = "http:///example.com";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("http://example.com/");
      });

      it("should open a new window with a sanitized URL with special characters", function() {
        const url = "https://example.com/path?query=<script>";

        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("https://example.com/path?query=%3Cscript%3E");
      });
    });

    describe("setLocation", function () {
      let mockWinOrDoc;

      beforeEach(() => {
        mockWinOrDoc = {location: ""};
      });

      it("should set window.location for valid URL", () => {
        xssUtil.setLocation(mockWinOrDoc, "http://example.com");
        expect(mockWinOrDoc.location).toBe("http://example.com/");
      });

      it("should set document.location for a valid URL", () => {
        xssUtil.setLocation(mockWinOrDoc, "https://example.com");
        expect(mockWinOrDoc.location).toBe("https://example.com/");
      });

      it("should fallback to 'about:blank' for invalid URLs", () => {
        xssUtil.setLocation(mockWinOrDoc, "javascript:alert('XSS')");
        expect(mockWinOrDoc.location).toBe("about:blank");
      });
    });

    describe("write", function () {
      it("should write sanitized HTML to the document", function () {
        const doc = document.implementation.createHTMLDocument("");
        const unsafeHtml = "<div>Hello</div><script>alert('XSS');</script>";

        xssUtil.write(doc, unsafeHtml);
        expect(doc.body.innerHTML.trim()).toBe("<div>Hello</div>"); // Only sanitized content should be written
      });

      it("should remove unsafe script tags from nested HTML", function () {
        const doc = document.implementation.createHTMLDocument('');
        const unsafeHtml = "<div>Hello<script>alert('XSS');</script><p>World</p></div>";

        xssUtil.write(doc, unsafeHtml);
        expect(doc.body.innerHTML.trim()).toBe('<div>Hello<p>World</p></div>'); // Only safe HTML should remain
      });
    });

    describe("writeLine", function () {
      it("should write sanitized HTML to the document", function () {
        const doc = document.implementation.createHTMLDocument("");
        const unsafeHtml = "<div>Hello</div><script>alert('XSS');</script>";

        xssUtil.writeLine(doc, unsafeHtml);
        expect(doc.body.innerHTML.trim()).toBe("<div>Hello</div>"); // Only sanitized content should be written
      });

      it("should remove unsafe script tags from nested HTML", function () {
        const doc = document.implementation.createHTMLDocument('');
        const unsafeHtml = "<div>Hello<script>alert('XSS');</script><p>World</p></div>";

        xssUtil.writeLine(doc, unsafeHtml);
        expect(doc.body.innerHTML.trim()).toBe('<div>Hello<p>World</p></div>'); // Only safe HTML should remain
      });
    });

    describe("writeLineUnsafe", function() {
      it("should write unsafe HTML to the document", function () {
        const doc = document.implementation.createHTMLDocument("");
        const unsafeHtml = "<div>Hello</div><script>alert('XSS');</script>";

        xssUtil.writeLineUnsafe(doc, unsafeHtml);
        expect(doc.body.innerHTML.trim()).toBe("<div>Hello</div><script>alert('XSS');</script>");
      });

      it("should write empty string to the document", function () {
        const doc = document.implementation.createHTMLDocument("");
        const emptyString = "";

        xssUtil.writeLineUnsafe(doc, emptyString);
        expect(doc.body.innerHTML.trim()).toBe("");
      });
    });

    describe("insertAdjacentHtml", function () {
      it("should insert sanitized HTML before the target element", function () {
        const parentElement = document.createElement("div");
        const targetElement = document.createElement("div");
        parentElement.appendChild(targetElement);

        const unsafeHtml = "<script>alert('XSS');</script><p>Safe Content</p>";
        xssUtil.insertAdjacentHtml(targetElement, "beforebegin", unsafeHtml);
        expect(parentElement.innerHTML).toBe("<p>Safe Content</p><div></div>");
      });

      it("should insert sanitized HTML after the target element", function () {
        const parentElement = document.createElement("div");
        const targetElement = document.createElement("div");
        parentElement.appendChild(targetElement);

        const unsafeHtml = "<script>alert('XSS');</script><p>Safe Content</p>";
        xssUtil.insertAdjacentHtml(targetElement, "afterend", unsafeHtml);
        expect(parentElement.innerHTML).toBe("<div></div><p>Safe Content</p>");
      });

      it("should insert sanitized HTML at the beginning of the target element", function () {
        const parentElement = document.createElement("div");
        const targetElement = document.createElement("div");
        parentElement.appendChild(targetElement);

        const unsafeHtml = "<script>alert('XSS');</script><p>Safe Content</p>";
        xssUtil.insertAdjacentHtml(targetElement, "afterbegin", unsafeHtml);
        expect(targetElement.innerHTML).toBe("<p>Safe Content</p>");
      });

      it("should insert sanitized HTML at the end of the target element", function () {
        const parentElement = document.createElement("div");
        const targetElement = document.createElement("div");
        parentElement.appendChild(targetElement);

        const unsafeHtml = "<script>alert('XSS');</script><p>Safe Content</p>";
        xssUtil.insertAdjacentHtml(targetElement, "beforeend", unsafeHtml);
        expect(targetElement.innerHTML).toBe("<p>Safe Content</p>");
      });
    });

    describe("encodeForJavaScript", function() {
      it("should encode control characters for JavaScript", function() {
        const text = "Hello\nWorld";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("Hello\\nWorld");
      });

      it("should return null for null input", function() {
        const encodedText = xssUtil.encodeForJavaScript(null);
        expect(encodedText).toBeNull();
      });

      it("should return undefined for undefined input", function() {
        const encodedText = xssUtil.encodeForJavaScript(undefined);
        expect(encodedText).toBeUndefined();
      });

      it("should encode empty string correctly", function() {
        const text = "";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("");
      });

      it("should encode backspace character", function() {
        const text = "\b";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("\\b");
      });

      it("should encode tab character", function() {
        const text = "\t";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("\\t");
      });

      it("should encode form feed character", function() {
        const text = "\f";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("\\f");
      });

      it("should encode carriage return character", function() {
        const text = "\r";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("\\r");
      });

      it("should encode double quote character", function() {
        const text = "\"";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("\\x22");
      });

      it("should encode single quote character", function() {
        const text = "'";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("\\x27");
      });

      it("should encode ampersand character", function() {
        const text = "&";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("\\x26");
      });

      it("should encode backslash character", function() {
        const text = "\\";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("\\");
      });

      it("should encode forward slash character", function() {
        const text = "/";
        const encodedText = xssUtil.encodeForJavaScript(text);
        expect(encodedText).toBe("\\/");
      });
    });
  });
});