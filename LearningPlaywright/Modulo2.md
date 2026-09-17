
🧭 Módulo 2 — Locators

Al terminar este módulo quiero que puedas responder preguntas como:

¿Cuándo usar getByRole()?
¿Cuándo usar getByText()?
¿Cuándo usar getByLabel()?
¿Cuándo usar getByTestId()?
¿Cuándo usar locator()?
¿CSS o XPath?
¿Qué significa strictness?
¿Cuándo utilizar .filter()?
¿Qué diferencia hay entre .first(), .last() y .nth()?
¿Cómo construir locators robustos?
¿Cómo evitar locators frágiles?
1. ¿Qué es un Locator?

Un locator es una forma de decirle a Playwright:

"Quiero interactuar con este elemento de la página."

Por ejemplo:

const loginButton = page.getByRole('button', {
    name: 'Login'
});

Aquí loginButton no es todavía el botón HTML.

Es un objeto Locator que representa la forma de encontrar ese botón.

Luego:

await loginButton.click();

le dice a Playwright:

Busca el elemento representado por este locator y haz click sobre él.

2. Locator ≠ elemento

Esta distinción es MUY importante.

Cuando haces:

const button = page.getByRole('button', {
    name: 'Login'
});

Playwright no necesariamente busca inmediatamente el botón.

El locator describe cómo encontrarlo.

Esto permite que Playwright haga su auto-waiting cuando realmente necesitas interactuar con él.

Por ejemplo:

const button = page.getByRole('button', {
    name: 'Login'
});

await button.click();

Conceptualmente:

Locator
   ↓
esperar elemento
   ↓
encontrarlo
   ↓
comprobar que puede recibir click
   ↓
click
3. Los locators que debes dominar

Los principales son:

page.getByRole()
page.getByLabel()
page.getByText()
page.getByPlaceholder()
page.getByTestId()
page.locator()

Vamos a estudiarlos individualmente.

4. getByRole() ⭐⭐⭐

Este es probablemente el locator que más quiero que aprendas a utilizar.

Supongamos:

<button>Login</button>

Puedes hacer:

await page.getByRole('button', {
    name: 'Login'
}).click();

La ventaja es que estás identificando el elemento por su rol accesible y nombre.

Algunos roles comunes:

button
link
checkbox
radio
textbox
heading
combobox
listbox
option
row
cell

Por ejemplo:

page.getByRole('button', { name: 'Login' });

page.getByRole('link', { name: 'Home' });

page.getByRole('checkbox', { name: 'Remember me' });

page.getByRole('textbox', { name: 'Username' });

page.getByRole('heading', { name: 'Passenger Details' });
5. ¿Por qué getByRole() es tan bueno?

Imagina este HTML:

<button
    id="btn_123"
    class="btn-primary"
    data-component="login-button">
    Login
</button>

Podrías hacer:

page.locator('#btn_123');

Pero ese ID podría cambiar mañana.

O:

page.locator('.btn-primary');

Pero quizás mañana haya 5 botones con esa clase.

Mientras que:

page.getByRole('button', {
    name: 'Login'
});

describe mucho mejor qué quiere hacer el usuario.

6. getByLabel()

Especialmente útil para formularios.

HTML:

<label for="username">Username</label>

<input id="username">

Podemos hacer:

await page.getByLabel('Username').fill('Edwin');

En lugar de:

await page.locator('#username').fill('Edwin');

Esto es excelente para formularios.

Por ejemplo:

await page.getByLabel('First name').fill('Edwin');

await page.getByLabel('Last name').fill('Mejia');

await page.getByLabel('Email').fill('test@example.com');
7. getByPlaceholder()

Si tenemos:

<input placeholder="Enter booking reference">

podemos usar:

await page
    .getByPlaceholder('Enter booking reference')
    .fill('ABC123');

Es útil, aunque normalmente prefiero getByLabel() cuando existe una etiqueta adecuada.

8. getByText()

Busca contenido textual.

Por ejemplo:

<div>Check-in successful</div>

Podemos hacer:

await expect(
    page.getByText('Check-in successful')
).toBeVisible();

Muy útil para assertions.

También:

page.getByText('Continue')

puede encontrar un elemento cuyo contenido sea "Continue".

Pero hay que tener cuidado.

Si tienes:

<div>Continue</div>
<button>Continue</button>

puedes terminar con múltiples coincidencias.

Y aquí entra uno de los conceptos más importantes de Playwright:

Strictness
9. Strict Locators

Imagina:

<button>Continue</button>
<button>Continue</button>

Y escribes:

await page.getByRole('button', {
    name: 'Continue'
}).click();

¿Qué botón debería clicar?

Playwright no puede saberlo.

Por eso las acciones que requieren un único elemento pueden producir un error de strict mode violation cuando el locator resuelve a múltiples elementos.

Esto es bueno.

Playwright te está diciendo:

"Tu locator no es suficientemente específico."

10. Solucionar múltiples coincidencias

Puedes utilizar:

.first()
.last()

o:

.nth()

Ejemplo:

await page.getByRole('button', {
    name: 'Continue'
}).first().click();

O:

await page.getByRole('button', {
    name: 'Continue'
}).nth(1).click();

Pero cuidado.

No quiero que aprendas:

"Si Playwright dice strictness error, pongo .first()."

Eso puede esconder un problema de diseño.

11. .nth() puede ser frágil

Supongamos:

<button>Delete</button>
<button>Delete</button>
<button>Delete</button>

Y escribes:

await page.getByRole('button', {
    name: 'Delete'
}).nth(1).click();

Estás diciendo:

"Haz click en el segundo Delete."

Pero mañana el orden puede cambiar:

<button>Delete</button>
<button>Archive</button>
<button>Delete</button>
<button>Delete</button>

Ahora .nth(1) apunta a otra cosa.

Por eso .nth() debe utilizarse cuando la posición realmente forma parte de la lógica.

12. Mejor solución: filter()

Supongamos una página de pasajeros:

<div class="passenger">
    <span>Edwin Mejia</span>
    <button>Check-in</button>
</div>

<div class="passenger">
    <span>John Smith</span>
    <button>Check-in</button>
</div>

Queremos hacer Check-in de Edwin.

Una solución muy buena:

const passenger = page
    .locator('.passenger')
    .filter({
        hasText: 'Edwin Mejia'
    });

await passenger.getByRole('button', {
    name: 'Check-in'
}).click();

Observa lo que hicimos:

Todos los pasajeros
        ↓
filter("Edwin Mejia")
        ↓
Edwin Mejia
        ↓
buscar Check-in
        ↓
click

Esto será oro para tu proyecto de Web Check-in.

13. Locators encadenados

También podemos hacer:

const passenger = page
    .getByTestId('passenger-card')
    .filter({ hasText: 'Edwin Mejia' });

await passenger
    .getByRole('button', { name: 'Check-in' })
    .click();

Estamos limitando el ámbito de búsqueda.

Esto es mucho mejor que buscar:

page.getByRole('button', { name: 'Check-in' })

globalmente.

14. getByTestId()

Supongamos que el frontend tiene:

<button data-testid="check-in-button">
    Check-in
</button>

Entonces:

await page.getByTestId('check-in-button').click();

Este locator es muy útil cuando el equipo de desarrollo proporciona identificadores específicamente para testing.

De hecho, en proyectos grandes, tener una estrategia de data-testid bien definida puede ser excelente.

Por ejemplo:

data-testid="passenger-check-in"
data-testid="booking-reference-input"
data-testid="seat-selection"
15. locator()

locator() es la herramienta más general.

Puedes utilizar CSS:

page.locator('#username');
page.locator('.passenger-card');
page.locator('[data-testid="check-in"]');

También puedes utilizar XPath:

page.locator('//button[text()="Login"]');

Pero aquí quiero introducir una regla para tu aprendizaje:

No uses CSS/XPath simplemente porque puedes.

Primero piensa:

¿Existe un locator semántico?
        ↓
      Sí
        ↓
   getByRole()
   getByLabel()
   getByText()
   getByTestId()

Si no existe o no es suficientemente preciso:

        ↓
     locator()
🧠 Una jerarquía práctica

No es una ley absoluta, pero como punto de partida:

1️⃣ getByRole()
        ↓
2️⃣ getByLabel()
        ↓
3️⃣ getByPlaceholder()
        ↓
4️⃣ getByText()
        ↓
5️⃣ getByTestId()
        ↓
6️⃣ locator(CSS)
        ↓
7️⃣ XPath

Pero hay un matiz:

getByTestId() puede ser mejor que getByText() cuando el texto es dinámico o puede cambiar.

Por ejemplo:

page.getByText('Submit')

puede romperse si mañana UX cambia:

Submit → Confirm

Mientras:

page.getByTestId('submit-button')

puede continuar funcionando.

Así que la verdadera pregunta no es:

"¿Cuál locator está más arriba en la lista?"

Sino:

"¿Cuál locator identifica de forma más estable y significativa el elemento que necesito?"

🎯 Ejercicio del Módulo 2 — Parte 1

Quiero que practiquemos antes de continuar con temas más avanzados como filter(), strictness y locators dinámicos.

Supón que tienes este HTML:

<div class="passenger-card">

    <h3>Edwin Mejia</h3>

    <label for="first-name">First name</label>
    <input id="first-name">

    <label for="last-name">Last name</label>
    <input id="last-name">

    <button>Check-in</button>
    <button>Cancel</button>

</div>

Y tienes otro pasajero:

<div class="passenger-card">

    <h3>John Smith</h3>

    <label for="first-name-2">First name</label>
    <input id="first-name-2">

    <label for="last-name-2">Last name</label>
    <input id="last-name-2">

    <button>Check-in</button>
    <button>Cancel</button>

</div>
Pregunta 1

¿Cómo escribirías el locator para:

A. El botón Check-in de Edwin.

Pregunta 2

¿Cómo localizarías:

B. El input First name de Edwin.

Pregunta 3

¿Cómo localizarías:

C. El botón Cancel de John.

Pregunta 4 — ⭐

¿Qué problema tendría esto?

await page.getByRole('button', {
    name: 'Check-in'
}).click();
Pregunta 5 — ⭐⭐

¿Cuál de estas dos soluciones te parece mejor y por qué?

await page
    .getByRole('button', { name: 'Check-in' })
    .nth(1)
    .click();

vs.

const john = page
    .locator('.passenger-card')
    .filter({ hasText: 'John Smith' });

await john
    .getByRole('button', { name: 'Check-in' })
    .click();

Sí 👍 el Test B es el correcto, pero hay una distinción importante que quiero que tengas muy clara porque es fundamental en Playwright.

Test B
const flight = page
  .getByTestId('passenger-card')
  .filter({ hasText: 'Edwin Mejia' })
  .getByTestId('flight');

await expect(flight).toContainText('IN5005');

Si el vuelo cambia de IN5005 → IN6006:

✅ El locator sigue encontrando el elemento flight.
❌ La assertion falla porque todavía estamos esperando IN5005.

Es decir:

LOCATOR
   ↓
Encuentra el elemento "flight" ✅
   ↓
ASSERTION
   ↓
¿Contiene IN5005?
   ↓
NO ❌

Si cambiamos la expectativa:

await expect(flight).toContainText('IN6006');

entonces pasa ✅.

¿Y el Test A?
const flight = page.getByText('IN5005');

await expect(flight).toBeVisible();

Aquí estamos usando el dato de negocio como locator.

Si IN5005 cambia a IN6006:

getByText('IN5005')
        ↓
No encuentra el elemento ❌
🧠 Regla importante

Esta es una de las ideas que quiero que te lleves para tu framework de Playwright:

El locator debería identificar el elemento; la assertion debería validar su contenido.

Por eso, conceptualmente:

const flight = edwin.getByTestId('flight');

await expect(flight).toContainText('IN5005');

es mejor que:

const flight = page.getByText('IN5005');

Esto se vuelve muy importante en tu proyecto de Web Check-in, donde valores como flight number, booking reference, seat, passenger name, etc. pueden cambiar constantemente.

Muy bien con el Test B. 👌

Si quieres, seguimos con la siguiente parte de Locators: filter(), hasText, has, chaining y cómo evitar .nth(), que es donde Playwright empieza a ponerse realmente interesante.


Perfecto. Ahora vamos a entrar en una parte que te va a servir muchísimo en tu proyecto de Web Check-in: cómo construir locators cuando los datos son dinámicos.

Module 2 — Locators: nivel intermedio

Hasta ahora tenemos este patrón:

const passenger = page
  .getByTestId('passenger-card')
  .filter({ hasText: 'Edwin Mejia' });

await passenger
  .getByRole('button', { name: 'Check-in' })
  .click();

Esto funciona, pero en automatización real normalmente Edwin no estará escrito directamente en el test.

Podríamos tener:

const passengerName = 'Edwin Mejia';

y utilizarlo:

const passenger = page
  .getByTestId('passenger-card')
  .filter({ hasText: passengerName });

Esto ya empieza a acercarse a una arquitectura de automation framework.

1. Locator + variable

Imagina:

const bookingReference = 'ABC123';

Y tenemos:

<div data-testid="booking-card">
    <span data-testid="booking-reference">ABC123</span>
    <button>Open booking</button>
</div>

Podríamos hacer:

const booking = page
  .getByTestId('booking-card')
  .filter({ hasText: bookingReference });

await booking
  .getByRole('button', { name: 'Open booking' })
  .click();

Observa algo importante:

Test data
   ↓
bookingReference
   ↓
Locator
   ↓
booking
   ↓
Action
   ↓
click()

Estamos separando los datos de la lógica del locator.

Esto será muy importante cuando lleguemos a Page Object Model.

2. Regex en locators

Otra herramienta muy útil es Regex.

Supongamos que el botón puede aparecer como:

Check-in
Check In
CHECK-IN
Check-in passenger

Podríamos hacer:

await page
  .getByRole('button', { name: /check[- ]?in/i })
  .click();

Aquí:

/check[- ]?in/i

permite diferentes variantes.

Pero cuidado ⚠️:

No uses Regex simplemente porque parece más avanzado.

Si sabes exactamente que el botón siempre es:

Check-in

esto es mejor:

getByRole('button', { name: 'Check-in' })

La regla es:

Usa el locator más simple que sea suficientemente estable.

3. exact: true

Otro caso:

<button>Check-in</button>
<button>Check-in passenger</button>

Si haces:

page.getByRole('button', { name: 'Check-in' })

puedes encontrarte con más de un elemento dependiendo del matching.

Puedes especificar:

page.getByRole('button', {
  name: 'Check-in',
  exact: true
});

Ahora estás diciendo:

Quiero exactamente el botón cuyo accessible name sea Check-in.

4. .first(), .last() y .nth()

Ya vimos que no deberías utilizar:

.nth(0)

como solución automática.

Pero no significa que nunca debas utilizarlos.

Por ejemplo, si tienes:

<ul>
    <li>Flight IN5005</li>
    <li>Flight IN6006</li>
    <li>Flight IN7007</li>
</ul>

y el requisito explícitamente dice:

Select the first available flight.

Entonces:

await page
  .getByRole('listitem')
  .first()
  .click();

puede ser perfectamente válido.

La diferencia está en el significado.

❌ Frágil
page.getByTestId('passenger-card').nth(1)

"John es el segundo porque actualmente está ahí."

✅ Válido
page.getByRole('listitem').first()

"El requisito dice seleccionar el primero."

5. count()

Esta función es muy útil para debugging.

const passengers = page.getByTestId('passenger-card');

console.log(await passengers.count());

Si tenemos:

Edwin
John
Sarah

obtendríamos:

3

Esto puede ayudarte a entender problemas de strict mode.

Por ejemplo:

await page
  .getByRole('button', { name: 'Check-in' })
  .click();

Si existen tres botones Check-in, Playwright puede decirte que tienes un strict mode violation.

Puedes investigar:

const buttons = page.getByRole('button', { name: 'Check-in' });

console.log(await buttons.count());
6. locator.all()

También existe:

const passengers = await page
  .getByTestId('passenger-card')
  .all();

Esto devuelve una colección de locators.

Pero ojo:

No necesitas utilizar .all() normalmente para interactuar con elementos.

Playwright está diseñado para que puedas trabajar directamente con locators.

Por ejemplo:

const passengers = page.getByTestId('passenger-card');

await expect(passengers).toHaveCount(3);

es normalmente mejor que convertir inmediatamente todo en un array.

🧠 Una distinción muy importante

Hay tres cosas diferentes:

Locator
const passenger = page.getByTestId('passenger-card');

Describe cómo encontrar el elemento.

Action
await passenger.getByRole('button', { name: 'Check-in' }).click();

Hace algo con el elemento.

Assertion
await expect(passenger).toContainText('Edwin Mejia');

Comprueba algo sobre el elemento.

Piensa:

LOCATOR
   ↓
"¿Dónde está?"

ACTION
   ↓
"¿Qué quiero hacer?"

ASSERTION
   ↓
"¿Qué espero que ocurra?"

Esta separación mental te va a ayudar muchísimo a escribir tests limpios.

🎯 Ejercicio

Tenemos:

<div data-testid="passenger-card">
    <h3>Edwin Mejia</h3>
    <button>Check-in</button>
    <button>Cancel</button>
</div>

<div data-testid="passenger-card">
    <h3>John Smith</h3>
    <button>Check-in</button>
    <button>Cancel</button>
</div>

Quiero que escribas el código para:

1. Encontrar el passenger card de Edwin.

2. 
Verificar que contiene Edwin Mejia.

3. 
Hacer click en Check-in.

Intenta escribir las tres líneas de razonamiento, no necesariamente tres líneas de código. Después lo revisamos y pasamos a strict mode, que es uno de los conceptos más importantes de Playwright.

Es confuso lo  que me pides, por que si quiero buscar el que contine Edwin Mejia, para que lo voy a validar si de entrada ya se que lo va a tener.  En mi proyecto estoy creando los pasajeros consumiendo una API que me retorna todos los datos del pasajero y lo que hago es que al inicio del test  llamo el fixture para la cracion del pasajero. y de esta manera ya tengo los datos de un pasajero, ahora usando lo aprendido lo ue haria es const passenger = page.getByTestId('passenger-card')
  .filter({
    hastText: passengerLastName 
  });

Exactamente. Tu observación es correcta, y además estás conectando lo que estamos estudiando con tu arquitectura real. Eso es mucho más importante que resolver ejercicios artificiales.

Primero, una corrección pequeña:

const passenger = page
  .getByTestId('passenger-card')
  .filter({
    hasText: passengerLastName
  });

Es hasText, no hastText.

Y sí: la assertion que te propuse era redundante

Tú dijiste:

"Si quiero buscar el que contiene Edwin Mejia, ¿para qué lo voy a validar si de entrada ya sé que lo va a tener?"

Correcto.

Si haces:

const passenger = page
  .getByTestId('passenger-card')
  .filter({ hasText: passengerLastName });

no tiene mucho sentido inmediatamente hacer:

await expect(passenger).toContainText(passengerLastName);

porque estarías comprobando prácticamente la misma condición que utilizaste para identificar el elemento.

Esto es algo que quiero que empecemos a diferenciar:

Locator ≠ Assertion

El locator:

.filter({ hasText: passengerLastName })

se

continua

Exacto. Y quiero ajustar el enfoque del curso a tu proyecto real, porque ahí es donde vas a aprender de verdad.

Tu arquitectura tiene algo muy interesante:

API
 ↓
Create Passenger
 ↓
Fixture
 ↓
Passenger data
 ↓
Web UI test
 ↓
Locator
 ↓
Action / Assertion

Entonces vamos a trabajar con ese escenario.

2.4 — Separar Test Data de UI Locators

Supongamos que tu API/fixture crea un pasajero y devuelve algo como:

const passenger = {
  firstName: 'Edwin',
  lastName: 'Mejia',
  bookingReference: 'ABC123',
  flightNumber: 'IN5005',
  seat: '12A'
};

Tu test ya tiene esos datos.

Entonces no deberíamos hacer esto:

const passenger = page
  .getByTestId('passenger-card')
  .filter({ hasText: 'Edwin Mejia' });

porque estamos hardcodeando información que ya tenemos.

Mejor:

const passengerCard = page
  .getByTestId('passenger-card')
  .filter({
    hasText: `${passenger.firstName} ${passenger.lastName}`
  });

O incluso, si solamente necesitas el apellido:

const passengerCard = page
  .getByTestId('passenger-card')
  .filter({
    hasText: passenger.lastName
  });

Pero aquí aparece una pregunta importante:

¿Es suficientemente único el apellido?

Si tienes:

Edwin Mejia
Carlos Mejia
John Smith

esto:

.filter({ hasText: passenger.lastName })

puede encontrar dos pasajeros.

Por eso, en general prefiero:

const passengerName =
  `${passenger.firstName} ${passenger.lastName}`;

const passengerCard = page
  .getByTestId('passenger-card')
  .filter({ hasText: passengerName });
Pero podemos hacerlo todavía mejor

Supongamos que el HTML tiene:

<div data-testid="passenger-card">
    <span data-testid="passenger-first-name">Edwin</span>
    <span data-testid="passenger-last-name">Mejia</span>
    <span data-testid="booking-reference">ABC123</span>
    <button>Check-in</button>
</div>

Ahora podemos utilizar la información que ya tenemos de una forma mucho más específica.

Por ejemplo:

const passengerCard = page
  .getByTestId('passenger-card')
  .filter({
    has: page
      .getByTestId('passenger-last-name')
      .filter({ hasText: passenger.lastName })
  });

Pero no quiero que empieces a complicar tus locators de esta manera todavía.

Hay una idea más importante.

Tu Fixture es el dueño de los datos

Imagina que tu fixture hace algo parecido a:

const passenger = await createPassenger();

y devuelve:

{
    firstName,
    lastName,
    bookingReference,
    flightNumber,
    seat
}

Entonces tu test podría ser conceptualmente:

test('Passenger can check in', async ({ page, passenger }) => {

    const passengerName =
        `${passenger.firstName} ${passenger.lastName}`;

    const passengerCard = page
        .getByTestId('passenger-card')
        .filter({
            hasText: passengerName
        });

    await passengerCard
        .getByRole('button', { name: 'Check-in' })
        .click();
});

Esto tiene una característica muy buena:

El test no necesita saber qué pasajero creó el fixture.

Puede ser:

Edwin Mejia

hoy,

John Smith

mañana,

o un pasajero generado aleatoriamente.

El locator se adapta a los datos.

Y aquí aparece un principio de automation

Tu test debería describir el comportamiento, no los datos específicos utilizados para crear el escenario.

Compara:

❌ Test acoplado a datos
const passenger = page
    .getByTestId('passenger-card')
    .filter({
        hasText: 'Edwin Mejia'
    });
✅ Test basado en test data
const passenger = page
    .getByTestId('passenger-card')
    .filter({
        hasText: `${createdPassenger.firstName} ${createdPassenger.lastName}`
    });

Esto es muchísimo más reutilizable.

Ahora viene una cuestión todavía más importante

Tú mencionaste algo que me interesa mucho:

"al inicio del test llamo el fixture para la creación del pasajero"

Eso significa que probablemente tienes algo parecido a:

test('Check-in passenger', async ({ page, passenger }) => {
   // ...
});

Si es así, estás entrando directamente en uno de los conceptos más importantes de Playwright:

Fixtures

Y aquí quiero detener los locators por un momento.

Porque ya entendiste suficientemente bien:

getByRole
getByTestId
getByText
filter
hasText
has
chaining
.first()
.nth()
separación entre locator/action/assertion
usar datos dinámicos del fixture

El siguiente paso lógico es entender qué está pasando realmente cuando Playwright te entrega passenger desde el fixture.

Eso nos va a permitir entender después:

Fixture
   ↓
Test Data
   ↓
Page Object
   ↓
Locator
   ↓
Action
   ↓
Assertion