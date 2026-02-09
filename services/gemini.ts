
// Gemini API removed - using pre-written romantic messages instead

const romanticMessages = [
  "You've made me the happiest person alive! I can't wait to spend Valentine's Day with you. ❤️",
  "From the moment you said yes, my heart soared. You're my everything, and I promise to cherish every moment we share together. 💕",
  "My heart beats only for you. Thank you for choosing me to be your Valentine. Let's make this day unforgettable! 🌹",
  "You've filled my world with love and light. Being your Valentine is the greatest gift I could ever receive. 💖",
  "Every moment with you feels like a dream come true. I'm so grateful you said yes! Happy Valentine's Day, my love! 💘"
];

export const generateRomanticMessage = async (name: string): Promise<string> => {
  // Simulate a brief loading delay for authenticity
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a random romantic message
  const randomIndex = Math.floor(Math.random() * romanticMessages.length);
  return romanticMessages[randomIndex];
};
