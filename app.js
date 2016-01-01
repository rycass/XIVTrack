$(document).ready(function(){
	var app = angular.module('XIVTrack', ['ui.bootstrap', 'smart-table']);	
	var control = app.controller('TableController', function($scope) {
		
		$scope.filterLibrary = {vendor:{name:"Vendor", filtered:false}, quest:{name:"Quest", filtered:false}, dungeon:{name:"Dungeon", filtered:false}, raid:{name:"Raid", filtered:false}, trial:{name:"Trial", filtered:false}, fate:{name:"FATE", filtered:false}, achievement:{name:"Achievement", filtered:false}, unobtainable:{name:"Unobtainable", filtered:false}, merchandise:{name:"Merchandise Bonus", filtered:false}, holiday:{name:"Holiday", filtered:false}, promotion:{name:"Promotion", filtered:false}, cashshop:{name:"Cash Shop", filtered:false}, treasurehunt:{name:"Treasure Hunt", filtered:false}, crafted:{name:"Crafted", filtered:false}, gathered:{name:"Gathered", filtered:false}, gardening:{name:"Gardening", filtered:false}, venture:{name:"Venture", filtered:false}, npc:{name:"NPC", filtered:false}, other:{name:"Other", filtered:false}};
		$scope.filterObtained = false;
		$scope.settingTabActive = false;
		$scope.sortType = "Name";
		$scope.reverseSort = false;
		
		$scope.tabs = [
			{ title:'Minions', id: '0', prefix: 'minion', data: [], sData: [], tableHeading:["Source"], numObtained:0, maxObtained: 0, color: '#FFFFFF'},
			{ title:'Mounts', id: '1', prefix: 'mount', data: [], sData: [], tableHeading:["Source"], numObtained:0, maxObtained: 0, color:'#000000'},
			{ title:'Triple Triad', id: '2', prefix: 'triad', data: [], sData: [], tableHeading:["Card", "Source"], numObtained:0, maxObtained: 0, color:'#123456'}
		];
		
		$scope.flags = {flying:'Flying Mount', passenger: 'Passenger Mount', beastman: 'Beastman', primal: 'Primal', scion: 'Scion', garlean: 'Garlean'};
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
				if (req.readyState == 4 && req.status == 200) {
					var num = 1;
					if (req.responseText == "") {
						return;
					}
					var j = $.parseJSON(req.responseText);
					tab.sData = j;
					var item;
					for (i in tab.sData) {
						item = tab.sData[i];
						item.number = num;
						num++;
						item.obtained = $scope.fetchObtained(item, tab);
						tab.maxObtained++;
					}
					tab.data.concat(tab.sData);
				}
			}
			req.send();
		}
		
		$scope.setTab = function(num) {
			$scope.activeTab = $scope.tabs[num];
			$scope.activeTabNum = num;
		}
		
		$scope.checkFilter = function(item) {
			if(item.obtained && $scope.filterObtained) {
				return true;
			}
			item.activesources = [];
			for (var i = 0; i < item.sources.length; i++) {
				s = item.sources[i];
				if (!$scope.filterLibrary[s.type].filtered) item.activesources.push(s);
			}
			if (item.activesources.length == 0) return true;
			return false;
		}
		
		$scope.isFiltered = function(type) {
			return $scope.filterLibrary[type].filtered;
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
		
		$scope.getItemImage = function(item, prefix) {
			return $scope.fixImgString(item.name) + "_" + prefix;
		}
		
		$scope.fixImgString = function(str) {
			if (str == undefined) return "";
			str = str.replace(/ |#|'|&/g, "_");
			str = str.toLowerCase();
			return str;
		}
		
		$scope.getFlags = function(item) {
			if (item.flags == undefined) return [];
			return item.flags.split(" ");
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