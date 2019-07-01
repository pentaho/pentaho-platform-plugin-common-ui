/*!
 * Copyright 2010 - 2019 Hitachi Vantara.  All rights reserved.
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
define([ "common-ui/util/formatting" ], function( Formatting ) {

  describe("formatting", function() {

    describe("normalizeParameterValue", function() {

      it("should return null if type is null", function() {
        var parameter = {
          attributes: {timezone: "client"}
        };
        var normalizedParameterValue = Formatting.normalizeParameterValue(parameter, null, "2019-06-20T15:30:13.000+0100");
        expect(normalizedParameterValue).toBe(null);
      });
      it("should return null if value is null", function() {
        var parameter = {
          attributes: {timezone: "client"}
        };
        var normalizedParameterValue = Formatting.normalizeParameterValue(parameter, "java.util.Date", null);
        expect(normalizedParameterValue).toBe(null);
      });
      it("should return the same value if type is not a Date type", function() {
        var parameter = {
          attributes: {timezone: "client"}
        };
        var normalizedParameterValue = Formatting.normalizeParameterValue(parameter, "String", "2019-06-20T15:30:13.000+0100");
        expect(normalizedParameterValue).toBe("2019-06-20T15:30:13.000+0100");
      });
      it("should return the same value if type is a Date type and timezone is not defined", function() {
        var parameter = {
          attributes: {timezone: ""}
        };
        var normalizedParameterValue = Formatting.normalizeParameterValue(parameter, "String", "2019-06-20T15:30:13.000+0100");
        expect(normalizedParameterValue).toBe("2019-06-20T15:30:13.000+0100");
      });
      it("should return the same value if type is a Date type and timezone is 'server'", function() {
        var parameter = {
          attributes: {timezone: "server"}
        };
        var normalizedParameterValue = Formatting.normalizeParameterValue(parameter, "String", "2019-06-20T15:30:13.000+0100");
        expect(normalizedParameterValue).toBe("2019-06-20T15:30:13.000+0100");
      });
    });
  });

});