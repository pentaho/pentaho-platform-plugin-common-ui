/*!
 * Copyright 2017 - 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/visual/action/Update"
], function(BaseAction, UpdateAction) {

  "use strict";

  describe("pentaho.visual.action.Update", function() {

    it("should be defined", function() {

      expect(typeof UpdateAction).toBe("function");
    });

    it("should extend visual.action.Base", function() {

      expect(UpdateAction.prototype instanceof BaseAction).toBe(true);
    });

    it("should be asynchronous", function() {

      expect(UpdateAction.type.isSync).toBe(false);
    });
  });
});
