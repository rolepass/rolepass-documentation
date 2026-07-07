// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Rolepass',
			description:
				'Manage AWS IAM roles for CI/CD pipelines across multiple accounts using OIDC federation.',
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Introduction', slug: 'guides/introduction' },
						{ label: 'Installation', slug: 'guides/installation' },
						{ label: 'Getting Started', slug: 'guides/getting-started' },
						{ label: 'Bootstrapping AWS', slug: 'guides/bootstrapping' },
						{ label: 'GitHub Actions', slug: 'guides/github-actions' },
						{ label: 'GitLab CI', slug: 'guides/gitlab-ci' },
						{ label: 'Plan & Apply Workflow', slug: 'guides/workflow' },
						{ label: 'Best Practices', slug: 'guides/best-practices' },
					],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
