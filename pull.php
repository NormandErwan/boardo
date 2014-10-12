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
do {
	$dir = @array_diff(scandir('saves', SCANDIR_SORT_DESCENDING), array('..', '.'));
	$i = @array_search($_POST['state'], $dir);
} while (empty($dir) || $i === 0); // While it's the last saved state

if ($i !== false) {
	$filename = @$dir[--$i]; // Return the next saved state
} else {
	$filename = $dir[0]; // Load the most recent saved state
}

$state = @file_get_contents('saves/' . $filename);
if ($state === false) {
	exit('{"status": "error"}');
}

$state = addslashes($state);
echo '{"status": "' . $filename . '", "state": "' . $state . '"}';