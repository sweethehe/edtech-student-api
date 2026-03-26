// Initialisation de la base de données des étudiants
const initialStudents = [
  {
    id: 1,
    firstname: "Enora",
    lastName: "AMADOU",
    email: "enora@exemple.com",
    grade: 17,
    field: "informatique",
  },
  {
    id: 2,
    firstName: "Alice",
    lastName: "Dupont",
    email: "alice@exemple.com",
    grade: 14,
    field: "mathématiques",
  },
  {
    id: 3,
    firstName: "Bob",
    lastName: "Martin",
    email: "bob@exemple.com",
    grade: 9,
    field: "physique",
  },
  {
    id: 4,
    firstName: "Claire",
    lastName: "Leroy",
    email: "claire@exemple.com",
    grade: 16,
    field: "chimie",
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Garcia",
    email: "david@exemple.com",
    grade: 12,
    field: "informatique",
  },
];

// Copie de la base de données, une bd modifiable
let students = [...initialStudents];

// Fonction pour rénitialiser la base de donnée
const resetStudents = () => {
  students = [...initialStudents];
};

// Exportation des fonctions pour l'API
module.exports = {
  students,
  resetStudents
};