import readline from 'readline';

// Helper to create a readline interface and call onLine for each line of input
export function createInput(promptText, onLine) {
  // Create a readline interface that reads from stdin (keyboard) and writes to stdout (terminal)
  const rl = readline.createInterface({
    input: process.stdin,   // Read from standard input (terminal keyboard)
    output: process.stdout  // Write to standard output (terminal screen)
  });

  // Set the prompt text that appears before each line (e.g., "user1> " or "user2> ")
  rl.setPrompt(promptText);
  // Display the prompt for the first time
  rl.prompt();

  // Listen for when user presses Enter (a complete line has been entered)
  rl.on('line', (line) => {
    // Call the callback function with the entered line
    onLine(line);
    // Re-display the prompt so user can type the next line
    rl.prompt();
  });

  // Listen for when the readline interface is closed (e.g., Ctrl+C or Ctrl+D)
  rl.on('close', () => {
    // Exit the process when readline closes
    process.exit(0);
  });

  // Return the readline interface so caller can control it (e.g., for displaying messages)
  return rl;
}


