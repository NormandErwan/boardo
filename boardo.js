var Boardo = {

	/*
	 * Execute a function func on the element at the event.
	 */
	addEvent: function(element, event, func) {
		if (element.attachEvent) //IE
			element.attachEvent('on' + event, func);
		else
			element.addEventListener(event, func, false);
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
	
	Entries: function() {
		this.node = document.getElementById('entries');
		this.entries = this.node.getElementsByClassName('entry');
		this.entry_nodes = [];
		
		this.add = function(previous_entry) {
			var new_entry = new Boardo.Entry();
			this.entry_nodes.push(new_entry);
			
			if (this.entries.length > 1) // No entries, avoid a loop
				this.clean();
			
			Boardo.addEvent(new_entry.node, 'mouseover', function() {
				if (new_entry.content_edit.style.display != 'block')
					new_entry.actions.style.display = ''; 
			});
			Boardo.addEvent(new_entry.node, 'mouseout', function() { new_entry.actions.style.display = 'none'; });
			Boardo.addEvent(new_entry.content, 'click', function() { new_entry.edit() });
			Boardo.addEvent(new_entry.action_edit, 'click', function() { new_entry.edit() });
			Boardo.addEvent(new_entry.action_done, 'click', function() { new_entry.done() });
			Boardo.addEvent(new_entry.content_edit, 'focusout', function() { new_entry.editDone() });
			
			new_entry.actions.style.display = 'none';
			new_entry.node.setAttribute('id', '');
			
			if (typeof previous_entry === 'undefined')
				this.node.appendChild(new_entry.node);
			else
				Boardo.insertAfter(previous_entry, new_entry.node);
			
			new_entry.edit();
			
			new_entry.content_edit.setAttribute('size', new_entry.content_edit.getAttribute('placeholder').length);
			var content_edit_margin = parseInt(Boardo.getStyle(new_entry.content).marginRight);
			var content_edit_default_width = parseInt(Boardo.getStyle(new_entry.content_edit).width) + content_edit_margin;
			new_entry.content_edit.style.width = content_edit_default_width + 'px';
			Boardo.addEvent(new_entry.content_edit, 'keyup', function(e) {
				// content_edit autosize
				new_entry.content.innerHTML = new_entry.content_edit.value;
				new_entry.content_edit.style.width = Math.max(parseInt(Boardo.getStyle(new_entry.content).width) + content_edit_margin, content_edit_default_width) + 'px';
				
				// Add a new entry when Enter is pressed
				if (!e) e = window.event;
				var keyCode = e.keyCode || e.which;
				if (keyCode == '13') {
					new_entry.editDone();
					entries.add(new_entry.node);
				}
			});
		};
		
		/*
		 *	Remove all the entries with content_edit's value empty.
		 */
		this.clean = function() {
			for (var i = 0; i < this.entries.length; i++) {
				var content_edit = this.entries[i].getElementsByClassName('content_edit')[0];
				if (content_edit.value == '' && this.entries[i].id != 'entry_template')
					this.entries[i].parentNode.removeChild(this.entries[i]);
				else
					content_edit.blur();
			}
			
			if (this.entries.length == 1) // Automatically add a first entry
				this.add();
		};
	}, // Entries
	
	Entry: function() {
		this.node = document.getElementById('entry_template').cloneNode(true);
		this.content = this.node.getElementsByClassName('content')[0];
		this.content_edit = this.node.getElementsByClassName('content_edit')[0];
		this.actions = this.node.getElementsByClassName('actions')[0];
		this.action_edit = this.node.getElementsByClassName('action edit')[0];
		this.action_done = this.node.getElementsByClassName('action done')[0];

		/*
		 * Start editing the entry.
		 */
		this.edit = function() {
			this.content.style.visibility = 'hidden';
			this.content_edit.style.display = 'block';
			Boardo.focus(this.content_edit);
		}

		/*
		 * Finished editing the entry.
		 */
		this.editDone = function() {
			this.undone();
			entries.clean();
			
			this.content_edit.blur();
			this.content.innerHTML = this.content_edit.value;
			this.content_edit.style.display = '';
			this.content.style.visibility = 'visible';
		}

		/*
		 * Mark the entry as done.
		 */
		this.done = function() {
			this.content.style.textDecoration = 'line-through';
			this.action_done.style.visibility = 'hidden';
		}

		/*
		 * Mark the entry as undone.
		 */
		this.undone = function() {
			this.content.style.textDecoration = '';
			this.action_done.style.visibility = 'visible';
		}
	} // Entry
	
} // Boardo

var entries = new Boardo.Entries();

Boardo.addEvent(window, "load", function() {
	entries.clean();
	
	Boardo.addEvent(document.getElementById('add_entry'), 'click', function() { entries.add(); });
});