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
	 * Focus hack : focus at the end of the input.
	 */
	focus: function(input) {
		input.focus();
		input.value = input.value;
	},
	
	/*
	 *
	 */
	setText: function(element, text) {
		while (element.firstChild !== null)
			element.removeChild(element.firstChild);
		element.appendChild(document.createTextNode(text));
	},
	
	/*
	 * Manage all the entries.
	 */
	Entries: function() {
		this.node = document.getElementById('entries');
		this.entries = [];
		
		/*
		 * Add a new entry.
		 */
		this.add = function(previous_entry) {
			var new_entry = new Boardo.Entry();
			
			// Insert the new_entry after the previous, if it's provided, or push it
			var i = 0;
			while (i < this.entries.length && this.entries[i] !== previous_entry) i++;
			if (typeof previous_entry != 'undefined' && this.entries[i] === previous_entry) {
				this.entries.splice(++i, 0, new_entry);
				Boardo.insertAfter(previous_entry.node, new_entry.node);
			} else {
				this.entries.push(new_entry);
				this.node.appendChild(new_entry.node);
			}				
			
			new_entry.configure();
			new_entry.edit();
		};
		
		/*
		 * Remove all the entries with content_edit's value empty.
		 */
		this.clean = function(what) {
			var entry_nodes = this.node.getElementsByClassName('entry');
			var that = this;
			
			for (var i = 0; i < entry_nodes.length; i++) {
				var content_edit = entry_nodes[i].getElementsByClassName('content_edit')[0];
				if ((what == 'all' || content_edit.value == '') && entry_nodes[i].id != 'entry_template') {
					entry_nodes[i].parentNode.removeChild(entry_nodes[i]);
					i--;
					that.entries.splice(i,1);
				} else
					content_edit.blur();
			}
			
			if (this.entries.length == 0) // Automatically add a first entry
				this.add();
		};
		
		/*
		 * Return a JSON string of the entries.
		 */
		this.stringify = function() {
			var json = {'entries': []};
			for (var i = 0; i < this.entries.length; i++) {
				json.entries.push({'content': this.entries[i].content.textContent || this.entries[i].content.innerText,
								   'done': (this.entries[i].action_done.style.visibility == 'hidden' ? true : false)});
			}
			return JSON.stringify(json);
		};
		
		/*
		 * Update entries from a JSON string.
		 */
		this.parse = function(json) {
			json = JSON.parse(json);
			if (json) {
				this.clean('all');
			}
		};
		
	}, // Entries
	
	/*
	 * An entry is an editable line of text, which can be marked as done or undone.
	 */
	Entry: function() {
		this.node = document.getElementById('entry_template').cloneNode(true);
		this.content = this.node.getElementsByClassName('content')[0];
		this.content_edit = this.node.getElementsByClassName('content_edit')[0];
		this.actions = this.node.getElementsByClassName('actions')[0];
		this.action_edit = this.node.getElementsByClassName('action edit')[0];
		this.action_done = this.node.getElementsByClassName('action done')[0];
		
		/*
		 * Configure events, style and some variables of the entry. Expected to be called only once.
		 */
		this.configure = function() {
			var that = this;
			Boardo.addEvent(this.node, 'mouseover', function() {
				if (that.content_edit.style.display != 'block')
					that.actions.style.display = ''; 
			});
			Boardo.addEvent(this.node, 'mouseout', function() { that.actions.style.display = 'none'; });
			Boardo.addEvent(this.content, 'click', function() { that.edit(); });
			Boardo.addEvent(this.action_edit, 'click', function() { that.edit(); });
			Boardo.addEvent(this.action_done, 'click', function() { that.done(); });
			Boardo.addEvent(this.content_edit, 'focusout', function() { that.editDone(); });
			Boardo.addEvent(this.content_edit, 'keyup', function(e) { that.editing(e); });
			
			Boardo.setText(this.content, this.content_edit.getAttribute('placeholder'));
			this.content_edit_margin = parseInt(Boardo.getStyle(this.content).marginRight);
			this.content_edit_default_width = parseInt(Boardo.getStyle(this.content_edit).width) + this.content_edit_margin;
			
			this.actions.style.display = 'none';
			this.node.setAttribute('id', '');
		}

		/*
		 * Start editing the entry.
		 */
		this.edit = function() {
			this.content.style.visibility = 'hidden';
			this.content_edit.style.display = 'block';
			Boardo.focus(this.content_edit);
		};
		
		/*
		 * Update the entry when enditing.
		 */
		this.editing = function(e) {
			// Content_edit autosize
			Boardo.setText(this.content, this.content_edit.value || this.content_edit.getAttribute('placeholder'));
			this.content_edit.style.width = Math.max(parseInt(Boardo.getStyle(this.content).width) + this.content_edit_margin, this.content_edit_default_width) + 'px';
			
			// Add a new entry when Enter is pressed
			if (!e) e = window.event;
			var keyCode = e.keyCode || e.which;
			if (keyCode == '13') {
				this.editDone();
				entries.add(this);
			}
		};
		
		/*
		 * Finish editing the entry.
		 */
		this.editDone = function() {
			this.undone();
			entries.clean();
			
			this.content_edit.blur();
			Boardo.setText(this.content, this.content_edit.value);
			this.content_edit.style.display = '';
			this.content.style.visibility = 'visible';
		};

		/*
		 * Mark the entry as done.
		 */
		this.done = function() {
			this.content.style.textDecoration = 'line-through';
			this.action_done.style.visibility = 'hidden';
		};

		/*
		 * Mark the entry as undone.
		 */
		this.undone = function() {
			this.content.style.textDecoration = '';
			this.action_done.style.visibility = 'visible';
		};
	} // Entry
	
} // Boardo


var entries = new Boardo.Entries();

Boardo.addEvent(window, "load", function() {
	entries.clean();
	
	Boardo.addEvent(document.getElementById('add_entry'), 'click', function() { entries.add(); });
});