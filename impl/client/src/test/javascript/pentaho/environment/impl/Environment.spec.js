/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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
  "pentaho/environment/impl/Environment"
], function(Environment) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.environment.impl.Environment -", function() {

    var environmentSpec = {
      application: "APP-1",
      theme: "THEME-1",
      locale: "LOCALE-1",
      user: {
        id:   "USER-1",
        home: "USER-HOME-1"
      },
      reservedChars: "RESERVED-CHARS-1",
      server: {
        root: "http://host:8888/path-1",
        packages: "http://host:8888/o-path-1",
        services: "http://host:8888/s-path-1"
      }
    };

    var emptyEnvironmentSpec = {
      application: "",
      theme: "",
      locale: "",
      user: {
        id:   "",
        home: ""
      },
      reservedChars: "",
      server: {
        root: "",
        packages: "",
        services: ""
      }
    };

    var nullEnvironmentSpec = {
      application: null,
      theme: null,
      locale: null,
      user: {
        id:   null,
        home: null
      },
      reservedChars: null,
      server: {
        root: null,
        packages: null,
        services: null
      }
    };

    var defaultEnvironmentSpec = {
      application: "APP",
      theme: "THEME",
      locale: "LOCALE",
      user: {
        id:   "USER",
        home: "USER-HOME"
      },
      reservedChars: "RESERVED-CHARS",
      server: {
        root: "http://host:8888/path-2",
        packages: "http://host:8888/o-path-2",
        services: "http://host:8888/s-path-2"
      }
    };

    function expectEnvironmentAndSpec(environment, environmentSpec) {
      expect(environment.application).toBe(environmentSpec.application);
      expect(environment.theme).toBe(environmentSpec.theme);
      expect(environment.locale).toBe(environmentSpec.locale.toLowerCase());

      expect(environment.user.id).toBe(environmentSpec.user.id);
      expect(environment.user.home).toBe(environmentSpec.user.home);

      expect(environment.server.root.href).toBe(environmentSpec.server.root);
      expect(environment.server.packages.href).toBe(environmentSpec.server.packages);
      expect(environment.server.services.href).toBe(environmentSpec.server.services);

      expect(environment.reservedChars).toBe(environmentSpec.reservedChars);
    }

    function expectEnvironmentNullValues(environment) {
      expect(environment.application).toBe(null);
      expect(environment.theme).toBe(null);
      expect(environment.locale).toBe(null);

      expect(environment.user.id).toBe(null);
      expect(environment.user.home).toBe(null);

      expect(environment.server.root).toBe(null);
      expect(environment.server.packages).toBe(null);
      expect(environment.server.services).toBe(null);

      expect(environment.reservedChars).toBe(null);
    }

    it("is a function", function() {
      expect(typeof Environment).toBe("function");
    });

    describe("new Environment(spec, [defaultSpec]) -", function() {

      it("should return a Environment instance", function() {

        var environment = new Environment();
        expect(environment instanceof Environment).toBe(true);
      });

      it("should default properties to the default value specified", function() {

        var environment = new Environment(null, defaultEnvironmentSpec);

        expectEnvironmentAndSpec(environment, defaultEnvironmentSpec);
      });

      it("should default properties to null when defaultSpec is not specified", function() {

        var environment = new Environment();

        expectEnvironmentNullValues(environment);
      });

      it("should default properties to null when defaultSpec contains empty values", function() {

        var environment = new Environment(emptyEnvironmentSpec);

        expectEnvironmentNullValues(environment);
      });

      it("should set properties to the value specified", function() {

        var environment = new Environment(environmentSpec, defaultEnvironmentSpec);

        expectEnvironmentAndSpec(environment, environmentSpec);

        environment = new Environment(environmentSpec);

        expectEnvironmentAndSpec(environment, environmentSpec);
      });
    });

    describe("#toSpec()", function() {

      it("should return an object with the same values (except for a lower case locale)", function() {
        var environment = new Environment(environmentSpec);

        environmentSpec.locale = environmentSpec.locale.toLowerCase();

        expect(environment.toSpec()).toEqual(environmentSpec);

        environment = new Environment();

        expect(environment.toSpec()).toEqual(nullEnvironmentSpec);
      });

      it("should be the same method as toJSON", function() {
        var environment = new Environment();

        expect(environment.toSpec).toBe(environment.toJSON);
      });
    });

    describe("#createChild(childSpec)", function() {

      it("should return an instance of Environment", function() {
        var environment = new Environment(environmentSpec);
        var childEnvironment = environment.createChild();
        expect(childEnvironment instanceof Environment).toBe(true);
      });

      it("should be a different instance", function() {
        var environment = new Environment(environmentSpec);
        var childEnvironment = environment.createChild();
        expect(childEnvironment).not.toBe(environment);
      });

      it("should have the same information as the parent when no spec is specified", function() {
        var environment = new Environment(environmentSpec);

        environmentSpec.locale = environmentSpec.locale.toLowerCase();

        var childEnvironment = environment.createChild();
        expect(childEnvironment.toSpec()).toEqual(environmentSpec);
      });

      it("should override the information specified in childSpec", function() {
        var environment = new Environment(defaultEnvironmentSpec);
        var childEnvironment = environment.createChild(environmentSpec);

        environmentSpec.locale = environmentSpec.locale.toLowerCase();

        expect(childEnvironment.toSpec()).toEqual(environmentSpec);
      });
    });
  }); // pentaho.environment.impl.Environment
});
