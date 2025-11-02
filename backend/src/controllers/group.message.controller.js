import GroupMessage from "../model/group.message.model.js";

export async function getMessagesByGroupId(req, res) {
  try {
    const groupId = req.params.id;
    if (!groupId) {
      return res.status(400).json({ message: "No group id provided" });
    }

    const messages = await GroupMessage.find({ groupId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendGroupMessage(req, res) {
  try {
    const { text } = req.body;
    const groupId = req.params.id;
    if (!groupId || !text) {
      return res.status(400).json({ message: "Group ID and text required" });
    }

    const loggedInUserId = req.user._id;

    const newMessage = new GroupMessage({
      sender: loggedInUserId,
      groupId,
      text,
    });

    await newMessage.save();

    await newMessage.populate("sender", "username");

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
