/*!
 * Copyright 2017 - 2019 Hitachi Vantara.  All rights reserved.
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
  "pentaho/action/Base"
], function(ActionBase) {

  "use strict";

  describe("pentaho.action.Base", function() {

    var SubAction;

    beforeAll(function() {

      // A derived non-abstract class, adding nothing new.
      SubAction = ActionBase.extend({});
    });

    describe("new (spec)", function() {

      it("should be possible to not specify spec", function() {

        var action = new SubAction();

        expect(action instanceof SubAction).toBe(true);
      });

    });

    describe(".isSync", function() {

      it("should default to true", function() {
        expect(SubAction.isSync).toBe(true);
      });

    });

  });
});
