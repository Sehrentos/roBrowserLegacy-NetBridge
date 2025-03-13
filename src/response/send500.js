const BODY = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>The localhost</title>
	</head>
	<body>
		<h1>500 Uh oh! Something went wrong on our end.</h1>
		<p>We're working hard to fix the problem, and we'll be back up and running as soon as possible. In the meantime, please try refreshing the page, or coming back later.</p>
		<p>If you continue to see this error, please contact us and we'll be happy to help.</p>
		<p>In the meantime, here are a few things you can do:</p>
		<ul>
			<li>Check our social media pages for updates on the outage.</li>
			<li>Sign up for our email list to be notified when the problem is fixed.</li>
			<li>Try browsing a different website.</li>
		</ul>
		<p>We apologize for any inconvenience this may cause.</p>
	</body>
</html>`;

/**
 * Helper to send 500 - Internal Server Error response
 * 
 * @param {import("http").ServerResponse} response
 */
export function send500(response) {
    response.writeHead(500, {
        'Content-Length': Buffer.byteLength(BODY),
        'Content-Type': 'text/html',
        'X-Powered-By': 'Magic',
    });
    response.end(BODY, 'utf-8');
}