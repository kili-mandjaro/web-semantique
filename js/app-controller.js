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
        $scope.progressBar = {
            min: 0,
            max: 10,
            value: -1,
            percent: 0,
            label: "ProgressBar",
            setValue: function(v) {
                this.value = v;
                //On recalcule le pourcentage.
                this.percent = Math.ceil(100*(this.value - this.min)/(this.max - this.min));
            }
        };
        $scope.urls = [];
        $scope.groups = [];
        $scope.nbPages = 0;
        $scope.pages = [];
        $scope.matrix = null;
        
        //----------------------------------------------------Méthodes de la vue
        
        function CalculerRegroupements() {
            $scope.progressBar.label = "Loading similarity matrix.";
            $scope.matrix = Similarity.buildMatrix($scope.pages);
            $scope.progressBar.label = "Seuillage.";
            var matriceSeuillee = Grouping.seuillage($scope.matrix, 0.02);
            $scope.progressBar.label = "Regroupement.";
            var groupes = Grouping.algo(matriceSeuillee);
            for(var i = 0;i < groupes.length;i++) {
                //On affiche chaque page du groupe.
                var group = [];
                for (var j = 0;j < groupes[i].length;j++) {
                    group.push($scope.pages[groupes[i][j]]);
                }
                $scope.groups.push(group);
            }
            $scope.progressBar.setValue(-1);
        }
        
        $scope.LancerRecherche = function () {
            $scope.nbPages = 10;
            $scope.progressBar.label = "Chargement des résultats...";
            $scope.progressBar.max = $scope.nbPages;
            $scope.progressBar.value = 0;
            $scope.groups = [];
            $scope.urls = [];
            $scope.pages = [];
            $scope.matrix = null;
            var nbPagesProcessed = 0;
            Recherche.requete($scope.recherche, function(page) {
                //Si la page retournee est vide, quelque chose s'est mal passé lors de la requete.
                if (page !== null)
                {
                    //La page est non vide, on la prend en compte.
                    $scope.pages.push(page);
                    RdfGraph.generateGraph(page, function(){
                        nbPagesProcessed++;
                        $scope.progressBar.setValue(nbPagesProcessed);
                        if(nbPagesProcessed === $scope.nbPages) {
                            CalculerRegroupements();
                        }
                    });
                }
                else
                {
                    //Quelque chose s'est mal passé, on ne prend pas en compte cette page.
                    $scope.nbPages--;
                    $scope.progressBar.max = $scope.nbPages;
                    $scope.progressBar.setValue(nbPagesProcessed);
                    if(nbPagesProcessed === $scope.nbPages) {
                        CalculerRegroupements();
                    }
                }
            });
        };
    }]);