/*!
 * PENTAHO CORPORATION PROPRIETARY AND CONFIDENTIAL
 *
 * Copyright 2002 - 2016 Pentaho Corporation (Pentaho). All rights reserved.
 *
 * NOTICE: All information including source code contained herein is, and
 * remains the sole property of Pentaho and its licensors. The intellectual
 * and technical concepts contained herein are proprietary and confidential
 * to, and are trade secrets of Pentaho and may be covered by U.S. and foreign
 * patents, or patents in process, and are protected by trade secret and
 * copyright laws. The receipt or possession of this source code and/or related
 * information does not convey or imply any rights to reproduce, disclose or
 * distribute its contents, or to manufacture, use, or sell anything that it
 * may describe, in whole or in part. Any reproduction, modification, distribution,
 * or public display of this information without the express written authorization
 * from Pentaho is strictly prohibited and in violation of applicable laws and
 * international treaties. Access to the source code contained herein is strictly
 * prohibited to anyone except those individuals and entities who have executed
 * confidentiality and non-disclosure agreements or other agreements with Pentaho,
 * explicitly covering such access.
 */


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
        });
    }
);
