Module 3 — Playwright Fixtures
3.1 ¿Qué es un Fixture?

Un fixture es, básicamente, un recurso que Playwright prepara y entrega a tu test cuando lo necesita.

Ya estás usando uno aunque quizá no lo habías pensado así:

test('Check-in passenger', async ({ page }) => {
    // ...
});

Ese:

{ page }

es un fixture de Playwright.

Playwright se encarga de:

crear browser
     ↓
crear browser context
     ↓
crear page
     ↓
entregar page al test
     ↓
ejecutar test
     ↓
limpiar recursos

Tú no tienes que hacer manualmente:

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

Playwright lo gestiona.

3.2 ¿Por qué crear nuestros propios fixtures?

Aquí empieza a ponerse interesante para tu proyecto.

Supongamos que cada test necesita un pasajero.

Sin fixture podrías terminar haciendo:

test('Check-in passenger', async ({ page, request }) => {

    const passenger = await createPassenger(request);

    // test...
});

Y luego:

test('Change seat', async ({ page, request }) => {

    const passenger = await createPassenger(request);

    // test...
});

Y:

test('Print boarding pass', async ({ page, request }) => {

    const passenger = await createPassenger(request);

    // test...
});

Estamos repitiendo:

await createPassenger(request);

Aquí un fixture puede encargarse de eso.

3.3 Nuestro fixture passenger

Podríamos crear algo como:

type Passenger = {
    firstName: string;
    lastName: string;
    bookingReference: string;
    flightNumber: string;
    seat: string;
};

Y luego crear un fixture que entregue:

{ passenger }

De esta manera nuestro test puede simplemente hacer:

test('Check-in passenger', async ({ page, passenger }) => {

    console.log(passenger.firstName);
    console.log(passenger.bookingReference);

});

Observa la diferencia:

Antes
Test
 ↓
Create passenger
 ↓
Receive data
 ↓
Use data
Con fixture
Fixture
 ↓
Create passenger
 ↓
Prepare data
 ↓
        ┌── Test 1
        ├── Test 2
        └── Test 3

El test recibe el recurso ya preparado.

3.4 Un fixture personalizado

Supongamos que tenemos:

tests/
   checkin.spec.ts

fixtures/
   passenger.fixture.ts

helpers/
   passenger.helper.ts

Nuestro fixture podría tener esta estructura:

import { test as base } from '@playwright/test';

type Passenger = {
    firstName: string;
    lastName: string;
    bookingReference: string;
};

type Fixtures = {
    passenger: Passenger;
};

export const test = base.extend<Fixtures>({
    passenger: async ({ request }, use) => {

        const passenger = await createPassenger(request);

        await use(passenger);
    },
});

No te preocupes todavía si algunas partes parecen nuevas.

Quiero que entiendas primero el concepto.

3.5 ¿Qué significa use()?

Esta parte:

await use(passenger);

es fundamental.

Puedes pensar en use() como:

"Playwright, aquí tienes el recurso que debe estar disponible para el test."

Tenemos:

createPassenger()
       ↓
   passenger
       ↓
    use()
       ↓
      TEST

Por ejemplo:

passenger: async ({ request }, use) => {

    const passenger = await createPassenger(request);

    await use(passenger);
}

El test recibe ese passenger.

3.6 ¿Qué ocurre después del test?

Los fixtures también pueden tener una fase de cleanup.

Por ejemplo:

passenger: async ({ request }, use) => {

    const passenger = await createPassenger(request);

    await use(passenger);

    await deletePassenger(request, passenger);
}

Conceptualmente:

BEFORE TEST
     ↓
Create passenger
     ↓
use(passenger)
     ↓
TEST RUNS
     ↓
Test finishes
     ↓
Delete passenger
     ↓
CLEANUP

Esto es muy poderoso.

Puedes crear:

booking
passenger
flight
seat
authorization
API token

como fixtures y controlar su ciclo de vida.

3.7 Algo muy importante: Fixture ≠ Helper

Esto es importante para tu arquitectura porque ya tienes una carpeta helper.

Helper

Una función reutilizable:

export function generatePassenger() {
    return {
        firstName: 'Edwin',
        lastName: 'Mejia'
    };
}

El helper hace una tarea.

Fixture

Controla un recurso que el test necesita:

passenger: async ({ request }, use) => {

    const passenger = await createPassenger(request);

    await use(passenger);
}

El fixture controla:

setup
 ↓
resource
 ↓
test
 ↓
cleanup

Por eso no deberíamos meter absolutamente todo en fixtures.

3.8 Tu arquitectura podría evolucionar hacia esto
                    Playwright Test
                          │
                          ▼
                    ┌───────────┐
                    │ Fixtures  │
                    └─────┬─────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        Passenger       Flight       Booking
             │
             ▼
          Helpers
             │
             ▼
             API

Y en la parte UI:

Test
 │
 ▼
Page Object
 │
 ▼
Locators
 │
 ▼
Browser

Entonces eventualmente tendremos:

                 TEST
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
   Fixtures                 Page Objects
       │                       │
       ▼                       ▼
     API                  UI Locators
       │                       │
       └───────────┬───────────┘
                   ▼
                Browser

Esto ya es una arquitectura de automation framework bastante más seria.

🎯 Primer ejercicio de Fixtures

Quiero comprobar que entendiste el concepto antes de entrar en la sintaxis avanzada.

Imagina que tienes:

test('Check-in passenger', async ({ page, passenger }) => {

    console.log(passenger.firstName);

});

Y el fixture hace:

passenger: async ({ request }, use) => {

    const passenger = await createPassenger(request);

    await use(passenger);

    await deletePassenger(request, passenger);
}
Preguntas:

1. ¿En qué momento se ejecuta createPassenger()?

2. ¿Qué representa use(passenger)?

3. ¿En qué momento se ejecuta deletePassenger()?

4. ¿Por qué sería mejor tener esto en un fixture que repetir createPassenger() en cada test?

Respóndeme con tus palabras, sin preocuparte por usar términos técnicos perfectos.