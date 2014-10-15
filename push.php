<?php

header("Content-Type: text/plain; charset=UTF-8");

if (empty($_POST['state'])) {
	exit('{"status": "error"}');
}

$state = $_POST['state'];
$id = time();
if (file_put_contents('saves/' . $id, $state) === false) {
	exit('{"status": "error"}');
}

echo '{"status": "success", "id": "' . $next . '"}';