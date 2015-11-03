/**
 * Created by Kilian on 27/10/2015.
 */

'use strict';

var webSemantiqueGroupKeywordsServices = angular.module('webSemantiqueGroupKeywordsServices', [
    'ngResource'
]);

webSemantiqueGroupKeywordsServices.factory('GroupKeywords', [
    function() {
        //------------------------------------------------------Attributs prives

        var nbKeywordsPerGroup = 5;

        //-------------------------------------------------------------Fonctions

        function getKeywordsForGroup(group, commonKeywordMatrix){

            /*var group = [0, 1, 2, 3];
            var commonKeywordMatrix = [
                [[],[{val : 'bonjour', score : 10},{val : 'test', score : 1},{val : 'yolo', score : 3}],[{val : 'test', score : 1},{val : 'allo', score : 5},{val : 'miam', score : 1}],[{val : 'test', score : 1},{val : 'allo', score : 5},{val : 'yolo', score : 3}]],
                [[],[],[{val : 'test', score : 1},{val : 'miam', score : 1},{val : 'hey', score : 1}],[{val : 'test', score : 1},{val : 'miam', score : 1},{val : 'hoy', score : 2}]],
                [[],[],[],[{val : 'test', score : 1},{val : 'ha', score : 4},{val : 'yolo', score : 3}]],
                [[],[],[],[]]
            ];

            commonKeywordMatrix[1][0] = commonKeywordMatrix[0][1];
            commonKeywordMatrix[2][0] = commonKeywordMatrix[0][2];
            commonKeywordMatrix[3][0] = commonKeywordMatrix[0][3];
            commonKeywordMatrix[2][1] = commonKeywordMatrix[1][2];
            commonKeywordMatrix[3][1] = commonKeywordMatrix[1][3];
            commonKeywordMatrix[3][2] = commonKeywordMatrix[2][3];*/

            var keywords = {};
            var maxTotalScore = 0;
            var finalKeyWordsList = [];
            var nbComparaisons = group.length/2 * (group.length-1);

            for(var i = 0; i < group.length - 1; i++){
                for(var j = i + 1; j < group.length; j++){
                    var currCommonKeywordCell = commonKeywordMatrix[group[i]][group[j]];
                    for(var k = 0; k < currCommonKeywordCell.length; k++){
                        if(keywords[currCommonKeywordCell[k].val] == undefined){
                            keywords[currCommonKeywordCell[k].val] = {
                                presenceGenerale : 1,
                                totalScores : currCommonKeywordCell[k].score
                            };
                        } else {
                            keywords[currCommonKeywordCell[k].val].presenceGenerale++;
                            keywords[currCommonKeywordCell[k].val].totalScores += currCommonKeywordCell[k].score;
                            if(keywords[currCommonKeywordCell[k].val].totalScores > maxTotalScore)
                                maxTotalScore = keywords[currCommonKeywordCell[k].val].totalScores;
                        }
                    }
                }
            }

            for(var key in keywords){
                var scoreFinal = (keywords[key].presenceGenerale / nbComparaisons) * 0.75 + (keywords[key].totalScores / maxTotalScore) * 0.25;
                finalKeyWordsList.push([
                    key,
                    scoreFinal
                ]);
            }

            finalKeyWordsList.sort(function(a, b) {return b[1] - a[1]});
            finalKeyWordsList = finalKeyWordsList.splice(0, nbKeywordsPerGroup);

            return finalKeyWordsList;
        }

        //----------------------------------------------------Methodes publiques
        return {
            getGroupsKeywords : function(pages, groups, commonKeywordMatrix){
                var groupsKeywords = [];
                for(var i = 0; i < groups.length; i++){
                    groupsKeywords.push(getKeywordsForGroup(groups[i], commonKeywordMatrix));
                }
                return groupsKeywords;
            }
        };
    }
]);
