<?php
// This file is generated. Do not modify it manually.
return array(
	'article-extract' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'pullquote-demo/article-extract',
		'version' => '0.1.0',
		'title' => 'Article Extract',
		'category' => 'text',
		'icon' => 'excerpt-view',
		'description' => 'Repeat an article passage as a visual highlight while preserving its original reading sequence.',
		'supports' => array(
			'html' => false,
			'color' => array(
				'text' => true,
				'background' => true
			),
			'spacing' => array(
				'margin' => true,
				'padding' => true
			),
			'typography' => array(
				'fontSize' => true,
				'lineHeight' => true
			)
		),
		'textdomain' => 'pullquote-demo',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js',
		'attributes' => array(
			'text' => array(
				'type' => 'string',
				'source' => 'text',
				'selector' => 'p',
				'default' => ''
			)
		)
	)
);
