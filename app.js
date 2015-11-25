$(document).ready(function(){
	var app = angular.module('XIVTrack', ['ui.bootstrap', 'smart-table']);	
	var control = app.controller('TableController', function($scope) {
		
		$scope.filterLibrary = filterLibrary;
		$scope.filterObtained = false;
		$scope.settingTabActive = false;
		$scope.sortType = "Name";
		$scope.reverseSort = false;
		$scope.curHeader = null;
		
		$scope.tabs = [
			{ title:'Minions', prefix: 'minion', data:minionLibrary, tableHeading:["Name", "Category", "Subcategory", "Info", "NPC", "Location", "Expansion"], numObtained:0, maxObtained: 0, active: true},
			{ title:'Mounts', prefix: 'mount', data:mountLibrary, tableHeading:["Name", "Category", "Subcategory", "Info", "NPC", "Location", "Expansion"], numObtained:0, maxObtained: 0, active: false},
			{ title:'Triple Triad', prefix: 'tt', data:ttLibrary, tableHeading:["Name", "Category", "Subcategory", "Rarity", "Card", "Info", "NPC", "Location", "Expansion"], numObtained:0, maxObtained: 0, active: false},
			{ title:'Barding', prefix: 'barding', data:bardingLibrary, tableHeading:["Name", "Category", "Subcategory", "Info", "NPC", "Location", "Expansion"], numObtained:0, maxObtained: 0, active: false},
			{ title:'Cosmetics', prefix: 'cosmetic', data:cosmeticLibrary, tableHeading:["Name", "Category", "Subcategory", "Info", "NPC", "Location", "Expansion"], numObtained:0, maxObtained: 0, active: false}
		];
		
		$scope.activeTabNum = 0;
		$scope.activeTab = $scope.tabs[0];
		
		$scope.setTab = function(num) {
			$scope.sortType = "Name";
			$scope.reverseSort = false;
			$scope.activeTab = $scope.tabs[num];
			$scope.activeTabNum = num;
		}
		
		$scope.loadData = function() {
			for (t in $scope.tabs) {
				tab = $scope.tabs[t];
				for (i in tab.data) {
					item = tab.data[i];
					item.obtained = $scope.fetchObtained(item, tab);
					tab.maxObtained++;
				}
			}
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
			var str = item.name;
			str = str.replace(/ |#|'/g, "_");
			str = str.toLowerCase();
			return str;
		}
		
		$scope.getIcons = function(item, column) {
			if (item[column.toLowerCase() + '_icon'] == undefined) return [];
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
		
		$scope.loadData();
	});
});