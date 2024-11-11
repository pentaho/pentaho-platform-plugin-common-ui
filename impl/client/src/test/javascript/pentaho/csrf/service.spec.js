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

define(function() {

  "use strict";

  describe("pentaho.csrf.service", function() {
    var pentahoUrl = "http://pentaho-host:8080/path/";
    var sameAppUrl = pentahoUrl + "some";
    var otherAppUrl = "http://other-origin:8080/service";
    var xhrMock;

    function configAmd(localRequire) {
      // Reset config first.
      localRequire.config({
        config: {
          "pentaho/environment": null
        }
      });

      localRequire.config({
        config: {
          "pentaho/environment": {
            "server": {
              "root": pentahoUrl
            }
          }
        }
      });

      localRequire.define("pentaho/util/url", function() {
        return {
          create: jasmine.createSpy("createUrl").and.callFake(function(url) {
            return {
              href: url
            };
          })
        };
      });
    }

    function createXhrMockFactoryWithStatus(status) {

      return function createXhrFactory() {

        xhrMock = jasmine.createSpyObj("XHR", [
          "open",
          "setRequestHeader",
          "send",
          "getResponseHeader"
        ]);

        xhrMock.getResponseHeader.and.callFake(function(key) {
          switch(key) {
            case "X-CSRF-HEADER": return "header1";
            case "X-CSRF-PARAM": return "param1";
            case "X-CSRF-TOKEN": return "token1";
            default: return null;
          }
        });

        xhrMock.status = status === null ? 200 : status;

        return xhrMock;
      };
    }

    describe("#getToken(url)", function() {

      it("should throw Error if url is not specified", function() {

        return require.using(["pentaho/csrf/service"], function(csrfService) {
          expect(function() {
            csrfService.getToken();
          }).toThrowError(Error);
        });
      });

      it("should return null if url is not from the same origin as the Pentaho server", function() {

        return require.using(["pentaho/csrf/service"], configAmd, function(csrfService) {

          var token = csrfService.getToken(otherAppUrl);

          expect(token).toBe(null);
        });
      });

      it("should return non-null if url is from the same origin as the Pentaho server", function() {

        return require.using(["pentaho/csrf/service"], configAmd, function(csrfService) {

          csrfService.__createXhr = createXhrMockFactoryWithStatus(200);

          var token = csrfService.getToken(sameAppUrl);

          expect(token).not.toBe(null);
        });
      });

      it("should build a URL with the given url so that it is made absolute", function() {

        return require.using([
          "pentaho/csrf/service",
          "pentaho/util/url"
        ], configAmd, function(csrfService, urlUtil) {

          csrfService.__createXhr = createXhrMockFactoryWithStatus(200);

          var callCount = urlUtil.create.calls.count();

          urlUtil.create.and.returnValue({
            "href": sameAppUrl
          });

          var token = csrfService.getToken("foo");

          expect(urlUtil.create).toHaveBeenCalledTimes(callCount + 1);
          expect(urlUtil.create).toHaveBeenCalledWith("foo");

          // Used the sameAppUrl in href!
          expect(token).not.toBe(null);
        });
      });

      it("should return a CSRF token with the data returned by the CSRF service (status code 200)", function() {

        return require.using(["pentaho/csrf/service"], configAmd, function(csrfService) {

          csrfService.__createXhr = createXhrMockFactoryWithStatus(200);

          var token = csrfService.getToken(sameAppUrl);

          expect(token).not.toBe(null);
          expect(token.header).toBe("header1");
          expect(token.parameter).toBe("param1");
          expect(token.token).toBe("token1");
        });
      });

      it("should return a CSRF token with the data returned by the CSRF service (status code 204)", function() {

        return require.using(["pentaho/csrf/service"], configAmd, function(csrfService) {

          csrfService.__createXhr = createXhrMockFactoryWithStatus(200);

          var token = csrfService.getToken(sameAppUrl);

          expect(token).not.toBe(null);
          expect(token.header).toBe("header1");
          expect(token.parameter).toBe("param1");
          expect(token.token).toBe("token1");
        });
      });

      it("should return null if the CSRF service returns a status other than 204 or 200", function() {

        return require.using(["pentaho/csrf/service"], configAmd, function(csrfService) {

          var token = csrfService.getToken(otherAppUrl);

          csrfService.__createXhr = createXhrMockFactoryWithStatus(300);

          expect(token).toBe(null);
        });
      });

      it("should call CSRF service using a sync GET HTTP method and passing the 'url'" +
        " parameter in the request's query string", function() {

        return require.using(["pentaho/csrf/service"], configAmd, function(csrfService) {

          csrfService.__createXhr = createXhrMockFactoryWithStatus(200);

          csrfService.getToken(sameAppUrl);

          var urlQueryString = "url=" + encodeURIComponent(sameAppUrl);
          var expectedUrl = pentahoUrl + "api/csrf/token?" + urlQueryString;

          expect(xhrMock.open).toHaveBeenCalledTimes(1);
          expect(xhrMock.open).toHaveBeenCalledWith("GET", expectedUrl, false);
        });
      });

      it("should call the CSRF service send method", function() {

        return require.using(["pentaho/csrf/service"], configAmd, function(csrfService) {

          csrfService.__createXhr = createXhrMockFactoryWithStatus(200);

          csrfService.getToken(sameAppUrl);

          expect(xhrMock.send).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
