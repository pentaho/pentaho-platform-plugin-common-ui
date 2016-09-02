define([
  "pentaho/util/object",
  "pentaho/util/logger",
  "pentaho/visual/base/types/selectionModes",
  "pentaho/type/filter/tree",
  "pentaho/type/filter/property",
  "pentaho/type/filter/isEqual",
  "pentaho/type/filter/KnownFilterKind"
], function(O, logger, selectionModes, treeFilterFactory, propFilterFactory, isEqualFilterFactory, KnownFilterKind) {

  "use strict";

  /* global window:false */

  return {
    // Temporary. Used for demos
    _init: function() {

      this.base();

      // var model = this.model;
      // var context = model.type.context;

      // region Demo of BACKLOG-6739
      this._renderCounter = 0;
      // endregion

      // region Demo of BACKLOG-5985
      /*
      window.addEventListener("keypress", this._onKeyPress.bind(this), false);
      model.on("will:select",  context.inject([treeFilterFactory, propFilterFactory], this._onWillSelect, this));
      */
      // endregion

      // region Demo of BACKLOG-5989
      /*
      model.doExecute = context.inject([isEqualFilterFactory], this._doExecute, this);
      model.on("will:execute", this._onWillExecute.bind(this));
      */
      // endregion

      // region Used for demo of ...
      /*
      this._verifyChange  = !true; // enabled/disabled
      model.on("will:change",  this._onWillChange.bind(this));
      */
      // endregion
    },

    // Temporary. Used for demo of BACKLOG-5985
    _onWillSelect: function(TreeFilter, PropFilter, event) {

      // Remove restrictions on the properties that span multiple charts.

      var multi = this._getAttributeInfosOfRole(this._multiRole);
      if(!multi) return;

      var isNotMultiPropertyFilter = function(oper) {
            return !(oper instanceof PropFilter) || !this._isAttributeInRole(oper.property, this._multiRole);
          }.bind(this);

      var visitor = function(node) {
        // An and/or container node.
        // Remove property operands of "multi" visual role properties.
        if(node instanceof TreeFilter) {
          var opers = node.visitOperands(visitor, {where: isNotMultiPropertyFilter});
          // If opers not null, it is because there was at least one multi property filtered out
          if(opers) {
            return new node.constructor({operands: opers});
          }
        }
      };

      event.dataFilter = event.dataFilter.visit(visitor);

      logger.log("Event:" + event.type.id);
    },

    _isAttributeInRole: function(attrName, roleName) {
      var roles = O.getOwn(this._getInverseVisualMap(), attrName);
      return roles != null && roles.indexOf(roleName) >= 0;
    },

    // Temporary. Used for demo of BACKLOG-5989
    _onWillExecute: function(event) {
      logger.log("Event:" + event.type);
    },

    // Temporary. Used for demo of BACKLOG-5989
    _doExecute: function(dataFilter) {
      var queryValue;

      function getFilterValue(filter) {
        return window.encodeURIComponent(filter.value);
      }

      if(dataFilter.kind === KnownFilterKind.IsEqual)
        queryValue = getFilterValue(dataFilter);
      else
        queryValue = dataFilter.operands.toArray(getFilterValue).join("+");

      var url = 'http://www.google.com/search?as_q="' + queryValue + '"';

      window.open(url, "_blank");

      logger.log("Google Search:" + url);
    },

    // Temporary. Used for demo of...
    _onKeyPress: function(event) {

      var ignoreTags = ["TEXTAREA", "INPUT"];
      if(ignoreTags.includes(event.target.tagName))
        return;

      var mode = {
          "KeyA": selectionModes.ADD,
          "KeyD": selectionModes.REMOVE,
          "KeyR": selectionModes.REPLACE,
          "KeyT": selectionModes.TOGGLE
        };

      var selectionMode = mode[event.code];
      if(selectionMode) this.model.selectionMode = selectionMode;
    },

    // Temporary. Used for demo of BACKLOG-6739
    _renderCore: function() {
      this.base();
      this._renderCounter++;
    },

    // Temporary. Used for demo of ...
    _onWillChange: function(event) {
      var changeset = event.changeset;
      changeset.propertyNames.forEach(function(propName) {
        if(this._verifyChange && (propName === "width" || propName === "height")) {
          var result = window.confirm(propName + " changed. Do you really want to resize?");
          if(result === false)
            event.cancel("User canceled");
        }
      }, this);
    }
  };
});
