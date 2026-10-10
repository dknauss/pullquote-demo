const { defineConfig } = require( '@playwright/test' );

const baseURL = process.env.PLAYGROUND_URL || 'http://127.0.0.1:9400';
if (
	! [ 'localhost', '127.0.0.1', '[::1]' ].includes(
		new URL( baseURL ).hostname
	)
) {
	throw new Error(
		'WordPress editor tests may only write to a local Playground.'
	);
}

module.exports = defineConfig( {
	testDir: './tests',
	workers: 1,
	reporter: 'list',
	use: { browserName: 'chromium', baseURL, trace: 'retain-on-failure' },
	projects: [
		{
			name: 'verification',
			testMatch: [ 'verification.spec.js', 'demo-guide.spec.js' ],
		},
		{ name: 'wordpress', testMatch: 'editor.spec.js' },
	],
} );
