
// make sure the request is a GET
if ($request.method !== "GET") {
    $done({});
    return;
}

let body = $response.body;
$persistentStore.write(body, "rotaenolocalreflect.CloudSave");
$done({});