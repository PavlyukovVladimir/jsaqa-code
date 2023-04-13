Feature: Booking tickets

    Scenario: Current day ticket booking
        Given user is on main page of tmweb
        When user randomly chooses one of available seance
        Then user will see the ticket booking page
        When user randomly chooses one of available chair
        Then user sees the page for checking booked tickets
        When user will confirm the booking
        Then user received a QR code

    Scenario: Not posible ticket booking for seances that have been started
        Given user is on main page of tmweb
        When user randomly selects a session that starts earlier than the current moment
        Then user will remain on the current day's movie poster page

    Scenario: One of next days ticket booking
        Given user is on main page of tmweb
        When user randomly chooses one of 6 days starting from the next day
        Then user sees the poster of the selected day
        When user randomly chooses one of available seance
        Then user will see the ticket booking page
        When user randomly chooses one of available chair
        Then user sees the page for checking booked tickets
        When user will confirm the booking
        Then user received a QR code
