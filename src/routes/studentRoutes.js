const express = require('express');
const router = express.Router();

// On importe la base de données
const { students } = require('../data/students');

// ROUTE 1 : Récupérer tous les étudiants (GET /students)

router.get('/', (req, res) => {
    return res.status(200).json(students);
});

// ROUTE 2 : Statistiques (GET /students/stats)

router.get('/stats', (req, res) => {
    // S'il n'y a pas d'étudiants, on renvoie des stats à zéro pour éviter les erreurs
    if (students.length === 0) {
        return res.status(200).json({
            totalStudents: 0,
            averageGrade: 0,
            studentsByField: {},
            bestStudent: null
        });
    }

    // 1. Nombre total
    const totalStudents = students.length;

    // 2. Moyenne des notes (arrondie à 2 décimales)
    // On additionne toutes les notes avec reduce, puis on divise par le total
    const sumGrades = students.reduce((total, student) => total + student.grade, 0);
    const averageGrade = parseFloat((sumGrades / totalStudents).toFixed(2));

    // 3. Nombre par filière
    const studentsByField = students.reduce((acc, student) => {
        // Si la filière existe déjà dans notre compteur, on fait +1, sinon on la crée à 1
        acc[student.field] = (acc[student.field] || 0) + 1;
        return acc;
    }, {});

    // 4. Meilleure note
    // Math.max trouve le plus grand nombre dans une liste
    const bestStudent = Math.max(...students.map(s => s.grade));

    // On renvoie l'objet complet
    return res.status(200).json({
        totalStudents,
        averageGrade,
        studentsByField,
        bestStudent
    });
});

// ROUTE 3 : Recherche (GET /students/search?q=...)

router.get('/search', (req, res) => {
    // On récupère ce qui est après le "?q="
    const q = req.query.q;

    // Règle du TP : 400 si paramètre q absent ou vide
    if (!q || q.trim() === '') {
        return res.status(400).json({ error: "Le paramètre de recherche 'q' est requis." });
    }

    // On met tout en minuscules pour que la recherche soit insensible à la casse
    const searchTerm = q.toLowerCase();

    // On filtre le tableau : on garde l'étudiant si son prénom OU son nom contient le terme
    const results = students.filter(student => 
        student.firstName.toLowerCase().includes(searchTerm) ||
        student.lastName.toLowerCase().includes(searchTerm)
    );

    return res.status(200).json(results);
});

// ROUTE 4 : Récupérer UN étudiant par son ID (GET /students/:id)

router.get('/:id', (req, res) => {
    const requestedId = req.params.id;

    if (isNaN(requestedId)) {
        return res.status(400).json({ error: "L'ID fourni n'est pas un nombre valide." });
    }

    const student = students.find(s => s.id === parseInt(requestedId));

    if (!student) {
        return res.status(404).json({ error: "Étudiant introuvable." });
    }

    return res.status(200).json(student);
});

// On exporte le routeur
module.exports = router;