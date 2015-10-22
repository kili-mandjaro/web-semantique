'use strict';

/* Controllers */

var webSemantiqueControllers = angular.module('webSemantiqueControllers', [
    'webSemantiqueUrlServices',
    'webSemantiqueKeywordsUriFinderServices'
]);

webSemantiqueControllers.controller('SearchController', ['$scope', 'Recherche',
    function ($scope, Recherche) {

        $scope.LancerRecherche = function () {
            Recherche.get({requete: $scope.recherche}, function (jsonData) {
                console.log(jsonData);
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