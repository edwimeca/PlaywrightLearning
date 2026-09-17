Nivel 1 — Playwright Core

Lo dividiría en 8 módulos:

Módulo	Tema	Objetivo
1	Test anatomy	Entender completamente un test
2	Locators	Dominar la forma correcta de encontrar elementos
3	Assertions	Validar correctamente resultados
4	Auto-waiting & timeouts	Entender por qué Playwright espera
5	Hooks & lifecycle	Controlar preparación y limpieza
6	Fixtures	Crear contexto reutilizable
7	Configuration & projects	Controlar cómo se ejecutan los tests
8	Debugging & reports	Saber investigar fallos

Y después hacemos un proyecto práctico donde aplicaremos todo.

1. Test Anatomy

Primero quiero que entiendas perfectamente qué ocurre cuando ejecutas esto:

import { test, expect } from '@playwright/test';

test('User can login', async ({ page }) => {

    await page.goto('https://example.com');

    await expect(page).toHaveTitle(/Example/);

});

Aunque parece sencillo, aquí están ocurriendo varias cosas.

test
test('User can login', async ({ page }) => {

test() registra un test en Playwright.

El primer parámetro:

'User can login'

es el nombre del test.

El segundo:

async ({ page }) => {

es la función que Playwright ejecutará.

2. ¿Qué significa { page }?

Esta parte es muy importante:

async ({ page }) => {

page es una fixture proporcionada por Playwright.

Playwright crea automáticamente un objeto Page para nosotros.

Conceptualmente:

Playwright
   │
   ├── Browser
   │
   ├── BrowserContext
   │
   └── Page
          │
          └── nuestro test

Por eso normalmente no necesitas hacer manualmente:

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

Playwright lo gestiona mediante fixtures.

Esto conecta directamente con el proyecto de API que ya tienes.

Por ejemplo:

test('Check API Health', async ({ request }) => {

    const response = await request.get('/ping');

});

Aquí:

{ request }

es otra fixture.

3. async y await

Playwright trabaja muchísimo con operaciones asíncronas.

Por eso vemos:

async ({ page }) => {

y:

await page.goto(...);

Por ejemplo:

await page.click('#login');

significa básicamente:

"Ejecuta esta operación y espera a que termine antes de continuar."

Sin await:

page.click('#login');

await page.fill('#username', 'Edwin');

puedes terminar creando condiciones de carrera.

Por eso, como regla práctica:

Las operaciones de Playwright normalmente deben llevar await.

4. page

page representa una pestaña del navegador.

Algunos métodos fundamentales:

await page.goto(url);

await page.reload();

await page.goBack();

await page.goForward();

await page.close();

Y para interactuar:

await page.click();

await page.fill();

await page.press();

await page.check();

await page.uncheck();

await page.selectOption();

await page.hover();

Pero aquí aparece una distinción importante.

En Playwright moderno, queremos trabajar principalmente con locators.

Por ejemplo:

await page.getByRole('button', { name: 'Login' }).click();

en lugar de depender de:

await page.click('#loginButton');

Esto nos lleva al siguiente tema.

5. Locators

Los locators son probablemente uno de los conceptos que más debes dominar.

Ejemplo:

const username = page.getByLabel('Username');

await username.fill('Edwin');

También:

page.getByRole()
page.getByText()
page.getByLabel()
page.getByPlaceholder()
page.getByTestId()
Prioridad que quiero que aprendas

Generalmente intentaremos buscar elementos utilizando señales que representen cómo un usuario percibe la página.

Por ejemplo:

page.getByRole('button', { name: 'Login' })

mejor que:

page.locator('#btn_123456')

Porque si cambia internamente el ID:

<button id="btn_123456">

a:

<button id="btn_987654">

el segundo test puede romperse.

Mientras que:

getByRole('button', { name: 'Login' })

puede seguir funcionando.

6. Locators encadenados

Esto también es fundamental para proyectos grandes.

Supongamos:

<div data-testid="passenger-card">
    <span>Edwin Mejia</span>
    <button>Check-in</button>
</div>

Podemos hacer:

const passenger = page.getByTestId('passenger-card');

await passenger.getByRole('button', { name: 'Check-in' }).click();

En lugar de buscar globalmente:

await page.getByRole('button', { name: 'Check-in' }).click();

Esto será muy importante cuando lleguemos a POM y componentes.

7. Assertions

Ahora:

await expect(page).toHaveTitle(/Example/);

expect es el mecanismo de assertions de Playwright.

Algunas de las más importantes:

Elemento visible
await expect(locator).toBeVisible();
Elemento oculto
await expect(locator).toBeHidden();
Texto
await expect(locator).toHaveText('Login');
Contiene texto
await expect(locator).toContainText('Welcome');
Valor
await expect(locator).toHaveValue('Edwin');
Habilitado
await expect(locator).toBeEnabled();
Deshabilitado
await expect(locator).toBeDisabled();
Checked
await expect(locator).toBeChecked();
8. Algo MUY importante: expect también espera

Mucha gente que viene de otras herramientas piensa:

await expect(locator).toBeVisible();

simplemente pregunta:

"¿Está visible ahora?"

No exactamente.

Playwright hará auto-retry de la assertion durante el timeout correspondiente.

Conceptualmente:

expect(locator).toBeVisible()

        ↓

¿Visible?
   │
   ├── Sí → PASS
   │
   └── No
        ↓
      espera
        ↓
      vuelve a comprobar
        ↓
      vuelve a comprobar
        ↓
      ...

Esto es una de las razones por las que Playwright es bastante diferente de frameworks donde tienes que implementar explícitamente muchos waits.

9. Auto-waiting

Este concepto quiero que lo tengas muy claro.

Supongamos que tenemos:

await page.getByRole('button', { name: 'Submit' }).click();

Playwright no necesariamente intenta hacer click en el mismo instante.

Antes verifica condiciones necesarias para realizar la acción.

Conceptualmente:

Locator
   ↓
¿Existe?
   ↓
¿Está visible?
   ↓
¿Está habilitado?
   ↓
¿Puede recibir la interacción?
   ↓
CLICK

Por eso normalmente NO queremos hacer esto:

await page.waitForTimeout(5000);

await button.click();

Es un anti-pattern cuando se utiliza como solución general.

10. waitForTimeout

Esto:

await page.waitForTimeout(5000);

significa literalmente:

Espera 5 segundos.

No significa:

Espera hasta que la página esté lista.

Son cosas completamente diferentes.

Por ejemplo, si el elemento aparece después de 500 ms:

waitForTimeout(5000)

pierdes 4.5 segundos.

Si aparece después de 8 segundos:

waitForTimeout(5000)

tu test falla aunque eventualmente el sistema hubiera funcionado.

Por eso preferimos:

await expect(button).toBeVisible();

o simplemente:

await button.click();

cuando la propia acción ya proporciona el waiting necesario.

11. ¿Entonces cuándo utilizamos waitFor...?

Sí existen casos donde debemos esperar explícitamente.

Por ejemplo:

await page.waitForURL('**/dashboard');

o:

await page.waitForLoadState('networkidle');

o:

await locator.waitFor();

Pero debemos aprender qué condición estamos esperando, no simplemente agregar sleeps.

12. Nuestro primer ejercicio

Quiero que este curso sea interactivo.

Para este primer módulo, crea mentalmente un test como este:

test('User can login', async ({ page }) => {

    await page.goto('https://myapp.com');

    const username = page.getByLabel('Username');
    const password = page.getByLabel('Password');
    const loginButton = page.getByRole('button', { name: 'Login' });

    await username.fill('Edwin');
    await password.fill('123456');

    await loginButton.click();

    await expect(page.getByText('Welcome')).toBeVisible();

});

Y quiero que puedas explicar qué ocurre en este orden:

test()
 ↓
fixture { page }
 ↓
page.goto()
 ↓
getByLabel()
 ↓
fill()
 ↓
getByRole()
 ↓
click()
 ↓
expect()
 ↓
auto-waiting
 ↓
PASS / FAIL
Lo que vamos a hacer después

En el Módulo 2 vamos a profundizar muchísimo en Locators, incluyendo:

getByRole
getByLabel
getByText
getByPlaceholder
getByTestId
locator()
CSS selectors
XPath
chaining
.filter()
.nth()
.first()
.last()
locator strictness
cómo escoger el mejor locator
y, muy importante, cuándo un locator aparentemente correcto está mal diseñado.



Excelente pregunta. Esta es precisamente la diferencia entre entender Playwright y realmente entender cómo funciona Playwright.

La respuesta corta es:

Sí, el tiempo de espera se puede configurar, y Playwright no funciona simplemente haciendo un número fijo de intentos.

Hay que distinguir entre action timeout y expect timeout.

1. await expect(button).toBeVisible()

Cuando haces:

await expect(button).toBeVisible();

Playwright intenta comprobar que button esté visible.

Si todavía no está visible, reintenta automáticamente hasta que:

la condición se cumpla → ✅ continúa
se alcance el timeout → ❌ falla el test

Por defecto, el timeout de las assertions de Playwright Test es 5 segundos.

Por ejemplo:

0 ms
 ↓
¿Está visible?
 ↓ NO
espera/reintenta
 ↓
¿Está visible?
 ↓ NO
espera/reintenta
 ↓
...
 ↓
5000 ms
 ↓
❌ FAIL
¿Cuántas iteraciones hace?

Aquí hay una idea importante:

No debes pensar en esto como "hace 10 intentos" o "hace 20 intentos".

Playwright utiliza un mecanismo de polling/retry interno y el número exacto de comprobaciones no es un número fijo que debamos configurar o asumir.

Lo que normalmente controlamos es:

¿Durante cuánto tiempo permito que Playwright siga intentando?

Por ejemplo:

await expect(button).toBeVisible({
    timeout: 10000
});

Ahora puede esperar hasta 10 segundos.

Si después de ese período no está visible:

button visible
     │
     ├── Sí → PASS
     │
     └── No
          ↓
       retry
          ↓
       retry
          ↓
       retry
          ↓
       ...
          ↓
       10 seconds
          ↓
        FAIL
2. ¿Y qué pasa con await button.click()?

Aquí tenemos otro timeout.

await button.click();

No es una assertion.

Es una action.

Playwright primero intenta conseguir que el elemento esté en condiciones de recibir el click.

Por ejemplo, conceptualmente:

button locator
      ↓
¿Existe?
      ↓
¿Está visible?
      ↓
¿Está habilitado?
      ↓
¿Está estable?
      ↓
¿Puede recibir el click?
      ↓
CLICK

Si el botón no llega a estar listo, eventualmente:

❌ TimeoutError

y el test falla.

El timeout por defecto para acciones es diferente del timeout de expect.

En Playwright Test, el actionTimeout por defecto es 0, lo que significa que las acciones no tienen un timeout propio configurado y quedan limitadas por el timeout general del test.

El timeout general de un test, por defecto, es 30 segundos.

3. Esto es MUY importante

Tenemos diferentes niveles de timeout.

Por ejemplo:

TEST TIMEOUT
30 segundos
│
│
├── page.goto()
│
├── button.click()
│
├── fill()
│
├── expect()
│
└── otras operaciones

Pero expect() tiene su propio timeout:

EXPECT TIMEOUT
5 segundos

Por eso no debes pensar:

"Mi test tiene 30 segundos, entonces expect espera 30 segundos."

No.

Por defecto:

await expect(button).toBeVisible();

tiene su propio límite de 5 segundos.

4. Podemos configurarlo globalmente

En playwright.config.ts:

import { defineConfig } from '@playwright/test';

export default defineConfig({

    timeout: 30_000,

    expect: {
        timeout: 5_000,
    },

});

Esto significa:

Test timeout
30 segundos

Expect timeout
5 segundos

Entonces todos tus:

await expect(...);

utilizarán aproximadamente 5 segundos como máximo, salvo que sobrescribas el valor.

5. Configurar una assertion específica

También puedes hacer:

await expect(button).toBeVisible({
    timeout: 10_000
});

Aquí solamente esta assertion tendrá 10 segundos.

Por ejemplo:

await expect(loginButton).toBeVisible({
    timeout: 10_000
});

await expect(username).toBeVisible({
    timeout: 3_000
});

Tenemos:

loginButton → máximo 10 s
username    → máximo 3 s
6. ¿Y las acciones?

También puedes configurar el timeout de una acción.

Por ejemplo:

await button.click({
    timeout: 10_000
});

Ahora Playwright permitirá hasta 10 segundos para que el botón pueda ser clickeado.

También:

await username.fill('Edwin', {
    timeout: 10_000
});
7. Configurar actionTimeout

Puedes establecer un timeout global para las acciones:

export default defineConfig({

    use: {
        actionTimeout: 10_000,
    },

});

Ahora acciones como:

click()
fill()
check()
selectOption()
hover()

tendrán un límite de 10 segundos, salvo que especifiques otro timeout.

8. navigationTimeout

También existe un timeout específico para navegación.

Por ejemplo:

use: {
    navigationTimeout: 30_000,
}

Esto afecta operaciones como:

await page.goto(...);
await page.reload();
await page.goBack();
await page.goForward();
9. Una configuración más completa

En un proyecto real podrías encontrar algo así:

import { defineConfig } from '@playwright/test';

export default defineConfig({

    timeout: 30_000,

    expect: {
        timeout: 5_000,
    },

    use: {

        actionTimeout: 10_000,

        navigationTimeout: 30_000,

        trace: 'on-first-retry',

        screenshot: 'only-on-failure',

        video: 'retain-on-failure',
    },

});

Y entonces tienes una estructura bastante clara:

                 TIMEOUTS
                    │
       ┌────────────┼────────────┐
       │            │            │
      Test        Action       Expect
      30s          10s          5s
       │            │            │
       │            │            │
   test()       click()      toBeVisible()
                fill()       toHaveText()
                check()      toHaveValue()
10. Pero cuidado con aumentar todos los timeouts

Aquí viene una lección importante para tu futuro como Automation Engineer.

Imagina que tienes tests inestables y haces:

expect: {
    timeout: 30_000
}

Y:

actionTimeout: 30_000

Puede parecer que solucionaste el problema.

Pero probablemente solamente lo estás ocultando.

Si tienes:

await expect(button).toBeVisible();

y normalmente aparece en 500 ms pero ocasionalmente tarda 8 segundos, deberíamos investigar:

¿Por qué tarda 8 segundos?

y no simplemente decir:

"Pongamos 30 segundos."

11. Un ejemplo muy claro

Supongamos que tienes:

await page.getByRole('button', { name: 'Check-in' }).click();

await expect(page.getByText('Check-in successful')).toBeVisible();

El botón tarda:

200 ms

y el mensaje tarda:

2.5 seconds

Con los valores default:

click
 │
 └── encuentra botón → 200 ms → CLICK

expect
 │
 ├── 0.1 s → no
 ├── 0.5 s → no
 ├── ...
 └── 2.5 s → YES → PASS

Perfectamente válido.

Ahora imagina que el mensaje nunca aparece.

expect
 │
 ├── retry
 ├── retry
 ├── retry
 ├── ...
 └── 5 seconds
       ↓
      FAIL

Playwright te dará un error indicando que la assertion no se cumplió dentro del timeout.

12. Y aquí está la diferencia fundamental

No confundas:

await page.waitForTimeout(5000);

con:

await expect(button).toBeVisible({
    timeout: 5000
});

El primero significa:

"No importa qué pase, duerme 5 segundos."

El segundo significa:

"Comprueba la condición y sigue comprobándola hasta que se cumpla o lleguemos a 5 segundos."

Por eso preferimos el segundo.

Regla mental que quiero que te quede

Cuando trabajes con Playwright piensa:

WAIT FOR TIME
      ❌
"Espera 5 segundos"

WAIT FOR CONDITION
      ✅
"Espera hasta que ocurra X"

Y en Playwright normalmente queremos:

await expect(...)

o una acción de Playwright que ya incorpora auto-waiting.

Un detalle más avanzado

En tus proyectos actuales vas a encontrarte seguramente con situaciones como:

await page.waitForTimeout(2000);

o:

await page.waitForLoadState('networkidle');

o:

await expect(...).toBeVisible({ timeout: 15000 });

No significan lo mismo, y aprender a decidir cuál corresponde es una parte importante del Nivel 1.

Antes de pasar al módulo 2, si quieres, podemos hacer un pequeño ejercicio práctico de 5 escenarios y tú decides qué timeout/wait usar en cada uno. Eso te ayudaría bastante a fijar este concepto.

Muetrame el ejercicio

Perfecto. Vamos a hacerlo como un pequeño quiz de Automation Engineer. No te voy a dar las respuestas todavía. 😄

La idea es que no solamente elijas un comando, sino que pienses:

¿Estoy esperando tiempo o estoy esperando una condición?

🧪 Ejercicio — Playwright Waiting & Timeouts

Para cada escenario, elige la opción que consideres más apropiada.

Opciones disponibles

A.

await page.waitForTimeout(5000);

B.

await expect(locator).toBeVisible();

C.

await expect(locator).toBeVisible({
    timeout: 10000
});

D.

await page.waitForLoadState('networkidle');

E.

await page.waitForURL('**/dashboard');
🟢 Escenario 1 — Botón que aparece después de una petición

Después de hacer login, el botón "Continue" aparece cuando el backend termina de procesar la información.

Normalmente aparece en 1–2 segundos, pero ocasionalmente puede tardar hasta 8 segundos.

Tienes:

const continueButton =
    page.getByRole('button', { name: 'Continue' });

¿Qué utilizarías?

A, B, C, D o E?

🟢 Escenario 2 — La aplicación navega al Dashboard

Después de hacer login:

await loginButton.click();

La aplicación debería navegar a:

https://myapp.com/dashboard

Quieres asegurarte de que la navegación ocurrió antes de continuar.

¿Qué utilizarías?

A, B, C, D o E?

🟢 Escenario 3 — Página cargando datos dinámicos

En una página tienes:

Loading passengers...

Después de una petición API aparecen los pasajeros.

No sabes exactamente cuánto tardará.

Quieres comprobar que el primer pasajero finalmente aparece.

¿Qué utilizarías?

A, B, C, D o E?

🟡 Escenario 4 — Un sistema externo muy lento

Tu aplicación hace una operación contra un sistema externo.

Normalmente tarda 3 segundos, pero puede tardar hasta 15 segundos.

Tienes:

const confirmation =
    page.getByText('Transaction completed');

Quieres esperar específicamente a que aparezca ese mensaje.

¿Qué utilizarías?

A, B, C, D o E?

🔴 Escenario 5 — "El desarrollador dijo que hay que esperar 5 segundos"

Después de hacer click:

await submitButton.click();

un desarrollador te dice:

"Después del click espera 5 segundos porque el sistema necesita tiempo."

No tienes ninguna condición específica que puedas comprobar todavía.

¿Qué opción utilizarías si realmente no existe una condición observable que puedas esperar?

A, B, C, D o E?

⭐ Bonus — pregunta de arquitectura

Ahora una pregunta más interesante.

Tienes este test:

await page.waitForTimeout(5000);

await expect(
    page.getByText('Booking created')
).toBeVisible();

El test funciona.

Pero tú dices:

"Creo que esto está mal diseñado."

¿Por qué?

Y si sabes cómo mejorarlo, escribe una alternativa.

Puedes responder simplemente así:

1. C
2. E
3. B
4. C
5. A

Bonus:
...

Después revisamos una por una, incluyendo qué ocurre internamente, qué timeout aplica y por qué una opción es mejor que las demás.

1. C
2. D
3. B
4. D
5. A

Muy bien. Tienes 3/5 correctas, y las dos incorrectas son especialmente interesantes porque muestran una confusión muy común: networkidle no significa "esperar a que mi operación termine".

Vamos una por una.

1. Botón que aparece después de una petición

Tu respuesta: C ✅

await expect(continueButton).toBeVisible({
    timeout: 10000
});

Correcto.

Aquí tenemos una condición concreta:

El botón debe estar visible.

Y sabemos que puede tardar hasta 8 segundos, así que podemos darle 10 segundos.

La ventaja es que si aparece en 1 segundo:

0s → no
0.xs → no
1s → YES
     ↓
PASS

No espera innecesariamente los 10 segundos.

2. Navegación al Dashboard

Tu respuesta: D ❌

Elegiste:

await page.waitForLoadState('networkidle');

Pero la mejor respuesta es:

E ✅
await page.waitForURL('**/dashboard');

¿Por qué?

Porque la condición que realmente te interesa es:

"La aplicación llegó al Dashboard."

No:

"La red dejó de tener actividad."

Por ejemplo:

await loginButton.click();

await page.waitForURL('**/dashboard');

Estamos expresando exactamente la intención del test:

CLICK LOGIN
     ↓
esperar URL
     ↓
/dashboard
     ↓
PASS
¿Entonces para qué sirve networkidle?

Esta es una distinción muy importante.

await page.waitForLoadState('networkidle');

significa aproximadamente:

Esperar hasta que no haya actividad de red durante un período determinado.

Pero una aplicación moderna puede tener:

WebSockets
analytics
polling
llamadas periódicas
servicios externos
tracking
requests en background

Por lo tanto, networkidle no necesariamente significa que la aplicación esté lista para que el usuario continúe.

Y en muchos casos no es la mejor estrategia para sincronizar un test.

3. Loading passengers → aparece el pasajero

Tu respuesta: B ✅

Perfecto.

await expect(firstPassenger).toBeVisible();

Estamos esperando una condición observable.

No sabemos cuándo terminará la llamada API, pero realmente tampoco nos importa.

Lo que nos importa es:

"Cuando el pasajero esté disponible, continúo."

Eso es excelente diseño de test.

4. Sistema externo hasta 15 segundos

Tu respuesta: D ❌

Aquí la respuesta correcta es:

C ✅
await expect(confirmation).toBeVisible({
    timeout: 15000
});

Tenemos:

const confirmation =
    page.getByText('Transaction completed');

y queremos:

Esperar hasta que aparezca Transaction completed.

No necesitamos esperar que la red esté inactiva.

Podría suceder esto:

Sistema externo
    │
    ├── request 1
    ├── request 2
    ├── request 3
    └── response
           ↓
    "Transaction completed"

La condición real es el mensaje.

Por eso:

expect(...).toBeVisible()

es más preciso que:

waitForLoadState('networkidle')
5. El desarrollador dice "espera 5 segundos"

Tu respuesta: A ✅

Aquí tienes razón dentro de las opciones dadas.

await page.waitForTimeout(5000);

es literalmente un sleep.

Pero fíjate en la frase que puse:

"si realmente no existe una condición observable que puedas esperar"

Ese "si" es importantísimo.

En automatización profesional, yo primero preguntaría:

¿Qué debería haber ocurrido después de esos 5 segundos?

Por ejemplo, si la respuesta es:

"Después de esos 5 segundos aparece un mensaje."

Entonces preferiría:

await expect(message).toBeVisible({
    timeout: 5000
});

Y si la respuesta es:

"Después de 5 segundos se habilita el botón."

Entonces:

await expect(button).toBeEnabled({
    timeout: 5000
});

waitForTimeout() debería ser una herramienta de último recurso, no nuestra estrategia principal de sincronización.

Tu resultado
#	Tu respuesta	Correcta	Concepto
1	C	✅	Assertion timeout
2	D	❌ E	Navigation condition
3	B	✅	Condition-based waiting
4	D	❌ C	Assertion vs network
5	A	✅	Hard wait

3/5 — pero lo importante es que los dos errores son muy buenos errores para aprender.

🧠 La regla que quiero que memorices

Cuando estés escribiendo Playwright y pienses:

"Necesito esperar..."

Primero pregunta:

¿Qué estoy esperando?

Si es...

Un elemento:

await expect(locator).toBeVisible();

Un texto:

await expect(locator).toContainText('Completed');

Una URL:

await page.waitForURL('**/dashboard');

Una condición de un elemento:

await expect(button).toBeEnabled();

Una navegación/carga específica:

await page.waitForLoadState(...);

Y solamente si literalmente necesitas esperar una cantidad fija de tiempo:

await page.waitForTimeout(5000);
Y aquí viene una conexión importante con tus proyectos

En tu proyecto de Web Check-in, imagina:

await page.waitForTimeout(5000);

await page.getByRole('button', {
    name: 'Continue'
}).click();

Yo inmediatamente preguntaría:

¿Por qué necesitamos esos 5 segundos?

Quizás la respuesta real sea:

await expect(
    page.getByRole('button', { name: 'Continue' })
).toBeEnabled();

O:

await expect(
    page.getByText('Passenger confirmed')
).toBeVisible();

O:

await page.waitForURL('**/seat-selection');

Eso convierte un test que depende del tiempo en un test que depende del estado real de la aplicación.

Y esa es una de las ideas fundamentales de Playwright.

Una pequeña corrección conceptual adicional

Hay algo que quiero ajustar de mi explicación anterior: expect tiene por defecto 5 s, pero una acción como click() no tiene por defecto un actionTimeout independiente de 0 s; en la práctica está limitada por el timeout del test si no se configura otro timeout.

Esto es importante porque más adelante, cuando lleguemos a playwright.config.ts, vamos a estudiar exactamente la jerarquía de timeouts:

Test timeout
      │
      ├── Action timeout
      │
      ├── Navigation timeout
      │
      └── Expect timeout

Ahí hay varios detalles interesantes que vale la pena dominar antes de pasar a Locators.