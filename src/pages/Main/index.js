/* eslint-disable no-alert */
/* eslint-disable no-throw-literal */
import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner, FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value, loading: false, error: false });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true, error: false });

    try {
      const { newRepo, repositories } = this.state;

      if (newRepo === '') throw 'Digite um repositório';

      const hasRepo = repositories.find(
        repository => repository.name === newRepo
      );

      if (hasRepo) {
        throw 'Repositório duplicado';
      }

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        error: false,
      });
    } catch (error) {
      // eslint-disable-next-line eqeqeq
      if (error == 'Error: Request failed with status code 404') {
        alert('Repositório não encontrado. Digite um repositorio válido');
      } else {
        alert(error);
      }

      this.setState({ error: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  async handleDelete(repository) {
    // eslint-disable-next-line react/destructuring-assignment
    const repositories = this.state.repositories.filter(
      localStorageRepository => localStorageRepository.name !== repository
    );

    if (repositories) {
      this.setState({ repositories });
    }
  }

  render() {
    const { newRepo, repositories, loading, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt size={30} />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            style={{
              flex: 1,
              border: `1px solid ${error ? '#ff6b6b' : '#eee'}`,
              borderRadius: '5px',
            }}
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading ? 1 : undefined}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <div>
                <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                  Detalhes
                </Link>
                <FaTrashAlt
                  color="#7159c1"
                  size={16}
                  onClick={() => this.handleDelete(repository.name)}
                />
              </div>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
