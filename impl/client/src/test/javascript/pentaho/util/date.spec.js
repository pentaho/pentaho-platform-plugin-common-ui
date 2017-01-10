/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/util/date"
], function(date) {

  "use strict";

  var global = window;

  describe("pentaho.util.date", function() {

    it("is defined", function() {
      expect(date instanceof Object).toBe(true);
    });

    describe(".parseDateEcma262v7(s)", function() {

      it("should return null if s is null", function() {
        expect(date.parseDateEcma262v7(null)).toBe(null);
      });

      it("should return null if s is undefined", function() {
        expect(date.parseDateEcma262v7(undefined)).toBe(null);
      });

      it("should return a Date of corresponding given milliseconds number", function() {
        var d1 = new Date();
        var d2 = date.parseDateEcma262v7(d1.getTime());

        expect(d2 instanceof Date).toBe(true);
        expect(d2.getTime()).toBe(d1.getTime());
      });

      it("should return a given Date instance, unmodified", function() {
        var d1 = new Date();
        var ms1 = d1.getTime();
        var d2 = date.parseDateEcma262v7(d1);

        expect(d2).toBe(d1);
        expect(d1.getTime()).toBe(ms1);
      });

      describe("when called with a string", function() {
        var OriginalDate;

        beforeEach(function() {
          // Intercept the global Date constructor.

          OriginalDate = global.Date;
          global.Date = jasmine.createSpy().and.callFake(function() {
            switch(arguments.length) {
              case 1: return new OriginalDate(arguments[0]);
              case 7: return new OriginalDate(
                  arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
              default: throw new Error("Not supported by mock function.");
            }
          });

          global.Date.UTC = jasmine.createSpy().and.callFake(function() {
            return OriginalDate.UTC.apply(OriginalDate, arguments);
          });
        });

        afterEach(function() {
          global.Date = OriginalDate;
        });

        function itLocal(s, comps) {
          // Fix month
          var comps2 = comps.slice();
          comps2[1] += 1;

          it("should parse '" + s + "' as Local time [" + comps2 + "]", function() {
            var d = date.parseDateEcma262v7(s);

            expect(global.Date)
                .toHaveBeenCalledWith(comps[0], comps[1], comps[2], comps[3], comps[4], comps[5], comps[6]);

            var t = new OriginalDate(comps[0], comps[1], comps[2], comps[3], comps[4], comps[5], comps[6]);
            expect(d.getTime()).toBe(t.getTime());
          });
        }

        function itUTC(s, comps) {
          // Fix month
          var comps2 = comps.slice();
          comps2[1] += 1;

          it("should parse '" + s + "' as UTC time [" + comps2 + "]", function() {
            var d = date.parseDateEcma262v7(s);

            expect(global.Date.UTC)
                .toHaveBeenCalledWith(comps[0], comps[1], comps[2], comps[3], comps[4], comps[5], comps[6]);

            var t = new OriginalDate(
                OriginalDate.UTC(comps[0], comps[1], comps[2], comps[3], comps[4], comps[5], comps[6]));
            expect(d.getTime()).toBe(t.getTime());
          });
        }

        function itFailsWith(s, explain) {
          it("should return null if given '" + s + "' - " + explain, function() {
            var d = date.parseDateEcma262v7(s);
            expect(d).toBe(null);
          });
        }

        describe("when no timezone is specified", function() {

          describe("when given a date-only string", function() {

            itLocal("2016", [2016, 0, 1, 0, 0, 0, 0]);
            itLocal("2016-02", [2016, 1, 1, 0, 0, 0, 0]);
            itLocal("2016-02-02", [2016, 1, 2, 0, 0, 0, 0]);
          });

          describe("when given a date and time string", function() {

            itUTC("2016T20:30:40.333", [2016, 0, 1, 20, 30, 40, 333]);
            itUTC("2016-02T20:30:40.333", [2016, 1, 1, 20, 30, 40, 333]);
            itUTC("2016-02-02T20:30:40.333", [2016, 1, 2, 20, 30, 40, 333]);
            itUTC("2016-02-02T20:30", [2016, 1, 2, 20, 30, 0, 0]);
          });
        });

        describe("when a Z timezone is specified", function() {

          describe("when given a date-only string", function() {

            itUTC("2016Z", [2016, 0, 1, 0, 0, 0, 0]);
            itUTC("2016-02Z", [2016, 1, 1, 0, 0, 0, 0]);
            itUTC("2016-02-02Z", [2016, 1, 2, 0, 0, 0, 0]);
          });

          describe("when given a date and time string", function() {

            itUTC("2016T20:30:40.333Z", [2016, 0, 1, 20, 30, 40, 333]);
            itUTC("2016-02T20:30:40.333Z", [2016, 1, 1, 20, 30, 40, 333]);
            itUTC("2016-02-02T20:30:40.333Z", [2016, 1, 2, 20, 30, 40, 333]);
            itUTC("2016-02-02T20:30Z", [2016, 1, 2, 20, 30, 0, 0]);
          });
        });

        describe("when an UTC relative, +HH:mm, timezone is specified", function() {

          describe("when given a date-only string", function() {

            itUTC("2016+01:00", [2016, 0, 1, -1, 0, 0, 0]);
            itUTC("2016-02+01:00", [2016, 1, 1, -1, 0, 0, 0]);
            itUTC("2016-02-02+01:00", [2016, 1, 2, -1, 0, 0, 0]);

            itUTC("2016+01:30", [2016, 0, 1, -1, -30, 0, 0]);
            itUTC("2016-02+01:30", [2016, 1, 1, -1, -30, 0, 0]);
            itUTC("2016-02-02+01:30", [2016, 1, 2, -1, -30, 0, 0]);
          });

          describe("when given a date and time string", function() {

            itUTC("2016T10:20:30.444+01:00", [2016, 0, 1, 10 - 1, 20, 30, 444]);
            itUTC("2016-02T10:20:30.444+01:00", [2016, 1, 1, 10 - 1, 20, 30, 444]);
            itUTC("2016-02-02T10:20:30.444+01:00", [2016, 1, 2, 10 - 1, 20, 30, 444]);

            itUTC("2016-02-02T10:20+01:00", [2016, 1, 2, 10 - 1, 20, 0, 0]);
            itUTC("2016-02-02T10:20:30+01:00", [2016, 1, 2, 10 - 1, 20, 30, 0]);

            itUTC("2016-02-02T20:30+01:00", [2016, 1, 2, 20 - 1, 30, 0, 0]);

            itUTC("2016T10:20:30.444+01:30", [2016, 0, 1, 10 - 1, 20 - 30, 30, 444]);
            itUTC("2016-02T10:20:30.444+01:30", [2016, 1, 1, 10 - 1, 20 - 30, 30, 444]);
            itUTC("2016-02-02T10:20:30.444+01:30", [2016, 1, 2, 10 - 1, 20 - 30, 30, 444]);
          });
        });

        describe("when an UTC relative, -HH:mm, timezone is specified", function() {

          describe("when given a date-only string", function() {

            // This combination would be ambiguous with year or year-month dates.

            itUTC("2016-02-02-01:00", [2016, 1, 2, +1, 0, 0, 0]);
            itUTC("2016-02-02-01:30", [2016, 1, 2, +1, +30, 0, 0]);
          });

          describe("when given a date and time string", function() {

            itUTC("2016T10:20:30.444-01:00", [2016, 0, 1, 10 + 1, 20, 30, 444]);
            itUTC("2016-02T10:20:30.444-01:00", [2016, 1, 1, 10 + 1, 20, 30, 444]);
            itUTC("2016-02-02T10:20:30.444-01:00", [2016, 1, 2, 10 + 1, 20, 30, 444]);

            itUTC("2016-02-02T10:20-01:00", [2016, 1, 2, 10 + 1, 20, 0, 0]);
            itUTC("2016-02-02T10:20:30-01:00", [2016, 1, 2, 10 + 1, 20, 30, 0]);

            itUTC("2016-02-02T20:30-01:00", [2016, 1, 2, 20 + 1, 30, 0, 0]);

            itUTC("2016T10:20:30.444-01:30", [2016, 0, 1, 10 + 1, 20 + 30, 30, 444]);
            itUTC("2016-02T10:20:30.444-01:30", [2016, 1, 1, 10 + 1, 20 + 30, 30, 444]);
            itUTC("2016-02-02T10:20:30.444-01:30", [2016, 1, 2, 10 + 1, 20 + 30, 30, 444]);
          });
        });

        describe("when given an invalid string", function() {

          itFailsWith("2016-01-01Z0", "an invalid Z timezone");
          itFailsWith("2016-01-01+01:1", "an invalid +hh:mm timezone");
          itFailsWith("2016-01-01+01:22.000", "an invalid +hh:mm timezone");
          itFailsWith("2016-01-01-01:2", "an invalid -hh:mm timezone");

          itFailsWith("20160101", "a date with no separator");

          itFailsWith("2016-01-01T", "an invalid time");
          itFailsWith("2016-01-01T01", "an invalid time");
          itFailsWith("2016-01-01T0101", "a time with no separator");

          itFailsWith("T01:01", "a time-only date");
          itFailsWith("01:01", "a time-only date");
        });
      });
    });
  });
});
