'use strict';

/* Controllers */

 /* http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString=galaxy */


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

        $scope.getUriEntityName = function(uri){
            var apresSlash = uri.split('/');
            apresSlash = apresSlash[apresSlash.length-1];
            var apresDiese = apresSlash.split('#');
            apresDiese = apresDiese[apresDiese.length-1];

            return apresDiese;
        };
        
        $scope.modeAvance = false;
        $scope.constantes = {
            seuilJaccard: 0.02,
            nombrePagesMax: 10
        };
        $scope.groups = [];
        $scope.nbPages = 0;
        $scope.pages = [];
        $scope.matrix = null;
        
        //----------------------------------------------------Méthodes de la vue
        
        function CalculerRegroupements() {
            $scope.progressBar.label = "Loading similarity matrix.";
            var similarity = Similarity.buildMatrix($scope.pages, $scope.searchStringKeywords);
            $scope.matrix = similarity.similarityMatrix;
            $scope.progressBar.label = "Seuillage.";
            var matriceSeuillee = Grouping.seuillage($scope.matrix, $scope.constantes.seuilJaccard);
            $scope.progressBar.label = "Regroupement.";
            var groupes = Grouping.algo(matriceSeuillee);
            var groupsKeywords = GroupKeywords.getGroupsKeywords($scope.pages, groupes, similarity.commonKeywordsMatrix);

            for(var i = 0;i < groupes.length;i++) {
                //On affiche chaque page du groupe.
                var pages = [];
                for (var j = 0;j < groupes[i].length;j++) {
                    pages.push($scope.pages[groupes[i][j]]);
                }
                var group = {
                    keywords : groupsKeywords[i],
                    pages : pages
                };
                $scope.groups.push(group);
            }

            $scope.progressBar.setValue(-1);
        }
        
        $scope.LancerRecherche = function () {
            $scope.nbPages = $scope.constantes.nombrePagesMax;
            $scope.progressBar.label = "Chargement des résultats...";
            $scope.progressBar.max = $scope.nbPages;
            $scope.progressBar.value = 0;
            $scope.groups = [];
            $scope.pages = [];
            $scope.searchStringKeywords = [];
            $scope.matrix = null;
            var nbPagesProcessed = 0;

            Recherche.searchStringRequete($scope.recherche, function(searchStringKeywords){

                $scope.searchStringKeywords = searchStringKeywords;
                console.log(searchStringKeywords);

                Recherche.requete($scope.recherche, $scope.nbPages, function(page) {

                    //Si la page retournee est vide, quelque chose s'est mal passé lors de la requete.
                    if (page !== null)
                    {
                        page.snippet = unescape(encodeURIComponent(page.snippet));
                        page.snippet = page.snippet.replace('ï¿½', ' ');

                        //La page est non vide, on la prend en compte.
                        $scope.pages.push(page);
                        RdfGraph.generateGraph(page, $scope.searchStringKeywords, function(){
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
            });
        };
    }]);