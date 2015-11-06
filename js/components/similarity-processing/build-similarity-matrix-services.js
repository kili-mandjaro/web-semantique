/**
 * Created by Kilian on 27/10/2015.
 */

'use strict';

var webSemantiqueSimilarityServices = angular.module('webSemantiqueSimilarityServices', [
    'ngResource'
]);

webSemantiqueSimilarityServices.factory('Similarity', [
    function() {
        //------------------------------------------------------Attributs prives

        //-------------------------------------------------------------Fonctions
        /**
         * Mesure de similarite selon la methode de Jaccard
         * @param {Page} Une page à comparer avec page2.
         * @param {Page} Une page à comparer avec page1.
         * @returns {int} Similarite entre les deux pages
         */
        function computeSimilarity(page1, page2, searchStringKeywords){

            var nbIntersect = 0;
            var commonKeyWords = [];
            var nbAddedScorePoints = 0;

            for(var id1 in page1.allKeywords){
                // Si on trouve un mot de la premiere page dans la seconde
                var id2 = page2.allKeywords.indexOf(page1.allKeywords[id1]);
                if(id2 >= 0) {

                    if(searchStringKeywords.length > 0){
                        if(searchStringKeywords.indexOf(page1.allKeywords[id1]) > 0){
                            nbAddedScorePoints += page1.occurences[page1.allKeywords[id1]];
                            nbIntersect+= page1.occurences[page1.allKeywords[id1]];
                        }
                    }

                    nbIntersect++;

                    commonKeyWords.push({
                        val : page1.allKeywords[id1],
                        score : page1.occurences[page1.allKeywords[id1]] + page2.occurences[page1.allKeywords[id1]]
                    });
                }
            }

            //var jaccardSimilarity = nbIntersect / (page1.allKeywords.length + page2.allKeywords.length - nbIntersect);
            var jaccardSimilarity = nbIntersect / (page1.allKeywords.length + page2.allKeywords.length - nbIntersect + nbAddedScorePoints);
            jaccardSimilarity = Math.round(jaccardSimilarity * 1000) / 1000;

            return {
                jaccardVal : jaccardSimilarity,
                keywords : commonKeyWords
            };
        }

        //----------------------------------------------------Methodes publiques
        return {
            /**
             * Constuit la matrice de similarite.
             * @param {[Pages]} htmlContent Un tableau de pages.
             * @returns {[[int]]} Une matrice de dimensions |pages|x|pages| contenant les distances des pages deux à deux
             */
            buildMatrix: function(pages, searchStringKeywords){

                // Construction d'un matrice carre nbPages x nbPages
                var similarityMatrix = new Array(pages.length);
                var commonKeywordsMatrix = new Array(pages.length);

                for(var i = 0; i < pages.length; i++){
                    similarityMatrix[i] = new Array(pages.length);
                    commonKeywordsMatrix[i] = new Array(pages.length);
                }

                // On remplit la matrice avec les valeurs de Jaccard
                for(var i = 0; i < pages.length; i++){
                    for(var j = i; j < pages.length; j++){
                        var res = computeSimilarity(pages[i], pages[j], searchStringKeywords);
                        similarityMatrix[i][j] = res.jaccardVal;
                        similarityMatrix[j][i] = res.jaccardVal;
                        commonKeywordsMatrix[i][j] = res.keywords;
                        commonKeywordsMatrix[j][i] = res.keywords;
                    }
                }

                return {
                    similarityMatrix : similarityMatrix,
                    commonKeywordsMatrix : commonKeywordsMatrix
                };
            }
        };
    }
]);
