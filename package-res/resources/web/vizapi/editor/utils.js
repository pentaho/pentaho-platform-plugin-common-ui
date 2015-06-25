/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "../type/helper",
  "../_utils"
], function(typeHelper, utils) {

  /**
   * @module pentaho.visual.editing
   */

  /**
   * A singleton class with utility methods to help writing a visuals editor.
   *
   * #### AMD
   *
   * **Module Id**: `"pentaho/visual/editor/utils"`
   *
   * **Module Type**: {{#crossLink "EditorUtils"}}{{/crossLink}}
   *
   * @class EditorUtils
   * @constructor
   */

  return {
      translateEditorProperties: translateEditorProperties,
      processEditModelChange:    processEditModelChange
    };

  /**
   * Translates editor _external_ properties to properties of visuals.
   *
   * If the visual type has been configured with
   * {{#crossLink "IVisualTypeConfiguration/translateEditorProperties:method"}}{{/crossLink}},
   * it is called to perform the translation.
   *
   * When _filterPropsList_ is specified,
   * the returned properties surely only contain properties present in the list.
   *
   * @method translateEditorProperties
   *
   * @param {IVisualType} type The visual type.
   * @param {string} editorType The id of the editor type that is the source of _editorProps_.
   * @param {IVisualEditorProperties} editorProps An object that allows reading the editor's properties.
   * @param {string|string[]} [filterPropsList] A string or an array of strings with
   *   the editor property names
   *   that should be processed. When this is unspecified, _nully_,
   *   or has zero length, then all properties should be processed.
   *
   *   This argument can be seen to indicate a set of editor properties
   *   whose value has changed and need to be updated.
   *
   * @return {Object} A map of "visual properties".
   */
  function translateEditorProperties(type, editorType, editorProps, filterPropsList) {
    if(!type)        throw utils.error.argRequired("type");
    if(!editorType)  throw utils.error.argRequired("editorType");
    if(!editorProps) throw utils.error.argRequired("editorProps");

    var translateProps = type.translateEditorProperties || defaultTranslateProperties;

    // Create an index for `filterPropsList` on property name.
    var filterPropsMap;
    if(filterPropsList && filterPropsList.length) {
      filterPropsMap = {};
      if(!(filterPropsList instanceof Array)) filterPropsList = [filterPropsList];

      filterPropsList.forEach(function(p) { filterPropsMap[p] = true; });
    } else {
      filterPropsList = filterPropsMap = null;
    }

    var visualProps = translateProps.call(type, editorType, editorProps, filterPropsList, filterPropsMap);

    // Ensure only props specified in filterPropsList are output.
    if(visualProps && filterPropsList && translateProps !== defaultTranslateProperties) {
      var visualProps2 = {};
      filterPropsList.forEach(function(p) {
        if(utils.O_hasOwn.call(visualProps, p))
          visualProps2[p] = visualProps[p];
      });

      visualProps = visualProps2;
    }

    return visualProps || {};
  }

  /**
   * Processes a change in the edit model and
   * updates the visual specification.
   *
   * If the visual type has defined
   * {{#crossLink "IVisualType/updateEditModel:method"}}{{/crossLink}},
   * it is called, to update the model.
   *
   * @method processEditModelChange
   *
   * @param {IVisualType} type The visual type.
   * @param {IVisualSpec} spec The visual specification.
   * @param {IVisualEditModel} editModel The visual edit model.
   * @param {string} [changedProp] The name of the property that has changed.
   *   When unspecified, it is assumed that all properties have changed.
   */
  function processEditModelChange(type, spec, editModel, changedProp) {
    if(!type) throw utils.error.argRequired("type");
    if(!spec) throw utils.error.argRequired("spec");
    if(!editModel) throw utils.error.argRequired("editModel");

    // The visual type has a chance to apply business rules.
    if(type.updateEditModel) type.updateEditModel(editModel, changedProp);

    storeEditModel(type, spec, editModel);
  }

  // @private
  // @static
  function storeEditModel(type, spec, editModel) {
    // Store editModel props in spec
    typeHelper.mapGeneralRequirements(type, function(req) {
      if(!req.ui || req.ui.type !== "button") {
        var editProp = editModel.byId(req.id);
        if(editProp) spec[req.id] = editProp.value;
      }
    });
  }

  // @private
  // @this IVisualType
  function defaultTranslateProperties(editorType, editorProps, filterPropsList, filterPropsMap) {
    // Copy all editor options that have the same name of a non-structure data req,
    // filtered by filterPropsMap

    var visualProps = {};

    typeHelper.mapGeneralRequirements(this, function(req) {
      var id = req.id, value;
      if((value = editorProps.get(id)) !== undefined &&
         (!filterPropsMap || utils.O_hasOwn.call(filterPropsMap, id))) {
        visualProps[id] = value;
      }
    });

    return visualProps;
  }
});
