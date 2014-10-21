<?php

header("Content-Type: application/json; charset=UTF-8");

function shutdown() {
	$return = ob_get_clean();
	
	if (!empty($GLOBALS['return']) && $GLOBALS['return'] === true && !empty($return)) {
		echo $return;
	} else {
		echo '{"status": "reload"}';
	}
}

$GLOBALS['return'] = false;

register_shutdown_function('shutdown');

ob_start();

do {
	$dir = @array_diff(scandir('saves', SCANDIR_SORT_DESCENDING), array('..', '.'));
	$i = @array_search($_POST['id'], $dir);
	
	if ($i === 0) {
		sleep(0.3);
	}
} while (!empty($dir) && $i === 0); // While the requested state is the last saved

if (!empty($i)) {
	$next = @$dir[--$i]; // Return the next saved state
} else if (!empty($dir)) {
	$next = $dir[0]; // Load the most recent saved state
} else {
	$GLOBALS['return'] = true;
	exit('{"status": "init"}'); // There is no saved states
}

$state = @file_get_contents('saves/' . $next);
if ($state === false) {
	$GLOBALS['return'] = true;
	exit('{"status": "error"}');
}

$GLOBALS['return'] = true;
echo '{"status": "success", "id": "' . $next . '", "state": ' . $state . '}';