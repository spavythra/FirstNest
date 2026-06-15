*** Settings ***
Documentation     FirstNest — mortgage calculator acceptance tests
Library           Browser
Suite Setup       New Browser    chromium    headless=True
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       https://uusikoti.vercel.app
${TIMEOUT}        10s
${LOAN_AMOUNT}    200000
${INTEREST}       3.5
${YEARS}          25

*** Test Cases ***

Calculator Section Is Present
    Open FirstNest
    Scroll To Element    css=#calculator, css=.mortgage-calculator
    Get Element States   css=#calculator, css=.mortgage-calculator    contains    visible

Monthly Payment Updates On Input Change
    Open FirstNest
    Scroll To Element    css=#calculator, css=.mortgage-calculator
    Fill Text    css=#loan-amount, css=[name="loan"]      ${LOAN_AMOUNT}
    Fill Text    css=#interest-rate, css=[name="rate"]    ${INTEREST}
    Fill Text    css=#loan-years, css=[name="years"]      ${YEARS}
    ${result}=    Get Text    css=#monthly-payment, css=.result-amount
    Should Not Be Empty    ${result}
    Should Contain    ${result}    €

Zero Loan Amount Shows No Payment
    Open FirstNest
    Scroll To Element    css=#calculator, css=.mortgage-calculator
    Fill Text    css=#loan-amount, css=[name="loan"]    0
    ${result}=    Get Text    css=#monthly-payment, css=.result-amount
    Should Contain Any    ${result}    0    —    -

Calculator Is Accessible On Mobile
    New Page    ${BASE_URL}
    Set Viewport Size    390    844
    Wait For Load State    networkidle    timeout=${TIMEOUT}
    Scroll To Element    css=#calculator, css=.mortgage-calculator
    Get Element States    css=#calculator, css=.mortgage-calculator    contains    visible
    Set Viewport Size    1280    900

*** Keywords ***

Open FirstNest
    New Page    ${BASE_URL}
    Wait For Load State    networkidle    timeout=${TIMEOUT}
