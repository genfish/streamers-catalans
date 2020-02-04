var spreadsheetID = "1QSIxL_5UnlYyxylPpF3gMX1IJ6fFtx43q0SjQJPp9H8";
var twitchApiClientID = 'g1hcj8fsx2yect2gmfet4mj61rjzw0';

var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";

var streamersCatalans = [];
var liveStreamersCatalans = [];

var urlRequestLimit = 100;

$(document).ready(function() {
	$.getJSON(url, function(data) {
		var streamersNamesLists = [];
		var tempStreamersNamesLists = [];
		var entries = data.feed.entry;
		
		for(var i=0; i < entries.length; i++){
			var streamerLogin = cleanString(entries[i].gsx$twitchname.$t);
			if (streamerLogin.length >= 3){
				tempStreamersNamesLists.push(streamerLogin);
				if(i > 0 && entries.length > urlRequestLimit && (i+1)%urlRequestLimit == 0){
					streamersNamesLists.push(tempStreamersNamesLists);
					tempStreamersNamesLists = [];
				}
			}
		}
		streamersNamesLists.push(tempStreamersNamesLists);
		var tempNamesUrlString = "";

		if(streamersNamesLists[0].length > 0){
			var namesUrlString = [];
			
			for(i=0; i < streamersNamesLists.length; i++){
				for(var j=0; j < streamersNamesLists[i].length; j++){
					tempNamesUrlString += "login=" + streamersNamesLists[i][j];

					if(j < streamersNamesLists[i].length - 1){
						tempNamesUrlString += "&";
					}
				}
				namesUrlString.push(tempNamesUrlString);
				tempNamesUrlString = "";
			}
			getStreamInfo(namesUrlString);
		}
	});
});

function getStreamInfo(streamersNamesUrlArray){
	for(var i=0; i < streamersNamesUrlArray.length; i++){
		$.ajax({
			type: "GET",
			url: "https://api.twitch.tv/helix/users?" + streamersNamesUrlArray[i].toLowerCase(),
			headers:{
				'Client-ID': twitchApiClientID
			},
			success: function(receivedUserInfo){
				var userIDsUrlString = "";
				if(receivedUserInfo.data[0] != null){
					for(var i=0; i < receivedUserInfo.data.length; i++){
						streamersCatalans.push([
							receivedUserInfo.data[i].id, //0 id
							receivedUserInfo.data[i].login, //1 login
							receivedUserInfo.data[i].display_name, //2 display_name
							receivedUserInfo.data[i].profile_image_url //3 profile_image_url
						]);

						userIDsUrlString += "user_id=" + receivedUserInfo.data[i].id;
						if(i < receivedUserInfo.data.length - 1)
							userIDsUrlString += "&";
					}

					$.ajax({
						type: "GET",
						url: "https://api.twitch.tv/helix/streams?" + userIDsUrlString,
						headers:{
							'Client-ID': twitchApiClientID
						},
						success: function(receivedStreamInfo){
							if(receivedStreamInfo.data[0] != null){
								var gamesIDsUrlString = "";
								for(i=0; i < receivedStreamInfo.data.length; i++){
									for(var j=0; j < streamersCatalans.length; j++){
										if(receivedStreamInfo.data[i].user_id == streamersCatalans[j][0]){
											liveStreamersCatalans.push([
												streamersCatalans[j][0], //0 id
												streamersCatalans[j][1], //1 login
												streamersCatalans[j][2], //2 display_name
												streamersCatalans[j][3], //3 profile_image_url
												receivedStreamInfo.data[i].viewer_count, //4 viewer_count
											]);
											break;
										}
									}
								}
							}
						}
					});
				}
			}
		});
	}
}

$(document).ajaxStop(function () {
	var tr = null;
	if(streamersCatalans.length > 0){
		streamersCatalans.sort(orderByColumn(1));
		for(var i=0; i < streamersCatalans.length; i++){
			tr = '<tr class="lb__row"><td class="lb__username">';
			tr += '<div class="lb__user-img-wrapper"><img src="' + streamersCatalans[i][3] + '" class="lb__user-img"></div>';
			tr += '<div><a href="https://go.twitch.tv/' + streamersCatalans[i][1] + '" target="_blank" class="night">' + streamersCatalans[i][2] + '</a></div></td></tr>';
			$('#all-users tbody').append( $(tr) );
		}
	}
	
	if(liveStreamersCatalans.length > 0){
		liveStreamersCatalans.sort(orderByColumn(4, false));
		for(i=0; i < liveStreamersCatalans.length; i++){
			tr = '<tr class="lb__row"><td class="lb__username">';
			tr += '<div class="lb__user-img-wrapper"><img src="' + liveStreamersCatalans[i][3] + '" class="lb__user-img"></div>';
			tr += '<div><a href="https://go.twitch.tv/' + liveStreamersCatalans[i][1] + '" target="_blank" class="night">' + liveStreamersCatalans[i][2] + '</a></div></td></tr>';
			$('#online-users tbody').append( $(tr) );
		}
	}
	else{
		tr = '<tr class="lb__row"><td class="lb__username">';
		tr += '<div><a href="https://gaming.cat" target="_blank" class="night">' + 'No hi ha canals online' + '</a></div></td></tr>';
		$('#online-users tbody').append( $(tr) );
	}

	$('#all-users .lb__row').each(function(index, el) {
		if (index > 13 - liveStreamersCatalans.length)
			$(el).hide();
	});

	$('.lb__see-all').on("click", function(e) {
		e.preventDefault();
		$('.lb__row').show();
		$(e.currentTarget).hide();
	});
});

function cleanString(string){
	var cleanString = string.replace(/(\r\n|\n|\r)/gm,"");
	cleanString = cleanString.replace(/[|&;$%@"<>()+,.!¡?¿ ]/g, "");
	return cleanString.trim();
}

function orderByColumn(column, ASC=true) {
	return function(a,b){
		if (a[column] === b[column]) {
			return 0;
		}else {
			if(ASC)
				return (a[column] < b[column]) ? -1 : 1;
			else
				return (a[column] > b[column]) ? -1 : 1;
		}
	}
}