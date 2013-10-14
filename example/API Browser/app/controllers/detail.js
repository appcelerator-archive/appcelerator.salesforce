var apis = require('apis');

function formatJSON(evt) {
	return JSON.stringify(evt, function(key, value) {
		if (key === 'source' || key === 'type') {
			return undefined;
		} else {
			return value;
		}
	}, 2);
}

function logResults(e, meta) {
	$.resultsTextArea.value = formatJSON(e);
	$.metaTextArea.value = formatJSON(meta); 
}

exports.callApi = function(title) {
	if (OS_ANDROID) {
		$.title.text = 'API: ' + title;
	} else {
		$.detail.title = title;
	}
	
	apis[title](logResults);
};