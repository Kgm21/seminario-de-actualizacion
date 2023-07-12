-- Crear la base de datos
CREATE DATABASE userHandler;

-- Usar la base de datos creada
USE userHandler;

-- Crear la tabla de usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY,
  nombre VARCHAR(50),
  email VARCHAR(100),
  fecha_nacimiento DATE
);

-- Insertar datos de ejemplo en la tabla de usuarios
INSERT INTO usuarios (id, nombre, email, fecha_nacimiento) VALUES
(1, 'Juan Pérez', 'juan@example.com', '1990-01-01'),
(2, 'María López', 'maria@example.com', '1995-05-15'),
(3, 'Pedro Gómez', 'pedro@example.com', '1988-12-10'),
(4, 'Ana Torres', 'ana@example.com', '1992-07-20'),
(5, 'Carlos Rodríguez', 'carlos@example.com', '1985-03-12'),
(6, 'Laura Sánchez', 'laura@example.com', '1998-09-05'),
(7, 'Andrés Vargas', 'andres@example.com', '1993-11-18'),
(8, 'Sofía Martínez', 'sofia@example.com', '1996-02-25'),
(9, 'Gabriel Herrera', 'gabriel@example.com', '1991-06-30'),
(10, 'Valentina Ramírez', 'valentina@example.com', '1997-08-08'),
(11, 'Diego Castro', 'diego@example.com', '1994-04-22'),
(12, 'Isabella Silva', 'isabella@example.com', '1989-10-03'),
(13, 'Manuel Rojas', 'manuel@example.com', '1999-12-15');

-- Crear el procedimiento almacenado
DELIMITER //

CREATE PROCEDURE ObtenerUsuarioPorId(IN usuario_id INT)
BEGIN
  -- Sentencia SELECT para obtener un usuario por su ID
  SELECT * FROM usuarios WHERE id = usuario_id;
END //

DELIMITER ;