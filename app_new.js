$(document).ready(function(){
	var app = angular.module('XIVTrack', ['ui.bootstrap', 'smart-table']);

	var control = app.controller('TabController', function($scope) {
		
		$scope.filterLibrary = filterLibrary;
		$scope.filterObtained = false;
		$scope.settingTabActive = false;
		$scope.sortType = "Name";
		$scope.reverseSort = false;
		$scope.testData = minionLibrary;
		
		$scope.tabs = [
			{ title:'Minions', prefix: 'minion', data:minionLibrary, tableHeading:["Name", "Category", "Subcategory", "Info", "NPC", "Location", "Expansion"], numObtained:0, maxObtained: 0, active: true},
			{ title:'Mounts', prefix: 'mount', data:mountLibrary, tableHeading:["Name", "Category", "Subcategory", "Info", "NPC", "Location", "Expansion"], numObtained:0, maxObtained: 0, active: false},
			{ title:'Triple Triad', prefix: 'tt', data:ttLibrary, tableHeading:["Name", "Rarity", "Card", "Category", "Subcategory", "Info", "NPC", "Location", "Expansion"], numObtained:0, maxObtained: 0, active: false}
		];
		
		$scope.resetSort = function() {
			$scope.sortType = "Name";
			$scope.reverseSort = false;
		}
		
		$scope.adjustSort = function(column) {
			column = column.toLowerCase();
			if ($scope.sortType == column) {
				$scope.reverseSort = !$scope.reverseSort;
			} else {
				$scope.sortType = column;
				$scope.reverseSort = false;
			}
		}
		
		$scope.checkSort = function(column) {
			return (column.toLowerCase() == $scope.sortType);
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
		
		$scope.getActiveTab = function() {
			for (t in $scope.tabs) {
				if ($scope.tabs[t].active) return $scope.tabs[t];
			}
		}
		
		$scope.getNumObtained = function() {
			return $scope.getActiveTab().numObtained;
		}
		
		$scope.getMaxObtained = function() {
			return $scope.getActiveTab().maxObtained;
		}
		
		$scope.setObtained = function(item, tab) {
			var str = tab.prefix + "_" + item.name;
			str = str.replace(" ", "_");
			if (item.obtained == true) tab.numObtained++;
			else tab.numObtained--;
			localStorage.setItem(str, item.obtained);
		}
		
		$scope.fetchObtained = function (item, tab) {
			var str = tab.prefix + "_" + item.name;
			str = str.replace(" ", "_");
			if (localStorage.getItem(str) == "true") {
				tab.numObtained++;
				return true;
			} else return false;
		}
		
		$scope.loadData();
	});
});