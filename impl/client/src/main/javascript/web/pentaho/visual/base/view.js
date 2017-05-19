/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module",
  "pentaho/type/complex",
  "pentaho/type/filter/abstract",
  "pentaho/type/filter/or",
  "pentaho/type/changes/ComplexChangeset",
  "./model",
  "pentaho/type/action/base",
  "pentaho/i18n!view",
  "./events/WillUpdate",
  "./events/DidUpdate",
  "./events/RejectedUpdate",
  "pentaho/lang/UserError",
  "pentaho/util/object",
  "pentaho/util/arg",
  "pentaho/util/fun",
  "pentaho/util/BitSet",
  "pentaho/util/error",
  "pentaho/util/logger",
  "pentaho/util/promise",
  "pentaho/util/spec",
  "../action/standard"
], function(module, complexFactory, abstractFilterFactory, orFilterFactory, ComplexChangeset, visualModelFactory,
            baseActionFactory,
            bundle, WillUpdate, DidUpdate, RejectedUpdate, UserError,
            O, arg, F, BitSet, error, logger, promise, specUtil) {

  "use strict";

  /* global Promise:false */

  var _reUpdateMethodName = /^_update(.+)$/;

  var _emitActionKeyArgs = {
    errorHandler: function(ex, action) { action.fail(ex); },
    isCanceled: function(action) { return action.isCanceled; }
  };

  return function(context) {

    var Complex = context.get(complexFactory);
    var actionBaseType = context.get(baseActionFactory).type;

    var View = Complex.extend(/** @lends pentaho.visual.base.View# */{

      // TODO: Although the current code does, 7.1 doesn't support specs on act and actAsync.
      // Post-7.1, add this JsDoc to the "In reponse ..." paragraph:
      //
      // * Note that standard actions come pre-loaded with the `View` class,
      // * and can thus be safely constructed synchronously from View derived classes.

      /**
       * @alias View
       * @memberOf pentaho.visual.base
       *
       * @class
       * @extends pentaho.type.Complex
       * @implements pentaho.lang.IDisposable
       * @implements pentaho.type.action.ITarget
       *
       * @abstract
       * @amd {pentaho.type.Factory<pentaho.visual.base.View>} pentaho/visual/base/view
       *
       * @classDesc This is the base class for views of visualizations.
       *
       * A container is expected to instantiate a `View` given a specification with its main properties,
       * like the container DOM element, the `width`, `height` and `model`.
       * The model may not be immediately valid.
       * Alternatively, the container DOM element can be set at a later time,
       * using {@link pentaho.visual.base.View#domContainer}.
       *
       * In any case, the first rendering of the view must be explicitly triggered by a call to
       * [update]{@link pentaho.visual.base.View#update}.
       * This two-phase process allows a _container application_ to further configure a view,
       * for example, registering event listeners,
       * before the initial update.
       *
       * Over time, the view's model is mutated and, in response,
       * the view detects these changes, marks itself as [dirty]{@link pentaho.visual.base.View#isDirty},
       * and, by default, automatically updates itself.
       *
       * In response to the user interacting with the view,
       * it may perform [actions]{@link pentaho.visual.View#act},
       * such as the standard actions
       * [Select]{@link pentaho.visual.action.Select} and
       * [Execute]{@link pentaho.visual.action.Execute},
       * and emit events for these.
       *
       * When a view is no longer needed,
       * the _container application_ **must** call its [dispose]{@link pentaho.visual.base.View#dispose} method,
       * so that the view can free held _resources_ and not cause memory-leaks.
       *
       * @constructor
       * @description Creates a visualization `View` instance.
       * @param {pentaho.visual.base.spec.IViewEx} [viewSpec] - The extended view specification.
       *
       * @see pentaho.visual.base.spec.IView
       * @see pentaho.visual.base.spec.IViewType
       * @see pentaho.visual.action.Select
       * @see pentaho.visual.action.Execute
       */
      constructor: function(viewSpec) {

        this.base(viewSpec);

        /**
         * The container element where the view is rendered.
         *
         * @type {DOMElement}
         * @readOnly
         * @private
         */
        this.__domContainer = null;

        /**
         * The promise for the completion of the current update operation, if any; or `null`.
         *
         * @type {Promise}
         * @private
         */
        this.__updatingPromise = null;

        /**
         * Indicates if the view is automatically updated whenever the model is changed.
         *
         * @type {boolean}
         * @default true
         * @private
         */
        this.__isAutoUpdate = true;

        /**
         * The set of dirty property groups of the view.
         *
         * @type {!pentaho.util.BitSet}
         * @readOnly
         * @private
         */
        this.__dirtyPropGroups = new BitSet(View.PropertyGroups.All); // mark view as initially dirty

        // Initialize any special properties provided directly in viewSpec.
        if(viewSpec) {
          if(viewSpec.domContainer) this.domContainer = viewSpec.domContainer;
          if(viewSpec.isAutoUpdate != null) this.isAutoUpdate = viewSpec.isAutoUpdate;
        }

        // Let any mixins initialize.
        this._init(viewSpec);
      },

      /**
       * Called when the view is constructed.
       *
       * Override this method, from a configuration mixin class,
       * to perform any initialization.
       *
       * @param {pentaho.visual.base.spec.IViewEx} viewSpec - The view specification provided at construction time,
       * if any.
       * @protected
       */
      _init: function(viewSpec) {
        // NOOP
      },

      // region Properties

      // region domContainer
      /**
       * Gets or sets the container DOM element where the view is rendered.
       *
       * The container element is the viewport through which the view's rendered content is revealed.
       * and is provided empty, for the exclusive use of the view, by the _container application_.
       *
       * Its _content_ is owned by the view,
       * but its attributes (including style) are owned by the container application and
       * must **not** be changed by the view.
       *
       * Its size is controlled by the container application and does not need to be the same as
       * that implied by the visual model's
       * [width]{@link pentaho.visual.base.Model#width} and
       * [height]{@link pentaho.visual.base.Model#height} properties,
       * however, normally, it will.
       *
       * It is the responsibility of the container application to clean up the container element's content,
       * if needed, after the view is disposed of.
       * When disposed of, the view has the responsibility of cleaning up any DOM event handlers it
       * may hold on the container element or any of its children.
       *
       * @type {DOMElement}
       * @readOnly
       * @see pentaho.visual.base.View#_initDomContainer
       * @see pentaho.visual.base.View#_releaseDomContainer
       */
      get domContainer() {
        return this.__domContainer;
      },

      set domContainer(value) {
        if(!value) throw error.argRequired("domContainer");

        if(this.__domContainer) {
          if(value !== this.__domContainer)
            throw error.operInvalid("Cannot change 'domContainer' once set.");
          return;
        }

        // new domContainer

        this.__domContainer = value;

        this._initDomContainer();
      },

      /**
       * Called to initialize the DOM container, when it is set.
       *
       * Can be used to initialize the HTML content and/or to attach event handlers.
       * @protected
       */
      _initDomContainer: function() {
        // NOOP
      },

      /**
       * Called to release any references to the DOM container.
       *
       * It is the responsibility of the container application to clean up the container element's content,
       * when it is no longer needed.
       * On the other hand,
       * it is the responsibility of the view to clean up any DOM event handlers or references
       * it may hold on the container element or any of its children.
       *
       * Currently, this method is automatically called from the
       * [dispose]{@link pentaho.visual.base.View#dispose} method.
       *
       * The default implementation clears the DOM container property and unregisters from any DOM events.
       *
       * If an implementation has additional properties containing DOM nodes, or other attached DOM event handlers,
       * then it **must** override this method (and call base) and set these properties to `null`,
       * so that memory-leaks are not caused.
       *
       * @protected
       */
      _releaseDomContainer: function() {
        this.__domContainer = null;
      },
      // end region

      /**
       * Gets or sets a value that enables or disables automatic updates of the view.
       *
       * When `true`, the view is automatically updated whenever a relevant change in the model occurs.
       * When `false`, the view must be manually updated by calling [update]{@link pentaho.visual.base.View#update}.
       *
       * Setting this property to `true` does **not** cause the view to update in response,
       * if it is currently [dirty]{@link pentaho.visual.base.View#isDirty}.
       * This property only affects the view's behaviour in response to subsequent model changes.
       *
       * @type {boolean}
       */
      get isAutoUpdate() {
        return this.__isAutoUpdate;
      },

      set isAutoUpdate(value) {
        this.__isAutoUpdate = !!value;
      },
      // endregion

      // region State flags
      /**
       * Gets a value that indicates if an update is in progress.
       *
       * @type {boolean}
       * @readOnly
       * @see pentaho.visual.base.View#update
       */
      get isUpdating() {
        return !!this.__updatingPromise;
      },

      /**
       * Gets a value that indicates if the view is in a dirty state.
       *
       * A view is _dirty_ during the period after the view's model has changed to until the time the view is updated.
       *
       * During this period, the view **should not** handle any user interaction events,
       * as the user would be acting on an outdated representation of the model.
       *
       * @type {boolean}
       * @readOnly
       *
       * @see pentaho.visual.base.View#isAutoUpdate
       */
      get isDirty() {
        // Because dirty prop groups are cleared optimistically before update methods run,
        // it is needed to use isUpdating to not let that transient non-dirty state show through.
        return this.isUpdating || !this.__dirtyPropGroups.isEmpty;
      },
      // endregion

      // endregion

      // region Changes
      // @override ContainerMixin
      _onChangeDid: function(changeset) {

        var bitSetNew = new BitSet();

        this._onChangeClassify(bitSetNew, changeset);

        if(!bitSetNew.isEmpty) {

          this.__dirtyPropGroups.set(bitSetNew.get());

          this._onChangeDirty(bitSetNew);
        }

        // emit event

        this.base(changeset);
      },

      /**
       * Called when the view properties have changed.
       *
       * The default implementation marks the view as dirty.
       * More specifically, it marks the _property groups_ of the properties affected by the given changeset as dirty.
       *
       * The recognized property groups are those of
       * [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups}.
       *
       * Implementations can override this method to change the default behavior for some or all of the
       * model and view properties.
       *
       * @see pentaho.visual.base.View#_updateAll
       *
       * @param {!pentaho.util.BitSet} dirtyPropGroups - A bit set of property groups that should be set dirty.
       * Use the values of [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups} as bit values.
       *
       * @param {!pentaho.type.Changeset} changeset - The model's changeset.
       *
       * @protected
       */
      _onChangeClassify: function(dirtyPropGroups, changeset) {

        classify(this.constructor.__PropertyGroupOfProperty, changeset);

        function classify(groupsTree, changeset) {
          if(changeset instanceof ComplexChangeset) {
            changeset.propertyNames.forEach(function(name) {
              var dirtyGroupName;
              var result = groupsTree[name];
              if(result) {
                switch(typeof result) {
                  case "string":
                    dirtyGroupName = result;
                    break;
                  case "object":
                    return classify(result, changeset.getChange(name));
                  default:
                    throw new Error("Invalid property groups tree.");
                }
              } else {
                dirtyGroupName = "General";
              }

              dirtyPropGroups.set(View.PropertyGroups[dirtyGroupName]);
            });
          } else {
            // Whole model swapped?
            dirtyPropGroups.set(groupsTree._ || View.PropertyGroups.General);
          }
        }
      },

      /**
       * Called when a change caused relevant property groups to be marked as dirty.
       *
       * The default implementation auto-updates the view, if possible.
       *
       * @param {!pentaho.util.BitSet} dirtyPropGroups - A bit set of property groups that were changed.
       * Use the values of [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups} as bit values.
       *
       * @protected
       */
      _onChangeDirty: function(dirtyPropGroups) {

        if(this.__domContainer && this.isAutoUpdate) {

          /* eslint dot-notation: 0 */

          this.update()["catch"](function(error) {
            logger.warn("Auto-update was canceled: " + error);
          });
        }
      },
      // endregion

      // region Update
      /**
       * Updates the view to match its model's latest state.
       *
       * When [isAutoUpdate]{@link pentaho.visual.base.View#isAutoUpdate} is `true`,
       * any change to the view's model automatically triggers a view update by calling this method.
       *
       * The update operation is _generally_ asynchronous.
       * Even if the view implementation completes its update synchronously,
       * the completion is only advertised asynchronously,
       * through the emission of one of the events
       * [did:update]{@link pentaho.visual.base.events.DidUpdate} or
       * [rejected:update]{@link pentaho.visual.base.events.RejectedUpdate} and
       * the resolution of the returned promise.
       *
       * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property is `true` while the
       * update operation is considered in progress,
       * a period during which calling [update]{@link pentaho.visual.base.View#update} again
       * returns the same promise that was returned by the initial `update` call.
       *
       * If the view is not currently updating and is also not [dirty]{@link pentaho.visual.base.View#isDirty},
       * then calling `update` _immediately_ returns a fulfilled promise.
       *
       * Otherwise, by this time, [isUpdating]{@link pentaho.visual.base.View#isUpdating} will be `true`,
       * and the update operation proceeds to the **Will phase**.
       *
       * #### Will phase
       *
       * Initially, the [_updateWill]{@link pentaho.visual.base.View#_updateWill} method is called,
       * which by default emits the [will:update]{@link pentaho.visual.base.events.WillUpdate} event.
       * Either the implementation or the event listeners are allowed to cancel the update or further modify the model.
       *
       * If the update is _canceled_, the update is rejected with the cancel reason,
       * and enters the **Rejected phase**.
       *
       * #### Loop phase
       *
       * If the update is not canceled, the view enters an **update loop**
       * that only ends when either the view is up to date with the model
       * (in which case surely [isDirty]{@link pentaho.visual.base.View#isDirty} will be `false`),
       * or after some error occurs.
       *
       * On each iteration of the update loop:
       * 1. If the model is invalid, the update loop ends with a validation error and
       *    then the update operation proceeds to the **Rejected phase**;
       * 2. Otherwise, the "best fit" partial update method is selected and called to update the view;
       * 3. If the selected update method throws an error or returns a rejected promise,
       *    the update loop ends and the update operation proceeds to the **Rejected phase**;
       * 4. If the view is not [dirty]{@link pentaho.visual.base.View#isDirty} anymore,
       *    the update loop ends with success;
       * 5. Repeat.
       *
       * Over the view's lifetime, the very first "partial" update method that is selected is always the
       * full update method: [_updateAll]{@link pentaho.visual.base.View#_updateAll}.
       * Subsequent iterations may select _proper_ partial update methods, like
       * [_updateSize]{@link pentaho.visual.base.View#_updateSize} or
       * [_updateSelection]{@link pentaho.visual.base.View#_updateSelection}.
       *
       * #### Did phase
       *
       * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property will now be `false`.
       *
       * The [_onUpdateDid]{@link pentaho.visual.base.View#_onUpdateDid} method is called,
       * which by default emits the [did:update]{@link pentaho.visual.base.events.DidUpdate} event.
       *
       * The implementation or the event listeners are allowed to modify the model and thus trigger **new** updates
       * while in the _did_ phase.
       *
       * Lastly, the returned promise is fulfilled.
       *
       * #### Rejected phase
       *
       * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property will now be `false`.
       *
       * The [_onUpdateRejected]{@link pentaho.visual.base.View#_onUpdateRejected} method is called,
       * which by default emits the [rejected:update]{@link pentaho.visual.base.events.RejectedUpdate} event.
       *
       * The implementation or the event listeners are allowed to modify the model and thus trigger **new** updates
       * while in the _rejected_ phase.
       *
       * Lastly, the returned promise is rejected with the original error.
       *
       * @return {Promise} A promise that is fulfilled when the visualization is completely updated or
       * is rejected in case some error occurs.
       *
       * @fires "will:update"
       * @fires "rejected:update"
       * @fires "did:update"
       *
       * @see pentaho.visual.base.View#isAutoUpdate
       * @see pentaho.visual.base.View#isUpdating
       * @see pentaho.visual.base.View#isDirty
       *
       * @see pentaho.visual.base.View#_updateAll
       * @see pentaho.visual.base.View#_updateData
       * @see pentaho.visual.base.View#_updateSize
       * @see pentaho.visual.base.View#_updateSelection
       * @see pentaho.visual.base.View#_updateGeneral
       *
       * @see pentaho.visual.base.View#_onUpdateWill
       * @see pentaho.visual.base.View#_onUpdateDid
       * @see pentaho.visual.base.View#_onUpdateRejected
       */
      update: function() {

        var p = this.__updatingPromise;
        if(!p) {
          // Nothing to do?
          if(this.__dirtyPropGroups.isEmpty) {
            p = Promise.resolve();
          } else {
            var _resolve = null;
            var _reject = null;

            this.__updatingPromise = p = new Promise(function(resolve, reject) {
              // ignore the fulfillment value of returned promises
              _resolve = function() { resolve(); };
              _reject  = reject;
            });

            // Protect against overrides failing.
            var cancelReason;
            try {
              cancelReason = this._onUpdateWill();
            } catch(ex) { cancelReason = ex; }

            (cancelReason ? Promise.reject(cancelReason) : this.__updateLoop())
              .then(this.__onUpdateDidOuter.bind(this), this.__onUpdateRejectedOuter.bind(this))
              .then(_resolve, _reject);
          }
        }

        return p;
      },

      /**
       * Called when an update operation is going to be performed.
       *
       * The default implementation emits the [will:update]{@link pentaho.visual.base.events.WillUpdate} event.
       *
       * Either the implementation or the event listeners are allowed to cancel the update or further modify the model.
       *
       * The implementation can cancel the update by returning or throwing an error.
       *
       * @return {pentaho.lang.UserError} An error, containing the cancellation reason; or `null`.
       *
       * @protected
       *
       * @fires "will:update"
       */
      _onUpdateWill: function() {

        if(this._hasListeners(WillUpdate.type)) {

          var willUpdate = new WillUpdate(this);

          if(!this._emitSafe(willUpdate))
            return willUpdate.cancelReason;
        }

        return null;
      },

      /**
       * Performs the visualization update loop.
       *
       * On each iteration,
       * if the set of dirty property groups is empty, then the update loop ends successfully.
       *
       * Otherwise, the model is checked for validity; and, if it is not valid, the update loop is rejected.
       * If, on the other hand, the model is valid,
       * the "best" update method is selected and its completion is awaited.
       *
       * If the selected update method is rejected or throws, the update loop is rejected.
       *
       * Lastly, otherwise, another iteration of the loop is performed.
       *
       * @return {!Promise} A promise that is fulfilled when the update loop has completed successfully.
       *
       * @private
       */
      __updateLoop: function() {

        // assert !this.__dirtyPropGroups.isEmpty;

        var validationErrors = this.validate();
        if(validationErrors)
          return Promise.reject(new UserError("View model is invalid:\n - " + validationErrors.join("\n - ")));

        // ---

        var dirtyPropGroups = this.__dirtyPropGroups;
        var updateMethodInfo = this.__selectUpdateMethod(dirtyPropGroups);

        // Assume update succeeds.
        dirtyPropGroups.clear(updateMethodInfo.mask);

        var me = this;

        return promise.wrapCall(this[updateMethodInfo.name], this)
            .then(function() {

              return dirtyPropGroups.isEmpty ? Promise.resolve() : me.__updateLoop();

            }, function(reason) {

              // Restore
              dirtyPropGroups.set(updateMethodInfo.mask);

              return Promise.reject(reason);
            });
      },

      /**
       * Selects the best update method for a given set of dirty property groups.
       *
       * @param {!pentaho.util.BitSet} dirtyPropGroups - The set of dirty property groups.
       *
       * @return {!Object} The information object of the selected update method.
       *
       * @private
       */
      __selectUpdateMethod: function(dirtyPropGroups) {

        var ViewClass = this.constructor;

        // 1. Is there an exact match?
        var methodInfo = ViewClass.__UpdateMethods[dirtyPropGroups.get()];
        if(!methodInfo) {

          // TODO: A sequence of methods that handles the dirty bits...

          // 2. Find the first method that cleans all (or more) of the dirty bits.
          ViewClass.__UpdateMethodsList.some(function(info) {
            if(dirtyPropGroups.isSubsetOf(info.mask)) {
              methodInfo = info;
              return true;
            }
            return false;
          });

          // At least the _updateAll method is registered. It is able to handle any dirty bits.
          // assert methodInfo
        }

        return methodInfo;
      },

      /**
       * Called to continue the update operation upon successful completion of the update loop.
       *
       * @private
       *
       * @fires "did:update"
       */
      __onUpdateDidOuter: function() {

        // J.I.C.
        this.__dirtyPropGroups.clear();
        this.__updatingPromise =  null;

        // ---

        this.__callOverridableSafe("_onUpdateDid");
      },

      /**
       * Called to continue the update operation upon update cancellation or failure of the update loop.
       *
       * @param {Error} reason - The error that describes why the update failed.
       *
       * @return {!Promise} A promise that is rejected with the given `reason`.
       *
       * @private
       *
       * @fires "rejected:update"
       */
      __onUpdateRejectedOuter: function(reason) {

        this.__updatingPromise = null;

        // ---

        this.__callOverridableSafe("_onUpdateRejected", reason);

        return Promise.reject(reason);
      },

      /**
       * Called when an update operation has been performed with success.
       *
       * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property will now have value `false`.
       * The [isDirty]{@link pentaho.visual.base.View#isDirty} property will also have value `false`.
       *
       * The default implementation emits the [did:update]{@link pentaho.visual.base.events.DidUpdate} event.
       *
       * The implementation or the event listeners are allowed to modify the model and thus possibly
       * start **new** updates from the _did_ phase.
       *
       * If an implementation throws an error, the error is logged and
       * the update operation is still considered successful.
       *
       * @protected
       *
       * @fires "did:update"
       */
      _onUpdateDid: function() {

        if(this._hasListeners(DidUpdate.type))
          this._emitSafe(new DidUpdate(this));
      },

      /**
       * Called when an update operation has been canceled or has failed.
       *
       * The [isUpdating]{@link pentaho.visual.base.View#isUpdating} property will now have value `false`.
       * The [isDirty]{@link pentaho.visual.base.View#isDirty} property **may** have value `true`.
       *
       * The default implementation emits the [rejected:update]{@link pentaho.visual.base.events.RejectedUpdate} event.
       *
       * The implementation or the event listeners are allowed to modify the model and thus possibly
       * start **new** updates from the _rejected_ phase.
       *
       * If an implementation throws an error, the error is logged and
       * the update operation is still rejected with the original error.
       *
       * @param {Error} reason - The reason why the update operation was canceled or has failed.
       *
       * @protected
       *
       * @fires "rejected:update"
       */
      _onUpdateRejected: function(reason) {

        if(this._hasListeners(RejectedUpdate.type))
          this._emitSafe(new RejectedUpdate(this, reason));
      },

      // endregion

      // region IActionTarget implementation

      // TODO: Although the current code does, 7.1 doesn't support specs on act and actAsync.
      // Post-7.1, the example can be simplified.

      /**
       * Executes a given action with this view as its target and does not wait for its outcome.
       *
       * Emits a structured event of a type equal to the action type's id,
       * with the action as event payload,
       * for each of the action's phases.
       *
       * This method can be given [synchronous]{@link pentaho.type.action.Base.Type#isSync} or asynchronous actions.
       * However, in the latter case, this method is only suitable for _fire-and-forget_ scenarios,
       * where it is not needed to know the outcome of the asynchronous action.
       *
       * @example
       *
       * define(["pentaho/visual/action/execute"], function(executeFactory) {
       *
       *   // ...
       *
       *   // Listen to the execute event
       *   view.on("pentaho/visual/action/execute", {
       *
       *     do: function(action) {
       *
       *       var dataFilter = action.dataFilter;
       *
       *       alert("Executed on rows where " + (dataFilter && dataFilter.contentKey));
       *
       *       // Mark action as done.
       *       action.done();
       *     }
       *   });
       *
       *   // ...
       *
       *   // Act "execute" on data rows that have "country" = "us".
       *
       *   var Execute = view.type.context.get(executeFactory);
       *
       *   var action = new Execute({
       *     dataFilter: {
       *       _: "isEqual",
       *       p: "country",
       *       v: "us"
       *     }
       *   });
       *
       *   view.act(action);
       * });
       *
       * @param {!pentaho.type.action.Base} action - The action to execute.
       *
       * @return {!pentaho.type.action.Base} The given action.
       *
       * @see pentaho.visual.base.View#actAsync
       */
      act: function(action) {

        if(!action) throw error.argRequired("action");

        action = actionBaseType.to(action);

        action.execute(this, this._getActionController(action));

        return action;
      },

      /**
       * Executes a given action in this view as its target and waits for its outcome.
       *
       * Emits a structured event of a type equal to the action type's id,
       * with the action as event payload,
       * for each of the action's phases.
       *
       * This method can be given [synchronous]{@link pentaho.type.action.Base.Type#isSync} or asynchronous actions,
       * and can be used when uniformity in treatment is desired and it is needed to know the outcome of the
       * asynchronous action.
       *
       * @param {!pentaho.type.action.Base} action - The action to execute.
       *
       * @return {!Promise} A promise that is fulfilled with the action's
       * [result]{@link pentaho.type.action.Base#result} or rejected with the action's
       * [error]{@link pentaho.type.action.Base#error}.
       *
       * @see pentaho.visual.base.View#act
       */
      actAsync: function(action) {

        if(!action) throw error.argRequired("action");

        action = actionBaseType.to(action);

        return action.executeAsync(this, this._getActionController(action));
      },

      __genericActionController: null,

      _getActionController: function(action) {
        return this.__genericActionController ||
            (this.__genericActionController = this.__createGenericActionController());
      },

      __createGenericActionController: function() {
        return {
          init: this._onActionPhaseInit.bind(this),
          will: this._onActionPhaseWill.bind(this),
          "do": this._onActionPhaseDo.bind(this),
          "finally": this._onActionPhaseFinally.bind(this)
        };
      },
      // endregion

      // region Actions
      __emitActionPhase: function(action, phase, isFinal) {
        var eventType = action.type.id;

        // TODO: emitGenericAsync when action is async.

        this._emitGeneric(action, eventType, phase, isFinal ? null : _emitActionKeyArgs);
      },

      /**
       * Performs an action's _initialize_ phase, by calling any registered action `init` observers.
       *
       * @param {!pentaho.type.action.Base} action - The action.
       *
       * @protected
       */
      _onActionPhaseInit: function(action) {
        this.__emitActionPhase(action, "init");
      },

      /**
       * Performs an action's _will_ phase, by calling any registered action `will` observers.
       *
       * @param {!pentaho.type.action.Base} action - The action.
       *
       * @protected
       */
      _onActionPhaseWill: function(action) {
        this.__emitActionPhase(action, "will");
      },

      /**
       * Performs an action's _do_ phase, by calling any registered action `do` observers.
       *
       * @param {!pentaho.type.action.Base} action - The action.
       *
       * @return {?Promise} A promise to the completion of the asynchronous `do` listener,
       * of an [asynchronous]{@link pentaho.type.action.Base.Type#isSync} action, or `null`.
       *
       * @protected
       */
      _onActionPhaseDo: function(action) {
        return this.__emitActionPhase(action, "do");
      },

      /**
       * Performs an action's _finally_ phase, by calling any registered action `finally` observers.
       *
       * @param {!pentaho.type.action.Base} action - The action.
       *
       * @protected
       */
      _onActionPhaseFinally: function(action) {
        this.__emitActionPhase(action, "finally", /* isFinal: */ true);
      },
      // endregion

      /**
       * Disposes the view by freeing external resources held by the view.
       *
       * The default implementation calls [_releaseDomContainer]{@link pentaho.visual.base.View#_releaseDomContainer}
       * to release the DOM container.
       */
      dispose: function() {

        if(this.__domContainer)
          this._releaseDomContainer();
      },

      // region Property groups - instance
      // see Base.js
      extend: function(source, keyArgs) {

        this.base(source, keyArgs);

        if(source) {
          var Subclass = this.constructor;

          O.eachOwn(source, function(v, methodName) {
            var m;
            if(F.is(v) && (m = _reUpdateMethodName.exec(methodName))) {

              var methodCleansBits = parsePropertyGroupsText(Subclass, m[1]);
              if(methodCleansBits && !Subclass.__UpdateMethods[methodCleansBits]) {
                var updateMethodInfo = {
                  name: methodName,
                  mask: methodCleansBits
                };

                Subclass.__UpdateMethods[methodCleansBits] = updateMethodInfo;
                Subclass.__UpdateMethodsList.push(updateMethodInfo);

                Subclass.__UpdateMethodsList.sort(function(a, b) {
                  // Never happens: if(a.mask === b.mask) return 0;
                  return new BitSet(a.mask).isSubsetOf(b.mask) ? -1 : 1;
                });
              }
            }
          });
        }

        return this;
      },
      // endregion

      /**
       * Calls an overridable method and swallows and logs an error it throws.
       *
       * @param {string} methodName - The name of the overridable method to call.
       * @param {...any} args - The arguments to pass to the method.
       *
       * @return {any} The value returned by the method; or `undefined`, if it throws an error.
       *
       * @private
       */
      __callOverridableSafe: function(methodName) {
        var args = arg.slice(arguments, 1);
        try {
          return this[methodName].apply(this, args);
        } catch(ex) {
          logger.error("Exception thrown by 'View#" + methodName + "' override:" + ex + "\n" + ex.stack);
        }
      },

      // region serialization
      toSpecInContext: function(keyArgs) {

        if(keyArgs && keyArgs.isJson) {
          keyArgs = keyArgs ? Object.create(keyArgs) : {};

          var omitProps = keyArgs.omitProps;
          keyArgs.omitProps = omitProps = omitProps ? Object.create(omitProps) : {};

          if(omitProps.selectionFilter == null) omitProps.selectionFilter = true;
        }

        return this.base(keyArgs);
      },
      // endregion

      type: /** @lends pentaho.visual.base.View.Type# */{
        id: module.id,
        isAbstract: true,
        props: [
          {
            /**
             * Gets or sets the width that the container application has allocated to display the view
             * without horizontal or vertical scrolling, in pixels.
             *
             * This property is required.
             *
             * @name width
             * @memberOf pentaho.visual.base.View#
             * @type {number}
             */
            name: "width",
            type: "number",
            isRequired: true
          },
          {
            /**
             * Gets or sets the height that the container application has allocated to display the view
             * without horizontal or vertical scrolling, in pixels.
             *
             * This property is required.
             *
             * @name height
             * @memberOf pentaho.visual.base.View#
             * @type {number}
             */
            name: "height",
            type: "number",
            isRequired: true
          },
          {
            /**
             * Gets or sets the current data selection filter.
             *
             * This property is required.
             *
             * This property is not serialized by default.
             * To serialize it, specify the argument `keyArgs.omitProps.selectionFilter` of
             * [toSpec]{@link pentaho.visual.base.View#toSpec} to `false`.
             *
             * @name selectionFilter
             * @memberOf pentaho.visual.base.View#
             * @type {pentaho.type.filter.Abstract}
             */
            name: "selectionFilter",
            type: "pentaho/type/filter/abstract",
            value: {_: "pentaho/type/filter/or"},
            isRequired: true
          },
          {
            /**
             * Gets or sets the visualization model.
             *
             * This property is required.
             *
             * @name model
             * @memberOf pentaho.visual.base.View#
             * @type {pentaho.visual.base.Model}
             */
            name: "model",
            type: visualModelFactory,
            isRequired: true
          }
        ],

        _init: function(spec, keyArgs) {

          this.base.apply(this, arguments);

          // ----
          // Block inheritance, with default values

          this._extension = null;
          this._extensionEf = undefined;
        },

        // region Extension
        _extension: null,
        _extensionEf: undefined,

        /**
         * Gets or sets extension properties that a View handles directly.
         *
         * Each visualization type should document the extension properties that
         * it honors when specified via this attribute.
         *
         * When set and the model already has [descendant]{@link pentaho.type.Type#hasDescendants} models,
         * an error is thrown.
         *
         * Returns `null` when there are no local extension properties.
         *
         * Note that this attribute is _not_ serialized when serializing a visual model type.
         * It is expected that this attribute is always specified through configuration.
         * Also, generally, there would be problems serializing functions and other objects
         * it can contain.
         *
         * @type {Object}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the model already has
         * [descendant]{@link pentaho.type.Type#hasDescendants} models.
         *
         * @see pentaho.visual.base.Model.Type#extensionEffective
         *
         * @see pentaho.visual.base.spec.IModel#extension
         */
        get extension() {
          return this._extension;
        },

        set extension(value) {
          if(this.hasDescendants)
            throw error.operInvalid("Cannot change the 'extension' of a view type that has descendants.");

          this._extension = value ? Object(value) : null;
          this._extensionEf = undefined;
        },

        /**
         * Gets the effective extension properties,
         * a merge between the inherited extension properties and the
         * locally specified extension properties.
         *
         * The merging is performed using the rules of the
         * {@link pentaho.util.Spec#merge} method.
         *
         * Returns `null` when there are no local or inherited extension properties.
         *
         * @readOnly
         * @type {Object}
         *
         * @see pentaho.visual.base.View.Type#extension
         */
        get extensionEffective() {
          var effective = this._extensionEf;
          if(effective === undefined) {
            effective = null;

            var ancestor = this.ancestor;
            if(ancestor.isSubtypeOf(View.type)) {
              var ancestorExtEf = ancestor.extensionEffective;
              if(ancestorExtEf) {
                effective = {};
                specUtil.merge(effective, ancestorExtEf);
              }
            }

            if(this._extension) {
              if(!effective) effective = {};
              specUtil.merge(effective, this._extension);
            }

            this._extensionEf = effective;
          }

          return effective;
        }
        // endregion
      }
    }, /** @lends pentaho.visual.base.View */{

      // TODO: convert to use a view spec?
      // region static factory sugar
      /**
       * Creates a view, asynchronously, given its specification.
       *
       * If the view specification has its type annotated inline,
       * a view of that type is built.
       *
       * Otherwise, when the view type is not annotated inline in the specification,
       * if its `model` property is specified with an already instantiated model instance,
       * or with a type annotated specification,
       * that model's type's default view class is used to create a view instance from
       * the given specification.
       * The returned promise is rejected if the provided model specification is
       * not specified or is not type annotated.
       * The returned promise is also rejected if the model type has no registered default view type.
       *
       * Unlike the {@link pentaho.type.Type#createAsync} counterpart method,
       * this static variant can be called to create an instance of any view type,
       * even if it isn't a subtype of `this` one.
       *
       * @param {pentaho.visual.base.spec.IViewEx} viewSpec - The extended view specification.
       *
       * @return {!Promise.<pentaho.visual.base.View>} A promise for a view with the given specification.
       *
       * @rejects {pentaho.lang.ArgumentRequiredError} When `viewSpec` is not specified.
       * @rejects {pentaho.lang.ArgumentRequiredError} When `viewSpec` has no annotated type, inline, and
       * the `model` property is unspecified.
       * @rejects {pentaho.lang.ArgumentRequiredError} When `viewSpec` has no annotated type, inline, and
       * the `model` property is a specification which also does not have its type annotated inline.
       * @rejects {Error} When there isn't a registered default view class for the type of `model`.
       * @rejects {Error} When the registered default view class does not exist or otherwise fails to load
       * by {@link pentaho.type.Context#getAsync}.
       */
      createAsync: function(viewSpec) {
        if(!viewSpec) return Promise.reject(error.argRequired("viewSpec"));

        var promiseViewCtor;

        // View is type annotated, inline?
        if(viewSpec._) {
          promiseViewCtor = this.type.context.getAsync(viewSpec._);
        } else {
          // View has a model specified?
          var modelSpec = viewSpec.model;
          if(!modelSpec) return Promise.reject(error.argRequired("viewSpec.model"));

          var promiseModelCtor;
          // Is it a model specification?
          if(modelSpec.constructor === Object) {
            // No inline type?
            if(!modelSpec._) return Promise.reject(error.argRequired("viewSpec.model._"));

            promiseModelCtor = this.type.context.getAsync(modelSpec._);
          } else {
            // Assume it is a model instance, from which the model type can be read directly.
            promiseModelCtor = Promise.resolve(modelSpec.constructor);
          }

          promiseViewCtor = promiseModelCtor.then(function(Model) {
            return View.getClassAsync(Model.type);
          });
        }

        return promiseViewCtor.then(function(View) {
          return View.type.createAsync(viewSpec);
        });
      },

      /**
       * Gets a promise for the view class (constructor), of the registered default type, if any,
       * for the given model type or identifier.
       *
       * @param {string|!pentaho.visual.base.Model.Type} modelType - The visual model type or its identifier.
       * @return {!Promise.<Class.<pentaho.visual.base.View>>} A promise for a view class of the given model type.
       *
       * @rejects {pentaho.lang.ArgumentRequiredError} When `modelType` is not specified.
       * @rejects {Error} When `modelType` is a string, any error returned by {@link pentaho.type.Context#getAsync}.
       * @rejects {Error} When there isn't a registered default view class for `modelType`.
       * @rejects {Error} When the registered default view class does not exist or otherwise fails to load
       * by {@link pentaho.type.Context#getAsync}.
       */
      getClassAsync: function(modelType) {

        if(!modelType) return Promise.reject(error.argRequired("modelType"));

        var context = this.type.context;

        return context
            .getAsync(modelType)
            .then(function(Model) {

              var promise = Model.type.defaultViewClass;
              if(!promise) throw new Error("No registered default view class.");

              return promise;
            })
            .then(function(viewFactory) {
              return context.get(viewFactory);
            });
      },
      // endregion

      // region Property groups - class
      // see Base.js
      _subclassed: function(Subclass, instSpec, classSpec, keyArgs) {

        // "Inherit" PropertyGroups, __PropertyGroupOfProperty, __UpdateMethods and __UpdateMethodsList properties
        Subclass.PropertyGroups            = Object.create(this.PropertyGroups);
        Subclass.__PropertyGroupOfProperty = Object.create(this.__PropertyGroupOfProperty);
        Subclass.__UpdateMethods           = Object.create(this.__UpdateMethods);
        Subclass.__UpdateMethodsList       = this.__UpdateMethodsList.slice();

        this.base(Subclass, instSpec, classSpec, keyArgs);
      },

      PropertyGroups: O.assignOwn(Object.create(null),
        /**
         * The `PropertyGroups` enumeration contains the entries for the distinct groups of properties that the
         * base [View]{@link pentaho.visual.base.View} class recognizes when categorizing property changes.
         *
         * @alias pentaho.visual.base.View.PropertyGroups
         * @enum {number}
         * @readOnly
         *
         * @see pentaho.visual.base.View#_onChangeClassify
         */
        {
          /**
           * Includes all view and model properties.
           */
          All: ~0,

          /**
           * The group of properties whose changes are ignored,
           * because the view does not visually represent these in any way.
           */
          Ignored: 0,

          /**
           * The group of properties that don't have a more specific property group.
           */
          General: 1,

          /**
           * The group of data-related properties.
           *
           * By default, the only property of this group is the model's
           * [data]{@link pentaho.visual.base.Model#data} property.
           */
          Data: 2,

          /**
           * The group of size-related properties.
           *
           * By default, the properties of this group are
           * the view's [width]{@link pentaho.visual.base.View#width} and
           * [height]{@link pentaho.visual.base.View#height} properties.
           */
          Size: 4,

          /**
           * The group of selection-related properties.
           *
           * By default, the only property of this group is
           * the view's [selectionFilter]{@link pentaho.visual.base.View#selectionFilter} property.
           */
          Selection:  8
        }),

      // View property path -> Property group name
      __PropertyGroupOfProperty: O.assignOwn(Object.create(null), {
        "selectionMode":   "Ignored",
        "model": {
          "_": "All",
          "data": "Data"
        },
        "width":           "Size",
        "height":          "Size",
        "selectionFilter": "Selection"
      }),

      // bits -> {name: , mask: }
      __UpdateMethods: Object.create(null),

      // [{name: , mask: }, ...]
      __UpdateMethodsList: []
      // endregion
    })
    .implement(/** @lends pentaho.visual.base.View# */{
      // region _updateXyz Methods
      /**
       * Fully renders or updates the view.
       *
       * The first update of a visualization is always a full update.
       *
       * The default implementation does nothing.
       * Implementations **should** override this method and implement a complete rendering of the visualization.
       *
       * Besides implementing this method,
       * implementations should consider implementing one or more of the optional
       * **partial update methods**, like
       * [_updateData]{@link pentaho.visual.base.View#_updateData},
       * [_updateSize]{@link pentaho.visual.base.View#_updateSize},
       * [_updateSelection]{@link pentaho.visual.base.View#_updateSelection} and
       * [_updateGeneral]{@link pentaho.visual.base.View#_updateGeneral}.
       *
       * Other appropriate combinations of these can also be implemented,
       * for example, `_updateSizeAndSelection`,
       * by combining the names of the known property groups: `Data`, `Size`, `Selection` and `General`,
       * with an `And` to form a corresponding method name.
       * For more information on property groups,
       * see [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups}.
       *
       * The [update]{@link pentaho.visual.base.View#update} operation
       * selects the `best fit` partial methods to actually update the view.
       *
       * @protected
       *
       * @see pentaho.visual.base.View#update
       * @see pentaho.visual.base.View.PropertyGroups
       * @see pentaho.visual.base.View#_onChangeClassify
       */
      _updateAll: function() {
      }

      /**
       * Updates the view, taking into account that
       * only the dimensions of the view have changed.
       *
       * This is an **optional** method - there is no base implementation.
       *
       * Implement this method to provide a faster way to resize a view.
       * When not specified, and no other applicable partial update method exists,
       * the full [_updateAll]{@link pentaho.visual.base.View#_updateAll} method is used to update the view.
       *
       * @name _updateSize
       * @memberOf pentaho.visual.base.View#
       * @method
       * @protected
       * @optional
       * @see pentaho.visual.base.View#_updateAll
       */

      /**
       * Updates the view, taking into account that
       * only the selection-related model properties have changed.
       *
       * This is an **optional** method - there is no base implementation.
       *
       * Implement this method to provide a faster way to update the selection of the view.
       * When not specified, and no other applicable partial update method exists,
       * the view is updated using the [_updateAll]{@link pentaho.visual.base.View#_updateAll} method.
       *
       * @name _updateSelection
       * @memberOf pentaho.visual.base.View#
       * @method
       * @protected
       * @optional
       * @see pentaho.visual.base.View#_updateAll
       */

      /**
       * Updates the view, taking into account that
       * only the data-related model properties have changed.
       *
       * This is an **optional** method - there is no base implementation.
       *
       * Implement this method to provide a faster way to update the data displayed by the view.
       * When not specified, and no other applicable partial update method exists,
       * the view is updated using the [_updateAll]{@link pentaho.visual.base.View#_updateAll} method.
       *
       * @name _updateData
       * @memberOf pentaho.visual.base.View#
       * @method
       * @protected
       * @optional
       * @see pentaho.visual.base.View#_updateAll
       */

      /**
       * Updates the view, taking into account that
       * only "general" model properties have changed.
       *
       * This is an **optional** method - there is no base implementation.
       *
       * Implement this method to provide a faster way to update the "general information" displayed by the view.
       * When not specified, and no other applicable partial update method exists,
       * the view is updated using the [_updateAll]{@link pentaho.visual.base.View#_updateAll} method.
       *
       * @name _updateGeneral
       * @memberOf pentaho.visual.base.View#
       * @method
       * @protected
       * @optional
       * @see pentaho.visual.base.View#_updateAll
       */
      // endregion
    })
    .implement({type: bundle.structured.type});

    return View;
  };

  /**
   * Parses the custom part of the name of partial update method (like *_updateXyz*).
   *
   * @param {Class.<View>} ViewClass - The view class.
   * @param {string} groupNamesText - The part of the method name following the prefix "_update".
   *
   * @return {number} The property group bits corresponding to the method name.
   */
  function parsePropertyGroupsText(ViewClass, groupNamesText) {

    var groupsBits = 0;

    groupNamesText.split("And").forEach(function(groupName) {
      var groupBits = ViewClass.PropertyGroups[groupName];
      if(groupBits == null || isNaN(+groupBits)) {
        logger.warn("There is no registered property group with name '" + groupName + "'.");
      } else {
        groupsBits |= groupBits;
      }
    });

    return groupsBits;
  }
});
