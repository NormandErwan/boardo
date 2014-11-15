(function() {
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
		 * Replace and set the text of the element.
		 */
		setText: function(element, text) {
			while (element.firstChild !== null)
				element.removeChild(element.firstChild);
			element.appendChild(document.createTextNode(text));
		},
		
		/*
		 * Get the text of the element.
		 */
		getText: function(element) {
			return element.innerText || element.textContent;
		},
		
		/*
		 * Get the keyCode associated to the event e.
		 */
		keyCode: function(e) {
			if (!e) e = window.event;
			return e.keyCode || e.which;
		},
		
		/*
		 * Manage the connections with the server.
		 */
		Client: function() {			
			/*
			 * Start the client and connections to the server.
			 */
			this.start = function() {
				this.started = true;
				
				var that = this;
				var main = function(id_state) {
					if (that.started) {
						var results = function(response) {
							if (response.status === 'init') {
								setTimeout(main, 3000);
								that.entries.clean();
							} else if (response.status === 'reload') {
								setTimeout(function() { main(id_state); }, 300);
							} else if (response === 'error') {
								console.log('error');
							} else {
								setTimeout(function() { main(response.id); }, 3000);
								that.entries.parse(response.state); //TODO avoid parse after a push
							}
						}
						that.pull(id_state, results);
					}
				}
				main('');
			};
			
			/*
			 * Stop the client and the connections to the server.
			 */
			this.stop = function() {
				this.started = false;
			};
			
			/*
			 * Execute a request on the server and process the result with the callback function.
			 */
			this.requestServer = function(page, callback, argument, value) {
				if (this.started) {
					var xhr = new XMLHttpRequest();
					
					xhr.onreadystatechange = function() {
						if (xhr.readyState == 4) {
							if (xhr.status == 200 || xhr.status == 0) {
								var response = JSON.parse(xhr.responseText);
								callback(response);
							} else {
								var response = {"status": "error", "reason": "connection"};
								callback(response);
							}
						}
					}			
					
					xhr.open("POST", page, true);
					xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					xhr.send(encodeURIComponent(argument) + "=" + encodeURIComponent(value));
				}
			};
			
			/*
			 * Push to the server the specified state.
			 */
			this.push = function(state) {
				var results = function(response) {
					console.log(response);
				}
				this.requestServer('push.php', results, 'state', state);
			};
			
			/*
			 * Pull from the server the next state.
			 */
			this.pull = function(id_state, callback) {
				this.requestServer('pull.php', callback, 'id', id_state);
			};
			
			/*
			 * Constructor, initialize variables and events.
			 */
			this.entries = new Boardo.Entries(this);
			this.started = false;
			
			var that = this;
			Boardo.addEvent(window, "load", function() {	
				Boardo.addEvent(document.getElementById('add_entry'), 'click', function() { that.entries.add(); });
				//Boardo.addEvent(document.getElementById('undo'), 'click', function() { this.entries.undo(); });
				//Boardo.addEvent(document.getElementById('redo'), 'click', function() { this.entries.redo(); });
			});

		}, // Client
		
		/*
		 * Manage all the entries.
		 */
		Entries: function(client) {			
			/*
			 * Add a new entry.
			 */
			this.add = function(previous_entry, entry_content, entry_done) {
				var new_entry = new Boardo.Entry(this.client, entry_content, entry_done);
				
				// Insert the new_entry after the previous if it's provided, or append it
				var i = 0;
				while (i < this.entries.length && this.entries[i] !== previous_entry) i++;
				
				if (typeof previous_entry !== 'undefined' && this.entries[i] === previous_entry) {
					this.entries.splice(++i, 0, new_entry);
					Boardo.insertAfter(previous_entry.node, new_entry.node);
				} else {
					this.entries.push(new_entry);
					this.node.appendChild(new_entry.node);
				}				
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
				
				if (this.entries.length == 0 && what != 'all') // Automatically add a first entry
					this.add();
			};
			
			/*
			 * Return a JSON string of the entries.
			 */
			this.stringify = function() {
				var state = {'entries': []};
				for (var i = 0; i < this.entries.length; i++) {
					state.entries.push({'content': Boardo.getText(this.entries[i].content),
										'editing': (this.entries[i].action_done.style.display == 'none' ? true : false),
										'done': (this.entries[i].action_done.style.display == 'none' ? true : false)});
				}
				return JSON.stringify(state);
			};
			
			/*
			 * Update the entries from a JSON string.
			 */
			this.parse = function(state) {
				if (typeof state !== 'undefined' && typeof state.entries !== 'undefined') {
					this.autosave = false; // FIXME : this state needs to be saved but not pushed
					this.clean('all');
					for (var i = 0; i < state.entries.length; i++) {
						this.add(undefined, state.entries[i].content, state.entries[i].done);
						this.entries[i].editDone();
					}
					this.autosave = true;
					this.clean();
				}
			};
			
			/*
			 * Take a snapshot of the entries' state and save it in a history.
			 */
			this.save = function() {
				var snap = this.stringify(); 
				if (this.autosave !== false) { // TODO : find a better design to avoid undesirable save when parsing
					if (snap !== this.history[this.history.length-1]) { // Avoid duplicate states
						this.history.push(snap);
						this.head = this.history.length-1;
						this.client.push(this.history[this.head]);
					}
				}
			};
					
			/*
			 * Update the entries to their previous state, if it exits.
			 */
			this.undo = function() {
				if (this.head > 0) {
					this.head--;
					this.parse(this.history[this.head]);
				}
			};
			
			/*
			 * Update the entries to their next state, if it exits.
			 */
			this.redo = function() {
				if (this.head < this.history.length) {
					this.head++;
					this.parse(this.history[this.head]);
				}
			};
			
			/*
			 * Constructor, initialize variables and events.
			 */
			this.node = document.getElementById('entries');
			this.client = client;
			this.entries = [];
			this.history = [];
			this.head = -1; // To navigate through the entries' history
			this.autosave = true;
		
		}, // Entries
		
		/*
		 * An Entry is an editable line of text, which can be marked as done or undone.
		 */
		Entry: function(client, entry_content, entry_done) {			
			/*
			 * Start editing the entry.
			 */
			this.edit = function() {
				this.content.style.visibility = 'hidden';
				this.content_edit.style.display = 'block';
				Boardo.focus(this.content_edit);
				content_before_edit = Boardo.getText(this.content); // global variable
			};
			
			/*
			 * Update the entry when editing.
			 */
			this.editing = function(e) {
				this.contentEditAutosize();
				if (Boardo.keyCode(e) == '13') { // Add a new entry when Enter is pressed
					this.content_edit.blur();
					this.client.entries.add(this);
				}
			};
			
			/*
			 * Autosize the input content_edit.
			 */
			this.contentEditAutosize = function() {
				Boardo.setText(this.content, this.content_edit.value);
				this.content_edit.style.width = parseInt(Boardo.getStyle(this.content).width) + parseInt(Boardo.getStyle(this.content).marginRight) + 'px';
			};
			
			/*
			 * Finished to edit the entry.
			 */
			this.editDone = function() {
				Boardo.setText(this.content, this.content_edit.value);
				if (typeof content_before_edit !== 'undefined' && content_before_edit !== Boardo.getText(this.content)) {
					this.undone();
				}
				this.content_edit.blur();
				this.content_edit.style.display = '';
				this.content.style.visibility = 'visible';
			};
			
			/*
			 * Mark the entry as done.
			 */
			this.done = function() {
				this.content.style.textDecoration = 'line-through';
				this.action_done.style.display = 'none';
				this.action_undone.style.display = 'inline-block';
			};
			
			/*
			 * Mark the entry as undone.
			 */
			this.undone = function() {
				this.content.style.textDecoration = '';
				this.action_undone.style.display = 'none';
				this.action_done.style.display = 'inline-block';
			};
			
			/*
			 * Constructor, initialize variables, events and style.
			 */
			this.node = document.getElementById('entry_template').cloneNode(true);
			this.client = client;
			this.content = this.node.getElementsByClassName('content')[0];
			this.content_edit = this.node.getElementsByClassName('content_edit')[0];
			this.actions = this.node.getElementsByClassName('actions')[0];
			this.action_edit = this.node.getElementsByClassName('action edit')[0];
			this.action_done = this.node.getElementsByClassName('action done')[0];
			this.action_undone = this.node.getElementsByClassName('action undone')[0];
			
			this.node.setAttribute('id', '');
			this.actions.style.display = 'none';
			
			var that = this;
			Boardo.addEvent(this.node, 'mouseover', function() {
				if (that.content_edit.style.display != 'block')
					that.actions.style.display = ''; 
			});
			Boardo.addEvent(this.node, 'mouseout', function() { that.actions.style.display = 'none'; });
			Boardo.addEvent(this.content, 'click', function() { that.edit(); });
			Boardo.addEvent(this.action_edit, 'click', function() { that.edit(); });
			Boardo.addEvent(this.action_done, 'click', function() { that.done(); that.client.entries.save(); });
			Boardo.addEvent(this.action_undone, 'click', function() { that.undone(); that.client.entries.save(); });
			Boardo.addEvent(this.content_edit, 'blur', function() { that.editDone(); that.client.entries.save(); });
			Boardo.addEvent(this.content_edit, 'keyup', function(e) { that.editing(e); });
			
			Boardo.setText(this.content, this.content_edit.placeholder);
			this.content_edit.style.minWidth = Boardo.getStyle(this.content).width;
			this.node.style.minHeight = Boardo.getStyle(this.content).height;
			Boardo.setText(this.content, '');
			
			if (typeof entry_content !== 'undefined') {
				this.content_edit.value = entry_content;
				Boardo.setText(this.content, entry_content);
			}
			if (typeof entry_done !== 'undefined' && entry_done === true) {
				this.done();
			}
			if (typeof entry_content === 'undefined' && typeof entry_done === 'undefined') {
				this.edit();
			}
			
		} // Entry
		
	} // Boardo

	var client = new Boardo.Client();
	client.start();
	
})();