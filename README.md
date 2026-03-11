# 🚢 SGCP: Sistema Gestor de Contenedores Portuarios

> Aplicación web integral para la gestión de operaciones logísticas portuarias, diseñada para optimizar el flujo de importación/exportación y el control de inventario en tiempo real.

---

## 🎯 El Desafío
La gestión portuaria implica coordinar múltiples entidades (clientes, embarcaciones, contenedores y productos) con movimientos constantes.
* **Problema:** La falta de trazabilidad en los movimientos de carga y la dificultad para generar reportes operativos precisos.
* **Solución:** Un sistema centralizado con un backend potente en PL/SQL que garantiza la integridad de los datos mediante reglas de negocio automatizadas y reportes analíticos.

## 🛠️ Tecnologías Utilizadas
* **Backend & Base de Datos:** Oracle SQL Server / PL/SQL.
* **Frontend:** JavaScript (Interfaz de usuario y Dashboard dinámico).
* **Lógica de Datos:** Triggers (Disparadores), Procedimientos Almacenados y Secuencias.

## ✨ Características Principales
* ✅ **Dashboard en Tiempo Real:** Visualización de métricas críticas como embarcaciones en puerto, alertas activas y estado de contenedores (Operativo, Dañado, etc.).
* ✅ **Gestión Integral (CRUD):** Módulos completos para Clientes, Lotes, Productos y Embarcaciones.
* ✅ **Control de Movimientos:** Registro histórico de entradas, salidas e inspecciones de los últimos 7 días.
* ✅ **Sistema de Alertas:** Notificaciones automáticas ante situaciones críticas operativas.

## 📊 Inteligencia de Negocio y Reportes
Se implementaron 10 procedimientos almacenados complejos con parámetros de filtrado para:
* **Ranking de Clientes:** Identificación de los socios comerciales más activos.
* **Auditoría de Usuarios:** Trazabilidad completa de quién y cuándo modificó los datos.
* **Estado del Puerto:** Análisis de contenedores activos, próximos a salir o abandonados.

## 🗄️ Arquitectura de Base de Datos
El núcleo del proyecto reside en la robustez de la base de datos:
* **Triggers:** Automatización de validaciones y actualizaciones de estado de carga.
* **Procedimientos:** Encapsulamiento de la lógica de negocio para garantizar la consistencia de los reportes.
* **Seguridad:** Módulo de autenticación y control de sesiones por usuario.
