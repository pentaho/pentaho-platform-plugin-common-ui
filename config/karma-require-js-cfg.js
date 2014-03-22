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
 * Copyright 2014 Pentaho Corporation.  All rights reserved.
 */

// Find and inject tests using require
var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return (/Spec\.js$/).test(file);
});

requireCfg['deps'] = tests;

requireCfg['baseUrl'] = 'base/'

requireCfg['paths']['angular-mocks'] = "angular/angular-mocks";
requireCfg['paths']['angular-scenario'] = "angular/angular-scenario";

requireCfg['shim']['angular-mocks'] = { deps: ['common-ui/angular-resource'] };
requireCfg['callback'] = function() {
  window.__karma__.start();
};
requirejs.config(requireCfg);