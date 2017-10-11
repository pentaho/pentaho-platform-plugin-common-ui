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
 * Copyright 2014 - 2017 Hitachi Vantara.  All rights reserved.
 */

define([], function() {

  function _preFetchTemplate(path, templateCache) {
    var req = new XMLHttpRequest();
    var tpl = "";
    req.onload = function() {
      tpl = this.responseText;
    };
    req.open("get", path, false);
    req.send();
    if(tpl) {
      templateCache.put(path, tpl);
      return tpl;
    } else {
      return null;
    }
  }

  return {

    addTemplate: function(path, httpBackend, templateCache) {
      var url = require.toUrl(path);
      var tpl = _preFetchTemplate(url, templateCache);
      httpBackend.when('GET', url).respond(tpl);
    }

  }

});