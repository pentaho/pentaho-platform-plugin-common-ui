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
      it("should allow valid URL", function() {
        const result = xssUtil.sanitizeUrl("javascript:alert('XSS')");
        expect(result).toBe("about:blank");
      });
    });

  });
});
