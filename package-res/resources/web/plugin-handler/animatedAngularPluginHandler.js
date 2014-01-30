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
 * 2) "module" must be called before the document is bootstrapped
 * 3) Include "angular-animations.css" in your document, located in 'common-ui/resources/themes/css/angular-animations.css'
 *
 * TO FORCE STATIC ANIMATIONS (use the same animation all the time)
 * 1) Add "animate" attribute to animatable angular container and set it equal to one of the preset animation styles
 * 2) Add "deny-animation-change" class to the animatable angular container
 * 		EXAMPLE: <div ng-view class='ng-app-element deny-animation-change' animate='slide-left'></div>
 */

var deps = [
	'common-ui/AngularPluginHandler',
	'common-ui/ring',
	'common-ui/angular-animate'
];
define(deps, function(AngularPluginHandler, ring) {

	var AnimatedAngularPluginHandler = ring.create([AngularPluginHandler], {

		init : function() {
			this.$super();

			this.animation = "slide-left";
		},
		
		// Sets the animation to be performed on animation transitions
		_setAnimation : function(anim) {			
			this.animation = anim;
		},

		// Provide of means of switching views without animation
		goto : function(url, moduleName, allowAnimation) {
			if (!allowAnimation) {
				this._setAnimation("none");	
			}
			
			this.$super(url, moduleName);
		},

		// Provide and override to goHome in AngularPluginHandler where there is no animation
		goHome : function(moduleName, allowAnimation) {
			if (!allowAnimation){
				this._setAnimation("none");	
			} 
			this.$super(moduleName);
		},

		// Sets the animation as slide left and goes to the url
		goNext : function(url, moduleName) {
			this._setAnimation("slide-left");
			this.goto(url, moduleName, true);
		},

		// Sets the animation as slide right and goes to the url
		goPrevious : function(url, moduleName) {
			this._setAnimation("slide-right");
			this.goto(url, moduleName, true);
		},

		// Sets the animatione to fade and goes back to the root application
		close : function(moduleName) {
			this._setAnimation("fade");
			this.goHome(moduleName, true);
		},

		// Sets the animation to fade and goes to a url, providing an "open" feel
		open : function(url, moduleName) {
			this._setAnimation("fade");
			this.goto(url, moduleName, true);
		},

		// Provide and override function for creating the module
		module : function(moduleName, deps, config) {
			
			// Include 'ngAnimate' as part of the configuration
			deps.push('ngAnimate');

			// Create the module
			return this.$super.call(this, moduleName, deps, config);
		},

		// Provides additional functionality
		_makePluggable : function(module) {
			this.$super(module);

			var self = this;

			// Set animation actions	
			module.animation(".ng-app-element", function() {
				return {
				    enter: function(element, done) {

				    	// On enter, find elements
				    	$(".ng-app-element:not(.deny-animation-change)").attr("animate", self.animation);
				    	
						return function(cancelled) {

							// Once completed, set the container styles
							$(".ng-app-element:not(.deny-animation-change)").attr("animate", self.animation);
						}
					}
			    }	
			})

			// Set default actions for root scope and animations			
			module.run(['$rootScope', function($rootScope) {
				// Provides the navigation controls to any template
				$rootScope.goNext = function(url) {
					self.goNext(url, module.name);
				}				
				$rootScope.goPrevious = function(url){
					self.goPrevious(url, module.name);
				}
				$rootScope.close = function() {
					self.close(module.name);
				}
				$rootScope.open = function(url) {
					self.open(url, module.name);
				}
				$rootScope.goto = function(url) {
					self.goto(url, module.name);
				}
				$rootScope.goHome = function() {
					self.goHome(module.name)
				}
			}]);
		}
	})

	return AnimatedAngularPluginHandler;
});