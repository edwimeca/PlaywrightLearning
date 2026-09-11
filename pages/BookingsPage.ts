import { BasePage } from "./basePage";
import { BookingsLocators } from "./locators/bookings";
import { Page , Locator } from "@playwright/test";

export class BookingsPage extends BasePage {

    private readonly fromPort: Locator;
    private readonly toPort: Locator;
    private readonly submitButton: Locator;
    private readonly selectFlight: Locator;
    private readonly inputName: Locator;
    private readonly address: Locator;
    private readonly city: Locator;
    private readonly state: Locator;
    private readonly zipCode: Locator;
    private readonly creditCardSelection: Locator;
    private readonly creditCardNumber: Locator;
    private readonly nameOnCard: Locator;
    private readonly finalMessage: Locator;

    constructor(page: Page) {
        super(page);

        this.fromPort = page.locator(BookingsLocators.fromPort);
        this.toPort = page.locator(BookingsLocators.toPort);
        this.submitButton = page.locator(BookingsLocators.submitButton);
        this.selectFlight = page.locator(BookingsLocators.selectFlight);
        this.inputName = page.locator(BookingsLocators.inputName);
        this.address = page.locator(BookingsLocators.address);
        this.city = page.locator(BookingsLocators.city);
        this.state = page.locator(BookingsLocators.state);
        this.zipCode = page.locator(BookingsLocators.zipCode);
        this.creditCardSelection = page.locator(BookingsLocators.creditCardSelection);
        this.creditCardNumber = page.locator(BookingsLocators.creditCardNumber);
        this.nameOnCard = page.locator(BookingsLocators.nameOnCard);
        this.finalMessage = page.locator(BookingsLocators.finalMessage);
    }
}
    


     /*fromPort:'select[name="fromPort',
    toPort:'select[name="toPort',
    submitButton:'input[type= "submit"]',
    selectFlight:'//tr[2]/td[1]/input',
    inputName:'input[id= "inputName"]',
    address:'input[id= "address"]',
    city:'input[id= "city"]',
    state:'input[id= "state"]',
    zipCode:'input[id= "zipCode"]',
    creditCardSelection:'#cardType',
    creditCardNumber:'input[id="creditCardNumber"]',
    nameOnCard:'input[id= "nameOnCard"]',
    finalMessage:'//div[2]/div/h1'*/



