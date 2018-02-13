/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/lang/DomNode",
  "./util",
  "./impl/Variable",
  "pentaho/util/object",
  "pentaho/util/error"
], function(module, DomNode, sceneUtil, Variable, O, error) {

  var Scene = DomNode.extend(module.id, /** @lends pentaho.visual.scene.Base# */{

    /**
     * @classDesc The `Scene` class represents one distinct visual state which is represented
     * visually by one or more visual elements.
     *
     * Scenes are *not* needed to implement visualization [views]{@link pentaho.visual.base.View}.
     * However, their use simplifies their implementation in many use cases.
     *
     * Scenes have a map of visual variables,
     * [vars]{@link pentaho.visual.scene.Base#vars} whose values are inherited from parent to child scenes.
     *
     * To *create scenes*, most `View` implementations can simply use the [scene.Base.buildScenesFlat] method.
     * This method creates one parent scene having one child scene per row of the model's data set.
     * In child scenes,
     * for each visual role there will be a correspondingly named variable having the value of the visual role.
     *
     * For handling *user interaction*,
     * the scene instances' [createFilter]{@link pentaho.visual.scene.Base#createFilter} method provides
     * an easy way to create a filter that selects the data from which the scene was generated based on its
     * distinguishing attribute values.
     * This filter can then be passed to a [data action]{@link pentaho.visual.action.mixins.Data.Type} such as
     * [Select]{@link pentaho.visual.action.Select} or [Execute]{@link pentaho.visual.action.Execute}.
     *
     * When *communicating with external parties*, attribute values must be used and visual variable values are not
     * generally meaningful.
     * The [invert]{@link pentaho.visual.scene.Base#invert} method allows directly obtaining the distinguishing
     * attribute values that are associated with a scene.
     *
     * @alias Base
     * @memberOf pentaho.visual.scene
     * @class
     * @extends pentaho.lang.DomNode
     *
     * @description Creates a scene instance.
     * @constructor
     * @param {pentaho.visual.scene.Base} parent - The parent scene, if any.
     * @param {pentaho.visual.base.View} view — The owner view. Required if `parent` is not specified.
     */
    constructor: function(parent, view) {

      var hasParent = parent != null;
      if(hasParent) {
        // Signal "constructing" to _onParentChange.
        this.vars = null;

        parent.appendChild(this);
      } else {
        this.vars = Object.create(null);

        this.__setAsRoot();

        if(view == null) {
          throw error.argRequired("view");
        }
        this.__view = view;
      }
    },

    /**
     * Gets the associated visualization view.
     *
     * @type {!pentaho.visual.base.View}
     * @readOnly
     */
    get view() {
      return this.root.__view;
    },

    /**
     * Gets the root scene of the tree that this scene belongs to.
     *
     * @type {!pentaho.visual.base.Scene}
     * @readOnly
     */
    get root() {
      return this.vars.$root;
    },

    /**
     * Marks this node's `$root` "variable" with `this` as a value.
     * @private
     */
    __setAsRoot: function() {
      O.setConst(this.vars, "$root", this);
    },

    /**
     * Creates and sets a variable with the given name, value and formatted value.
     *
     * @param {string} name - The name under which the variable is set.
     * @param {any} value - The value of the variable.
     * @param {?string} [formatted] - The formatted value of the variable.
     *
     * @return {!pentaho.visual.scene.Base} This instance.
     */
    setVar: function(name, value, formatted) {
      this.vars[name] = new Variable(value, formatted);
      return this;
    },

    /**
     * Creates a filter that selects the data represented by this scene.
     *
     * This method provides an easy way to create a filter that selects the data that this scene visually represents
     * based on its distinguishing attribute values.
     *
     * This filter can then be passed to a [data action]{@link pentaho.visual.action.mixins.Data.Type} such as
     * [Select]{@link pentaho.visual.action.Select} or [Execute]{@link pentaho.visual.action.Execute}.
     *
     * In certain circumstances, the returned value may be `null`. A filter can only be created for a scene
     * if its variables entail distinguishing attributes (in the sense of being _effective keys_, as defined in
     * [scene.util.invertVars]{@link pentaho.visual.scene.util.invertVars}) of the associated model's data.
     *
     * @return {pentaho.data.filter.Abstract} The filter, if one can be created; `null`, otherwise.
     *
     * @see pentaho.visual.scene.util.createFilterForVars
     */
    createFilter: function() {
      return sceneUtil.createFilterForVars(this.vars, this.view.model);
    },

    /**
     * Gets a data cells map which corresponds to the values of visual role variables of this scene.
     *
     * When *communicating with external parties*, attribute values must be used and visual variable values are not
     * generally meaningful. Use this method to obtain the distinguishing attribute values represented by this scene.
     *
     * @param {Object} [keyArgs] The keyword arguments object.
     * @param {boolean} [keyArgs.includeMeasureAttributes=false] Indicates that measure attributes should also
     * be included.
     * In practice, indicates that all attributes should be included.
     *
     * @return {!Object.<string, pentaho.data.ICell>} A data cells map, possibly empty.
     *
     * @see pentaho.visual.scene.util.invertVars
     */
    invert: function(keyArgs) {
      return sceneUtil.invertVars(this.vars, this.view.model, keyArgs);
    },

    /** @override */
    _onParentChange: function(newParent, newIndex, oldParent, oldIndex) {

      var oldView;
      if(newParent === null) {
        // Loosing parent. Capture the old view.
        // assert oldParent !== null. Was not root.
        // Must steal the old parent's view, or we'd be without view.
        oldView = oldParent.view;
      }

      this.base(newParent, newIndex, oldParent, oldIndex);

      // Ensure `vars` are chained to those of newParent.

      if(newParent !== null) {

        // Constructing?
        if(this.vars === null) {
          this.vars = Object.create(newParent.vars);
        } else {
          // Avoid using setPrototypeOf. Prefer recreating the subtree of vars.

          // Note that even if we're now root, recreating the vars ignores the $root property,
          // thus letting the new root pass-through.
          this.__recreateVarsRecursive(newParent.vars);
        }
      } else {
        // Loosing parent.
        this.__view = oldView;
        this.__recreateVarsRecursive(null);
        this.__setAsRoot();
      }
    },

    /**
     * Recursively recreates the scenes' map of visual variables.
     *
     * @param {!Object.<string, any|pentaho.visual.role.scene.IVariable>} parentVars - The parent's
     * map of visual variables.
     *
     * @private
     */
    __recreateVarsRecursive: function(parentVars) {

      var newVars = Object.create(parentVars);

      // A local $root property would not be copied because it is not enumerable.
      this.vars = O.assignOwn(newVars, this.vars);

      var children = this.children;
      var childCount = children.length;
      if(childCount > 0) {
        var childIndex = -1;
        while(++childIndex < childCount) {
          children[childIndex].__recreateVarsRecursive(newVars);
        }
      }
    }
  }, /** @lends pentaho.visual.scene.Base*/ {
    /*
     * Sample static code.
     *
     __buildScenes: function() {
          var scenes = [];
          var model = this.model;
          var categoryMapper = model.category.mapper;
          var measureMapper = model.measure.mapper;

          for(var i = 0, R = model.data.getNumberOfRows(); i < R; i++) {
            scenes.push({
              category: categoryMapper.getValue(i),
              categoryLabel: categoryMapper.getFormatted(i),
              measure: measureMapper.getValue(i),
              rowIndex: i
            });
          }

          return scenes;
        },
     */

    /**
     * Builds a flat, single-level scene tree according to the data and visual roles of the model of a given view.
     *
     * This method creates one parent scene having one child scene per row of the
     * [model's data set]{@link pentaho.visual.base.Model#data}.
     * In child scenes, for each visual role there will be a correspondingly named variable having the value
     * of the visual role.
     *
     * @param {!pentaho.visual.base.View} view - The visualization view. Must be valid.
     *
     * @return {!pentaho.visual.scene.Base} The parent scene.
     */
    buildScenesFlat: function(view) {

      var model = view.model;

      // Collect visual role mappers from model.
      var mapperInfos = [];
      model.$type.eachVisualRole(function(propType) {
        var mapper = model.get(propType).mapper;
        if(mapper !== null) {
          mapperInfos.push({name: propType.name, mapper: mapper});
        }
      });

      // ---

      var parentScene = new Scene(/* parent: */null, view);

      var rowIndex = -1;
      var rowCount = model.data.getNumberOfRows();
      var mapperCount = mapperInfos.length;

      while(++rowIndex < rowCount) {

        var childScene = new Scene(parentScene);

        var mapperIndex = -1;

        while(++mapperIndex < mapperCount) {

          var mapperInfo = mapperInfos[mapperIndex];
          childScene.setVar(
              mapperInfo.name,
              mapperInfo.mapper.getValue(rowIndex),
              mapperInfo.mapper.getFormatted(rowIndex));
        }
      }

      return parentScene;
    }
  });

  return Scene;
});
