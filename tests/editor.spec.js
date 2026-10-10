const { test, expect } = require( '@playwright/test' );

test( 'an explicitly selected paragraph survives saving and reloading as an accessible fallback', async ( {
	page,
	browser,
} ) => {
	await page.goto( '/wp-admin/post-new.php?post_type=page' );
	if ( await page.locator( '#user_login' ).isVisible() ) {
		await page.locator( '#user_login' ).fill( 'admin' );
		await page.locator( '#user_pass' ).fill( 'password' );
		await page.locator( '#wp-submit' ).click();
	}
	await page.waitForFunction( () =>
		window.wp?.data?.select( 'core/block-editor' )
	);
	const paragraph =
		'The original passage stays in the article when its visual extract is created.';
	const ids = await page.evaluate( ( text ) => {
		const source = wp.blocks.createBlock( 'core/paragraph', {
			content: text,
		} );
		const extract = wp.blocks.createBlock(
			'pullquote-demo/article-extract'
		);
		wp.data
			.dispatch( 'core/block-editor' )
			.resetBlocks( [ source, extract ] );
		wp.data.dispatch( 'core/block-editor' ).selectBlock( extract.clientId );
		return { source: source.clientId, extract: extract.clientId };
	}, paragraph );
	const canvas = page.frameLocator( 'iframe[name="editor-canvas"]' );
	await canvas
		.getByLabel( 'Choose a paragraph from this article' )
		.selectOption( ids.source );
	await expect( canvas.getByLabel( 'Extract text' ) ).toHaveValue(
		paragraph
	);
	const result = await page.evaluate( async () => {
		wp.data.dispatch( 'core/editor' ).editPost( {
			title: 'Extract save and reload check',
			status: 'publish',
		} );
		await wp.data.dispatch( 'core/editor' ).savePost();
		return {
			id: wp.data.select( 'core/editor' ).getCurrentPostId(),
			content: wp.data.select( 'core/editor' ).getEditedPostContent(),
			pullquoteAvailable: Boolean(
				wp.blocks.getBlockType( 'core/pullquote' )
			),
		};
	} );
	expect( result.pullquoteAvailable ).toBe( true );
	expect( result.content ).toContain(
		'<aside class="wp-block-pullquote-demo-article-extract" data-article-extract="true">'
	);
	expect( result.content ).not.toContain( 'aria-hidden' );
	await page.goto( `/wp-admin/post.php?post=${ result.id }&action=edit` );
	await page.waitForFunction(
		() => wp.data.select( 'core/block-editor' ).getBlocks().length > 0
	);
	const saved = await page.evaluate( () =>
		wp.data
			.select( 'core/block-editor' )
			.getBlocks()
			.find(
				( block ) => block.name === 'pullquote-demo/article-extract'
			)
	);
	expect( saved.isValid ).toBe( true );
	expect( saved.attributes.text ).toBe( paragraph );
	await page.goto( `/?page_id=${ result.id }` );
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'aria-hidden',
		'true'
	);
	const fallbackContext = await browser.newContext( {
		javaScriptEnabled: false,
	} );
	const fallbackPage = await fallbackContext.newPage();
	await fallbackPage.goto( page.url() );
	await expect(
		fallbackPage.locator( '[data-article-extract]' )
	).toBeVisible();
	await expect(
		fallbackPage.locator( '[data-article-extract]' )
	).not.toHaveAttribute( 'aria-hidden', 'true' );
	await fallbackContext.close();
} );

test( 'an author can recopy revised text while original formatting and links remain intact', async ( {
	page,
} ) => {
	await page.goto( '/wp-admin/post-new.php?post_type=page' );
	if ( await page.locator( '#user_login' ).isVisible() ) {
		await page.locator( '#user_login' ).fill( 'admin' );
		await page.locator( '#user_pass' ).fill( 'password' );
		await page.locator( '#wp-submit' ).click();
	}
	await page.waitForFunction( () =>
		window.wp?.data?.select( 'core/block-editor' )
	);
	const ids = await page.evaluate( () => {
		const source = wp.blocks.createBlock( 'core/paragraph', {
			content:
				'A <strong>well-supported</strong> <a href="https://example.org/">article</a> passage.',
		} );
		const extract = wp.blocks.createBlock(
			'pullquote-demo/article-extract'
		);
		wp.data
			.dispatch( 'core/block-editor' )
			.resetBlocks( [ source, extract ] );
		wp.data.dispatch( 'core/block-editor' ).selectBlock( extract.clientId );
		return { source: source.clientId };
	} );
	const canvas = page.frameLocator( 'iframe[name="editor-canvas"]' );
	const selection = canvas.getByLabel(
		'Choose a paragraph from this article'
	);
	await selection.selectOption( ids.source );
	await expect( canvas.getByLabel( 'Extract text' ) ).toHaveValue(
		'A well-supported article passage.'
	);
	await page.evaluate(
		( id ) =>
			wp.data.dispatch( 'core/block-editor' ).updateBlockAttributes( id, {
				content:
					'A <strong>revised</strong> <a href="https://example.org/">article</a> passage.',
			} ),
		ids.source
	);
	await expect(
		canvas.getByText( /This extract no longer matches one paragraph/ )
	).toBeVisible();
	await selection.selectOption( ids.source );
	await expect( canvas.getByLabel( 'Extract text' ) ).toHaveValue(
		'A revised article passage.'
	);
	const saved = await page.evaluate( async () => {
		wp.data.dispatch( 'core/editor' ).editPost( {
			title: 'Rich source and explicit recopy',
			status: 'publish',
		} );
		await wp.data.dispatch( 'core/editor' ).savePost();
		return {
			id: wp.data.select( 'core/editor' ).getCurrentPostId(),
			content: wp.data.select( 'core/editor' ).getEditedPostContent(),
		};
	} );
	expect( saved.content ).toContain( '<strong>revised</strong>' );
	expect( saved.content ).toContain(
		'<a href="https://example.org/">article</a>'
	);
	expect( saved.content ).toContain(
		'<p>A revised article passage.</p></aside>'
	);
	await page.goto( `/?page_id=${ saved.id }` );
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'aria-hidden',
		'true'
	);
	await expect(
		page.getByRole( 'link', { name: 'article', exact: true } )
	).toHaveAttribute( 'href', 'https://example.org/' );
} );

test( 'the Blueprint preserves valid core blocks and exposes its fallback examples', async ( {
	page,
	browser,
} ) => {
	await page.goto( '/' );
	const editorURL = await page
		.getByRole( 'link', {
			name: 'Edit this comparison article',
			exact: true,
		} )
		.getAttribute( 'href' );
	const sitePrefix = editorURL.split( '/wp-admin/' )[ 0 ];
	for ( const label of [
		'Open the missing-source example',
		'the ambiguous-source example',
	] ) {
		await expect(
			page.getByRole( 'link', { name: label, exact: true } )
		).toHaveAttribute( 'href', new RegExp( `^${ sitePrefix }/` ) );
	}
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'data-extract-status',
		'verified'
	);
	await expect(
		page.locator( '[data-pullquote-demo-status]' )
	).toContainText( 'Original found' );
	await expect(
		page.locator( '[data-pullquote-demo-status]' )
	).toContainText( 'marked to be skipped' );
	await expect( page.locator( '[data-article-extract]' ) ).toBeVisible();
	await expect( page.locator( '.wp-block-quote' ) ).toBeVisible();
	await expect(
		page.locator( '.wp-block-pullquote > blockquote' )
	).toBeVisible();
	await expect( page.locator( 'aside.wp-block-group' ) ).not.toHaveAttribute(
		'aria-hidden',
		'true'
	);
	await page
		.getByRole( 'link', { name: 'Open the missing-source example' } )
		.click();
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'data-extract-status',
		'missing'
	);
	await expect(
		page.locator( '[data-article-extract]' )
	).not.toHaveAttribute( 'aria-hidden', 'true' );
	await expect(
		page.locator( '[data-pullquote-demo-status]' )
	).toContainText( 'Original missing' );
	await expect(
		page.getByRole( 'link', {
			name: 'Return to the comparison article',
			exact: true,
		} )
	).toHaveAttribute( 'href', `${ sitePrefix }/` );
	await expect(
		page.getByRole( 'link', {
			name: 'open the ambiguous-source example',
			exact: true,
		} )
	).toHaveAttribute( 'href', new RegExp( `^${ sitePrefix }/` ) );
	await page.goto( '/' );
	await page
		.getByRole( 'link', { name: 'the ambiguous-source example' } )
		.click();
	await expect( page.locator( '[data-article-extract]' ) ).toHaveAttribute(
		'data-extract-status',
		'ambiguous'
	);
	await expect(
		page.locator( '[data-article-extract]' )
	).not.toHaveAttribute( 'aria-hidden', 'true' );
	await expect(
		page.locator( '[data-pullquote-demo-status]' )
	).toContainText( 'More than one original' );
	const fallbackContext = await browser.newContext( {
		javaScriptEnabled: false,
	} );
	const fallbackPage = await fallbackContext.newPage();
	await fallbackPage.goto( '/' );
	await expect(
		fallbackPage.locator( '[data-pullquote-demo-status]' )
	).toContainText( 'If JavaScript is disabled' );
	await expect(
		fallbackPage.locator( '[data-article-extract]' )
	).toBeVisible();
	await fallbackContext.close();
	await page.goto( editorURL );
	await page.waitForFunction(
		() =>
			window.wp?.data?.select( 'core/block-editor' )?.getBlocks().length >
			0
	);
	const invalid = await page.evaluate( () => {
		const walk = ( blocks ) =>
			blocks.flatMap( ( block ) => [
				...( ! block.isValid ? [ block.name ] : [] ),
				...walk( block.innerBlocks ),
			] );
		return walk( wp.data.select( 'core/block-editor' ).getBlocks() );
	} );
	expect( invalid ).toEqual( [] );
} );
