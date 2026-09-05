describe('The Calculate', () => {
    it('successfully loads', () => {
        cy.visit('/');
    })

    it('has 1 text input', function () {
        cy.get('form').find('input[type="text"]').its('length').should('eq', 1)
    })
    
    it('has 16 input buttons', function () {
        cy.get('form').find('input[type="button"]').its('length').should('eq', 16)
    })
});
