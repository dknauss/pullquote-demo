const EXTRACT_SELECTOR =
	'aside.wp-block-pullquote-demo-article-extract[data-article-extract="true"]';
const SCOPE_SELECTOR = '.wp-block-post-content, .entry-content, article';
const ownedHidden = new Set();

function normalizeText( text ) {
	return text.replace( /\s+/gu, ' ' ).trim();
}

function paragraphText( paragraph ) {
	if (
		paragraph.querySelector(
			'img, svg, math, video, audio, iframe, object, embed, canvas, input, textarea, select, button, script, style, template, noscript'
		)
	) {
		return null;
	}
	const copy = paragraph.cloneNode( true );
	for ( const lineBreak of copy.querySelectorAll( 'br' ) ) {
		lineBreak.replaceWith( '\n' );
	}
	return normalizeText( copy.textContent );
}

function setAttributeIfChanged( element, name, value ) {
	if ( element.getAttribute( name ) !== value ) {
		element.setAttribute( name, value );
	}
}

function expose( extract ) {
	if ( ownedHidden.has( extract ) ) {
		if ( extract.getAttribute( 'aria-hidden' ) === 'true' ) {
			extract.removeAttribute( 'aria-hidden' );
		}
		ownedHidden.delete( extract );
	}
}

function hasCustomSemantics( element, allowOwnedHidden = false ) {
	return Array.from( element.attributes ).some( ( { name } ) => {
		if ( name === 'aria-hidden' && allowOwnedHidden ) {
			return false;
		}
		return (
			name.startsWith( 'aria-' ) ||
			name.startsWith( 'on' ) ||
			[ 'role', 'title', 'tabindex', 'contenteditable' ].includes( name )
		);
	} );
}

function isPlainExtract( extract ) {
	const children = Array.from( extract.childNodes ).filter(
		( node ) =>
			node.nodeType !== 8 &&
			! ( node.nodeType === 3 && ! node.textContent.trim() )
	);
	if ( children.length !== 1 || children[ 0 ].nodeName !== 'P' ) {
		return false;
	}
	const paragraph = children[ 0 ];
	// This experiment supports plain copied text, not rich or custom content.
	if (
		paragraph.children.length ||
		paragraph.isContentEditable ||
		! normalizeText( paragraph.textContent ) ||
		hasCustomSemantics( paragraph ) ||
		hasCustomSemantics( extract, true )
	) {
		return false;
	}
	return true;
}

function hasUnsupportedContext( element, view ) {
	for ( let current = element; current; current = current.parentElement ) {
		if (
			current.hidden ||
			current.hasAttribute( 'inert' ) ||
			current.getAttribute( 'aria-hidden' )?.toLowerCase() === 'true' ||
			current.hasAttribute( 'aria-label' ) ||
			current.hasAttribute( 'aria-labelledby' ) ||
			current.hasAttribute( 'aria-describedby' ) ||
			current.hasAttribute( 'aria-details' ) ||
			current.hasAttribute( 'aria-description' ) ||
			current.hasAttribute( 'title' ) ||
			current.hasAttribute( 'role' ) ||
			( current.nodeName === 'DETAILS' && ! current.open )
		) {
			return true;
		}
		const style = view.getComputedStyle( current );
		if (
			style.display === 'none' ||
			style.visibility === 'hidden' ||
			style.visibility === 'collapse' ||
			style.contentVisibility === 'hidden'
		) {
			return true;
		}
	}
	return false;
}

function isCanonicalParagraph( paragraph, scope, view ) {
	if (
		! paragraph.isConnected ||
		paragraph.closest( SCOPE_SELECTOR ) !== scope ||
		paragraph.closest( 'aside, blockquote, [data-article-extract]' ) ||
		hasUnsupportedContext( paragraph, view ) ||
		! paragraph.getClientRects().length
	) {
		return false;
	}
	// Hidden or custom context can make textContent differ from spoken content.
	return ! Array.from( paragraph.querySelectorAll( '*' ) ).some( ( child ) =>
		hasUnsupportedContext( child, view )
	);
}

/**
 * Hide only the supported duplicate after finding one exposed article paragraph.
 * These conservative DOM checks do not model every assistive technology or CSS
 * technique. When verification is uncertain, the extract remains exposed.
 *
 * @param {Document|Element} root Root containing extracts to verify.
 */
export function verifyExtracts( root = document ) {
	const doc = root.nodeType === 9 ? root : root.ownerDocument;
	const view = doc?.defaultView;
	if ( ! view || ! root.querySelectorAll ) {
		return;
	}
	for ( const extract of ownedHidden ) {
		if ( ! extract.isConnected || ! extract.matches( EXTRACT_SELECTOR ) ) {
			expose( extract );
		}
	}
	const extracts = Array.from( root.querySelectorAll( EXTRACT_SELECTOR ) );
	if ( root.matches?.( EXTRACT_SELECTOR ) ) {
		extracts.unshift( root );
	}
	for ( const extract of extracts ) {
		const scope = extract.closest( SCOPE_SELECTOR );
		let status = 'unsupported';
		if ( scope && isPlainExtract( extract ) ) {
			const text = normalizeText( extract.firstElementChild.textContent );
			const matches = Array.from( scope.querySelectorAll( 'p' ) ).filter(
				( paragraph ) =>
					paragraphText( paragraph ) === text &&
					isCanonicalParagraph( paragraph, scope, view )
			);
			status = matches.length === 1 ? 'verified' : 'missing';
			if ( matches.length > 1 ) {
				status = 'ambiguous';
			}
		}
		if ( status === 'verified' ) {
			if ( extract.getAttribute( 'aria-hidden' ) !== 'true' ) {
				ownedHidden.add( extract );
				setAttributeIfChanged( extract, 'aria-hidden', 'true' );
			}
		} else {
			expose( extract );
		}
		setAttributeIfChanged( extract, 'data-extract-status', status );
	}
}

/**
 * Reverify when article text, relevant DOM attributes, or viewport size changes.
 * CSSOM-only changes and assistive-technology-specific behavior need separate
 * review. Returns a function that disconnects the observer and resize listener.
 *
 * @param {Document|Element} root Root containing extracts to observe.
 * @return {() => void} Stop observing this root.
 */
export function observeExtracts( root = document ) {
	const doc = root.nodeType === 9 ? root : root.ownerDocument;
	const view = doc?.defaultView;
	if ( ! view || ! doc.documentElement ) {
		return () => {};
	}
	const reverify = () => verifyExtracts( root );
	const observer = new view.MutationObserver( ( mutations ) => {
		// Ignore our own state attributes so verification cannot trigger itself.
		const relevant = mutations.some(
			( mutation ) =>
				! (
					mutation.type === 'attributes' &&
					[ 'aria-hidden', 'data-extract-status' ].includes(
						mutation.attributeName
					) &&
					mutation.target.matches( EXTRACT_SELECTOR )
				)
		);
		if ( relevant ) {
			reverify();
		}
	} );
	observer.observe( doc.documentElement, {
		subtree: true,
		childList: true,
		characterData: true,
		attributes: true,
	} );
	view.addEventListener( 'resize', reverify );
	reverify();
	return () => {
		observer.disconnect();
		view.removeEventListener( 'resize', reverify );
	};
}
