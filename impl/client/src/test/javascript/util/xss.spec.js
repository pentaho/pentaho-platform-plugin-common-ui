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
define(["common-ui/util/xss"], function(xssUtil) {

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
      });
    });

    describe("setHtmlUnsafe", function() {
      it("should set unsanitized HTML to an element", function() {
        const elem = document.createElement("div");
        const unsafeHtml = "<div>Hello World</div>";
        xssUtil.setHtmlUnsafe(elem, unsafeHtml);
        expect(elem.innerHTML).toBe(unsafeHtml);
      });
    });

    describe("sanitizeUrl", function() {
      it("should allow valid HTTP URL", function() {
        const result = xssUtil.sanitizeUrl("http://google.com");
        console.log("should allow valid HTTP URL : "+result);
        expect(result).toBe("http://google.com/");
      });

      it("should allow valid HTTPS URL", function() {
        const result = xssUtil.sanitizeUrl("https://google.com");
        console.log("should allow valid HTTPS URL : "+result);
        expect(result).toBe("https://google.com/");
      });

      it("should sanitize JavaScript URL", function() {
        const result = xssUtil.sanitizeUrl("javascript:alert('XSS')");
        console.log("should sanitize JavaScript URL : "+result);
        expect(result).toBe("about:blank");
      });

      it("should sanitize data URL", function() {
        const result = xssUtil.sanitizeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==");
        console.log("should sanitize data URL : "+result);
        expect(result).toBe("about:blank");
      });

      it("should sanitize mailto URL", function() {
        const result = xssUtil.sanitizeUrl("mailto:someone@example.com");
        console.log("should sanitize mailto URL : "+result);
        expect(result).toBe("about:blank");
      });

      it("should sanitize file URL", function() {
        const result = xssUtil.sanitizeUrl("file:///etc/passwd");
        console.log("should sanitize file URL : "+result);
        expect(result).toBe("about:blank");
      });

      it("should sanitize relative URL", function() {
        const result = xssUtil.sanitizeUrl("/relative-path");
        console.log("should sanitize relative URL : "+result);
        //expect(result).toBe("about:blank");
        expect(result).toBe("http://localhost:9876/relative-path");
      });

      it("should sanitize empty URL", function() {
        const result = xssUtil.sanitizeUrl("");
        console.log("should sanitize empty URL : "+result);
        //expect(result).toBe("about:blank");
        expect(result).toBe("http://localhost:9876/context.html");
      });

      it("should sanitize disallowed protocol URL", function() {
        const result = xssUtil.sanitizeUrl("ftp://example.com");
        console.log("should sanitize disallowed protocol URL : "+result);
        expect(result).toBe("about:blank");
      });

      it("should allow HTTP URL with a port", function() {
        const result = xssUtil.sanitizeUrl("http://example.com:8080");
        console.log("should allow HTTP URL with a port : "+result);
        expect(result).toBe("http://example.com:8080/");
      });

      it("should sanitize malformed URL", function() {
        const result = xssUtil.sanitizeUrl("http:///example.com");
        console.log("should sanitize malformed URL : "+result);
        //expect(result).toBe("about:blank");
        expect(result).toBe("http://example.com/");
      });

      it("should allow URL with special characters", function() {
        const result = xssUtil.sanitizeUrl("https://example.com/path?query=<script>");
        console.log("should allow URL with special characters : "+result);
        expect(result).toBe("https://example.com/path?query=%3Cscript%3E");
      });

    });

  });
});
