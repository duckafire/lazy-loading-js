#!/usr/bin/env node
"use strict";

const FS   = require("fs");
const PATH = require("path");
const TSC  = require("typescript")

//const TSC        = require("typescript");
const { minify } = require("terser");

const ROOT_DIR = process.cwd();
const SRC_DIR  = PATH.join(ROOT_DIR, "src");
const DIST_DIR = PATH.join(ROOT_DIR, "dist");
const TEST_DIR = PATH.join(ROOT_DIR, "tests", "dist");

const CMD = {};

class Getter
{
	#value;

	constructor(v)
	{
		this.#value = Object.freeze(v);
	}

	get()
	{
		return this.#value;
	}
}

class Tag extends Getter
{
	#path;
	#isArray;

	constructor(v, p)
	{
		super(v);
		this.#path    = p ?? v;
		this.#isArray = Array.isArray(this.#path);
	}

	isArray()
	{
		return this.#isArray;
	}

	asPath(dir)
	{
		dir = dir ?? "";

		if(this.#isArray)
			return this.#path.map(name => PATH.resolve(dir, name));
		else
			return PATH.resolve(dir ?? "", this.#path);
	}
}

const TagsList = Object.freeze({
	all:  Object.freeze(new Tag("all"), ["dist", "tests/libs"]),
	dist: Object.freeze(new Tag("dist")),
	test: Object.freeze(new Tag("test", "tests/libs")),

	// TRANSform
	trans(str, fallback)
	{
		if(str instanceof Tag)
			return str;

		for(const TAG of ["all", "dist", "test"])
			if(str === TAG)
				return this[ TAG ];

		if(fallback !== undefined)
			return fallback;

		throw new Error(`Invalid tag: "${str}" (type: ${str != undefined ? str.constructor.name : str}).`);
	},

	equals(str, tag)
	{
		if(!str || !tag)
			return false;

		return TagsList.trans(str).get() === tag.get();
	},
});

const rmdir = (dir) =>
{
	dir = dir.asPath();

	if(FS.existsSync(dir))
		FS.rmSync(dir, {recursive: true});
};

const del_dirs = (...dirs) =>
{
	for(const DIR of dirs)
	{
		if(DIR.isArray())
			DIR.get().forEach( dir => rmdir(DIR) );
		else
			rmdir(DIR);
	}
};

// ALPHABETIC ORDER
CMD.build = async (dest) =>
{
	CMD.compile(dest);

	if(!TagsList.equals( dest, TagsList.test ))
		await CMD.minify();
};

CMD.clear = (tag) =>
{
	const TARGET = TagsList.trans(tag, TagsList.all);
	switch( TARGET.get() )
	{
		case TagsList.all.get():  del_dirs(TagsList.dist, TagsList.test); return;
		case TagsList.dist.get(): del_dirs(TagsList.dist); return;
		case TagsList.test.get(): del_dirs(TagsList.test); return;
		default: throw new Error(`Invalid target: "${TARGET}".`);
	}
};

CMD.compile = (dest) =>
{
	const DEST_PATH = TagsList.trans(dest, TagsList.dist).asPath();

	if(!FS.existsSync( DEST_PATH ))
		FS.mkdirSync(  DEST_PATH );

	const PARSED_CONFIG = TSC.parseJsonConfigFileContent(
		TSC.readConfigFile(
			PATH.resolve("tsconfig.json"),
			TSC.sys.readFile
		).config,
		TSC.sys,
		ROOT_DIR
	);

	PARSED_CONFIG.options.outDir = DEST_PATH;

	const PROGRAM = TSC.createProgram(
		PARSED_CONFIG.fileNames,
		PARSED_CONFIG.options,
		TSC.createCompilerHost(PARSED_CONFIG.options),
	);

	const DIAG = TSC.getPreEmitDiagnostics(PROGRAM)
		.concat(PROGRAM.emit().diagnostics);

	if(!DIAG.length)
		return;

	throw TSC.formatDiagnosticsWithColorAndContext(
		DIAG,
		{
			getCurrentDirectory: TSC.sys.getCurrentDirectory,
			getCanonicalFileName: f => f,
			getNewLine: () => TSC.sys.newLine,
		}
	);
};

CMD.minify = async () =>
{
	let code, result, srcPath;
	const OPT = { encoding: "utf8" };

	for(const SRC of FS.readdirSync( DIST_DIR ))
	{
		srcPath = PATH.resolve(DIST_DIR, SRC);

		code   = FS.readFileSync( srcPath, OPT );
		result = await minify(code, { compress: true, mangle: true });

		if(result.error)
			throw result.error;

		FS.writeFileSync( PATH.resolve(DIST_DIR, SRC.slice(0, SRC.length - 2 ) + "min.js"), result.code, OPT );
		FS.unlinkSync( srcPath );
	}
};

CMD.help = () =>
{
	console.info(
		"=== HELP ===\n" +
		" npm run <build|compile> [dist:default|test]\n" +
		" npm run clear [all:default|dist|test]\n" +
		" npm run <help|minify>\n"
	);
};

CMD[ process.argv[2] ]( process.argv[3] );
