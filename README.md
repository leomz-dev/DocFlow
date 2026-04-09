# 🌊 DocFlow

![Versión](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**DocFlow** es una plataforma integral diseñada para simplificar la gestión administrativa y la generación de documentos profesionales. Crea cuentas de cobro, cotizaciones y contratos con un solo clic, manteniendo un registro organizado de tus clientes y exportando todo a PDFs de alta fidelidad.

---

## ✨ Características Principales

*   **🚀 Generación Dinámica de PDF**: Crea documentos con diseño profesional utilizando Puppeteer y Handlebars.
*   **📊 Gestión de Clientes**: Base de datos centralizada de clientes con búsqueda y autocompletado inteligente.
*   **🛡️ Autenticación Segura**: Acceso mediante correo electrónico o integración fluida con **Google OAuth**.
*   **⚙️ Perfil de Empresa**: Personalización total con logo, firma digital y datos de representante legal.
*   **🧮 Cálculos Automáticos**: Manejo inteligente de subtotales, IVA y Retención en la fuente configurable.
*   **📜 Historial de Actividad**: Archivo cronológico de todos los documentos generados para control administrativo.
*   **📱 Diseño Responsivo**: Interfaz moderna optimizada para dispositivos móviles y escritorio.

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** + **Vite** para máxima velocidad de desarrollo.
- **Tailwind CSS** para un diseño moderno y minimalista.
- **Radix UI** para componentes accesibles y robustos.
- **Lucide Icons** para iconografía minimalista.
- **Axios** & **React Router 7**.

### Backend
- **Node.js** & **Express**.
- **Prisma ORM** con soporte para **PostgreSQL**.
- **Puppeteer** para la exportación de PDFs precisos.
- **Handlebars** para plantillas HTML dinámicas.
- **JWT** (JSON Web Tokens) para sesiones seguras.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL
- Cuenta de Google Cloud (para OAuth)

### Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repo>
   cd docflow
   ```

2. **Configurar el Backend**:
   ```bash
   cd server
   npm install
   ```
   Crea un archivo `.env` en la carpeta `server` (o usa el de la raíz si lo has centralizado) con lo siguiente:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://user:password@localhost:5432/docflow"
   JWT_SECRET="tu_secreto_super_seguro"
   CLIENT_URL="http://localhost:5173"
   GOOGLE_CLIENT_ID="tu_id_de_google_cloud"
   ```

3. **Configurar el Frontend**:
   ```bash
   cd ../client
   npm install
   ```

4. **Preparar la Base de Datos**:
   ```bash
   cd ../server
   npx prisma migrate dev --name init
   ```

### Ejecución en Desarrollo

**Lanzar el Servidor:**
```bash
cd server
npm run dev
```

**Lanzar el Cliente:**
```bash
cd client
npm run dev
```

---

## 📂 Estructura del Proyecto

```text
DocFlow/
├── client/              # Aplicación React (Frontend)
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Vistas principales (Dashboard, Settings, etc.)
│   │   └── context/     # Gestión de estado global (Auth)
├── server/              # API Express (Backend)
│   ├── src/
│   │   ├── controllers/ # Lógica de rutas
│   │   ├── routes/      # Definición de endpoints
│   │   ├── services/    # Lógica de negocio y generación de documentos
│   │   └── templates/   # Plantillas Handlebars para PDFs
│   └── prisma/          # Esquema y migraciones de DB
└── .env                 # Variables de entorno globales
```

---

## 📝 Notas de Uso

- **Ajustes**: Asegúrate de subir tu logo y firma en la sección de Ajustes antes de generar tu primer documento para que aparezcan en el PDF.
- **Retención**: Puedes configurar la tasa de retención por defecto en los Ajustes para automatizar los cálculos en las Cuentas de Cobro.

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

---

Desarrollado con ❤️ para optimizar tu flujo de trabajo.
