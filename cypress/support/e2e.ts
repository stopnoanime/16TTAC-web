// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// When a command from ./commands is ready to use, import with `import './commands'` syntax
// import './commands';

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      writeCode: (code: string) => Chainable;
    }
  }
}

Cypress.Commands.add('writeCode', (code: string) => {
  return cy
    .get('.ace_text-input')
    .first()
    .type('{selectall}{backspace}{backspace}', { force: true })
    .type(code, { force: true });
});
