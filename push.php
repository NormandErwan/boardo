<?php

header("Content-Type: text/plain");

if (empty($_POST['state'])) {
    exit('-1');
}

$state = $_POST['state'];

$filename = time();

$save = fopen('saves/' . $filename, 'w');
fwrite($save, $state);
fclose($save);
 
exit('0');