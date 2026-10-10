import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes: { text } } ) {
	return (
		<aside { ...useBlockProps.save() } data-article-extract="true">
			<p>{ text }</p>
		</aside>
	);
}
