'use strict';

/* Url Services */

var webSemantiqueUrlServices = angular.module('webSemantiqueUrlServices', [
    'ngResource'
]);

webSemantiqueUrlServices.factory('Recherche', ['$resource',
    function($resource){
        //Pour eviter de faire trop de requetes sur l'API Google, on fixe le resultat.
        //return $resource('https://www.googleapis.com/customsearch/v1?q=:requete&cx=010385690139782890959%3Aezl0o7x_7ro&key=AIzaSyBgk1ACvargtPMwitXu85jlFj0maYox1jI', {}, {});
        
        //------------------------------------------------------Attributs prives
        var pages = [];
        
        //-------------------------------------------------------------Fonctions
        
        /**
         * Genere un handler pour recuperer le html d'une page.
         * @param {JSON} item L'element retourne par l'API Google.
         * @param {function(page)} callback Un callback appele a chaque nouveau resultat trouve.
         */
        function createHtmlHandler(item, callback) {
            /**
             * Recupere le html d'une page
             * @param {String} htmlContent
             */
            return function(htmlContent) {
                var page = {
                    url: item.link,
                    htmlContent: htmlContent
                };
                pages.push(page);
                //On appelle le callback.
                callback(page);
            };
        }
        
        /**
         * Genere un handler pour recuperer les resultats de l'API Google.
         * @param {function(page)} callback Un callback appele a chaque nouveau resultat trouve.
         */
        function createGoogleApiHandler(callback)
        {
            /**
             * Recupere le resultat de la requete Google.
             * @param {JSON} jsonQueryData
             */
            return function(jsonQueryData)
            {
                for (var i = 0;i < jsonQueryData.items.length;i++)
                {
                    //Attention, lors des acces aux site externes, les requetes 
                    //peuvent être bloquées pour des raisons de sécurité (Cross-Domain).
                    var webResource = $resource(jsonQueryData.items[i].link, {}, {});
                    webResource.get(createHtmlHandler(jsonQueryData.items[i], callback));
                }
            };
        }
        
        //----------------------------------------------------Methodes publiques
        return {
            /**
             * Traite une requete.
             * 
             * @param {String} requete La requete a traiter pour l'utilisateur.
             * @param {function(page)} callback Un callback appele a chaque nouveau resultat trouve.
             */
            requete: function(requete, callback) {
                var ressource = $resource('data/query_dogue.json', {}, {});
                ressource.get({requete: requete}, createGoogleApiHandler(callback));
            }
        };
    }
]);