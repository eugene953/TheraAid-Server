
// start the local tunnel
npx localtunnel --port 3002


CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Reminders (
    reminderID SERIAL PRIMARY KEY,
    userID INT NOT NULL,
    activityType VARCHAR(100) NOT NULL,
    reminderDay INT NOT NULL CHECK (reminderDay BETWEEN 0 AND 6), -- Sunday=0 ... Saturday=6
    reminderTime TIME NOT NULL, -- time of day
    FOREIGN KEY (userID) REFERENCES Users(id) ON DELETE CASCADE
);
CREATE INDEX idx_userID ON Reminders(userID);
CREATE INDEX idx_reminderDay_time ON Reminders(reminderDay, reminderTime);


Database Password: Mental Health Chatbot

### **NLP Model (Rasa/OpenAI GPT) – Understanding & Responding**  

#### **1. What is an NLP Model?**
An **NLP (Natural Language Processing) model** helps a chatbot **understand and generate human-like responses**. It takes a user's input (text or voice), processes it, and returns an appropriate response.  

For a **mental health chatbot in local dialects**, an NLP model will:  
✅ **Understand user messages** (e.g., "I feel anxious today.")  
✅ **Detect emotions or intent** (e.g., "User is feeling anxious.")  
✅ **Generate a helpful response** (e.g., "I'm here for you. Would you like some breathing exercises?")  
✅ **Translate/localize responses** (if using multiple languages or dialects).  

---

### **2. Which NLP Model Should You Use?**
You have **two main options**:  
#### **Option 1: Rasa (Python-based, Open Source NLP Model)**  
- Best for **custom-built AI** with local dialects.  
- Allows **training on specific local phrases**.  
- Runs **locally** (no need for external API calls).  

#### **Option 2: OpenAI GPT (Pretrained NLP, API-based)**  
- Best for **fast implementation**.  
- Uses a powerful **pre-trained AI model**.  
- **Supports multiple languages** (but may not handle all local dialects well).  
- **Requires API calls** (cost per request).  

---

### **3. How to Use an NLP Model in Your Chatbot**
Since Rasa is built with **Python**, and your chatbot is using **React (TypeScript) + Node.js (TypeScript)**, you need to **connect the Python-based NLP model to your Node.js backend**.

---

## **Option 1: Using Rasa (Python-Based NLP)**
### **Step 1: Install Rasa on Your Machine**
```bash
pip install rasa
```

### **Step 2: Create a New Rasa Project**
```bash
rasa init
```

This creates a folder structure where you can define training data, intents, and responses.

### **Step 3: Train Rasa Model for Local Dialects**
Modify `nlu.yml` to include local dialect phrases:

```yaml
nlu:
- intent: greet
  examples: |
    - Hello
    - Hi
    - Wusop (Pidgin)
    - Bonsoir (French)
    - How far? (Pidgin)
```

Modify `stories.yml` to define chatbot conversations:

```yaml
stories:
- story: User feels sad
  steps:
    - intent: feeling_sad
    - action: utter_cheer_up
```

### **Step 4: Run Rasa Server**
```bash
rasa train
rasa run --enable-api
```
This starts a local API on `http://localhost:5005/`.

### **Step 5: Connect Rasa with Node.js Backend**
Your **Node.js backend (TypeScript)** will send user messages to the Rasa API.

#### **Example: Node.js (Express + TypeScript)**
```ts
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // Send message to Rasa API
  const rasaResponse = await axios.post("http://localhost:5005/webhooks/rest/webhook", {
    message: userMessage,
  });

  res.json({ reply: rasaResponse.data[0]?.text || "I'm here to help!" });
});

app.listen(5000, () => console.log("Chatbot backend running on port 5000"));
```
Now, your React frontend can **send user messages to Node.js**, which then calls **Rasa NLP** for response generation.

---

## **Option 2: Using OpenAI GPT (API-Based NLP)**
If you **don't want to train your own NLP model**, you can use **OpenAI GPT (ChatGPT API)**.

### **Step 1: Get OpenAI API Key**
Sign up at [OpenAI](https://openai.com/) and get an API key.

### **Step 2: Install Axios in Node.js Backend**
```bash
npm install axios
```

### **Step 3: Connect OpenAI GPT API to Node.js**
```ts
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const gptResponse = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [{ role: "user", content: userMessage }],
    },
    {
      headers: { Authorization: `Bearer YOUR_OPENAI_API_KEY` },
    }
  );

  res.json({ reply: gptResponse.data.choices[0].message.content });
});

app.listen(5000, () => console.log("Chatbot backend running on port 5000"));
```

### **Step 4: React Frontend Sends Messages**
Your **React frontend** will send user input to your **Node.js backend**, which then queries **OpenAI GPT for responses**.

---

## **Comparison of Rasa vs. OpenAI GPT**
| Feature         | **Rasa (Python-based)** | **OpenAI GPT (API-based)** |
|---------------|----------------|----------------|
| **Custom Training** | ✅ Yes (train with local dialects) | ❌ No (uses pre-trained model) |
| **Runs Locally** | ✅ Yes | ❌ No (requires OpenAI API) |
| **Cost** | ✅ Free (after setup) | 💲 Paid (per API call) |
| **Integration** | Needs Python API setup | Simple API call |
| **Best For** | Custom AI chatbot with **local dialects** | Fast setup with **global NLP** |

---

## **Conclusion: Which One to Use?**
- **Use Rasa** if you want **a fully customized NLP model** that supports **local dialects**.  
- **Use OpenAI GPT** if you want **a fast, pre-trained chatbot** without needing to train NLP yourself.  

If your chatbot needs **mental health support in a local dialect**, **Rasa is the best choice** because you can train it with local expressions. **Would you like help setting up Rasa for a specific dialect?** 🚀