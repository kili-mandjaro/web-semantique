'use strict';

/* dbpedia request */

var webSemantiqueRdfGraphServices = angular.module('webSemantiqueRdfGraphServices', [
    'ngResource'
]);

webSemantiqueRdfGraphServices.factory('RdfGraph', ['$resource',
  function($resource){

      var rdfGraph = {};

      rdfGraph.generateGraph = function(keywords, callback) {
		var graph = [];
		
			
			var res = $resource('http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=:query&format=application%2Fsparql-results%2Bjson', {}, {});
			var query = 'construct {?k ?s ?o} where {?k ?s ?o FILTER(';
			for (var i = 0;i < keywords.length;i++) {
				query += '?o = <'+ keywords[i] + '> or ';
				query += '?k = <'+ keywords[i] + '> or ';
			}
			//The last or is ignored with the zero
			query += '0';
			query += ')}  LIMIT 100';
			res.get({query: query}, function (jsonData) {
				callback(jsonData);
			});
		}
	return rdfGraph;
  }]);
