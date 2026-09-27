import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PlayerSearch } from '../pages/PlayerSearch';
import { validatePlayerName } from './scoreValidation';

describe('validation du pseudo', () => {
  it('refuse un pseudo vide', () => {
    expect(validatePlayerName('')).toBe('Le pseudo est obligatoire.');
  });

  it('refuse un pseudo trop court', () => {
    expect(validatePlayerName('A')).toBe('Le pseudo doit contenir au moins 2 caractères.');
  });

  it('accepte un pseudo valide après suppression des espaces', () => {
    expect(validatePlayerName('  Neo  ')).toBeNull();
  });

  it('bloque conditionnellement la soumission si le pseudo est vide', () => {
    render(<MemoryRouter><PlayerSearch /></MemoryRouter>);
    const searchButton = screen.getByRole('button', { name: 'Rechercher' });
    const searchInput = screen.getByLabelText('Pseudo');
    expect(searchButton).toBeDisabled();
    fireEvent.blur(searchInput);
    expect(screen.getByText('Saisissez un pseudo pour lancer la recherche.')).toBeVisible();
    fireEvent.change(searchInput, { target: { value: 'Neo' } });
    expect(searchButton).toBeEnabled();
  });
});