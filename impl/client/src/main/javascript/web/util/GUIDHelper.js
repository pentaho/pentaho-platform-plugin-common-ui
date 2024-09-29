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

  define(['cdf/lib/Base'], function (Base) {
  /**
   * Simple array of used Prompt GUIDs so they and their components can be uniquely identified.
   */

  var _assignedGUIDs = {};
  var _gen = function () {
    return Math.round(Math.random() * 100000);
  };

  return Base.extend({
    /**
     * Generates a random id
     *
     * @returns {string}
     */
    _assignedGUIDs: {},

    generateGUID: function () {
      var guid = _gen();
      while (_assignedGUIDs[guid]) {
        guid = _gen();
      }
      _assignedGUIDs[guid] = true;
      return '' + guid;
    },

    /**
     * Reset the collection of assigned GUIDs
     */
    reset: function () {
      _assignedGUIDs = {};
    }
  });
});
