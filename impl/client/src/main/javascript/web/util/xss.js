/*!
 * Copyright 2024 Hitachi Vantara. All rights reserved.
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

/* Need module name as this file is loaded first as a static resource by common-ui. */
define("common-ui/util/xss", ["common-ui/dompurify"], function(DOMPurify) {

  // region HTML Encoding

  // Opting for a zero-dependencies implementation, instead of, e.g., using and forcing dojo everywhere.
  // Using a DOM element to do this would not (easily) address the attributes case.

  // https://html.spec.whatwg.org/multipage/syntax.html#syntax-attributes

  var htmlEntitiesMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
  };

  var htmlAttrEntitiesMap = {
    "&": "&amp;",
    "\"": "&quot;",
    "'": "&#39;" // &apos;
  };

  var htmlEncoder;
  var htmlAttrEncoder;

  function compileHtmlEncoder(map) {
    var re = new RegExp("[" + Object.keys(map).join("") + "]", "g");

    return function htmlEncoder(text) {
      if (text == null) return text;
      return String(text).replace(re, function($0) {
        return map[$0];
      });
    };
  }

  function getHtmlEncoder() {
    return htmlEncoder || (htmlEncoder = compileHtmlEncoder(htmlEntitiesMap));
  }

  function getHtmlAttrEncoder() {
    return htmlAttrEncoder || (htmlAttrEncoder = compileHtmlEncoder(htmlAttrEntitiesMap));
  }
  // endregion

  function isHtmlElement(elem) {
    return elem instanceof HTMLElement;
  }

  function isJQueryObject(jQuery) {
    return !!jQuery && typeof jQuery.html === "function";
  }

  /**
   * This module contains utilities that help in writing XSS-free code.
   * @name XssUtil
   * @memberOf pho.util
   */
  var xssUtil = Object.freeze({
    /**
     * Sanitizes a given HTML string.
     *
     * Sanitization removes any parts of the HTML string which may be used to contain and execute JavaScript code.
     *
     * This method exists to support cases where it is not possible to use the {@link #setHtml} method,
     * because the target element is not readily accessible. Certain APIs accept parameters which are
     * HTML strings and hide access to the actual DOM element which receives this.
     *
     * @param {string} unsafeHtml - An HTML string which may contain unsafe parts.
     * @return An HTML string free of unsafe parts.
     */
    sanitizeHtml: function(unsafeHtml) {
      return DOMPurify.sanitize(unsafeHtml);
    },

    /**
     * Encodes a given text for use as content of an HTML element.
     *
     * Encodes the characters which have a special HTML syntax in an HTML element context:
     * `<`, `>` and `&`, as HTML entities.
     *
     * This method exists to support cases where it is not possible to use the {@link #setHtml} method,
     * because the target element is not readily accessible. Certain APIs accept parameters which are
     * HTML strings and hide access to the actual DOM element which receives this.
     * This method transforms a string so that it is taken literally when used in that context.
     *
     * @param {string?|undefined} literalText - The text to encode, or a _nully_ value.
     * @return The encoded text, if not _nully_; the given value, otherwise.
     */
    encodeTextForHtml: function(literalText) {
      return getHtmlEncoder()(literalText);
    },

    /**
     * Encodes a given text for use as the value of an HTML attribute.
     *
     * Encodes the characters which have a special HTML syntax in an HTML attribute context:
     * `&`, `"`, `'`, as HTML entities.
     *
     * It is *critical*, for security reasons, that the values encoded by this function are then enclosed by either
     * `"` or `'` --- unquoted attribute value syntax is not supported.
     *
     * This method exists to support cases where it is not possible to use DOM methods such as
     * {@link Element#setAttribute}, because the target element is not readily accessible. Certain APIs
     * accept parameters which are _HTML Attribute_ strings and hide access to the actual DOM element which receives
     * this. This method transforms a string so that it is taken literally when used in that context.
     *
     * @param {string?|undefined} literalText - The text to encode, or a _nully_ value.
     * @return The encoded text, if not _nully_; the given value, otherwise.
     */
    encodeTextForHtmlAttribute: function(literalText) {
      return getHtmlAttrEncoder()(literalText);
    },

    /**
     * Set's an element's inner HTML to a given text in a safe way, by first sanitizing the text.
     *
     * Uses {@link #sanitizeHtml} to sanitize the given, possibly unsafe, HTML text.
     *
     * @param {HTMLElement|jQuery} elem - The HTML element.
     * @param {string} unsafeHtml - The possibly unsafe HTML text.
     * @see #sanitizeHtml
     */
    setHtml: function(elem, unsafeHtml) {
      const safeHtml = xssUtil.sanitizeHtml(unsafeHtml);
      if (isHtmlElement(elem)) {
        elem.innerHTML = safeHtml;
      } else if (isJQueryObject(elem)) {
        elem.html(safeHtml);
      } else {
        throw new Error("Invalid argument 'elem'.");
      }
    },

    /**
     * Set's an element's HTML to a given text, without sanitizing the text.
     *
     * @param {HTMLElement} elem - The HTML element.
     * @param {string} unsafeHtml - The possibly unsafe HTML text.
     * @see #sanitizeHtml
     */
    setHtmlUnsafe: function(elem, unsafeHtml) {
      if (isHtmlElement(elem)) {
        elem.innerHTML = unsafeHtml;
      } else if (isJQueryObject(elem)) {
        elem.html(unsafeHtml);
      } else {
        throw new Error("Invalid argument 'elem'.");
      }
    },

    /**
     * Sanitize the given URL.
     *
     * @param {string} url - The URL to sanitize.
     * @return {string} The sanitized URL if it is valid, otherwise return 'about:blank'.
     */
    sanitizeUrl: function(url) {
      try {
        // Use `document.location.href` for resolving relative URLs in browser contexts.
        // Fallback to 'http://localhost' in non-browser environments.
        const baseUrl = typeof document !== "undefined" ? document.location.href : "http://localhost";

        // `new URL` ensures consistent, standard-compliant parsing of both absolute and relative URLs.
        const parsedUrl = new URL(url, baseUrl);

        // Allow only URLs with protocols in the `allowedProtocols` list.
        const allowedProtocols = ["http:", "https:"];
        if (allowedProtocols.includes(parsedUrl.protocol)) {
          return parsedUrl.href;
        }
      } catch (e) {
        // Catch errors from invalid URLs or unsupported inputs.
      }

      // Default to 'about:blank' for disallowed protocols or any errors encountered.
      return "about:blank";
    },

    /**
     * Function to open a new window with a sanitized URL.
     *
     * This function sanitizes the provided URL to prevent XSS attacks
     * and then opens a new window with the sanitized URL and additional arguments.
     *
     * @param {string} url - The URL to open in a new window.
     * @param {...*} restArgs - Additional arguments to pass to window.open.
     * @return {Window|null} The newly opened window, or null if the URL is invalid.
     */
    open: function(url, ...restArgs) {
      // Sanitize the provided URL to prevent XSS attacks
      const sanitizedUrl = xssUtil.sanitizeUrl(url);
      // Open a new window with the sanitized URL and additional arguments
      return window.open(sanitizedUrl, ...restArgs);
    },

    /**
     * Sets the location of the given window or document to a sanitized URL.
     *
     * This function sanitizes the provided URL to ensure it is safe before setting it as the location.
     * It prevents potential XSS attacks by disallowing unsafe protocols.
     *
     * @param {Window|Document} winOrDoc - The window or document object whose location will be set.
     * @param {string} url - The URL to set as the location.
     */
    setLocation: function(winOrDoc, url) {
      winOrDoc.location = xssUtil.sanitizeUrl(url);
    },

    /**
     * Writes sanitized HTML content to the document.
     *
     * @param {Document} doc - The document object where the HTML will be written.
     * @param {string} html - The HTML string to be sanitized and written to the document.
     */
    writeLine: function(doc, html) {
      doc.writeln(xssUtil.sanitizeHtml(html));
    },

    /**
     * Writes sanitized HTML content to the document.
     *
     * This function sanitizes the provided HTML string to prevent XSS attacks
     * and then writes the sanitized HTML to the document.
     *
     * @param {Document} doc - The document object where the HTML will be written.
     * @param {string} html - The HTML string to be sanitized and written to the document.
     */
     write: function(doc, html) {
      doc.write(xssUtil.sanitizeHtml(html));
     },

    /**
     * Utility function to insert sanitized HTML at a specified position relative to an element.
     *
     * @param {Element} element - The target element.
     * @param {string} position - The position relative to the element.
     *                            Can be one of: 'beforebegin', 'afterbegin', 'beforeend', 'afterend'.
     * @param {string} htmlContent - The HTML string to be sanitized and inserted.
     */
    insertAdjacentHtml: function(element, position, htmlContent) {
      // Insert the sanitized HTML at the specified position
      element.insertAdjacentHTML(position, xssUtil.sanitizeHtml(htmlContent));
    }

  });
  return xssUtil;
});

// Create global reference for non-amd users.
var pho = pho || {};
if (pho.util == null) {
  pho.util = {};
}

require(["common-ui/util/xss"], function(xssUtil) {
  Object.defineProperty(pho.util, "xss", { value: xssUtil });
});
