getCacheExpirations = function() {

  $.ajax({
    url: CONTEXT_PATH + "CacheExpirationService",
    success: function(response){
      window.pentahoCacheExpirationServiceResults = response;
    },
    dataType: 'text'
  });
}

$(document).ready(getCacheExpirations());
