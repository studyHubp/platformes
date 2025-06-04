<?php
// Create variables for messages
$success = "";
$error = "";

// Connect to MySQL (adjust db name if needed)
$conn = new mysqli("localhost", "root", "", "mywebsite_db");

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Handle form submit
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $username = trim($_POST["username"]);
  $email = trim($_POST["email"]);
  $password = $_POST["password"];
  $confirmPassword = $_POST["confirmPassword"];

  if (empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
    $error = "All fields are required.";
  } elseif ($password !== $confirmPassword) {
    $error = "Passwords do not match.";
  } else {
    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Prepare SQL
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashedPassword);

    if ($stmt->execute()) {
      $success = "Signup successful! You can now log in.";
    } else {
      $error = "Error: " . $stmt->error;
    }

    $stmt->close();
  }
}
?>

<!DOCTYPE html>
<html>
<head>
  <title>Signup Page</title>
  <style>
    body {
      font-family: Arial;
      background: #f4f4f4;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }

    .signup-container {
      background: white;
      padding: 2em;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      width: 350px;
    }

    h2 {
      text-align: center;
    }

    input, button {
      width: 100%;
      padding: 10px;
      margin: 0.5em 0;
      border-radius: 5px;
      border: 1px solid #ccc;
    }

    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
    }

    .error {
      color: red;
      text-align: center;
    }

    .success {
      color: green;
      text-align: center;
    }
  </style>
</head>
<body>

<div class="signup-container">
  <h2>Create Account</h2>
  <form method="POST" action="">
    <input type="text" name="username" placeholder="Username" required />
    <input type="email" name="email" placeholder="Email" required />
    <input type="password" name="password" placeholder="Password" required />
    <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
    <button type="submit">Sign Up</button>

    <?php if ($error): ?>
      <p class="error"><?= $error ?></p>
    <?php endif; ?>

    <?php if ($success): ?>
      <p class="success"><?= $success ?></p>
    <?php endif; ?>
  </form>
</div>

</body>
</html>
