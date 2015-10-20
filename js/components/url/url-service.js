'use strict';

/* Url Services */

var webSemantiqueUrlServices = angular.module('webSemantiqueUrlServices', [
    'ngResource'
]);

webSemantiqueUrlServices.factory('Recherche', ['$resource',
  function($resource){
    //Pour eviter de faire trop de requetes sur l'API Google, on fixe le resultat.
    //return $resource('https://www.googleapis.com/customsearch/v1?q=:requete&cx=010385690139782890959%3Aezl0o7x_7ro&key=AIzaSyBgk1ACvargtPMwitXu85jlFj0maYox1jI', {}, {});
    return $resource('data/query_dogue.json', {}, {});
  }]);