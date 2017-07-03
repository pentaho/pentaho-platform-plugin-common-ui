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
  "./instance",
  "./value",
  "./element",
  "./list",
  "./simple",
  "./complex",
  "./string",
  "./number",
  "./boolean",
  "./date",
  "./object",
  "./function",
  "./property",
  "./model",
  "./application",
  "./mixins/standard",
  "./filter/standard"
], function(instanceFactory, valueFactory, elementFactory, listFactory,
    simpleFactory, complexFactory, stringFactory, numberFactory, booleanFactory,
    dateFactory, objectFactory, functionFactory, propertyFactory,
    modelFactory, applicationFactory,
    standardMixins, standardFilters) {

  "use strict";

  return {
    // types
    "instance": instanceFactory,
    "value":    valueFactory,
    "element":  elementFactory,
    "list":     listFactory,
    "simple":   simpleFactory,
    "string":   stringFactory,
    "number":   numberFactory,
    "boolean":  booleanFactory,
    "date":     dateFactory,
    "complex":  complexFactory,
    "object":   objectFactory,
    "function": functionFactory,
    "property": propertyFactory,
    "model":    modelFactory,
    "application": applicationFactory,
    "mixins":   standardMixins,
    "filter":   standardFilters
  };
});
