Módulo 5 — Factory + Adapter + Interface
1. El problema que tu arquitectura está resolviendo

Imagina que tienes 5 aerolíneas:

LIFT
AVIANCA
COPA
SPIRIT
AIRLINE X

Y cada una tiene un Web Check-In diferente.

Por ejemplo:

Lift
 └── Search booking
 └── Select passenger
 └── Select seat
 └── Check-in

Avianca
 └── Search booking
 └── Select passenger
 └── Select seat
 └── Check-in

Las acciones de negocio son prácticamente las mismas, pero la implementación de la UI puede ser completamente diferente.

Si escribieras directamente en el test:

await page.getByRole('textbox', { name: 'Booking reference' }).fill(...);
await page.getByRole('button', { name: 'Search' }).click();

estarías acoplando el test a una aerolínea específica.

Entonces tendrías:

Test Lift
    ↓
Lift UI

Test Avianca
    ↓
Avianca UI

Test Copa
    ↓
Copa UI

Eso rápidamente se vuelve difícil de mantener.

2. La solución: una interfaz común

Aquí entra:

ICheckInFlow

Una interface define un contrato.

Por ejemplo, conceptualmente:

interface ICheckInFlow {
  searchBooking(data: SearchBookingData): Promise<void>;
  selectPassenger(...): Promise<void>;
  selectSeat(...): Promise<void>;
  checkIn(): Promise<void>;
}

La interface no dice:

"Haz click en este botón."

Dice:

"Cualquier implementación de Check-In debe saber hacer estas operaciones."

Esto es importantísimo.

3. La interface no hace el trabajo

Supongamos:

const checkIn: ICheckInFlow;

Eso no significa que ICheckInFlow sepa cómo hacer:

click()
fill()
locator()

La interface solamente define:

¿Qué operaciones existen?

La implementación define:

¿Cómo se realizan?

Por ejemplo:

ICheckInFlow
     │
     ├── searchBooking()
     ├── selectPassenger()
     ├── selectSeat()
     └── checkIn()

Y después:

LiftAdapter
     │
     ├── searchBooking() → implementación Lift
     ├── selectPassenger() → implementación Lift
     └── ...

Mientras:

AviancaAdapter
     │
     ├── searchBooking() → implementación Avianca
     ├── selectPassenger() → implementación Avianca
     └── ...
4. Aquí aparece el Adapter

El Adapter es el componente que conoce las particularidades de una aerolínea.

Imagina:

class LiftAdapter implements ICheckInFlow {

Entonces tiene que cumplir el contrato:

searchBooking(...)
selectPassenger(...)
selectSeat(...)
checkIn(...)

Pero internamente puede hacer:

async searchBooking(data) {
    await this.page
        .getByRole('textbox', { name: 'Booking reference' })
        .fill(data.pnr);

    await this.page
        .getByRole('button', { name: 'Search' })
        .click();
}

Mientras que otra aerolínea podría necesitar:

async searchBooking(data) {
    await this.page
        .locator('#booking-code')
        .fill(data.pnr);

    await this.page
        .getByText('Find my booking')
        .click();
}

Los dos hacen:

searchBooking(...)

pero internamente trabajan diferente.

Eso es precisamente lo que estás consiguiendo con el Adapter.

5. Ahora entra la Factory

Tenemos varios adapters:

LiftAdapter
AviancaAdapter
CopaAdapter
...

La pregunta ahora es:

¿Quién decide cuál debo utilizar?

Ahí aparece:

AirlineFactory

Tu código hace:

AirlineFactory.getAdapter(airline, page);

Conceptualmente:

airline = "lift"
       ↓
AirlineFactory
       ↓
LiftAdapter

Si:

airline = "avianca"

entonces:

airline = "avianca"
       ↓
AirlineFactory
       ↓
AviancaAdapter

La Factory centraliza esa decisión.

6. Entonces tu línea completa

Ahora podemos expandir:

const checkIn = getCheckInFlow(airline);

Realmente representa algo parecido a:

TEST
 │
 │ getCheckInFlow("lift")
 ↓
Fixture
 │
 ↓
AirlineFactory
 │
 │ "lift"
 ↓
LiftAdapter
 │
 │ implements
 ↓
ICheckInFlow

Y el test solamente ve:

checkIn.searchBooking(...)

No necesita saber que existe:

LiftAdapter

ni:

AirlineFactory

ni cómo está construida la página.

7. Y aquí aparece una palabra muy importante: Abstraction

Tu test trabaja con:

ICheckInFlow

en lugar de trabajar directamente con:

LiftAdapter

Eso es abstraction.

El test sabe:

"Tengo un objeto que puede buscar una reserva."

No necesita saber:

"Tengo un objeto de tipo LiftAdapter que tiene un locator CSS específico para el input."

Esto reduce el coupling.

8. ¿Qué es coupling?

Coupling = qué tan dependiente está una pieza de otra.

Mira este test hipotético:

test('Lift check-in', async ({ page }) => {

  await page
    .locator('#booking-reference-input')
    .fill('ABC123');

  await page
    .locator('.search-booking-button')
    .click();

});

Este test tiene mucho conocimiento de Lift:

Test
 ├── #booking-reference-input
 ├── .search-booking-button
 └── Lift UI

Si Lift cambia:

#booking-reference-input

a:

[data-testid="booking-reference"]

el test puede romperse.

Con tu arquitectura:

await checkIn.searchBooking({
  pnr: passenger.bookingReference,
  lastName: passenger.lastName,
  firstName: passenger.firstName,
});

el test no conoce esos locators.

TEST
 │
 │ searchBooking()
 ↓
Adapter
 │
 │ locator details
 ↓
UI

Si cambia el locator, normalmente modificas el Adapter, no todos los tests.

9. Aquí empieza a aparecer SOLID

Sin meternos todavía profundamente en SOLID, ya estás utilizando algunas ideas.

Single Responsibility

Cada componente tiene una responsabilidad:

Fixture
→ lifecycle / dependency

Service
→ API

Factory
→ seleccionar implementación

Adapter
→ comportamiento específico de aerolínea

Flow
→ acciones de negocio/UI

No queremos:

AirlineFactory
 ├── llamar API
 ├── generar pasajeros
 ├── hacer clicks
 ├── cleanup
 └── leer archivos

Eso sería demasiada responsabilidad.

10. Lo más interesante: tu test se vuelve "business-oriented"

Mira tu test:

await checkIn.searchBooking({
  pnr: passenger.bookingReference,
  lastName: passenger.lastName,
  firstName: passenger.firstName,
});

Esto se parece mucho al lenguaje del negocio:

Search booking using PNR, last name and first name.

No:

Find textbox number 3 and type this value.

Ese cambio es muy importante en automation architecture.

Tu test describe qué quiere hacer el usuario, mientras que el Adapter/Flow describe cómo hacerlo en esa aerolínea.

11. Todo el recorrido

Ahora podemos juntar los módulos que hemos visto:

                         TEST
                           │
                           │
                  getCheckInFlow("lift")
                           │
                           ▼
                     ┌───────────┐
                     │  Fixture  │
                     └─────┬─────┘
                           │
                           ▼
                   AirlineFactory
                           │
                           │ "lift"
                           ▼
                    LiftAdapter
                           │
                           │ implements
                           ▼
                    ICheckInFlow
                           │
                           │ searchBooking()
                           ▼
                         Flow
                           │
                           ▼
                       Playwright
                           │
                           ▼
                        Browser
                           │
                           ▼
                           UI

Y por otro lado:

TEST
 │
 ├── getAirlineFlight()
 │        ↓
 │    flightStore
 │
 └── addedPassenger()
          ↓
      AirlineApiService
          ↓
       Airline API

Ahora se empieza a ver la arquitectura completa.

12. Una pregunta que quiero que te hagas

Mira estas dos opciones:

Opción A
const checkIn = getCheckInFlow('lift');

await checkIn.searchBooking(...);
Opción B
await page
  .locator('#booking-reference')
  .fill(passenger.bookingReference);

await page
  .locator('.search-button')
  .click();

La pregunta no es:

"¿Cuál funciona?"

Las dos pueden funcionar.

La pregunta arquitectónica es:

¿Qué conocimiento está obligado a tener el test?

En A:

Test
→ sabe que necesita buscar una reserva.

En B:

Test
→ sabe cómo funciona la UI específica.

Esa diferencia es una de las razones por las que se construyen frameworks de automation.

🎯 Tu siguiente ejercicio mental

Antes de continuar con más teoría, quiero que analicemos tu propio AirlineFactory.

Si me muestras ahora el código de:

AirlineFactory.ts

y, si es posible, uno de tus adapters, por ejemplo:

LiftAdapter.ts

podemos hacer algo mucho más interesante:

seguir literalmente una llamada como

getCheckInFlow('lift')

línea por línea, hasta llegar al locator que termina haciendo el click().

Ahí vas a ver cómo Fixture → Factory → Adapter → Interface → Flow → Playwright se conectan realmente en tu proyecto.

Vamos a seguir exactamente esta llamada:

const checkIn = getCheckInFlow('bermudair');
1. Primer salto: getCheckInFlow

Recordemos tu fixture:

getCheckInFlow: async ({ page }, use) => {
  const factory = (airline: string): ICheckInFlow => {
    return AirlineFactory.getAdapter(airline, page);
  };

  await use(factory);
},

Cuando tu test hace:

const checkIn = getCheckInFlow('bermudair');

ocurre:

Test
 │
 │ "bermudair"
 ↓
getCheckInFlow()
 │
 │ page
 ↓
AirlineFactory.getAdapter()

Aquí hay algo muy importante:

El fixture conoce page.

Pero el test no necesita conocer cómo se utiliza page.

El fixture hace ese trabajo de infraestructura.

2. Entramos a AirlineFactory

Tu Factory recibe:

static getAdapter(airline: string, page: Page): ICheckInFlow

Es decir:

airline = "bermudair"
page    = Playwright Page

Después:

const normalizedAirline = airline.toLowerCase();

Entonces:

"BERMUDAIR"
      ↓
"bermudair"

Esto evita problemas si alguien escribe:

'Bermudair'
'BERMUDAIR'
'bermudair'
3. La Factory toma una decisión

Luego:

switch (normalizedAirline) {

Y llega:

case 'bermudair':
  return new BermudairCheckInAdapter(page);

Aquí está el corazón del Factory Pattern.

La Factory dice:

"Me dieron bermudair. Yo sé qué implementación concreta corresponde."

Por tanto:

"bermudair"
      ↓
AirlineFactory
      ↓
BermudairCheckInAdapter

Mientras:

"lift"
  ↓
AirlineFactory
  ↓
LiftCheckInAdapter
4. Hay algo muy importante en el return

Mira esto:

return new BermudairCheckInAdapter(page);

Pero el método está declarado como:

static getAdapter(...): ICheckInFlow

Es decir:

La Factory promete devolver un ICheckInFlow.

Pero realmente devuelve:

BermudairCheckInAdapter

¿Cómo puede funcionar?

Porque:

class BermudairCheckInAdapter implements ICheckInFlow

Por tanto:

BermudairCheckInAdapter
        │
        │ implements
        ↓
   ICheckInFlow

Esto es polymorphism.

5. Esta parte es MUY importante

Tu variable en el test es:

const checkIn = getCheckInFlow('bermudair');

Conceptualmente TypeScript sabe que:

checkIn: ICheckInFlow

No necesitas hacer:

const checkIn: BermudairCheckInAdapter

Eso sería acoplar el test a Bermudair.

Tu test trabaja contra el contrato:

ICheckInFlow

No contra la implementación.

Esto es una de las ideas fundamentales de diseño:

Program to an interface, not an implementation.

6. Ahora viene BermudairCheckInAdapter

Se crea:

new BermudairCheckInAdapter(page)

Y entra al constructor:

constructor(private page: Page) {

Aquí TypeScript está haciendo algo muy interesante.

Esta línea:

constructor(private page: Page)

equivale conceptualmente a tener:

private page: Page;

constructor(page: Page) {
  this.page = page;
}

Por eso posteriormente el Adapter puede utilizar:

this.page
7. Pero observa lo que hace inmediatamente

Dentro del constructor:

this.homePage = new BermudairHomePage(page);

Después:

this.passengerSelectionPage =
  new BermudairPassengerSelectionPage(page);

Después:

this.seatConfirmationPage =
  new BermudairSeatConfirmationPage(page);

Y así sucesivamente.

Tu Adapter está construyendo todos los Page Objects que necesita.

La estructura queda:

BermudairCheckInAdapter
        │
        ├── BermudairHomePage
        │
        ├── BermudairPassengerSelectionPage
        │
        ├── BermudairSeatConfirmationPage
        │
        ├── BermudairSecurityTermsPage
        │
        └── BermudairBoardingPassPage
8. Aquí aparece otra capa arquitectónica

Antes teníamos:

Test
 ↓
Fixture
 ↓
Factory
 ↓
Adapter

Ahora tenemos:

Test
 ↓
Fixture
 ↓
Factory
 ↓
Adapter
 ↓
Page Objects
 ↓
Playwright
 ↓
Browser

Y esto es muy importante:

Adapter ≠ Page Object

No son la misma cosa.

9. ¿Cuál es la responsabilidad del Adapter?

El Adapter conoce el flujo de negocio.

Por ejemplo:

async searchBooking(criteria) {
  await this.homePage.navigateToCheckIn();
  await this.homePage.searchBooking(criteria);
}

Desde el punto de vista del negocio:

Search booking.

El Adapter coordina qué páginas necesita utilizar.

10. ¿Cuál es la responsabilidad del Page Object?

El Page Object conoce los detalles de una pantalla.

Por ejemplo, imaginemos que BermudairHomePage tiene:

async searchBooking(criteria) {
  await this.bookingInput.fill(criteria.pnr);
  await this.lastNameInput.fill(criteria.lastName);
  await this.searchButton.click();
}

Entonces:

Adapter
  ↓
"Quiero buscar una reserva"
  ↓
HomePage
  ↓
"Para hacerlo tengo que llenar estos inputs
 y pulsar este botón"
  ↓
Playwright

Esta separación es excelente porque cada capa responde una pregunta diferente.

11. Adapter = ¿Qué flujo debo ejecutar?

Por ejemplo:

async searchBooking(criteria) {
  await this.homePage.navigateToCheckIn();
  await this.homePage.searchBooking(criteria);
}

El Adapter está diciendo:

Para Bermudair, buscar una reserva implica navegar al check-in y ejecutar la búsqueda desde HomePage.

12. Page Object = ¿Cómo interactúo con la UI?

El Page Object contiene cosas como:

page.getByRole(...)
page.locator(...)
page.getByText(...)
.click()
.fill()

Entonces:

Adapter
  ↓
Business action
  ↓
Page Object
  ↓
UI interaction
13. Ahora veamos searchBooking() completo

Tu Adapter:

async searchBooking(criteria: BookingSearchCriteria): Promise<void> {
  await this.homePage.navigateToCheckIn();
  await this.homePage.searchBooking(criteria);
}

Supongamos que el test hace:

await checkIn.searchBooking({
  pnr: passenger.bookingReference,
  lastName: passenger.lastName,
  firstName: passenger.firstName,
});

El recorrido sería:

TEST
 │
 │ searchBooking(criteria)
 ↓
ICheckInFlow
 │
 │ runtime object = BermudairCheckInAdapter
 ↓
BermudairCheckInAdapter.searchBooking()
 │
 ├── homePage.navigateToCheckIn()
 │
 └── homePage.searchBooking(criteria)
          │
          ↓
       Playwright
          │
          ↓
        Browser

Esto es exactamente lo que antes te decía de abstraction.

El test solamente conoce:

searchBooking()
14. Ahora observa selectPassengers()

Tienes:

async selectPassengers(passengers: PassengerDetails[]): Promise<void> {
  if (passengers.length > 1) {
    throw new Error(
      '[BermudairCheckInAdapter] Group check-in is not implemented yet.'
    );
  }

  await this.passengerSelectionPage.confirmPassenger(passengers[0]);
}

Esto revela algo muy interesante de tu arquitectura.

La interface aparentemente permite:

PassengerDetails[]

es decir:

1 passenger
2 passengers
3 passengers
...

Pero Bermudair actualmente solo soporta:

1 passenger

Entonces el Adapter está traduciendo una capacidad general:

ICheckInFlow
    ↓
selectPassengers([])

a una capacidad específica:

Bermudair
    ↓
solo individual

Esto es precisamente una de las razones para utilizar Adapters.

15. Lo mismo sucede con los seats

Tienes:

async selectSeats(
  expected: SeatConfirmation | SeatConfirmation[]
): Promise<void>

Esto permite:

SeatConfirmation

o:

SeatConfirmation[]

Pero:

if (Array.isArray(expected)) {
  throw new Error(
    '[BermudairCheckInAdapter] Group check-in is not implemented yet.'
  );
}

Entonces:

ICheckInFlow
      │
      ├── individual
      └── group
              ↓
       Bermudair Adapter
              ↓
         individual ✅
         group ❌

El Adapter se encarga de esa diferencia.

16. Ahora viene una parte especialmente interesante

Mira:

private pendingContact?: ContactDetails;

Y después:

async provideContactDetails(
  contact: ContactDetails | { phones: string[] }
): Promise<void> {

  if ('phones' in contact) {
    throw new Error(
      '[BermudairCheckInAdapter] Group check-in is not implemented yet.'
    );
  }

  this.pendingContact = contact;
}

Aquí no estás haciendo ninguna interacción con Playwright.

Estás almacenando información:

provideContactDetails()
       ↓
this.pendingContact

¿Por qué?

El comentario explica:

Bermudair collects email/phone on the boarding-pass screen itself.

Por lo tanto el flujo general de tu interface probablemente espera:

provideContactDetails()
       ↓
confirmCheckIn()

Pero Bermudair no tiene una pantalla separada para eso.

Entonces el Adapter guarda temporalmente:

this.pendingContact

para utilizarlo posteriormente.

17. Esto es Adapter en estado puro

La interface dice:

"Debes soportar provideContactDetails()"

Pero Bermudair dice:

"Yo realmente no tengo una pantalla separada para eso."

Entonces el Adapter hace una traducción:

Generic flow
     │
     │ provideContactDetails()
     ↓
Bermudair Adapter
     │
     │ store data
     ↓
pendingContact

Y posteriormente:

confirmCheckIn()
     ↓
pendingContact
     ↓
boardingPassPage.completeAndDownload()
18. Mira el recorrido final

Ahora podemos dibujar prácticamente toda tu arquitectura:

                         TEST
                           │
                           │ getCheckInFlow("bermudair")
                           ▼
                    ┌──────────────┐
                    │   Fixture    │
                    └──────┬───────┘
                           │
                           ▼
                    AirlineFactory
                           │
                           │ "bermudair"
                           ▼
              BermudairCheckInAdapter
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             ▼             ▼              ▼
        HomePage      PassengerPage   SeatPage
             │             │              │
             └─────────────┼──────────────┘
                           │
                           ▼
                       Playwright
                           │
                           ▼
                        Browser

Y la interface está entre el consumidor y la implementación:

TEST
 │
 ↓
ICheckInFlow
 │
 ├───────────────┐
 ↓               ↓
LiftAdapter   BermudairAdapter
                  │
                  ↓
              Page Objects
19. Y ahora quiero mostrarte algo muy importante

Tu arquitectura permite que el test sea prácticamente independiente de la aerolínea.

Imagina:

const airline = 'bermudair';

const checkIn = getCheckInFlow(airline);

await checkIn.searchBooking(...);
await checkIn.selectPassengers(...);
await checkIn.selectSeats(...);
await checkIn.acceptSecurityAndTerms();
await checkIn.provideContactDetails(...);
await checkIn.confirmCheckIn();

Si mañana:

const airline = 'lift';

el test puede continuar utilizando:

checkIn.searchBooking()
checkIn.selectPassengers()
checkIn.selectSeats()
...

pero detrás cambia:

bermudair
   ↓
BermudairCheckInAdapter

por:

lift
   ↓
LiftCheckInAdapter

Ese es el gran beneficio arquitectónico.

20. Pero hay algo que debes tener muy claro

Esto no significa:

"El Adapter es siempre mejor que un Page Object."

No.

Son capas con responsabilidades diferentes.

Piensa:

Page Object

¿Cómo interactúo con esta pantalla?

Adapter

¿Cómo implemento este flujo para esta aerolínea?

Factory

¿Qué implementación necesito?

Interface

¿Qué capacidades debe ofrecer cualquier aerolínea?

Fixture

¿Cómo entrego y gestiono estas dependencias dentro del lifecycle de Playwright?

Y:

Test

¿Qué comportamiento quiero validar?

21. Tu arquitectura completa ahora

Con todo lo que hemos visto hasta ahora:

                         TEST
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       Test Data                     Check-In
             │                           │
             ▼                           ▼
        Fixtures                  getCheckInFlow()
             │                           │
             ▼                           ▼
       API Service                AirlineFactory
             │                           │
             ▼                    ┌──────┴──────┐
         Airline API              │             │
                                  ▼             ▼
                             LiftAdapter   BermudairAdapter
                                                 │
                                                 ▼
                                            Page Objects
                                                 │
                                                 ▼
                                            Playwright
                                                 │
                                                 ▼
                                             Browser

Y aquí ya puedes ver que Playwright es solo una parte de todo el sistema.

🧠 El concepto que quiero que te quede hoy

Cuando veas:

const checkIn = getCheckInFlow(airline);

ya no deberías verlo como:

"Estoy llamando una función."

Deberías leerlo como:

"Estoy pidiendo a mi automation framework una implementación del contrato ICheckInFlow correspondiente a esta aerolínea, utilizando el page que Playwright creó para este test."

Eso es un salto importante en tu nivel de comprensión.

Próximo paso

El siguiente módulo que encaja perfectamente es SOLID aplicado a tu framework, especialmente:

S — Single Responsibility
O — Open/Closed
L — Liskov Substitution
D — Dependency Inversion

No necesitamos estudiar SOLID como teoría abstracta. Podemos tomar tu BermudairCheckInAdapter, AirlineFactory, ICheckInFlow y BermudairHomePage y detectar exactamente dónde aparece cada principio.