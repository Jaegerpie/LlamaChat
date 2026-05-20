import express from "express";
import dotenv from "dotenv";
import ImageKit from "imagekit";
import cors from "cors";
import mongoose from "mongoose";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import { clerkMiddleware, getAuth } from "@clerk/express";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(clerkMiddleware());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

/*const connect = async ()=>{
  try{
    await mongoose.connect(process.env.MONGO)
    console.log("connected to mongoDB")                        //PREVIOUS
  }
  catch(err){
    console.log(err)
  }
}
  */
let isConnected = false; //NEW

async function connect() {
  //NEW
  try {
    await mongoose.connect(process.env.MONGO);
    isConnected = true;
    console.log("connected to mongoDB");
  } catch (err) {
    console.log(err);
  }
}

//add middleware

app.use((req, res, next) => {
  //NEW
  if (!isConnected) {
    connect();
  }
  next();
});

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

app.post("/api/chats", async (req, res) => {
  const { userId } = getAuth(req);
  const { text } = req.body;

  try {
    //CREATE A NEW CHAT
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });
    const savedChat = await newChat.save();

    //CHECK IF THE USERCHAT EXISTS
    const userChats = await UserChats.find({ userId: userId });

    //IF DOESNT EXIST CREATE A NEW ONE AND ADD THE CHATS IN THE CHATS ARRAY
    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });
      await newUserChats.save();
    } else {
      await UserChats.updateOne(
        { userId: userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        }
      );
    }

    res.status(201).send(savedChat._id);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating chat!");
  }
});

app.get("/api/userchats", async (req, res) => {
  const { userId } = getAuth(req);

  try {
    const userChats = await UserChats.find({ userId: userId });

    // If the user has no chats yet, avoid crashing on userChats[0]
    if (!userChats.length) {
      return res.status(200).send([]);
    }

    res.status(200).send(userChats[0].chats);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching userchats!");
  }
});

app.get("/api/chats/:id", async (req, res) => {
  const { userId } = getAuth(req);

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    res.status(200).send(chat);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching chat!");
  }
});

app.put("/api/chats/:id", async (req, res) => {
  const { userId } = getAuth(req);

  const { question, ans, img } = req.body;
  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...Chat(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: ans }] },
  ];
  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );
    res.status(200).send(updatedChat);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error adding conversation");
  }
});

//PREVIOUS

/*
app.listen(port,()=>{                                           
    console.log(`Server running at port ${port}`)
})
    */

export default app;

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });
}
