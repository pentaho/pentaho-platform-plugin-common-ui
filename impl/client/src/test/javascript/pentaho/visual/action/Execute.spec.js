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
  "pentaho/visual/action/Base",
  "pentaho/visual/action/Execute"
], function(BaseAction, ExecuteAction) {

  "use strict";

  describe("pentaho.visual.action.Execute", function() {

    it("should be defined", function() {

      expect(typeof ExecuteAction).toBe("function");
    });

    it("should extend visual.action.Base", function() {

      expect(ExecuteAction.prototype instanceof BaseAction).toBe(true);
    });

    it("should mix in visual.action.mixins.Positioned", function() {
      // Unfortunately, there's no better way to do test this, now.
      expect("position" in ExecuteAction.prototype).toBe(true);
    });

    it("should mix in visual.action.mixins.Data", function() {
      // Unfortunately, there's no better way to do test this, now.
      expect("dataFilter" in ExecuteAction.prototype).toBe(true);
    });

    it("should be synchronous", function() {

      expect(ExecuteAction.isSync).toBe(true);
    });
  });
});
