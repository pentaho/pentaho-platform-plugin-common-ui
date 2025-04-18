/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define(function() {

  "use strict";

  describe("pentaho.i18n.server", function() {
    var i18n;
    var mockEnvironment;

    var SERVER_ROOT = "webapp/";

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();

      mockEnvironment = {
        server: {
          root: {
            pathname: "/" + SERVER_ROOT
          }
        }
      };

      localRequire.define("pentaho/environment/main", function() {
        return mockEnvironment;
      });

      return localRequire.promise(["pentaho/i18n/serverService"]).then(function(deps) {
        i18n = deps[0];
      });
    });

    afterEach(function() {
      localRequire.dispose();
    });

    function mockLocalRequire(expectedValue) {

      var mock = jasmine.createSpyObj("localRequire", ["toUrl"]);

      mock.toUrl.and.callFake(function() {
        return expectedValue;
      });

      return mock;
    }

    describe("#__getBundleInfo", function() {
      function testGetBundleInfo(bundlePath, baseUrl, expectedPluginID) {
        var expectedResourceName = "resources/web/" + bundlePath;

        var localRequire = mockLocalRequire(baseUrl + expectedPluginID + "/" + expectedResourceName);

        var bundleInfo = i18n.__getBundleInfo(localRequire, bundlePath);

        expect(bundleInfo.pluginId).toBe(expectedPluginID);
        expect(bundleInfo.name).toBe(expectedResourceName);
      }

      it("should handle resource with an url like 'http://my.domain.com:port/webapp/pluginID/...'", function() {
        var bundlePath = "bundle/path/i18n/foo-http-port";
        var baseUrl = "http://localhost:1234/" + SERVER_ROOT;
        var pluginID = "platform-plugin-1";

        testGetBundleInfo(bundlePath, baseUrl, pluginID);
      });

      it("should handle resource with an url like 'http://my.domain.com/webapp/pluginID/...'", function() {
        var bundlePath = "bundle/path/i18n/foo-default-http-port";
        var baseUrl = "http://localhost/" + SERVER_ROOT;
        var pluginID = "platform-plugin-2";

        testGetBundleInfo(bundlePath, baseUrl, pluginID);
      });

      it("should handle resource with an url like 'https://my.domain.com:port/webapp/pluginID/...'", function() {
        var bundlePath = "bundle/path/i18n/foo-https-port";
        var baseUrl = "https://localhost:1234/" + SERVER_ROOT;
        var pluginID = "platform-plugin-3";

        testGetBundleInfo(bundlePath, baseUrl, pluginID);
      });

      it("should handle resource with an url like 'https://my.domain.com/webapp/pluginID/...'", function() {
        var bundlePath = "bundle/path/i18n/foo-default-https-port";
        var baseUrl = "https://localhost/" + SERVER_ROOT;
        var pluginID = "platform-plugin-4";

        testGetBundleInfo(bundlePath, baseUrl, pluginID);
      });

      it("should handle resource with an url like 'https://my.domain.com/webapp/content/pluginID/...'", function() {
        var bundlePath = "bundle/path/i18n/foo-content";
        var baseUrl = "https://localhost/" + SERVER_ROOT + "content/";
        var pluginID = "platform-plugin-5";

        testGetBundleInfo(bundlePath, baseUrl, pluginID);
      });

      it("should handle resource with an url like '/plugin/pluginID/...'", function() {
        var bundlePath = "bundle/path/i18n/foo-cgg";
        var baseUrl = "/plugin/";
        var pluginID = "platform-plugin-6";

        testGetBundleInfo(bundlePath, baseUrl, pluginID);
      });

      it("should handle resource with an url like 'res:[../]/pluginID/...'", function() {
        var bundlePath = "bundle/path/i18n/foo-res-cgg";
        var baseUrl = "res:../../";
        var pluginID = "platform-plugin-7";

        testGetBundleInfo(bundlePath, baseUrl, pluginID);
      });

    });
  });

});
