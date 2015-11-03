'use strict';

/* Controllers */

var webSemantiqueControllers = angular.module('webSemantiqueControllers', [
    'webSemantiqueRechercheServices',
    'webSemantiqueRdfGraphServices',
    'webSemantiqueSimilarityServices',
    'webSemantiqueGroupingServices',
    'webSemantiqueGroupKeywordsServices',
    'ngResource'
]);

webSemantiqueControllers.controller('SearchController', ['$scope', 'Recherche', 'RdfGraph', 'Similarity', 'Grouping', 'GroupKeywords',
    function ($scope, Recherche, RdfGraph, Similarity, Grouping, GroupKeywords) {
        //---------------------------------------------------Variables de la vue
        $scope.urls = [];
        $scope.nbPages = 5;
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
                        var similarity = Similarity.buildMatrix($scope.pages);
                        $scope.matrix = similarity.similarityMatrix;
                        $scope.infos = "Seuillage.";
                        var matriceSeuillee = Grouping.seuillage($scope.matrix, 0.1);
                        $scope.infos = "Regroupement.";
                        var groups = Grouping.algo(matriceSeuillee);
                        var groupsKeywords = GroupKeywords.getGroupsKeywords($scope.pages, groups, similarity.commonKeywordsMatrix);
                        console.log(groups);
                        console.log(groupsKeywords);
                        $scope.infos = "Done.";
                    } else {
                        $scope.infos = "Loading page " + nbPagesProcessed + " / " + $scope.nbPages + ".";
                    }
                });
            });
        };
    }]);