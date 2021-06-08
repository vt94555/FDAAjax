/*
Name: Tzuang, Victor
Assignment: Final Project

Description:

The goal of this project is to create a 
website that fetches data from the FDA and
NIH and displays the result to the user. 
Specifically, the website queries for FDA
food recalls, medication descriptions,
medication pill images, and molecule images.

To query the food recalls and medication
descriptions, the website queries openFDA. 
Meanwhile, the medication pill images and
molecule images were queried from the NIH's
RxImage API, ChemIDPlus API, and PubChem API. 

After the website loads, the user is prompted
to enter a search term. Depending on which radio
button is selected (food, medication, pill image, molecule image),
a different fetch query is initiated after the
user clicks the Submit button. If no search
term is entered, the program displays a message
asking the user to enter in a search term. If the
fetch returns no results, then this is also displayed.
The user also has the option to limit the number of 
search results returned.

From this project, I learned alot about using APIs and
saw how different websites have different objects that
are returned from API calls. Even within one website, such
as the FDA medication website, different types of medications
would return different objects. For example, over-the-counter
medications such as acetaminophen would return a object
with different fields, and would need to be processed differently
than an object returned from a prescription medication. Also,
it was very interesting learning how all molecules have an
InChIKey assigned to them, which allowed the user to look up a 
molecule by name, then retrieve the InChIKey from one API, then
use that InChIKey to obtain the image of the molecule.

*/

"use strict";

function displayError(error) {
    
    let html = `<p>${error}</p>`;
    $("#display").html(html);
}


// display JSON data returned from fetch
function displayData(data, category, searchTerm) {

    console.log("category is " + category);
    console.log("search term is " + searchTerm);

    // html string to create and display output
    let html = "";
    
    // if category is food, display this
    if (category == "food") {

        html += `<p class="disclaimer">DISCLAIMER FROM FDA:</p>`;
        html += `<textarea class="disclaimer-box" rows="4" cols="80" disabled>"${data.meta.disclaimer}"</textarea>`;

        for (let i = 0; i < data.results.length; i++) {
            html += `<table>`;
            html += `<tr><th>Product Description</th><td>${data.results[i].product_description}</td></tr>`;
            html += `<tr><th>Affected Area</th><td>${data.results[i].distribution_pattern}</td></tr>`;
            html += `<tr><th>Start date</th><td>${data.results[i].recall_initiation_date}</td></tr>`;
            html += `<tr><th>Stop date</th><td>${data.results[i].termination_date}</td></tr>`;
            html += `<tr><th>Recall reason</th><td>${data.results[i].reason_for_recall}</td></tr>`;
        }

        html += `</table>`
    }


    // if category is med, display this
    if (category == "med") {

        html += `<p class="disclaimer">DISCLAIMER FROM FDA:</p>`;
        html += `<textarea class="disclaimer-box" rows="4" cols="80" disabled>"${data.meta.disclaimer}"</textarea>`;

        for ( let i = 0; i < data.results.length; i++ ) {
                
            try {

                // for non-OTC medications
                // Use regular expression to show only results that have
                // searchTerm in the description of the result. Otherwise, results
                // can include non-matching medications.
                let string = data.results[i].description.join();
                let search = `/${searchTerm}/`;
                if (string.match(search) != ""){
                    console.log(string);
                    html += `<table>`;
                    html += `<tr><th>Medication Description</th><td>${data.results[i].description}</td></tr>`;
                    html += `<tr><th>Uses and Indications</th><td>${data.results[i].indications_and_usage}</td></tr>`;
                    html += `<tr><th>Warnings and Caution</th><td>${data.results[i].warnings_and_cautions}</td></tr>`;
                    html += `</table>`;
                }
            }

            catch (error) {
                console.log(error);

                // if medication is over the counter, display OTC data
                if (data.results[i].openfda.brand_name.length == "1") {
                    html += `<table>`;
                    html += `<tr><th>Medication Active Ingredient</th><td>${data.results[i].active_ingredient}</td></tr>`;
                    html += `<tr><th>Brand Name</th><td>${data.results[i].openfda.brand_name}</td></tr>`;
                    html += `<tr><th>Do Not Use If</th><td>${data.results[i].do_not_use}</td>`;
                    html += `</table>`;
                }

                else {
                    html += `<p>No results returned.</p>`;
                }
            }
        }
    }

    if (category == "pill_picture") {
        console.log(data.nlmRxImages[0].name);
        
        html += `<p class="disclaimer">DISCLAIMER:</p>`;
        html += `<p class="picture-disclaimer">
            Do not rely on this data for decisions regarding medical care. These
            pictures are provided by the <span class="disclaimer">discontinued</span>
            NIH's <a href="https://wayback.archive-it.org/7867/20190423182937/https://lhncbc.nlm.nih.gov/project/c3pi-computational-photography-project-pill-identification" target="_blank">
            Computational Photography Project for Pill Identification</a>.</p>`;

        for (let i = 0; i < data.nlmRxImages.length; i++) {
            html += `<table>`;
            html += `<tr><th>Name of Medication</th><th>Image</th></tr>`;
            html += `<tr><td>${data.nlmRxImages[i].name}</td><td><a href=${data.nlmRxImages[i].imageUrl} target="_blank"><img src=${data.nlmRxImages[i].imageUrl}></a></td></tr>`;
            html += `</table>`;
        }    
    }


    if (category == "molecule_picture") {

        for (let i = 0; i < data.results.length; i++) {
    
            // obtain inchikey from fetched data, and use it to create url where
            // image is located
            let inchikey = data.results[i].summary.ik;
            html += `<table><tr><th>Molecule name</th><th>Image</th></tr>`;
            html += `<tr><td>${data.results[i].summary.na}</td><td><a href="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/inchikey/${inchikey}/PNG" target="_blank"><img src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/inchikey/${inchikey}/PNG"></a></td></tr>`;
            html += `</table>`;
        }
    }

    // display html in span
    $("#display").html(html);
}


$(document).ready( () => {

    // click event handler for submit button
    $("#submit").click( () => {

        try {
            // retrieve search term entered by user
            let searchTerm = $("#search_term").val();
            if (searchTerm == "") {

                // highlight search term field if nothing entered
                $("#search_term").addClass("highlight").focus();
                throw "Please enter a search term or click a suggestion.";
            }

            // remove highlight of search term field if something is entered
            $("#search_term").removeClass("highlight");

            // get value of radio button selected
            let radio = $(":radio:checked").val();

            // get value of number of results to limit by
            let limit = $("#limit").val();

            // determine the correct URL to fetch 
            // depending on radio button selected
            let url = "";
            switch(radio) {
                case "food":
                    url += `https://api.fda.gov/food/enforcement.json?search=product_description:%22${searchTerm}%22&limit=${limit}`;
                    break;
                case "med":
                    url += `https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22${searchTerm}%22&limit=${limit}`;
                    break;
                case "pill_picture":
                    url += `https://rximage.nlm.nih.gov/api/rximage/1/rxbase?name=${searchTerm}&rLimit=${limit}`;
                    break;
                case "molecule_picture":
                    url += `https://chem.nlm.nih.gov/api/data/name/equals/${searchTerm}?data=summary`;
                    break;
            }
            
            // fetch data from API
            fetch(url)
                .then(response => response.json())
                .then(json => displayData(json, radio, searchTerm))
                .catch(e => displayError("No results returned"));
        }

        catch(error) {
            $("#display").text(error);
        }
    });    


    $(":radio").change( () => {
        let radio = $(":radio:checked").val();
        $("#search_term").val("").focus();
        
        if (radio == "food") {
            $("#search_term").attr("placeholder", "Enter food name, eg ice cream");
            $(".med").hide();
            $(".food").show();
            $(".limit").show();
            $(".molecule").hide();
        }
        else if (radio == "med" || radio == "pill_picture") {
            $("#search_term").attr("placeholder", "Enter med name, eg atenolol");
            $(".food").hide();
            $(".med").show();
            $(".limit").show();
            $(".molecule").hide();
        }
        else if (radio == "molecule_picture") {
            $("#search_term").attr("placeholder", "Enter a molecule, eg glucose");
            $(".food").hide();
            $(".med").show();
            $(".limit").hide();
            $(".molecule").show();
        }
    });


    // suggestions click handlers
    $("#rice").click( () => {
        $("#search_term").val("rice");
        $("#submit").click();
    });

    $("#pasta").click( () => {
        $("#search_term").val("pasta");
        $("#submit").click();
    });

    $("#tea").click( () => {
        $("#search_term").val("tea");
        $("#submit").click();
    });

    $("#atorvastatin").click( () => {
        $("#search_term").val("atorvastatin");
        $("#submit").click();
    });

    $("#januvia").click( () => {
        $("#search_term").val("januvia");
        $("#submit").click();
    });

    $("#lisinopril").click( () => {
        $("#search_term").val("lisinopril");
        $("#submit").click();
    });

    $("#glucose").click( () => {
        $("#search_term").val("glucose");
        $("#submit").click();
    });

    $("#search_term").focus();

});

