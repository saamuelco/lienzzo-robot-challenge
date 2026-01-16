# 🤖 Lienzzo.bot

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Testing-Vitest-yellow?style=flat-square&logo=vitest)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square&logo=vercel)

> Solución oficial al reto técnico de **Lienzzo**. Una aplicación web para la simulación y gestión de robots exploradores.

## 🚀 Demo en producción

Puedes probar la aplicación desplegada y funcional aquí:
**[👉 https://lienzzo-robot-challenge.vercel.app/](https://lienzzo-robot-challenge.vercel.app/)**

---

## 📋 Funcionalidades principales

Esta aplicación no solo simula movimientos, sino que ofrece una experiencia completa de gestión de simulaciones con persistencia de datos.

* **Simulador interactivo:**
    * Grid 5x5 con renderizado dinámico.
    * **Edición del grid:** El usuario puede colocar y eliminar obstáculos haciendo clic en el grid (con validaciones de límites y zonas prohibidas).
    * Panel de comandos visual (Avanzar, Girar Izquierda/Derecha).
* **Lógica robusta:** Algoritmo de movimiento protegido contra bordes, colisiones y comandos inválidos.
* **Historial y persistencia:** Guardado automático de resultados en base de datos (Supabase).
* **Visualización (Replay):** Detalle paso a paso de las simulaciones pasadas.
* **Seguridad:** Sistema de autenticación completo (Email/Password) con confirmación de correo obligatoria.

---

## 🛠️ Stack Tecnológico

* **Core:** Next.js 15, React, TypeScript.
* **Backend / Base de Datos:** Supabase (PostgreSQL).
* **Testing:** Vitest (Unit Testing).

---

## 🏗️ Arquitectura y Decisiones Técnicas

El proyecto sigue una arquitectura moderna centrada en la seguridad y el rendimiento, aprovechando las capacidades *Full Stack* de Next.js.

### 1. Separación Cliente / Servidor
Se ha optado por una arquitectura híbrida para maximizar la interactividad sin sacrificar la seguridad:
* **Client Components (`.tsx`):** Manejan la UI interactiva (clicks en el grid, feedback visual, toasts, gestión de formularios). Utilizan estado local (`useState`) para la gestión efímera de la simulación.
* **Server Actions (`.ts`):** Toda la lógica de negocio pesada y la comunicación con la base de datos se ejecuta exclusivamente en el servidor. Esto reduce el código de JavaScript que se envía al cliente y protege la lógica de negocio.

### 2. Seguridad en Base de Datos (RLS)
Más allá de la validación en frontend, la seguridad real reside en la base de datos. Se ha implementado **Row Level Security (RLS)** en Supabase.
* **Política:** *Strict Ownership*. Un usuario solo puede visualizar (`SELECT`), crear (`INSERT`) o borrar (`DELETE`) las simulaciones que contengan su propio `user_id`.
* Esto garantiza que, incluso si alguien intentara atacar la API directamente, no podría acceder a datos de otros usuarios.

### 3. Autenticación
Se utiliza el sistema de Auth de Supabase configurado con flujo PKCE.
* Registro con validación de contraseña segura (frontend y backend).
* **Confirmación de Email obligatoria:** Para evitar cuentas spam y asegurar la identidad del usuario antes de permitir el acceso al simulador.

---

## ✅ Testing y calidad

La fiabilidad de la lógica del robot es crítica. Por ello, se ha implementado una suite de tests unitarios exhaustiva utilizando **Vitest**.

Se ha priorizado el testing del algoritmo que lleva a cabo la ejecución de una simulación en el servidor (`calculatePath`).

* **Cobertura:** 100% en la lógica de simulación.
* **Casos de prueba:**
    * Movimientos básicos y rotaciones (360º).
    * Detección de colisiones con obstáculos.
    * Respeto estricto de los límites del Grid (Boundary testing).
    * Generación correcta de logs para el historial.

Para ejecutar los tests localmente:
```bash
npm run test
# O para ver el reporte de cobertura:
npm run test -- --coverage
```

---

## 💻 Instalación y Configuración local

Sigue estos pasos para clonar y ejecutar el proyecto en tu máquina.

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/saamuelco/lienzzo-robot-challenge.git
    cd lienzzo-robot-challenge
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto con las credenciales de tu proyecto Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

La aplicación estará disponible en `http://localhost:3000`.

---

## 📄 Licencia

Este proyecto es público y ha sido desarrollado como parte de un proceso de selección técnica.

---
*Desarrollado por Samuel Cantó Ortuño.*
