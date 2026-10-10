import { observeExtracts } from './verify';

// The editor keeps its controls and extract text exposed to assistive technology.
function enhanceArticleExtracts() {
	observeExtracts( document );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', enhanceArticleExtracts, {
		once: true,
	} );
} else {
	enhanceArticleExtracts();
}
