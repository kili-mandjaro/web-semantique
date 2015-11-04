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
            generateGraph : function (page, searchStringKeywords, callback){
                var graph = [];

                var keywords = [];
                for (var i = 0; i < page.uriKeywords.length; i++) {
                    keywords.push(page.uriKeywords[i]['@URI']);
                }

                // Si on veut passer par une req GET, on utilise $resource
                //var res = $resource('http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=:query&format=application%2Fsparql-results%2Bjson', {}, {});

                // Construction de la requete d'enrichissement de graph
                var query = 'construct {?s ?p ?o} where {?s ?p ?o FILTER(';
                for (var i = 0; i < keywords.length; i++) {
                    query += '?o = <' + keywords[i] + '> or ';
                    //query += '?s = <'+ keywords[i]['@URI'] + '> or ';
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

                        if(bindings != null) {
                            if(bindings.length > 0) {

                                for (var i = 0; i < bindings.length; i++) {
                                    var object = String(bindings[i].o.value);
                                    var subject = String(bindings[i].s.value);
                                    /*if (object.indexOf('dbpedia.org') > 0) {
                                        allKeywords.push({
                                            val: subject,
                                            score: page.occurrences[subject]
                                        });
                                        allKeywords.push({
                                            val: object,
                                            score: page.occurrences[subject]
                                        });
                                    }*/

                                    allKeywords.push({
                                        val: object,
                                        score: page.occurrences[object]
                                    });
                                    if (subject.indexOf('dbpedia.org') > 0) {
                                        allKeywords.push({
                                            val: subject,
                                            score: page.occurrences[object]/2
                                        });
                                    }
                                }

                                /*for(var i = 0; i < keywords.length; i++){
                                    allKeywords.push({
                                        val: keywords[i],
                                        score: page.occurrences[keywords[i]]
                                    });
                                }*/

                                // Puis on enleve les doublons
                                var occur = {};
                                var allKeywords = allKeywords.filter(function (elem) {
                                    var coefficient = 1;
                                    // Si on trouve l'URI dans les mots cles apportes par la chaine de carac de la requete
                                    if(searchStringKeywords.indexOf(elem.val) > 0){
                                        coefficient = 5;
                                    }

                                    if (occur[elem.val]) {
                                        occur[elem.val] += (elem.score * coefficient);
                                        return 0;
                                    } else {
                                        occur[elem.val] = (elem.score * coefficient);
                                        return 1;
                                    }
                                });

                                // Enfin on enleve le score dans allKeyword
                                for (var i = 0; i < allKeywords.length; i++) {
                                    allKeywords[i] = allKeywords[i].val;
                                }
                            }
                        }

                        page['allKeywords'] = allKeywords;
                        page['occurences'] = occur;

                        callback();
                    },
                    function (response) {
                        // Callback appele lors d'un probleme.
                    });
            }
        };
    }
]);