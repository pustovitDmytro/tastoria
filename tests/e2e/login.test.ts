/* eslint-disable import/unambiguous */
// Cypress.on('uncaught:exception', () => {
//     // returning false here prevents Cypress from failing the test
//     return false;
// });

describe('login', function () {
    it('wrong credentials', function () {
        cy.visit('/login');
        cy.wait(1000);
        cy.get('[type="email"]').type('tmsletell@chitidotst.seoul');
        cy.get('[type="password"]').type('tmsletell@chitidotst.seoul', { log: false });
        cy.wait(2000);
        cy.get('button:contains("Log In")').click();
        cy.wait(2000);
        cy.contains('Invalid Credentials');
    });

    it('empty credentials', function () {
        cy.visit('/login');
        cy.wait(1000);
        cy.get('button:contains("Log In")').click();
        cy.wait(2000);
        cy.contains('Invalid Email');
    });

    it('valid credentials', function () {
        cy.visit('/login');
        cy.wait(1000);
        cy.get('[type="email"]').type(Cypress.env('email'));
        cy.get('[type="password"]').type(Cypress.env('password'), { log: false });
        cy.wait(2000);
        cy.get('button:contains("Log In")').click();
        cy.wait(10_000);
        cy.url().should('include', '/recipes');
    });
});
