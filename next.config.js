/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
		config.module.rules.push({
			test: /\.json5$/i,
			loader: 'json5-loader',
			type: 'javascript/auto',
		});

		// Important: return the modified config
		return config;
	},
}

module.exports = nextConfig
