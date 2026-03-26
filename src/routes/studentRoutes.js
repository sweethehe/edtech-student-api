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
    const results = students.filter(student => {
        const fName = student.firstName || "";
        const lName = student.lastName || "";
        
        return fName.toLowerCase().includes(searchTerm) || 
               lName.toLowerCase().includes(searchTerm);
    });

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


// FONCTION DE VALIDATION

const validateStudentData = (data, currentStudentId = null) => {
    // On extrait les données du Body
    const { firstName, lastName, email, grade, field } = data;
    const validFields = ["informatique", "mathématiques", "physique", "chimie"];

    // 1. Tous les champs sont obligatoires
    if (!firstName || !lastName || !email || grade === undefined || !field) {
        return { error: "Tous les champs sont obligatoires.", status: 400 };
    }
    // 2. Prénom et nom : min 2 caractères
    if (firstName.length < 2 || lastName.length < 2) {
        return { error: "Le prénom et le nom doivent faire au moins 2 caractères.", status: 400 };
    }
    // 3. Format email (avec une petite expression régulière basique)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: "Le format de l'email est invalide.", status: 400 };
    }
    // 4. Note entre 0 et 20
    if (grade < 0 || grade > 20) {
        return { error: "La note doit être comprise entre 0 et 20.", status: 400 };
    }
    // 5. Filière autorisée
    if (!validFields.includes(field)) {
        return { error: "La filière n'est pas valide.", status: 400 };
    }
    // 6. Email unique
    const emailExists = students.find(s => 
        s.email.toLowerCase() === email.toLowerCase() && 
        s.id !== currentStudentId
    );
    if (emailExists) {
        return { error: "Cet email est déjà pris.", status: 409 };
    }

    return null;
};

// ROUTE 5 : Créer un étudiant (POST /students)

router.post('/', (req, res) => {
    // On passe les données à la fonction de validation
    const validationError = validateStudentData(req.body);
    if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
    }

    // On génère un nouvel ID (le plus grand ID actuel + 1)
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    
    // On crée le nouvel étudiant et on l'ajoute au tableau
    const newStudent = { id: newId, ...req.body };
    students.push(newStudent);

    // 201 => L'etudiant à été créé avec succès
    return res.status(201).json(newStudent);
});

// ROUTE 6 : Modifier un étudiant (PUT /students/:id)

router.put('/:id', (req, res) => {
    const requestedId = parseInt(req.params.id);
    if (isNaN(requestedId)) return res.status(400).json({ error: "ID invalide." });

    // On cherche la position (l'index) de l'étudiant dans le tableau
    const studentIndex = students.findIndex(s => s.id === requestedId);
    if (studentIndex === -1) return res.status(404).json({ error: "Étudiant introuvable." });

    // On passe les données à notre douane (en lui donnant l'ID actuel pour l'histoire de l'email)
    const validationError = validateStudentData(req.body, requestedId);
    if (validationError) {
        return res.status(validationError.status).json({ error: validationError.error });
    }

    // On met à jour l'étudiant avec les nouvelles données
    students[studentIndex] = { ...students[studentIndex], ...req.body };
    return res.status(200).json(students[studentIndex]);
});

// ROUTE 7 : Supprimer un étudiant (DELETE /students/:id)

router.delete('/:id', (req, res) => {
    const requestedId = parseInt(req.params.id);
    if (isNaN(requestedId)) return res.status(400).json({ error: "ID invalide." });

    const studentIndex = students.findIndex(s => s.id === requestedId);
    if (studentIndex === -1) return res.status(404).json({ error: "Étudiant introuvable." });

    // splice(index, 1) supprime 1 élément du tableau à partir de l'index donné
    students.splice(studentIndex, 1);
    return res.status(200).json({ message: "Étudiant supprimé avec succès." });
});

// On exporte le routeur
module.exports = router;