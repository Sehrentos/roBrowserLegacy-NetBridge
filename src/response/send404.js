import config from '../../config.js';

const BODY = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>The localhost</title>
	</head>
	<body>
		<h1>404 Oops! We couldn't find the page you're looking for.</h1>
		<p>Don't worry, it happens to the best of us. Maybe the page was moved, or maybe it was never there in the first place. Whatever the case, we're here to help.</p>
		<p>Here are a few things you can try:</p>
		<ul>
			<li>Check the URL again to make sure it's correct.</li>
			<li>Try searching for the page using the search bar at the top of the page.</li>
			<li>Browse through our sitemap to see if you can find the page you're looking for.</li>
			<li>If you're still having trouble, contact us and we'll be happy to help.</li>
		<ul>
		<p>In the meantime, here are a few links to get you started:</p>
		<ul>
			<li>Homepage: <a href="https://${config.host}">${config.host}</a></li>
		</ul>
		<p>Thanks for your patience!</p>
	</body>
</html>`;

/**
 * Helper to send 404 - File Not Found response
 * 
 * @param {import("http").ServerResponse} response
 */
export function send404(response) {
	response.writeHead(404, {
		'Content-Length': Buffer.byteLength(BODY),
		'Content-Type': 'text/html',
		'X-Powered-By': 'Magic',
	});
	response.end(BODY, 'utf-8');
}