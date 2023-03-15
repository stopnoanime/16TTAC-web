describe('16TTAC-web', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('has correct title', () => {
    cy.title().should('equal', '16TTAC-web');
  });

  it('compiles code', () => {
    //Start button should be disabled before compiling
    cy.contains('button', 'Start').should('be.disabled');

    cy.writeCode('NULL => NULL');
    cy.contains('button', 'Compile').click();

    cy.contains('button', 'Start').should('be.enabled');

    cy.get('.xterm').should('include.text', 'Compiled successfully');
  });

  it('resets compiled state on code change', () => {
    cy.writeCode('NULL => NULL');
    cy.contains('button', 'Compile').click();

    cy.contains('button', 'Start').should('be.enabled');
    cy.writeCode('a');
    cy.contains('button', 'Start').should('be.disabled');
  });

  it('singleSteps code and outputs data to terminal', () => {
    cy.writeCode(`'x' => OUT`);
    cy.contains('button', 'Compile').click();

    cy.contains('button', 'Single step').click();
    cy.get('.xterm').should('include.text', 'x');
  });

  it('shows cpu data', () => {
    cy.writeCode('NULL => NULL');
    cy.contains('button', 'Compile').click();

    cy.contains('button', 'Single step').click();
    cy.contains('button', 'Single step').click();

    cy.contains('div', 'Pc: ').contains('0002');
  });

  it('restarts cpu and terminal', () => {
    cy.writeCode('NULL => NULL');
    cy.contains('button', 'Compile').click();
    cy.contains('button', 'Single step').click();

    cy.contains('button', 'Restart').click();

    cy.get('.xterm-rows')
      .invoke('text')
      .then((s) => s.trim())
      .should('be.empty');
    cy.contains('div', 'Pc: ').contains('0000');
  });

  it('outputs halt message', () => {
    cy.writeCode(`NULL => HALT`);
    cy.contains('button', 'Compile').click();
    cy.contains('button', 'Single step').click();

    cy.get('.xterm').should('include.text', 'Halting.');
  });

  it('outputs memory in memory viewer', () => {
    cy.writeCode(`'x' => OUT`);
    cy.contains('button', 'Compile').click();

    cy.contains('span', '0x0000').next().should('contain.text', '061C');
  });

  it('runs code at full speed', () => {
    cy.writeCode(`'x' => OUT NULL => HALT`);
    cy.contains('button', 'Compile').click();

    cy.contains('mat-checkbox', 'Full speed').click();
    cy.contains('button', 'Start').click();

    cy.get('.xterm').should('include.text', 'xHalting.');
  });

  it('runs code at normal speed', () => {
    cy.writeCode(`'x' => OUT  NULL => HALT`);
    cy.contains('button', 'Compile').click();

    cy.contains('button', 'Start').click();

    cy.get('.xterm').should('include.text', 'xHalting.');
  });

  it('receives data from terminal', () => {
    cy.writeCode(`IN => OUT NULL => HALT`);
    cy.contains('button', 'Compile').click();
    cy.contains('button', 'Start').click();

    cy.get('.xterm').type('z');
    cy.get('.xterm').should('include.text', 'zHalting.');
  });

  it('stops on breakpoints', () => {
    cy.writeCode(`NULL => NULL NULL => NULL`);

    cy.get('.ace_gutter-cell').contains('1').click({ force: true });

    cy.contains('button', 'Compile').click();
    cy.contains('button', 'Single step').click();

    cy.get('.xterm').should('include.text', 'Breakpoint');
  });
});
