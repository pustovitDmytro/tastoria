/* eslint-disable import/unambiguous */

describe('start-page: not authorized user', function () {
    it('redirected to login', function () {
        cy.visit('/');
        cy.wait(1000);
        cy.url().should('include', '/login');
        cy.get('button:contains("Log In")').click();
    });
});
