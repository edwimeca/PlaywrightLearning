Módulo 7 — Interface Design + Capabilities

Hasta ahora tenemos:

ICheckInFlow

y varias implementaciones:

ICheckInFlow
    │
    ├── LiftCheckInAdapter
    └── BermudairCheckInAdapter

A primera vista parece perfecto.

Pero cuando miramos Bermudair encontramos esto:

if (passengers.length > 1) {
  throw new Error(
    '[BermudairCheckInAdapter] Group check-in is not implemented yet.'
  );
}

Aquí aparece una pregunta arquitectónica muy interesante:

¿Debería ICheckInFlow obligar a todas las aerolíneas a soportar exactamente las mismas operaciones?

1. El problema de una interface demasiado grande

Imagina que tienes:

interface ICheckInFlow {
  searchBooking(): Promise<void>;

  selectPassengers(): Promise<void>;

  selectSeats(): Promise<void>;

  acceptSecurityAndTerms(): Promise<void>;

  provideContactDetails(): Promise<void>;

  confirmCheckIn(): Promise<void>;

  downloadBoardingPass(): Promise<void>;

  checkInGroup(): Promise<void>;

  addBaggage(): Promise<void>;

  payAncillary(): Promise<void>;

  changeSeat(): Promise<void>;
}

Ahora tienes una aerolínea que solamente soporta:

Search booking
Individual check-in
Seat selection
Boarding pass

Pero TypeScript le exige implementar:

Group check-in
Baggage
Ancillaries
Seat change
...

Aunque esa aerolínea no tenga esas funcionalidades.

Eso empieza a ser un problema de diseño.

2. Aquí aparece Interface Segregation Principle

El I de SOLID significa:

Interface Segregation Principle (ISP)

Una forma sencilla de recordarlo:

No obligues a una clase a depender de métodos que no necesita.

En vez de tener una interface gigante:

ICheckInFlow
 ├── searchBooking
 ├── groupCheckIn
 ├── baggage
 ├── payment
 ├── seatChange
 └── ...

podrías pensar en pequeñas interfaces/capabilities:

ICheckInSearch
ICheckInPassengers
ISeatSelection
IContactDetails
IBoardingPass
IGroupCheckIn
3. ¿Cómo se vería conceptualmente?

Por ejemplo:

interface ICheckInSearch {
  searchBooking(criteria: BookingSearchCriteria): Promise<void>;
}

Luego:

interface ISeatSelection {
  selectSeats(
    expected: SeatConfirmation | SeatConfirmation[]
  ): Promise<void>;
}

Y:

interface IGroupCheckIn {
  selectPassengers(
    passengers: PassengerDetails[]
  ): Promise<void>;
}

Ahora una aerolínea puede implementar solamente las capacidades que realmente soporta.

4. Pero cuidado: no significa que debamos dividir todo

Esto es importante.

Al ver este problema podríamos caer en:

"Entonces creemos 20 interfaces."

No necesariamente.

Una arquitectura demasiado fragmentada también puede ser difícil de entender.

Por eso debemos buscar cohesión.

Una interface debería agrupar operaciones que realmente pertenecen juntas.

Por ejemplo:

ISeatSelection
    ↓
selectSeats()

tiene sentido.

Pero:

IPassengerName
    ↓
getFirstName()

probablemente sería absurdo.

5. Volvamos a tu caso real

Actualmente tienes:

interface ICheckInFlow

que probablemente representa el flujo completo:

Search
   ↓
Passenger
   ↓
Seat
   ↓
Security
   ↓
Contact
   ↓
Check-in
   ↓
Boarding pass

Para una suite de automation esto tiene una ventaja enorme:

Los tests son muy simples.

Puedes hacer:

await checkIn.searchBooking(...);

await checkIn.selectPassengers(...);

await checkIn.selectSeats(...);

await checkIn.acceptSecurityAndTerms();

await checkIn.confirmCheckIn();

Eso es muy legible.

6. Entonces, ¿por qué tenemos el problema de Group Check-In?

Porque tu interface aparentemente representa el flujo general, pero las aerolíneas pueden tener diferentes capacidades.

Por ejemplo:

                 Check-In
                    │
        ┌───────────┼───────────┐
        │           │           │
       Lift      Bermudair    Airline X
        │           │           │
        ├── Group   ├── No     ├── Group
        │           │           │
        ├── Seats   ├── Seats  ├── Seats
        │           │           │
        └── ...     └── ...    └── ...

La pregunta entonces es:

¿Las diferencias pertenecen al Adapter o pertenecen al contrato?

7. Aquí entra Composition

Una solución más avanzada es Composition.

En vez de decir:

"Toda aerolínea es exactamente un ICheckInFlow con todas estas capacidades."

podríamos pensar:

Bermudair
 ├── SearchCapability
 ├── IndividualCheckInCapability
 ├── SeatSelectionCapability
 ├── SecurityCapability
 └── BoardingPassCapability

Mientras:

Lift
 ├── SearchCapability
 ├── IndividualCheckInCapability
 ├── GroupCheckInCapability
 ├── SeatSelectionCapability
 ├── SecurityCapability
 └── BoardingPassCapability

Ahora la diferencia queda explícita.

8. Pero hay una cuestión todavía más importante

¿Cómo sabe el test si una aerolínea soporta Group Check-In?

No queremos hacer esto:

if (airline === 'lift') {
   await checkIn.groupCheckIn();
}

Porque volveríamos a meter conocimiento de la aerolínea dentro del test.

Eso destruye parte de la abstracción que construimos.

9. Una alternativa: capabilities

Podríamos tener algo conceptualmente parecido a:

checkIn.capabilities.groupCheckIn

Entonces:

if (checkIn.capabilities.groupCheckIn) {
    // execute group flow
}

La ventaja es que el test pregunta:

¿Esta implementación soporta esta capacidad?

en lugar de preguntar:

¿Qué aerolínea estoy usando?

Eso es mucho más desacoplado.

10. Esto es muy parecido a lo que haces en tu trabajo de QA

Piensa en una matriz:

Capability	Lift	Bermudair
Individual check-in	✅	✅
Group check-in	✅	❌
Seat selection	✅	✅
Security terms	✅	✅
Contact details	✅	✅
Boarding pass	✅	✅

Eso es prácticamente un Capability Matrix.

Tu arquitectura puede representar esa realidad.

11. ¿Y qué pasa con tu provideContactDetails()?

Aquí tienes:

async provideContactDetails(
  contact: ContactDetails | { phones: string[] }
): Promise<void> {

y:

if ('phones' in contact) {
  throw new Error(...);
}

Esto también nos está diciendo algo.

Tu modelo está intentando soportar dos escenarios:

Individual
   ↓
ContactDetails

Group
   ↓
{ phones: string[] }

Pero Bermudair solamente soporta uno.

Eso es otra señal de que quizás el modelo genérico está intentando cubrir demasiados casos.

12. Una arquitectura alternativa

En lugar de:

provideContactDetails(
  ContactDetails | { phones: string[] }
)

podrías eventualmente tener capacidades separadas:

IIndividualContactDetails
        │
        └── provideContactDetails(ContactDetails)

IGroupContactDetails
        │
        └── provideGroupContactDetails(phones)

Entonces Bermudair implementaría:

IIndividualContactDetails

y no tendría que implementar:

IGroupContactDetails
13. ¿Esto significa que debemos refactorizar tu proyecto?

No todavía.

De hecho, te recomiendo no hacerlo ahora.

Estamos aprendiendo a detectar problemas arquitectónicos, no a modificar código solamente porque conocemos un patrón nuevo.

Tu arquitectura actual puede ser perfectamente válida.

La pregunta correcta es:

¿Las diferencias entre aerolíneas son suficientemente grandes como para justificar una arquitectura de capabilities?

Si tienes:

2–4 airlines

probablemente tu solución actual sea perfectamente manejable.

Si eventualmente tienes:

15–30 airlines

con capacidades muy diferentes, entonces este tipo de diseño empieza a ser mucho más valioso.

14. Una regla de oro

Cuando diseñes interfaces para automation, piensa:

❌ Mala pregunta

"¿Qué métodos necesito para esta clase?"

✅ Buena pregunta

"¿Qué contrato necesita el consumidor y qué capacidades son realmente comunes?"

Eso cambia completamente cómo diseñas el framework.

15. Ahora conectemos todo lo aprendido

Ya tenemos:

                   PLAYWRIGHT
                       │
                       ▼
                   Fixtures
                       │
                       ▼
                Dependency Injection
                       │
                       ▼
                    Factory
                       │
                       ▼
                   Interface
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       LiftAdapter        BermudairAdapter
             │                   │
             └─────────┬─────────┘
                       ▼
                 Page Objects
                       │
                       ▼
                  Playwright
                       │
                       ▼
                    Browser

Y ahora sabemos que:

Interface
    ↓
debe representar un contrato razonable

y:

Capabilities
    ↓
permiten representar diferencias reales
entre implementaciones.
16. El siguiente módulo: Test Data Architecture

Hasta ahora hemos estudiado principalmente la UI architecture:

Fixture
 ↓
Factory
 ↓
Adapter
 ↓
Page Object
 ↓
Playwright

Pero en tu proyecto tienes otra arquitectura paralela:

Test
 ↓
Fixture
 ↓
AirlineApiService
 ↓
API

y además:

Flight Store
Passenger Factory
Group Passenger Factory
Random Data
Cleanup

Por eso el siguiente módulo que te propongo es:

Módulo 8 — Test Data Factory + Test Data Lifecycle

Aquí vamos a analizar algo muy cercano a tu trabajo actual:

const flight = await getAirlineFlight(airline);

const passenger =
    await addedPassenger(flight, airline);

y responder:

¿Por qué flight y passenger se consideran test data?
¿Cuál es la diferencia entre test data generation y test data setup?
¿Por qué addedPassenger es una Factory pero también es Fixture?
¿Dónde debería generarse un PNR?
¿Quién debería crear el vuelo?
¿Quién debería hacer cleanup?
¿Qué pasa cuando necesitas 3 pasajeros con el mismo booking reference?
¿Cómo diseñarías esto para ejecutar 20 tests en paralelo sin que los datos choquen?

Ese último punto —parallel execution + test data isolation— es donde la arquitectura de automation empieza a ponerse realmente interesante.