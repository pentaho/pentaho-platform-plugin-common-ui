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
  "module",
  "pentaho/i18n!messages"
], function(module, bundle) {

  "use strict";

  return function(context) {

    var Property = context.get("pentaho/visual/role/property");

    /**
     * @name pentaho.visual.role.OrdinalProperty
     * @class
     * @extends pentaho.visual.role.Property
     * @abstract
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.OrdinalProperty>} pentaho/visual/role/ordinal
     *
     * @classDesc An optional base class for ordinal visual role properties.
     *
     * This visual role property has a [levels]{@link pentaho.visual.role.Property.Type#levels}
     * with a single value, `"ordinal"`.
     */
    var OrdinalProperty = Property.extend("pentaho.visual.role.OrdinalProperty", {
      type: {
        id: module.id,
        levels: ["ordinal"]
      }
    })
    .implement({type: bundle.structured.ordinal});

    return OrdinalProperty;
  };
});