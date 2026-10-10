import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { SelectControl, TextareaControl, Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { create } from '@wordpress/rich-text';
import './editor.scss';

const normalize = ( text ) => text.replace( /\s+/g, ' ' ).trim();

export default function Edit( { attributes: { text }, setAttributes } ) {
	const blocks = useSelect(
		( select ) => select( blockEditorStore ).getBlocks(),
		[]
	);
	const sources = blocks
		.filter( ( block ) => block.name === 'core/paragraph' )
		.map( ( block ) => ( {
			id: block.clientId,
			text: create( { html: block.attributes.content || '' } ).text,
		} ) )
		.filter(
			( source ) =>
				normalize( source.text ) && ! source.text.includes( '\uFFFC' )
		);
	const matches = sources.filter(
		( source ) => normalize( source.text ) === normalize( text )
	);
	const selected = matches.length === 1 ? matches[ 0 ].id : '';

	return (
		<div { ...useBlockProps() }>
			<div className="article-extract-editor-label">
				{ __( 'Article Extract', 'pullquote-demo' ) }
			</div>
			<SelectControl
				label={ __(
					'Choose a paragraph from this article',
					'pullquote-demo'
				) }
				value={ selected }
				options={ [
					{
						label: __( 'Select a passage…', 'pullquote-demo' ),
						value: '',
					},
					...sources.map( ( source ) => ( {
						label:
							source.text.length > 120
								? `${ source.text.slice( 0, 117 ) }…`
								: source.text,
						value: source.id,
					} ) ),
				] }
				onChange={ ( id ) => {
					const source = sources.find( ( item ) => item.id === id );
					if ( source ) {
						setAttributes( { text: source.text } );
					}
				} }
				help={ __(
					'Copy a whole paragraph as a visual highlight. Its formatting and links stay in the original passage.',
					'pullquote-demo'
				) }
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
			<TextareaControl
				label={ __( 'Extract text', 'pullquote-demo' ) }
				value={ text }
				readOnly
				rows={ 3 }
				__nextHasNoMarginBottom
			/>
			{ text && matches.length !== 1 && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'This extract no longer matches one paragraph in the article. Choose the original passage again to update it. Until a unique, visible original is found, readers can access both copies.',
						'pullquote-demo'
					) }
				</Notice>
			) }
			{ ! sources.length && (
				<Notice status="info" isDismissible={ false }>
					{ __(
						'Add a Paragraph directly to this article first, then choose it here.',
						'pullquote-demo'
					) }
				</Notice>
			) }
		</div>
	);
}
