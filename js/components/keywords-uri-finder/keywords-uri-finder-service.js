'use strict';

/* Url Services */

var webSemantiqueKeywordsUriFinderServices = angular.module('webSemantiqueKeywordsUriFinderServices', [
    'ngResource'
]);

webSemantiqueKeywordsUriFinderServices.factory('Analyse', ['$resource',
  function($resource){

      var analyse = {};

      analyse.getKeywordsURI = function(text, confidence, callback) {
          var res = $resource('http://spotlight.dbpedia.org/rest/annotate?text=:text&confidence=:confidence&support=20', {}, {});
          res.get({text: text, confidence: confidence}, function (jsonData) {
              callback(jsonData.Resources);
          });
      };

      return analyse;
}]);
