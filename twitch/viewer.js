var clientID = 'foivuskvn9iq1d8t8kwjfk7d5gwlgv';

var spreadsheetID = "1QSIxL_5UnlYyxylPpF3gMX1IJ6fFtx43q0SjQJPp9H8";
var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";

var streamersNamesLists = [];

var streamersCatalans = [];
var liveStreamersCatalans = [];

$(document).ready(function() {
	$.getJSON(url, function(data) {
		var entry = data.feed.entry;
		
		$(entry).each(function(){
			var streamerLogin = cleanString(this.gsx$twitchname.$t);
			if (streamerLogin.length >= 3){
				streamersNamesLists.push(streamerLogin);
			}
		});

		var namesUrlString = "";
		if(streamersNamesLists.length > 0){
			for(var i=0; i < streamersNamesLists.length; i++){
				namesUrlString += "login=" + streamersNamesLists[i].toLowerCase();

				if(i < streamersNamesLists.length - 1){
					namesUrlString += "&";
				}
			}
			getStreamInfo(namesUrlString);
		}
	});
});

function getStreamInfo(namesUrl){
	var userIDsUrlString = "";
	
	$.ajax({
		type: "GET",
		url: "https://api.twitch.tv/helix/users?" + namesUrl,
		headers:{
			'Client-ID': clientID
		},
		success: function(receivedUserInfo){
			if(receivedUserInfo.data[0] != null){
				for(var i=0; i < receivedUserInfo.data.length; i++){
					streamersCatalans.push([
						receivedUserInfo.data[i].id, //0 id
						receivedUserInfo.data[i].login, //1 login
						receivedUserInfo.data[i].display_name, //2 display_name
						receivedUserInfo.data[i].profile_image_url //3 profile_image_url
					]);
					
					userIDsUrlString += "user_id=" + receivedUserInfo.data[i].id;
					if(i < receivedUserInfo.data.length - 1){
						userIDsUrlString += "&";
					}
				}
				
				$.ajax({
					type: "GET",
					url: "https://api.twitch.tv/helix/streams?" + userIDsUrlString,
					headers:{
						'Client-ID': clientID
					},
					success: function(receivedStreamInfo){
						if(receivedStreamInfo.data[0] != null){
							for(i=0; i < receivedStreamInfo.data.length; i++){
								for(var j=0; j < streamersCatalans.length; j++){
									if(receivedStreamInfo.data[i].user_id == streamersCatalans[j][0]){
										liveStreamersCatalans.push([
											streamersCatalans[j][0], //0 id
											streamersCatalans[j][1], //1 login
											streamersCatalans[j][2], //2 display_name
											streamersCatalans[j][3], //3 profile_image_url
											receivedStreamInfo.data[i].title, //4 stream title
											receivedStreamInfo.data[i].viewer_count, //5 viewer_count
											receivedStreamInfo.data[i].thumbnail_url, //6 stream thumbnail_url
											receivedStreamInfo.data[i].game_id, ////7 gameID
											null, //8 game name
											null //9 game box_art_url
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

$(document).ajaxStop(function () {
	var tr = null;
	if(streamersCatalans.length > 0){
		for(var i=0; i < streamersCatalans.length; i++){
			tr = '<tr class="lb__row"><td class="lb__username">';
			tr += '<div class="lb__user-img-wrapper"><img src="' + streamersCatalans[i][3] + '" class="lb__user-img"></div>';
			tr += '<div><a href="https://go.twitch.tv/' + streamersCatalans[i][1] + '" target="_blank" class="night">' + streamersCatalans[i][2] + '</a></div></td></tr>';

			$('#all-users tbody').append( $(tr) );
			//$('#online-users tbody').append( $(tr) );
		}
	}
	
	if(liveStreamersCatalans.length > 0){
		for(i=0; i < liveStreamersCatalans.length; i++){
			tr = '<tr class="lb__row"><td class="lb__username">';
			tr += '<div class="lb__user-img-wrapper"><img src="' + liveStreamersCatalans[i][3] + '" class="lb__user-img"></div>';
			tr += '<div><a href="https://go.twitch.tv/' + liveStreamersCatalans[i][1] + '" target="_blank" class="night">' + liveStreamersCatalans[i][2] + '</a></div></td></tr>';
			$('#online-users tbody').append( $(tr) );
		}
	}
	else{
		tr = '<tr class="lb__row"><td class="lb__username">';
		//tr += '<div class="lb__user-img-wrapper"><img src="' + liveStreamersCatalans[i][3] + '" class="lb__user-img"></div>';
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
/*
$('.lb__row').each(function(index, el) {
	if (index > 13)
		$(el).hide();
});

$('.lb__see-all').on("click", function(e) {
	e.preventDefault();
	$('.lb__row').show();
	$(e.currentTarget).hide();
});
*/