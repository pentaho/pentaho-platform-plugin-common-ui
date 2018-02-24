/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /* globals describe, it, beforeEach, afterEach, beforeAll, spyOn */

  describe("pentaho.visual.role.Mapping", function() {

    var context;
    var Mapping;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(_context) {

            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/visual/role/mapping"
            ], function(_Mapping) {
              Mapping = _Mapping;
            });
          })
          .then(done, done.fail);

    });

    // TODO: mode = modeFixed || prop.modes[0]
  });
});
