# SoftwareComplex

Aplicación móvil de simulación de exámenes desarrollada con **React Native** y **Expo Go**. Esta aplicación permite a los estudiantes practicar con una base de datos de 400 preguntas a través de diferentes modos de estudio, llevar un registro de su progreso mediante un calendario y recibir notificaciones recordatorias.

## 📲 Descarga Directa del APK (Android)

Si solo deseas probar o usar la aplicación en tu celular Android sin configurar herramientas de desarrollo, puedes descargar el instalador directamente desde el repositorio:

*   📥 **[Descargar SoftwareComplex.apk](SoftwareComplex.apk?raw=true)**

> [!NOTE]
> Al instalar el archivo APK en tu dispositivo, es posible que Android muestre una advertencia de seguridad o te solicite permitir la instalación desde fuentes desconocidas. Esto es completamente normal, ya que la aplicación está firmada con una clave de depuración y desarrollo (`debug.keystore`).

## Características Principales

*   **Base de datos local:** Incluye 400 preguntas listas para practicar, sin necesidad de conexión a internet.
*   **Modos de Estudio:**
    *   **🔥 Racha Infinita:** Responde preguntas hasta que cometas un error. Ideal para medir tu consistencia.
    *   **⏱️ Racha por Tiempo:** Igual que la racha infinita, pero con un límite de 15 segundos por pregunta. ¡Pon a prueba tu velocidad y reflejos!
    *   **🎲 Modo Aleatorio:** Configura un simulacro personalizado eligiendo la cantidad de preguntas (desde 10 hasta 400). Recibe una calificación, porcentaje de precisión y revisa tus errores detalladamente al final.
*   **Seguimiento de Progreso:**
    *   **Calendario de Estudio:** Visualiza los días que has estudiado, tu racha actual de días consecutivos y tu progreso mensual.
    *   **Estadísticas Globales:** Revisa tu precisión general, total de preguntas respondidas y total de aciertos desde tu perfil.
*   **Notificaciones:** Configura recordatorios motivacionales cada cierta cantidad de horas (de 1 a 8 horas) para mantener tu hábito de estudio activo.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

1.  **Node.js** (versión 18 o superior recomendada)
2.  **npm** (viene incluido con Node.js)
3.  La aplicación **Expo Go** instalada en tu dispositivo móvil ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).

## Instalación y Ejecución

Sigue estos pasos para levantar el proyecto localmente y probarlo en tu celular:

1.  **Abre una terminal** y navega hasta el directorio del proyecto:
    ```bash
    cd SimuladorComplex
    ```

2.  **Instala las dependencias** (si es la primera vez que clonas el repositorio o mueves la carpeta):
    ```bash
    npm install
    ```

3.  **Inicia el servidor de desarrollo de Expo:**
    ```bash
    npx expo start
    ```

4.  **Abre la aplicación en tu celular:**
    *   Abre la app **Expo Go** en tu teléfono.
    *   **En Android:** Escanea el código QR que aparece en la terminal utilizando la opción "Scan QR code" dentro de la app de Expo Go.
    *   **En iOS:** Abre la aplicación nativa de *Cámara* de tu iPhone, enfoca el código QR de la terminal y toca la notificación que aparecerá en la parte superior para abrir el proyecto en Expo Go.
    *   *(Importante: Tu computadora y tu teléfono móvil deben estar conectados a la misma red Wi-Fi para que Expo Go pueda conectarse).*

## Estructura del Proyecto

*   `src/data/questions.js`: Contiene la base de datos de las 400 preguntas (generado a partir del `.md` original).
*   `src/theme/`: Configuración del sistema de diseño (colores, tipografía Inter, espaciado).
*   `src/components/`: Componentes reutilizables (tarjetas de preguntas, barras de progreso, calendario).
*   `src/screens/`: Pantallas de la aplicación (Dashboard, Modos de juego, Perfil, Resultados).
*   `src/services/`: Lógica de almacenamiento local (AsyncStorage) y configuración de notificaciones.
*   `src/navigation/`: Configuración del enrutamiento de la aplicación (Pestañas inferiores y stack de navegación).

## Tecnologías Utilizadas

*   [Expo SDK 54](https://docs.expo.dev/)
*   [React Native](https://reactnative.dev/)
*   React Navigation (Bottom Tabs & Native Stack)
*   AsyncStorage (Persistencia local de datos)
*   Expo Notifications (Recordatorios push locales)
*   Expo Google Fonts (Tipografía Inter)
