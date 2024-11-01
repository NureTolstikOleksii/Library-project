const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const PORT = process.env.PORT || 3001;

// Підключення до БД
const dbConfig = new Sequelize('LibraryDB', 'testing', 'testing', {
    host: 'localhost',
    dialect: 'mssql',
});

(async () => {
    try {
        await dbConfig.authenticate();
        console.log('Connection to the database successful');
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
})();


const app = express();
app.use(cors());
app.use(bodyParser.json());


app.listen(PORT, () => {
    console.log(`Server starting on port ${PORT}`);
});


// Функція для обробки помилок
const handleQuery = async (query, replacements) => {
    try {
        const [results] = await dbConfig.query(query, { replacements });
        return results;
    } catch (error) {
        throw new Error('Database query failed: ' + error.message);
    }
};

// Отримання книг
app.get('/api/books', async (req, res) => {
    try {
        const results = await handleQuery(`
            SELECT B.Book_id, B.Title, B.Author, B.Genre, B.Price, B.Quantity, D.Name 
            FROM Books B 
            INNER JOIN Departments D ON B.Dept_id = D.Dept_id
        `);
        res.json(results);
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({ error: 'Error fetching books' });
    }
});

// Додавання нової книги
app.post('/api/add_books', async (req, res) => {
    const { Title, Author, Genre, Price, Quantity, Dept_id } = req.body;

    if (!Title || !Author || !Genre || Price === undefined || Quantity === undefined || Dept_id === undefined) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        await handleQuery(
            'INSERT INTO Books (Title, Author, Genre, Price, Quantity, Dept_id) VALUES (?, ?, ?, ?, ?, ?)',
            [Title, Author, Genre, Price, Quantity, Dept_id]
        );
        res.status(201).json({ message: 'Book added successfully' });
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).json({ error: 'Error adding book' });
    }
});

// Отримання читачів
app.get('/api/readers', async (req, res) => {
    try {
        const results = await handleQuery(`
            SELECT r.Reader_id, r.Name, r.Address, r.Phone, c.Date_issued, c.Expiration_date, d.Name AS DeptName
            FROM Readers r
            JOIN Cards c ON r.Card_id = c.Card_id
            JOIN Departments d ON c.Dept_id = d.Dept_id;
        `);
        res.json(results);
    } catch (error) {
        console.error('Error retrieving readers:', error);
        res.status(500).json({ error: 'Error retrieving readers' });
    }
});

// Отримання чатача за ID
app.get('/api/readers/:readerId', async (req, res) => {
    const { readerId } = req.params;

    try {
        const reader = await handleQuery(`
            SELECT R.Name, C.Date_issued, C.Expiration_date 
            FROM Readers R 
            INNER JOIN Cards C ON R.Card_id = C.Card_id 
            WHERE R.Reader_id = ?;
        `, [readerId]);

        if (reader.length === 0) {
            return res.status(404).json({ error: 'Reader not found' });
        }

        res.json(reader[0]);
    } catch (error) {
        console.error('Error fetching reader:', error);
        res.status(500).json({ error: 'Error fetching reader' });
    }
});

// Інформація про взяті книги
app.get('/api/readers/:readerId/borrows', async (req, res) => {
    const { readerId } = req.params;

    try {
        const borrows = await handleQuery(`
            SELECT b.Book_id, b.Title, b.Author, b.Genre, br.Date_borrowed, br.Date_due
            FROM Borrows br
            JOIN Books b ON br.Book_id = b.Book_id
            WHERE br.Reader_id = ?;
        `, [readerId]);

        res.json(borrows);
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
        res.status(500).json({ error: 'Error fetching borrowed books' });
    }
});

// Додавання читача
app.post('/api/readers', async (req, res) => {
    const { Name, Address, Phone, Dept_id } = req.body;

    if (!Name || !Address || !Phone || Dept_id === undefined) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        await handleQuery(
            'INSERT INTO Readers (Name, Address, Phone, Card_id) VALUES (?, ?, ?, (SELECT MAX(Card_id) FROM Cards WHERE Dept_id = ?))',
            [Name, Address, Phone, Dept_id]
        );
        res.status(201).json({ message: 'Reader added successfully' });
    } catch (err) {
        console.error('Error adding reader:', err);
        res.status(500).json({ error: 'Error adding reader' });
    }
});

// Видалення читача
app.delete('/api/readers/:readerId', async (req, res) => {
    const { readerId } = req.params;

    try {
        const result = await handleQuery(`
            DELETE FROM Readers WHERE Reader_id = ?;
        `, [readerId]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Reader deleted successfully' });
        } else {
            res.status(404).json({ error: 'Reader not found' });
        }
    } catch (error) {
        console.error('Error deleting reader:', error);
        res.status(500).json({ error: 'Error deleting reader' });
    }
});

// Підрахунок книг у відділі
app.get('/api/departments/count_books', async (req, res) => {
    const { partName } = req.query;

    if (!partName) {
        return res.status(400).json({ error: 'Part name is required' });
    }

    try {
        const results = await handleQuery(`
            SELECT dbo.CountBooksInDepartmentLike(?) AS count
        `, [partName]);
        res.json({ count: results[0].count });
    } catch (err) {
        console.error('Error fetching book count:', err);
        res.status(500).json({ error: 'Error fetching book count' });
    }
});

// Отримання книг у відділі
app.get('/api/departments/books', async (req, res) => {
    const { partName } = req.query;

    if (!partName) {
        return res.status(400).json({ error: 'Part name is required' });
    }

    try {
        const results = await handleQuery(`
            SELECT * FROM dbo.GetBooksInDepartmentLike(?)
        `, [partName]);
        res.json(results);
    } catch (err) {
        console.error('Error fetching books by department:', err);
        res.status(500).json({ error: 'Error fetching books by department' });
    }
});

// Інформація про відділи
app.get('/api/departments', async (req, res) => {
    try {
        const departments = await handleQuery(`
            SELECT d.Dept_id AS deptId, d.Name AS departmentName, 
                    b.Book_id AS bookId, b.Title AS bookTitle
             FROM Departments d
             LEFT JOIN Books b ON d.Dept_id = b.Dept_id
        `);

        const result = departments.reduce((acc, row) => {
            let department = acc.find(d => d.id === row.deptId);

            if (!department) {
                department = { id: row.deptId, name: row.departmentName, books: [] };
                acc.push(department);
            }
            if (row.bookId) {
                department.books.push({ id: row.bookId, title: row.bookTitle });
            }

            return acc;
        }, []);

        res.json(result);
    } catch (error) {
        console.error('Error fetching departments and books:', error);
        res.status(500).json({ error: 'Error fetching departments and books' });
    }
});
