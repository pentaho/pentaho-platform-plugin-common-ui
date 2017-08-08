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
  "./abstract",
  "./tree",
  "./property",
  "./and",
  "./or",
  "./not",
  "./isEqual",
  "./isIn",
  "./isGreater",
  "./isLess",
  "./isGreaterOrEqual",
  "./isLessOrEqual",
  "./isLike",
  "./true",
  "./false"
], function(
    abstractFactory, treeFactory, propFactory,
    andFactory, orFactory, notFactory, isEqFactory, isInFactory, isGtFactory, isLtFactory, isGteFactory, isLteFactory,
    isLikeFactory, trueFactory, falseFactory) {

  "use strict";

  return {
    "abstract": abstractFactory,
    "tree": treeFactory,
    "property": propFactory,
    "and": andFactory,
    "or": orFactory,
    "not": notFactory,
    "isEqual": isEqFactory,
    "isIn": isInFactory,
    "isGreater": isGtFactory,
    "isLess": isLtFactory,
    "isGreaterOrEqual": isGteFactory,
    "isLessOrEqual": isLteFactory,
    "isLike": isLikeFactory,
    "true": trueFactory,
    "false": falseFactory
  };
});
