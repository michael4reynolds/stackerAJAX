// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};

var showUser = function(item) {
    let result = $('.templates .question2').clone()    
    let user = item.user
    
    result.find('a').attr({
        href: user.link,
        target: '_blank' 
    })
    result.find('img').attr({
        src: user.profile_image, 
        alt: 'profile image'})
    result.find('.name').html(`${user.display_name}`)
    result.find('.reputation').text(`Rep: ${user.reputation}`)
    result.find('.rate').text(`Rate: ${user.accept_rate}`)
    result.find('.count').text(`Posts: ${item.post_count}`)  
      
    return result
}

// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET"
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};


var getTopRepliers = function (tag) {
	fetch("http://api.stackexchange.com/2.2/tags/" + tag +
					"/top-answerers/all_time?site=stackoverflow", {
			method: "GET"
	}).then(function (response) {
			return response.json()
	}).then(function (data) {
            var searchResults = showSearchResults(tag, data.items.length);
			$('.search-results').html(searchResults);
            
            $('.results').append('<div class="top-repliers">')
			for (let item of data.items) {
                    let user = showUser(item)
                    $('.top-repliers').append(user)
			}
	}).catch(function (err) {
			console.log(err);
	})
}

var submitNewQuery = function (e, frm, func, type) {
	e.preventDefault();
	$('.results').html('');
	var tags = $(frm).find("input[name=" + type + "]").val();
	func(tags);
}

$(document).ready(function () {
	$('.unanswered-getter').submit(function (e) {
			submitNewQuery(e, this, getUnanswered, 'tags');
	});

	$('.inspiration-getter').on('submit', function (e) {
			submitNewQuery(e, this, getTopRepliers, 'answerers')
	});
});
