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
  "pentaho/visual/type/helper",
  "pentaho/util/error",
  "pentaho/util/object"
], function(typeHelper, error, O) {

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
      getEditorProperties:    getEditorProperties,
      processEditModelChange: processEditModelChange,
      validateEditModel:      validateEditModel
    };

  /**
   * Gets the visualization properties exposed by a visualization editor's document.
   *
   * If the visual type has been configured with
   * {{#crossLink "IVisualTypeConfig/getEditorProperties:method"}}{{/crossLink}},
   * it is called to perform the retrieval.
   *
   * When _filterPropsList_ is specified,
   * the returned properties surely only contain properties present in the list.
   *
   * @method getEditorProperties
   *
   * @param {IVisualType} type The visual type.
   * @param {IVisualEditorDocument} editorDoc An object that allows accessing the editor's document and properties.
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
  function getEditorProperties(type, editorDoc, filterPropsList) {
    if(!type)        throw error.argRequired("type");
    if(!editorDoc) throw error.argRequired("editorDoc");

    var getProps = type.getEditorProperties || defaultGetProperties;

    // Create an index for `filterPropsList` on property name.
    var filterPropsMap;
    if(filterPropsList && filterPropsList.length) {
      filterPropsMap = {};
      if(!(filterPropsList instanceof Array)) filterPropsList = [filterPropsList];

      filterPropsList.forEach(function(p) { filterPropsMap[p] = true; });
    } else {
      filterPropsList = filterPropsMap = null;
    }

    var visualProps = getProps.call(type, editorDoc, filterPropsList, filterPropsMap);

    // Ensure only props specified in filterPropsList are output.
    if(visualProps && filterPropsList && getProps !== defaultGetProperties) {
      var visualProps2 = {};
      filterPropsList.forEach(function(p) {
        if(O.hasOwn(visualProps, p))
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
   * @param {spec.IVisual} spec The visual specification.
   * @param {IVisualEditModel} editModel The visual edit model.
   * @param {string} [changedProp] The name of the property that has changed.
   *   When unspecified, it is assumed that all properties have changed.
   */
  function processEditModelChange(type, spec, editModel, changedProp) {
    if(!type) throw error.argRequired("type");
    if(!spec) throw error.argRequired("spec");
    if(!editModel) throw error.argRequired("editModel");

    // The visual type has a chance to apply business rules.
    if(type.updateEditModel) type.updateEditModel(editModel, changedProp);

    storeEditModel(type, spec, editModel);
  }

  /**
   * Validates a given edit model against a given visual type.
   *
   * Performs basic "requiredness" and "allow multiple" validation —
   * more generally, minimum and maximum occurrence validation —
   * for visual role requirements.
   *
   * If basic validation succeeds and
   * if the visual type has defined
   * {{#crossLink "IVisualType/validateEditModel:method"}}{{/crossLink}},
   * it is called, to validate the model.
   *
   * @method vaidateEditModel
   *
   * @param {IVisualType} type The visual type.
   * @param {IVisualEditModel} editModel The visual edit model.
   * @return {Error[]|null} A non-empty array of validation error objects,
   *    or `null`, when there are no validation errors.
   */
  function validateEditModel(type, editModel) {
    if(!editModel) throw error.argRequired("editModel");

    var errors;

    // Basic validation
    typeHelper.mapVisualRoleRequirements(type, function(req) {
      var item = editModel.byId(req.id);
      var occur = item ? item.value.length : 0;

      var occurs = typeHelper.getRequirementOccurRange(item || req);

      function addError(code, msg, reqs) {
        var er = new Error(msg);
        er.code = code;
        er.reqs = reqs;
        (errors || (errors = [])).push(er);
        return er;
      }

      var error, msg;
      if(occur < occurs.min) {
        if(!errors) ;

        msg = "Visual role requirement '" + req.id + "' ";
        if(occurs.min === 1) {
          msg += "is required.";
        } else {
          msg += "needs to be bound to at least " + occurs.min + " data attribute(s).";
        }

        error = addError("minOccur", msg, [req.id]);
        error.minOccur = occurs.min;
      } else if(occur > occurs.max) {
        msg = "Visual role requirement '" + req.id +
            "' cannot be bound to more than " + occurs.max + " data attribute(s).";
        error = addError("maxOccur", msg, [req.id]);
        error.maxOccur = occurs.max;
      }
    });

    if(!errors && type.validateEditModel) {
      errors = type.validateEditModel(editModel);

      if(errors && (!(errors instanceof Array) || !errors.length)) {
        errors = null;
      }
    }

    return errors || null;
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
  function defaultGetProperties(editorDoc, filterPropsList, filterPropsMap) {
    // Copy all editor options that have the same name of a non-structure data req,
    // filtered by filterPropsMap

    var visualProps = {};

    typeHelper.mapGeneralRequirements(this, function(req) {
      var id = req.id, value;
      if((value = editorDoc.get(id)) !== undefined &&
         (!filterPropsMap || O.hasOwn(filterPropsMap, id))) {
        visualProps[id] = value;
      }
    });

    return visualProps;
  }
});
