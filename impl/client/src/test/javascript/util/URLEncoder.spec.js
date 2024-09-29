/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


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
