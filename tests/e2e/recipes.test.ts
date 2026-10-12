/* eslint-disable import/unambiguous */

const recipeLink = 'a[href^="/recipes/"]:has(h3)';

describe('recipes', function () {
    beforeEach(function () {
        cy.login();
    });

    it('opens recipes list', function () {
        cy.url().should('include', '/recipes');
        cy.get('input[type="search"]').should('be.visible');
        cy.get(recipeLink).should('have.length.at.least', 1);
    });

    it('filters recipes by search', function () {
        cy.get(recipeLink).first().find('h3').invoke('text').then((title) => {
            const query = title.trim().replace(/\.\.$/, '').slice(0, 8);

            cy.get('input[type="search"]').type(query);
            cy.get(recipeLink).should('have.length.at.least', 1);
            cy.contains('h3', query, { matchCase: false });

            cy.get('input[type="search"]').clear().type('zzzznonexistentquery12345');
            cy.contains('No matching recipes found');
        });
    });

    it('opens single recipe from list', function () {
        cy.get(recipeLink).first().then(($link) => {
            const href = $link.attr('href');

            cy.wrap($link).click();
            cy.url().should('include', href);
            cy.get('h1').should('be.visible').and('not.be.empty');
        });
    });
});
