*** Settings ***
Documentation     FirstNest — navigation and page load acceptance tests
Library           Browser
Suite Setup       New Browser    chromium    headless=True
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       https://uusikoti.vercel.app
${TIMEOUT}        10s

*** Test Cases ***

Page Title Is Correct
    New Page    ${BASE_URL}
    Get Title    ==    FirstNest | Find your first home in Tampere

Top Bar Is Visible On Load
    New Page    ${BASE_URL}
    Get Element States    css=header.topbar    contains    visible

Logo Links Back To Home
    New Page    ${BASE_URL}
    Click    css=.topbar a[href="#"]
    Get Url    contains    ${BASE_URL}

Navigation Renders All Primary Sections
    New Page    ${BASE_URL}
    FOR    ${selector}    IN    #search    #map    #guide    #calculator
        Wait For Elements State    css=${selector}    visible    timeout=${TIMEOUT}
    END

Page Is Mobile Responsive
    New Page    ${BASE_URL}
    Set Viewport Size    390    844
    Get Element States    css=header.topbar    contains    visible
    Set Viewport Size    1280    900

*** Keywords ***

Open FirstNest
    New Page    ${BASE_URL}
    Wait For Load State    networkidle
