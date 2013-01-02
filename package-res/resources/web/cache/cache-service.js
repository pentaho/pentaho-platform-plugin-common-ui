getCacheExpirations = function() {

  if(window.XMLHttpRequest) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if(request.readyState == 4 && request.status == 200) {
        window.pentahoCacheExpirationServiceResults = request.responseText;
      }
    }

    request.open("GET", CONTEXT_PATH + "CacheExpirationService", true);
    request.send();
  }

}

getCacheExpirations();