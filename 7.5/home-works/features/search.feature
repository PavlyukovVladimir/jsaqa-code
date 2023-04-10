Feature: Search a course
    @skip
    Scenario: Should search by text
        Given user is on "/navigation" page
        When user search by "тестировщик"
        Then user sees the course suggested "Тестировщик ПО"

    Scenario: booking tickets after the current day
        Given user is on main page of tmweb
        When user randomly chooses one of 6 days starting from the next day
        Then user sees the poster of the selected day
        When user randomly chooses one of available seance
        Then user will see the ticket booking page
        When user randomly chooses one of available chair
        Then user sees the page for checking booked tickets
        When user will confirm the booking
        Then user received a QR code

    Scenario: booking tickets after the current day
        Given user is on main page of tmweb
        When user randomly chooses one of unavailable seance
        Then user will remain on the current day's movie poster page