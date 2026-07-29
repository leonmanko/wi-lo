// apps/web/src/components/ui/__tests__/FormField.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormField from '../FormField';
import { required, validEmail } from '../../../lib/validation';
import React from 'react';

describe('FormField', () => {
  it('doit afficher le label et le champ', () => {
    render(
      <FormField
        name="email"
        label="Email"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByText('Email')).toBeDefined();
  });

  it('doit afficher une erreur après blur si la validation échoue', async () => {
    render(
      <FormField
        name="email"
        label="Email"
        value=""
        onChange={() => {}}
        rules={[required()]}
      />
    );

    const input = screen.getByLabelText('Email');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Ce champ est requis')).toBeDefined();
    });
  });

  it('doit afficher le compteur de caractères si maxLength est défini', () => {
    render(
      <FormField
        name="bio"
        label="Bio"
        value="Hello"
        onChange={() => {}}
        maxLength={200}
      />
    );

    expect(screen.getByText('5/200')).toBeDefined();
  });

  it('doit appeler onChange quand la valeur change', () => {
    const handleChange = vi.fn();

    render(
      <FormField
        name="name"
        label="Nom"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('Nom');
    fireEvent.change(input, { target: { value: 'Jean' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('doit être désactivé si disabled=true', () => {
    render(
      <FormField
        name="name"
        label="Nom"
        value="Jean"
        onChange={() => {}}
        disabled
      />
    );

    const input = screen.getByLabelText('Nom') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});