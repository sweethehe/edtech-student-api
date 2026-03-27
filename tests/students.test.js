const request = require('supertest');
const app = require('../src/app');
const { students, resetStudents } = require('../src/data/students');

// Avant CHAQUE test, on remet la base de données à zéro
beforeEach(() => {
    resetStudents();
});

// TESTS GET
describe('GET /students - Tests de lecture', () => {

    it('1. doit renvoyer 200 et un tableau', async () => {
        const response = await request(app).get('/students');
        
        // On vérifie que le code de statut est bien 200
        expect(response.statusCode).toBe(200);

        // On vérifie que la réponse est bien un tableau (Array)
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('2. doit renvoyer tous les étudiants initiaux (5 étudiants)', async () => {
        const response = await request(app).get('/students');

        expect(response.body.length).toBe(5);
    });

    it('3. GET /students/:id valide doit renvoyer l\'étudiant correspondant', async () => {
        const response = await request(app).get('/students/1');
        
        expect(response.statusCode).toBe(200);

        expect(response.body.firstName).toBe("Enora");
    });

    it('4. GET /students/:id inexistant doit renvoyer 404', async () => {
        const response = await request(app).get('/students/999');
        
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Étudiant introuvable.");
    });

    it('5. GET /students/:id invalide (ex: "abc") doit renvoyer 400', async () => {
        const response = await request(app).get('/students/abc');
        
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("L'ID fourni n'est pas un nombre valide.");
    });

});

// TESTS POST
describe('POST /students - Tests de création', () => {
    it('6. POST avec données valides doit renvoyer 201 + l\'étudiant avec un ID', async () => {
        const newStudent = {
            firstName: "Lucas",
            lastName: "Bernard",
            email: "lucas@example.com",
            grade: 15,
            field: "informatique"
        };
        const response = await request(app).post('/students').send(newStudent);
        
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.firstName).toBe("Lucas");
    });

    it('7. POST sans champ obligatoire doit renvoyer 400', async () => {
        const incompleteStudent = { firstName: "Lucas" };
        const response = await request(app).post('/students').send(incompleteStudent);
        
        expect(response.statusCode).toBe(400);
    });

    it('8. POST avec note invalide (ex: 25) doit renvoyer 400', async () => {
        const invalidGradeStudent = {
            firstName: "Note",
            lastName: "TropHaute",
            email: "test@note.com",
            grade: 25
        };
        const response = await request(app).post('/students').send(invalidGradeStudent);
        
        expect(response.statusCode).toBe(400);
    });

    it('9. POST avec email déjà existant doit renvoyer 409', async () => {
        const duplicateEmailStudent = {
            firstName: "Double",
            lastName: "Email",
            email: "enora@exemple.com",
            grade: 10,
            field: "informatique"
        };
        const response = await request(app).post('/students').send(duplicateEmailStudent);
        
        expect(response.statusCode).toBe(409);
    });

});

// TESTS PUT
describe('PUT /students/:id - Tests de modification', () => {
    it('10. PUT avec données valides doit renvoyer 200 + l\'étudiant modifié', async () => {
        const updatedStudent = {
            firstName: "Enora Modifiée",
            lastName: "AMADOU",
            email: "enora@exemple.com",
            grade: 18,
            field: "informatique"
        };
        const response = await request(app).put('/students/1').send(updatedStudent);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.firstName).toBe("Enora Modifiée");
        expect(response.body.grade).toBe(18);
    });

    it('11. PUT avec ID inexistant doit renvoyer 404', async () => {
        const updatedStudent = {
            firstName: "Ghost",
            lastName: "Student",
            email: "ghost@exemple.com",
            grade: 10,
            field: "informatique"
        };
        const response = await request(app).put('/students/999').send(updatedStudent);
        
        expect(response.statusCode).toBe(404);
    });
});

// TESTS DELETE
describe('DELETE /students/:id - Tests de suppression', () => {
    it('12. DELETE avec ID valide doit renvoyer 200', async () => {
        const response = await request(app).delete('/students/1');
        
        expect(response.statusCode).toBe(200);
    });

    it('13. DELETE avec ID inexistant doit renvoyer 404', async () => {
        const response = await request(app).delete('/students/999');
        
        expect(response.statusCode).toBe(404);
    });
});

// TESTS SPECIAL GET
describe('GET /students/special - Tests de stats et recherche', () => {
    it('14. GET /students/stats doit renvoyer totalStudents, averageGrade, studentsByField, bestStudent', async () => {
        const response = await request(app).get('/students/stats');
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('totalStudents');
        expect(response.body).toHaveProperty('averageGrade');
        expect(response.body).toHaveProperty('studentsByField');
        expect(response.body).toHaveProperty('bestStudent');
    });

    it('15. GET /students/search?q=... doit renvoyer les étudiants correspondants', async () => {
        const response = await request(app).get('/students/search?q=Enora');
        
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].firstName).toBe("Enora");
    });
});
