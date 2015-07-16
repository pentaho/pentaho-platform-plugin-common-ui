
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
 * Copyright 2015 Pentaho Corporation. All rights reserved.
 */

/**
 * The possible configurations to define the environment where the require-cfg files are running.
 * This allows the build and test environments, differing between several plugins to fully configure the path where
 * the files from the external lib are served
 *
 * @type {{paths: {common-ui: string, cdf: string}}}
 */
var ENVIRONMENT_CONFIG = {
  paths: {
    "cdf": "../../build-res/module-scripts/cdf/js",
    "cdf/lib": "../../build-res/module-scripts/cdf/js/lib"
  }
};
var KARMA_RUN = true;
var pen = {define : define, require : require};
var SESSION_LOCALE="en";
