let accessToken = "";

export function setAccessToken(token) {
  accessToken = token;
}

export async function Log(stack, level, packageName, message) {
  if (!accessToken) {
    console.warn("Logging Middleware: Access token is missing.");
    console.log(`[${stack}] [${level}] [${packageName}]: ${message}`);
    return;
  }

  const logData = {
    stack,
    level,
    package: packageName,
    message
  };

  try {
    const response = await fetch("http://4.224.186.213/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(logData)
    });

    if (!response.ok) {
      console.error("Logging Middleware Error: HTTP", response.status);
    }
  } catch (error) {
    console.error("Logging Middleware Error:", error);
  }
}
