<?php

header("Content-Type: text/plain; charset=UTF-8");

if (empty($_POST['state'])) {
	exit('error');
}

$state = $_POST['state'];
$filename = time();
if (file_put_contents('saves/' . $filename, $state) === false) {
	exit('error');
}

echo $filename;