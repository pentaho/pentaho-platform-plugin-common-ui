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

  var jsEntitiesMap = {
    // Control Characters are escaped using standard escape sequences.
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",

    // Special Characters are escaped
    "\"": "\\x22",
    "'": "\\x27",
    "&": "\\x26",

    "\\": "\\\\",
    "/": "\\/"
  };

  var htmlEncoder;
  var htmlAttrEncoder;
  var jsEncoder;

  function compileTextEncoder(map) {
    var re = new RegExp("[" + Object.keys(map).join("") + "]", "g");

    return function textEncoder(text) {
      if (text == null) return text;
      return String(text).replace(re, function($0) {
        return map[$0];
      });
    };
  }

  /**
   * Compiles a JavaScript encoder function based on the provided map.
   * @param {Object} map - A map of characters and their encoded representations.
   * @returns {Function} - A function that encodes strings for JavaScript contexts.
   */
  function compileJsEncoder(map) {
    var baseEncoder = compileTextEncoder(map);

    return function jsEncoderFunction(text) {
      if(text == null) return text;

      // Also replace other control characters without a special representation (e.g. \n)
      return baseEncoder(text).replace(
          /[\u0000-\u001F]/g,
          (char) => `\\x${char.charCodeAt(0).toString(16).padStart(2, "0")}`);
    };
  }

  function getHtmlEncoder() {
    return htmlEncoder || (htmlEncoder = compileTextEncoder(htmlEntitiesMap));
  }

  function getHtmlAttrEncoder() {
    return htmlAttrEncoder || (htmlAttrEncoder = compileTextEncoder(htmlAttrEntitiesMap));
  }

  /**
   * Returns the JavaScript encoder, initializing it if not already created.
   * @returns {Function} - The JavaScript encoder function.
   */
  function getJsEncoder() {
    return jsEncoder || (jsEncoder = compileJsEncoder(jsEntitiesMap));
  }

  // endregion

  function isHtmlElement(elem) {
    return elem instanceof HTMLElement;
  }

  function isJQueryObject(jQuery) {
    return !!jQuery && typeof jQuery.html === "function";
  }

  // Based on lodash#isArrayLike.
  function isLength(value) {
    return typeof value == 'number' && value > -1 && (value % 1 === 0);
  }

  function isArrayLike(value) {
    return value != null && isLength(value.length) && (typeof value !== "function") && (typeof value !== "string");
  }

  /**
   * This module contains utilities that help in writing XSS-free code.
   * @name XssUtil
   * @memberOf pho.util
   */
  var xssUtil = {
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
     * Set's an element or jQuery object's inner HTML.
     *
     * Uses {@link #sanitizeHtml} to sanitize the given, possibly unsafe, HTML text.
     *
     * @param {HTMLElement|jQuery|Array} elem - The HTML element, jQuery object, or an array or array-like of those
     *                                          (such as HTML collections and dojo/query results).
     * @param {string} unsafeHtml - The possibly unsafe HTML text.
     * @see #sanitizeHtml
     */
    setHtml: function(elem, unsafeHtml) {
      const safeHtml = xssUtil.sanitizeHtml(unsafeHtml);
      if (isHtmlElement(elem)) {
        elem.innerHTML = safeHtml;
      } else if (isJQueryObject(elem)) {
        elem.html(safeHtml);
      } else if (isArrayLike(elem)) {
        for(let i = 0; i < elem.length; i++) {
          xssUtil.setHtml(elem[i], safeHtml);
        }
      } else {
        throw new Error("Invalid argument 'elem'.");
      }
    },

    /**
     * Set's an element or jQuery object's inner HTML without sanitizing the text.
     *
     * @param {HTMLElement|jQuery|Array} elem - The HTML element, jQuery object, or an array or array-like of those
     *                                        (such as HTML collections and dojo/query results).
     * @param {string} unsafeHtml - The possibly unsafe HTML text.
     * @see #sanitizeHtml
     */
    setHtmlUnsafe: function(elem, unsafeHtml) {
      if (isHtmlElement(elem)) {
        elem.innerHTML = unsafeHtml;
      } else if (isJQueryObject(elem)) {
        elem.html(unsafeHtml);
      } else if (isArrayLike(elem)) {
        for(let i = 0; i < elem.length; i++) {
          xssUtil.setHtmlUnsafe(elem[i], unsafeHtml);
        }
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
      if (url) {
        try {
          const baseUrl = xssUtil._getLocationHref();

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
      }

      // Default to 'about:blank' for disallowed protocols or any errors encountered.
      return "about:blank";
    },

    _getLocationHref: function() {
      return document.location.href;
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
     * Writes sanitized HTML content to the document.
     *
     * @param {Document} doc - The document object where the HTML will be written.
     * @param {string} html - The HTML string to be sanitized and written to the document.
     */
    writeLine: function(doc, html) {
      doc.writeln(xssUtil.sanitizeHtml(html));
    },

    /**
     * Writes unsafe HTML content to the document.
     *
     * This function writes the provided HTML string directly to the document
     * without sanitizing it.
     *
     * @param {Document} doc - The document object where the HTML will be written.
     * @param {string} html - The HTML string to be written to the document.
     */
    writeLineUnsafe: function(doc, html) {
      doc.writeln(html);
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
    },

    // Based on OWASP's java Encode#forJavaScript.
    /**
     * Encodes text for safe inclusion in JavaScript strings and in HTML contexts.
     * @param {string} literalText - The input text to encode.
     * @returns {string} - The encoded string.
     */
    encodeForJavaScript: function(literalText) {
      return getJsEncoder()(literalText);
    }
  };

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
