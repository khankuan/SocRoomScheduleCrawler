$(document).ready(function () {   
	try{
   	jQuery.noConflict();
 	} catch(e){};
	init();
});

var VM;

function init(){
	VM = new RoomScheduleViewModel();
	ko.applyBindings(VM);	
	var current;
	
	var plnames = new roomgroup("PL");
	plnames.roomsMap['39/COM1-B112'] = new room('PL1', '39/COM1-B112');
	plnames.roomsMap['39/COM1-B109'] = new room('PL2', '39/COM1-B109');
	plnames.roomsMap['39/COM1-B108'] = new room('PL3', '39/COM1-B108');
	plnames.roomsMap['39/COM1-B111'] = new room('PL4', '39/COM1-B111');
	plnames.roomsMap['39/COM1-B110'] = new room('PL5', '39/COM1-B110');
	VM.roomgroups.push(plnames);
	for (current in plnames.roomsMap){
		VM.rooms[current] = plnames.roomsMap[current];
		plnames.rooms.push(plnames.roomsMap[current]);
	}
	
	var drnames = new roomgroup("DR");
	drnames.roomsMap['DR1'] = new room('DR1', 'DR1');
	drnames.roomsMap['DR2'] = new room('DR2', 'DR2');
	drnames.roomsMap['DR3'] = new room('DR3', 'DR3');
	drnames.roomsMap['DR4'] = new room('DR4', 'DR4');
	VM.roomgroups.push(drnames);
	for (current in drnames.roomsMap){
		VM.rooms[current] = drnames.roomsMap[current];
		drnames.rooms.push(drnames.roomsMap[current]);
	}
	
	var othersnames = new roomgroup("Others");
	othersnames.roomsMap['39/COM1-B113'] = new room('OS/IT/SEC Lab', '39/COM1-B113');
	othersnames.roomsMap['39/COM1-B101'] = new room('Parallel Lab', '39/COM1-B101');;
	othersnames.roomsMap['39/COM1-B102'] = new room('DataComm Lab 3', '39/COM1-B102');;
	othersnames.roomsMap['39/COM1-B103'] = new room('DataComm Lab 1', '39/COM1-B103');;
	othersnames.roomsMap['39/COM1-B104'] = new room('Technical Room 2', '39/COM1-B104');;
	othersnames.roomsMap['39/COM1-B105'] = new room('Technical Room 1', '39/COM1-B105');;
	VM.roomgroups.push(othersnames);
	for (current in othersnames.roomsMap){
		VM.rooms[current] = othersnames.roomsMap[current];
		othersnames.rooms.push(othersnames.roomsMap[current]);
	}
	
	VM.beginDataUpdate(60000);
	VM.beginDisplayRotate(10000);
}



var booking = function(starttime, endtime, purpose){
	this.starttime = starttime;
	this.endtime = endtime;
	this.purpose = purpose;
}


var room = function(roomname, systemName){
	this.name = roomname;
	this.systemName = systemName;
	this.bookings = ko.observableArray();
}


var roomgroup = function(name){
	this.name = name;
	this.rooms = ko.observableArray();
	this.roomsMap = new Object();
	this.isVisible = ko.observable(false);
}


function RoomScheduleViewModel() {
	//	Variables
	this.rooms = new Object();
	this.roomgroups = ko.observableArray();
	this.currentgroup = 0;
	
	//	Function to rotate the current group display
	this.rotategroup = function(){
		this.roomgroups()[this.currentgroup].isVisible(false);
		this.currentgroup += 1;
		if (this.currentgroup >= this.roomgroups().length)
			this.currentgroup = 0;
		this.roomgroups()[this.currentgroup].isVisible(true);
	}
	
	//	Function to update booking data from server
	this.refreshSchedule = function(){
		var url = "http://absolut.comp.nus.edu.sg/room/getschedule.json?rooms=";
		for (var i = 0; i < this.roomgroups().length; i++){
			var roomsToGet = new Array();
			var group = this.roomgroups()[i];
			for (var room in group.roomsMap)
				roomsToGet.push(group.roomsMap[room].systemName);
			
			var groupUrl = url + roomsToGet.join();
		
			//alert(i +  " " + groupUrl);
			jQuery.ajax({
				url: groupUrl,
				dataType: 'jsonp',
				success: function (data){
					for (var i in data){
						var room = VM.rooms[data[i]['room']];
						var updatedBookings = data[i]['bookings'];
						room.bookings.removeAll();
						for (var b in updatedBookings)
							room.bookings.push(updatedBookings[b]);
					}
				},
			});
			
			//for (var room in group.rooms){
			//	alert(group.rooms[room].name + "," + group.rooms[room].bookings().length);}
		}
	}
	
	//	Timer to auto update every x seconds
	this.beginDataUpdate = function(x){
		VM.refreshSchedule();
		updateData = setTimeout(function(){
			VM.refreshSchedule();
			VM.beginDataUpdate(x);
		},x)
	};
	
	//	Time to auto rotate displayed group
	this.beginDisplayRotate = function(x){
		VM.rotategroup();
		updateDisplay = setTimeout(function(){
			VM.rotategroup();
			VM.beginDisplayRotate(x);	
		}, x);
	}

	
	
}
