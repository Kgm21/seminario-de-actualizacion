<?php
// Configuración de la conexión a la base de datos
$host = "localhost";
$dbname = "userHandler";
$username = "root";
$password = "isft";

try 
{
  // Crear una nueva instancia de conexión a la base de datos
  $connection = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
  $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  
  // Obtener el ID del usuario a través del método GET
  $usuario_id = json_decode(file_get_contents('php://input'));


  // Generación del código SQL
  $sql = "SELECT * FROM usuarios WHERE id=$usuario_id";

  //ejemplos de inyeccion
   //1. $sql = "SELECT * FROM usuarios WHERE id ='10' or '1'= '1'" ->>> aacede a los registros de usuarios aunque el id sea incorrecto
  // 2. $sql = "SELECT * FROM usuarios WHERE id='$usuario_id' and id is NULL; //accede a que uno  de los campos es id
  //$sql = SELECT * FROM usuarios WHERE id='$usuario_id'; INSERT INTO tabla VALUES (NULL, 'hacker'); //Añadir un nuevo usuario


  // Ejecutar la sentencia SQL
  $stmt = $connection->query($sql);

  // Obtener los resultados
  $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Cerrar la conexión a la base de datos
  $connection = null;

  // Devolver los resultados en formato JSON
  header('Content-Type: application/json');
  echo json_encode($results);
} catch (PDOException $e) 
{
  echo "Error: " . $e->getMessage();
}


?>
