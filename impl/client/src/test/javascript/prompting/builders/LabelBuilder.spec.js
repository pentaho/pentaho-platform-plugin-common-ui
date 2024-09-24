/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
define(['common-ui/prompting/builders/LabelBuilder'], function(LabelBuilder) {

  describe("LabelBuilder", function() {

    var args;
    var labelBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { }
        },
        param:  {
          values: { },
          attributes: { },
          name: 'label-test'
        }
      };
      labelBuilder = new LabelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(labelBuilder.build).toThrow();
    });

    it("should return a TextComponent", function() {
      var component = labelBuilder.build(args);
      expect(component.type).toBe('TextComponent');
      expect(component.expression()).toEqual(args.param.name);
    });

  });

});
