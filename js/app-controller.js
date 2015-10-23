'use strict';

/* Controllers */

var webSemantiqueControllers = angular.module('webSemantiqueControllers', [
    'webSemantiqueUrlServices',
    'webSemantiqueKeywordsUriFinderServices',
    'ngResource'
]);

webSemantiqueControllers.controller('SearchController', ['$scope', 'Recherche', '$resource',
    function ($scope, Recherche, $resource) {        
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

webSemantiqueControllers.controller('AnalyseController', ['$scope', 'Analyse',
    function ($scope, Analyse) {

        $scope.keywords = [];
        $scope.confidence = "0.2";
        $scope.text = "Harry Potter is an English series of seven fantasy novels written by British author J. K. Rowling.";

        $scope.LancerAnalyse = function () {
            Analyse.getKeywordsURI($scope.text, $scope.confidence, function(keywords){
                $scope.keywords = keywords;
            })
        };
    }]);