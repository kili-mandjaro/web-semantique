'use strict';

/* Url Services */

var webSemantiqueRechercheServices = angular.module('webSemantiqueRechercheServices', [
    'ngResource'
]);

webSemantiqueRechercheServices.factory('Recherche', ['$resource', '$http',
    function($resource, $http) {
        //------------------------------------------------------Attributs prives
        var pages = [];
        var confiance = 0.2;
        
        //-------------------------------------------------------------Fonctions
        
        /**
         * Extrait le texte d'un document HTML.
         * @param {String} htmlContent Un document au format html.
         * @returns {String}
         */
        function ExtractionTexte(htmlContent) {
                var monText = $(htmlContent).find("p,a,h1,h2,h3,h4,h5,h6")
                                .clone()    //clone the element
                                .children() //select all the children
                                .remove()   //remove all the children
                                .end();  //again go back to selected element

                var texteBrut = "";
                monText.each(function(){
                    texteBrut += $(this).text() + " ";
                });
                return texteBrut;
        }
        
        /**
         * Genere un handler pour recuperer les mots clés d'un texte.
         * @param {JSON} item L'element retourne par l'API Google.
         * @param {function(page)} callback Un callback appele a chaque nouveau resultat trouve.
         */
        function createSpolightHandler(item, callback) {
            /**
             * Recupere les mots cles d'une page.
             * @param {type} jsonResponse La reponse json de l'api spotlight.
             */
            return function(jsonResponse) {
                var page = {
                    url: item.link,
                    uriKeywords: jsonResponse.Resources
                };
                pages.push(page);
                //On appelle le callback.
                callback(page);
            };
        }
        
        /**
         * Genere un handler pour recuperer le html d'une page.
         * @param {JSON} item L'element retourne par l'API Google.
         * @param {function(page)} callback Un callback appele a chaque nouveau resultat trouve.
         */
        function createHtmlHandler(item, callback) {
            /**
             * Recupere le html d'une page
             * @param {Object} responseObject L'objet reponse de la requete http.
             *                                Voir documentation $http AngularJS
             */
            return function(responseObject) {
                var textContent = ExtractionTexte(responseObject.data);
                
                //On limite la taille de la chaine a envoyer à spotlight 
                if (textContent.length > 200)
                {
                    textContent = textContent.substring(0, 200);
                }
                
                var res = $resource('http://spotlight.dbpedia.org/rest/annotate?text=:text&confidence=:confidence&support=20', {}, {});
                res.get({text: textContent, confidence: confiance}, createSpolightHandler(item, callback));
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
                    $http({
                        method: 'GET',
                        url: jsonQueryData.items[i].link,
                        responseType: 'document'
                    }).then(createHtmlHandler(jsonQueryData.items[i], callback),
                    function errorCallback(response) {
                        // Callback appele lors d'un probleme.
                    });
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
                //Pour eviter de faire trop de requetes sur l'API Google, on fixe le resultat.
                //var ressource = $resource('https://www.googleapis.com/customsearch/v1?q=:requete&cx=010385690139782890959%3Aezl0o7x_7ro&key=AIzaSyBgk1ACvargtPMwitXu85jlFj0maYox1jI', {}, {});
                var ressource = $resource('data/query_dogue.json', {}, {});
                ressource.get({requete: requete}, createGoogleApiHandler(callback));
            },
            /**
             * Retourne le tableau contenant toutes les pages 
             * @returns {Array}
             */
            getPages: function() {
                return pages;
            }
        };
    }
]);