/*
 * This is an API layer providing standard animations for sliding left/right and fade out when exiting views. These transitions
 * are accessible by calling the goNext, goPrevious, and close functions provided. These functions can be called in 2 ways.
 * 1) You can call these methods directly from the included AnimatedAngularPluginHandler, when it is required. You will need to 
 * 		provide the module name for which you are changing the location, as the urls are namespaced
 * 2) You can call them from within partials. The module name is not required to call these functions, since they are bound to
 * 		the root scope with prior knowledge of which module should be accessing the location
 *
 * REQUIREMENTS
 * 1) Add "ng-app-element" class to animatable angular container
 * 		EXAMPLE: <div ng-view class='ng-app-element'></div>
 * 2) "makePluggable" must be called before the document is bootstrapped
 * 3) Include "angular-animations.css" in your document, located in 'common-ui/resources/themes/css/angular-animations.css'
 *
 * TO FORCE STATIC ANIMATIONS (use the same animation all the time)
 * 1) Add "animate" attribute to animatable angular container and set it equal to one of the preset animation styles
 * 2) Add "deny-animation-change" class to the animatable angular container
 * 		EXAMPLE: <div ng-view class='ng-app-element deny-animation-change' animate='slide-left'></div>
 */

var deps = [
	'common-ui/AngularPluginHandler',
	'common-ui/jquery',
	'common-ui/angular-animate'
];
pen.define(deps, function(AngularPluginHandler) {
	
	// Sets the animation to be performed on animation transitions
	var animation = "slide-left";
	var setAnimation = function(anim) {			
		animation = anim;
	}

	// Sets the animation as slide left and goes to the url
	var goNext = function(url, moduleName) {
		setAnimation("slide-left");
		AngularPluginHandler.goto(url, moduleName);
	}

	// Sets the animation as slide right and goes to the url
	var goPrevious = function(url, moduleName) {
		setAnimation("slide-right");
		AngularPluginHandler.goto(url, moduleName);
	}

	// Sets the animatione to fade and goes back to the root application
	var close = function(moduleName) {
		setAnimation("fade");
		AngularPluginHandler.goHome(moduleName);
	}

	var AngularPluginHandlerMakePluggable = AngularPluginHandler.makePluggable;

	// Provides additional functionality
	var makePluggable = function(module) {
		AngularPluginHandlerMakePluggable(module);

		// Set animation actions	
		module.animation(".ng-app-element", function() {
			var $body = $("body");

			if ($body.hasClass("IE8") || $body.hasClass("IE9")) {
				return {
					enter : function(element, done) {
						$(element)
							.css("left", "100%")
							.animate({ left: "0" }, done);
					},
					leave : function(element, done) {
						$(element)
							.css("left", "0")
							.animate({ left: "-100%" }, done);
					}
				}	
			} else {
				return {
				    enter: function(element, done) {
						return function(cancelled) {
							$(".ng-app-element:not(.deny-animation-change)").attr("animate", animation);
						}
					}
			    }	
			}
		});

		// Set default actions for root scope and animations
		module.run(['$rootScope', function($rootScope) {
			// Provides the navigation controls to any template
			$rootScope.goNext = function(url) {
				goNext(url, module.name);
			}				
			$rootScope.goPrevious = function(url){
				goPrevious(url, module.name);
			}
			$rootScope.close = function(){
				close(module.name);
			}
		}]);
	}

	return $.extend(AngularPluginHandler, {
		makePluggable : makePluggable,
		goNext : goNext,
		goPrevious : goPrevious,
		close : close
	});
});