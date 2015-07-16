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
 *
 */
define(['common-ui/prompting/builders/GarbageCollectorBuilder'], function(GarbageCollectorBuilder) {

  describe("GarbageCollectorBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { return "12345"},
        getParameterName: function() { },
        removeDashboardComponents: function() { }
      }, 
      param:  {
        values: { },
        attributes: { }
      },
      components: []
    };

    var garbageCollectorBuilder;

    beforeEach(function() {
      garbageCollectorBuilder = new GarbageCollectorBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(garbageCollectorBuilder.build).toThrow();
    });

    it("should return a GarbageCollectorComponent", function() {
      var component = garbageCollectorBuilder.build(args);
      expect(component.name.indexOf('gc') == 0).toBeTruthy();
      expect(component.preExecution).toBeDefined();
      expect(component.preExecution()).toBeFalsy();
    });

  });

});
