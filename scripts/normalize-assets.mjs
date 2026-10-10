import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The upstream builder emits tab-only lines for empty dependency arrays.
const directory = fileURLToPath( new URL( '../build/', import.meta.url ) );
for ( const entry of await readdir( directory, { recursive: true } ) ) {
	if ( entry.endsWith( '.asset.php' ) ) {
		const filename = path.join( directory, entry );
		const contents = await readFile( filename, 'utf8' );
		await writeFile( filename, contents.replace( /[\t ]+$/gm, '' ) );
	}
}
