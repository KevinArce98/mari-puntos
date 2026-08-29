# 💑 MariPuntos

**Gamifica los permisos en tu relación de pareja**

MariPuntos es una aplicación móvil innovadora que transforma la dinámica de permisos entre parejas en una experiencia divertida y gamificada. Gana puntos por acciones, solicita permisos, mantén rachas semanales y desbloquea logros junto a tu pareja.

![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-~57.0-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-Proprietary-red)

🌐 **Website:** [maripuntos.com](https://maripuntos.com)  
📧 **Soporte:** arias9068@gmail.com

## ✨ Características

### 🎮 Gamificación Completa

- **Sistema de Puntos**: Gana MariPuntos completando acciones
- **Niveles**: Progresa y sube de nivel
- **Logros**: Desbloquea logros especiales
- **Rachas**: Mantén rachas semanales completando acciones junto a tu pareja

### 🤝 Gestión de Permisos

- **Solicitar Permisos**: Pide permiso a tu pareja de forma organizada
- **Aprobar/Rechazar**: Gestiona solicitudes de tu pareja
- **Historial**: Revisa todos los permisos pasados
- **Notificaciones**: Recibe alertas en tiempo real

### 🎯 Acciones y Puntos

- **Catálogo de Acciones**: Múltiples categorías (salida, compra, tiempo, actividad)
- **Completar Acciones**: Gana puntos por tareas completadas
- **Historial**: Rastrea todas tus acciones

### 🔥 Rachas Semanales

- **Racha Activa**: Ambos completan acciones cada semana para mantenerla
- **Racha Más Larga**: Récord histórico del streak de la pareja
- **Progreso Visual**: Ve si tu pareja ya completó su parte esta semana

### 👤 Perfil y Pareja

- **Vinculación**: Conecta tu cuenta con tu pareja mediante código
- **Estadísticas**: Ve tu progreso y el de tu pareja
- **Configuración**: Personaliza tu experiencia

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+ (requerido por Expo SDK 57)
- pnpm 11 (`packageManager: pnpm@11`)
- Expo CLI
- Cuenta de Clerk (para autenticación)
- Proyecto Firebase con app Android configurada (para notificaciones push)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd mari-puntos-app

# 2. Instalar dependencias (desde la raíz del monorepo)
cd ..
pnpm install
cd mari-puntos-app

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Clerk

# 4. Iniciar la aplicación
pnpm start
```

### Configuración de notificaciones push (Android)

Las notificaciones push en Android requieren Firebase Cloud Messaging (FCM).

**Paso 1 — Obtener `google-services.json`:**

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Selecciona el proyecto `maripuntos-9cac2` (o créalo si no existe)
3. Configuración (⚙️) → Tus apps → Android (`com.maripuntos.app`)
4. Descarga `google-services.json`

**Paso 2 — Colocar el archivo:**

```
android/app/google-services.json
```

> Este archivo no se incluye en el repositorio por seguridad. Sin él, el registro de push tokens fallará en Android con el error `Default FirebaseApp is not initialized`.

**Paso 3 — Rebuild nativo:**

```bash
pnpm exec expo run:android
# o con EAS
eas build --platform android
```

Para instrucciones detalladas, consulta [SETUP.md](./SETUP.md)

## 📱 Stack Tecnológico

### Frontend

- **React Native** 0.86 - Framework móvil
- **Expo** ~57.0 (SDK 57) - Plataforma de desarrollo
- **TypeScript** 6.0 - Lenguaje tipado
- **Expo Router** 57 - Navegación file-based
- **React Compiler** - Memoización automática (habilitado; no hace falta `memo`/`useMemo` manual)

### Autenticación

- **Clerk** - Autenticación y gestión de usuarios
- **Expo SecureStore** - Almacenamiento seguro de tokens

### Estado y Datos

- **TanStack Query (react-query) v5** - Estado de servidor: caché, `useInfiniteQuery` e invalidación
- **Zustand** - Estado de cliente/sesión (usuario, idioma, notificaciones)
- **React Hook Form + Zod** - Formularios y validación por esquemas
- **Axios** - Cliente HTTP
- **AsyncStorage** - Persistencia local

### UI/UX

- **Ionicons** - Iconos
- **sonner-native** - Toasts / notificaciones in-app
- **@legendapp/list** - Listas virtualizadas (LegendList)
- **expo-image** - Imágenes con caché
- **Custom Components** - Sistema de diseño propio

## 🎨 Diseño

### Paleta de Colores

- **Teal** (#0F766E) - Color principal
- **Teal Oscuro** (#115E59) - Color principal oscuro
- **Ámbar** (#D97706) - Color de acento
- **Rosa "love"** (#FB7185) - Acento afectivo
- **Neutro** (#FAFAF9) - Fondo
- **Blanco** (#FFFFFF) - Superficie / contenido

### Tipografía

- **Familia**: Plus Jakarta Sans (Regular, Medium, SemiBold, Bold)
- **Carga**: embebida en build vía el config plugin `expo-font` (fuentes en `assets/fonts/`)
- **Estilo**: Moderno, limpio, legible

## 📂 Estructura del Proyecto

```
mari-puntos-app/
├── app/                    # Rutas (Expo Router)
│   ├── (auth)/            # Autenticación
│   ├── (tabs)/            # Navegación principal
│   ├── permissions/       # Gestión de permisos
│   ├── actions/           # Acciones
│   └── achievements/      # Logros
├── components/            # Componentes reutilizables
│   └── ui/               # Sistema de diseño
├── hooks/                # Custom hooks
├── services/             # Servicios de API
├── stores/               # Estado global (Zustand)
├── theme/                # Sistema de diseño
└── assets/               # Recursos estáticos
```

Para más detalles, consulta [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🔧 Scripts Disponibles

```bash
pnpm start          # Iniciar Expo dev server
pnpm run android    # Abrir en Android
pnpm run ios        # Abrir en iOS
pnpm run web        # Abrir en navegador
pnpm run lint       # Ejecutar ESLint
```

### Ejecutar en dispositivo físico

```bash
pnpm exec expo run:android --device
pnpm exec expo run:ios --device
```

## 📦 Builds y distribución (EAS)

```bash
# Build iOS para TestFlight (App Store Connect)
eas build -p ios --profile production

# Enviar el último build iOS a TestFlight
eas submit -p ios --profile production --latest

# Build Android APK (distribución interna)
eas build -p android --profile preview
```

## 🎯 Funcionalidades Principales

### Dashboard

- Resumen de puntos y nivel
- Acciones rápidas
- Permisos pendientes
- Información de pareja

### Permisos

- Solicitar permisos con mensaje
- Aprobar/rechazar solicitudes
- Ver historial completo
- Estados: pendiente, aprobado, rechazado

### Acciones

- Ver acciones disponibles por categoría
- Completar acciones con notas
- Ganar puntos automáticamente
- Historial de acciones completadas

### Rachas

- Racha semanal actual de la pareja
- Racha más larga histórica
- Estado de progreso semanal (mi parte / parte del partner)

### Logros

- Ver logros desbloqueados
- Progreso de logros bloqueados
- Estadísticas de completitud
- Diferentes tipos de logros

## 🚀 Mejoras Futuras

### Corto Plazo

- ✅ Notificaciones push
- ✅ Modo offline
- ✅ Animaciones mejoradas
- ✅ Modo oscuro
- ✅ Internacionalización

### Mediano Plazo

- 📱 Chat en tiempo real
- 📅 Calendario de permisos
- 📊 Estadísticas avanzadas
- 🎮 Gamificación avanzada
- 🌐 Compartir en redes

### Largo Plazo

- 🤖 IA para sugerencias
- 👥 Comunidad y foros
- ⌚ Integración con wearables
- 💻 Versión web

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

© 2026 MariPuntos - Todos los derechos reservados

## 👨‍💻 Autor

Desarrollado con 💑 para parejas en Costa Rica y el mundo

## 🙏 Agradecimientos

- Expo team por la excelente plataforma
- Clerk por la autenticación simplificada
- Comunidad de React Native

---

**¿Preguntas o comentarios?** Contáctanos en arias9068@gmail.com

**¿Listo para gamificar tu relación? ¡Descarga MariPuntos hoy!** 🎮💑
