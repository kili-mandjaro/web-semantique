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
            $scope.urls = [];
            
            Recherche.get({requete: $scope.recherche}, function (jsonData) {
                
                
                $scope.urls = [];
                for (var i = 0;i < jsonData.items.length;i++)
                {
                    $scope.urls.push(jsonData.items[i].link);
                    //Attention, lors des acces aux site externes, les requetes 
                    //peuvent être bloquées pour des raisons de sécurité (Cross-Domain).
                    var webResource = $resource(jsonData.items[i].link, {}, {});
                    webResource.get(function(htmlContent) {
                        console.log(htmlContent);
                    });
                }
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