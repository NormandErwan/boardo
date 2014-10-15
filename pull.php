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
	$i = @array_search($_POST['id'], $dir);
	
	if ($i === 0) {
		sleep(0.5);
	}
} while (!empty($dir) && $i === 0); // While the requested state is the last saved

if (!empty($i)) {
	$next = @$dir[--$i]; // Return the next saved state
} else if (!empty($dir)) {
	$next = $dir[0]; // Load the most recent saved state
} else {
	exit('{"status": "init"}'); // There is no saved states
}

$state = @file_get_contents('saves/' . $next);
if ($state === false) {
	exit('{"status": "error"}');
}

$state = str_replace(array('\\', '"'), array('\\\\', '\"'), $state);
echo '{"status": "success", "id": "' . $next . '", "state": "' . $state . '"}';