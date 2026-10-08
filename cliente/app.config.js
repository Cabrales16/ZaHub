// Extiende app.json: permite fijar la ruta base al publicar en GitHub Pages (/ZaHub/cliente).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
