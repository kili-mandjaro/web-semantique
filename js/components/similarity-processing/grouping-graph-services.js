/**
 * Created by Kilian on 27/10/2015.
 */

'use strict';

var webSemantiqueSimilarityServices = angular.module('webSemantiqueGroupingServices', [
    'ngResource'
]);

webSemantiqueSimilarityServices.factory('Grouping', [
    function() {
        //------------------------------------------------------Attributs prives

        //-------------------------------------------------------------Fonctions

        function scoreFusionBag(bag1,bag2){
            var countSimilaire = 0;
            for(var i=0;i<bag1.length;i++){ //opti à faire eventuellement
                for(var j=0;j<bag2.length;j++){
                    if(bag1[i] == bag2[j]){
                        countSimilaire++;
                    }
                }
            }
            return countSimilaire/(Math.min(bag1.length,bag2.length));
        }

        //----------------------------------------------------Methodes publiques
        return {

            seuillage : function(matrice, seuil){
                var matriceSeuillee = new Array(matrice.length);

                for(var i=0; i<matrice.length;i++) { //for each row
                    matriceSeuillee[i] = new Array(matrice.length);
                    for (var j = 0; j < matrice[i].length; j++) {
                        if (matrice[i][j] >= seuil)
                            matriceSeuillee[i][j] = 1;
                        else
                            matriceSeuillee[i][j] = 0;
                    }
                }
                return matriceSeuillee;
            },

            algo : function(matrice){
                var seuilCorrespondance = 0.5;
                var seuilFusion = 0.5;

                //----EPURATION------------
                /*var matrice = [[1,1,1,1,0,0,0,0],
                    [1,1,1,0,1,0,0,0],
                    [1,1,1,1,0,0,0,0],
                    [1,0,1,1,0,0,0,0],
                    [0,1,0,0,1,1,1,1],
                    [0,0,0,0,1,1,1,1],
                    [0,0,0,0,1,1,1,0],
                    [0,0,0,0,1,1,0,1]];*/

                var bags = [];
                for(var i=0; i<matrice.length;i++){ //for each row
                    var currentBag = [];
                    for(var j=0;j<matrice[i].length;j++){
                        if(i == j){
                            currentBag.push(j);
                        }
                        else if(matrice[i][j] == 1){//si on trouve un élément à 1 dans cette ligne, on va chercher dans l'autre ligne correspondante si les bags sont les mêmes
                            var countIdenticalElt = 0;
                            var countMaxElt = 0;

                            for(k=0;k<matrice[j].length;k++){
                                if(matrice[i][k] == 1){
                                    countMaxElt++;
                                    if(matrice[j][k] == 1){
                                        countIdenticalElt++;
                                    }
                                }
                            }
                            if(countIdenticalElt/countMaxElt > seuilCorrespondance){
                                currentBag.push(j);
                            }
                        }
                    }
                    bags.push(currentBag);
                }

                /**
                 for(i=0;i<matrice.length;i++)
                 {
                     console.log(bags[i]);
                 }
                 */
                //----------FUSION--------------
                var i = 0;
                for(var i=matrice.length-1;i>0;i--){//pour chaque element, on essaie de le fusionner avec tout ceux du dessus
                    var hasFused = 0;
                    var j = 0;
                    for(var j=i-1;j>=0;j--){
                        if(scoreFusionBag(bags[i],bags[j]) > seuilFusion){
                            hasFused = 1;
                            for(var k=0;k<bags[i].length;k++){//we add the elements of bags[i] to bags[j] if they are not already present in bags[j]
                                var present = 0;
                                for(var l=0;l<bags[j].length;l++){
                                    if(bags[i][k] == bags[j][l]){
                                        present = 1;
                                    }
                                }
                                if(present == 0){
                                    bags[j].push(bags[i][k]);
                                }
                            }
                        }
                    }
                    if(hasFused == 1){
                        bags.splice(i,1);
                    }
                }
                for(var i=0;i<bags.length;i++)
                {
                    console.log(bags[i]);
                }
            }
        };
    }
]);
