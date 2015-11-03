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
        function computeJaccardSimilarity(page1, page2){

            var nbIntersect = 0;

            for(var id in page1.allKeywords){
                // Si on trouve un mot de la premiere page dans la seconde
                if(page2.allKeywords.indexOf(page1.allKeywords[id]) >= 0)
                    nbIntersect++;
            }

            var jaccardSimilarity = nbIntersect / (page1.allKeywords.length + page2.allKeywords.length - nbIntersect);
            jaccardSimilarity = Math.round(jaccardSimilarity * 1000) / 1000;

            return jaccardSimilarity;
        }

        //----------------------------------------------------Methodes publiques
        return {
            /**
             * Constuit la matrice de similarite.
             * @param {[Pages]} htmlContent Un tableau de pages.
             * @returns {[[int]]} Une matrice de dimensions |pages|x|pages| contenant les distances des pages deux à deux
             */
            buildMatrix: function(pages){

                // Construction d'un matrice carre nbPages x nbPages
                var matrix = new Array(pages.length);
                for(var i = 0; i < matrix.length; i++){
                    matrix[i] = new Array(pages.length);
                    matrix[i][i] = 1;
                }

                // On remplit la matrice avec les valeurs de Jaccard
                for(var i = 0; i < matrix.length-1; i++){
                    for(var j = i+1; j < matrix.length; j++){
                        var jaccardValue = computeJaccardSimilarity(pages[i], pages[j]);
                        matrix[i][j] = jaccardValue;
                        matrix[j][i] = jaccardValue;
                    }
                }

                return matrix;
            }
        };
    }
]);
