declare global {
    namespace Cypress {
        interface Chainable {
            login(): Chainable<void>;
        }
    }
}

Cypress.Commands.add('login', () => {
    cy.visit('/login');
    cy.get('[type="email"]').type(Cypress.env('email'));
    cy.get('[type="password"]').type(Cypress.env('password'), { log: false });
    cy.get('button:contains("Log In")').click();
    cy.url().should('include', '/recipes', { timeout: 15_000 });
});

// eslint-disable-next-line import/unambiguous
beforeEach(function () {});

export {};
