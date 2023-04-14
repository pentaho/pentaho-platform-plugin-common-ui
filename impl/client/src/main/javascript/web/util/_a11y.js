/*!
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright (c) 2002-2023 Hitachi Vantara. All rights reserved.
 */

define(["./_focus"], function(focusUtil) {

  var keyCodes = {
    A: 65,
    backSpace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    escape: 27,
    space: 32,
    pageUp: 33,
    pageDown: 34,
    end: 35,
    home: 36,
    arrowLeft: 37,
    arrowUp: 38,
    arrowRight: 39,
    arrowDown: 40,
    delete: 46
  };

  var keys = {
    a: "a",
    A: "A",
    Backspace: "Backspace",
    Tab: "Tab",
    Enter: "Enter",
    Shift: "Shift",
    Escape: "Escape",
    Space: " ",
    PageUp: "PageUp",
    PageDown: "PageDown",
    End: "End",
    Home: "Home",
    ArrowLeft: "ArrowLeft",
    ArrowUp: "ArrowUp",
    ArrowRight: "ArrowRight",
    ArrowDown: "ArrowDown",
    Delete: "Delete"
  };

  /*!
   * This software or document includes material copied from or derived from https://www.w3.org/WAI/content-assets/wai-aria-practices/patterns/listbox/examples/js/listbox.js
   * Copyright © 2023 World Wide Web Consortium. https://www.w3.org/Consortium/Legal/2023/doc-license
   *
   */
  function makeAccessibleListbox(elem) {
    elem.setAttribute("role", "listbox");
    elem.setAttribute("tabindex", "0");
    elem.setAttribute("aria-activedescendant", "");
    elem.setAttribute("aria-multiselectable", "true");
    var activeDescendantId = null;
    var startRangeIndex = 0;
    var keysSoFar = "";
    var clearKeysSoFarHandle = null;
    var latestSelectedOption = null;

    elem.addEventListener("keydown", onKeyPress);
    elem.addEventListener("click", onClick);

    return {
      destroy: destroy,
      clearSelectedOptions: clearSelectedOptions,
      clearActiveOption: clearActiveOption,
      getSelectedOptions: getSelectedOptions
    };

    function destroy() {
      elem.removeEventListener("keydown", onKeyPress);
      elem.removeEventListener("click", onClick);
    }

    function clearSelectedOptions() {
      var allOptions = getAllOptions();
      for (var i = 0; i < allOptions.length; i++) {
        allOptions[i].classList.remove("selected");
        allOptions[i].removeAttribute("aria-selected");
      }
      latestSelectedOption = null;
    }

    function clearActiveOption() {
      activeDescendantId = "";
      var activeOption = getActiveOption();
      if (activeOption) {
        activeOption.classList.remove("active-descendant");
      }
      elem.setAttribute("aria-activedescendant", "");
    }

    function getSelectedOptions() {
      return elem.querySelectorAll('[aria-selected="true"]');
    }

    function getActiveOption() {
      return document.getElementById(activeDescendantId);
    }

    /**
     * Check if an item is clicked on. If so, focus on it and select it.
     *
     * @param {MouseEvent} evt - The click event object.
     */
    function onClick(evt) {
      if (evt.target.getAttribute("role") !== "option") {
        return;
      }

      setActiveOption(evt.target);
      toggleSelected(evt.target);
      scrollActiveOptionIntoView();

      if (evt.shiftKey) {
        selectRange(startRangeIndex, evt.target);
      }
    }

    /**
     * Handle various keyboard controls; UP/DOWN will shift focus; SPACE selects an item.
     *
     * @param {KeyboardEvent} evt - The keydown event object.
     */
    function onKeyPress(evt) {
      var key = evt.key;
      var lastActiveId = activeDescendantId;
      var currentItem = getActiveOption() || getAllOptions()[0];
      var nextItem = currentItem;

      if (!currentItem) {
        return;
      }

      switch (key) {
        case keys.PageUp:
        case keys.PageDown:
          break;
        case keys.ArrowUp:
        case keys.ArrowDown:
          evt.preventDefault();
          if (!activeDescendantId) {
            // focus first option if no option was previously focused, and perform no other actions
            setActiveOption(currentItem);
            break;
          }

          if (key === keys.ArrowUp) {
            nextItem = findPreviousOption(currentItem);
          } else {
            nextItem = findNextOption(currentItem);
          }

          if (nextItem && event.shiftKey) {
            selectRange(startRangeIndex, nextItem);
          }

          if (nextItem) {
            setActiveOption(nextItem);
            evt.preventDefault();
          }

          break;
        case keys.Home:
          evt.preventDefault();
          setActiveFirstOption();

          if (evt.shiftKey && evt.ctrlKey) {
            selectRange(startRangeIndex, 0);
          }
          break;
        case keys.End:
          evt.preventDefault();
          setActiveLastOption();

          if (evt.shiftKey && evt.ctrlKey) {
            selectRange(startRangeIndex, getAllOptions().length - 1);
          }
          break;
        case keys.Shift:
          startRangeIndex = getOptionIndex(currentItem);
          break;
        case keys.Space:
          evt.preventDefault();
          if (evt.shiftKey) {
            selectOptions();
          } else {
            toggleSelected(nextItem);
          }
          break;
        case keys.a:
        case keys.A:
          // handle control + A
          if (evt.ctrlKey || evt.metaKey) {
            evt.preventDefault();
            selectRange(0, getAllOptions().length - 1);
            break;
          }
          // fall through for Type-ahead
        default:
          var character = key.toUpperCase();
          var startIndex = !keysSoFar ? getActiveOptionIndex() : null;

          keysSoFar += character;

          clearKeysSoFarAfterDelay();

          var optionToFocus = findOption(keysSoFar, startIndex);
          if (optionToFocus) {
            setActiveOption(optionToFocus);
          }
          break;
      }

      if (activeDescendantId !== lastActiveId) {
        scrollActiveOptionIntoView();
      }
    }

    /**
     * Selects contiguous options from the most recently selected option to the focused option.
     */
    function selectOptions() {
      var latestSelectedOptionIndex = getOptionIndex(latestSelectedOption);
      if (latestSelectedOptionIndex < 0) {
        return;
      }

      var allOptions = getAllOptions();
      var start = latestSelectedOptionIndex <= startRangeIndex ? latestSelectedOptionIndex : startRangeIndex;
      var end = latestSelectedOptionIndex <= startRangeIndex ? startRangeIndex : latestSelectedOptionIndex;
      for (var index = start; index <= end; index++) {
        allOptions[index].setAttribute("aria-selected", true);
        allOptions[index].classList.add("selected");

        if (index == end) {
          latestSelectedOption = allOptions[index];
        }
      }
    }

    /**
     * Helper function to check if a number is within a range; no side effects.
     *
     * @param {number} index - option index to be searched for.
     * @param {number} start - search starts at this option index.
     * @param {number} end - search ends at this option index.
     * @return {boolean} - true if the number falls within the range else false.
     */
    function checkInRange(index, start, end) {
      var rangeStart = start < end ? start : end;
      var rangeEnd = start < end ? end : start;

      return index >= rangeStart && index <= rangeEnd;
    }

    /**
     * Select a range of options.
     *
     * @param {number} start - Options are selected from this index.
     * @param {number} end - Options are selected till this index.
     */
    function selectRange(start, end) {
      // get start/end indices
      var allOptions = getAllOptionsArray();
      var startIndex = typeof start === "number" ? start : allOptions.indexOf(start);
      var endIndex = typeof end === "number" ? end : allOptions.indexOf(end);

      for (var index = 0; index < allOptions.length; index++) {
        var selected = checkInRange(index, startIndex, endIndex);
        allOptions[index].setAttribute("aria-selected", selected + "");
        if (selected) {
          allOptions[index].classList.add("selected");
        } else {
          allOptions[index].classList.remove("selected");
        }

        if (index == endIndex) {
          latestSelectedOption = allOptions[index];
        }
      }
    }

    /**
     * Sets the first option as the active option.
     */
    function setActiveFirstOption() {
      var firstItem = elem.querySelector('[role="option"]');
      if (firstItem) {
        setActiveOption(firstItem);
      }
    }

    /**
     * Sets the Last option as the active option.
     */
    function setActiveLastOption() {
      var itemList = getAllOptions();
      if (itemList.length) {
        setActiveOption(itemList[itemList.length - 1]);
      }
    }

    /**
     * Sets the specified item as active option.
     *
     * @param {Element} element - The element to focus
     */
    function setActiveOption(element) {
      var activeOption = getActiveOption();
      if (activeOption) {
        activeOption.classList.remove("active-descendant");
      }
      element.classList.add("active-descendant");
      elem.setAttribute("aria-activedescendant", element.id);
      activeDescendantId = element.id;
    }

    /**
     * Return the previous listbox option, if it exists; otherwise, returns null.
     */
    function findPreviousOption(currentOption) {
      // get options array
      var allOptions = getAllOptionsArray();
      var currentOptionIndex = allOptions.indexOf(currentOption);
      var previousOption = null;

      if (currentOptionIndex > 0) {
        previousOption = allOptions[currentOptionIndex - 1];
      }

      return previousOption;
    }

    /**
     * Return the next listbox option, if it exists; otherwise, returns null.
     */
    function findNextOption(currentOption) {
      // get options array
      var allOptions = getAllOptionsArray();
      var currentOptionIndex = allOptions.indexOf(currentOption);

      if (currentOptionIndex > -1 && currentOptionIndex < allOptions.length - 1) {
        return allOptions[currentOptionIndex + 1];
      }
    }

    function getAllOptions() {
      return elem.querySelectorAll('[role="option"]');
    }

    function getAllOptionsArray() {
      return Array.from(getAllOptions());
    }

    function getActiveOptionIndex() {
      return getOptionIndex(getActiveOption());
    }

    function getOptionIndex(option) {
      if (option == null) {
        return -1;
      }
      return getAllOptionsArray().indexOf(option);
    }

    /**
     * Toggle the aria-selected value.
     *
     * @param {Element} element - The element to select
     */
    function toggleSelected(element) {
      var isAriaSelected = (element.getAttribute("aria-selected") === "true");
      if (isAriaSelected) {
        element.setAttribute("aria-selected", "false");
        element.classList.remove("selected");
      } else {
        element.setAttribute("aria-selected", "true");
        element.classList.add("selected");
        latestSelectedOption = element;
      }
    }

    /**
     * Check if the selected option is in view, and scroll if not.
     */
    function scrollActiveOptionIntoView() {
      var selectedOption = getActiveOption();
      if (selectedOption && elem.scrollHeight > elem.clientHeight) {
        var scrollBottom = elem.clientHeight + elem.scrollTop;
        var elementBottom = selectedOption.offsetTop + selectedOption.offsetHeight;
        if (elementBottom > scrollBottom) {
          elem.scrollTop = elementBottom - elem.clientHeight;
        } else if (selectedOption.offsetTop < elem.scrollTop) {
          elem.scrollTop = selectedOption.offsetTop;
        }
      }
    }

    function findOption(searchText, startIndex) {
      if (startIndex == null || startIndex < 0) {
        startIndex = 0;
      }

      var allOptions = getAllOptions();
      // Try to find after startIndex first or search behind
      return findMatchInRange(searchText, allOptions, startIndex + 1, allOptions.length) ||
          findMatchInRange(searchText, allOptions, 0, startIndex);
    }

    function findMatchInRange(searchText, list, startIndex, endIndex) {
      // Find the first item starting with the keysSoFar substring, searching in
      // the specified range of items
      for (var n = startIndex; n < endIndex; n++) {
        var label = list[n].innerText;
        if (label && label.toUpperCase().indexOf(searchText) === 0) {
          return list[n];
        }
      }
      return null;
    }

    function clearKeysSoFarAfterDelay() {
      // Restart delay if ongoing.
      if (clearKeysSoFarHandle != null) {
        clearTimeout(clearKeysSoFarHandle);
      }

      clearKeysSoFarHandle = setTimeout(function() {
        keysSoFar = "";
        clearKeysSoFarHandle = null;
      }, 500);
    }

  }

  function makeAccessibleActionButton(elem, isToggleButton) {
    elem.role = "button";
    elem.tabIndex = 0;

    elem.addEventListener('mousedown', actionButtonMouseDownHandler);
    elem.addEventListener('keydown', actionButtonKeyDownHandler);
    elem.addEventListener('keyup', actionButtonKeyUpHandler);

    return createDisposable(function dispose() {
      elem.removeEventListener('keydown', actionButtonKeyDownHandler);
      elem.removeEventListener('keyup', actionButtonKeyUpHandler);
    });

    function actionButtonMouseDownHandler(event) {
      // Mouse-down'ing on a button-like element should focus it.
      // This already happens for certain HTML elements by default, but not all.
      if(!event.defaultPrevented && focusUtil.isTabbable(elem, {focusable: true})) {
        elem.focus();
      }
    }

    function actionButtonKeyDownHandler(event) {
      // The action button is activated by space on the keyup event, but the
      // default action for space is already triggered on keydown. It needs to be
      // prevented to stop scrolling the page before activating the button.
      if (event.keyCode === keyCodes.space) {
        event.preventDefault();
      } else if (event.keyCode === keyCodes.enter) {
        // If enter is pressed, activate the button
        event.preventDefault();
        handleToggleButton();
        elem.click();
      }
    }

    function actionButtonKeyUpHandler(event) {
      if (event.keyCode === keyCodes.space) {
        event.preventDefault();
        handleToggleButton()
        elem.click();
      }
    }

    function handleToggleButton() {
      if (isToggleButton) {
        toggleButtonState();
      }
    }

    function toggleButtonState() {
      var isAriaPressed = elem.getAttribute("aria-pressed") === "true";
      elem.setAttribute("aria-pressed", String(!isAriaPressed));
    }
  }

  function createDisposable(dispose) {
    dispose.remove = dispose;

    return dispose;
  }

  function createNullDisposable() {
    return createDisposable(function nullDispose() {
      // NOOP
    });
  }

  return {
    keyCodes: keyCodes,
    keys: keys,

    makeAccessibleListbox: makeAccessibleListbox,

    makeAccessibleActionButton: function (elem) {
      if (elem == null) {
        return createNullDisposable();
      }

      return makeAccessibleActionButton(elem, false);
    },

    makeAccessibleToggleButton: function (elem, initialState) {
      if (elem == null) {
        return createNullDisposable();
      }

      elem.setAttribute("aria-pressed", initialState);
      return makeAccessibleActionButton(elem, true)
    }
  };
});
