# 💑 MariPuntos

**Gamifica los permisos en tu relación de pareja**

MariPuntos es una aplicación móvil innovadora que transforma la dinámica de permisos entre parejas en una experiencia divertida y gamificada. Gana puntos por acciones, solicita permisos, canjea recompensas y desbloquea logros junto a tu pareja.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-Proprietary-red)

🌐 **Website:** [maripuntos.com](https://maripuntos.com)  
📧 **Soporte:** arias9068@gmail.com

## ✨ Características

### 🎮 Gamificación Completa

- **Sistema de Puntos**: Gana MariPuntos completando acciones
- **Niveles**: Progresa y sube de nivel
- **Logros**: Desbloquea logros especiales
- **Recompensas**: Canjea puntos por recompensas

### 🤝 Gestión de Permisos

- **Solicitar Permisos**: Pide permiso a tu pareja de forma organizada
- **Aprobar/Rechazar**: Gestiona solicitudes de tu pareja
- **Historial**: Revisa todos los permisos pasados
- **Notificaciones**: Recibe alertas en tiempo real

### 🎯 Acciones y Puntos

- **Catálogo de Acciones**: Múltiples categorías (salida, compra, tiempo, actividad)
- **Completar Acciones**: Gana puntos por tareas completadas
- **Historial**: Rastrea todas tus acciones

### 🎁 Sistema de Recompensas

- **Catálogo Variado**: Experiencias, regalos, privilegios, tiempo
- **Canje Inteligente**: Verifica tu saldo antes de canjear
- **Historial de Canjes**: Revisa tus recompensas

### 👤 Perfil y Pareja

- **Vinculación**: Conecta tu cuenta con tu pareja mediante código
- **Estadísticas**: Ve tu progreso y el de tu pareja
- **Configuración**: Personaliza tu experiencia

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Expo CLI
- Cuenta de Clerk (para autenticación)
- Proyecto Firebase con app Android configurada (para notificaciones push)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd mari-puntos-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Clerk

# 4. Iniciar la aplicación
npm start
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
npx expo run:android
# o con EAS
eas build --platform android
```

Para instrucciones detalladas, consulta [SETUP.md](./SETUP.md)

## 📱 Stack Tecnológico

### Frontend

- **React Native** 0.81.5 - Framework móvil
- **Expo** ~54.0 - Plataforma de desarrollo
- **TypeScript** 5.9 - Lenguaje tipado
- **Expo Router** 6.0 - Navegación file-based

### Autenticación

- **Clerk** - Autenticación y gestión de usuarios
- **Expo SecureStore** - Almacenamiento seguro de tokens

### Estado y Datos

- **Zustand** - Estado global
- **Axios** - Cliente HTTP
- **AsyncStorage** - Persistencia local

### UI/UX

- **Ionicons** - Iconos
- **React Native Toast** - Notificaciones
- **Custom Components** - Sistema de diseño propio

## 🎨 Diseño

### Paleta de Colores

- **Turquesa Claro** (#24C6B0) - Color principal
- **Turquesa Oscuro** (#118B82) - Color principal oscuro
- **Amarillo MariPunto** (#F8C822) - Color de acento
- **Gris Neutro** (#F4F4F4) - Fondo
- **Blanco** (#FFFFFF) - Contenido

### Tipografía

- **Familia**: Poppins (Regular, Medium, SemiBold, Bold)
- **Estilo**: Moderno, limpio, legible

## 📂 Estructura del Proyecto

```
mari-puntos-app/
├── app/                    # Rutas (Expo Router)
│   ├── (auth)/            # Autenticación
│   ├── (tabs)/            # Navegación principal
│   ├── permissions/       # Gestión de permisos
│   ├── actions/           # Acciones
│   ├── rewards/           # Recompensas
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
npm start          # Iniciar Expo dev server
npm run android    # Abrir en Android
npm run ios        # Abrir en iOS
npm run web        # Abrir en navegador
npm run lint       # Ejecutar ESLint
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

### Recompensas

- Catálogo de recompensas por categoría
- Verificación de saldo
- Canje de puntos
- Historial de canjes

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
- 🛒 Marketplace de recompensas
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

© 2024 MariPuntos - Todos los derechos reservados

## 👨‍💻 Autor

Desarrollado con 💑 para parejas en Costa Rica y el mundo

## 🙏 Agradecimientos

- Expo team por la excelente plataforma
- Clerk por la autenticación simplificada
- Comunidad de React Native

---

**¿Preguntas o comentarios?** Contáctanos en arias9068@gmail.com

**¿Listo para gamificar tu relación? ¡Descarga MariPuntos hoy!** 🎮💑
