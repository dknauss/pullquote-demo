/* eslint-disable no-console */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Ajv from 'ajv';
import { projectRoot } from './create-blueprint.mjs';

const schemaUrl = 'https://playground.wordpress.net/blueprint-schema.json';
const response = await fetch( schemaUrl, {
	signal: AbortSignal.timeout( 30000 ),
} );
if ( ! response.ok ) {
	throw new Error(
		`Could not fetch the official Blueprint schema: HTTP ${ response.status }`
	);
}
const validate = new Ajv( { strict: false, allErrors: true } ).compile(
	await response.json()
);
const filenames = process.argv.slice( 2 );
for ( const filename of filenames.length
	? filenames
	: [ 'blueprints/demo.json' ] ) {
	const blueprint = JSON.parse(
		await readFile( path.resolve( projectRoot, filename ), 'utf8' )
	);
	if ( ! validate( blueprint ) ) {
		console.error( `Blueprint schema validation failed: ${ filename }` );
		console.error( JSON.stringify( validate.errors, null, 2 ) );
		process.exitCode = 1;
	} else {
		console.log(
			`Validated ${ filename } against the current official Blueprint schema.`
		);
	}
}
