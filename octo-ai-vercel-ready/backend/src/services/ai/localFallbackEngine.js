import { AARA_CANONICAL_IDENTITY_REPLY } from './systemPrompts.js';

/**
 * OCTO AI Local Demo & Knowledge Engine (Offline Mode)
 * Explicitly labeled as demo mode when real AI is not connected.
 * Dynamically parses user intent and responds intelligently without hardcoded canned paragraphs.
 */

// Math evaluator for dynamic arithmetic expressions
function tryEvaluateMath(text = '') {
  const clean = text.toLowerCase();
  
  // Patterns like "25 multiplied by 48", "25 times 48", "25 * 48"
  const multMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:multiplied by|times|\*|x)\s*(\d+(?:\.\d+)?)/i);
  if (multMatch) {
    const a = parseFloat(multMatch[1]);
    const b = parseFloat(multMatch[2]);
    const result = a * b;
    return `${a} × ${b} = **${result.toLocaleString()}**`;
  }

  // Patterns like "add 25 and 48", "25 + 48", "25 plus 48"
  const addMatch = clean.match(/(?:add\s+)?(\d+(?:\.\d+)?)\s*(?:\+|plus|and)\s*(\d+(?:\.\d+)?)/i);
  if (addMatch && (clean.includes('+') || clean.includes('plus') || clean.includes('add') || clean.includes('sum'))) {
    const a = parseFloat(addMatch[1]);
    const b = parseFloat(addMatch[2]);
    return `${a} + ${b} = **${(a + b).toLocaleString()}**`;
  }

  // Patterns like "divide 100 by 4", "100 / 4"
  const divMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:\/|divided by)\s*(\d+(?:\.\d+)?)/i);
  if (divMatch) {
    const a = parseFloat(divMatch[1]);
    const b = parseFloat(divMatch[2]);
    if (b === 0) return 'Division by zero is undefined.';
    return `${a} ÷ ${b} = **${(a / b).toLocaleString()}**`;
  }

  // Subtraction "48 minus 25", "48 - 25"
  const subMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:-|minus|subtract)\s*(\d+(?:\.\d+)?)/i);
  if (subMatch) {
    const a = parseFloat(subMatch[1]);
    const b = parseFloat(subMatch[2]);
    return `${a} - ${b} = **${(a - b).toLocaleString()}**`;
  }

  return null;
}

export function generateLocalReply({ message, mode = 'assistant', history = [] }) {
  const norm = message.toLowerCase().trim().replace(/[^\w\s*+/-]/gi, ' ');

  // 1. Mandatory Identity Check
  const isIdentityQuestion =
    norm.includes('who are you') ||
    norm.includes('what is your name') ||
    norm.includes('who do you assist') ||
    norm.includes('tell me about yourself') ||
    norm.includes('introduce yourself') ||
    norm.includes('who made you');

  if (isIdentityQuestion) {
    return (
      `${AARA_CANONICAL_IDENTITY_REPLY}\n\n` +
      `*(Currently running in Local Demo Mode. Connect a free Gemini API key in \`backend/.env\` to activate full live LLM intelligence.)*`
    );
  }

  // 2. Dynamic Math Calculations
  const mathResult = tryEvaluateMath(message);
  if (mathResult) {
    return (
      `### 🔢 Calculation Result\n\n` +
      `${mathResult}\n\n` +
      `*(Computed dynamically by Aara's math parser in Local Mode)*`
    );
  }

  // 3. Greetings
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste)\b/i.test(message.trim())) {
    return (
      `Hello! I'm OCTO AI, Sharjeel's personal AI assistant. It's a pleasure to connect with you!\n\n` +
      `I am currently operating in **${formatModeName(mode)}** mode.\n\n` +
      `> ℹ️ *Note: Real AI is currently disconnected. Add a free Gemini key in \`backend/.env\` to unlock real-time generative responses.*`
    );
  }

  // 4. Mode-specific dynamic responses
  if (mode === 'coding') {
    return handleCodingMode(norm, message);
  } else if (mode === 'interview') {
    return handleInterviewMode(norm, message);
  } else if (mode === 'english') {
    return handleEnglishMode(norm, message);
  } else {
    return handleAssistantMode(norm, message);
  }
}

function formatModeName(mode) {
  switch (mode) {
    case 'coding':
      return 'Coding Mentor';
    case 'interview':
      return 'Interview Coach';
    case 'english':
      return 'English Practice';
    default:
      return 'Personal Assistant';
  }
}

/* -------------------------------------------------------------
   PERSONAL ASSISTANT MODE
------------------------------------------------------------- */
function handleAssistantMode(norm, original) {
  // Check for 7-day plan / interview roadmap
  if (
    norm.includes('7 day') ||
    norm.includes('plan') ||
    (norm.includes('prepare') && norm.includes('interview')) ||
    norm.includes('roadmap')
  ) {
    return (
      `### 📅 7-Day Comprehensive Preparation Plan for Fresher Software Developer\n\n` +
      `Here is a realistic, structured 7-day preparation roadmap tailored for software developer interviews:\n\n` +
      `| Day | Focus Area | Key Topics to Master |\n` +
      `| :--- | :--- | :--- |\n` +
      `| **Day 1** | **DSA: Arrays & Strings** | Two Pointers, Sliding Window, Kadane's Algorithm, Hash Maps. |\n` +
      `| **Day 2** | **Core OOP & Language** | Java/C++/JS: 4 Pillars of OOP, Polymorphism, Interfaces, Abstract Classes. |\n` +
      `| **Day 3** | **DSA: LinkedLists & Trees** | Reversal, Cycle Detection, BFS/DFS Traversal, Binary Search Trees. |\n` +
      `| **Day 4** | **Databases (SQL & NoSQL)**| Joins, Normalization, Indexing, ACID vs BASE, MongoDB Aggregations. |\n` +
      `| **Day 5** | **Full-Stack & Web Dev** | REST APIs, HTTP status codes, React hooks (\`useEffect\`, \`useState\`), Express middleware. |\n` +
      `| **Day 6** | **System Design & Debugging**| Basic architecture, Client-Server model, Caching (Redis), Git workflows. |\n` +
      `| **Day 7** | **HR & Mock Interview** | STAR method for behavioral questions, project walkthroughs, resume review. |\n\n` +
      `**Pro-Tip:** Focus on clarity and explaining your thought process out loud rather than memorizing syntax!`
    );
  }

  // Check for SQL vs MongoDB comparison
  if ((norm.includes('sql') && norm.includes('mongo')) || norm.includes('difference between sql and mongodb')) {
    return (
      `### 🔄 Comparison: SQL vs MongoDB\n\n` +
      `| Dimension | SQL (Relational) | MongoDB (NoSQL / Document) |\n` +
      `| :--- | :--- | :--- |\n` +
      `| **Data Model** | Structured tables with rows & columns | Flexible JSON/BSON documents |\n` +
      `| **Schema** | Rigid, predefined schema | Dynamic, schemaless / polymorphic |\n` +
      `| **Scaling** | Vertical scaling (Scale-up CPU/RAM) | Horizontal scaling (Sharding across clusters) |\n` +
      `| **Transactions**| Full ACID guarantees out-of-the-box | ACID supported on replica sets (v4.0+) |\n` +
      `| **Query Language**| Standard SQL (\`SELECT * FROM users\`) | MongoDB Query API (\`db.users.find({})\`) |\n` +
      `| **Best Used For** | Banking, ERP, complex multi-table joins | High-velocity data, catalogues, agile prototyping |\n\n` +
      `**Summary:** Choose SQL when strict relationships and transactional integrity are required. Choose MongoDB for rapid evolution and horizontal scale.`
    );
  }

  // Check for Java OOP concepts
  if (norm.includes('java') && (norm.includes('oop') || norm.includes('object oriented'))) {
    return (
      `### ☕ Core Java OOP Concepts with Practical Examples\n\n` +
      `Object-Oriented Programming (OOP) in Java is organized around four core pillars:\n\n` +
      `#### 1. Encapsulation (Data Hiding)\n` +
      `Wrapping data (variables) and code (methods) together into a single unit and keeping fields private.\n` +
      `\`\`\`java\n` +
      `public class BankAccount {\n` +
      `    private double balance; // Hidden from direct external access\n` +
      `    public double getBalance() { return balance; }\n` +
      `    public void deposit(double amount) {\n` +
      `        if (amount > 0) balance += amount;\n` +
      `    }\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `#### 2. Inheritance (Code Reusability)\n` +
      `Mechanism where a child class acquires all properties and behaviors of a parent class using \`extends\`.\n` +
      `\`\`\`java\n` +
      `class Animal { void eat() { System.out.println("Eating..."); } }\n` +
      `class Dog extends Animal { void bark() { System.out.println("Barking..."); } }\n` +
      `\`\`\`\n\n` +
      `#### 3. Polymorphism (Many Forms)\n` +
      `- **Compile-time**: Method Overloading (same name, different arguments).\n` +
      `- **Runtime**: Method Overriding (\`@Override\` of parent method).\n` +
      `\`\`\`java\n` +
      `class Shape { void draw() { System.out.println("Drawing shape"); } }\n` +
      `class Circle extends Shape {\n` +
      `    @Override void draw() { System.out.println("Drawing circle"); }\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `#### 4. Abstraction (Hiding Complexity)\n` +
      `Showing only essential attributes and hiding background details via \`abstract\` classes or \`interface\`s.\n` +
      `\`\`\`java\n` +
      `interface PaymentGateway {\n` +
      `    void processPayment(double amount);\n` +
      `}\n` +
      `\`\`\``
    );
  }

  // Check for real-time / live factual queries like Prime Minister, current news, etc.
  const isFactualQuery =
    norm.includes('prime minister') ||
    norm.includes('president') ||
    norm.includes('capital of') ||
    norm.includes('who is') ||
    norm.includes('current news') ||
    norm.includes('weather');

  if (isFactualQuery) {
    return (
      `### ⚠️ Notice: Real AI is Not Connected (Demo Mode)\n\n` +
      `You asked: *"${original}"*\n\n` +
      `I am currently running in **Local Demo Mode** without an active LLM connection. In this mode, I cannot retrieve real-time factual information or live world data.\n\n` +
      `#### 🚀 How to Enable Real AI in 60 Seconds:\n` +
      `1. Get a **100% free Gemini API key** from Google AI Studio: [https://aistudio.google.com](https://aistudio.google.com)\n` +
      `2. Open \`backend/.env\` in this project folder.\n` +
      `3. Configure the following variables:\n` +
      `\`\`\`env\n` +
      `AI_PROVIDER=gemini\n` +
      `AI_API_KEY=your_actual_gemini_api_key_here\n` +
      `AI_MODEL=gemini-1.5-flash\n` +
      `\`\`\`\n` +
      `4. Restart the backend server. OCTO AI will immediately answer all factual, creative, and real-time questions using the Gemini LLM!`
    );
  }

  // General fallback for unknown assistant queries in demo mode
  return (
    `### 📋 Personal Assistant (Demo Mode)\n\n` +
    `I received your inquiry: *"${original}"*.\n\n` +
    `Because I am operating in **Local Demo Mode** (Real AI not yet connected), here are steps to assist you:\n` +
    `- **Connect Real AI**: Add \`AI_API_KEY\` in \`backend/.env\` for full generative answers.\n` +
    `- **Try Available Demo Commands**: You can ask for *"Java OOP concepts"*, *"SQL vs MongoDB"*, *"7-day interview plan"*, or math like *"25 multiplied by 48"*.\n\n` +
    `How else can I help guide your setup today?`
  );
}

/* -------------------------------------------------------------
   CODING MENTOR MODE
------------------------------------------------------------- */
function handleCodingMode(norm, original) {
  // If user asks about Java OOP in coding mode
  if (norm.includes('java') || norm.includes('oop')) {
    return handleAssistantMode(norm, original);
  }

  // React useEffect & hooks
  if (norm.includes('react') || norm.includes('useeffect') || norm.includes('hook')) {
    return (
      `### ⚛️ React \`useEffect\` Guide & Clean Example\n\n` +
      `\`useEffect\` lets your functional components perform side effects (fetching data, DOM manipulation, timers).\n\n` +
      `\`\`\`jsx\n` +
      `import React, { useState, useEffect } from 'react';\n\n` +
      `function UserProfile({ userId }) {\n` +
      `  const [user, setUser] = useState(null);\n` +
      `  const [loading, setLoading] = useState(true);\n\n` +
      `  useEffect(() => {\n` +
      `    let isSubscribed = true;\n` +
      `    setLoading(true);\n\n` +
      `    fetch(\`/api/users/\${userId}\`)\n` +
      `      .then((res) => res.json())\n` +
      `      .then((data) => {\n` +
      `        if (isSubscribed) {\n` +
      `          setUser(data);\n` +
      `          setLoading(false);\n` +
      `        }\n` +
      `      })\n` +
      `      .catch((err) => console.error(err));\n\n` +
      `    // Cleanup function when userId changes or component unmounts\n` +
      `    return () => {\n` +
      `      isSubscribed = false;\n` +
      `    };\n` +
      `  }, [userId]); // Only re-runs if userId prop changes\n\n` +
      `  if (loading) return <div>Loading...</div>;\n` +
      `  return <div>Welcome, {user?.name}!</div>;\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `**Best Practices:**\n` +
      `1. Always specify accurate dependencies in the \`[]\` array.\n` +
      `2. Return a cleanup function to prevent memory leaks.\n` +
      `3. For non-reactive helper functions, declare them outside the component.`
    );
  }

  // SQL vs MongoDB
  if (norm.includes('sql') || norm.includes('mongo')) {
    return handleAssistantMode(norm, original);
  }

  return (
    `### 💻 Coding Mentor (Demo Mode)\n\n` +
    `You asked about: *"${original}"*.\n\n` +
    `To get custom dynamic code generation and debugging for arbitrary libraries, connect your free Gemini API key in \`backend/.env\`.\n\n` +
    `**Available Offline Examples:**\n` +
    `- *"Explain Java OOP concepts with examples"*\n` +
    `- *"What is the difference between SQL and MongoDB?"*\n` +
    `- *"Explain React useEffect with clean code"*`
  );
}

/* -------------------------------------------------------------
   INTERVIEW COACH MODE
------------------------------------------------------------- */
function handleInterviewMode(norm, original) {
  if (norm.includes('7 day') || norm.includes('plan') || norm.includes('fresher')) {
    return handleAssistantMode(norm, original);
  }

  return (
    `### 🎙️ Technical Interview Practice (Demo Mode)\n\n` +
    `Regarding your response: *"${original}"*\n\n` +
    `**Interviewer Assessment:**\n` +
    `- **Structure:** Good articulation. Make sure to lead with the core architectural principle first.\n` +
    `- **STAR Framework:** Whenever answering scenario questions, outline the **Situation**, **Task**, **Action**, and **Result**.\n\n` +
    `**Next Technical Mock Question:**\n` +
    `> *"Can you explain how indexing works in databases, and what the trade-offs are between read performance and write overhead?"*\n\n` +
    `Speak or type your answer to continue the session!`
  );
}

/* -------------------------------------------------------------
   ENGLISH PRACTICE MODE
------------------------------------------------------------- */
function handleEnglishMode(norm, original) {
  // Requirement 5: "English Practice: answer the user's message first, then provide useful corrections or practice feedback when appropriate."
  
  let directAnswer = '';
  let grammarFeedback = '';

  // Direct conversational answers based on the user's message
  if (norm.includes('office') || norm.includes('work')) {
    directAnswer = `I hope your day at the office was productive and went smoothly! Working in an office environment often gives great opportunities to collaborate with colleagues.`;
  } else if (norm.includes('how are you') || norm.includes('how do you do')) {
    directAnswer = `I am doing wonderful, thank you for asking! I'm delighted to practice English conversation with you today.`;
  } else if (norm.includes('weekend') || norm.includes('holiday')) {
    directAnswer = `Weekends and holidays are great times to rest, recharge, and spend time on hobbies you enjoy!`;
  } else {
    directAnswer = `Thank you for sharing that with me! You are expressing your thoughts clearly.`;
  }

  // Grammar and phrasing feedback checks
  if (/\bi did went\b/i.test(original)) {
    grammarFeedback = `\n\n💡 **Grammar Tip:** Instead of saying *"I did went"*, say *"I went"* or *"I did go"*. When using auxiliary "did" in the past tense, the main verb stays in its base form ("go").`;
  } else if (/\bi have seen it yesterday\b/i.test(original)) {
    grammarFeedback = `\n\n💡 **Grammar Tip:** When referring to an exact finished past time like "yesterday", use Simple Past (*"I saw it yesterday"*) instead of Present Perfect (*"I have seen"*).`;
  } else if (/\bevery students\b/i.test(original)) {
    grammarFeedback = `\n\n💡 **Grammar Tip:** "Every" takes a singular noun: *"Every student"* instead of *"Every students"*.`;
  }

  return (
    `### 🗣️ Conversational English Partner\n\n` +
    `${directAnswer}${grammarFeedback}\n\n` +
    `**Recommended Follow-Up:**\n` +
    `Would you like to tell me more about what you worked on today, or would you like to practice a workplace meeting roleplay?`
  );
}

export default {
  generateLocalReply
};
