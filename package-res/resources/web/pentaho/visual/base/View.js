/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/lang/Base",
  "pentaho/util/error",
  "pentaho/shim/es6-promise"
], function(Base, error, Promise) {

  "use strict";

  /**
   * @name View
   * @memberOf pentaho.visual.base
   * @class
   * @extends pentaho.lang.Base
   * @abstract
   * @classDesc This is the base class for visualizations.
   *
   * @description Creates a base `View` instance.
   * @constructor
   * @throws {Error} A valid DOM element must be passed to the constructor.
   * @param {HTMLElement} element The DOM element where the visualization should render.
   * @param {pentaho.visual.base.Model} model The base visualization `Model`.
   */

  var View = Base.extend(/** @lends pentaho.visual.base.View# */{
    constructor: function(element, model) {
      if(!isElement(element)) {
        throw error.argInvalidType("element", "HTMLElement");
      } else {
        this.element = element;
      }
      this.model = model;
      this._init();
    },
    /**
     * Renders the visualization.
     *
     * @return {Promise} A promise that is fulfilled when the visualization
     * is completely rendered.
     */
    render: function() {
      var me = this;
      return new Promise(function(resolve, reject) {
        Promise.resolve(me._render()).then(resolve, reject);
      });
    },
    /**
     * Called before the visualization is discarded.
     */
    dispose: function(){

    },
    /**
     * Initializes the visualization.
     *
     * @protected
     */
    _init: function() {
      //this.model.on("change", this._onChange);
    },
    /**
     * Renders the visualization.
     *
     * @protected
     */
    _render: function() {
      throw error.notImplemented("_render");
    },
    /**
     * Updates the visualization, taking into account that
     * only the dimensions have changed.
     *
     * @protected
     */
    _resize: function() {
      this._render();
    },
    /**
     * Updates the visualization, taking into account that
     * only the selection has changed.
     *
     * @protected
     */
    _selectionChanged: function(){
      this._render();
    },
    /**
     * Decides how the visualization should react
     * to a modification of its properties.
     *
     * @param {Object} changeMap Map of the properties that
     * have changed.
     * @protected
     */
    _onChange: function(changeMap) {
      this._render();
    }
  });

  return View;

  function isElement(obj) {
    return typeof HTMLElement === "object" ? obj instanceof HTMLElement : !!(obj && obj.nodeType === 1);
  }
});