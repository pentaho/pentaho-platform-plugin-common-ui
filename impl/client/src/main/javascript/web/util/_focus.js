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


/*
 * Portions of this file are based on jQuery UI, v1.13.2
 */

/* Need module name as this file is loaded first as a static resource by common-ui. */
define("common-ui/util/_focus", [
  "../jquery-clean"
], function($) {
  "use strict";

  // region Extends jQuery with tabbable and focusable.
  // Adapted from https://github.com/jquery/jquery-ui/blob/1.13.2/ui/focusable.js and ./tabbable.js
  function isFocusable(elem, hasTabindex) {
    var nodeName = elem.nodeName.toLowerCase();
    if(nodeName === "area") {
      var map = elem.parentNode;
      var mapName = map.name;
      if(!elem.href || !mapName || map.nodeName.toLowerCase() !== "map") {
        return false;
      }

      var $img = $("img[usemap='#" + mapName + "']");
      return $img.length > 0 && $img.is(":visible");
    }

    if(/^(input|select|textarea|button|object)$/.test(nodeName)) {
      if(!isEnabled(elem)) {
        return false;
      }
    } else if(nodeName === "a") {
      if(!elem.href && !hasTabindex) {
        return false;
      }
    } else if(!hasTabindex) {
      return false;
    }

    return isVisible(elem);
  }

  function isEnabled(elem) {
    if(elem.disabled) {
      return false;
    }

    // Form controls within a disabled fieldset are disabled.
    // However, controls within the fieldset's legend do not get disabled.
    // Since controls generally aren't placed inside legends, we skip
    // this portion of the check.
    var $fieldset = $(elem).closest("fieldset")[0];
    if($fieldset && $fieldset.disabled) {
      return false;
    }

    return true;
  }

  function isVisible(elem) {
    var $elem = $(elem);
    return $elem.is(":visible") && $elem.css("visibility") === "visible";
  }

  $.extend($.expr.pseudos, {
    "pen-focusable-candidate": function(element) {
      return isFocusable(element, true);
    },
    "pen-focusable": function(element) {
      return isFocusable(element, $.attr(element, "tabindex") != null);
    },
    "pen-tabbable": function(element) {
      var tabIndex = $.attr(element, "tabindex");
      var hasTabindex = tabIndex != null;
      return (!hasTabindex || tabIndex >= 0) && isFocusable(element, hasTabindex);
    }
  });
  // endregion

  var Selectors = {
    tabbable: ":pen-tabbable",
    focusable: ":pen-focusable",
    candidate: ":pen-focusable-candidate"
  };

  var suspendFocusRingCount = 0;

  function createDisposable(dispose) {
    dispose.remove = dispose;

    return dispose;
  }

  function optionalArg(o, p, dv) {
    var v;
    return o && (v = o[p]) != null ? v : dv;
  }

  function expandSelection(contextElem, selector) {
    var expanded = [];

    var selection = selector(contextElem);
    var L = selection.length;
    for(var i = 0; i < L; i++) {
      var contentDocument = safeGetContentDocument(selection[i]);
      if(contentDocument != null) {
        expanded.push.apply(expanded, expandSelection(contentDocument, selector));
      } else {
        expanded.push(selection[i]);
      }
    }

    return expanded;
  }

  function safeGetContentDocument(elem) {
    if (elem.tagName.toLowerCase() === "iframe" ) {
      try {
        return elem.contentDocument;
      } catch(e) {
        // cross-domain error
      }
    }

    return null;
  }

  /**
   * @return {function(Element) : JQueryResult} A jQuery-like selector function.
   */
  function getSelectorFunFromArgs(keyArgs, searchDescendants) {
    var preSelector = optionalArg(keyArgs, "selector");
    var selector = getSelectorFromFocusableArg(keyArgs);
    var postFilter = optionalArg(keyArgs, "filter");

    var selectorFun = searchDescendants ? null : $;

    if (preSelector != null) {
      selectorFun = composeJQuery(selectorFun, preSelector);
    }

    selectorFun = composeJQuery(selectorFun, selector);

    // assert selectorFun != null;

    if (postFilter != null) {
      selectorFun = composeJQuery(selectorFun, processJQueryFilterArg(postFilter));
    }

    return selectorFun;
  }

  /**
   * @param {function(Element) : JQueryResult} previousFun - A jQuery-like function.
   * @param {string|function} nextArg - When `previousFun` is `null`, a selector string.
   *   Otherwise, it is a value suitable for `jQuery.filter(.)`: a selector string or a predicate function.
   * @return {function(Element) : JQueryResult} A new function which incorporates the given additional filter.
   */
  function composeJQuery(previousFun, nextArg) {
    // The first function must establish the initial jQuery set by using find to select descendant elements.
    if (previousFun == null) {
      return function composeJQueryRoot(elem) {
        return $(elem).find(nextArg);
      };
    }

    // Subsequent functions successively filter the elements initially selected.
    return function composeJQueryFilter(elem) {
      return previousFun(elem).filter(nextArg);
    };
  }

  function processJQueryFilterArg(filterArg) {
    return function(index, elem) {
      return filterArg.call(this, elem);
    };
  }

  function getSelectorFromFocusableArg(keyArgs) {
    var focusableMode = optionalArg(keyArgs, "focusable", false);
    if (focusableMode === true) {
      focusableMode = "focusable";
    } else if(focusableMode === false) {
      focusableMode = "tabbable";
    }

    var selector = Selectors[focusableMode];
    if(selector == null) {
      throw new Error("Invalid `focusable` value '" + focusableMode + "'.");
    }

    return selector;
  }

  /**
   * Holds state for restoring focus to an element.
   *
   * @name pho.util._focus.IFocusState
   * @interface
   * @private
   */

  /**
   * Gets the closest refreshed element which can currently receive focus.
   *
   * @name closest
   * @memberOf pho.util._focus.IFocusState#
   * @method
   * @return {?Element} An focusable element, if any; `null`, otherwise.
   */

  /**
   * Contains utilities for dealing with focus.
   * @namespace
   * @name common-ui.util._focus
   * @amd common-ui/util/_focus
   * @private
   */
  return {
    /**
     * Gets a jQuery instance which is ensured to have the custom pseudo-selectors,
     * `:pen-tabbable` and `:pen-focusable`, registered.
     * @type {$}
     */
    jQuery: $,

    Selectors: Selectors,

    // region tabbable
    /**
     * Gets a value that indicates whether an element can receive focus.
     * @param {?Element} [elem] - The element.
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {string} [keyArgs.selector] - A base selector string which selects the candidate elements for focusable
     *  inspection. The selected elements are further restricted according to the `keyArgs.focusable` and
     *  `keyArgs.filter` arguments. When unspecified, all descendant elements are candidates.
     * @param {string|boolean} [keyArgs.focusable=false] - The focusable type. Identifies the type of focusability
     *  required by elements. All elements must be enabled and visible.
     *
     *  Depending on the specified focusable type value, elements are required to be:
     *  - `"focusable"` or `true`- click-focusable
     *  - `"tabbable"` or `false` - sequentially-focusable
     *  - `"candidate"` - focusable, albeit possibly requiring a `tabindex` attribute to be set later; useful
     *                    for implementing the "roving tab index" interaction pattern.
     * @param {function(Element):boolean} [keyArgs.filter] - Predicate function which allows further filtering of
     *  candidate elements. Can be used, for example, in cases of custom enabled or visible conditions.
     * @return {boolean} The value `true` if the element is defined and is focusable in the requested sense;
     *   `false`, otherwise.
     */
    isTabbable: function(elem, keyArgs) {
      if(elem == null ) {
        return false;
      }

      var selectorFun = getSelectorFunFromArgs(keyArgs, false);
      return selectorFun(elem).length > 0;
    },

    /**
     * Gets the descendant elements of `root` which can receive focus, in tab order.
     *
     * For `iframe` elements from a same domain,
     * the focusable elements of their content document are included instead.
     *
     * @param {?Element} [root] - The root element. Defaults to the body of this frame's document.
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {string} [keyArgs.selector] - A base selector string which selects the candidate elements for focusable
     *  inspection. The selected elements are further restricted according to the `keyArgs.focusable` and
     *  `keyArgs.filter` arguments. When unspecified, all descendant elements are candidates.
     * @param {string|boolean} [keyArgs.focusable=false] - The focusable type. Identifies the type of focusability
     *  required by elements. All elements must be enabled and visible.
     *
     *  Depending on the specified focusable type value, elements are required to be:
     *  - `"focusable"` or `true`- click-focusable
     *  - `"tabbable"` or `false` - sequentially-focusable
     *  - `"candidate"` - focusable, albeit possibly requiring a `tabindex` attribute to be set later; useful
     *                    for implementing the "roving tab index" interaction pattern.
     * @param {function(Element):boolean} [keyArgs.filter] - Predicate function which allows further filtering of
     *  candidate elements. Can be used, for example, in cases of custom enabled or visible conditions.
     * @param {boolean} [keyArgs.self=false] - Indicates that the root element should also be considered,
     *   at first position.
     * @return {Element[]} An array of focusable elements.
     */
    tabbables: function(root, keyArgs) {
      if(root == null) {
        root = document.body;
      }

      var selectorFun = getSelectorFunFromArgs(keyArgs, true);

      var selection = expandSelection(root, selectorFun);

      if(optionalArg(keyArgs, "self", false) && selectorFun(root).length > 0) {
        selection.unshift(root);
      }

      return selection;
    },

    /**
     * Gets the first descendant element of `root` which can receive focus, in tab order.
     *
     * For `iframe` elements from a same domain,
     * the focusable elements of their content document are included instead.
     *
     * @param {?Element} [root] - The root element. Defaults to the body of this frame's document.
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {string} [keyArgs.selector] - A base selector string which selects the candidate elements for focusable
     *  inspection. The selected elements are further restricted according to the `keyArgs.focusable` and
     *  `keyArgs.filter` arguments. When unspecified, all descendant elements are candidates.
     * @param {string|boolean} [keyArgs.focusable=false] - The focusable type. Identifies the type of focusability
     *  required by elements. All elements must be enabled and visible.
     *
     *  Depending on the specified focusable type value, elements are required to be:
     *  - `"focusable"` or `true`- click-focusable
     *  - `"tabbable"` or `false` - sequentially-focusable
     *  - `"candidate"` - focusable, albeit possibly requiring a `tabindex` attribute to be set later; useful
     *                    for implementing the "roving tab index" interaction pattern.
     * @param {function(Element):boolean} [keyArgs.filter] - Predicate function which allows further filtering of
     *  candidate elements. Can be used, for example, in cases of custom enabled or visible conditions.
     * @param {boolean} [keyArgs.self=false] - Indicates that the root element should also be considered,
     *   at first position.
     * @return {?Element} The first focusable element, if any; `null`, otherwise.
     */
    firstTabbable: function(root, keyArgs) {
      return this.tabbables(root, keyArgs)[0] || null;
    },

    /**
     * Gets the last descendant element of `root` which can receive focus, in tab order.
     *
     * For `iframe` elements from a same domain,
     * the focusable elements of their content document are included instead.
     *
     * @param {?Element} [root] - The root element. Defaults to the body of this frame's document.
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {string} [keyArgs.selector] - A base selector string which selects the candidate elements for focusable
     *  inspection. The selected elements are further restricted according to the `keyArgs.focusable` and
     *  `keyArgs.filter` arguments. When unspecified, all descendant elements are candidates.
     * @param {string|boolean} [keyArgs.focusable=false] - The focusable type. Identifies the type of focusability
     *  required by elements. All elements must be enabled and visible.
     *
     *  Depending on the specified focusable type value, elements are required to be:
     *  - `"focusable"` or `true`- click-focusable
     *  - `"tabbable"` or `false` - sequentially-focusable
     *  - `"candidate"` - focusable, albeit possibly requiring a `tabindex` attribute to be set later; useful
     *                    for implementing the "roving tab index" interaction pattern.
     * @param {function(Element):boolean} [keyArgs.filter] - Predicate function which allows further filtering of
     *  candidate elements. Can be used, for example, in cases of custom enabled or visible conditions.
     * @param {boolean} [keyArgs.self=false] - Indicates that the root element should also be considered,
     *   at first position.
     * @return {?Element} The last focusable element, if any; `null`, otherwise.
     */
    lastTabbable: function(root, keyArgs) {
      var tabbables = this.tabbables(root, keyArgs);
      var L = tabbables.length;
      return L > 0 ? tabbables[L - 1] : null;
    },

    /**
     * Gets the first element after the given one, in tab order, and under a specified scope,
     * which can currently receive focus.
     *
     * @param {Element} elem - The initial element.
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {?Element} [keyArgs.root] - The root element establishes the scope under which focusable elements are
     *   considered. Defaults to the body of this frame's document.
     * @param {string} [keyArgs.selector] - A base selector string which selects the candidate elements for focusable
     *  inspection. The selected elements are further restricted according to the `keyArgs.focusable` and
     *  `keyArgs.filter` arguments. When unspecified, all descendant elements are candidates.
     * @param {string|boolean} [keyArgs.focusable=false] - The focusable type. Identifies the type of focusability
     *  required by elements. All elements must be enabled and visible.
     *
     *  Depending on the specified focusable type value, elements are required to be:
     *  - `"focusable"` or `true`- click-focusable
     *  - `"tabbable"` or `false` - sequentially-focusable
     *  - `"candidate"` - focusable, albeit possibly requiring a `tabindex` attribute to be set later; useful
     *                    for implementing the "roving tab index" interaction pattern.
     * @param {function(Element):boolean} [keyArgs.filter] - Predicate function which allows further filtering of
     *  candidate elements. Can be used, for example, in cases of custom enabled or visible conditions.
     * @return {?Element} The next focusable element, if any; `null`, otherwise.
     */
    nextTabbable: function(elem, keyArgs) {
      var tabbables = this.tabbables(optionalArg(keyArgs, "root"), keyArgs);
      var L = tabbables.length;
      if(L === 0) {
        return null;
      }

      // Not found or found at last position.
      var index = tabbables.indexOf(elem);
      if(index < 0 || index === (L - 1)) {
        return tabbables[0];
      }

      return tabbables[index + 1];
    },

    /**
     * Gets the first element before the given one, in tab order, and under a specified scope,
     * which can currently receive focus.
     *
     * @param {Element} elem - The initial element.
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {?Element} [keyArgs.root] - The root element establishes the scope under which focusable elements are
     *   considered. Defaults to the body of this frame's document.
     * @param {string} [keyArgs.selector] - A base selector string which selects the candidate elements for focusable
     *  inspection. The selected elements are further restricted according to the `keyArgs.focusable` and
     *  `keyArgs.filter` arguments. When unspecified, all descendant elements are candidates.
     * @param {string|boolean} [keyArgs.focusable=false] - The focusable type. Identifies the type of focusability
     *  required by elements. All elements must be enabled and visible.
     *
     *  Depending on the specified focusable type value, elements are required to be:
     *  - `"focusable"` or `true`- click-focusable
     *  - `"tabbable"` or `false` - sequentially-focusable
     *  - `"candidate"` - focusable, albeit possibly requiring a `tabindex` attribute to be set later; useful
     *                    for implementing the "roving tab index" interaction pattern.
     * @param {function(Element):boolean} [keyArgs.filter] - Predicate function which allows further filtering of
     *  candidate elements. Can be used, for example, in cases of custom enabled or visible conditions.
     * @return {?Element} The previous focusable element, if any; `null`, otherwise.
     */
    previousTabbable: function(elem, keyArgs) {
      var tabbables = this.tabbables(optionalArg(keyArgs, "root"), keyArgs);
      var L = tabbables.length;
      if(L === 0) {
        return null;
      }

      // Not found or found at first position.
      var index = tabbables.indexOf(elem);
      if(index <= 0) {
        return tabbables[L - 1];
      }

      return tabbables[index - 1];
    },

    /**
     * Traverses the element and its parents (heading toward the document root),
     * until it finds an element which is focusable, which is then returned.
     *
     * @param {Element} elem - The initial element.
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {string} [keyArgs.selector] - A base selector string which selects the candidate elements for focusable
     *  inspection. The selected elements are further restricted according to the `keyArgs.focusable` and
     *  `keyArgs.filter` arguments. When unspecified, all descendant elements are candidates.
     * @param {string|boolean} [keyArgs.focusable=false] - The focusable type. Identifies the type of focusability
     *  required by elements. All elements must be enabled and visible.
     *
     *  Depending on the specified focusable type value, elements are required to be:
     *  - `"focusable"` or `true`- click-focusable
     *  - `"tabbable"` or `false` - sequentially-focusable
     *  - `"candidate"` - focusable, albeit possibly requiring a `tabindex` attribute to be set later; useful
     *                    for implementing the "roving tab index" interaction pattern.
     * @param {function(Element):boolean} [keyArgs.filter] - Predicate function which allows further filtering of
     *  candidate elements. Can be used, for example, in cases of custom enabled or visible conditions.
     * @return {?Element} The closest focusable element, if any; `null`, otherwise.
     */
    closestTabbable: function(elem, keyArgs) {

      var selectorFun = getSelectorFunFromArgs(keyArgs, false);

      // Based on jQuery.closest().
      var curr = elem;
      while(curr != null) {
        // Skip document fragments (11).
        if(selectorFun(curr).length > 0) {
          return curr;
        }

        curr = curr.parentNode;
      }

      return null;
    },
    // endregion tabbable

    /**
     * Gets a value that indicates whether a given element is focused or contains the element which is focused.
     *
     * @param {Element} root - The root element.
     * @return `true` if the element is focused or contains the element which is focused; `false`, otherwise.
     */
    containsFocus: function(root) {
      var activeElem = document.activeElement;
      return activeElem != null && root.contains(activeElem);
    },

    // region UI Key
    /**
     * Gets the UI key of a given element.
     *
     * The UI key is a stable identifier of an element, one which survives UI refreshes.
     * In some implementations, when the UI is refreshed, elements are destroyed and replaced by new ones
     * which represent the same logical thing. Also, in some, the ids of elements are different each time.
     *
     * The UI key provides a simple and uniform means to "refresh" an element which has been destroyed,
     * by obtaining its replacement element.
     *
     * UI keys are stored in an element's `data-pen-ui-key` attribute.
     *
     * @param {?Element} [elem] - The element.
     * @return {?String} The UI key, if any; `null` if element is not defined, or it does not have a non-empty UI key.
     * @see #refreshElement
     */
    uiKey: function(elem) {
      // Camel-case of `penUiKey` is derived from the corresponding attribute `data-pen-ui-key`. Cannot be changed.
      return (elem && elem.dataset.penUiKey) || null;
    },

    /**
     * Sets the UI key of a given element.
     *
     * @param {Element} [elem] - The element.
     * @param {?String} [uiKey] - The UI key to set; or, `null`, to remove it.
     * @return {Element} The element.
     */
    setUIKey: function(elem, uiKey) {
      if(uiKey) {
        elem.dataset.penUiKey = uiKey;
      } else {
        delete elem.dataset.penUiKey;
      }

      return elem;
    },

    /**
     * Queries a given element for the first descendant (or itself), in document order, which has a given UI key.
     *
     * @param {?Element} [root] - The root element. Defaults to the root element of this frame's document.
     * @param {String} uiKey - The UI key.
     * @return {?Element} The first found element with the given UI key, if any; `null`, otherwise.
     */
    queryByUIKey: function(root, uiKey) {
      if(root == null) {
        root = document.documentElement;
      }

      if(this.uiKey(root) === uiKey) {
        return root;
      }

      return root.querySelector('[data-pen-ui-key="' + CSS.escape(uiKey) + '"]');
    },
    // endregion UI Key

    // region Refresh Element and Focus State
    /**
     * Refreshes a given element.
     *
     * If the element, `elem`, is `null`, then `null` is returned.
     * Otherwise, if it is, or is currently contained by, `root`, then it is immediately returned.
     * Otherwise, a refreshed element is searched for in the following order:
     * 1. If the element has a defined UI key, then the result of calling {@link #queryByUIKey} with `root` and
     *    that UI key is returned.
     * 2. If the element has an identifier, then it is assumed stable, and the first descendant (or self) of `root`
     *    having that id is returned.
     *
     * @param {?Element} [elem] - The element.
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {?Element} [keyArgs.root] - The root element establishes the scope under which a corresponding refreshed
     *   element is searched for. Defaults to the root element of the document of `elem`.
     * @return {?Element} The refreshed element, if one is found; `null`, otherwise.
     */
    refreshElement: function(elem, keyArgs) {
      if(elem == null) {
        return null;
      }

      var root = optionalArg(keyArgs, "root") || elem.ownerDocument.documentElement;

      // assert root != null

      // Still contained within root?
      if (root.contains(elem)) {
        return elem;
      }

      // May belong to document but not be within root anymore.
      // Try to find one/another within root.

      var uiKey = this.uiKey(elem);
      if(uiKey != null) {
        return this.queryByUIKey(root, uiKey);
      }

      var id = elem.id;
      if(id) {
        // Assume it has a stable id...
        return root.id === id ? root : root.querySelector("#" + CSS.escape(id));
      }

      return null;
    },

    /**
     * Captures the focus state required to later restore the focus to a given element.
     *
     * This method collects all focusable elements currently _before_ the given element, in tab order,
     * and under a specified scope, including the element itself.
     * Later, when determining the element to restore focus to, the captured elements are first refreshed,
     * using {@link #refreshElement}, and then tested for focusability,
     * starting from the element itself. The first element passing the test is returned.
     *
     * This procedure is especially appropriate for restoring focus to an element which is being removed, in which,
     * the default behavior would be to put focus on the previous focusable element.
     *
     * @param {Element} elem - The element.
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {?Element} [keyArgs.root] - The root element establishes the scope under which a corresponding refreshed
     *   element is searched for. Defaults to the root element of the document of `elem`.
     * @param {?boolean} [keyArgs.focusable=false] - Indicates that all focusable elements should be considered,
     *   including those which can only be focused using the mouse or code.
     * @return {pho.util._focus.IFocusState} The focus state.
     */
    captureState: function(elem, keyArgs) {
      var root = optionalArg(keyArgs, "root") || elem.ownerDocument.documentElement;
      var focusable = optionalArg(keyArgs, "focusable", false);
      var tabbables = this.__previousAndSelfTabbables(elem, root, keyArgs);

      var me = this;
      return /** @type pho.util._focus.IFocusState */{
        closest: function() {
          var keyArgs2 = {root: root, focusable: focusable};

          for(var i = tabbables.length - 1; i >= 0; i--) {
            var refreshed = me.refreshElement(tabbables[i], keyArgs2);
            if(refreshed != null && me.isTabbable(refreshed, keyArgs2)) {
              return refreshed;
            }
          }

          return null;
        }
      };
    },

    /**
     * Gets an array with the focusable elements up until a given element.
     * @param {Element} elem - The element.
     * @param {Element} root - The root element.
     * @param {?Object} keyArgs - The keyword arguments object.
     * @param {?boolean} [keyArgs.focusable=false] - Indicates that all focusable elements should be considered,
     *   including those which can only be focused using the mouse or code.
     * @return {Element[]} An array of elements, possibly empty.
     * @private
     */
    __previousAndSelfTabbables: function(elem, root, keyArgs) {
      var tabbables = this.tabbables(root, keyArgs);
      var L = tabbables.length;
      if(L === 0) {
        return [];
      }

      // TODO: Ideally, would do a binary search on document order for the closest element before `elem`.
      var index = tabbables.indexOf(elem);
      if(index < 0) {
        return [];
      }

      // Remove elements following `elem`.
      tabbables.splice(index + 1);

      return tabbables;
    },
    // endregion Refresh Element and Focus State

    /**
     * Suspends display the focus ring.
     *
     * This feature is useful to avoid glitches of the focus ring, that would otherwise be visible
     * when focus is placed in an element and then quickly placed in another one, usually in close,
     * consecutive event loop turns.
     *
     * When asynchronous operations that can ultimately change the focus are known to happen ahead of time,
     * the focus ring can be suspended before the operation starts and resumed when it ends.
     *
     * @param {?Object} [keyArgs] - The keyword arguments object.
     * @param {?boolean} [keyArgs.isAuto=true] - Indicates that the suspension should be automatically terminated
     *   after a certain timeout, specified by `keyArgs.duration`.
     * @param {?number} [keyArgs.duration=10] - Indicates that the duration of an automatically terminated suspension.
     * @return {function} A function which must be called to terminate a manual suspension, or that can be called to
     *   terminate an automatically terminated one ahead of time.
     */
    suspendFocusRing: function(keyArgs) {
      var isAuto = optionalArg(keyArgs, "isAuto", true);
      var duration = optionalArg(keyArgs, "duration", 10);

      var timeoutHandle = null;
      var suspended = true;

      // Suspend it!
      suspendFocusRingCount++;
      if(suspendFocusRingCount === 1) {
        document.body.classList.add("focus-ring-disabled");
      }

      // Install timeout to resume.
      if(isAuto) {
        timeoutHandle = setTimeout(resumeFocusRing, duration);
      }

      return createDisposable(resumeFocusRing);

      function resumeFocusRing() {
        if(!suspended) {
          return;
        }

        suspended = false;

        if(timeoutHandle != null) {
          clearTimeout(timeoutHandle);
          timeoutHandle = null;
        }

        suspendFocusRingCount--;
        if(suspendFocusRingCount === 0) {
          document.body.classList.remove("focus-ring-disabled");
        }
      }
    }
  };
});

// Create global reference for non-amd users.
var pho = pho || {};
if (pho.util == null) {
  pho.util = {};
}

require(["common-ui/util/_focus"], function(focusUtil) {
  pho.util._focus = focusUtil;
});
