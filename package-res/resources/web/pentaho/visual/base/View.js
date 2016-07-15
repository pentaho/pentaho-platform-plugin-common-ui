/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/lang/EventSource",
  "./events/DidCreate",
  "./events/WillUpdate",
  "./events/DidUpdate",
  "./events/RejectedUpdate",
  "pentaho/lang/ActionResult",
  "pentaho/data/filter",
  "pentaho/util/error",
  "pentaho/util/logger",
  "pentaho/shim/es6-promise"
], function(Base, EventSource, DidCreate, WillUpdate, DidUpdate, RejectedUpdate, ActionResult,
            filter, error, logger, Promise) {

  "use strict";

  /**
   * @name pentaho.visual.base.View
   * @memberOf pentaho.visual.base
   * @class
   * @extends pentaho.lang.Base
   * @abstract
   * @amd pentaho/visual/base/View
   *
   * @classDesc This is the base class for visualizations.
   *
   * A container is expected to instantiate a `View` with a reference to a `Model` instance,
   * which may not be immediately valid.
   *
   * Over time, the container mutates the `Model` instance and triggers events.
   * In response, the method [_onChange]{@link pentaho.visual.base.View#_onChange} is
   * invoked to process the events, which may cause the `View` to update itself.
   *
   * @description Initializes a `View` instance.
   *
   * @constructor
   * @param {pentaho.visual.base.Model} model - The base visualization `Model`.
   */

  var View = Base.extend(/** @lends pentaho.visual.base.View# */{

    constructor: function(model) {

      if(!model)
        throw error.argRequired("model");

      /**
       * The DOM node where the visualization should render.
       * @type {?(Node|Text|HTMLElement)}
       * @protected
       * @readonly
       */
      this._domNode = null;

      /**
       * The model of the visualization.
       * @type {pentaho.visual.base.Model}
       * @readonly
       */
      this.model = model;

      /**
       * Indicates when an update is in progress.
       * @type {boolean}
       * @readonly
       */
      this._isUpdating = false;

      this._init();
    },

    /**
     * Gets the view's DOM node.
     *
     * @type {?(Node|Text|HTMLElement)}
     */
    get domNode() {
      return this._domNode;
    },

    /**
     * Gets the context of the view's model.
     *
     * This getter is syntax sugar for `this.model.type.context`.
     *
     * @type {pentaho.type.Context}
     */
    get context() {
      return this.model.type.context;
    },

    /**
     * Gets the value that indicates if an update is in progress.
     *
     * @type {!boolean}
     */
    get isUpdating() {
      return this._isUpdating;
    },

    /**
     * Orchestrates the rendering of the visualization and is meant to be invoked by the container.
     *
     * Executes [_update]{@link pentaho.visual.base.View#_update} asynchronously in
     * the will/did/rejected event loop associated with an update of a visualization,
     * and also creates the visualization DOM node the first time it successfully updates.
     *
     * In order to get the visualization DOM node,
     * listen to the {@link pentaho.visual.base.events.DidCreate|"did:create"} event.
     *
     * @return {Promise} A promise that is fulfilled when the visualization
     * is completely rendered. If the visualization is in an invalid state, the promise
     * is immediately rejected.
     *
     * @fires "will:update"
     * @fires "did:update"
     * @fires "rejected:update"
     * @fires "did:create"
     */
    update: function() {
      if(this.isUpdating) return Promise.reject(new Error("Previous update still in progress!"));

      this._isUpdating = true;

      var willUpdate;
      if(this._hasListeners(WillUpdate.type)) {
        willUpdate = new WillUpdate(this);
        this._emitSafe(willUpdate);
      }

      if(willUpdate && willUpdate.isCanceled) {
        this._isUpdating = false;

        if(this._hasListeners(RejectedUpdate.type))
          this._emitSafe(new RejectedUpdate(this, willUpdate.cancelReason));

        return Promise.reject(willUpdate.cancelReason);
      }

      var me = this, hadDomNode = this.domNode;
      return Promise.resolve(me._doUpdate()).then(function() {
          if(!hadDomNode && me.domNode && me._hasListeners(DidCreate.type))
            me._emitSafe(new DidCreate(me));

          me._isUpdating = false;

          if(me._hasListeners(DidUpdate.type))
            me._emitSafe(new DidUpdate(me));

        }, function(reason) {
          me._isUpdating = false;

          if(me._hasListeners(RejectedUpdate.type))
            me._emitSafe(new RejectedUpdate(me, reason.error));

          return Promise.reject(reason.error);
        });
    },

    /**
     * Updates a visualization.
     *
     * If the visualization is valid, the visualization element will be created on the first update
     * and proceed with the visualization update; otherwise, it will be rejected and prevent the update.
     *
     * @return {Promise} A promise that is fulfilled when the visualization
     * is completely rendered. If the visualization is in an invalid state, the promise
     * is immediately rejected.
     * 
     * @protected
     */
    _doUpdate: function() {
      var validationErrors = this._validate();
      if(validationErrors) {
        var error = "View update was rejected:\n - " +
          (Array.isArray(validationErrors) ? validationErrors.join("\n - ") : validationErrors);

        return Promise.reject(ActionResult.reject(error));
      }

      try {
        return Promise.resolve(this._update());
      } catch(e) {
        return Promise.reject(ActionResult.reject(e.message));
      }

    },

    /**
     * Called before the visualization is discarded.
     */
    dispose: function() {
      this._domNode = null;
    },

    /**
     * Sets the DOM node that the visualization will use to render itself.
     * 
     * @param {?(Node|Text|HTMLElement)} domNode - Visualization's DOM node.
     * @protected
     */
    _setDomNode: function(domNode) {
      if(!domNode)  throw error.argRequired("domNode");
      
      if(this._domNode && domNode !== this._domNode)
        throw new Error("Can't change the visualization dom node once it is set.");

      this._domNode = domNode;
    },

    /**
     * Initializes the visualization.
     *
     * This method is invoked by the constructor of `pentaho.visual.base.View`.
     * Override this method to perform initialization tasks,
     * such as setting up event listeners.
     *
     * @protected
     */
    _init: function() {
      this.model.on("did:change", function(event) {
        this._onChange(event.changeset);
      }.bind(this));
    },

    /**
     * Validates the current state of the visualization.
     *
     * By default, this method simply calls {@link pentaho.visual.base.Model#validate}
     * to validate the model.
     *
     * @return {?Array.<!pentaho.type.ValidationError>} A non-empty array of errors or `null`.
     * @protected
     */
    _validate: function() {
      var validationErrors = this.model.validate();
      return validationErrors;
    },

    /**
     * Determines if the visualization is in a valid state.
     *
     * A visualization in an invalid state should not be rendered.
     *
     * @return {boolean} Returns `true` if this visualization is valid, or `false` if not valid.
     * @protected
     * @see pentaho.visual.base.View#_validate
     */
    _isValid: function() {
      return !this._validate();
    },

    /**
     * Renders the visualization.
     *
     * Subclasses of `pentaho.visual.base.View` must override this method
     * and implement a complete rendering of the visualization.
     *
     * @protected
     * @abstract
     */
    _update: /* istanbul ignore next: placeholder method */ function() {
      throw error.notImplemented("_update");
    },

    /**
     * Updates the visualization, taking into account that
     * only the dimensions have changed.
     *
     * Subclasses of `pentaho.visual.base.View` are expected to override this method to
     * implement a fast and cheap resizing of the visualization.
     * By default, this method invokes [_update]{@link pentaho.visual.base.View#_update}.
     *
     * @protected
     */
    _resize: /* istanbul ignore next: placeholder method */ function() {
      this._update();
    },

    /**
     * Updates the visualization, taking into account that
     * only the selection has changed.
     *
     * Subclasses of `pentaho.visual.base.View` are expected to override this method
     * with an implementation that
     * updates the selection state of the items displayed by this visualization.
     * By default, this method invokes [_update]{@link pentaho.visual.base.View#_update}.
     *
     * @protected
     */
    _selectionChanged:
    /* istanbul ignore next: placeholder method */function(newSelectionFilter, previousSelectionFilter) {
      this._update();
    },

    /**
     * Decides how the visualization should react
     * to a modification of its properties.
     *
     * By default, this method selects the cheapest reaction to a change of properties.
     * It invokes:
     * - [_resize]{@link pentaho.visual.base.View#_resize} when either of the properties
     * [width]{@link pentaho.visual.base.Model.Type#width} or
     * [height]{@link pentaho.visual.base.Model.Type#height} change,
     * - [_selectionChanged]{@link pentaho.visual.base.View#_selectionChanged} when the property
     * [selectionFilter]{@link pentaho.visual.base.Model.Type#selectionFilter} changes
     * - [_update]{@link pentaho.visual.base.View#_update} when any other property changes.
     *
     * Subclasses of `pentaho.visual.base.View` can override this method to
     * extend the set of fast render methods.
     *
     * @see pentaho.visual.base.View#_resize
     * @see pentaho.visual.base.View#_selectionChanged
     * @see pentaho.visual.base.View#_update
     *
     * @param {!pentaho.type.Changeset} changeset - Map of the properties that have changed.
     *
     * @protected
     */
    _onChange: function(changeset) {
      if(!changeset.hasChanges) return;

      var exclusionList = {
        width: true,
        height: true,
        selectionMode: true, // never has a direct visual impact
        selectionFilter: true
      };

      var fullUpdate = changeset.propertyNames.some(function(p) { return !exclusionList[p]; });
      if(fullUpdate) {
        this.update().then(function() {
          logger.info("Auto-update succeeded!");
        }, function(errors) {
          logger.warn("Auto-update canceled:\n - " +
              (Array.isArray(errors) ? errors.join("\n - ") : errors));
        });
        return;
      }

      var updateSelection = changeset.hasChange("selectionFilter");
      if(updateSelection) {
        var newFilter = this.model.selectionFilter;
        var oldValue = changeset.getOld("selectionFilter");
        this._selectionChanged(newFilter, oldValue != null ? oldValue.value : null);
      }

      var updateSize = changeset.hasChange("width") || changeset.hasChange("height");
      if(updateSize) this._resize();
    }
  }).implement(EventSource);

  return View;

});
