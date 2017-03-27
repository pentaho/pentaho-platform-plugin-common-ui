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

define(function() {
  // Null Members:  {v: "...[#null]", f: "Not Available"}
  // Null Values:   come as a null cell or null cell value ("-" report setting only affects the pivot table view).
  var _nullMemberRe = /\[#null\]$/;

  return {
    isNullMember: function(member) {
        return member == null || _nullMemberRe.test(member);
    },

    defaultFont: function(font, defaultSize) {
        if(!font) return (defaultSize || 10) + 'px OpenSansRegular, sans-serif';

        return font.replace(/\bdefault\s*$/i, 'OpenSansRegular, sans-serif');
    },

    readFontModel: function(model, prefix) {
      var size = model.getv(prefix + "Size");
      if(size) {
        var style = model.getv(prefix + "Style");
        if(style == null || style === "plain")
          style = "";
        else
          style += " ";

        return style + size + "px " + model.getv(prefix + "FontFamily");
      }
    }
  };
});
