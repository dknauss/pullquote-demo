/* eslint-disable no-console */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(
	path.dirname( fileURLToPath( import.meta.url ) ),
	'..'
);
const runtimeExtensions = new Set( [
	'.php',
	'.json',
	'.js',
	'.css',
	'.txt',
	'.svg',
] );

async function readRuntimeDirectory( directory ) {
	const files = {};
	const entries = await readdir( directory, { withFileTypes: true } );
	for ( const entry of entries.sort( ( a, b ) =>
		a.name.localeCompare( b.name )
	) ) {
		const filename = path.join( directory, entry.name );
		if ( entry.isSymbolicLink() ) {
			throw new Error(
				`Runtime files must not be symbolic links: ${ filename }`
			);
		}
		if ( entry.isDirectory() ) {
			files[ entry.name ] = await readRuntimeDirectory( filename );
		} else if (
			entry.isFile() &&
			runtimeExtensions.has( path.extname( entry.name ) )
		) {
			files[ entry.name ] = await readFile( filename, 'utf8' );
		}
	}
	return files;
}

export async function collectRuntimeFiles() {
	const files = {
		'article-extract.php': await readFile(
			path.join( projectRoot, 'article-extract.php' ),
			'utf8'
		),
		LICENSE: await readFile( path.join( projectRoot, 'LICENSE' ), 'utf8' ),
		'readme.txt': await readFile(
			path.join( projectRoot, 'readme.txt' ),
			'utf8'
		),
		build: await readRuntimeDirectory( path.join( projectRoot, 'build' ) ),
	};
	const block = files.build[ 'article-extract' ];
	if (
		! block?.[ 'block.json' ] ||
		! block[ 'index.js' ] ||
		! block[ 'index.asset.php' ]
	) {
		throw new Error(
			'The built Article Extract block is missing. Run npm run build first.'
		);
	}
	if (
		JSON.parse( block[ 'block.json' ] ).name !==
		'pullquote-demo/article-extract'
	) {
		throw new Error(
			'The build does not contain the expected Article Extract block.'
		);
	}
	return files;
}

export async function createBlueprint() {
	return {
		$schema: 'https://playground.wordpress.net/blueprint-schema.json',
		meta: {
			title: 'Article Extract: a pullquote demonstration',
			author: 'dknauss',
			description:
				'Compare WordPress Quote and Pullquote with a separate experimental Article Extract block and its visible fallback.',
			categories: [ 'Content', 'Accessibility' ],
		},
		preferredVersions: { php: '8.3', wp: 'latest' },
		landingPage: '/',
		steps: [
			{
				step: 'installPlugin',
				pluginData: {
					resource: 'literal:directory',
					name: 'pullquote-demo',
					files: await collectRuntimeFiles(),
				},
				options: { activate: true, targetFolderName: 'pullquote-demo' },
				ifAlreadyInstalled: 'overwrite',
				progress: {
					caption: 'Installing the Article Extract demonstration',
				},
			},
			{
				step: 'runPHP',
				code: await readFile(
					path.join( projectRoot, 'demo', 'seed.php' ),
					'utf8'
				),
				progress: {
					caption:
						'Creating the comparison article and fallback examples',
				},
			},
			{ step: 'login' },
		],
	};
}

async function main() {
	const flags = process.argv.slice( 2 );
	if ( flags.includes( '--help' ) ) {
		console.log( 'Usage: node scripts/create-blueprint.mjs [--smoke]' );
		console.log(
			'Writes blueprints/demo.json; --smoke also writes dist/demo-smoke.json with PHP assertions.'
		);
		return;
	}
	if ( flags.some( ( flag ) => flag !== '--smoke' ) ) {
		throw new Error(
			`Unknown argument: ${ flags.find( ( flag ) => flag !== '--smoke' ) }`
		);
	}
	const blueprint = await createBlueprint();
	await mkdir( path.join( projectRoot, 'blueprints' ), { recursive: true } );
	await writeFile(
		path.join( projectRoot, 'blueprints', 'demo.json' ),
		`${ JSON.stringify( blueprint, null, 2 ) }\n`
	);
	console.log( 'Created blueprints/demo.json from the built runtime files.' );
	if ( flags.includes( '--smoke' ) ) {
		blueprint.steps.push( {
			step: 'runPHP',
			code: await readFile(
				path.join( projectRoot, 'demo', 'smoke.php' ),
				'utf8'
			),
			progress: {
				caption: 'Checking the installed plugin and seeded content',
			},
		} );
		await mkdir( path.join( projectRoot, 'dist' ), { recursive: true } );
		await writeFile(
			path.join( projectRoot, 'dist', 'demo-smoke.json' ),
			`${ JSON.stringify( blueprint, null, 2 ) }\n`
		);
		console.log( 'Created dist/demo-smoke.json.' );
	}
}

if (
	process.argv[ 1 ] &&
	path.resolve( process.argv[ 1 ] ) === fileURLToPath( import.meta.url )
) {
	main().catch( ( error ) => {
		console.error( error.message );
		process.exitCode = 1;
	} );
}
