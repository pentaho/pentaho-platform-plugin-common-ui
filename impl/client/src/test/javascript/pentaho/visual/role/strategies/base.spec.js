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
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(Context, errorMatch) {

  "use strict";

  /* globals describe, it, beforeEach, beforeAll, spyOn */

  xdescribe("pentaho.visual.role.strategies.Base", function() {

    var BaseStrategy;
    var CustomStrategy;

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(context) {

            return context.getAsync("pentaho/visual/role/strategies/base");
          })
          .then(function(_BaseStrategy) {
            BaseStrategy = _BaseStrategy;
            CustomStrategy = BaseStrategy.extend();
          })
          .then(done, done.fail);

    });

    it("should be possible to create an instance", function() {
      var strategy = new CustomStrategy();
      expect(strategy instanceof BaseStrategy).toBe(true);
    });

    it("should throw when calling getMapper", function() {
      var strategy = new CustomStrategy();
      expect(function() {
        strategy.getMapper();
      }).toThrow(errorMatch.notImplemented());
    });
  });
});
