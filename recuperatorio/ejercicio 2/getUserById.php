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

  //llamado al procedimiento almacenado
  $sql = "CALL ObtenerUsuarioPorId(:usuario_id)";
  $stmt = $connection->prepare($sql);
  $stmt->bindParam(':usuario_id', $usuario_id);
  


  // Ejecutar el procedimiento almacenado
  $stmt ->exeute();

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

