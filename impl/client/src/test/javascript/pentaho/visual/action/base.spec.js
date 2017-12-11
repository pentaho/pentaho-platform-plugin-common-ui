/*!
 * Copyright 2017 Hitachi Vantara.  All rights reserved.
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

  var BaseAction;

  beforeAll(function(done) {

    Context.createAsync()
        .then(function(context) {
          return context.getDependencyAsync({
            BaseAction: "pentaho/visual/action/base"
          });
        })
        .then(function(types) {
          BaseAction = types.BaseAction;
        })
        .then(done, done.fail);
  });

  describe("pentaho.visual.action.Base", function() {

    it("should be defined", function() {

      expect(typeof BaseAction).toBe("function");
    });
  });
});
