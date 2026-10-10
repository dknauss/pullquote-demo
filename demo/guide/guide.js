/* Report the experiment's DOM decision; this guide does not verify accessibility. */
( () => {
	const scopeSelector = '.wp-block-post-content, .entry-content, article';
	const extractSelector =
		'aside.wp-block-pullquote-demo-article-extract[data-article-extract="true"]';
	const messages = {
		verified:
			'Original found. The repeated panel is marked to be skipped by assistive technology; the original stays in the reading order. Both remain visible on screen. This browser result still needs checking with a screen reader.',
		missing:
			'Original missing, changed, or unavailable. The repeated panel stays in the reading order because a single matching, visible original could not be found. It still appears on screen.',
		ambiguous:
			'More than one original found. All copies stay in the reading order because the browser cannot choose one original. The repeated panel still appears on screen.',
		unsupported:
			'Browser check cannot support this content or article layout. The repeated panel stays in the reading order. It still appears on screen.',
		pending: 'Browser check has not run. No result is available yet.',
		inconclusive:
			'Browser result inconclusive: the matching decision and omission attribute do not agree. Inspect the page with your reading tools and include this result in your feedback.',
	};

	function resultFor( marker ) {
		const scope = marker.closest( scopeSelector );
		if ( ! scope ) {
			return messages.inconclusive;
		}
		const extracts = Array.from(
			scope.querySelectorAll( extractSelector )
		).filter( ( extract ) => extract.closest( scopeSelector ) === scope );
		if ( ! extracts.length ) {
			return 'No Article Extract panel found in this article. Add one in the editor to try the experiment.';
		}
		if ( extracts.length !== 1 ) {
			return 'This guide expects one Article Extract panel. Keep one panel in this sample article to get a single test result.';
		}
		const extract = extracts[ 0 ];
		const status = extract.getAttribute( 'data-extract-status' );
		const hidden = extract.getAttribute( 'aria-hidden' ) === 'true';
		if ( status === 'verified' && hidden ) {
			return messages.verified;
		}
		if ( ! hidden ) {
			if ( ! status ) {
				return messages.pending;
			}
			if (
				[ 'missing', 'ambiguous', 'unsupported' ].includes( status )
			) {
				return messages[ status ];
			}
		}
		return messages.inconclusive;
	}

	function start() {
		const update = () => {
			for ( const marker of document.querySelectorAll(
				'[data-pullquote-demo-status]'
			) ) {
				const result = resultFor( marker );
				// Both scripts observe DOM changes; unchanged results must stay quiet.
				if ( marker.textContent !== result ) {
					marker.textContent = result;
				}
			}
		};
		new window.MutationObserver( update ).observe(
			document.documentElement,
			{
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: [
					'data-extract-status',
					'aria-hidden',
					'data-article-extract',
					'class',
				],
			}
		);
		update();
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', start, { once: true } );
	} else {
		start();
	}
} )();
