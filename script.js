function addEvent(obj, event, func, arg) {
    if (obj.attachEvent) //IE
        obj.attachEvent("on" + event, func);
    else
        obj.addEventListener(event, func, true);
}

function focus(input) { // Focus at the end of the input
	input.focus();
	input.value = input.value;
}

function addEntry() {
	var entries = document.getElementById('entries');
	var entry_template = document.getElementById('entry_template');
	var new_entry = entry_template.cloneNode(true);
	
	if (entries.length > 1) // No entries, avoid a loop
		cleanEntries();
	
	new_entry.setAttribute('id', '');
	addEvent(new_entry, 'mouseover', function() {
		if (new_entry.getElementsByClassName('content_edit')[0].style.display == 'none')
			new_entry.getElementsByClassName('actions')[0].style.display = 'block'; 
	});
	addEvent(new_entry, 'mouseout', function() { new_entry.getElementsByClassName('actions')[0].style.display = 'none'; });
	addEvent(new_entry.getElementsByClassName('content')[0], 'click', function() { editEntry(new_entry); });
	addEvent(new_entry.getElementsByClassName('action edit')[0], 'click', function() { editEntry(new_entry); });
	addEvent(new_entry.getElementsByClassName('action done')[0], 'click', function() { doneEntry(new_entry); });
	addEvent(new_entry.getElementsByClassName('content_edit')[0], 'focusout', function() { editEntryDone(new_entry); });
	entries.appendChild(new_entry);
	editEntry(new_entry);
}

function editEntry(entry) {
	var content = entry.getElementsByClassName('content')[0];
	var content_edit = entry.getElementsByClassName('content_edit')[0];
	
	content.style.display = 'none';
	content_edit.style.display = 'block';
	focus(content_edit);
}

function editEntryDone(entry) {
	var content = entry.getElementsByClassName('content')[0];
	var content_edit = entry.getElementsByClassName('content_edit')[0];
	
	cleanEntries();
	undoEntry(entry);
	
	content_edit.blur();
	content.innerHTML = content_edit.value;
	content_edit.style.display = 'none';
	content.style.display = 'block';
}

function doneEntry(entry) {
	var content = entry.getElementsByClassName('content')[0].style.textDecoration = 'line-through';
	entry.getElementsByClassName('action done')[0].style.visibility = 'hidden';
}

function undoEntry(entry) {
	var content = entry.getElementsByClassName('content')[0].style.textDecoration = '';
	entry.getElementsByClassName('action done')[0].style.visibility = 'visible';
}

function cleanEntries() {
	var entries = document.getElementById('entries').getElementsByClassName('entry');
	
	for (var i = 0; i < entries.length; i++) {
		var content_edit = entries[i].getElementsByClassName('content_edit')[0];
		if (content_edit.value == '')
			entries[i].parentNode.removeChild(entries[i]);
		else
			content_edit.blur();
	}
	
	if (entries.length == 1) // Automatically add a first entrys
		addEntry();
}

addEvent(window, "load", function() { 
	addEvent(document.getElementById('add_entry'), "click", addEntry);
	cleanEntries();
});