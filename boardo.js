var Boardo = {

	/*
	 * Execute a function func on the element at the event.
	 */
	addEvent: function(element, event, func) {
		if (element.attachEvent) //IE
			element.attachEvent('on' + event, func);
		else
			element.addEventListener(event, func, true);
	},
	
	/*
	 * Get the element's css properties.
	 */
	getStyle: function(element) {
		if (element.currentStyle) //IE
			return element.currentStyle;
		else
			return getComputedStyle(element, null);
	},
	
	/*
	 * Insert the new_element after the previous_element.
	 */
	insertAfter: function(previous_element, new_element) {
		var parent = previous_element.parentNode;
		if (parent.lastChild === previous_element)
			parent.appendChild(new_element);
		else
			parent.insertBefore(new_element, previous_element.nextSibling);
	},

	/* 
	 * Focus hack : focus at the end of the input
	 */
	focus: function(input) {
		input.focus();
		input.value = input.value;
	},
	
	Entries : {
		/*
		 * Add a new entry.
		 */
		add: function(previous_entry) {
			var entries = document.getElementById('entries');
			var new_entry = document.getElementById('entry_template').cloneNode(true);
			var content = new_entry.getElementsByClassName('content')[0];
			var content_edit = new_entry.getElementsByClassName('content_edit')[0];
			var actions = new_entry.getElementsByClassName('actions')[0];
			
			if (entries.length > 1) // No entries, avoid a loop
				this.clean();
				
			Boardo.addEvent(new_entry, 'mouseover', function() {
				if (content_edit.style.display != 'block')
					actions.style.display = ''; 
			});
			Boardo.addEvent(new_entry, 'mouseout', function() { actions.style.display = 'none'; });
			Boardo.addEvent(content, 'click', function() { Boardo.Entries.edit(new_entry); });
			Boardo.addEvent(new_entry.getElementsByClassName('action edit')[0], 'click', function() { Boardo.Entries.edit(new_entry); });
			Boardo.addEvent(new_entry.getElementsByClassName('action done')[0], 'click', function() { Boardo.Entries.done(new_entry); });
			Boardo.addEvent(content_edit, 'focusout', function() { Boardo.Entries.editDone(new_entry); });
			
			actions.style.display = 'none';
			new_entry.setAttribute('id', '');
			
			if (typeof previous_entry === 'undefined')
				entries.appendChild(new_entry);
			else
				Boardo.insertAfter(previous_entry, new_entry);
			this.edit(new_entry);
			
			content_edit.setAttribute('size', content_edit.getAttribute('placeholder').length);
			var content_edit_margin = parseInt(Boardo.getStyle(content).marginRight);
			var content_edit_default_width = parseInt(Boardo.getStyle(content_edit).width) + content_edit_margin;
			content_edit.style.width = content_edit_default_width + 'px';
			Boardo.addEvent(content_edit, 'keyup', function(e) {
				// content_edit autosize
				content.innerHTML = content_edit.value;
				content_edit.style.width = Math.max(parseInt(Boardo.getStyle(content).width) + content_edit_margin, content_edit_default_width) + 'px';
				
				// Add a new entry when Enter is pressed
				if (!e) e = window.event;
				var keyCode = e.keyCode || e.which;
				if (keyCode == '13') {
					Boardo.Entries.editDone(new_entry);
					Boardo.Entries.add(new_entry);
				}
			});
		},

		/*
		 * Start editing an entry.
		 */
		edit: function(entry) {
			var content = entry.getElementsByClassName('content')[0];
			var content_edit = entry.getElementsByClassName('content_edit')[0];
			
			content.style.visibility = 'hidden';
			content_edit.style.display = 'block';
			Boardo.focus(content_edit);
		},

		/*
		 * Finished editing an entry.
		 */
		editDone: function(entry) {
			var content = entry.getElementsByClassName('content')[0];
			var content_edit = entry.getElementsByClassName('content_edit')[0];
			
			this.undone(entry);
			this.clean();
			
			content_edit.blur();
			content.innerHTML = content_edit.value;
			content_edit.style.display = '';
			content.style.visibility = 'visible';
		},

		/*
		 * Mark an entry as done.
		 */
		done: function(entry) {
			entry.getElementsByClassName('content')[0].style.textDecoration = 'line-through';
			entry.getElementsByClassName('action done')[0].style.visibility = 'hidden';
		},

		/*
		 * Mark an entry as undone.
		 */
		undone: function(entry) {
			entry.getElementsByClassName('content')[0].style.textDecoration = '';
			entry.getElementsByClassName('action done')[0].style.visibility = 'visible';
		},

		/*
		 *	Remove all the entry with content_edit's value empty.
		 */
		clean: function() {
			var entries = document.getElementById('entries').getElementsByClassName('entry');
			for (var i = 0; i < entries.length; i++) {
				var content_edit = entries[i].getElementsByClassName('content_edit')[0];
				if (content_edit.value == '' && entries[i].id != 'entry_template')
					entries[i].parentNode.removeChild(entries[i]);
				else
					content_edit.blur();
			}
			
			if (entries.length == 1) // Automatically add a first entry
				this.add();
		}
	} // Entries
} // Boardo

Boardo.addEvent(window, "load", function() { 
	Boardo.addEvent(document.getElementById('add_entry'), "click", Boardo.Entries.add);
	Boardo.Entries.clean();
});
