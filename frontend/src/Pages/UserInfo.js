import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';

export default function ReaderBorrows() {
    const { readerId } = useParams();
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [reader, setReader] = useState(null);

    useEffect(() => {
        fetch(`/api/readers/${readerId}/borrows`)
            .then(response => response.json())
            .then(data => setBorrowedBooks(data))
            .catch(error => console.error('Error fetching borrowed books:', error));
        
        fetch(`/api/readers/${readerId}`)
            .then(response => response.json())
            .then(data => setReader(data))
            .catch(error => console.error('Error fetching reader:', error));
    }, [readerId]);

    return (
        <div className="container mt-4">
            <h1>Журнал оренди книг</h1>
            <Link to="/readers" className="btn btn-secondary mb-4">Повернутися до списку читачів</Link>
            
            <div align="center">
            {reader ? (
                <div>
                    <h1>{reader.Name}</h1>
                    <p>
                        <strong>Дата видачі картки:</strong> {new Date(reader.Date_issued).toLocaleDateString()} <br />
                        <strong>Дата закінчення дії картки:</strong> {new Date(reader.Expiration_date).toLocaleDateString()} <br />
                    </p>
                </div>
            ) : (
                <p>Завантаження інформації про читача...</p>
            )}
            </div>
            

            <h1>
                Історія взятих книг:
            </h1>

            <Row>
                {borrowedBooks.length > 0 ? (
                    borrowedBooks.map(book => (
                        <Col key={book.Book_id} md={4} className="mb-4">
                            <Card style={{ width: '100%' }}>
                                <Card.Body>
                                    <Card.Title>{book.Title}</Card.Title>
                                    <Card.Text>
                                        <strong>Автор:</strong> {book.Author} <br />
                                        <strong>Жанр:</strong> {book.Genre} <br />
                                        <strong>Дата взяття:</strong> {new Date(book.Date_borrowed).toLocaleDateString()} <br />
                                        <strong>Дата повернення:</strong> {new Date(book.Date_due).toLocaleDateString()} <br />
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p>Цей читач ще не брав книг.</p>
                )}
            </Row>
        </div>
    );
}
