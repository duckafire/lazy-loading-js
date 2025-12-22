[draw-io]: https://www.drawio.com/ "Presentation website"
[kiss]: https://en.wikipedia.org/wiki/KISS_principle
[yagni]: https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it

## Development documentation

> In cascating.

* [Flowcharts style](#flowcharts-style)
* [TypeScript code](#typescript-code)
	* [Nomainclature](#nomainclature)
	* [Design choices](#design-choices)



### Flowchart style

> Made with [draw-io][draw-io].

1. Vertical container (white): a process, with details about its working.
1. Process (gray): a process which its name is auto-explanatory.
1. Parallelogram (blue): the input/output of a process.
1. Circle/ellipse (purple): start of a chain of process.
1. Diamong (yellow): decision (change the flow).
1. Rounded rectangle:
	1. (red): bad option of a decision, a fatal error, or an exception.
	1. (green): good option of a decision.
1. Directional connector (black): points to the next step of the flow.
1. Connector with Label (black):
	1. It contains information about the goal of the flow.
	1. If from a diamond element, it represents the different result flows.
1. Connect with (Letter) Symbol (black): represents the send of an input/output.



## TypeScript code

> [KISS][kiss]; [YAGNI][yagni].



### Nomainclature

* **Compilation** time resources:
	* Case styles:
		* Interfaces: *PascalCase*.
		* Types: *PascalCase*.
	* Prefix:
		* Interfaces: `I`.
		* Types: `T`.

* **Execution** time resources:
	* Private global things: between `__LL_` and `__`.

* **Both** times resources:
	* Case styles:
		* Classes: *PascalCase*.
		* Functions, methods, variables, properties: *camelCase*.
		* Constants, enumerators, properties from enumerators: *SCREAMING_SNAKE_CASE*.



### Design choices

1. Avoid:
	1. function types (`type foo = () => void`).
	1. complex types (`type foo = Record<{[key: string]: unknown}, () => never | boolean >[]`)
	1. long unions.
	1. unions formed of different types (`string | number | boolean`), prefer unions
	  of similar values (`float | float[]`).
1. Do not use:
	1. `any`, prefer `unknown`, to avoid runtime *complications*.
	1. `undefined` (only in comparations), prefer `null`, to avoid to confuse
	   undefined properties with no-defined properties (and similar things).
	1. Enumerators, prefer frozen objects (example below).
	1. Create types to enumerators (example below).
1. Use:
	1. `private` instead `#`, to avoid compatibility problems with old browsers.

> [!NOTE]
> #### Enumerator example
>
> ```typescript
> const Stuff = Object.freeze({
> 	FOO: 0,
> 	BAR: 1,
> } as const);
>
> type TStuff = typeof Stuff[ keyof typeof Stuff ];
> ```

