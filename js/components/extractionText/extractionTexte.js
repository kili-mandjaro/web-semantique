'use strict';

/* Url Services */

var webSemantiqueExtractionTexteServices = angular.module('webSemantiqueExtractiontTexteServices', [
    'ngResource'
]);


webSemantiqueExtractionTexteServices.service('ExtractionTexte', 
function(){

return function(myDocument){

	var monText = $(myDocument).find("p,a,h1,h2,h3,h4,h5,h6")
			.clone()    //clone the element
			.children() //select all the children
			.remove()   //remove all the children
			.end();  //again go back to selected element

		var texteBrut = "";
			
	monText.each(function(){
	  texteBrut += $(this).text() + " ";
	});
	
	return texteBrut;
}});