
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
  // In the current JsDocs3 version (3.3.2), enums are not showing default values (see #689).
  // So I added the default values in the text, explicitly.
  // Also, had to use the "var" syntax for it to correctly capture the enum's properties...

  /**
   * The `WellKnownGeoRole` enum is the
   * class of names of well known geographical roles that an attribute can take.
   *
   * #### AMD
   *
   * To obtain this enumeration object,
   * require the module `"pentaho/data/WellKnownGeoRole"`.
   *
   * @memberOf pentaho.data
   * @enum {string}
   * @readonly
   * @ignore
   */
  var WellKnownGeoRole = {
    /**
     * A country: `"Country"`.
     *
     * Equivalent to Mondrian's `"country"` geo role.
     * @default
     */
    COUNTRY: "Country",

    /**
     * A country subdivision: `"CountrySubdivision"`.
     *
     * Equivalent to Mondrian's `"state"` geo role.
     * @default
     */
    COUNTRY_SUBDIVISION: "CountrySubdivision",

    /**
     * A country secondary subdivision: `"CountrySecondarySubdivision"`.
     *
     * Equivalent to Mondrian's `"county"` geo role.
     * @default
     */
    COUNTRY_SECONDARY_SUBDIVISION: "CountrySecondarySubdivision",

    /**
     * A municipality: `"Municipality"`.
     *
     * Equivalent to Mondrian's `"city"` geo role.
     * @default
     */
    MUNICIPALITY: "Municipality",

    /**
     * A postal code: `"PostalCode"`.
     *
     * Equivalent to Mondrian's `"postal_code"` geo role.
     * @default
     */
    POSTAL_CODE: "PostalCode",

    /**
     * A latitude coordinate: `"Latitude"`.
     *
     * Equivalent to Mondrian's `"latitude"` geo role.
     * @default
     */
    LATITUDE: "Latitude",

    /**
     * A longitude coordinate: `"Longitude"`.
     *
     * Equivalent to Mondrian's `"longitude"` geo role.
     * @default
     */
    LONGITUDE: "Longitude"
  };

  return WellKnownGeoRole;
});
