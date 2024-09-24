/*!
 * Copyright 2019 Hitachi Vantara. All rights reserved.
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
define([
  "pentaho/module/util",
  "pentaho/visual/util",
  "pentaho/visual/action/Execute",
  "pentaho/visual/action/Select",
  "pentaho/util/object"
], function(moduleUtil, visualUtil, ExecuteAction, SelectAction, O) {

  "use strict";

  /* globals window */

  function Sandbox(spec) {

    this._vizContainerId = spec.container;
    this._msgContainerId = spec.messages;

    // Get the versioned module identifier.
    this._vizTypeId = moduleUtil.resolveModuleId(spec.id);

    this._modelSpec = spec.spec || {};

    this.model = null;
    this.view = null;
  }

  Sandbox.prototype.renderAsync = function() {

    return visualUtil.getModelAndDefaultViewClassesAsync(this._vizTypeId)
      .then(function(classes) {
        return this._createAndUpdateViz(classes.Model, classes.View, classes.viewTypeId);
      }.bind(this), function(error) {
        window.alert(error.message);
      });
  };

  Sandbox.prototype._createAndUpdateViz = function(Model, View, viewTypeId) {

    // Get the DOM container.
    var domContainer = document.getElementById(this._vizContainerId);

    // Measure it.
    var rect = domContainer.getBoundingClientRect();

    var modelSpec = O.assignOwn({}, this._modelSpec);
    modelSpec.width = rect.width;
    modelSpec.height = rect.height;

    var model = new Model(modelSpec);

    // Handle the execute action.
    model.on(ExecuteAction.id, {
      "do": function(event, action) {
        this._showMessage("Executed " + action.dataFilter.$contentKey);
      }.bind(this)
    });

    // Handle the select action.
    model.on(SelectAction.id, {
      "finally": function(event, action) {
        this._showMessage("Selected: " + model.selectionFilter.$contentKey);
      }.bind(this)
    });

    // Mark the container with the model's CSS classes, for styling purposes.
    domContainer.className = visualUtil.getCssClasses(this._vizTypeId, viewTypeId);

    var view = new View({model: model, domContainer: domContainer});

    setupWindowResizeHandler(model, domContainer);
    setupWindowUnloadHandler(this);

    this.model = model;
    this.view = view;

    // Render the visualization.
    return model.update();
  };

  Sandbox.prototype._showMessage = function(text) {
    document.getElementById(this._msgContainerId).innerText = text;
  };

  Sandbox.prototype.dispose = function() {
    if(this.view) {
      this.view.dispose();
      this.view = this.model = null;

      window.onunload = null;
      window.onresize = null;
    }
  };

  return Sandbox;

  function setupWindowResizeHandler(model, domContainer) {
    window.onresize = function() {
      // TODO: throttle
      var rect = domContainer.getBoundingClientRect();

      model.configure({
        width: rect.width,
        height: rect.height
      });
    };
  }

  function setupWindowUnloadHandler(sandbox) {

    window.onunload = function() {
      window.onunload = null;
      window.onresize = null;

      sandbox.dispose();
    };
  }
});
