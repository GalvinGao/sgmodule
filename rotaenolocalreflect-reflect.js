let savedData = $persistentStore.read("rotaenolocalreflect.CloudSave");
if (savedData) {
    $done({
        response: {
            status: 200,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: savedData
        }
    });
} else {
    $done({
        response: {
            status: 404,
            body: '{"error":"No saved data found"}'
        }
    });
}