$(document).ready(function(){
	var app = angular.module('XIVTrack', ['ui.bootstrap', 'smart-table']);	
	var control = app.controller('TableController', function($scope) {
		
		//categories: solo, group, assorted, economy, other
		$scope.filterCategories = ["Solo", "Group", "Assorted", "Economy", "Other"];
		$scope.filterLibrary = {vendor:{key:"vendor", name:"Vendor", category:"assorted", filtered:false}, quest:{key:"quest", name:"Quest", category:"solo", filtered:false}, dungeon:{key:"dungeon", name:"Dungeon", category:"group", filtered:false}, raid:{key:"raid", name:"Raid", category:"group", filtered:false}, trial:{key:"trial", name:"Trial", category:"group", filtered:false}, fate:{key:"fate", name:"FATE", category:"solo", filtered:false}, achievement:{key:"achievement", name:"Achievement", category:"assorted", filtered:false}, unobtainable:{key:"unobtainable", name:"Unobtainable", category:"other", filtered:false}, merchandise:{key:"merchandise", name:"Merchandise", category:"other", filtered:false}, holiday:{key:"holiday", name:"Holiday", category:"other", filtered:false}, promotion:{key:"promotion", name:"Promotion", category:"other", filtered:false}, cashshop:{key:"cashshop", name:"Cash Shop", category:"other", filtered:false}, treasurehunt:{key: "treasurehunt", name:"Treasure Hunt", category:"assorted", filtered:false}, crafted:{key:"crafted", name:"Crafted", category:"economy", filtered:false}, gathered:{key:"gathered", name:"Gathered", category:"economy", filtered:false}, gardening:{key:"gardening", name:"Gardening", category:"economy", filtered:false}, venture:{key:"venture", name:"Venture", category:"economy", filtered:false}, npc:{key:"npc", name:"NPC", category:"solo", filtered:false}, sightseeing:{key:"sightseeing", name:"Sightseeing", category:"solo", filtered:false}, other:{key:"other", name:"Other", category:"other", filtered:false}};
		$scope.filterObtained = false;
		$scope.settingTabActive = false;
		$scope.sortType = "Name";
		$scope.reverseSort = false;
		$scope.sourceSearchTerm = {term: ""};
		$scope.filterCollapsed = true;
		
		//["vendor", "quest", "dungeon", "raid", "trial", "fate", "achievement", "unobtainable", "merchandise", "holiday", "promotion", "cashshop", "treasurehunt", "crafted", "gathered", "gardening", "venture", "npc", "sightseeing", "other"]
		$scope.tabs = [
			{ title:'Minions', id: '0', prefix: 'minion', data: [], sData: [], tableHeading:[], numObtained:0, maxObtained: 0, filters: ["vendor", "quest", "dungeon", "raid", "trial", "fate", "achievement", "unobtainable", "merchandise", "holiday", "promotion", "cashshop", "treasurehunt", "crafted", "gathered", "gardening", "venture", "other"], oneIcon: false},
			{ title:'Mounts', id: '1', prefix: 'mount', data: [], sData: [], tableHeading:["Attributes"], numObtained:0, maxObtained: 0, filters: ["vendor", "quest", "raid", "trial", "achievement", "unobtainable", "merchandise", "holiday", "promotion", "cashshop", "other"], oneIcon: false},
			{ title:'Triple Triad', id: '2', prefix: 'triad', data: [], sData: [], tableHeading:["Card"], numObtained:0, maxObtained: 0, filters: ["vendor", "quest", "dungeon", "raid", "trial", "fate", "achievement", "holiday", "npc", "other"], oneIcon: false},
			{ title:'Barding', id: '3', prefix: 'barding', data: [], sData: [], tableHeading:[], numObtained:0, maxObtained: 0, filters: ["vendor", "quest", "fate", "achievement", "unobtainable", "merchandise", "holiday", "promotion", "cashshop", "crafted", "other"], oneIcon: false},
			{ title:'Orchestrion', id: '4', prefix: 'music', data: [], sData: [], tableHeading:[], numObtained:0, maxObtained: 0, filters: ["vendor", "quest", "dungeon", "achievement", "merchandise", "holiday", "cashshop", "treasurehunt", "crafted"], oneIcon: true},
			{ title:'Titles', id: '5', prefix: 'title', data: [], sData: [], tableHeading:[], numObtained:0, maxObtained: 0, filters: ["achievement", "unobtainable"], oneIcon: true},
			{ title:'Sightseeing', id: '6', prefix: 'sightseeing', data: [], sData: [], tableHeading:[], numObtained:0, maxObtained: 0, filters: ["sightseeing"], oneIcon: false}
		];
		
		$scope.attributes = {flying:'Flying Mount', passenger: 'Passenger Mount', beastman: 'Beastman', primal: 'Primal', scion: 'Scion', garlean: 'Garlean'};
		
		$scope.activeTabNum = 0;
		$scope.activeTab = $scope.tabs[0];
		
		/***********************
		 * Setup/Loading Stuff *
		 ***********************/
		 
		$scope.setup = function() {
			var loop = 0;
			while (loop < $scope.tabs.length) {
				$scope.handleJson($scope.tabs[loop]);
				loop++;
			}
			$scope.loadFilters();
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
		
		/********************
		 * Tab Manipulation *
		 ********************/
		
		$scope.setTab = function(num) {
			$scope.activeTabNum = num;
			$scope.sourceSearchTerm.term = "";
			if (num == -1) return; //Settings tab doesn't need anything else
			$scope.activeTab = $scope.tabs[num];
			$scope.loadFilters();
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
		
		/***********************
		 * Filter Manipulation *
		 ***********************/		 
		$scope.swapObtainedFilter = function() {
			localStorage.setItem("filter_" + $scope.activeTabNum + "_obtained", $scope.filterObtained);
			$scope.testAllFilters();
		}
		
		$scope.saveFilter = function(f) {
			localStorage.setItem("filter_" + $scope.activeTab.id + "_" + f.key, f.filtered);
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
			
			item.filtered = true;
			for (var snum = 0; snum < item.sources.length; snum++) {
				s = item.sources[snum];
				
				if ($scope.isSourceActive(s)) {
					item.filtered = false;
					break;
				}
			}
			
			return;
		}
		
		$scope.isFiltered = function(type) {
			return $scope.filterLibrary[type].filtered;
		}
		
		$scope.filterAll = function(val) {
			for (var filter in $scope.filterLibrary) {
				var f = $scope.filterLibrary[filter];
				f.filtered = val;
				localStorage.setItem("filter_" + $scope.activeTab.id + "_" + f.key, val);
			}
			$scope.testAllFilters();
		}
		
		$scope.isSourceActive = function(s) {
			//Source is filtered if its type is filtered out
			if ($scope.filterLibrary[s.type].filtered) return false;

			//Source is filtered if there is an active search term that doesn't match it
			if ($scope.sourceSearchTerm.term != "") {
				if (!s.info.toLowerCase().includes($scope.sourceSearchTerm.term.toLowerCase()) && !s.location.toLowerCase().includes($scope.sourceSearchTerm.term.toLowerCase()) && (!s.details || !s.details.toLowerCase().includes($scope.sourceSearchTerm.term.toLowerCase()))) return false;
			}
			
			//Source is active if it's not filtered...
			return true
		}
		
		$scope.getFiltersInCategory = function(cat) {
			flist = [];
			for (var filter in $scope.filterLibrary) {
				var f = $scope.filterLibrary[filter];
				if (cat.toLowerCase() == f.category.toLowerCase()) {
					flist.push(f);
				}
			}
			return flist;
		}
		
		$scope.loadFilters = function() {
			$scope.filterObtained = (localStorage.getItem("filter_" + $scope.activeTabNum + "_obtained") == "true");
			for (var filter in $scope.filterLibrary) {
				var f = $scope.filterLibrary[filter];
				if (localStorage.getItem("filter_" + $scope.activeTab.id + "_" + f.key) == "true") {
					f.filtered = true;
				} else {
					f.filtered = false;
				}
			}
			$scope.testAllFilters();
		}
		
		$scope.filterExistsInTab = function(f) {
			for (var num in $scope.activeTab.filters) {
				var filter = $scope.activeTab.filters[num];
				if (f.key == filter) return true;
			}
			return false;
		}
		
		/*********************
		 * Item Manipulation *
		 *********************/
		
		$scope.getItemImage = function(item, tab) {
			if (tab.oneIcon) return "all_" + tab.prefix;
			else return $scope.fixString(item.name, true) + "_" + tab.prefix;
		}
		
		$scope.fixString = function(str, isImg) {
			if (str == undefined) return "";
			if (str == "Wind-up Merlwyb" || str == "Wind-up Kan-E" || str == "Wind-up Raubahn") {
				str = "Wind-up Leader"; //stupid hack
			}
			str = str.replace(/ |#|'|&|,/g, "_");
			if (isImg) {
				str = str.toLowerCase();
			}
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
			var str = $scope.fixString(tab.prefix + "_" + item.name, false);
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
			var str = $scope.fixString(tab.prefix + "_" + item.name, false);
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
					var str = $scope.fixString(tab.prefix + "_" + item.name, false);
					localStorage.setItem(str, "false");
				}
				tab.numObtained = 0;
			}
			return true;
		}
		
		/*****************
		 * Import/Export *
		 *****************/
		
		$scope.lodestoneName = "";
		$scope.serverSelection = {model: "",
			library:[
				{id: '1', name: 'Adamantoise'}, 
				{id: '2', name: 'Aegis'},
				{id: '3', name: 'Alexander'}, 
				{id: '4', name: 'Anima'},
				{id: '5', name: 'Asura'},
				{id: '6', name: 'Atomos'},
				{id: '7', name: 'Bahamut'},	
				{id: '8', name: 'Balmung'},
				{id: '9', name: 'Behemoth'},
				{id: '10', name: 'Belias'},
				{id: '11', name: 'Brynhildr'},
				{id: '12', name: 'Cactuar'},
				{id: '13', name: 'Carbuncle'},
				{id: '14', name: 'Cerberus'},
				{id: '15', name: 'Coeurl'},
				{id: '16', name: 'Chocobo'},
				{id: '17', name: 'Diabolos'},
				{id: '18', name: 'Durandal'},
				{id: '19', name: 'Excalibur'},
				{id: '20', name: 'Exodus'},
				{id: '21', name: 'Faerie'},
				{id: '22', name: 'Famfrit'},
				{id: '23', name: 'Fenrir'},
				{id: '24', name: 'Garuda'},
				{id: '25', name: 'Gilgamesh'},
				{id: '26', name: 'Goblin'},
				{id: '27', name: 'Gungnir'},
				{id: '28', name: 'Hades'},
				{id: '29', name: 'Hyperion'},
				{id: '30', name: 'Ifrit'},
				{id: '31', name: 'Ixion'},
				{id: '32', name: 'Jenova'},
				{id: '33', name: 'Kujata'},
				{id: '34', name: 'Lamia'},
				{id: '35', name: 'Leviathan'},
				{id: '36', name: 'Lich'},
				{id: '37', name: 'Malboro'},
				{id: '38', name: 'Mandragora'},
				{id: '39', name: 'Masamune'},
				{id: '40', name: 'Mateus'},
				{id: '41', name: 'Midgardsormr'},
				{id: '42', name: 'Moogle'},
				{id: '43', name: 'Odin'},
				{id: '44', name: 'Pandaemonium'},
				{id: '45', name: 'Phoenix'},
				{id: '46', name: 'Ragnarok'},
				{id: '47', name: 'Ramuh'},
				{id: '48', name: 'Ridill'},
				{id: '49', name: 'Sargatanas'},
				{id: '50', name: 'Shinryu'},
				{id: '51', name: 'Shiva'},
				{id: '52', name: 'Siren'},
				{id: '53', name: 'Tiamat'},
				{id: '54', name: 'Titan'},
				{id: '55', name: 'Tonberry'},
				{id: '56', name: 'Typhon'},
				{id: '57', name: 'Ultima'},
				{id: '58', name: 'Ultros'},
				{id: '59', name: 'Unicorn'},
				{id: '60', name: 'Valefor'},
				{id: '61', name: 'Yojimbo'},
				{id: '62', name: 'Zalera'},
				{id: '63', name: 'Zeromus'},
				{id: '64', name: 'Zodiark'}
		]};
		
		$scope.importState = 0;
		$scope.importStateEnum = { OFF: 0, CHECK_FILE: 1, CONFIRM_FILE: 2, READ_FILE: 3, IMPORT_FILE: 4, CHECK_LODE: 5, CONFIRM_LODE: 6, READ_LODE: 7, IMPORT_LODE: 8, DONE: 9, ERROR: 10, CLEAR: 11};
		$scope.importStateStrings = ["", "Checking file...", "Import data? This will overwrite your entire collection.", "Loading from file...", "Importing...", "Checking Lodestone...", "Import data? This will overwrite your minions and mount collections.", "Downloading from Lodestone...", "Importing...", "Import complete!", "Error"];
		$scope.importHasError = false;
		$scope.importErrorMessage = "";
		$scope.importFinalName = "";
		$scope.importId = "";
		
		$scope.getImportText = function() {
			if ($scope.importHasError) return $scope.importErrorMessage;
			else if ($scope.importState == $scope.importStateEnum.CONFIRM_LODE) return "Import mount/minion data from character " + $scope.importFinalName + "? This will overwrite those collections.";
			else return $scope.importStateStrings[$scope.importState];
		}
		
		$scope.isImportChoice = function() {
			return ($scope.importState == $scope.importStateEnum.CONFIRM_FILE || $scope.importState == $scope.importStateEnum.CONFIRM_LODE);
		}
		
		$scope.isImportDone = function() {
			return ($scope.importState == $scope.importStateEnum.DONE || $scope.importHasError);
		}
		
		$scope.importConfirmClicked = function(state) {
			if ($scope.importState == $scope.importStateEnum.CONFIRM_FILE) {
				if(state) {
					$scope.importCSVConfirm();
					return;
				} else {
					$scope.importDeny();
					return;
				}
			}
			
			if ($scope.importState == $scope.importStateEnum.CONFIRM_LODE) {
				if(state) {
					$scope.importLodeConfirm();
					return;
				} else {
					$scope.importDeny();
					return;
				}
			}
		}
		
		$scope.importDoneClicked = function() {
			$scope.importClearError();
			$('#importModal').modal('hide');
		}
		
		$scope.importSetError = function(text) {
			$scope.importState = $scope.importStateEnum.ERROR;
			$scope.importHasError = true;
			$scope.importErrorMessage = text;
		}
		
		$scope.importClearError = function() {
			$scope.importState = $scope.importStateEnum.OFF;
			$scope.importHasError = false;
			$scope.importErrorMessage = "";
		}
		
		//Exports all collection data to CSV file.
		$scope.exportCSV = function() {
			var csvContent = "tab,name,obtained\n";
			for (var tnum = 0; tnum < $scope.tabs.length; tnum++) {
				var tab = $scope.tabs[tnum];
				for (var inum = 0; inum < tab.sData.length; inum++) {
					var item = tab.sData[inum];
					var str = tab.prefix + "," + $scope.fixString(item.name, false) + "," + item.obtained + "\n";
					csvContent += str;
				}
			}
			
			var blob = new Blob([csvContent], {type: "text/csv;charset=utf-8"});
			saveAs(blob, "XIVTrackData.csv");
		}
		
		//Imports all collection data from CSV file.
		//fixme: giving it something that's not a CSV file
		$scope.importCSV = function() {
			if ($scope.importState != $scope.importStateEnum.OFF) return; //Don't let it run twice
			$scope.importState = $scope.importStateEnum.CHECK_FILE;
			var file = document.getElementById('import-file');
			if (file.files.length == 0) {
				$scope.importSetError("Please select a file.");
				return;
			}
			
			//file validation should go here
			if (false) { //if it's not a valid file, error out
				$scope.importSetError("Invalid file. Please select a file created by XIVTrack.");
			}
			
			$scope.importState = $scope.importStateEnum.CONFIRM_FILE;
		}
		
		//The other half of CSV import, to be run if the user confirms that they want to do it.
		$scope.importCSVConfirm = function() {
			$scope.importState = $scope.importStateEnum.IMPORT_FILE;
			var file = document.getElementById('import-file').files[0];
			var data = "";
			
			var reader = new FileReader();
			reader.onload = function(e) {
				$scope.$apply(function() {
					data = reader.result;
					var importArray = $scope.CSVToArray(data);
					
					for(var impnum = 1; impnum < importArray.length; impnum++) {
						if(importArray[impnum][0] == "") continue;
						var itemMatched = false;
						for(var tnum = 0; tnum < $scope.tabs.length; tnum++) {
							if($scope.tabs[tnum].prefix == importArray[impnum][0]) {
								for(var inum = 0; inum < $scope.tabs[tnum].sData.length; inum++) {
									var item = $scope.tabs[tnum].sData[inum];
									if(importArray[impnum][1] == $scope.fixString(item.name, false)) {
										$scope.tabs[tnum].sData[inum].obtained = (importArray[impnum][2] == "true");
										itemMatched = true;
										break;
									}								
								}
								if (!itemMatched) {
									console.log("Item " + importArray[impnum][1] + " not found in data. Ignoring.");
									continue;
								}
							}
						}
						if (!itemMatched) {
								console.log("Tab " + importArray[impnum][0] + " not found. Aborting.");
								$scope.importSetError("Invalid file. Please select a file created by XIVTrack.");
								return;
						}
					}
					
					$scope.importState = $scope.importStateEnum.DONE;
				$scope.forceSyncCollection();}
				);
			}
			
			reader.readAsText(file);	
		}
		
		//User wants to cancel import. Clear everything.
		$scope.importDeny = function() {
			$scope.importState = $scope.importStateEnum.OFF;
			$('#importModal').modal('hide');
		}
		
		$scope.importLodeConfirm = function() {
			$scope.importState = $scope.importStateEnum.READ_LODE;
			$.ajax({
				type: "GET",
				url: "https://api.xivdb.com/character/" + $scope.importId,
				dataType: "json",
				success: function success(resp2) {
					$scope.$apply(function() {
						$scope.importLodestone(resp2);
					});
				}
			});
		}
		
		$scope.fetchCharacterID = function() {
			if ($scope.importState != $scope.importStateEnum.OFF) return; //Don't let it run twice
			$scope.importState = $scope.importStateEnum.CHECK_LODE;
			var name = document.getElementById('import-name').value;
			var server = $scope.serverSelection.model;
			if (server == "") {
				$scope.importSetError("Please select a server.");
				return;
			}
			if (name == "") {
				$scope.importSetError("Please enter a name.");
				return;
			}
			$.ajax({
				type: "GET",
				url: "https://api.xivdb.com/search?one=characters&server|et=" + encodeURIComponent(server.toLowerCase()) + "&string=" + encodeURIComponent(name.toLowerCase()),
				dataType: "json",
				success: function success(resp) {
					$scope.$apply(function() {
					var r = resp.characters.results;
					var finalName = "";
					if (r.length == 0) {
						$scope.importSetError("Character not found. Check spelling/server and try again.");
						return;
					}
					var id = 0;
					if (r.length > 1) {
						for (var cnum = 0; cnum < r.length; cnum++) {
							if (r[cnum].name.toLowerCase() == name.toLowerCase()) {
								$scope.importId = r[cnum].id;
								$scope.importFinalName = r[cnum].name;
								break;
							}
						}
						if (id == 0) {
							$scope.importSetError("Multiple characters found. Please type the full name and try again.");
							return;
						}
					} else {
						$scope.importId = r[0].id;
						$scope.importFinalName = r[0].name;
					}
					$scope.importState = $scope.importStateEnum.CONFIRM_LODE;
				});
				}
			});
		}
		
		$scope.importLodestone = function(rawResults) {
			var results = rawResults.data;
			$scope.importState = $scope.importStateEnum.IMPORT_LODE;
			
			//Clear tabs being imported
			for (var tnum = 0; tnum < 2; tnum++) {
				var tab = $scope.tabs[tnum];
				for (var inum = 0; inum < tab.sData.length; inum++) {
					var item = tab.sData[inum];
					item.obtained = false;
					var str = $scope.fixString(tab.prefix + "_" + item.name, false);
					localStorage.setItem(str, "false");
				}
				tab.numObtained = 0;
			}
			
			//Import minions
			for (var m in results.minions) {
				var dnum = 0;
				var found = false;
				while (dnum < $scope.tabs[0].sData.length) {
					if ($scope.fixString(results.minions[m].name, true) == $scope.fixString($scope.tabs[0].sData[dnum].name, true)) {
						$scope.tabs[0].sData[dnum].obtained = true;
						break;
					} else {
						dnum++;
					}
				}
				if (dnum >= $scope.tabs[0].sData.length) {
					console.log("Item " + results.minions[m].name + " not found in data. Ignoring.");
				}
			}
			
			//Import mounts
			for (var m in results.mounts) {
				var dnum = 0;
				var found = false;
				while (dnum < $scope.tabs[1].sData.length) {
					if ($scope.fixString(results.mounts[m].name, true) == $scope.fixString($scope.tabs[1].sData[dnum].name, true)) {
						$scope.tabs[1].sData[dnum].obtained = true;
						break;
					} else {
						dnum++;
					}
				}
				if (dnum >= $scope.tabs[1].sData.length) {
					console.log("Item " + results.mounts[m].name + " not found in data. Ignoring.");
				}
			}
			
			$scope.forceSyncCollection();
			$scope.importState = $scope.importStateEnum.DONE;
		}
		
		//Forces a save of all collection data to localstorage. Also checks collection numbers.
		$scope.forceSyncCollection = function() {
			for (var tnum = 0; tnum < $scope.tabs.length; tnum++) {
				var tab = $scope.tabs[tnum];
				tab.numObtained = 0;
				for (var inum = 0; inum < tab.sData.length; inum++) {
					var item = tab.sData[inum];
					var str = $scope.fixString(tab.prefix + "_" + item.name, false);
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