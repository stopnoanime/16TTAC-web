describe('16TTAC-web', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('has correct title', () => {
    cy.title().should('equal', '16TTAC-web');
  });

  it('compiles and runs given code', () => {
    cy.get('.ace_text-input')
      .type('{selectall}{backspace}{backspace}', { force: true })
      .type(`'x' => OUT NULL => HALT`, { force: true });

    cy.get('button').contains('Compile').click();
    cy.get('.xterm-rows').should('include.text', 'Compiled successfully');

    cy.get('button').contains('Restart').click();
    cy.get('.xterm-rows').should('have.value', '');

    cy.get('mat-checkbox').contains('Full speed').click();
    cy.get('button').contains('Start').click();
    cy.get('.xterm-rows').should('include.text', 'xHalting.');
  });
});
