'use strict';

/* Controllers */

var webSemantiqueControllers = angular.module('webSemantiqueControllers', [
    'webSemantiqueRechercheServices',
    'webSemantiqueRdfGraphServices',
    'webSemantiqueSimilarityServices',
    'webSemantiqueGroupingServices',
    'ngResource'
]);

webSemantiqueControllers.controller('SearchController', ['$scope', 'Recherche', 'RdfGraph', 'Similarity', 'Grouping',
    function ($scope, Recherche, RdfGraph, Similarity, Grouping) {
        //---------------------------------------------------Variables de la vue
        $scope.urls = [];
        $scope.nbPages = 10;
        $scope.matrix = null;
        
        //----------------------------------------------------Méthodes de la vue
        $scope.LancerRecherche = function () {

            $scope.pages = [];
            $scope.infos = "Searching...";
            var nbPagesProcessed = 0;
            Recherche.requete($scope.recherche, function(page) {
                $scope.pages.push(page);
                RdfGraph.generateGraph(page, function(){
                    nbPagesProcessed++;
                    if(nbPagesProcessed == $scope.nbPages){
                        $scope.infos = "Loading similarity matrix.";
                        $scope.matrix = Similarity.buildMatrix($scope.pages);
                        $scope.infos = "Seuillage.";
                        var matriceSeuillee = Grouping.seuillage($scope.matrix, 0.02);
                        $scope.infos = "Regroupement.";
                        Grouping.algo(matriceSeuillee);
                        $scope.infos = "Done.";
                    } else {
                        $scope.infos = "Loading page " + nbPagesProcessed + " / " + $scope.nbPages + ".";
                    }
                });
            });
        };
    }]);