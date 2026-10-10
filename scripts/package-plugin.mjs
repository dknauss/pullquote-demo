/* eslint-disable no-console */
import { mkdir, mkdtemp, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { collectRuntimeFiles, projectRoot } from './create-blueprint.mjs';

const archiveDate = new Date( '2026-01-01T00:00:00Z' );

async function writeTree( directory, files ) {
	await mkdir( directory, { recursive: true } );
	for ( const [ name, contents ] of Object.entries( files ) ) {
		const filename = path.join( directory, name );
		if ( typeof contents === 'string' ) {
			await writeFile( filename, contents );
			await utimes( filename, archiveDate, archiveDate );
		} else {
			await writeTree( filename, contents );
		}
	}
	await utimes( directory, archiveDate, archiveDate );
}

const staging = await mkdtemp(
	path.join( tmpdir(), 'pullquote-demo-package-' )
);
try {
	const destination = path.join( projectRoot, 'dist', 'pullquote-demo.zip' );
	await writeTree(
		path.join( staging, 'pullquote-demo' ),
		await collectRuntimeFiles()
	);
	await mkdir( path.dirname( destination ), { recursive: true } );
	await rm( destination, { force: true } );
	const result = spawnSync(
		'zip',
		[ '-q', '-X', '-r', destination, 'pullquote-demo' ],
		{
			cwd: staging,
			encoding: 'utf8',
		}
	);
	if ( result.error || result.status !== 0 ) {
		throw (
			result.error ??
			new Error( result.stderr || 'Could not create the plugin ZIP.' )
		);
	}
	const check = spawnSync( 'unzip', [ '-tq', destination ], {
		encoding: 'utf8',
	} );
	if ( check.error || check.status !== 0 ) {
		throw (
			check.error ??
			new Error( check.stderr || 'The plugin ZIP did not validate.' )
		);
	}
	console.log(
		'Created dist/pullquote-demo.zip with plugin PHP, license, readme, and built runtime assets.'
	);
} finally {
	await rm( staging, { recursive: true, force: true } );
}
