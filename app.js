$(document).ready(function(){
	var app = angular.module('XIVTrack', ['ui.bootstrap', 'smart-table']);	
	var control = app.controller('TableController', function($scope) {
		
		$scope.filterLibrary = [{category: "Vendor"}, {category: "Quest"}, {category: "Dungeon"}, {category: "Raid"}, {category: "Trial"}, {category: "FATE"}, {category: "Veteran Reward"}, {category: "Achievement"}, {category: "Unobtainable"}, {category: "Merchandise"}, {category: "Holiday"}, {category: "Cash Shop"}, {category: "Treasure Hunt"}, {category: "Crafted"}, {category: "Gathered"}, {category: "Gardening"}, {category: "Venture"}, {category: "NPC"}, {category: "Other"}];
		$scope.filterObtained = false;
		$scope.settingTabActive = false;
		$scope.sortType = "Name";
		$scope.reverseSort = false;
		
		$scope.tabs = [
			{ title:'Minions', id: '0', prefix: 'minion', data: [], tableHeading:["Name", "Source"], numObtained:0, maxObtained: 0},
			{ title:'Mounts', id: '1', prefix: 'mount', data: [], tableHeading:["Name", "Source"], numObtained:0, maxObtained: 0},
			{ title:'Triple Triad', id: '2', prefix: 'triad', data: [], tableHeading:["Name", "Card", "Source"], numObtained:0, maxObtained: 0}
		];
		//the following tbi:
		//	{ title:'Barding', id: '3', prefix: 'barding', data:bardingLibrary, tableHeading:["Name", "Category", "Subcategory", "Info", "Location", "Expansion"], numObtained:0, maxObtained: 0},
		//	{ title:'Cosmetics', id: '4', prefix: 'cosmetic', data:cosmeticLibrary, tableHeading:["Name", "Category", "Subcategory", "Type", "Info", "Location", "Expansion"], numObtained:0, maxObtained: 0}

		$scope.activeTabNum = 0;
		$scope.activeTab = $scope.tabs[0];
		
		$scope.setup = function() {
			$scope.handleJson($scope.tabs[0]);
			$scope.handleJson($scope.tabs[1]);
			$scope.handleJson($scope.tabs[2]);
		}
		
		$scope.handleJson = function(tab) {
			var file = 'data/' + tab.prefix + 'library.json'
			var req = new XMLHttpRequest();
			req.open('GET', file);
			req.onreadystatechange = function() {
				if (req.responseText == "") {
					return;
				}
				var j = $.parseJSON(req.responseText);
				tab.data = j;
				var item;
				for (i in tab.data) {
					item = tab.data[i];
					item.obtained = $scope.fetchObtained(item, tab);
					tab.maxObtained++;
				}
			}
			req.send();
		}
		
		$scope.setTab = function(num) {
			$scope.sortType = "Name";
			$scope.reverseSort = false;
			$scope.activeTab = $scope.tabs[num];
			$scope.activeTabNum = num;
		}
		
		$scope.checkFilter = function(cat, subcat) {
			for (x in $scope.filterLibrary) {
				obj = $scope.filterLibrary[x];
				if (cat == obj.category) {
					if (subcat == null || obj.state) {
						return obj.state;
					} else {
						for (y in obj.subcategory) {
							subobj = obj.subcategory[y];
							if (subcat == subobj.category) {
								return subobj.state;
							}
						}
					}	
				}
			}
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
		
		$scope.getImage = function(item) {
			if (item.image != undefined) return item.image;
			return $scope.fixImgString(item.name);
		}
		
		$scope.fixImgString = function(str) {
			if (str == undefined) return "";
			str = str.replace(/ |#|'/g, "_");
			str = str.toLowerCase();
			return str;
		}
		
		$scope.getFlags = function(item) {
			if (item.flags == undefined) return [];
			return item.flags.split(" ");
		}
		
		$scope.getTooltips = function(item, column) {
			var arr = [];
			var looper = 0;
			while (item[column.toLowerCase() + '_tt' + looper] != undefined) {
				arr[looper] = item[column.toLowerCase() + '_tt' + looper];
				looper++;
			}
			return arr;
			
			if (item[column.toLowerCase() + '_tt0'] == undefined) return arr;
			return item[column.toLowerCase() + '_icon'].split(" ");
		}
		
		$scope.getCard = function (item, position) {
			return item["card"].split(" ")[position];
		}
		
		$scope.toggleObtained = function(item, tab) {
			var str = tab.prefix + "_" + item.name;
			str = str.replace(/ |#|'/g, "_");
			if (item.obtained == false) tab.numObtained++;
			else tab.numObtained--;
			item.obtained = !item.obtained;
			localStorage.setItem(str, item.obtained);
		}
		
		$scope.fetchObtained = function (item, tab) {
			var str = tab.prefix + "_" + item.name;
			str = str.replace(/ |#|'/g, "_");
			if (localStorage.getItem(str) == "true") {
				tab.numObtained++;
				return true;
			} else return false;
		}
		
		$scope.setup();
	});
});