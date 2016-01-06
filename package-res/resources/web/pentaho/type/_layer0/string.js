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
  "./simple",
  "../../i18n!../i18n/types"
], function(simpleFactory, bundle) {

  "use strict";

  /**
   * Creates the `String` class for the given context.
   *
   * ### AMD
   *
   * Module Id: `pentaho/type/string`
   *
   * @alias stringFactory
   * @memberOf pentaho.type
   * @type pentaho.type.Factory
   * @amd pentaho/type/string
   * @return {Class.<pentaho.type.String>} The `String` class of the given context.
   */
  return function(context) {

    var Simple = context.get(simpleFactory);

    /**
     * @name pentaho.type.String.Meta
     * @class
     * @extends pentaho.type.Simple.Meta
     *
     * @classDesc The metadata class of {@link pentaho.type.String}.
     * @ignore
     */

    /**
     * @name pentaho.type.String
     * @class
     * @extends pentaho.type.Simple
     *
     * @classDesc A textual type.
     * @description Creates a string type.
     */
    return Simple.extend("pentaho.type.String", {
      meta: {
        id: "pentaho/type/string",
        styleClass: "pentaho-type-string",
        cast: String
      }
    }).implement({
      meta: bundle.structured["string"]
    });
  };
});
