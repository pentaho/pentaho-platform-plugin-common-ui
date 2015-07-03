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
