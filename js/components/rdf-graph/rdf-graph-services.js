'use strict';

/* dbpedia request */

var webSemantiqueRdfGraphServices = angular.module('webSemantiqueRdfGraphServices', [
    'ngResource'
]);

webSemantiqueRdfGraphServices.factory('RdfGraph', ['$http',
    function ($http) {
        //------------------------------------------------------Attributs prives

        //-------------------------------------------------------------Fonctions

        //----------------------------------------------------Methodes publiques
        return {
            generateGraph : function (page, callback){
                var graph = [];

                var keywords = page.uriKeywords;

                // Si on veut passer par une req GET, on utilise $resource
                //var res = $resource('http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=:query&format=application%2Fsparql-results%2Bjson', {}, {});

                // Construction de la requete d'enrichissement de graph
                var query = 'construct {?k ?s ?o} where {?k ?s ?o FILTER(';
                for (var i = 0; i < keywords.length; i++) {
                    //query += '?o = <' + keywords[i]['@URI'] + '> or ';
                    query += '?k = <'+ keywords[i]['@URI'] + '> or ';
                }
                //The last or is ignored with the zero
                query += '0';
                query += ')}  LIMIT 100';

                // Construction de la request POST
                var urlPost = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&format=application%2Fsparql-results%2Bjson';
                var paramPost = $.param({
                    query: query
                });
                $http({
                    method: 'POST',
                    url: urlPost,
                    data: paramPost,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).then(function (jsonData) {
                        // On se retrovue avec des reations impliquant d'autres keywords
                        // On recupere dans une variable l'objet et le sujet de chaque relation
                        var allKeywords = [];
                        var bindings = jsonData.data.results.bindings;

                        for (var id in bindings) {
                            if(bindings[id].o.value.indexOf('wikidata') == -1) {
                                allKeywords.push({
                                    val: bindings[id].s.value,
                                    score: page.occurrences[bindings[id].s.value]
                                });
                                allKeywords.push({
                                    val: bindings[id].o.value,
                                    score: page.occurrences[bindings[id].s.value]
                                });
                            }
                        }

                        // Puis on enleve les doublons
                        var occur = {};
                        var allKeywords = allKeywords.filter(function (elem) {
                            if(occur[elem.val]){
                                occur[elem.val] += elem.score;
                                return 0;
                            } else {
                                occur[elem.val] = elem.score;
                                return 1;
                            }
                        });

                        // Enfin on enleve le score dans allKeyword
                        for(var i = 0; i < allKeywords.length; i++){
                            allKeywords[i] = allKeywords[i].val;
                        }

                        page['allKeywords'] = allKeywords;
                        page['occurences'] = occur;

                        callback();
                    },
                    function errorCallback(response) {
                        // Callback appele lors d'un probleme.
                    });
            }
        };
    }
]);