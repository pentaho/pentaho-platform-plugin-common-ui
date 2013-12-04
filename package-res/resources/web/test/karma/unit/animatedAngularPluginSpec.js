var deps = [
    'common-ui/AnimatedAngularPlugin',
    'common-ui/AnimatedAngularPluginHandler',
    'common-ui/angular',
    'common-ui/AngularPluginHandler'
];

pen.define(deps, function(AnimatedAngularPlugin, AnimatedAngularPluginHandler, angular, AngularPluginHandler) {

    describe("Animated Angular Plugin", function() {
        var moduleName = "test";

        describe("Constructor", function() {

            it("should throw an exception when attaching a non-supported plugin handler", function() {
                expect(function(){
                    new AnimatedAngularPlugin({
                        moduleName : moduleName,
                        pluginHandler : new AngularPluginHandler()
                    });
                }).toThrow(AnimatedAngularPlugin.errMsgs.notAnAnimatedAngularPluginHandler);
            })
        })

        describe("Functions", function() {           

            var plugin, pluginHandler, module;
            var path = "/test";
            
            beforeEach(function() {
                pluginHandler = new AnimatedAngularPluginHandler();
                module = pluginHandler.module(moduleName, []);

                plugin = new AnimatedAngularPlugin({
                    moduleName : moduleName,
                    pluginHandler : pluginHandler
                });
            });

            var runTests = function() {
                it("should goto a url and set the animation to 'none'", function() {
                    plugin.goto(path);
                    expect(module.$location.path()).toMatch(moduleName + path);
                    expect(pluginHandler.animation).toBe("none");
                })

                it("should goto a url and set the animation to 'slide-left'", function() {
                    plugin.goNext(path);
                    expect(module.$location.path()).toMatch(moduleName + path);
                    expect(pluginHandler.animation).toBe("slide-left");
                })

                it("should goto a url and set the animation to 'slide-right'", function() {
                    plugin.goPrevious(path);
                    expect(module.$location.path()).toMatch(moduleName + path);
                    expect(pluginHandler.animation).toBe("slide-right");
                })

                it("should goto a url and set the animation to 'fade'", function() {
                    plugin.open(path);
                    expect(module.$location.path()).toMatch(moduleName + path);
                    expect(pluginHandler.animation).toBe("fade");
                })

                it("should go home and set the animation to 'none'", function() {
                    plugin.goHome();
                    expect(module.$location.path()).toBe("/");
                    expect(pluginHandler.animation).toBe("none");
                });

                it("should go home and set the animation to 'fade'", function() {
                    plugin.close();
                    expect(module.$location.path()).toBe("/");
                    expect(pluginHandler.animation).toBe("fade");
                });
            }

            describe("registering before bootstrapping", function() {
                
                beforeEach(function() {
                    plugin.register();
                    angular.bootstrap(null, [moduleName]);
                })

                runTests();
            })

            describe("registering after bootstrapping", function() {

                beforeEach(function() {
                    angular.bootstrap(null, [moduleName]);
                    plugin.register();
                })

                runTests();
            })

            
        })

    })
})