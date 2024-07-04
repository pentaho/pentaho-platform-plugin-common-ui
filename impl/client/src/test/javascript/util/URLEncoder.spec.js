/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2014 - 2024 Hitachi Vantara. All rights reserved.
 */

define(["common-ui/util/URLEncoder"], function(Encoder) {

  describe("URL Encoder", function() {

    it("should handle non-reserved strings", function() {
      expect(Encoder.encode("http://www.foo.com/{0}/{1}/", ["bang", "baz"]))
        .toBe("http://www.foo.com/bang/baz/");
    });

    it("should handle reserved URI strings", function() {
      expect(Encoder.encode("http://www.foo.com/{0}/{1}/", ["&/\\", "?:"]))
        .toBe("http://www.foo.com/%26%252F%255C/%3F%3A/");
    });

    it("should handle multiple occurrences of slashes", function() {
      expect(Encoder.encode("http://www.foo.com/{0}/{1}/", ["&/\\foo\\", "?:/var/"]))
        .toBe("http://www.foo.com/%26%252F%255Cfoo%255C/%3F%3A%252Fvar%252F/");
    });

    it("should handle a single string args", function() {
      expect(Encoder.encode("http://www.foo.com/{0}/", "foo"))
        .toBe("http://www.foo.com/foo/");
    });

    it("should handle query obj", function() {
      var queryObj = {
        arg1: "value1",
        arg2: [1, 2]
      };

      expect(Encoder.encode("http://www.foo.com/{0}/{1}/", ["foo", "bar"], queryObj))
        .toBe("http://www.foo.com/foo/bar/?arg1=value1&arg2=1&arg2=2");
    });

    it("should handle no args and no queryObjs", function() {
      expect(Encoder.encode("http://www.foo.com/")).toBe("http://www.foo.com/");
    });

    it("should encode generic file path characters", function() {
      expect(Encoder.encodeGenericFilePath("/home/Ab`~!@#$%^&()_+{}<>?'=-yZ:")).toBe(":home:Ab`\t!@#$%^&()_+{}<>?'=-yZ~");
    });
  });
});
