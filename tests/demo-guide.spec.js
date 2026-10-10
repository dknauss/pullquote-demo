const { test, expect } = require( '@playwright/test' );
const { readFileSync } = require( 'node:fs' );
const { resolve } = require( 'node:path' );

const guidePath = resolve( __dirname, '../demo/guide/guide.js' );
const verifierUrl = `data:text/javascript;base64,${ Buffer.from(
	readFileSync(
		resolve( __dirname, '../src/article-extract/verify.js' ),
		'utf8'
	)
).toString( 'base64' ) }`;
const text = 'A whole paragraph from the article.';
const extractSelector =
	'aside.wp-block-pullquote-demo-article-extract[data-article-extract="true"]';

function article( flags = '', source = `<p id="source">${ text }</p>` ) {
	return `<article>${ source }<aside class="wp-block-pullquote-demo-article-extract" data-article-extract="true" ${ flags }><p>${ text }</p></aside><p data-pullquote-demo-status="true">Initial placeholder.</p></article>`;
}

async function loadGuide( page, html ) {
	await page.setContent( html );
	await page.addScriptTag( { path: guidePath } );
}

for ( const [ name, flags, expected, inconclusive ] of [
	[
		'verified duplicate',
		'data-extract-status="verified" aria-hidden="true"',
		[ /Original found/i, /marked to be skipped/i ],
	],
	[
		'missing original',
		'data-extract-status="missing"',
		[ /Original missing/i, /repeated panel.*reading order/i ],
	],
	[
		'ambiguous original',
		'data-extract-status="ambiguous"',
		[ /More than one original/i, /all copies/i ],
	],
	[ 'browser check pending', '', [ /browser check.*not.*run/i ] ],
	[
		'inconsistent verification flags',
		'data-extract-status="verified"',
		[ /inconclusive/i ],
		true,
	],
	[
		'hidden duplicate with no status',
		'aria-hidden="true"',
		[ /inconclusive/i ],
		true,
	],
] ) {
	test( `guide describes the actual flags for a ${ name }`, async ( {
		page,
	} ) => {
		await loadGuide( page, article( flags ) );
		const result = page.locator( '[data-pullquote-demo-status]' );
		for ( const phrase of expected ) {
			await expect( result ).toContainText( phrase );
		}
		if ( inconclusive ) {
			await expect( result ).not.toContainText( /Original found/i );
			await expect( result ).not.toContainText( /marked to be skipped/i );
		}
	} );
}

test( 'guide reads the extract within each marker article scope', async ( {
	page,
} ) => {
	await loadGuide(
		page,
		article( 'data-extract-status="verified" aria-hidden="true"' ) +
			article( 'data-extract-status="missing"', '' )
	);
	const results = page.locator( '[data-pullquote-demo-status]' );
	await expect( results.nth( 0 ) ).toContainText( /Original found/i );
	await expect( results.nth( 1 ) ).toContainText( /Original missing/i );
} );

test( 'guide reflects source loss and recovery from the actual verifier', async ( {
	page,
} ) => {
	await page.setContent( article() );
	await page.evaluate( async ( url ) => {
		const { observeExtracts } = await import( url );
		window.stopObservingExtracts = observeExtracts( document );
	}, verifierUrl );
	await page.addScriptTag( { path: guidePath } );
	const result = page.locator( '[data-pullquote-demo-status]' );
	const extract = page.locator( extractSelector );
	await expect( extract ).toHaveAttribute( 'aria-hidden', 'true' );
	await expect( result ).toContainText( /Original found/i );
	await expect( result ).toContainText( /marked to be skipped/i );
	await expect( result ).toBeVisible();
	await expect( result.locator( `xpath=ancestor::aside` ) ).toHaveCount( 0 );
	await expect( extract.locator( 'a, button, [tabindex]' ) ).toHaveCount( 0 );
	await page.locator( '#source' ).evaluate( ( source ) => source.remove() );
	await expect( extract ).not.toHaveAttribute( 'aria-hidden', 'true' );
	await expect( result ).toContainText( /Original missing/i );
	await expect( result ).toContainText( /repeated panel.*reading order/i );
	await page.evaluate( ( sourceText ) => {
		const source = document.createElement( 'p' );
		source.id = 'source';
		source.textContent = sourceText;
		document.querySelector( 'article' ).prepend( source );
	}, text );
	await expect( extract ).toHaveAttribute( 'aria-hidden', 'true' );
	await expect( result ).toContainText( /Original found/i );
	await expect( result ).toContainText( /marked to be skipped/i );
} );
