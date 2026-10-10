const { test, expect } = require( '@playwright/test' );
const { readFileSync } = require( 'node:fs' );
const { resolve } = require( 'node:path' );

const moduleSource = readFileSync(
	resolve( __dirname, '../src/article-extract/verify.js' ),
	'utf8'
);
const moduleUrl = `data:text/javascript;base64,${ Buffer.from( moduleSource ).toString( 'base64' ) }`;
const extractMarkup =
	'<aside class="wp-block-pullquote-demo-article-extract" data-article-extract="true"><p>A whole paragraph from the article.</p></aside>';

async function verify( page, html ) {
	await page.setContent( html );
	await page.evaluate( async ( url ) => {
		const { verifyExtracts } = await import( url );
		verifyExtracts( document );
	}, moduleUrl );
}

async function expectExposed( page, status ) {
	const extract = page.locator( '[data-article-extract]' );
	await expect( extract ).toHaveAttribute( 'data-extract-status', status );
	await expect( extract ).not.toHaveAttribute( 'aria-hidden', 'true' );
	await expect( page.getByRole( 'complementary' ) ).toHaveCount( 1 );
}

async function observe( page, html ) {
	await page.setContent( html );
	await page.evaluate( async ( url ) => {
		const { observeExtracts } = await import( url );
		window.stopObservingExtracts = observeExtracts( document );
	}, moduleUrl );
}

test( 'hides a plain duplicate only after a matching article paragraph is verified', async ( {
	page,
} ) => {
	await verify(
		page,
		`<article><p>A whole paragraph from the article.</p>${ extractMarkup }</article>`
	);
	const extract = page.locator( '[data-article-extract]' );
	await expect( extract ).toHaveAttribute(
		'data-extract-status',
		'verified'
	);
	await expect( extract ).toHaveAttribute( 'aria-hidden', 'true' );
	await expect( extract ).toBeVisible();
	await expect( page.getByRole( 'complementary' ) ).toHaveCount( 0 );
} );

test( 'normalizes whitespace without changing the copied words', async ( {
	page,
} ) => {
	await verify(
		page,
		`<article><p>A whole\n paragraph\tfrom the article.</p>${ extractMarkup }</article>`
	);
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'aria-hidden',
		'true'
	);
} );

test( 'matches a standard paragraph with a hard line break', async ( {
	page,
} ) => {
	await verify(
		page,
		`<article><p>A whole<br>paragraph from the article.</p>${ extractMarkup }</article>`
	);
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'data-extract-status',
		'verified'
	);
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'aria-hidden',
		'true'
	);
} );

for ( const text of [
	'a whole paragraph from the article.',
	'A whole paragraph from the article!',
	'A whole paragraph',
] ) {
	test( `does not match a different paragraph: ${ text }`, async ( {
		page,
	} ) => {
		await verify(
			page,
			`<article><p>${ text }</p>${ extractMarkup }</article>`
		);
		await expectExposed( page, 'missing' );
	} );
}

test( 'keeps an extract exposed when two canonical paragraphs match', async ( {
	page,
} ) => {
	await verify(
		page,
		`<article><p>A whole paragraph from the article.</p><p>A whole paragraph from the article.</p>${ extractMarkup }</article>`
	);
	await expectExposed( page, 'ambiguous' );
} );

test( 'does not use a paragraph from a different article', async ( {
	page,
} ) => {
	await verify(
		page,
		`<article><p>A whole paragraph from the article.</p></article><article>${ extractMarkup }</article>`
	);
	await expectExposed( page, 'missing' );
} );

test( 'does not fall back to the page when there is no article scope', async ( {
	page,
} ) => {
	await verify(
		page,
		`<p>A whole paragraph from the article.</p>${ extractMarkup }`
	);
	await expectExposed( page, 'unsupported' );
} );

test( 'uses the nearest post-content scope', async ( { page } ) => {
	await verify(
		page,
		`<article><p>A whole paragraph from the article.</p><div class="wp-block-post-content">${ extractMarkup }</div></article>`
	);
	await expectExposed( page, 'missing' );
} );

test( 'does not treat a nested article paragraph as part of its parent article', async ( {
	page,
} ) => {
	await verify(
		page,
		`<article><article><p>A whole paragraph from the article.</p></article>${ extractMarkup }</article>`
	);
	await expectExposed( page, 'missing' );
} );

for ( const [ name, source ] of [
	[ 'aside', '<aside><p>A whole paragraph from the article.</p></aside>' ],
	[
		'blockquote',
		'<blockquote><p>A whole paragraph from the article.</p></blockquote>',
	],
	[ 'another extract', extractMarkup ],
	[
		'hidden ancestor',
		'<div hidden><p>A whole paragraph from the article.</p></div>',
	],
	[
		'inert ancestor',
		'<div inert><p>A whole paragraph from the article.</p></div>',
	],
	[
		'aria-hidden ancestor',
		'<div aria-hidden="true"><p>A whole paragraph from the article.</p></div>',
	],
	[
		'CSS display hidden ancestor',
		'<div style="display:none"><p>A whole paragraph from the article.</p></div>',
	],
	[
		'CSS visibility hidden ancestor',
		'<div style="visibility:hidden"><p>A whole paragraph from the article.</p></div>',
	],
	[
		'closed details',
		'<details><summary>Read more</summary><p>A whole paragraph from the article.</p></details>',
	],
	[
		'overriding paragraph label',
		'<p aria-label="Different spoken words">A whole paragraph from the article.</p>',
	],
	[
		'overriding paragraph role',
		'<p role="img">A whole paragraph from the article.</p>',
	],
	[
		'overriding ancestor role',
		'<div role="img"><p>A whole paragraph from the article.</p></div>',
	],
	[
		'a paragraph description',
		'<p aria-description="Additional context">A whole paragraph from the article.</p>',
	],
	[
		'a paragraph description reference',
		'<p aria-describedby="context">A whole paragraph from the article.</p>',
	],
	[
		'a paragraph details reference',
		'<p aria-details="context">A whole paragraph from the article.</p>',
	],
	[
		'a linked title',
		'<p><a href="#" title="Additional context">A whole paragraph from the article.</a></p>',
	],
	[
		'overriding linked label',
		'<p><a href="#" aria-label="Different spoken words">A whole paragraph from the article.</a></p>',
	],
	[
		'hidden paragraph child',
		'<p>A whole paragraph <span hidden>from the article.</span></p>',
	],
	[
		'an embedded image',
		'<p>A whole paragraph from the article.<img alt="Additional context"></p>',
	],
] ) {
	test( `rejects a canonical paragraph with ${ name }`, async ( {
		page,
	} ) => {
		await verify(
			page,
			`<article>${ source }${ extractMarkup }</article>`
		);
		const extracts = page.locator( '[data-article-extract]' );
		await expect( extracts.last() ).toHaveAttribute(
			'data-extract-status',
			'missing'
		);
		await expect( extracts.last() ).not.toHaveAttribute(
			'aria-hidden',
			'true'
		);
	} );
}

test( 'preserves a canonical link while hiding the plain duplicate', async ( {
	page,
} ) => {
	await verify(
		page,
		`<div class="entry-content"><p>A whole <a href="https://example.com">paragraph</a> from the article.</p>${ extractMarkup }</div>`
	);
	await expect(
		page.getByRole( 'link', { name: 'paragraph' } )
	).toHaveAttribute( 'href', 'https://example.com' );
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'aria-hidden',
		'true'
	);
} );

for ( const [ name, contents ] of [
	[ 'a link', '<p>A whole <a href="#">paragraph</a> from the article.</p>' ],
	[
		'a negative tabindex',
		'<p>A whole <span tabindex="-1">paragraph</span> from the article.</p>',
	],
	[
		'a button role',
		'<p>A whole <span role="button">paragraph</span> from the article.</p>',
	],
	[
		'editable content',
		'<p contenteditable="true">A whole paragraph from the article.</p>',
	],
	[
		'an accessible description',
		'<p aria-description="Additional context">A whole paragraph from the article.</p>',
	],
	[
		'a click handler',
		'<p onclick="void(0)">A whole paragraph from the article.</p>',
	],
	[
		'a caption',
		'<p>A whole paragraph from the article.</p><footer>Commentary</footer>',
	],
	[
		'two paragraphs',
		'<p>A whole paragraph from the article.</p><p>Commentary</p>',
	],
] ) {
	test( `keeps custom extract content exposed when it contains ${ name }`, async ( {
		page,
	} ) => {
		await verify(
			page,
			`<article><p>A whole paragraph from the article.</p><aside class="wp-block-pullquote-demo-article-extract" data-article-extract="true">${ contents }</aside></article>`
		);
		await expectExposed( page, 'unsupported' );
	} );
}

test( 'restores exposure after the verified source is deleted', async ( {
	page,
} ) => {
	await verify(
		page,
		`<article><p id="source">A whole paragraph from the article.</p>${ extractMarkup }</article>`
	);
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'aria-hidden',
		'true'
	);
	await page.evaluate( async ( url ) => {
		document.querySelector( '#source' ).remove();
		const { verifyExtracts } = await import( url );
		verifyExtracts( document );
	}, moduleUrl );
	await expectExposed( page, 'missing' );
} );

test( 'keeps an extract exposed when editability is inherited from an ancestor', async ( {
	page,
} ) => {
	await verify(
		page,
		`<article contenteditable="true"><p>A whole paragraph from the article.</p>${ extractMarkup }</article>`
	);
	await expectExposed( page, 'unsupported' );
} );

for ( const [ name, mutation ] of [
	[
		'source text changes',
		"document.querySelector('#source').textContent = 'Changed words.'",
	],
	[ 'source is removed', "document.querySelector('#source').remove()" ],
	[
		'source gains hidden',
		"document.querySelector('#source').hidden = true",
	],
	[
		'source gains aria-hidden',
		"document.querySelector('#source').setAttribute('aria-hidden', 'true')",
	],
	[
		'source ancestor class hides it',
		"document.querySelector('#source-parent').className = 'concealed'",
	],
	[
		'source id changes its CSS visibility',
		"document.querySelector('#source').id = 'concealed-source'",
	],
	[
		'source gains unique descriptive context',
		"document.querySelector('#source').setAttribute('title', 'Additional context')",
	],
] ) {
	test( `observer exposes the duplicate when ${ name }`, async ( {
		page,
	} ) => {
		await observe(
			page,
			`<style>.concealed,#concealed-source{display:none}</style><article><div id="source-parent"><p id="source">A whole paragraph from the article.</p></div>${ extractMarkup }</article>`
		);
		await expect(
			page.locator( '[data-article-extract]' )
		).toHaveAttribute( 'aria-hidden', 'true' );
		await page.evaluate( ( code ) => Function( code )(), mutation );
		await expectExposed( page, 'missing' );
	} );
}

test( 'observer verifies a newly restored canonical paragraph', async ( {
	page,
} ) => {
	await observe( page, `<article>${ extractMarkup }</article>` );
	await expectExposed( page, 'missing' );
	await page.evaluate( () => {
		const source = document.createElement( 'p' );
		source.textContent = 'A whole paragraph from the article.';
		document.querySelector( 'article' ).prepend( source );
	} );
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'aria-hidden',
		'true'
	);
} );

test( 'observer rechecks CSS source visibility after a viewport resize', async ( {
	page,
} ) => {
	await page.setViewportSize( { width: 900, height: 600 } );
	await observe(
		page,
		`<style>@media(max-width:600px){#source{display:none}}</style><article><p id="source">A whole paragraph from the article.</p>${ extractMarkup }</article>`
	);
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'aria-hidden',
		'true'
	);
	await page.setViewportSize( { width: 500, height: 600 } );
	await expectExposed( page, 'missing' );
} );
