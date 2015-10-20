'use strict';

/* Controllers */

var webSemantiqueControllers = angular.module('webSemantiqueControllers', [
    'webSemantiqueUrlServices'
]);

webSemantiqueControllers.controller('SearchController', ['$scope', 'Recherche',
  function($scope, Recherche) {
      
    $scope.LancerRecherche = function() {
        Recherche.get({requete:$scope.recherche}, function(jsonData) {
            console.log(jsonData);
        });
    };
  }]);