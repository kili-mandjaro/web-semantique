'use strict';

/* Controllers */

var webSemantiqueControllers = angular.module('webSemantiqueControllers', [
    'webSemantiqueRechercheServices',
    'ngResource'
]);

webSemantiqueControllers.controller('SearchController', ['$scope', 'Recherche',
    function ($scope, Recherche) {        
        //---------------------------------------------------Variables de la vue
        $scope.urls = [];
        
        //----------------------------------------------------Méthodes de la vue
        $scope.LancerRecherche = function () {
            $scope.pages = [];
            Recherche.requete($scope.recherche, function(page) {
                $scope.pages.push(page);
            });
        };
    }]);