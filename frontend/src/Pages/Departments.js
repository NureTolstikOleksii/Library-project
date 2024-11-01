import React, { Component } from 'react';
import { Table, Container } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class Departments extends Component {
  state = {
    departments: [],
  };

  componentDidMount() {
    this.fetchDepartments();
  }

  fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      const departments = response.data;

      this.setState({ departments });
    } catch (error) {
      console.error('Error fetching departments and books:', error);
    }
  };

  render() {
    const { departments } = this.state;

    return (
      <Container>
        <h2 className="my-4">Відділи</h2>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Назва відділу</th>
              <th>Кількість книг</th>
              <th>Книги</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr key={department.id}>
                <td>{department.name}</td>
                <td>{department.books ? department.books.length : 0}</td>
                <td>
                  <ul>
                    {department.books && department.books.map((book) => (
                      <li key={book.id}>{book.title}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    );
  }
}
