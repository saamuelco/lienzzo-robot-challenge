# 🤖 Simulador de Robot

App para simular los movimientos de un robot en una cuadrícula de 5x5 con obstáculos. Desarrollada con **Next.js 15** y **Supabase**.

---

## 🚀 Stack Tecnológico

- **Framework:** Next.js 15
- **Lenguaje:** TypeScript
- **Base de Datos:** Supabase
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React

---

## 🏛️ Decisiones de Arquitectura

### 1. Procesamiento en servidor
Siguiendo los requisitos, la lógica de simulación reside completamente en el servidor utilizando **Server Actions**.
- **¿Por qué?** Ayuda a evitar la manipulación en el lado del cliente. El frontend solo envía la *intención* (la cadena de comandos) y el servidor valida, calcula la ruta y devuelve el resultado.
- **Procesamiento en lote:** En lugar de enviar una petición por cada movimiento (lo que generaría latencia y tráfico innecesario), la secuencia completa se procesa en una sola llamada. Esto, además, asegura la atomicidad de la base de datos.

### 2. Modelo de datos: JSONB vs Tabla "state"
La tabla `simulation` utiliza una columna `execution_log` de tipo **JSONB** para almacenar el historial de una simulación paso a paso.
- **¿Por qué?** Los logs de simulación son **inmutables**. Almacenarlos como un documento evita la "amplificación de escritura" (hacer 1 insert vs 50 inserts para guardar una sola simulación). Además, también agiliza la creación del historial, pues evita tener que hacer joins costosos entre la tabla `simulation` y la hipotética tabla `state` para recrear una simulación previa.

### 3. Seguridad (Row Level Security)
La seguridad se gestiona a nivel de base de datos, no solo en la capa de API.
- **Políticas RLS:** Habilitadas en la tabla `simulation` para que los usuarios *solo* puedan hacer SELECT e INSERT de sus propias filas. Incluso si el endpoint de la API quedara expuesto, el motor de base de datos impediría la fuga de datos de otros usuarios.

---

## 🛠️ Configuración e instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/saamuelco/lienzzo-robot-challenge.git
cd lienzzo-robot-challenge
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
```

### 4. Configuración de base de datos
Ejecuta el siguiente script SQL en tu Editor SQL de Supabase para crear el esquema y las políticas:

```sql
create table public.simulation (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid(), -- FK a auth.users
  created_at timestamptz not null default now(),
  
  -- Inputs
  commands text not null, -- "AADAI"
  -- Guardamos la configuración del mapa de ESTA partida (Bonus)
  obstacles jsonb not null default '[]'::jsonb, 
  
  -- Outputs (Calculados por el servidor)
  final_x int not null,
  final_y int not null,
  
  -- Log completo (JSONB)
  -- Guardará: [{ "step": 1, "x": 0, "y": 1, "dir": "N", "event": "move", "success?" }, ...]
  execution_log jsonb not null, 
  
  constraint simulation_pkey primary key (id),
  -- Si se borra el usuario, se borran sus simulaciones
  constraint simulation_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- (Row Level Security)
alter table public.simulation enable row level security;

-- Lectura:
create policy "Usuarios ven sus propias simulaciones"
on public.simulation for select
using ( auth.uid() = user_id );

-- Inserción:
create policy "Usuarios insertan sus propias simulaciones"
on public.simulation for insert
with check ( auth.uid() = user_id );

-- Índice para optimizar filtrado por usuario
create index simulation_user_id_idx on public.simulation (user_id);
```

### 5. Ejecutar servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📂 Estructura del Proyecto

```
├── app/
│   ├── actions.ts       # Server Actions (Lógica Backend)
│   ├── login/           # Rutas de Autenticación
│   └── page.tsx         # Dashboard Principal
├── components/          # Componentes de UI reutilizables
├── lib/
│   └── supabase/        # Clientes Supabase (Server & Browser)
├── types/               # Interfaces TypeScript Globales
└── utils/
    └── robotLogic.ts    # Lógica pura del dominio (Testable y Aislada)
```

## ✅ Funcionalidades

- [ ] Autenticación de Usuarios (Supabase Auth)
- [ ] Simulación en Grid 5x5
- [ ] Validación y Lógica en Servidor
- [ ] Detección de Obstáculos
- [ ] Historial de Simulaciones (Persistencia)
- [ ] Bonus: Replay Visual/Animación
- [ ] Bonus: Editor de Obstáculos