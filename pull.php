<?php

header("Content-Type: text/plain; charset=UTF-8");

function shutdown() {
	$return = ob_get_flush();
	if (empty($return)) {
		echo '{"status": "reload"}';
	}
}

register_shutdown_function('shutdown');

ob_start();

if (empty($_POST['state'])) {
	exit('{"status": "error"}');
}

do {
	$dir = @scandir('saves', SCANDIR_SORT_DESCENDING);
	$i = array_search($_POST['state'], $dir);
} while ($i === 0); // While it's the last saved state
	
if ($i === false) {
	if (count($dir) === 0) {
		exit('{"status": "init"}'); // No saved state
	} else {
		$filename = $dir[0]; // Load the most recent saved state
	}
} else {
	$filename = @$dir[--$i]; // Return the next saved state
}

$state = @file_get_contents('saves/' . $filename);
if ($state === false) {
	exit('{"status": "error"}');
}

$state = addslashes($state);
echo '{"status": "' . $filename . '", "state": "' . $state . '"}';