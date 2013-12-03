var deps = [
    'common-ui/AngularPlugin',
    'common-ui/AngularPluginHandler',
    'common-ui/PluginHandler',
    'common-ui/angular'
];

pen.define(deps, function(AngularPlugin, AngularPluginHandler, PluginHandler, angular) {

    describe("Angular Plugin", function() {

        describe("Constructor Tests", function() {
            it("should fail when creating a plugin without a module name", function() {
                expect(function(){
                    new AngularPlugin({ pluginHandler : new PluginHandler() });
                }).toThrow(AngularPlugin.errMsgs.moduleNameNotDefined);
            })

            it("should fail when creating a plugin with the wrong plugin handler", function() {
                expect(function(){
                    new AngularPlugin({
                        moduleName : "test",
                        pluginHandler : new PluginHandler()
                    });
                }).toThrow(AngularPlugin.errMsgs.notAnAngularPluginHandler);
            })
        })

        describe("Function Tests", function() {
            var plugin, module;
            var moduleName = "test";

            beforeEach(function() {
                var pluginHandler = new AngularPluginHandler();
                module = pluginHandler.module(moduleName);

                plugin = new AngularPlugin({
                    moduleName : moduleName,
                    pluginHandler : pluginHandler,
                    onRegister : function(){},
                    onUnregister : function(){}
                });

                spyOn(plugin.config, "onRegister");
                spyOn(plugin.config, "onUnregister");
            })

            it("should have the same functions as the Pentaho Plugin", function() {
                expect(plugin.register).toBeDefined();
                expect(plugin.unregister).toBeDefined();
            })

            it("should register a plugin and have its onRegister, provided in the configuration, called", function() {
                plugin.register();
                expect(plugin.config.onRegister).toHaveBeenCalled();
            })

            it("should unregister a plugin and have its onUnregister, provided in the configuration, called", function() {
                plugin.register();
                plugin.unregister();
                expect(plugin.config.onUnregister).toHaveBeenCalled();
            })

            var testGoHome = function() {
                it("should goHome", function() {
                    plugin.goHome();
                    expect(module.$location.path()).toMatch('/');
                });
            }

            var testGoto = function() {
                it("should goto a specific url, namespaced with the moduleName", function() {
                    var path = "/test";
                    plugin.goto(path);
                    expect(module.$location.path()).toMatch(moduleName + path);
                });
            }

            describe("registering a plugin before bootstrapping", function() {
                beforeEach(function() {
                    plugin.register();
                    angular.bootstrap(null, [moduleName]);
                })

                testGoto();
                testGoHome();
            });

            describe("registering a plugin after bootstrapping", function() {
                beforeEach(function(){
                    angular.bootstrap(null, [moduleName]);
                    plugin.register();
                })

                testGoto();
                testGoHome();
            })

        })
    })
})