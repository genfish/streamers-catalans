(function($){$(window).on('load',function(){

var url = "https://gamesaffinity.com/streamers.json?callback=foo";

function SortStreamers(a, b) {
	return ((a.videos > b.videos) ? -1 : ((a.videos < b.videos) ? 1 : 0));
}

$.getJSON(url, function(data) {

	data.users.sort(SortStreamers);

	for (var i in data.users)
	{
		tr = '<tr class="lb__row"><td class="lb__user-rank">';

		if (data.users[i].online == 1) {
			tr += '<img src="images/online.png" class="status">';
		} else {
			tr += '<img src="images/offline.png" class="status">';
		}

		tr += '</td><td class="lb__username"><div class="lb__user-img-wrapper">';
		tr += '<img src="streamers/' + data.users[i].image + '" class="lb__user-img"></div>';
		tr += '<div><a href="https://go.twitch.tv/' + data.users[i].url + '" target="_blank" class="night">' + data.users[i].name + '</a></div></td>';
		tr += '<td class="lb__donation-amount">' + data.users[i].videos + '</td></tr>';

		$('.lb__table tbody').append( $(tr) );
	}

	$('.lb__row').each(function(index, el) {
		if (index > 13)
			$(el).hide();
	});

	$('.lb__see-all').on("click", function(e) {
		e.preventDefault();
		$('.lb__row').show();
		$(e.currentTarget).hide();
	});

	$('.lb__nav-bot input').on("change", function(e) {

		$('.lb__section-wrapper > div').hide();

		if (e.currentTarget.value == 'links')
		{
			$('.lb__links-wrapper').show();
		}
		else
		{
			$('.lb__table-wrapper').show();
		}
	});
});

})})(jQuery)