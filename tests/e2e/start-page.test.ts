/* eslint-disable import/unambiguous */

describe('start-page: not authorized user', function () {
    it('redirected to login', function () {
        cy.visit('/');
        cy.wait(2000);
        cy.url().should('include', '/login');
        cy.contains('button:contains("Log In")').click();
    });
});
