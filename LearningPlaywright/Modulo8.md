Module 8 — Test Data Factory & Lifecycle

En tu framework ya tienes algo muy interesante:

const flight = await getAirlineFlight(airline);
const passenger = await addedPassenger(flight, airline);

Aunque parece sencillo, detrás de esas dos líneas estás resolviendo varios problemas importantes de automation engineering:

Test
 │
 ├── Obtener Test Data existente
 │       └── Flight
 │
 └── Generar Test Data
         └── Passenger
               ├── Booking
               ├── PNR
               ├── Passenger data
               └── Cleanup

La idea principal de este módulo es aprender a distinguir qué datos necesita un test, quién los crea, cuánto viven y quién los elimina.

1. ¿Qué es Test Data?

Test Data es cualquier información que necesitas para ejecutar un escenario.

En tu caso:

const flight = await getAirlineFlight(airline);

flight es Test Data.

Y:

const passenger = await addedPassenger(flight, airline);

passenger también es Test Data.

Por ejemplo:

flight = {
    flightNumber: 'IN5005',
    departureStation: 'PEI',
    arrivalStation: 'BOG',
    departureDate: '2026-09-20'
}

Y:

passenger = {
    firstName: 'Edwin',
    lastName: 'Mejia',
    bookingReference: 'ABC123'
}

Tu test necesita ambos:

Flight
   +
Passenger
   ↓
Web Check-in
2. Test Data Generation vs Test Data Setup

Esta diferencia es muy importante.

Test Data Setup

Significa preparar datos que ya deben existir antes del test.

Por ejemplo:

const flight = getAirlineFlight('lift');

El flight ya fue creado anteriormente por tu global-setup.

Entonces:

global-setup
      ↓
Create Flight
      ↓
Save Flight
      ↓
Test
      ↓
getAirlineFlight()

El test no crea el flight.

Simplemente recupera información existente.

Test Data Generation

Ahora mira esto:

const passenger = await addedPassenger(flight, airline);

Aquí sí estás generando un nuevo dato.

Existing Flight
      ↓
addedPassenger()
      ↓
Create Passenger
      ↓
Create Booking
      ↓
Return Passenger Data

Por eso tu addedPassenger funciona como un Test Data Factory.

3. ¿Por qué addedPassenger es un Factory?

Observa esta parte:

const factory = async (
    flight: AddedFlightResult,
    airline: string
): Promise<AddedPassengerResult> => {

    const { cleanup, ...passenger } =
        await apiService.addPassenger(airline, flight);

    cleanups.push(cleanup);

    return passenger;
};

La función recibe:

flight
airline

y produce:

passenger

Conceptualmente:

Input
 ├── Flight
 └── Airline

        ↓

   Passenger Factory

        ↓

Output
 └── Passenger

Eso es exactamente el comportamiento de un Factory:

Given some input, create an object/data with the characteristics required by the caller.

4. Pero hay algo más interesante

Tu addedPassenger no es solamente un Factory.

También es un Fixture.

¿Por qué?

Porque está dentro de:

base.extend<CustomFixtures>({

y utiliza:

await use(factory);

Además, tiene lifecycle management:

const cleanups: Array<() => Promise<void>> = [];

y después:

for (const cleanup of cleanups) {
    await cleanup();
}

Entonces podemos decir:

addedPassenger
      │
      ├── Fixture
      │     └── Playwright lifecycle / DI
      │
      └── Factory
            └── Creates test data

Esta distinción es muy importante.

Factory describe qué hace la función.

Fixture describe cómo Playwright administra esa función y su lifecycle.

5. ¿Por qué no generar el Passenger directamente en el test?

Podrías hacer algo así:

const passenger = await apiService.addPassenger(
    airline,
    flight
);

Pero entonces el test tendría que conocer:

AirlineApiService
cómo crear el passenger
cómo crear el booking
cómo hacer cleanup
cómo manejar los datos generados

El test empezaría a tener responsabilidades que no le corresponden.

Tu arquitectura actual hace esto:

const passenger = await addedPassenger(flight, airline);

Y eso es mucho más limpio.

El test expresa:

"I need a passenger for this flight."

No necesita saber cómo se crea.

6. ¿Quién debe crear el Flight?

Aquí aparece una decisión arquitectónica interesante.

Actualmente tienes:

getAirlineFlight(airline)

que hace:

const flights = readFlights();

Por lo tanto:

global-setup
     ↓
creates flights
     ↓
flightStore
     ↓
getAirlineFlight()
     ↓
test

Esto tiene una ventaja importante:

Evitas crear un flight para cada test.

Imagina que tienes:

100 tests

y cada test crea:

Flight
Passenger
Booking

Tendrías:

100 Flights
100 Passengers
100 Bookings

Eso puede ser innecesariamente costoso y además puede generar problemas de concurrencia.

Tu diseño actual puede ser:

GLOBAL TEST DATA

Flight A
Flight B
Flight C
   │
   ├── Test 1 → Passenger
   ├── Test 2 → Passenger
   ├── Test 3 → Passenger
   └── Test 4 → Passenger

Eso es perfectamente válido si los tests no modifican el flight de una manera que afecte a otros tests.

7. Ahora viene el problema importante: Parallel Execution

Supongamos que Playwright ejecuta:

Test A
Test B
Test C
Test D

simultáneamente.

Todos podrían usar:

flight = IN5005

Eso no necesariamente es un problema.

Podemos tener:

IN5005
 │
 ├── Booking ABC123
 │
 ├── Booking XYZ456
 │
 ├── Booking KLM789
 │
 └── Booking QWE321

El flight es compartido.

Los pasajeros/bookings son independientes.

Esto es una buena estrategia si el sistema permite múltiples bookings en el mismo flight.

8. ¿Qué pasaría si generamos datos estáticos?

Imagina que tu Factory hiciera:

return {
    firstName: 'Edwin',
    lastName: 'Mejia',
    bookingReference: 'ABC123'
};

Ahora:

Test 1 → ABC123
Test 2 → ABC123
Test 3 → ABC123
Test 4 → ABC123

Eso es peligroso.

Podrías tener:

Test 1 modifies ABC123
Test 2 modifies ABC123
Test 3 deletes ABC123
Test 4 searches ABC123

Resultado:

💥 Data collision

9. Por eso necesitas Data Isolation

Cada test debería tener datos suficientemente aislados.

Por ejemplo:

Test 1
 └── PNR A1B2C3

Test 2
 └── PNR D4E5F6

Test 3
 └── PNR G7H8I9

Todos pueden usar:

Flight IN5005

pero cada uno tiene su propio booking.

Esto es especialmente importante cuando ejecutas:

npx playwright test --workers=4

o:

npx playwright test --workers=8
10. ¿Quién genera el PNR?

Aquí tienes otra decisión arquitectónica.

Hay dos posibilidades.

Option A — API generates the PNR
Test
 ↓
addedPassenger()
 ↓
API
 ↓
Booking created
 ↓
PNR returned

Esta suele ser una buena opción si el sistema es responsable de generar el PNR.

Tu test recibe:

passenger.bookingReference

sin preocuparse por cómo se generó.

Option B — Test Data Factory generates the PNR

Por ejemplo:

const pnr = generateRandomPNR();

y luego:

apiService.createBooking({
    bookingReference: pnr
});

Aquí tu automation framework controla el valor.

¿Cuándo sería útil?

Cuando la API permite proporcionar el identificador y necesitas garantizar unicidad.

11. Lo importante es separar responsabilidades

Una arquitectura limpia podría verse así:

Test
 │
 │ "Give me a passenger"
 ↓
Test Data Factory
 │
 │ creates test data
 ↓
API Service
 │
 │ communicates with system
 ↓
Airline API

Es decir:

Test

Decide qué necesita.

const passenger = await addedPassenger(flight, airline);
Factory

Decide qué datos generar.

addedPassenger(...)
Service

Decide cómo comunicarse con la API.

apiService.addPassenger(...)
API

Decide cómo crear realmente el booking/passenger.

12. Ahora mira tu cleanup

Esta parte de tu código es particularmente buena:

const { cleanup, ...passenger } =
    await apiService.addPassenger(airline, flight);

cleanups.push(cleanup);

No solamente generas datos.

También registras cómo eliminarlos.

Conceptualmente:

Create
  ↓
Data
  ↓
Register Cleanup
  ↓
Test
  ↓
Cleanup

Esto se conoce como Test Data Lifecycle.

13. ¿Qué significa Lifecycle?

Un dato tiene un ciclo de vida:

        CREATE
           ↓
        ACTIVE
           ↓
       USED BY TEST
           ↓
        CLEANUP
           ↓
        DELETED

En tu caso:

addedPassenger()
       ↓
API creates passenger
       ↓
cleanup registered
       ↓
test runs
       ↓
fixture finishes
       ↓
cleanup()

Y eso ocurre independientemente de que el test pase o falle, porque el código después de:

await use(factory);

forma parte del lifecycle de la fixture.

14. ¿Por qué esto es mejor que hacer cleanup en el test?

Evita cosas como:

test('check-in', async (...) => {

    const passenger = await createPassenger();

    // test

    await deletePassenger(passenger);
});

El problema es:

¿Qué pasa si el test falla antes?

const passenger = await createPassenger();

// ❌ test fails here

await deletePassenger(passenger);

El cleanup nunca se ejecuta.

Entonces puedes terminar con:

Database
 ├── Passenger 1
 ├── Passenger 2
 ├── Passenger 3
 ├── Passenger 4
 ├── Passenger 5
 └── Passenger 6

Tu fixture evita este problema.

15. Una observación avanzada sobre tu código

Tu cleanup actual es:

for (const cleanup of cleanups) {
    await cleanup();
}

Esto significa que los cleanups se ejecutan secuencialmente.

Por ejemplo:

cleanup 1
   ↓
cleanup 2
   ↓
cleanup 3

Eso es normalmente más seguro que hacer:

await Promise.all(cleanups.map(cleanup => cleanup()));

porque algunas APIs pueden tener dependencias o límites de concurrencia.

No significa que tu implementación actual sea la única correcta; simplemente es una decisión conservadora.

16. Ahora pensemos en 3 passengers

Tu framework tiene:

addedPassengerGroup

que hace:

const { cleanup, passengers } =
    await apiService.addPassengerGroup(
        airline,
        flight,
        groupSize
    );

Supongamos:

const passengers =
    await addedPassengerGroup(flight, airline, 3);

Podríamos tener:

Booking ABC123
 │
 ├── Edwin Mejia
 ├── John Smith
 └── Mary Jones

Los tres pasajeros pertenecen al mismo booking.

Esto es diferente de:

Booking ABC123
 └── Edwin

Booking DEF456
 └── John

Booking GHI789
 └── Mary

Por eso addedPassengerGroup() no es simplemente llamar tres veces a:

addedPassenger()

porque el business requirement es diferente.

17. Esto nos lleva a una regla muy importante

Test Data Factory debe modelar el business scenario, no simplemente generar objetos.

Por ejemplo:

addedPassenger()

representa:

Individual passenger booking

Mientras:

addedPassengerGroup()

representa:

Group booking

Y en el futuro podrías tener:

addedPassengerWithInfant()

o:

addedCrewPassenger()

o:

addedStandbyPassenger()

La pregunta arquitectónica será:

¿Cuándo crear una nueva Factory y cuándo agregar opciones a una Factory existente?

Ese será un tema importante cuando avancemos.

18. Tu arquitectura actual, vista como un sistema

Ahora podemos entender mucho mejor tu framework:

                    PLAYWRIGHT TEST
                          │
                          ▼
                    CUSTOM FIXTURES
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
 getAirlineFlight   addedPassenger   getCheckInFlow
          │               │                │
          ▼               ▼                ▼
    Flight Store     Test Data        AirlineFactory
                          │                │
                          ▼                ▼
                    API Service       Adapter
                          │                │
                          ▼                ▼
                       API          Page Objects
                                           │
                                           ▼
                                       Playwright
                                           │
                                           ▼
                                        Browser

Esto ya no es simplemente:

"Estoy writing Playwright tests."

Estás construyendo un automation framework alrededor de Playwright.

19. La pregunta de nivel avanzado

Ahora quiero que empieces a pensar como Automation Architect.

Supongamos que mañana tienes:

20 workers
500 tests
10 airlines

Y todos ejecutan simultáneamente.

Tenemos:

Flights
Bookings
Passengers
Seats
PNRs
API data
UI state

La pregunta ya no es:

"How do I create a passenger?"

La pregunta es:

"How do I guarantee that every test receives valid, isolated, predictable and clean test data?"

Ese cambio de mentalidad es fundamental.

🧠 Exercise — Module 8

Quiero que analices tu framework actual y respondas estas 5 preguntas sin modificar código todavía:

1.

¿Por qué crees que flight se obtiene mediante:

getAirlineFlight(airline)

pero passenger se genera mediante:

addedPassenger(flight, airline)

?

2.

¿Qué problema podría aparecer si addedPassenger() siempre devolviera:

bookingReference: 'ABC123'

?

3.

¿Por qué crees que cleanup está dentro de addedPassenger y no dentro del test?

4.

Si tienes:

const passenger1 = await addedPassenger(flight, airline);
const passenger2 = await addedPassenger(flight, airline);
const passenger3 = await addedPassenger(flight, airline);

¿Esperarías que los tres tengan el mismo bookingReference o diferentes?

Y más importante: ¿qué comportamiento debería tener el sistema si tu objetivo fuera crear un group booking?

5. La más importante:

Si mañana tienes 500 tests ejecutándose en paralelo, ¿qué elementos de tu Test Data crees que podrían generar data collisions?

Piensa específicamente en:

Flight
PNR
Passenger
Seat
Booking
Dates

No necesito que aciertes todo. Lo importante es que empieces a identificar dónde está el riesgo de diseño.

Cuando respondamos estas cinco, el siguiente paso será Module 9 — Parallel Execution, Isolation & Concurrency, donde conectaremos esto con workers, projects, testInfo, unique data y cómo diseñar un framework que pueda crecer sin volverse frágil.