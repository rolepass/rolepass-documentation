# Rolepass Documentation

This repository contains the source for [rolepass.dev](https://rolepass.dev), the documentation site for [Rolepass](https://github.com/rolepass/rolepass).

The site is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## Development

Install [bun](https://bun.sh), then:

| Command           | Action                                         |
|:------------------|:-----------------------------------------------|
| `bun install`     | Install dependencies                           |
| `bun dev`         | Start the local dev server at `localhost:4321` |
| `bun run build`   | Build the production site to `./dist/`         |
| `bun run preview` | Preview the production build locally           |

## Editing content

All pages are Markdown/MDX files in `src/content/docs/`:

- `guides/` - narrative guides (introduction, installation, CI setup, …)
- `reference/` - reference material (CLI, config file formats)

Each file maps to a route based on its path, e.g. `src/content/docs/guides/installation.md` becomes `/guides/installation/`. Guide pages are ordered explicitly in the `sidebar` section of `astro.config.mjs`; reference pages are picked up automatically.

Changes merged to `main` are deployed automatically.

## License

[MIT](./LICENSE)
