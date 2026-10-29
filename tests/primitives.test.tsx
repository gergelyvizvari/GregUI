import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Icon,
  iconNames,
  Kbd,
  LocaleProvider,
  SideNav,
  SkipLink,
  VisuallyHidden,
} from '@gregui/react';

describe('Icon', () => {
  it('draws application glyphs on the shared grid and accepts them in icon props', () => {
    const { container } = render(
      <SideNav
        label="Workspace"
        items={[
          {
            id: 'orders',
            label: 'Orders',
            href: '#orders',
            icon: (
              <Icon>
                <path d="M4 4h16v16H4z" />
              </Icon>
            ),
          },
          { id: 'home', label: 'Home', href: '#home', icon: 'home' },
        ]}
      />,
    );
    const custom = container.querySelector('[data-icon="custom"]');
    expect(custom).toHaveAttribute('viewBox', '0 0 24 24');
    expect(custom).toHaveAttribute('aria-hidden', 'true');
    expect(custom?.querySelector('path')).toHaveAttribute('d', 'M4 4h16v16H4z');
    expect(container.querySelector('[data-icon="home"]')).toBeInTheDocument();
  });
  it('lists every built-in name once', () => {
    expect(new Set(iconNames).size).toBe(iconNames.length);
    expect(iconNames).toEqual(expect.arrayContaining(['settings', 'user', 'info', 'error']));
  });
});

describe('Alert', () => {
  it('gives each tone its own icon', () => {
    const { container } = render(
      <>
        <Alert title="Info" />
        <Alert title="Done" tone="success" />
        <Alert title="Check" tone="warning" />
        <Alert title="Failed" tone="danger" />
      </>,
    );
    const icons = [...container.querySelectorAll('.g-alert > .g-icon')].map((icon) =>
      icon.getAttribute('data-icon'),
    );
    expect(icons).toEqual(['info', 'check', 'warning', 'error']);
  });
});

describe('Text helpers', () => {
  it('hides text visually but keeps it in the accessible name', () => {
    render(
      <button>
        3<VisuallyHidden> unread messages</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', { name: '3 unread messages' })).toBeInTheDocument();
  });
  it('renders a key combination as nested keys', () => {
    const { container } = render(<Kbd keys={['Ctrl', 'K']} />);
    const keys = container.querySelectorAll('kbd > kbd');
    expect([...keys].map((key) => key.textContent)).toEqual(['Ctrl', 'K']);
  });
  it('labels the skip link from package messages', () => {
    render(
      <LocaleProvider locale="hu-HU">
        <SkipLink href="#main" />
      </LocaleProvider>,
    );
    expect(screen.getByRole('link', { name: 'Ugrás a tartalomra' })).toHaveAttribute(
      'href',
      '#main',
    );
  });
});

describe('Avatar', () => {
  it('names the person and their presence', () => {
    render(<Avatar name="Alex Morgan" status="away" />);
    const avatar = screen.getByRole('img', { name: 'Alex Morgan, away' });
    expect(avatar).toHaveTextContent('AM');
  });
  it('uses first and last initials in the locale', () => {
    render(
      <LocaleProvider locale="hu-HU">
        <Avatar name="vizvári  ádám gergely" status="busy" />
      </LocaleProvider>,
    );
    expect(screen.getByRole('img', { name: 'vizvári ádám gergely, elfoglalt' })).toHaveTextContent(
      'VG',
    );
  });
  it('falls back to initials when the image fails', () => {
    const { container } = render(<Avatar name="Sam Taylor" src="/missing.png" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: 'Sam Taylor' })).toHaveTextContent('ST');
  });
  it('can be hidden when the name is already visible', () => {
    const { container } = render(<Avatar name="Sam Taylor" decorative />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).toBeNull();
  });
  it('collapses extra people into a named count', () => {
    const people = ['A One', 'B Two', 'C Three', 'D Four', 'E Five'].map((name) => ({
      id: name,
      name,
    }));
    render(<AvatarGroup label="Members" people={people} max={3} />);
    const group = screen.getByRole('group', { name: 'Members' });
    expect(group.querySelectorAll('[role="img"]')).toHaveLength(3);
    expect(screen.getByRole('img', { name: '3 more people' })).toHaveTextContent('+3');
  });
});
