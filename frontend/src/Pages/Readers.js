import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Readers() {
    const [readers, setReaders] = useState([]);
    const [show, setShow] = useState(false); 
    const [newReader, setNewReader] = useState({ Name: '', Address: '', Phone: '', Dept_id: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReaders();
    }, []);

    const fetchReaders = () => {
        fetch('/api/readers')
            .then(response => response.json())
            .then(data => setReaders(data))
            .catch(error => console.error('Error fetching readers:', error));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewReader(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAddReader = () => {
        const { Name, Address, Phone, Dept_id } = newReader;

        // Перевірка полів форми
        if (!Name || !Address || !Phone || !Dept_id) {
            alert('Будь ласка, заповніть усі поля.');
            return;
        }

        if (isNaN(Phone) || isNaN(Dept_id)) {
            alert('Номер телефону та ID відділу повинні бути числовими.');
            return;
        }

        fetch('/api/readers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newReader),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || 'Не вдалося додати читача');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                fetchReaders();
                setShow(false); 
                setErrorMessage('');
            })
            .catch(error => {
                console.error('Error adding reader:', error);
                setErrorMessage(error.message);
            });
    };

    const handleDeleteReader = (readerId) => {
        fetch(`/api/readers/${readerId}`, {
            method: 'DELETE',
        })
            .then(data => {
                fetchReaders();
            })  
            .catch(error => console.error('Error deleting reader:', error));
    };

    return (
        <div className="container mt-4">
            <h1>Читачі</h1>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} {/* Відображення помилки */}
            <Button variant="success" onClick={() => setShow(true)}>
                Додати читача
            </Button>
            <Row className="mt-4">
                {readers.map(reader => (
                    <Col key={reader.Reader_id} md={4} className="mb-4">
                        <Card style={{ width: '100%' }}>
                            <Card.Body>
                                <Card.Title>{reader.Name}</Card.Title>
                                <Card.Text>
                                    Address: {reader.Address} <br />
                                    Phone: {reader.Phone} <br />
                                    Card Issued: {new Date(reader.Date_issued).toLocaleDateString()} <br />
                                    Expiration Date: {new Date(reader.Expiration_date).toLocaleDateString()} <br />
                                    Department: {reader.DeptName}
                                </Card.Text>
                                <Button variant="primary" onClick={() => navigate(`/readers/${reader.Reader_id}/borrows`)}>
                                    Переглянути журнал
                                </Button>
                                <Button variant="danger" onClick={() => handleDeleteReader(reader.Reader_id)}>
                                   Видалити читача
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal for adding a new reader */}
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Додати нового читача</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formReaderName">
                            <Form.Label>Ім'я</Form.Label>
                            <Form.Control type="text" placeholder="Введіть ім'я" name="Name" value={newReader.Name} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="formReaderAddress">
                            <Form.Label>Адреса</Form.Label>
                            <Form.Control type="text" placeholder="Введіть адресу" name="Address" value={newReader.Address} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="formReaderPhone">
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control type="text" placeholder="Введіть номер телефону" name="Phone" value={newReader.Phone} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="formReaderDept">
                            <Form.Label>ID Відділу</Form.Label>
                            <Form.Control type="text" placeholder="Введіть ID відділу" name="Dept_id" value={newReader.Dept_id} onChange={handleChange} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Закрити
                    </Button>
                    <Button variant="primary" onClick={handleAddReader}>
                        Додати
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
