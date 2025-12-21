#!/usr/bin/env node
"use strict";

const FS   = require("fs");
const PATH = require("path");

//const TSC        = require("typescript");
const { minify } = require("terser");

const ROOT_DIR = process.cwd();
const SRC_DIR  = PATH.join(ROOT_DIR, "src");
const DIST_DIR = PATH.join(ROOT_DIR, "dist");
const TEST_DIR = PATH.join(ROOT_DIR, "tests", "dist");

const CMD = {};

const MIN_OPT = Object.freeze({
	compress: true,
	mangle: true
});

class Tag
{
	#value;
	#path;
	#isArray;

	constructor(v, p)
	{
		this.#value   = v;
		this.#path    = p ?? v;
		this.#isArray = Array.isArray(this.#path);
	}

	get()
	{
		return this.#value;
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
	trans(str)
	{
		if(str instanceof Tag)
			return str;

		for(const TAG of ["all", "dist", "test"])
			if(str === TAG)
				return this[ TAG ];

		throw new Error(`Invalid tag: "${str}" (type: ${str.constructor ? str.constructor.name : typeof str}).`);
	}
});

const list_files = (origin, names, ext) =>
{
	if(names.length === 0)
		return FS.readdirSync(origin).map(name => PATH.resolve(origin, name));

	for(let i = 0; i < names.length; i++)
		names[i] = PATH.resolve(origin, `LazyLoading${names[i]}.${ext}`);

	return names;
}

const del_dirs = (...dirs) =>
{
	for(const DIR of dirs)
	{
		if(!DIR.isArray())
		{
			if(FS.existsSync(DIR.asPath()))
				FS.rmSync( DIR.asPath(), { recursive: true });

			continue;
		}

		DIR.get().forEach(dir =>
		{
			if(FS.existsSync(dir.asPath()))
				FS.rmSync( dir.asPath(), { recursive: true });
		});
	}
};

// DECompose Compilation ARGumentS
const dec_c_args = (...args) =>
{
	return {
		dest: args.length > 0 ? args[0]       : TagsList.dist,
		name: args.length > 1 ? args.slice(1) : [],
	};
}

// alphabetic order
CMD.build = async (...args) =>
{
	args = dec_c_args(args);

	if(args.names.length === 0)
	{
		//CMD.compile(args.dest);
		await CMD.minify();
		return;
	}

	//CMD.compile( args.dest, ...args.names );
	await CMD.minify(       ...args.names );
};

CMD.clear = (...args) =>
{
	const TARGET = TagsList.trans(args[0] || TagsList.all);
	switch( TARGET.get() )
	{
		case TagsList.all.get():  del_dirs(TagsList.dist, TagsList.test); return;
		case TagsList.dist.get(): del_dirs(TagsList.dist); return;
		case TagsList.test.get(): del_dirs(TagsList.test); return;
		default: throw new Error(`Invalid target: "${TARGET}".`);
	}
};

CMD.compile = (...args) =>
{
	args = dec_c_args(args);
	console.log("WIP");
};

CMD.minify = async (...names) =>
{
	let code, result;
	const OPT = { encoding: "utf8" };

	for(const SRC of list_files(DIST_DIR, names, "js"))
	{
		code   = FS.readFileSync( SRC, OPT );
		result = await minify(code, MIN_OPT);

		if(result.error)
			throw result.error;

		FS.writeFileSync( SRC.slice(0, SRC.length - 3 ) + ".min.js", result.code, OPT );
		FS.unlinkSync( SRC );
	}
};

CMD.help = () =>
{
	console.info(
		"=== HELP ===\n" +
		" npm run <build|compile> [dist:default|test] [Image]\n" +
		" npm run clear [all:default|dist|test]\n" +
		" npm run help\n" +
		" npm run minify [Image]\n"
	);
}

CMD[ process.argv[2] ]( ...process.argv.slice(3) );
