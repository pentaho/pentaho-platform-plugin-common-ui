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
          const unsafeHtml = "<script>alert(\"XSS\");</script>";
          xssUtil.setHtml(elem, unsafeHtml);
          expect(elem.innerHTML).not.toContain("<script>");
        });

        it("should set sanitized HTML to a jQuery object", function () {
          const elem = $("<div></div>");
          const unsafeHtml = "<script>alert(\"XSS\");</script>";
          xssUtil.setHtml(elem, unsafeHtml);
          expect(elem.html()).not.toContain("<script>");
        });

        it("should throw an error for invalid element", function () {
          const elem = {};
          const unsafeHtml = "<script>alert(\"XSS\");</script>";
          expect(() => xssUtil.setHtml(elem, unsafeHtml)).toThrowError("Invalid argument 'elem'.");
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

      it("should throw an error for invalid element", function() {
        const elem = {};
        const unsafeHtml = "<div>Hello World</div>";
        expect(() => xssUtil.setHtmlUnsafe(elem, unsafeHtml)).toThrowError("Invalid argument 'elem'.");
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

      it("should sanitize relative URL", function() {
        const result = xssUtil.sanitizeUrl("/relative-path");
        expect(result).toBe("http://localhost:9876/relative-path");
      });

      it("should sanitize empty URL", function() {
        const result = xssUtil.sanitizeUrl("");
        expect(result).toBe("http://localhost:9876/context.html");
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
      it("should open a new window with a sanitized HTTP URL", function() {
        const url = "http://example.com";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("http://example.com/");
      });

      it("should open a new window with a sanitized HTTPS URL", function() {
        const url = "https://example.com";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("https://example.com/");
      });

      it("should open a new window with 'about:blank' for a JavaScript URL", function() {
        const url = "javascript:alert('XSS')";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with 'about:blank' for a data URL", function() {
        const url = "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with 'about:blank' for a mailto URL", function() {
        const url = "mailto:someone@example.com";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with 'about:blank' for a file URL", function() {
        const url = "file:///etc/passwd";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with a sanitized relative URL", function() {
        const url = "/relative-path";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("http://localhost:9876/relative-path");
      });

      it("should open a new window with 'about:blank' for an empty URL", function() {
        const url = "";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("http://localhost:9876/context.html");
      });

      it("should open a new window with 'about:blank' for a disallowed protocol URL", function() {
        const url = "ftp://example.com";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("about:blank");
      });

      it("should open a new window with a sanitized HTTP URL with a port", function() {
        const url = "http://example.com:8080";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("http://example.com:8080/");
      });

      it("should open a new window with a sanitized malformed URL", function() {
        const url = "http:///example.com";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("http://example.com/");
      });

      it("should open a new window with a sanitized URL with special characters", function() {
        const url = "https://example.com/path?query=<script>";
        const windowOpenSpy = spyOn(window, "open");
        xssUtil.open(url);
        expect(windowOpenSpy).toHaveBeenCalledWith("https://example.com/path?query=%3Cscript%3E");
      });
    });

    describe("setLocation", function () {
      it("should set window.location for valid URL", () => {
        const mockWindow = { location: "" };
        xssUtil.setLocation(mockWindow, "http://example.com");
        expect(mockWindow.location).toBe("http://example.com/");
      });

      it("should set document.location for a valid URL", () => {
        const mockDocument = { location: "" };
        xssUtil.setLocation(mockDocument, "https://example.com");
        expect(mockDocument.location).toBe("https://example.com/");
      });

      it("should fallback to 'about:blank' for invalid URLs", () => {
        const mockWinOrDoc = { location: "" };
        xssUtil.setLocation(mockWinOrDoc, "javascript:alert('XSS')");
        expect(mockWinOrDoc.location).toBe("about:blank");
      });
    });

    describe("write", function () {
      it("should write sanitized HTML to the document", function () {
        const doc = document.implementation.createHTMLDocument("");
        const unsafeHtml = "<div>Hello</div><script>alert('XSS');</script>";
        xssUtil.write(doc, unsafeHtml);
        expect(doc.body.innerHTML.trim()).toBe("<div>Hello</div>");  // Only sanitized content should be written
      });

      it("should remove unsafe script tags from nested HTML", function () {
        const doc = document.implementation.createHTMLDocument('');
        const unsafeHtml = "<div>Hello<script>alert('XSS');</script><p>World</p></div>";
        xssUtil.write(doc, unsafeHtml);
        expect(doc.body.innerHTML.trim()).toBe('<div>Hello<p>World</p></div>');  // Only safe HTML should remain
      });
    });

   describe("writeLine", function () {
     it("should write sanitized HTML to the document", function () {
       const doc = document.implementation.createHTMLDocument("");
       const unsafeHtml = "<div>Hello</div><script>alert('XSS');</script>";
       xssUtil.writeLine(doc, unsafeHtml);
       expect(doc.body.innerHTML.trim()).toBe("<div>Hello</div>");  // Only sanitized content should be written
     });

     it("should remove unsafe script tags from nested HTML", function () {
       const doc = document.implementation.createHTMLDocument('');
       const unsafeHtml = "<div>Hello<script>alert('XSS');</script><p>World</p></div>";
       xssUtil.writeLine(doc, unsafeHtml);
       expect(doc.body.innerHTML.trim()).toBe('<div>Hello<p>World</p></div>');  // Only safe HTML should remain
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

   describe("encodeForJavaScript", function() {it("should encode special characters", function() {
     const input = "<script>alert('XSS')</script>";
     const expectedOutput = "\\u003c\\u0073\\u0063\\u0072\\u0069\\u0070\\u0074\\u003e\\u0061\\u006c\\u0065" +
         "\\u0072\\u0074\\u0028\\u0027\\u0058\\u0053\\u0053\\u0027\\u0029\\u003c\\u002f\\u0073\\u0063\\u0072\\u0069" +
         "\\u0070\\u0074\\u003e";
     const result = xssUtil.encodeForJavaScript(input);
     expect(result).toBe(expectedOutput);
   })

     it("should encode alphanumeric characters", function() {
     const input = "abc123";
     const expectedOutput = "\\u0061\\u0062\\u0063\\u0031\\u0032\\u0033";
     const result = xssUtil.encodeForJavaScript(input);
     expect(result).toBe(expectedOutput);
     })

     it("should encode empty string", function() {
     const input = "";
     const expectedOutput = "";
     const result = xssUtil.encodeForJavaScript(input);
     expect(result).toBe(expectedOutput);
      })

     it("should encode null input", function() {
     const input = null;
     const expectedOutput = "";
     const result = xssUtil.encodeForJavaScript(input);
     expect(result).toBe(expectedOutput);
      })

     it("should encode undefined input", function() {
     const input = undefined;
     const expectedOutput = "";
     const result = xssUtil.encodeForJavaScript(input);
     expect(result).toBe(expectedOutput);
     });
   });

});
});
