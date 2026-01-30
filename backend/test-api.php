$url = 'http://localhost:8000/api/posts/public?page=1';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
'Accept: application/json',
'Content-Type: application/json',
'Origin: http://localhost:5173'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($error) {
echo "Error: $error\n";
}
echo "Response: " . substr($response, 0, 500) . "\n";