var deps = [
    'common-ui/AnimatedAngularPluginHandler',
    'common-ui/AnimatedAngularPlugin',
    'common-ui/angular'
];

define(deps, function(AnimatedAngularPluginHandler, AnimatedAngularPlugin, angular) {

    describe("Animated Angular Plugin Handler", function() {
        var pluginHandler, plugin, module;
        var moduleName = "test";
        var path = "/test";

        beforeEach(function() {
            pluginHandler = new AnimatedAngularPluginHandler();
            module = pluginHandler.module(moduleName, []);

            plugin = new AnimatedAngularPlugin({
                moduleName : moduleName,
                pluginHandler : pluginHandler
            });

            angular.bootstrap(null, [moduleName]);
        });

        var runTests = function(fn) {
            it("should goto a url and set the animation to 'none'", function() {
                fn().goto(path, moduleName);
                expect(module.$location.path()).toMatch(moduleName + path);
                expect(pluginHandler.animation).toBe("none");
            })

            it("should goto a url and set the animation to 'slide-left'", function() {
                fn().goNext(path, moduleName);
                expect(module.$location.path()).toMatch(moduleName + path);
                expect(pluginHandler.animation).toBe("slide-left");
            })

            it("should goto a url and set the animation to 'slide-right'", function() {
                fn().goPrevious(path, moduleName);
                expect(module.$location.path()).toMatch(moduleName + path);
                expect(pluginHandler.animation).toBe("slide-right");
            })

            it("should goto a url and set the animation to 'fade'", function() {
                fn().open(path, moduleName);
                expect(module.$location.path()).toMatch(moduleName + path);
                expect(pluginHandler.animation).toBe("fade");
            })

            it("should goto a url and set the animation to 'slide-down-top'", function() {
                fn().slideDownTop(path, moduleName);
                expect(module.$location.path()).toMatch(moduleName + path);
                expect(pluginHandler.animation).toBe("slide-down-top");
            })

            it("should go home and set the animation to 'slide-left'", function() {
                if (fn().$root) {
                  // rootscope doesn't need module name
                  fn().goHome(true);
                } else {
                  fn().goHome(moduleName, true);
                }
                expect(module.$location.path()).toBe("/");
                expect(pluginHandler.animation).toBe("slide-left");
            })

            it("should go home and set the animation to 'none'", function() {
                if (fn().$root) {
                  // rootscope doesn't need module name
                  fn().goHome();
                } else {
                  fn().goHome(moduleName);
                }
                expect(module.$location.path()).toBe("/");
                expect(pluginHandler.animation).toBe("none");
            });

            it("should go home and set the animation to 'fade'", function() {
                fn().close(moduleName);
                expect(module.$location.path()).toBe("/");
                expect(pluginHandler.animation).toBe("fade");
            });
        }

        // Test with Plugin Handler
        runTests(function(){ return pluginHandler; });

        // Test with $rootScope methods
        runTests(function(){ return module.$rootScope; });

    })
})
