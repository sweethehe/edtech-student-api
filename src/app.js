const express = require('express');

// On initialise l'application Express
const app = express();

// On dit à Express de comprendre le format JSON
app.use(express.json());

// On importe nos futures routes
const studentRoutes = 
// On dit à Express que toutes les requêtes commençant par /students doivent être gérées par studentRoutes
app.use('/students', studentRoutes);

// On exporte l'application pour pouvoir l'utiliser dans d'autres fichiers
module.exports = app;