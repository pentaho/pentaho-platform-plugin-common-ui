var deps = [
    'common-ui/AnimatedAngularPluginHandler',
    'common-ui/AnimatedAngularPlugin',
    'common-ui/angular'
];

pen.define(deps, function(AnimatedAngularPluginHandler, AnimatedAngularPlugin, angular) {

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

        it("should goto a url and set the animation to 'none'", function() {
            pluginHandler.goto(path, moduleName);
            expect(module.$location.path()).toMatch(moduleName + path);
            expect(pluginHandler.animation).toBe("none");
        })

        it("should goto a url and set the animation to 'slide-left'", function() {
            pluginHandler.goNext(path, moduleName);
            expect(module.$location.path()).toMatch(moduleName + path);
            expect(pluginHandler.animation).toBe("slide-left");
        })

        it("should goto a url and set the animation to 'slide-right'", function() {
            pluginHandler.goPrevious(path, moduleName);
            expect(module.$location.path()).toMatch(moduleName + path);
            expect(pluginHandler.animation).toBe("slide-right");
        })

        it("should goto a url and set the animation to 'fade'", function() {
            pluginHandler.open(path, moduleName);
            expect(module.$location.path()).toMatch(moduleName + path);
            expect(pluginHandler.animation).toBe("fade");
        })

        it("should go home and set the animation to 'none'", function() {
            pluginHandler.goHome(moduleName);
            expect(module.$location.path()).toBe("/");
            expect(pluginHandler.animation).toBe("none");
        });

        it("should go home and set the animation to 'fade'", function() {
            pluginHandler.close(moduleName);
            expect(module.$location.path()).toBe("/");
            expect(pluginHandler.animation).toBe("fade");
        });        
    })
})