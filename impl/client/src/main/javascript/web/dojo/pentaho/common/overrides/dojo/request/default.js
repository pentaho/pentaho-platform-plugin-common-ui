/* Overridden to gracefully support r.js compilation
   see comments starting with // Pentaho
    - lines: 33-36
*/

define([
	'exports',
	'require',
	'../has'
], function(exports, require, has){
	var defId = has('config-requestProvider'),
		platformId;

	if(has('host-browser') || has('host-webworker')){
		platformId = './xhr';
	}else if(has('host-node')){
		platformId = './node';
		/* TODO:
    }else if(has('host-rhino')){
      platformId = './rhino';
     */
	}

	if(!defId){
		defId = platformId;
	}

	exports.getPlatformDefaultId = function(){
		return platformId;
	};

	exports.load = function(id, parentRequire, loaded, config){
    // Pentaho - When compiling in r.js, just signal not to include the resource in the bundle.
    if(config && config.isBuild) {
      return loaded();
    }

		require([id == 'platform' ? platformId : defId], function(provider){
			loaded(provider);
		});
	};
});
