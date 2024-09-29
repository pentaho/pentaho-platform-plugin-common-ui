/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


define("common-ui/jquery-pentaho-i18n", ["common-ui/jquery-i18n"], function() {
    var original_i18n = $.i18n.properties;
    var original_browserLang = $.i18n.browserLang;
    $.i18n.properties = function(settings) {

        if(settings.language === null || settings.language == '' || settings.language == undefined) {
            settings.language = original_browserLang();
        }
        if(settings.language === null || settings.language == undefined) {settings.language='';}

        settings.language = supportedLocale(settings);

        original_i18n(settings);
    };
    $.i18n.browserLang = function() {
        return null;
    };
    // get supported locale from _supported_languages.properties - it would be '', 'xx' or 'xx_XX'
    var supportedLocale = function(settings) {
        var resultLocale;
        $.ajax({
            url:        settings.name + "_supported_languages.properties",
            async:      false,
            cache:		settings.cache,
            contentType:'text/plain;charset='+ settings.encoding,
            dataType:   'text',
            success:    function(data, status) {
                resultLocale = parseData(data, settings.language);
            },
            error:function (xhr, ajaxOptions, thrownError){
                if(xhr.status==404) {
                    resultLocale = settings.language;
                }
            }
        });
        return resultLocale;
    };

    var parseData = function(data, language) {
        var locale, localeLower, country, countryLower, result;
        if (language.length >= 2) {
            locale = language.substring(0, 2);
            localeLower = locale.toLowerCase();
        }
        if (language.length >= 5) {
            country = language.substring(0, 5);
            countryLower = country.toLowerCase();
        }
        var parameters = data.split( /\n/ );
        for(var i=0; i<parameters.length; i++ ) {
            var lang = parameters[i].substr(0, parameters[i].indexOf("="));
            var langLower = lang.toLowerCase();

            if (langLower === localeLower && result == undefined) {
                result = lang;
            }

            if (langLower == countryLower) {
                result = lang;
            }
        }
        if (result == undefined) {
            result = "";
        }
        return result;
    }
});