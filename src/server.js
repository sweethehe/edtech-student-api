const app = require('./app');

// On définit le port d'écoute
const PORT = 3000;

// On lance le serveur
app.listen(PORT, () => {
  console.log(`Le serveur tourne sur http://localhost:${PORT} hihihi <3`);
});