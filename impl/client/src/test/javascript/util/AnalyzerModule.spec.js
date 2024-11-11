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



define(["dojo/ready","common-ui/util/AnalyzerModule","dojo/dom"],
    function(ready, analyzerModule, dom){
        describe( "Tests analyzer module initialization", function(){

            var analyzerModuleObject = null;
            var options = null;
            var mockDomElement = null;

            var mockApi = jasmine.createSpy("mockApi",["operation"]);
            var mockOperationApi = jasmine.createSpy("mockOperationApi",["resetReport"]);

            var moduleUrl = "http://localhost:10000/pentaho";
            var moduleDomContainerId = "analyzer-div-container";
            var moduleCatalog = "models/Model 1.xmi";
            var moduleCube = "Model 1";
            var moduleDataSource = "DataServiceName";

            options = {
                "url" : moduleUrl,
                "parentElement" : moduleDomContainerId,
                "catalog" : moduleCatalog,
                "cube" : moduleCube,
                "dataSource" : moduleDataSource,
                "disableFilterPanel" : "true",
                "removeFieldLayout" : "true",
                "removeFieldList" : "true",
                "removeHeaderBar" : "true",
                "removeMainToolbar" : "true",
                "removeRedoButton" : "true",
                "removeReportActions" : "true",
                "removeUndoButton" : "true",
                "setFieldListView" : "true",
                "showFieldLayout" : "false",
                "showFieldList" : "false",
                "showFilterPanel" : "false"
            };

            beforeEach( function(){
                mockDomElement = jasmine.createSpy("mockDomElement",["className","getAttribute","appendChild"]);
                var mockAttribute =jasmine.createSpy("mockAttribute");
                mockDomElement.getAttribute = function( name ){
                    return mockDomElement[name];
                }

                mockDomElement.setAttribute = function(name, value){
                    mockDomElement[name] = value;
                }

                mockDomElement.style = [];

                mockDomElement.appendChild = function(){
                    return true;
                };

                mockDomElement.removeChild = function(){
                    return true;
                }

                spyOn(mockDomElement, "removeChild");

                spyOn(document, "getElementById").and.returnValue(mockDomElement);
                spyOn(dom, "byId").and.returnValue(mockDomElement);

                analyzerModuleObject = new analyzerModule(options);
                analyzerModuleObject.api = mockApi;
            });

            it("should return provided options", function(){
                for( var option in options ){
                    expect(analyzerModuleObject.getOptions()[option]).toBe(options[option]);
                }
            });

            it("should return generated URL", function(){
                expect(analyzerModuleObject.getUrl()).toContain(moduleUrl)
                expect(analyzerModuleObject.getUrl()).toContain("dataSource=" + moduleDataSource);
            });

            it("should hide the module", function(){
                analyzerModuleObject.hide();
                expect(document.getElementById(analyzerModuleObject.getParentElement()).style.display).toBe("none");
            });

            it("should show the module", function(){
                analyzerModuleObject.show();
                expect(document.getElementById(analyzerModuleObject.getParentElement()).style.display).toBe("block");
            });

            it("should return an api instance", function(){
                var api = analyzerModuleObject.getApi();
                expect(api).toBe(mockApi);
            });

            it("should return a parent element", function(){
                var parentElement = analyzerModuleObject.getParentElement();
                expect(parentElement).toBe(moduleDomContainerId);
            });

            it("should reset properly", function(){
                mockApi.operation = mockOperationApi;
                mockOperationApi.resetReport = function(){};
                spyOn(mockOperationApi, "resetReport");
                analyzerModuleObject.reset();
                expect(mockApi.operation.resetReport).toHaveBeenCalled();
            });

            it("should validate params", function(){
                var result = analyzerModuleObject.validateParams(options);
                expect(result).toBeTruthy();
            });

            it("should fail to validate invalid params", function(){
                var result = analyzerModuleObject.validateParams(null);
                expect(result).toBeFalsy();
            });

            it("should dispose properly", function(){
                analyzerModuleObject.dispose();
                expect(mockDomElement.removeChild).toHaveBeenCalled();
            });

            describe("Tests AnalyzerModule initialization with useLegacyPath", function() {
              beforeEach( function() {
                options.useLegacyPath = "true";
              } );

              it("Should use 'content/analyzer' in the url rather than 'api/repos'", function() {
                analyzerModuleObject = new analyzerModule(options);
                var url = analyzerModuleObject.getUrl();
                expect(url.indexOf("/content/analyzer/") !== -1);
                expect(url.indexOf("/api/repos/xanalyzer/") == -1);
              })
            });
        });
    }
);
