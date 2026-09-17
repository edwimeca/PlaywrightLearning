Módulo 6 — SOLID aplicado a tu framework Playwright

No vamos a estudiar SOLID como teoría de desarrollo de software. Vamos a responder:

¿Dónde está SOLID en el código que ya tienes?

SOLID son cinco principios:

S → Single Responsibility
O → Open/Closed
L → Liskov Substitution
I → Interface Segregation
D → Dependency Inversion

Hoy nos concentraremos especialmente en S, O, L y D, porque son los que más claramente aparecen en tu arquitectura.

1. S — Single Responsibility Principle
Single Responsibility = una clase debería tener una responsabilidad principal.

No significa necesariamente:

"Una clase solo puede tener un método."

Significa:

Una clase debería tener una razón principal para cambiar.

Tu AirlineFactory

Actualmente:

export class AirlineFactory {

  static getAdapter(airline: string, page: Page): ICheckInFlow {
    const normalizedAirline = airline.toLowerCase();

    switch (normalizedAirline) {
      case 'lift':
        return new LiftCheckInAdapter(page);

      case 'bermudair':
        return new BermudairCheckInAdapter(page);

      default:
        throw new Error(...);
    }
  }
}

¿Cuál es su responsabilidad?

Resolver qué Adapter corresponde a una aerolínea.

Perfecto.

No está:

❌ haciendo clicks
❌ llamando APIs
❌ creando pasajeros
❌ haciendo assertions
❌ haciendo cleanup

Por tanto tiene una responsabilidad bastante clara.

2. Tu BermudairCheckInAdapter

También tiene una responsabilidad clara:

Adaptar el flujo genérico ICheckInFlow a la implementación específica de Bermudair.

Por ejemplo:

async searchBooking(criteria) {
  await this.homePage.navigateToCheckIn();
  await this.homePage.searchBooking(criteria);
}

No está intentando hacer directamente todo esto:

❌ crear pasajeros
❌ crear vuelos
❌ llamar APIs
❌ seleccionar qué aerolínea usar
❌ manejar todos los locators del sistema

Por eso tienes separación de responsabilidades.

3. ¿Dónde está realmente la separación?

Mira estas responsabilidades:

AirlineFactory
     ↓
"¿Qué Adapter necesito?"

Adapter
     ↓
"¿Cómo implemento el flujo para esta aerolínea?"

Page Object
     ↓
"¿Cómo interactúo con esta pantalla?"

Service
     ↓
"¿Cómo llamo a la API?"

Fixture
     ↓
"¿Cómo gestiono dependencias y lifecycle?"

Esto es Separation of Concerns, y SOLID ayuda a conseguirlo.

4. O — Open/Closed Principle

Este es especialmente importante en tu proyecto.

Open/Closed Principle

Una pieza debería estar:

Open for extension, closed for modification.

Es decir:

Deberías poder agregar comportamiento nuevo sin tener que modificar constantemente el código existente.

Imagina que mañana agregas una tercera aerolínea

Actualmente tienes:

case 'lift':
  return new LiftCheckInAdapter(page);

case 'bermudair':
  return new BermudairCheckInAdapter(page);

Para agregar:

Avianca

tienes que modificar:

AirlineFactory

y agregar:

case 'avianca':
  return new AviancaCheckInAdapter(page);

Entonces hay una pequeña violación del espíritu de Open/Closed.

¿Por qué?

Porque cada nueva aerolínea obliga a modificar la Factory.

5. ¿Eso significa que tu Factory está mal?

No.

Este es un punto muy importante.

SOLID no significa:

"Si puedo encontrar una modificación, la arquitectura está mal."

Tu switch puede ser perfectamente razonable si tienes pocas aerolíneas.

La pregunta arquitectónica es:

¿Qué tan frecuentemente crecerá este sistema y cuánto código adicional tendrá cada nueva implementación?

Si tienes:

2 aerolíneas
3 aerolíneas
5 aerolíneas

un switch puede ser muy sencillo y mantenible.

Pero imagina:

30 aerolíneas

Entonces:

switch (airline) {
  case 'lift':
  case 'bermudair':
  case 'avianca':
  case 'copa':
  case 'spirit':
  case 'jetblue':
  ...
}

empieza a convertirse en un punto de mantenimiento importante.

6. Una posible evolución

Podrías eventualmente tener algo parecido a:

const adapters = {
  lift: LiftCheckInAdapter,
  bermudair: BermudairCheckInAdapter,
  avianca: AviancaCheckInAdapter,
};

Y luego:

const Adapter = adapters[airline];

return new Adapter(page);

Ahora agregar una aerolínea puede ser más sencillo.

Pero no quiero que cambies tu Factory todavía.

Primero quiero que aprendas a reconocer por qué podrías querer cambiarla.

Ese es el objetivo de este módulo.

7. L — Liskov Substitution Principle

Este principio encaja perfectamente con tu ICheckInFlow.

La idea simplificada es:

Si una clase implementa una interface, debería poder utilizarse donde esa interface se espera sin romper las expectativas del sistema.

En tu caso:

interface ICheckInFlow {
   searchBooking(...);
   selectPassengers(...);
   selectSeats(...);
   ...
}

Y tienes:

LiftCheckInAdapter implements ICheckInFlow

y:

BermudairCheckInAdapter implements ICheckInFlow

Por lo tanto:

              ICheckInFlow
                   │
          ┌────────┴────────┐
          ↓                 ↓
     LiftAdapter      BermudairAdapter

Ambos deberían poder ser utilizados como:

ICheckInFlow
8. Y aquí aparece una situación interesante en TU código

Mira:

async selectPassengers(passengers: PassengerDetails[]): Promise<void> {
  if (passengers.length > 1) {
    throw new Error(
      '[BermudairCheckInAdapter] Group check-in is not implemented yet.'
    );
  }

  await this.passengerSelectionPage.confirmPassenger(passengers[0]);
}

La interface permite:

PassengerDetails[]

Pero Bermudair no soporta grupos.

Entonces tenemos:

ICheckInFlow
   ↓
selectPassengers(multiple passengers)
   ↓
Bermudair
   ↓
❌ Error

¿Es esto automáticamente una violación de Liskov?

No necesariamente.

Pero es algo que debemos analizar.

La pregunta es:

¿La interfaz promete que todas las aerolíneas soportan group check-in?

Si la respuesta es sí, entonces Bermudair está incumpliendo una capacidad que la interface parece prometer.

9. Aquí encontramos una decisión de diseño

Podríamos tener:

interface ICheckInFlow {
  selectPassengers(passengers: PassengerDetails[]): Promise<void>;
}

y documentar:

Some airlines may not support group check-in.

Pero entonces el consumidor tiene que saber que:

ICheckInFlow
   ↓
"Puede que esto lance error"

Eso puede ser problemático.

Otra opción sería diseñar capacidades más explícitas.

Por ejemplo conceptualmente:

IndividualCheckInFlow
GroupCheckInFlow

Pero no significa que debamos cambiar tu interface ahora.

Primero necesitamos entender el problema.

10. D — Dependency Inversion Principle

Este es uno de mis favoritos en tu arquitectura.

La idea simplificada:

Las partes de alto nivel deberían depender de abstracciones, no de implementaciones concretas.

Mira tu Factory:

static getAdapter(...): ICheckInFlow

Está devolviendo:

ICheckInFlow

No:

BermudairCheckInAdapter

Eso es importante.

11. El test depende de una abstracción

Tu test hace:

const checkIn = getCheckInFlow(airline);

Y después:

await checkIn.searchBooking(...);

El test no necesita:

if (airline === 'bermudair') {
   ...
}

ni:

if (airline === 'lift') {
   ...
}

Eso sería terrible:

if (airline === 'lift') {
   await liftPage.locator(...).click();
}

if (airline === 'bermudair') {
   await bermudairPage.locator(...).click();
}

Ahora el test conoce todas las implementaciones.

Tu arquitectura evita eso.

12. Mira la dependencia

Tu test depende de:

ICheckInFlow

Y:

LiftAdapter
BermudairAdapter

implementan esa abstracción.

Por tanto:

                  ICheckInFlow
                  ↑          ↑
                  │          │
                  │          │
             LiftAdapter  BermudairAdapter

El test no está directamente acoplado a:

LiftAdapter

ni:

BermudairAdapter

Eso es Dependency Inversion / abstraction en acción.

13. Y hay otro ejemplo todavía más claro

Tu fixture:

apiService: async ({ request }, use) => {
  const apiService = new AirlineApiService(request);
  await use(apiService);
}

El test recibe:

apiService

No tiene que crear:

new APIRequestContext(...)

ni preocuparse por:

base URL
headers
authentication
request lifecycle

Playwright proporciona:

request

y tu fixture construye:

AirlineApiService

Esto conecta:

Playwright
   ↓
request
   ↓
Fixture
   ↓
AirlineApiService
   ↓
Test

Nuevamente estás separando responsabilidades.

14. Ahora veamos los cinco principios en tu proyecto
Principio	Cómo aparece en tu arquitectura
S — Single Responsibility	Factory, Adapter, Service, Page Object y Fixture tienen responsabilidades diferentes
O — Open/Closed	Puedes agregar nuevos Adapters sin modificar los tests; la Factory todavía requiere modificación
L — Liskov	LiftAdapter y BermudairAdapter pueden utilizarse como ICheckInFlow; las capacidades de group check-in requieren análisis
I — Interface Segregation	Tu ICheckInFlow merece análisis: quizá algunas operaciones no aplican a todas las aerolíneas
D — Dependency Inversion	El test trabaja contra ICheckInFlow, no contra LiftCheckInAdapter o BermudairCheckInAdapter
15. El principio que quiero que recuerdes

No estudies SOLID como cinco letras para memorizar.

Cuando estés diseñando automation, hazte estas preguntas:

S
¿Esta clase está haciendo demasiadas cosas?

O
¿Para agregar algo nuevo tengo que modificar muchas cosas existentes?

L
¿Esta implementación realmente cumple el contrato que promete?

I
¿Mi interface obliga a las implementaciones a tener cosas que no necesitan?

D
¿Mi código depende de abstracciones o de implementaciones concretas?

Estas cinco preguntas son muchísimo más útiles que memorizar definiciones.

16. Y encontramos algo interesante en TU arquitectura

Hay una pequeña tensión arquitectónica que vale la pena estudiar:

ICheckInFlow

aparentemente representa:

Todo lo que un check-in debería poder hacer.

Pero Bermudair tiene:

Group check-in ❌

mientras que quizá otra aerolínea sí tiene:

Group check-in ✅

Eso nos lleva directamente al siguiente nivel:

Módulo 7 — Interface Design + Capabilities

Vamos a analizar si realmente debería existir un:

ICheckInFlow

gigante con:

searchBooking()
selectPassengers()
selectSeats()
acceptSecurityAndTerms()
provideContactDetails()
confirmCheckIn()
...

o si tendría más sentido separar capabilities.

Por ejemplo, conceptualmente:

ICheckInFlow
      │
      ├── IndividualCheckIn
      ├── GroupCheckIn
      ├── SeatSelection
      ├── ContactDetails
      └── BoardingPass

Y aquí vas a aprender Interface Segregation + Composition, que son conceptos muy útiles cuando tienes múltiples aerolíneas con capacidades diferentes.