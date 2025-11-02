import User from "../model/user.model.js";
import Message from "../model/message.model.js";

export async function getAllContacts(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMessagesByUserId(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const otherUserId = req.params.id;

    const messages = await Message.find({
      $or: [
        {
          senderId: loggedInUserId,
          receiverId: otherUserId,
        },
        { senderId: otherUserId, receiverId: loggedInUserId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { text } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getChatPartners(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const messages = await Message.find({
      $or: [
        {
          senderId: loggedInUserId,
        },
        { receiverId: loggedInUserId },
      ],
    });
    const chatPartnersId = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];
    const chatPartners = await User.find({
      _id: { $in: chatPartnersId },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
