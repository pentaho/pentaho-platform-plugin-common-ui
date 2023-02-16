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
 * Copyright (c) 2002-2023 Hitachi Vantara..  All rights reserved.
 */

define(function () {

  var keyCodes = {
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

  function makeAccessibleActionButton(elem, isToggleButton) {
    elem.role = "button";
    elem.tabIndex = 0;

    elem.addEventListener('keydown', actionButtonKeyDownHandler);
    elem.addEventListener('keyup', actionButtonKeyUpHandler);

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

  return {
    keyCodes: keyCodes,
    makeAccessibleActionButton: function (elem) {
      makeAccessibleActionButton(elem, false);
    },
    makeAccessibleToggleButton: function (elem, initialState) {
      elem.setAttribute("aria-pressed", initialState);
      makeAccessibleActionButton(elem, true)
    }
  };
});
