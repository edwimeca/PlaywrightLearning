Módulo 4 — Fixture vs Helper vs Service

El objetivo de este módulo es que cuando veas una función en tu proyecto puedas preguntarte:

¿Esto debería ser un Fixture, un Helper o un Service? ¿Por qué?

Y más adelante vamos a agregar Factory, Adapter y Flow a esta misma clasificación.

1. Primero: los tres conceptos

Piensa en ellos así:

Helper
  ↓
"Necesito una función reutilizable"

Service
  ↓
"Necesito comunicarme con un sistema externo"

Fixture
  ↓
"Necesito que Playwright me entregue algo
 y controle su lifecycle/dependencias"

Esta diferencia parece sencilla, pero es fundamental.

2. Helper

Un Helper normalmente es una función sencilla y reutilizable.

Por ejemplo:

export function generateRandomName(): string {
  return `User${Math.floor(Math.random() * 10000)}`;
}

Puedes utilizarla desde cualquier lugar:

const name = generateRandomName();

El helper normalmente:

no conoce page
no necesita request
no depende del lifecycle de Playwright
no necesita use()
no necesita cleanup
simplemente recibe datos y devuelve datos

Por ejemplo, en tu proyecto:

readFlights()

es conceptualmente mucho más cercano a un Helper.

Hace algo como:

flightStore
     ↓
readFlights()
     ↓
flights

No necesita Playwright para existir.

3. Service

Ahora imagina esto:

await apiService.addPassenger(airline, flight);

Aquí ya tenemos una responsabilidad diferente.

El AirlineApiService sabe comunicarse con una API.

Por ejemplo, internamente podría hacer:

async addPassenger(airline, flight) {

  const response = await this.request.post(
    '/passenger/add',
    {
      data: {...}
    }
  );

  return response;
}

El test no debería preocuparse por todos esos detalles.

Tenemos:

TEST
 │
 │ addPassenger()
 ↓
AirlineApiService
 │
 │ HTTP POST
 ↓
API

El Service encapsula la comunicación con un sistema externo.

Regla mental

Si piensas:

"Esto sabe cómo hablar con una API"

probablemente estás frente a un Service.

4. Fixture

Aquí aparece la diferencia importante.

Tu fixture:

addedPassenger

podría parecer simplemente una función:

async function addedPassenger(...) {
   ...
}

Pero no es simplemente eso.

Tu fixture hace:

addedPassenger: async ({ apiService }, use) => {

Observa que depende de:

apiService

Y después:

await use(factory);

Y finalmente:

for (const cleanup of cleanups) {
    await cleanup();
}

Ahí está la diferencia.

Tu fixture está participando en el lifecycle de Playwright.

5. Veamos tu arquitectura real

Tu código puede simplificarse conceptualmente así:

TEST
 │
 │ asks for
 ↓
addedPassenger
 │
 │ uses
 ↓
apiService
 │
 │ calls
 ↓
AirlineApiService
 │
 │ HTTP
 ↓
AIRLINE API

Pero además:

addedPassenger
      │
      ├── creates passenger
      │
      ├── stores cleanup
      │
      └── cleanup after test

Por eso addedPassenger tiene sentido como Fixture.

6. ¿Por qué no hacer addedPassenger solamente como Helper?

Esta es una excelente pregunta arquitectónica.

Imagina:

export async function addPassenger(
  flight,
  airline,
  apiService
) {
   ...
}

Podrías hacerlo.

Pero ahora el test tendría que preocuparse por:

const passenger = await addPassenger(
  flight,
  airline,
  apiService
);

Y además tendrías que resolver quién hace:

cleanup

y cuándo.

Con tu fixture:

const passenger = await addedPassenger(flight, airline);

el test solamente expresa:

"Necesito un pasajero."

Y Playwright controla el lifecycle.

7. Una forma muy útil de verlo
Helper
generateRandomName()

Pregunta:

¿Necesito Playwright para ejecutar esto?

No.

Service
apiService.addPassenger()

Pregunta:

¿Esto representa comunicación con una API o sistema externo?

Sí.

Fixture
addedPassenger(...)

Pregunta:

¿Necesito que Playwright gestione dependencias y lifecycle?

Sí.

8. Ahora mira getCheckInFlow

Tienes:

getCheckInFlow: async ({ page }, use) => {

Aquí inmediatamente aparece una pista:

page

page es un recurso de Playwright.

Después haces:

AirlineFactory.getAdapter(airline, page);

Entonces:

Playwright page
       ↓
getCheckInFlow
       ↓
AirlineFactory
       ↓
Airline Adapter

Aquí sí tiene mucho sentido que sea un fixture, porque necesita el page que Playwright creó para ese test.

No sería conveniente convertir simplemente todo esto en:

function getCheckInFlow() {}

porque entonces tendrías que resolver cómo entregarle correctamente el page.

9. ¿Y getAirlineFlight?

Aquí tenemos un caso interesante.

Tu fixture:

getAirlineFlight: async ({}, use) => {
    const flights = readFlights();

    const factory = (airline: string): AddedFlightResult => {
        const flight = flights[airline];

        if (!flight) {
            throw new Error(...);
        }

        return flight;
    };

    await use(factory);
},

Observa algo:

No usa:

page

No usa:

request

No necesita cleanup.

Simplemente hace:

readFlights()

y devuelve un vuelo.

Por eso este componente está en una zona gris interesante.

Podría ser un fixture:

getAirlineFlight

como actualmente.

Pero conceptualmente también podría ser un helper:

getAirlineFlight(airline)

dependiendo de cómo quieras organizar el acceso al flightStore.

Esto nos enseña algo importante:

No existe una regla que diga que todo debe ser Fixture.

La arquitectura es una cuestión de responsabilidades.

10. Ahora construyamos una tabla mental
Componente	Responsabilidad
readFlights()	Leer datos
generateRandom...()	Generar datos
AirlineApiService	Comunicarse con API
apiService fixture	Crear/injectar Service usando request
addedPassenger fixture	Crear datos + lifecycle + cleanup
getAirlineFlight fixture	Exponer acceso al flight store
AirlineFactory	Decidir qué Adapter crear
Adapter	Implementar comportamiento específico de una aerolínea
ICheckInFlow	Definir contrato común
Flow	Ejecutar acciones de negocio/UI
page	Automatizar el browser

Fíjate que ahora cada pieza tiene una responsabilidad diferente.

11. El principio que estás aprendiendo

Esto nos lleva a uno de los principios más importantes de arquitectura:

Separation of Concerns

No queremos que una sola clase haga esto:

Test
 ├── genera pasajeros
 ├── genera nombres
 ├── llama API
 ├── crea vuelos
 ├── busca elementos
 ├── hace clicks
 ├── decide qué aerolínea utilizar
 ├── hace cleanup
 └── valida resultados

Queremos separar:

Test
 │
 ├── Fixture
 │
 ├── Data Factory
 │
 ├── Service
 │
 ├── Factory
 │
 ├── Adapter
 │
 └── Flow

Y cada capa tiene una responsabilidad.

12. Y aquí aparece algo muy importante

Tu test:

const flight = await getAirlineFlight(airline);

const passenger =
    await addedPassenger(flight, airline);

const checkIn =
    getCheckInFlow(airline);

await checkIn.searchBooking({
    pnr: passenger.bookingReference,
    lastName: passenger.lastName,
    firstName: passenger.firstName,
});

parece muy sencillo.

Pero detrás de esas 4 líneas tienes una arquitectura bastante grande:

                    TEST
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
     Flight       Passenger    CheckIn
     Fixture       Fixture      Fixture
          │           │            │
          ↓           ↓            ↓
    flightStore    API Service   Factory
                                  │
                                  ↓
                               Adapter
                                  │
                                  ↓
                              ICheckInFlow
                                  │
                                  ↓
                               Playwright
                                  │
                                  ↓
                               Browser

Eso es precisamente lo que quiero que aprendas a leer.

No solamente:

"¿Qué comando de Playwright hace esto?"

sino:

"¿Qué responsabilidad tiene cada componente y por qué está en esa capa?"

Siguiente paso

Ahora que entendemos Fixture vs Helper vs Service, el siguiente concepto que encaja perfectamente es:

¿Por qué tu proyecto necesita AirlineFactory + Adapter + ICheckInFlow?

Ahí vamos a estudiar Factory + Adapter + Interface, pero utilizando exactamente este flujo:

const checkIn = getCheckInFlow(airline);

y vamos a seguir esa línea desde el test hasta el botón que finalmente se pulsa en el navegador.

Ese análisis te va a aclarar probablemente la parte más importante de la arquitectura que tienes actualmente.