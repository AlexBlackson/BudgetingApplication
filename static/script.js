/*
Written by Alex Blackson
For CS1520 with Todd Waits
Last Editted: 12/6/2017
*/
var currMonth;
var currYear;

function setup(){
	document.getElementById("submitCat").addEventListener("click", addCat, true);
	document.getElementById("submitPurchase").addEventListener("click", addPurchase, true);
	
	var currDate = new Date();
	currYear = '' + currDate.getFullYear();
	currMonth = currDate.getMonth()+1;
	currMonth = '' + currMonth;
	if(currMonth<10){
		currMonth = '0' + currMonth;
	}

	postCat();
	postPurchases();
}

function makeReq(method, target, retCode, action, data) {
	var httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('ERROR: Cannot create an XMLHTTP instance');
		return false;
	}

	httpRequest.onreadystatechange = makeHandler(httpRequest, retCode, action);
	httpRequest.open(method, target);
	
	if (data){
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.send(data);
	}
	else {
		httpRequest.send();
	}
}

function makeHandler(httpRequest, retCode, action) {

	function handler() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			console.log("HTTP Response Text:  " + httpRequest.responseText);
			action(httpRequest.responseText);
		}
	}
	return handler;
}

function addPurchase(){
	var selectBox = document.getElementById("selectCat");
	var catName = selectBox.options[selectBox.selectedIndex].innerText;
	var purchaseAmount = document.getElementById("newPurchase").value;
	var purchaseDesc = document.getElementById("purchaseDescription").value;
	var purchaseDate = document.getElementById("purchaseDate").value;
	var newEntry = "category=" + catName + "&amount=" + purchaseAmount + "&reason=" + purchaseDesc + "&date=" + purchaseDate;
	makeReq("POST", "/purchases", 201, postPurchases, newEntry);
	document.getElementById("newPurchase").value = "";
	document.getElementById("purchaseDescription").value = "";
	document.getElementById("purchaseDate").value = "";
}

function postPurchases(){
	makeReq("GET", "/purchases", 200, repopulatePurchases);
	makeReq("GET", "/cats", 200, repopulateCats)
}

function addCat(){
	var newCat = document.getElementById("newCat").value;
	var newBudget = document.getElementById("newBudget").value;
	var newEntry = "name=" + newCat + "&budget=" + newBudget;
	makeReq("POST", "/cats", 201, postCat, newEntry);
	var selectBox = document.getElementById("selectCat");
	var option = document.createElement("option");
	option.text = newCat;
	selectBox.add(option);
	document.getElementById("newCat").value = "";
	document.getElementById("newBudget").value = "0";

}

function postCat(){
	makeReq("GET", "/cats", 200, repopulateCats);
}

function deleteCat(catName){
	makeReq("DELETE", "/cats/" + catName, 204, postCat);
	makeReq("GET", "/purchases", 200, repopulatePurchases);

	var selectBox = document.getElementById("selectCat");
	for (var s = 0; s < selectBox.options.length; s++){
		if (selectBox[s].innerText == catName){
			selectBox.remove(s);
			break;
		}
	}
}

//Function to repopulate categories
function repopulateCats(responseText) {
	var response = JSON.parse(responseText);
	var cats = response[0];
	var purchases = response[1];
	var tab = document.getElementById("cTable");
	var newRow;

	while (tab.rows.length > 1) {
		tab.deleteRow(tab.rows.length-1);
	}
			
	for (var c = 0;  c < cats.length; c++) {

		newRow = tab.insertRow();

		newCell = newRow.insertCell();
		newButton = document.createElement("input");
		newButton.type = "button";
		newButton.value = "Click to delete";
		(function(_t){ newButton.addEventListener("click", function() { deleteCat(_t); }); })(cats[c]["name"]);
		newCell.appendChild(newButton);

		addCell(newRow, cats[c]["name"]);

		addCell(newRow, "$" + cats[c]["budget"]);

		var sum = 0;
		if(purchases.length > 0){
			var tempP = purchases;
			tempP = tempP.filter(p => p["category"] == cats[c]["name"] 
				&& currYear == p["date"].substring(0,4) && currMonth == p["date"].substring(5,7));
			for (var t = 0; t < tempP.length; t++){
				sum = sum + Number(tempP[t]["amount"]);
			}
		}

		addCell(newRow, "$" + sum);

		var budgRemaining = cats[c]["budget"] - sum;
		addCell(newRow, "$" + budgRemaining);
	}
}

function repopulatePurchases(responseText){
	var purchases = JSON.parse(responseText);
	var tab = document.getElementById("pTable");
	var newRow;

	while (tab.rows.length > 1) {
		tab.deleteRow(tab.rows.length-1);
	}

	for (var p = 0; p < purchases.length; p++){
		newRow = tab.insertRow();

		addCell(newRow, purchases[p]["category"]);
		addCell(newRow, "$" + purchases[p]["amount"]);
		addCell(newRow, purchases[p]["reason"]);
		addCell(newRow, purchases[p]["date"]);
	}
}

function addCell(row, text) {
	var newCell = row.insertCell();
	var newText = document.createTextNode(text);
	newCell.appendChild(newText);
}

window.addEventListener("load", setup, true);
