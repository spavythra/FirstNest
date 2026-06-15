*** Settings ***
Documentation     FirstNest — property search and filter acceptance tests
Library           Browser
Suite Setup       New Browser    chromium    headless=True
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       https://uusikoti.vercel.app
${TIMEOUT}        10s

*** Test Cases ***

Search Input Accepts Text
    Open FirstNest
    Fill Text    css=input[type="search"], css=#search-input    Tampere
    Get Text      css=input[type="search"], css=#search-input    ==    Tampere

Area Filter Chips Are Visible
    Open FirstNest
    Get Element Count    css=.area-chip, css=[data-area]    >    0

Selecting An Area Filters The Listings
    Open FirstNest
    ${before}=    Get Element Count    css=.listing-card, css=.property-card
    Click    css=.area-chip:first-child, css=[data-area]:first-child
    Wait For Elements State    css=.listing-card, css=.property-card    visible    timeout=${TIMEOUT}
    ${after}=    Get Element Count    css=.listing-card, css=.property-card
    Should Be True    ${after} <= ${before}

Property Card Shows Price
    Open FirstNest
    Wait For Elements State    css=.listing-card, css=.property-card    visible    timeout=${TIMEOUT}
    Get Text    css=.listing-card:first-child .price, css=.property-card:first-child    contains    €

Property Card Shows Area In Square Metres
    Open FirstNest
    Wait For Elements State    css=.listing-card, css=.property-card    visible    timeout=${TIMEOUT}
    Get Text    css=.listing-card:first-child    contains    m²

*** Keywords ***

Open FirstNest
    New Page    ${BASE_URL}
    Wait For Load State    networkidle    timeout=${TIMEOUT}
