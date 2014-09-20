/*
 * Execute a function func on the element at the event 
 */
function addEvent(element, event, func) {
    if (element.attachEvent) //IE
        element.attachEvent('on' + event, func);
    else
        element.addEventListener(event, func, true);
}

function insertAfter(previous_element, new_element) {
    var parent = previous_element.parentNode;
	
    if (parent.lastChild === previous_element)
        parent.appendChild(new_element);
    else
        parent.insertBefore(new_element, previous_element.nextSibling);
}

/* 
 * Focus hack : focus at the end of the input
 */
function focus(input) {
	input.focus();
	input.value = input.value;
}

/*
 * Add a new entry.
 */
function addEntry(previous_entry) {
	var entries = document.getElementById('entries');
	var entry_template = document.getElementById('entry_template');
	var new_entry = entry_template.cloneNode(true);
	var content_edit = new_entry.getElementsByClassName('content_edit')[0];
	var actions = new_entry.getElementsByClassName('actions')[0];
	
	if (entries.length > 1) // No entries, avoid a loop
		cleanEntries();
	
	actions.style.display = 'none';
	addEvent(new_entry, 'mouseover', function() {
		if (content_edit.style.display != 'block')
			actions.style.display = ''; 
	});
	addEvent(new_entry, 'mouseout', function() { actions.style.display = 'none'; });
	addEvent(new_entry.getElementsByClassName('content')[0], 'click', function() { editEntry(new_entry); });
	addEvent(new_entry.getElementsByClassName('action edit')[0], 'click', function() { editEntry(new_entry); });
	addEvent(new_entry.getElementsByClassName('action done')[0], 'click', function() { doneEntry(new_entry); });
	addEvent(content_edit, 'focusout', function() { editEntryDone(new_entry); });
	addEvent(content_edit, 'keypress', function(e) { 
		if (!e) e = window.event;
		var keyCode = e.keyCode || e.which;
		if (keyCode == '13') {
			editEntryDone(new_entry);
			addEntry(new_entry);
		}
	});
	
	new_entry.setAttribute('id', '');
	if (typeof previous_entry === 'undefined')
		entries.appendChild(new_entry);
	else
		insertAfter(previous_entry, new_entry);
	editEntry(new_entry);
}

/*
 * Start editing an entry.
 */
function editEntry(entry) {
	var content = entry.getElementsByClassName('content')[0];
	var content_edit = entry.getElementsByClassName('content_edit')[0];
	
	content.style.visibility = 'hidden';
	content_edit.style.display = 'block';
	focus(content_edit);
}

/*
 * Finished editing an entry.
 */
function editEntryDone(entry) {
	var content = entry.getElementsByClassName('content')[0];
	var content_edit = entry.getElementsByClassName('content_edit')[0];
	
	cleanEntries();
	undoEntry(entry);
	
	content_edit.blur();
	content.innerHTML = content_edit.value;
	content_edit.style.display = '';
	content.style.visibility = 'visible';
}

/*
 * Mark an entry as done.
 */
function doneEntry(entry) {
	var content = entry.getElementsByClassName('content')[0].style.textDecoration = 'line-through';
	entry.getElementsByClassName('action done')[0].style.visibility = 'hidden';
}

/*
 * Mark an entry as undone.
 */
function undoEntry(entry) {
	var content = entry.getElementsByClassName('content')[0].style.textDecoration = '';
	entry.getElementsByClassName('action done')[0].style.visibility = 'visible';
}

/*
 *	Remove all the entry with content_edit's value empty.
 */
function cleanEntries() {
	var entries = document.getElementById('entries').getElementsByClassName('entry');
	
	for (var i = 0; i < entries.length; i++) {
		var content_edit = entries[i].getElementsByClassName('content_edit')[0];
		if (content_edit.value == '' && entries[i].id != 'entry_template')
			entries[i].parentNode.removeChild(entries[i]);
		else
			content_edit.blur();
	}
	
	if (entries.length == 1) // Automatically add a first entry
		addEntry();
}

addEvent(window, "load", function() { 
	addEvent(document.getElementById('add_entry'), "click", function(e) { addEntry(); });
	cleanEntries();
});