<?php

function addGroup($group_name) {
    $new_id = bin2hex(random_bytes(3));
    $chat_file = getChatsPath() . $new_id . ".txt";
    $fp = fopen($chat_file, "w");
    // fwrite($fp, "user_id,timestamp,text\n");
    fclose($fp);
    $sql = "INSERT INTO groups (group_id, group_name, chat_history) VALUES ('$new_id', '$group_name', '$chat_file');";
    $conn = Database::getConnection();
    if(mysqli_query($conn, $sql)) {
        return array("success" => true,
                    "message" => "Successfully added $group_name to the groups database",
                    "group_id" => $new_id);
    } else {
        return array("success" => false,
                    "message" => "Could not add group to groups database");
    }
}

?>