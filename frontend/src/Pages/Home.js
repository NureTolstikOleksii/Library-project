import React, { Component } from 'react';
import { Button, Form, Table, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            books: [],
            showAddBookForm: false,
            newBook: {
                Title: '',
                Author: '',
                Genre: '',
                Price: '',
                Quantity: '',
                Dept_id: '',
            },
            error: '',
            success: '',
            departmentName: '',
            filteredBooks: [],
            bookCount: 0,
        };
    }

    componentDidMount() {
        this.fetchBooks();
    }

    fetchBooks = () => {
        fetch('api/books')
            .then(response => response.json())
            .then(data => this.setState({ books: data }))
            .catch(error => console.error('Error fetching books:', error));
    };

    toggleAddBookForm = () => {
        this.setState(prevState => ({ showAddBookForm: !prevState.showAddBookForm }));
    };

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState(prevState => ({
            newBook: {
                ...prevState.newBook,
                [name]: value,
            },
            error: '',
            success: '',
        }));
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const { newBook } = this.state;

        if (!newBook.Title || !newBook.Author || !newBook.Genre || !newBook.Price || !newBook.Quantity || !newBook.Dept_id) {
            this.setState({ error: 'Please fill in all fields' });
            return;
        }

        fetch('/api/add_books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBook),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Error adding book');
                    });
                }
                return response.json();
            })
            .then(data => {
                this.setState({ success: data.message, newBook: { Title: '', Author: '', Genre: '', Price: '', Quantity: '', Dept_id: '' } });
                this.fetchBooks();
            })
            .catch(error => {
                this.setState({ error: error.message });
                console.error('Error adding book:', error);
            });
    };

    searchByDepartment = () => {
        const { departmentName } = this.state;

        if (!departmentName) {
            this.setState({ error: 'Please enter a department name' });
            return;
        }

        fetch(`/api/departments/count_books?partName=${encodeURIComponent(departmentName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching book count');
                }
                return response.json();
            })
            .then(data => {
                this.setState({ bookCount: data.count });
            })
            .catch(error => {
                console.error('Error fetching book count:', error);
            });

        fetch(`/api/departments/books?partName=${encodeURIComponent(departmentName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching books by department');
                }
                return response.json();
            })
            .then(data => {
                this.setState({ filteredBooks: data });
            })
            .catch(error => {
                console.error('Error fetching books by department:', error);
            });
    };

    handleDepartmentNameChange = (event) => {
        this.setState({ departmentName: event.target.value });
    };

    render() {
        const { books, showAddBookForm, newBook, error, success, departmentName, filteredBooks, bookCount } = this.state;

        return (
            <div className="container">
                <h1 className="my-4">Каталог книг</h1>
                <Button onClick={this.toggleAddBookForm} variant="success" className="mb-3">
                    {showAddBookForm ? 'Закрити' : 'Додати книгу'}
                </Button>

                {showAddBookForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <Form onSubmit={this.handleSubmit} className="mb-4">
                                <h2>Додайте нову книгу</h2>
                                <Form.Group controlId="formTitle">
                                    <Form.Label>Назва</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Title"
                                        value={newBook.Title}
                                        onChange={this.handleInputChange}
                                        placeholder="Введіть назву книги"
                                        className="mb-2"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formAuthor">
                                    <Form.Label>Автор</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Author"
                                        value={newBook.Author}
                                        onChange={this.handleInputChange}
                                        placeholder="Введіть автора книги"
                                        className="mb-2"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formGenre">
                                    <Form.Label>Жанр</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Genre"
                                        value={newBook.Genre}
                                        onChange={this.handleInputChange}
                                        placeholder="Введіть жанр"
                                        className="mb-2"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formPrice">
                                    <Form.Label>Ціна</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="Price"
                                        value={newBook.Price}
                                        onChange={this.handleInputChange}
                                        placeholder="Введіть ціну"
                                        className="mb-2"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formQuantity">
                                    <Form.Label>Кількість</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="Quantity"
                                        value={newBook.Quantity}
                                        onChange={this.handleInputChange}
                                        placeholder="Введіть кількість примірників"
                                        className="mb-2"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formDeptId">
                                    <Form.Label>ID відділу</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="Dept_id"
                                        value={newBook.Dept_id}
                                        onChange={this.handleInputChange}
                                        placeholder="Введіть ID відділу"
                                        className="mb-2"
                                    />
                                </Form.Group>

                                <Button type="submit" variant="success" className="me-2">Підтвердити</Button>

                                {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
                                {success && <Alert variant="success" className="mt-2">{success}</Alert>}
                            </Form>
                            <Button onClick={this.toggleAddBookForm} variant="secondary">Закрити</Button>
                        </div>
                    </div>
                )}

                <Form className="mb-4 search-form" style={{ border: '1px solid #ced4da', borderRadius: '0.25rem', padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <Form.Group controlId="formDepartmentName">
                        <Form.Label>Пошук книги за назвою відділу:</Form.Label>
                        <Form.Control
                            type="text"
                            value={departmentName}
                            onChange={this.handleDepartmentNameChange}
                            placeholder="Введіть назву відділу"
                            className="mb-2"
                        />
                    </Form.Group>
                    <Button onClick={this.searchByDepartment} variant="info" className="mb-2">Знайти</Button>
                </Form>

                <h2>Результати пошуку</h2>
                <p>Кількість знайдених книг: {bookCount}</p>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Назва</th>
                            <th>Автор</th>
                            <th>Жанр</th>
                            <th>Ціна</th>
                            <th>Кількість</th>
                            <th>Відділ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(filteredBooks.length ? filteredBooks : books).map(book => (
                            <tr key={book.Book_id}>
                                <td>{book.Title}</td>
                                <td>{book.Author}</td>
                                <td>{book.Genre}</td>
                                <td>{book.Price}</td>
                                <td>{book.Quantity}</td>
                                <td>{book.Name}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <style jsx>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                    }
                    .modal-content {
                        background: white;
                        padding: 20px;
                        border-radius: 5px;
                        width: 400px;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    }
                `}</style>
            </div>
        );
    }
}
