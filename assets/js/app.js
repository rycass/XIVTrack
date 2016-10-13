$(document).ready(function(){
	var app = angular.module('XIVTrack', ['ui.bootstrap', 'smart-table']);	
	var control = app.controller('TableController', function($scope) {
		
		$scope.filterLibrary = {vendor:{name:"Vendor", filtered:false}, quest:{name:"Quest", filtered:false}, dungeon:{name:"Dungeon", filtered:false}, raid:{name:"Raid", filtered:false}, trial:{name:"Trial", filtered:false}, fate:{name:"FATE", filtered:false}, achievement:{name:"Achievement", filtered:false}, unobtainable:{name:"Unobtainable", filtered:false}, merchandise:{name:"Merchandise Bonus", filtered:false}, holiday:{name:"Holiday", filtered:false}, promotion:{name:"Promotion", filtered:false}, cashshop:{name:"Cash Shop", filtered:false}, treasurehunt:{name:"Treasure Hunt", filtered:false}, crafted:{name:"Crafted", filtered:false}, gathered:{name:"Gathered", filtered:false}, gardening:{name:"Gardening", filtered:false}, venture:{name:"Venture", filtered:false}, npc:{name:"NPC", filtered:false}, other:{name:"Other", filtered:false}};
		$scope.filterObtained = false;
		$scope.settingTabActive = false;
		$scope.sortType = "Name";
		$scope.reverseSort = false;
		$scope.sourceSearchTerm = {term: ""};
		
		$scope.tabs = [
			{ title:'Minions', id: '0', prefix: 'minion', data: [], sData: [], tableHeading:[], numObtained:0, maxObtained: 0, backgrounds:["cat.jpg", "verminion.jpg"], oneIcon: false},
			{ title:'Mounts', id: '1', prefix: 'mount', data: [], sData: [], tableHeading:["Attributes"], numObtained:0, maxObtained: 0, backgrounds:["fatchocobo.jpg", "ahriman.jpg"], oneIcon: false},
			{ title:'Triple Triad', id: '2', prefix: 'triad', data: [], sData: [], tableHeading:["Card"], numObtained:0, maxObtained: 0, backgrounds:["goldsaucer.jpg"], oneIcon: false},
			{ title:'Barding', id: '3', prefix: 'barding', data: [], sData: [], tableHeading:[], numObtained:0, maxObtained: 0, backgrounds:["highland.jpg"], oneIcon: false},
			{ title:'Orchestrion', id: '4', prefix: 'music', data: [], sData: [], tableHeading:[], numObtained:0, maxObtained: 0, backgrounds:["orchestrion.jpg"], oneIcon: true},
			{ title:'Titles', id: '5', prefix: 'title', data: [], sData: [], tableHeading:[], numObtained:0, maxObtained: 0, backgrounds:["jalzahn.jpg"], oneIcon: true}
		];
		
		$scope.bgStyle = "";
		$scope.rareBackgrounds = ["santa.jpg"];
		$scope.attributes = {flying:'Flying Mount', passenger: 'Passenger Mount', beastman: 'Beastman', primal: 'Primal', scion: 'Scion', garlean: 'Garlean'};
		
		$scope.activeTabNum = 0;
		$scope.activeTab = $scope.tabs[0];
		
		$scope.setup = function() {
			var loop = 0;
			while (loop < $scope.tabs.length) {
				$scope.handleJson($scope.tabs[loop]);
				loop++;
			}
			$scope.setBackground();
		}
		
		$scope.setBackground = function() {
			var bglist = $scope.activeTab.backgrounds;
			if (Math.random() <= .1) {
				bglist = $scope.rareBackgrounds;
			}
			var chosenbg;
			var numInList = bglist.length;
			chosenbg = bglist[Math.floor(Math.random() * numInList)];
			
			$scope.bgStyle = "url('assets/backgrounds/" + chosenbg + "')";
		}
		
		$scope.handleJson = function(tab) {
			var file = 'data/' + tab.prefix + 'library.json'
			var req = new XMLHttpRequest();
			req.open('GET', file);
			req.onreadystatechange = function() {
				if (req.readyState == 4 && req.status == 200) {
					var num = 1;
					if (req.responseText == "") {
						return;
					}
					var j = $.parseJSON(req.responseText);
					tab.sData = j;
					var item;
					for (inum in tab.sData) {
						item = tab.sData[inum];
						item.number = num;
						num++;
						item.obtained = $scope.fetchObtained(item, tab);
						$scope.testFilters(item);
						tab.maxObtained++;
					}
				}
			}
			req.send();
		}
		
		$scope.setTab = function(num) {
			$scope.activeTab = $scope.tabs[num];
			$scope.activeTabNum = num;
			$scope.setBackground();
			$scope.sourceSearchTerm.term = "";
			$scope.testAllFilters();
		}
		
		$scope.testAllFilters = function() {
			for (var inum = 0; inum < $scope.activeTab.sData.length; inum++) {
				$scope.testFilters($scope.activeTab.sData[inum]);
			}
		}
		
		$scope.testFilters = function(item) {
			item.filtered = false;
			
			if(item.obtained && $scope.filterObtained) {
				item.filtered = true;
				return;
			}
			
			item.activesources = [];
			for (var snum = 0; snum < item.sources.length; snum++) {
				s = item.sources[snum];
				//If the source's type is on the filter, don't push it to active sources
				if ($scope.filterLibrary[s.type].filtered) continue;
				
				//If there's a search term for sources and it's not found in the source, don't push it to active sources
				if ($scope.sourceSearchTerm.term != "") {
					if (!s.info.toLowerCase().includes($scope.sourceSearchTerm.term.toLowerCase()) && !s.location.toLowerCase().includes($scope.sourceSearchTerm.term.toLowerCase()) && (!s.details || !s.details.toLowerCase().includes($scope.sourceSearchTerm.term.toLowerCase()))) continue; //still needs to search details
				}
					
				item.activesources.push(s);
			}
			
			//If there are no active sources left, the item gets completely filtered
			if (item.activesources.length == 0) {
				item.filtered = true;
				return;
			}
			
			return;
		}
		
		$scope.isFiltered = function(type) {
			return $scope.filterLibrary[type].filtered;
		}
		
		$scope.filterAll = function(val) {
			for (var filter in $scope.filterLibrary) {
				$scope.filterLibrary[filter].filtered = val;
			}
			$scope.testAllFilters();
		}
		
		$scope.tabActive = function(num) {
			if ($scope.activeTabNum == num) return true;
			else return false;
		}
		
		$scope.navTabActive = function(num) {
			if ($scope.activeTabNum == num) return "active";
			else return "";
		}
		
		$scope.getNumObtained = function() {
			return $scope.activeTab.numObtained;
		}
		
		$scope.getMaxObtained = function() {
			return $scope.activeTab.maxObtained;
		}
		
		$scope.getItemImage = function(item, tab) {
			if (tab.oneIcon) return "all_" + tab.prefix;
			else return $scope.fixString(item.name) + "_" + tab.prefix;
		}
		
		$scope.fixString = function(str) {
			if (str == undefined) return "";
			str = str.replace(/ |#|'|&|,/g, "_");
			str = str.toLowerCase();
			return str;
		}
		
		$scope.getAttributes = function(item) {
			if (item.attributes == undefined) return [];
			return item.attributes.split(" ");
		}
		
		//Fetches a TT card number at a given position.
		//Argument: item (Item) - Item to be checked.
		//Argument: position (Integer, 0-3) - Position to check for number. 0 is left, 1 is up, 2 is down, 3 is right.
		//Returns: Value at given position (1-9 or A).
		$scope.getCard = function (item, position) {
			return item["card"].split(" ")[position];
		}
		
		//Toggles whether an item has been obtained.
		//Argument: item (Item) - Item to be checked.
		//Argument: tab (Tab) - Tab to check for item on.
		$scope.toggleObtained = function(item, tab) {
			var str = $scope.fixString(tab.prefix + "_" + item.name);
			if (item.obtained == false) tab.numObtained++;
			else tab.numObtained--;
			item.obtained = !item.obtained;
			localStorage.setItem(str, item.obtained);
		}
		
		//Fetches if a given item on a given tab has been marked as collected in LocalStorage.
		//Argument: item (Item) - Item to be checked.
		//Argument: tab (Tab) - Tab to check for item on.
		//Returns: True if the item has been collected. False if it has not.
		$scope.fetchObtained = function (item, tab) {
			var str = $scope.fixString(tab.prefix + "_" + item.name);
			if (localStorage.getItem(str) == null) {
				localStorage.setItem(str, "false");
			}
			if (localStorage.getItem(str) == "true") {
				tab.numObtained++;
				return true;
			} else return false;
		}
		
		//Asks the user if they want to clear the collection, and then clears it if they agree.
		//Argument: showMsg (bool) - If true, shows a confirmation message. If false, skips it.
		//Returns: True if the collection has been cleared. False if it hasn't (user declined).
		$scope.clearObtained = function(showMsg) {
			if (showMsg) {
				var confirmVal = confirm("Are you sure? This will clear your entire collection.");
				if (!confirmVal) return false;
			}
			
			for (var tnum = 0; tnum < $scope.tabs.length; tnum++) {
				var tab = $scope.tabs[tnum];
				for (var inum = 0; inum < tab.sData.length; inum++) {
					var item = tab.sData[inum];
					item.obtained = false;
					var str = $scope.fixString(tab.prefix + "_" + item.name);
					localStorage.setItem(str, "false");
				}
				tab.numObtained = 0;
			}
			return true;
		}
		
		//Exports all collection data to CSV file.
		$scope.exportData = function() {
			var csvContent = "tab,name,obtained\n";
			for (var tnum = 0; tnum < $scope.tabs.length; tnum++) {
				var tab = $scope.tabs[tnum];
				for (var inum = 0; inum < tab.sData.length; inum++) {
					var item = tab.sData[inum];
					var str = tab.prefix + "," + $scope.fixString(item.name) + "," + item.obtained + "\n";
					csvContent += str;
				}
			}
			
			var blob = new Blob([csvContent], {type: "text/csv;charset=utf-8"});
			saveAs(blob, "XIVTrackData.csv");
		}
		
		//Imports all collection data from CSV file.
		//To fix: giving it something that's not a CSV file
		$scope.importData = function() {
			var fileInput = document.getElementById('import-file');
			if (fileInput.files.length == 0) {
				alert("Please select a file!");
				return;
			}
			var confirmVal = confirm("Are you sure? This will overwrite your collection.");
			if (!confirmVal) return;
			
			var file = fileInput.files[0];
			var data = "";
			
			var reader = new FileReader();
			reader.onload = function(e) {
				data = reader.result;
				var importArray = $scope.CSVToArray(data);
				var dataArray = [];
				for(var tnum = 0; tnum < $scope.tabs.length; tnum++) {
					dataArray[tnum] = $.extend(true, [], $scope.tabs[tnum].sData);
				}
				
				for(var impnum = 1; impnum < importArray.length; impnum++) {
					if(importArray[impnum][0] == "") continue;
					var itemMatched = false;
					for(var tnum = 0; tnum < $scope.tabs.length; tnum++) {
						if($scope.tabs[tnum].prefix == importArray[impnum][0]) {
							for(var inum = 0; inum < dataArray[tnum].length; inum++) {
								var item = dataArray[tnum][inum];
								if(importArray[impnum][1] == $scope.fixString(item.name)) {
									dataArray[tnum][inum].obtained = (importArray[impnum][2] == "true");
									itemMatched = true;
									break;
								}								
							}
							if (!itemMatched) {
								alert("Error! Item " + importArray[impnum][1] + " not found in data. Aborting.");
								return;
							}
						}
					}
					if (!itemMatched) {
							alert("Error! Tab " + importArray[impnum][0] + " not found. Aborting.");
							return;
					}
				}
				$scope.clearObtained(false)
				for(var tnum = 0; tnum < $scope.tabs.length; tnum++) {
					$scope.tabs[tnum].sData = dataArray[tnum];
				}
				$scope.forceSyncCollection();
			}
			
			reader.readAsText(file);
		}
		
		$scope.importLodestone = function() {
			
			var charID = 3647075; //DEBUG VALUE, FIXME
			
			var confirmVal = confirm("Are you sure? This will overwrite your Minion and Mount collection.");
			if (!confirmVal) return;
			
			var dataArray = [];
			for(var tnum = 0; tnum < $scope.tabs.length; tnum++) {
				if ($scope.tabs[tnum].prefix != "minion" || $scope.tabs[tnum].prefix != "mount") continue;
				dataArray[tnum] = $.extend(true, [], $scope.tabs[tnum].sData);
			}
		}
		
		//Forces a save of all collection data to localstorage. Also checks collection numbers.
		$scope.forceSyncCollection = function() {
			for (var tnum = 0; tnum < $scope.tabs.length; tnum++) {
				var tab = $scope.tabs[tnum];
				tab.numObtained = 0;
				for (var inum = 0; inum < tab.sData.length; inum++) {
					var item = tab.sData[inum];
					var str = $scope.fixString(tab.prefix + "_" + item.name);
					if (item.obtained == true) {
						localStorage.setItem(str, "true");
						tab.numObtained++;
					} else {
						localStorage.setItem(str, "false");
					}
				}
			}
		}
		
		//Source: https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
		// This will parse a delimited string into an array of
		// arrays. The default delimiter is the comma, but this
		// can be overriden in the second argument.
		$scope.CSVToArray = function( strData, strDelimiter ){
		// Check to see if the delimiter is defined. If not,
		// then default to comma.
		strDelimiter = (strDelimiter || ",");
		// Create a regular expression to parse the CSV values.
		var objPattern = new RegExp(
			(
				// Delimiters.
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
				// Quoted fields.
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
				// Standard fields.
				"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			"gi"
			);
		// Create an array to hold our data. Give the array
		// a default empty first row.
		var arrData = [[]];
		// Create an array to hold our individual pattern
		// matching groups.
		var arrMatches = null;
		// Keep looping over the regular expression matches
		// until we can no longer find a match.
		while (arrMatches = objPattern.exec( strData )){
			// Get the delimiter that was found.
			var strMatchedDelimiter = arrMatches[ 1 ];
			// Check to see if the given delimiter has a length
			// (is not the start of string) and if it matches
			// field delimiter. If id does not, then we know
			// that this delimiter is a row delimiter.
			if (
				strMatchedDelimiter.length &&
				(strMatchedDelimiter != strDelimiter)
				){
				// Since we have reached a new row of data,
				// add an empty row to our data array.
				arrData.push( [] );
			}
			// Now that we have our delimiter out of the way,
			// let's check to see which kind of value we
			// captured (quoted or unquoted).
			if (arrMatches[ 2 ]){
				// We found a quoted value. When we capture
				// this value, unescape any double quotes.
				var strMatchedValue = arrMatches[ 2 ].replace(
					new RegExp( "\"\"", "g" ),
					"\""
					);
			} else {
				// We found a non-quoted value.
				var strMatchedValue = arrMatches[ 3 ];
			}
			// Now that we have our value string, let's add
			// it to the data array.
			arrData[ arrData.length - 1 ].push( strMatchedValue );
		}
		// Return the parsed data.
		return( arrData );
	}
		
		$scope.setup();
	});
});